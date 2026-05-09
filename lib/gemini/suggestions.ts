import { geminiSuggestModel } from './client'
import type { AnalyticsData, AISuggestion } from '@/lib/types'

const SUGGESTION_PROMPT = `You are an expert GATE exam coach analyzing a student's performance data.

Based on the analytics provided, generate exactly 6 prioritized improvement suggestions.

Rules:
1. Be specific — mention exact subject and topic names from the data
2. Be actionable — suggest concrete study actions
3. Prioritize topics with lowest accuracy first
4. Do NOT make up topics not in the data
5. Return ONLY valid JSON array

Output format:
[
  {
    "priority": "high",
    "subject": "Computer Science",
    "topic": "Operating System - Deadlock",
    "message": "Your accuracy in OS Deadlock is only 23%. This is a high-weightage topic in GATE CS.",
    "action": "Solve 20 questions on Banker's Algorithm and Resource Allocation Graphs",
    "accuracy": 23
  }
]

Priority levels:
- "high": accuracy < 40% or topic is high-weightage
- "medium": accuracy 40-65%
- "low": accuracy > 65% (maintenance)
`

export async function generateAISuggestions(analytics: AnalyticsData): Promise<AISuggestion[]> {
  const analyticsContext = JSON.stringify({
    avgAccuracy: analytics.avgAccuracy,
    totalAttempts: analytics.totalAttempts,
    weakTopics: analytics.weakTopics.slice(0, 10),
    strongTopics: analytics.strongTopics.slice(0, 5),
    subjectStats: analytics.subjectStats,
  }, null, 2)

  const prompt = `${SUGGESTION_PROMPT}

Student Performance Data:
${analyticsContext}

Generate 6 improvement suggestions based on this data. Return JSON array only.`

  try {
    const result = await geminiSuggestModel.generateContent(prompt)
    const responseText = result.response.text()
    return parseSuggestions(responseText, analytics)
  } catch (error) {
    console.error('Gemini suggestions error:', error)
    return generateFallbackSuggestions(analytics)
  }
}

function parseSuggestions(responseText: string, analytics: AnalyticsData): AISuggestion[] {
  try {
    let cleaned = responseText.trim()
    cleaned = cleaned.replace(/```json\n?/gi, '').replace(/```\n?/g, '')
    const startIdx = cleaned.indexOf('[')
    const endIdx = cleaned.lastIndexOf(']')
    if (startIdx === -1 || endIdx === -1) return generateFallbackSuggestions(analytics)

    const parsed = JSON.parse(cleaned.substring(startIdx, endIdx + 1))
    if (!Array.isArray(parsed)) return generateFallbackSuggestions(analytics)

    return parsed.slice(0, 6).map((s: Record<string, unknown>) => ({
      priority: (['high', 'medium', 'low'].includes(String(s.priority)) ? s.priority : 'medium') as AISuggestion['priority'],
      subject: String(s.subject || 'Computer Science'),
      topic: String(s.topic || 'General'),
      message: String(s.message || ''),
      action: String(s.action || ''),
      accuracy: Number(s.accuracy || 0),
    }))
  } catch {
    return generateFallbackSuggestions(analytics)
  }
}

function generateFallbackSuggestions(analytics: AnalyticsData): AISuggestion[] {
  const suggestions: AISuggestion[] = []
  const weakTopics = analytics.weakTopics.slice(0, 4)

  for (const topic of weakTopics) {
    suggestions.push({
      priority: topic.accuracy < 40 ? 'high' : 'medium',
      subject: topic.subject,
      topic: topic.topic,
      message: `Your accuracy in ${topic.topic} is ${topic.accuracy.toFixed(0)}%. Focus here to improve your score.`,
      action: `Practice 15-20 questions on ${topic.topic} and review the fundamentals.`,
      accuracy: topic.accuracy,
    })
  }

  if (analytics.avgAccuracy < 50) {
    suggestions.push({
      priority: 'high',
      subject: 'General',
      topic: 'Test Strategy',
      message: `Your overall accuracy is ${analytics.avgAccuracy.toFixed(0)}%. Consider attempting easier questions first.`,
      action: 'Take subject-wise tests before full mock tests to build confidence.',
      accuracy: analytics.avgAccuracy,
    })
  }

  if (suggestions.length < 6) {
    suggestions.push({
      priority: 'low',
      subject: 'General',
      topic: 'Consistency',
      message: 'Regular practice is key to GATE success.',
      action: 'Set a daily target of 20 questions across your weak topics.',
      accuracy: analytics.avgAccuracy,
    })
  }

  return suggestions.slice(0, 6)
}

