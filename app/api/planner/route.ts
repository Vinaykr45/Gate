import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateStudyPlan } from '@/lib/planner/study-planner'
import type { ExamTrackType } from '@/lib/curriculum/types'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const examTrack = (searchParams.get('track') || 'gate_cse') as ExamTrackType
    const targetDate = searchParams.get('targetDate') || '2026-02-01'
    const dailyHours = parseFloat(searchParams.get('dailyHours') || '3.0')

    const plan = generateStudyPlan(examTrack, targetDate, dailyHours)

    return NextResponse.json({ success: true, plan })
  } catch (error) {
    console.error('Study planner error:', error)
    return NextResponse.json({ error: 'Failed to generate study plan' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { examTrack, targetDate, dailyHours = 3.0 } = await request.json()
    const plan = generateStudyPlan(examTrack as ExamTrackType, targetDate, dailyHours)

    // Persist to study_plans table if available
    try {
      await supabase.from('study_plans').upsert(
        {
          user_id: user.id,
          exam_track: examTrack,
          target_date: targetDate,
          daily_hours: dailyHours,
          schedule_data: plan.schedule.slice(0, 90),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,exam_track' }
      )
    } catch {
      // Non-fatal if table not yet migrated
    }

    return NextResponse.json({ success: true, plan })
  } catch (error) {
    console.error('Save study plan error:', error)
    return NextResponse.json({ error: 'Failed to save study plan' }, { status: 500 })
  }
}
