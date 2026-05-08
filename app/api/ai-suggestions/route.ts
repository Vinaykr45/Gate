import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateAISuggestions } from '@/lib/gemini/suggestions'
import type { AnalyticsData } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch analytics data (reuse analytics route logic)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    // Get fresh analytics
    const { data: attempts } = await supabase
      .from('attempts')
      .select('*, test:tests(*)')
      .eq('user_id', user.id)
      .eq('completed', true)
      .order('completed_at', { ascending: false })

    if (!attempts || attempts.length === 0) {
      return NextResponse.json({
        suggestions: [{
          priority: 'high',
          subject: 'General',
          topic: 'Getting Started',
          message: 'You haven\'t taken any tests yet! Start with a topic-wise test to get personalized suggestions.',
          action: 'Take your first topic-wise test from the Test section.',
          accuracy: 0,
        }]
      })
    }

    const attemptIds = attempts.map((a) => a.id)
    const { data: answers } = await supabase
      .from('answers')
      .select('*, question:questions(subject, topic, difficulty)')
      .in('attempt_id', attemptIds)

    const allAnswers = answers || []
    const subjectMap = new Map<string, { total: number; correct: number }>()
    const topicMap = new Map<string, { subject: string; total: number; correct: number }>()

    for (const answer of allAnswers) {
      const q = answer.question as { subject: string; topic: string; difficulty: string } | null
      if (!q) continue
      const subStat = subjectMap.get(q.subject) || { total: 0, correct: 0 }
      subStat.total++
      if (answer.is_correct) subStat.correct++
      subjectMap.set(q.subject, subStat)

      const topStat = topicMap.get(q.topic) || { subject: q.subject, total: 0, correct: 0 }
      topStat.total++
      if (answer.is_correct) topStat.correct++
      topicMap.set(q.topic, topStat)
    }

    const subjectStats = Array.from(subjectMap.entries()).map(([subject, stat]) => ({
      subject, total: stat.total, correct: stat.correct,
      accuracy: stat.total > 0 ? parseFloat(((stat.correct / stat.total) * 100).toFixed(1)) : 0,
    }))

    const topicStats = Array.from(topicMap.entries()).map(([topic, stat]) => ({
      topic, subject: stat.subject, total: stat.total, correct: stat.correct,
      accuracy: stat.total > 0 ? parseFloat(((stat.correct / stat.total) * 100).toFixed(1)) : 0,
    })).sort((a, b) => a.accuracy - b.accuracy)

    const avgAccuracy = attempts.reduce((s, a) => s + (a.accuracy || 0), 0) / attempts.length
    const avgScore = attempts.reduce((s, a) => s + (a.score || 0), 0) / attempts.length

    const analyticsData: AnalyticsData = {
      totalAttempts: attempts.length,
      avgScore: parseFloat(avgScore.toFixed(2)),
      avgAccuracy: parseFloat(avgAccuracy.toFixed(1)),
      totalQuestions: allAnswers.length,
      subjectStats,
      topicStats,
      dailyTrend: [],
      weakTopics: topicStats.filter((t) => t.total >= 2).slice(0, 10),
      strongTopics: [...topicStats].sort((a, b) => b.accuracy - a.accuracy).filter((t) => t.total >= 2).slice(0, 5),
    }

    const suggestions = await generateAISuggestions(analyticsData)

    return NextResponse.json({ suggestions })
  } catch (error) {
    console.error('AI suggestions route error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
