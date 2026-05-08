import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const topicId = searchParams.get('topic_id')
  if (!topicId) return NextResponse.json({ error: 'topic_id required' }, { status: 400 })

  const [{ data: notes }, { data: userNotes }, { data: bookmarks }] = await Promise.all([
    supabase.from('notes').select('*').eq('topic_id', topicId).order('order_num'),
    supabase.from('user_notes').select('*').eq('topic_id', topicId).eq('user_id', user.id).order('created_at', { ascending: false }),
    supabase.from('note_bookmarks').select('note_id').eq('user_id', user.id),
  ])

  const bookmarkedIds = new Set(bookmarks?.map(b => b.note_id) ?? [])
  return NextResponse.json({
    notes: (notes ?? []).map(n => ({ ...n, bookmarked: bookmarkedIds.has(n.id) })),
    userNotes: userNotes ?? [],
  })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { topic_id, content, action, note_id, title, link, type } = await request.json()

  // Toggle bookmark on curated note
  if (action === 'bookmark' && note_id) {
    const { data: existing } = await supabase.from('note_bookmarks').select('id').eq('user_id', user.id).eq('note_id', note_id).single()
    if (existing) {
      await supabase.from('note_bookmarks').delete().eq('id', existing.id)
      return NextResponse.json({ bookmarked: false })
    }
    await supabase.from('note_bookmarks').insert({ user_id: user.id, note_id })
    return NextResponse.json({ bookmarked: true })
  }

  // Add a curated note (admin action — any authenticated user for now)
  if (action === 'curated' && topic_id && title) {
    const { data: existing } = await supabase
      .from('notes').select('order_num').eq('topic_id', topic_id).order('order_num', { ascending: false }).limit(1)
    const nextOrder = (existing?.[0]?.order_num ?? 0) + 1
    const { data, error } = await supabase
      .from('notes')
      .insert({ topic_id, title, content: content ?? null, link: link ?? null, type: type ?? 'text', order_num: nextOrder })
      .select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ note: data })
  }

  // Add a personal user note
  if (content && topic_id) {
    const { data, error } = await supabase.from('user_notes').insert({ user_id: user.id, topic_id, content }).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ note: data })
  }

  return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
}

export async function DELETE(request: Request) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(request.url)
  const noteId = searchParams.get('id')
  if (!noteId) return NextResponse.json({ error: 'id required' }, { status: 400 })
  await supabase.from('user_notes').delete().eq('id', noteId).eq('user_id', user.id)
  return NextResponse.json({ success: true })
}
