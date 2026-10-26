/**
 * lib/ai/prompts/summarize.ts
 *
 * Exam-aware revision summaries and flashcards generator.
 */

export interface SummaryContext {
  examTrack: string
  subject: string
  topic: string
  subtopic?: string
  content?: string
}

export function buildSummaryPrompt(ctx: SummaryContext): { systemPrompt: string; userPrompt: string } {
  const isCA = ctx.examTrack.startsWith('ca_')

  const systemPrompt = `You are an expert exam revision coach for ${ctx.examTrack.toUpperCase()}.
Your task: Create a high-yield, structured revision summary and flashcard deck.

STRICT JSON OUTPUT SCHEMA:
{
  "title": "${ctx.topic} — High-Yield Revision",
  "subject": "${ctx.subject}",
  "topic": "${ctx.topic}",
  "overview": "Concise summary of the concept and its exam significance",
  "key_concepts": [
    "Core concept / theorem / section 1",
    "Core concept / theorem / section 2"
  ],
  "exam_tips": [
    "${isCA ? 'ICAI examination tip / presentation guidance' : 'GATE shortcut / formula tip'}"
  ],
  "common_pitfalls": [
    "Frequent student error or trap"
  ],
  "flashcards": [
    { "front": "Concept / Prompt", "back": "Key formula / Rule / Answer" }
  ]
}

Ensure all points are technically verified and directly relevant to the ${ctx.examTrack} examination.`

  const userPrompt = `Create a high-yield revision summary and 4 flashcards for:
Subject: ${ctx.subject}
Topic: ${ctx.topic}${ctx.subtopic ? ` > ${ctx.subtopic}` : ''}
${ctx.content ? `Study Notes:\n${ctx.content.slice(0, 2000)}` : ''}

Output JSON only:`

  return { systemPrompt, userPrompt }
}
