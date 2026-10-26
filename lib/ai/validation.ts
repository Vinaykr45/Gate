/**
 * lib/ai/validation.ts
 *
 * Robust JSON extraction and schema validation for AI responses.
 * Cleans markdown code blocks (```json ... ```) and verifies data shapes.
 */

import type { GeneratedQuestionPayload, TopicSummaryPayload, PerformanceInsightPayload } from './types'

/**
 * Extracts raw JSON from an LLM response string even if wrapped in markdown blocks
 */
export function extractJsonFromText(raw: string): unknown {
  if (!raw || typeof raw !== 'string') {
    throw new Error('Empty response received from AI model')
  }

  let cleaned = raw.trim()

  // Remove markdown code fences if present
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
  }

  // Attempt direct parse first
  try {
    return JSON.parse(cleaned)
  } catch {
    // Look for first '{' or '[' and last '}' or ']'
    const firstBracket = cleaned.indexOf('[')
    const firstBrace = cleaned.indexOf('{')
    let startIdx = -1

    if (firstBracket !== -1 && (firstBrace === -1 || firstBracket < firstBrace)) {
      startIdx = firstBracket
    } else if (firstBrace !== -1) {
      startIdx = firstBrace
    }

    if (startIdx === -1) {
      throw new Error('No JSON object or array found in model output')
    }

    const lastBracket = cleaned.lastIndexOf(']')
    const lastBrace = cleaned.lastIndexOf('}')
    const endIdx = Math.max(lastBracket, lastBrace)

    if (endIdx === -1 || endIdx <= startIdx) {
      throw new Error('Unterminated JSON found in model output')
    }

    const substring = cleaned.substring(startIdx, endIdx + 1)
    return JSON.parse(substring)
  }
}

/**
 * Validates array of generated questions
 */
export function validateGeneratedQuestions(data: unknown): GeneratedQuestionPayload[] {
  const arr = Array.isArray(data) ? data : [data]
  const valid: GeneratedQuestionPayload[] = []

  for (const item of arr) {
    if (!item || typeof item !== 'object') continue
    const q = item as Partial<GeneratedQuestionPayload>

    if (!q.question_text || typeof q.question_text !== 'string') continue
    if (!q.options || typeof q.options !== 'object') continue

    // Normalize options
    const options: Record<string, string> = {}
    for (const [k, v] of Object.entries(q.options)) {
      if (typeof v === 'string' && v.trim()) {
        options[k.toUpperCase()] = v.trim()
      }
    }

    // Require at least options A and B
    if (Object.keys(options).length < 2) continue

    const validAnswer = (q.correct_answer || 'A').toUpperCase()
    const difficulty = (['easy', 'medium', 'hard'].includes(q.difficulty || '') ? q.difficulty : 'medium') as 'easy' | 'medium' | 'hard'

    valid.push({
      question_text: q.question_text.trim(),
      options,
      correct_answer: validAnswer,
      subject: q.subject || 'General',
      topic: q.topic || 'General',
      difficulty,
      explanation: q.explanation || 'No explanation provided.',
      exam_track: q.exam_track || 'gate_cse',
      is_verified: false, // Default to draft for admin verification
    })
  }

  if (valid.length === 0) {
    throw new Error('Failed to validate any generated questions from model output')
  }

  return valid
}

/**
 * Validates topic summary payload
 */
export function validateTopicSummary(data: unknown, fallbackTitle = ''): TopicSummaryPayload {
  const obj = (data && typeof data === 'object' ? data : {}) as Partial<TopicSummaryPayload>

  return {
    title: obj.title || fallbackTitle || 'Topic Revision Summary',
    subject: obj.subject || 'Core Subject',
    topic: obj.topic || fallbackTitle,
    overview: obj.overview || 'Comprehensive overview of key concepts and principles.',
    key_concepts: Array.isArray(obj.key_concepts) ? obj.key_concepts.filter(x => typeof x === 'string') : [],
    exam_tips: Array.isArray(obj.exam_tips) ? obj.exam_tips.filter(x => typeof x === 'string') : [],
    common_pitfalls: Array.isArray(obj.common_pitfalls) ? obj.common_pitfalls.filter(x => typeof x === 'string') : [],
    flashcards: Array.isArray(obj.flashcards)
      ? obj.flashcards.filter(f => f && typeof f.front === 'string' && typeof f.back === 'string')
      : [],
  }
}
