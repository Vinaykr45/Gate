/**
 * lib/gemini/suggestions.ts
 *
 * Performance suggestions adapter powered by PrepAxis AI Router.
 */

import { aiRouter } from '@/lib/ai/router'
import { buildPerformanceInsightPrompt } from '@/lib/ai/prompts/performance-insights'
import { extractJsonFromText } from '@/lib/ai/validation'
import type { AnalyticsData, AISuggestion } from '@/lib/types'

export async function generateAISuggestions(analytics: AnalyticsData, examTrack = 'gate_cse'): Promise<AISuggestion[]> {
  const { systemPrompt, userPrompt } = buildPerformanceInsightPrompt({
    examTrack,
    totalAttempts: analytics.totalAttempts,
    avgAccuracy: analytics.avgAccuracy,
    avgScore: analytics.avgScore,
    weakTopics: analytics.weakTopics.map(w => ({
      topic: w.topic,
      subject: w.subject || 'Core',
      accuracy: w.accuracy,
      attempts: w.total,
    })),
    strongTopics: analytics.strongTopics.map(s => ({
      topic: s.topic,
      subject: s.subject || 'Core',
      accuracy: s.accuracy,
      attempts: s.total,
    })),
  })

  try {
    const { data } = await aiRouter.generateJSON<{ priority_recommendations: AISuggestion[] }>(
      {
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
      },
      (parsed: unknown): { priority_recommendations: AISuggestion[] } => {
        const obj = (parsed && typeof parsed === 'object' ? parsed : {}) as { priority_recommendations?: AISuggestion[] }
        if (Array.isArray(obj.priority_recommendations) && obj.priority_recommendations.length > 0) {
          return { priority_recommendations: obj.priority_recommendations }
        }
        if (Array.isArray(parsed)) {
          return { priority_recommendations: parsed as AISuggestion[] }
        }
        throw new Error('Invalid suggestions structure from AI')
      }
    )

    return data.priority_recommendations.slice(0, 6)
  } catch (error) {
    console.error('[AI Suggestions Error]:', error)
    return generateFallbackSuggestions(analytics)
  }
}

function generateFallbackSuggestions(analytics: AnalyticsData): AISuggestion[] {
  if (analytics.weakTopics.length > 0) {
    return analytics.weakTopics.slice(0, 6).map((wt) => ({
      priority: wt.accuracy < 40 ? 'high' : 'medium',
      subject: wt.subject || 'Core Subject',
      topic: wt.topic,
      message: `Your current accuracy in ${wt.topic} is ${wt.accuracy}%. Focused review will significantly boost your score.`,
      action: `Practice 15-20 questions on ${wt.topic} and review fundamental definitions.`,
      accuracy: wt.accuracy,
    }))
  }

  return [
    {
      priority: 'medium',
      subject: 'Overall Strategy',
      topic: 'Mock Testing',
      message: 'Take comprehensive mock tests to establish a baseline accuracy across all subjects.',
      action: 'Schedule one subject-wise test this week.',
      accuracy: 50,
    },
  ]
}
