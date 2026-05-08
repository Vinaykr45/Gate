import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(request: Request) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { topic_id, completed, watched_video_id, read_note_id } = body

  if (!topic_id) return NextResponse.json({ error: 'topic_id required' }, { status: 400 })

  // Upsert progress record
  const { data: existing } = await supabase
    .from('learning_progress')
    .select('*')
    .eq('user_id', user.id)
    .eq('topic_id', topic_id)
    .single()

  const updates: Record<string, unknown> = { user_id: user.id, topic_id }

  if (typeof completed === 'boolean') updates.completed = completed

  if (watched_video_id) {
    const current = existing?.watched_videos ?? []
    updates.watched_videos = current.includes(watched_video_id)
      ? current.filter((id: string) => id !== watched_video_id)
      : [...current, watched_video_id]
  }

  if (read_note_id) {
    const current = existing?.read_notes ?? []
    updates.read_notes = current.includes(read_note_id)
      ? current.filter((id: string) => id !== read_note_id)
      : [...current, read_note_id]
  }

  const { data, error } = await supabase
    .from('learning_progress')
    .upsert(updates, { onConflict: 'user_id,topic_id' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ progress: data })
}
