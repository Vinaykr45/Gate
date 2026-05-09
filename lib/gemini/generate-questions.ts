import { geminiModel } from './client'
import type { ExtractedQuestion } from '@/lib/types'

// ============================================================
// GENERATION PROMPT — creates questions FROM topic content
// ============================================================
const GENERATION_SYSTEM_PROMPT = `You are an expert GATE exam question generator for engineering entrance exams.

Your task: Given study material (notes, topics, video titles) about a specific GATE topic, generate realistic GATE-style multiple-choice questions (MCQs).

CRITICAL RULES:
1. Generate questions ONLY from the provided topic and content — do not go outside the scope
2. Each question MUST have exactly 4 options (A, B, C, D)
3. The correct_answer MUST be one of: "A", "B", "C", or "D"
4. Questions must follow actual GATE exam style — precise, unambiguous, technical
5. Include a brief explanation for the correct answer
6. Vary difficulty: mix easy (recall), medium (reasoning), hard (tricky edge cases)
7. Return ONLY valid JSON array — no markdown, no extra text
8. Never repeat the same question twice

GATE QUESTION STYLES to use:
- "Which of the following is/are correct?" (true/false about concepts)
- Scenario-based: "Consider the following... What happens when..."
- Numerical: "A process has X... How many..."
- Match-the-following formatted as a single MCQ
- "Which of the following statements is INCORRECT?"

DIFFICULTY CLASSIFICATION:
- "easy": Direct definition/recall, single concept
- "medium": Requires applying the concept, 2-3 step reasoning
- "hard": Multi-step, counter-intuitive, edge cases, tricky options

OUTPUT FORMAT (strict JSON array only):
[
  {
    "question_text": "exact question text here",
    "options": {
      "A": "first option",
      "B": "second option",
      "C": "third option",
      "D": "fourth option"
    },
    "correct_answer": "B",
    "subject": "Computer Science",
    "topic": "Operating System - CPU Scheduling",
    "difficulty": "medium",
    "explanation": "brief explanation of why B is correct"
  }
]`

interface TopicContext {
  subject: string
  topic: string
  subtopic: string
  description?: string
  notes: Array<{ title: string; content?: string }>
  videoTitles: string[]
  count: number
}

export async function generateQuestionsFromTopicContent(ctx: TopicContext): Promise<ExtractedQuestion[]> {
  // Build rich context for Gemini
  const noteContent = ctx.notes
    .map((n) => `### ${n.title}\n${n.content || '(no content)'}`)
    .join('\n\n')

  const videoContext = ctx.videoTitles.length > 0
    ? `Video topics covered:\n${ctx.videoTitles.map((t) => `- ${t}`).join('\n')}`
    : ''

  const prompt = `${GENERATION_SYSTEM_PROMPT}

TOPIC CONTEXT:
Subject: ${ctx.subject}
Topic: ${ctx.topic}
Subtopic: ${ctx.subtopic}
Description: ${ctx.description || 'N/A'}

${videoContext}

STUDY NOTES:
${noteContent || `No specific notes. Generate questions about: ${ctx.subtopic} in the context of ${ctx.topic} for GATE ${ctx.subject}.`}

Generate exactly ${ctx.count} GATE-style MCQ questions based on the above content.
Ensure a mix of difficulties. Return JSON array only.`

  try {
    const result = await geminiModel.generateContent(prompt)
    const responseText = result.response.text()
    return parseGeneratedQuestions(responseText, ctx.subject, `${ctx.topic} - ${ctx.subtopic}`)
  } catch (error) {
    console.error('Gemini question generation error:', error)
    return []
  }
}

function parseGeneratedQuestions(
  responseText: string,
  defaultSubject: string,
  defaultTopic: string,
): ExtractedQuestion[] {
  try {
    let cleaned = responseText.trim()
    cleaned = cleaned.replace(/```json\n?/gi, '').replace(/```\n?/g, '')

    const startIdx = cleaned.indexOf('[')
    const endIdx = cleaned.lastIndexOf(']')
    if (startIdx === -1 || endIdx === -1) return []

    const jsonStr = cleaned.substring(startIdx, endIdx + 1)
    const parsed = JSON.parse(jsonStr)

    if (!Array.isArray(parsed)) return []

    return parsed
      .filter(
        (q: Record<string, unknown>) =>
          q.question_text &&
          typeof q.question_text === 'string' &&
          q.question_text.trim().length > 10 &&
          q.options &&
          q.correct_answer &&
          ['A', 'B', 'C', 'D'].includes(String(q.correct_answer).toUpperCase()),
      )
      .map((q: Record<string, unknown>) => ({
        question_text: String(q.question_text || '').trim(),
        options: sanitizeOptions(q.options as Record<string, string>),
        correct_answer: String(q.correct_answer || '').toUpperCase(),
        subject: String(q.subject || defaultSubject),
        topic: String(q.topic || defaultTopic),
        difficulty: sanitizeDifficulty(q.difficulty as string),
        explanation: q.explanation ? String(q.explanation) : undefined,
      }))
  } catch (error) {
    console.error('Failed to parse generated questions:', error)
    return []
  }
}

function sanitizeOptions(options: unknown): Record<string, string> {
  if (!options || typeof options !== 'object') return {}
  const result: Record<string, string> = {}
  for (const key of ['A', 'B', 'C', 'D']) {
    const val = (options as Record<string, unknown>)[key]
    if (val !== undefined && val !== null) {
      result[key] = String(val).trim()
    }
  }
  return result
}

function sanitizeDifficulty(difficulty: unknown): 'easy' | 'medium' | 'hard' {
  const valid = ['easy', 'medium', 'hard']
  const str = String(difficulty || 'medium').toLowerCase()
  return valid.includes(str) ? (str as 'easy' | 'medium' | 'hard') : 'medium'
}

