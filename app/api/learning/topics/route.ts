import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const subject = searchParams.get('subject')
  const topicId = searchParams.get('topic_id')

  let query = supabase.from('learning_topics').select('*').order('order_num')
  if (subject) query = query.eq('subject', subject)
  if (topicId) query = query.eq('id', topicId)

  const { data: topics, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const topicIds = topics?.map(t => t.id) ?? []
  const { data: progress } = await supabase
    .from('learning_progress')
    .select('*')
    .eq('user_id', user.id)
    .in('topic_id', topicIds)

  const progressMap = new Map(progress?.map(p => [p.topic_id, p]) ?? [])
  const enriched = topics?.map(t => ({ ...t, progress: progressMap.get(t.id) ?? null })) ?? []

  return NextResponse.json({ topics: enriched })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { subject, topic, subtopic, description } = await request.json()
  if (!subject || !topic || !subtopic) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const { data: existing } = await supabase
    .from('learning_topics')
    .select('order_num')
    .eq('subject', subject)
    .order('order_num', { ascending: false })
    .limit(1)

  const nextOrder = (existing?.[0]?.order_num ?? 0) + 1

  const { data, error } = await supabase
    .from('learning_topics')
    .insert({ subject, topic, subtopic, description, order_num: nextOrder })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ topic: data })
}

export async function DELETE(request: Request) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  const subject = searchParams.get('subject') // delete entire subject

  if (subject) {
    // Delete all topics for this subject
    const { error } = await supabase.from('learning_topics').delete().eq('subject', subject)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ deleted: true })
  }

  if (!id) return NextResponse.json({ error: 'id or subject required' }, { status: 400 })

  const { error } = await supabase.from('learning_topics').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ deleted: true })
}
