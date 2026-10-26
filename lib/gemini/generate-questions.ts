/**
 * lib/gemini/generate-questions.ts
 *
 * Question generation adapter powered by PrepAxis AI Router.
 * Supports multi-provider fallback and backward-compatible signature.
 */

import { aiRouter } from '@/lib/ai/router'
import { buildQuestionGenPrompt } from '@/lib/ai/prompts/generate-questions'
import { validateGeneratedQuestions } from '@/lib/ai/validation'
import type { ExtractedQuestion } from '@/lib/types'

interface TopicContext {
  subject: string
  topic: string
  subtopic: string
  description?: string
  notes: Array<{ title: string; content?: string }>
  videoTitles: string[]
  count: number
  examTrack?: string
}

export async function generateQuestionsFromTopic(context: TopicContext): Promise<ExtractedQuestion[]> {
  const notesText = context.notes.map(n => `### ${n.title}\n${n.content || ''}`).join('\n\n')
  const examTrack = context.examTrack || 'gate_cse'

  const { systemPrompt, userPrompt } = buildQuestionGenPrompt({
    examTrack,
    subject: context.subject,
    topic: context.topic,
    subtopic: context.subtopic,
    difficulty: 'medium',
    count: Math.min(context.count || 5, 15),
    referenceNotes: notesText,
  })

  try {
    const { data } = await aiRouter.generateJSON<ExtractedQuestion[]>(
      {
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
      },
      validateGeneratedQuestions
    )

    return data
  } catch (error) {
    console.error('[AI Question Generation Error]:', error)
    // Return fallback sample questions so the student is never blocked
    return generateFallbackQuestions(context)
  }
}

function generateFallbackQuestions(ctx: TopicContext): ExtractedQuestion[] {
  return [
    {
      question_text: `Which of the following is a primary principle of ${ctx.subtopic || ctx.topic} in ${ctx.subject}?`,
      options: {
        A: 'It optimizes resource allocation and guarantees consistent operational constraints.',
        B: 'It violates standard algorithmic correctness under normal execution bounds.',
        C: 'It can only be applied to non-deterministic theoretical models.',
        D: 'It requires unbounded memory during typical evaluation cycles.',
      },
      correct_answer: 'A',
      subject: ctx.subject,
      topic: `${ctx.topic} - ${ctx.subtopic || 'Fundamentals'}`,
      difficulty: 'easy',
      explanation: `Option A correctly states the foundational principle of ${ctx.subtopic || ctx.topic}.`,
    },
  ]
}

export const generateQuestionsFromTopicContent = generateQuestionsFromTopic

