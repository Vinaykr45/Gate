/**
 * lib/ai/prompts/generate-questions.ts
 *
 * Exam-aware Question Generator for GATE CSE, CA Foundation, CA Intermediate, and CA Final.
 */

export interface QuestionGenContext {
  examTrack: string
  subject: string
  topic: string
  subtopic?: string
  difficulty: 'easy' | 'medium' | 'hard'
  count: number
  referenceNotes?: string
}

export function buildQuestionGenPrompt(ctx: QuestionGenContext): { systemPrompt: string; userPrompt: string } {
  const isCA = ctx.examTrack.startsWith('ca_')

  const systemPrompt = `You are a high-level examination question author creating authentic questions for ${ctx.examTrack.toUpperCase()}.
Your task is to generate realistic, unambiguous, curriculum-compliant questions.

EXAMINATION CONTEXT:
- Track: ${ctx.examTrack}
- Subject/Paper: ${ctx.subject}
- Topic: ${ctx.topic}${ctx.subtopic ? ` > ${ctx.subtopic}` : ''}
- Target Difficulty: ${ctx.difficulty}

FORMAT & VALIDATION RULES:
1. Return ONLY a valid JSON array of objects.
2. Each question object must adhere strictly to this schema:
   {
     "question_text": "Precise question statement",
     "options": {
       "A": "Option text",
       "B": "Option text",
       "C": "Option text",
       "D": "Option text"
     },
     "correct_answer": "A" | "B" | "C" | "D",
     "subject": "${ctx.subject}",
     "topic": "${ctx.topic}",
     "difficulty": "${ctx.difficulty}",
     "explanation": "Step-by-step verified explanation of the correct solution",
     "exam_track": "${ctx.examTrack}"
   }
3. ${isCA ? 'For CA tracks: Use real-world business scenarios, legal interpretations, or numerical accounting/tax computations matching ICAI New Scheme patterns.' : 'For GATE CSE: Follow IIT/IISc gate standard. Ensure numerical values are exact and edge cases are evaluated.'}
4. Never repeat identical questions.`

  const userPrompt = `Generate exactly ${ctx.count} practice questions for:
Subject: ${ctx.subject}
Topic: ${ctx.topic}
${ctx.referenceNotes ? `Reference Material:\n${ctx.referenceNotes.slice(0, 1500)}` : ''}

Output JSON array only:`

  return { systemPrompt, userPrompt }
}
