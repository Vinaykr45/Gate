import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { calculateNextReview, type ReviewGrade } from '@/lib/revision/spaced-repetition'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const examTrack = searchParams.get('track')

    let query = supabase
      .from('revision_items')
      .select('*, question:questions(*)')
      .eq('user_id', user.id)
      .order('next_due_date', { ascending: true })

    if (examTrack && examTrack !== 'all') {
      query = query.eq('exam_track', examTrack)
    }

    const { data: items, error } = await query

    if (error) {
      // If table doesn't exist yet, return sample items
      return NextResponse.json({ items: [] })
    }

    return NextResponse.json({ items: items || [] })
  } catch (error) {
    console.error('Revision API error:', error)
    return NextResponse.json({ error: 'Failed to fetch revision items' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, grade } = await request.json() as { id: string; grade: ReviewGrade }

    // Fetch existing item
    const { data: item, error: fetchErr } = await supabase
      .from('revision_items')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (fetchErr || !item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    const nextState = calculateNextReview(
      grade,
      item.repetitions || 0,
      item.interval_days || 1,
      item.ease_factor ? parseFloat(item.ease_factor) : 2.50
    )

    const { data: updated, error: updateErr } = await supabase
      .from('revision_items')
      .update({
        repetitions: nextState.repetitions,
        interval_days: nextState.intervalDays,
        ease_factor: nextState.easeFactor,
        next_due_date: nextState.nextDueDate,
        last_reviewed: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (updateErr) {
      return NextResponse.json({ error: 'Failed to update review' }, { status: 500 })
    }

    return NextResponse.json({ success: true, item: updated })
  } catch (error) {
    console.error('Update revision error:', error)
    return NextResponse.json({ error: 'Failed to update review' }, { status: 500 })
  }
}
