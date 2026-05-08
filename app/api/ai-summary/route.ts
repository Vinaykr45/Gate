import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateWithFallback } from '@/lib/gemini/client'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { topic, subject, subtopic } = await request.json()
  if (!topic || !subject) return NextResponse.json({ error: 'topic and subject required' }, { status: 400 })

  const fullTopic = subtopic ? `${topic} — ${subtopic}` : topic

  const prompt = `You are an expert GATE CS tutor. Generate a structured summary for the topic: "${fullTopic}" (Subject: ${subject}).

Return ONLY valid JSON in this exact format:
{
  "easyExplanation": "A simple 3-4 sentence explanation using everyday analogies. No jargon.",
  "keyPoints": [
    "Key point 1 (formula, rule, or concept)",
    "Key point 2",
    "Key point 3",
    "Key point 4",
    "Key point 5"
  ],
  "revisionNotes": "Compact 5-8 line revision summary with GATE-specific tips, common question patterns, and what to memorize."
}

Focus on what GATE aspirants need to know. Be precise and exam-oriented.`

  try {
    const { text } = await generateWithFallback({
      prompt,
      generationConfig: { temperature: 0.3, maxOutputTokens: 2048, responseMimeType: 'application/json' },
    })

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON in response')

    const summary = JSON.parse(jsonMatch[0])
    return NextResponse.json({ summary })
  } catch (err) {
    console.error('AI summary error:', err)
    const msg = String(err)
    if (msg.includes('503') || msg.includes('429') || msg.includes('busy')) {
      return NextResponse.json({ error: 'AI service is temporarily busy. Please try again shortly.' }, { status: 503 })
    }
    return NextResponse.json({ error: 'Failed to generate summary' }, { status: 500 })
  }
}
