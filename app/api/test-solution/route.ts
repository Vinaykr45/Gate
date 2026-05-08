import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateWithFallback } from '@/lib/gemini/client'

async function generateExplanation(question: {
  question_text: string
  options: Record<string, string>
  correct_answer: string
}): Promise<string> {
  const prompt = `You are a GATE CS expert. Explain why the correct answer is correct and why the other options are wrong.

Question: ${question.question_text}
Options: ${JSON.stringify(question.options)}
Correct Answer: ${question.correct_answer}

Return a concise explanation (3-5 sentences) covering:
1. Why ${question.correct_answer} is correct
2. Why the other options are wrong (briefly)

Be direct and exam-focused.`

  const { text } = await generateWithFallback({
    prompt,
    generationConfig: { temperature: 0.1, maxOutputTokens: 1024 },
  })
  return text
}

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const attemptId = searchParams.get('attemptId')
  if (!attemptId) return NextResponse.json({ error: 'attemptId required' }, { status: 400 })

  // Fetch attempt
  const { data: attempt, error: attemptErr } = await supabase
    .from('attempts')
    .select('*, test:tests(*)')
    .eq('id', attemptId)
    .eq('user_id', user.id)
    .single()

  if (attemptErr || !attempt) return NextResponse.json({ error: 'Attempt not found' }, { status: 404 })

  // Fetch answers + questions
  const { data: answers } = await supabase
    .from('answers')
    .select('*, question:questions(*)')
    .eq('attempt_id', attemptId)

  if (!answers) return NextResponse.json({ error: 'No answers found' }, { status: 404 })

  // Generate explanations for questions that don't have one
  const enriched = await Promise.all(
    answers.map(async (answer) => {
      const q = answer.question
      if (!q) return answer
      let explanation = q.explanation

      if (!explanation && q.correct_answer !== 'unknown') {
        try {
          explanation = await generateExplanation(q)
        } catch {
          explanation = null
        }
      }

      return {
        ...answer,
        question: { ...q, explanation },
      }
    })
  )

  return NextResponse.json({
    attempt,
    test: attempt.test,
    answers: enriched,
  })
}
