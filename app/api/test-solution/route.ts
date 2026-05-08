import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateWithFallback } from '@/lib/gemini/client'

async function generateExplanation(question: {
  question_text: string
  options: Record<string, string>
  correct_answer: string
}): Promise<string> {
const prompt = `You are a GATE CS expert. Provide a short, direct, and conceptually clear explanation.

Question: ${question.question_text}
Options: ${JSON.stringify(question.options)}
Correct Answer: ${question.correct_answer}

Provide a concise explanation (under 150 words total) covering:
1. The core concept or mathematical trick to arrive at the correct answer (${question.correct_answer}).
2. A very brief reason why the other options are wrong.

Make it short but conceptually complete. Be direct. DO NOT USE JSON FORMAT. Return ONLY plain text. DO NOT use any markdown formatting like **bold** or *italics*.`

  let { text } = await generateWithFallback({
    prompt,
    generationConfig: { temperature: 0.2, maxOutputTokens: 4096 },
  })

  // Force strip JSON if the model ignores the prompt
  let trimmed = text.trim()
  if (trimmed.startsWith('```json')) trimmed = trimmed.replace(/^```json/i, '')
  if (trimmed.startsWith('```')) trimmed = trimmed.replace(/^```/, '')
  if (trimmed.endsWith('```')) trimmed = trimmed.replace(/```$/, '')
  trimmed = trimmed.trim()
  
  if (trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed)
      text = parsed.explanation || parsed.text || parsed.content || Object.values(parsed)[0] || text
    } catch {
      // Regex fallback for truncated JSON strings
      const match = trimmed.match(/"(?:explanation|text|content)"\s*:\s*"([^]+)/i)
      if (match && match[1]) {
         let val = match[1]
         if (val.endsWith('"}')) val = val.slice(0, -2)
         else if (val.endsWith('"')) val = val.slice(0, -1)
         text = val.replace(/\\n/g, '\n').replace(/\\"/g, '"')
      }
    }
  }

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
          if (explanation) {
            // Save to DB using standard supabase-js to completely bypass SSR cookie context and RLS
            const { createClient: createAdminClient } = await import('@supabase/supabase-js')
            const adminSupabase = createAdminClient(
              process.env.NEXT_PUBLIC_SUPABASE_URL!,
              process.env.SUPABASE_SERVICE_ROLE_KEY!
            )
            const { error: updateErr } = await adminSupabase.from('questions').update({ explanation }).eq('id', q.id)
            if (updateErr) console.error('Failed to save explanation:', updateErr)
          }
        } catch (e) {
          console.error('Explanation generation failed:', e)
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
