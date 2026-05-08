import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { AnalyticsData, SubjectStat, TopicStat, DailyTrend } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch all user attempts with test info
    const { data: attempts, error: attemptsError } = await supabase
      .from('attempts')
      .select(`*, test:tests(*)`)
      .eq('user_id', user.id)
      .eq('completed', true)
      .order('completed_at', { ascending: false })

    if (attemptsError) {
      return NextResponse.json({ error: 'Failed to fetch attempts' }, { status: 500 })
    }

    if (!attempts || attempts.length === 0) {
      return NextResponse.json({
        totalAttempts: 0,
        avgScore: 0,
        avgAccuracy: 0,
        totalQuestions: 0,
        subjectStats: [],
        topicStats: [],
        dailyTrend: [],
        weakTopics: [],
        strongTopics: [],
      } as AnalyticsData)
    }

    // Fetch all answers with question data
    const attemptIds = attempts.map((a) => a.id)
    const { data: answers, error: answersError } = await supabase
      .from('answers')
      .select(`*, question:questions(subject, topic, difficulty)`)
      .in('attempt_id', attemptIds)

    if (answersError) {
      console.error('Answers fetch error:', answersError)
    }

    const allAnswers = answers || []

    // Calculate subject stats
    const subjectMap = new Map<string, { total: number; correct: number }>()
    const topicMap = new Map<string, { subject: string; total: number; correct: number }>()

    for (const answer of allAnswers) {
      const q = answer.question as { subject: string; topic: string; difficulty: string } | null
      if (!q) continue

      // Subject stats
      const subjectKey = q.subject
      const subjectStat = subjectMap.get(subjectKey) || { total: 0, correct: 0 }
      subjectStat.total++
      if (answer.is_correct) subjectStat.correct++
      subjectMap.set(subjectKey, subjectStat)

      // Topic stats
      const topicKey = q.topic
      const topicStat = topicMap.get(topicKey) || { subject: q.subject, total: 0, correct: 0 }
      topicStat.total++
      if (answer.is_correct) topicStat.correct++
      topicMap.set(topicKey, topicStat)
    }

    const subjectStats: SubjectStat[] = Array.from(subjectMap.entries()).map(([subject, stat]) => ({
      subject,
      total: stat.total,
      correct: stat.correct,
      accuracy: stat.total > 0 ? parseFloat(((stat.correct / stat.total) * 100).toFixed(1)) : 0,
    })).sort((a, b) => b.total - a.total)

    const topicStats: TopicStat[] = Array.from(topicMap.entries()).map(([topic, stat]) => ({
      topic,
      subject: stat.subject,
      total: stat.total,
      correct: stat.correct,
      accuracy: stat.total > 0 ? parseFloat(((stat.correct / stat.total) * 100).toFixed(1)) : 0,
    })).sort((a, b) => a.accuracy - b.accuracy)

    // Daily trend (last 30 days)
    const dailyMap = new Map<string, { score: number; tests: number }>()
    for (const attempt of attempts) {
      const date = new Date(attempt.completed_at || attempt.started_at)
        .toISOString().split('T')[0]
      const existing = dailyMap.get(date) || { score: 0, tests: 0 }
      existing.tests++
      existing.score = (existing.score * (existing.tests - 1) + (attempt.accuracy || 0)) / existing.tests
      dailyMap.set(date, existing)
    }

    const dailyTrend: DailyTrend[] = Array.from(dailyMap.entries())
      .map(([date, stat]) => ({
        date,
        score: parseFloat(stat.score.toFixed(1)),
        tests: stat.tests,
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30)

    // Overall stats
    const totalQuestions = allAnswers.length
    const totalCorrect = allAnswers.filter((a) => a.is_correct).length
    const avgAccuracy = attempts.reduce((sum, a) => sum + (a.accuracy || 0), 0) / attempts.length
    const avgScore = attempts.reduce((sum, a) => sum + (a.score || 0), 0) / attempts.length

    const weakTopics = topicStats.filter((t) => t.total >= 3).slice(0, 10)
    const strongTopics = [...topicStats].sort((a, b) => b.accuracy - a.accuracy).filter((t) => t.total >= 3).slice(0, 5)

    const analyticsData: AnalyticsData = {
      totalAttempts: attempts.length,
      avgScore: parseFloat(avgScore.toFixed(2)),
      avgAccuracy: parseFloat(avgAccuracy.toFixed(1)),
      totalQuestions,
      subjectStats,
      topicStats,
      dailyTrend,
      weakTopics,
      strongTopics,
    }

    return NextResponse.json(analyticsData)
  } catch (error) {
    console.error('Analytics route error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
