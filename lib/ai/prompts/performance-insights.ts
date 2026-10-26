/**
 * lib/ai/prompts/performance-insights.ts
 *
 * Performance Insights and diagnostic study plan recommendations.
 */

export interface StudentAnalyticsContext {
  examTrack: string
  totalAttempts: number
  avgAccuracy: number
  avgScore: number
  weakTopics: Array<{ topic: string; subject: string; accuracy: number; attempts: number }>
  strongTopics: Array<{ topic: string; subject: string; accuracy: number; attempts: number }>
}

export function buildPerformanceInsightPrompt(ctx: StudentAnalyticsContext): { systemPrompt: string; userPrompt: string } {
  const systemPrompt = `You are an elite academic performance strategist analyzing student exam data for ${ctx.examTrack.toUpperCase()}.
Your goal: Analyze verified statistical activity and deliver high-impact diagnostic recommendations.

STRICT JSON OUTPUT FORMAT:
{
  "summary": "2-3 sentence executive diagnostic of preparation trajectory",
  "priority_recommendations": [
    {
      "priority": "high" | "medium" | "low",
      "subject": "Exact subject name",
      "topic": "Exact topic name from data",
      "message": "Specific diagnostic observation highlighting accuracy and mistake patterns",
      "action": "Concrete, actionable study task (e.g., solve 15 questions on X, review AS-2)",
      "accuracy": 0
    }
  ]
}

RULES:
1. Only recommend topics actually present in the data. Do NOT hallucinate topics.
2. Prioritize topics with accuracy < 50% or high exam weightage.
3. Return valid JSON only.`

  const userPrompt = `Student Performance Statistics:
Exam Track: ${ctx.examTrack}
Total Tests Taken: ${ctx.totalAttempts}
Average Accuracy: ${ctx.avgAccuracy}%
Average Score: ${ctx.avgScore}
Weak Topics: ${JSON.stringify(ctx.weakTopics.slice(0, 8))}
Strong Topics: ${JSON.stringify(ctx.strongTopics.slice(0, 5))}

Generate 5 prioritized recommendations in JSON format only:`

  return { systemPrompt, userPrompt }
}
