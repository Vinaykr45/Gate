import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(request.url)
  const topicId = searchParams.get('topic_id')
  if (!topicId) return NextResponse.json({ error: 'topic_id required' }, { status: 400 })
  const { data: videos, error } = await supabase
    .from('videos').select('*').eq('topic_id', topicId).order('order_num')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ videos: videos ?? [] })
}

// POST: Add a new video to a topic
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { topic_id, title, youtube_url, duration_seconds } = await request.json()
  if (!topic_id || !title || !youtube_url) {
    return NextResponse.json({ error: 'topic_id, title, and youtube_url are required' }, { status: 400 })
  }
  // Get current max order_num
  const { data: existing } = await supabase
    .from('videos').select('order_num').eq('topic_id', topic_id).order('order_num', { ascending: false }).limit(1)
  const nextOrder = (existing?.[0]?.order_num ?? 0) + 1
  const { data, error } = await supabase
    .from('videos')
    .insert({ topic_id, title, youtube_url, duration_seconds: duration_seconds ?? 0, order_num: nextOrder })
    .select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ video: data })
}

// DELETE: Remove a video
export async function DELETE(request: Request) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
  await supabase.from('videos').delete().eq('id', id)
  return NextResponse.json({ success: true })
}
