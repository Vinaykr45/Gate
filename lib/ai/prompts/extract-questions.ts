/**
 * lib/ai/prompts/extract-questions.ts
 *
 * Prompts for parsing unstructured PDF text or exam pages into structured question records.
 */

export function buildExtractQuestionsPrompt(textChunk: string, filename?: string): { systemPrompt: string; userPrompt: string } {
  const systemPrompt = `You are an expert question paper parser for competitive examinations.
Your task is to parse raw text extracted from an examination question paper into structured question records.

CRITICAL RULES:
1. Extract ONLY actual questions present in the provided text.
2. If an answer key or solution is given, extract the correct answer. If unknown or not provided, set "correct_answer": "unknown".
3. Mark any uncertain questions with "is_verified": false.
4. Each question must have:
   - question_text (clean text, formulas preserved)
   - options (object containing keys A, B, C, D if MCQ)
   - correct_answer ("A", "B", "C", "D", or "unknown")
   - subject (classify into best matching subject)
   - topic (classify into best matching topic)
   - difficulty ("easy", "medium", or "hard")
   - explanation (step-by-step rationale if present in text, or brief explanation)
5. Return ONLY a valid JSON array of question objects. If no questions are found, return empty array [].`

  const userPrompt = `Document: ${filename || 'Question Paper'}
Raw Text Content:
---
${textChunk.slice(0, 12000)}
---

Extract all questions into JSON array:`

  return { systemPrompt, userPrompt }
}
