import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { aiRouter } from '@/lib/ai/router'
import { aiCache } from '@/lib/ai/cache'
import { extractJsonFromText } from '@/lib/ai/validation'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { topic, subject, subtopic, examTrack = 'gate_cse' } = await request.json()
  if (!topic || !subject) return NextResponse.json({ error: 'topic and subject required' }, { status: 400 })

  const fullTopic = subtopic ? `${topic} — ${subtopic}` : topic
  const cacheKey = `summary_${examTrack}_${subject}_${fullTopic}`

  // Check cache first
  const cached = aiCache.get<Record<string, unknown>>(cacheKey)
  if (cached) {
    return NextResponse.json({ summary: cached, cached: true })
  }

  const prompt = `You are an expert tutor for ${examTrack.toUpperCase()}. Generate a structured revision summary for the topic: "${fullTopic}" (Subject: ${subject}).

Return ONLY valid JSON in this exact format:
{
  "easyExplanation": "A clear, intuitive 3-4 sentence explanation. No unnecessary jargon.",
  "keyPoints": [
    "Key point 1 (formula, rule, section, or core concept)",
    "Key point 2",
    "Key point 3",
    "Key point 4",
    "Key point 5"
  ],
  "revisionNotes": "Compact 5-8 line revision summary with examination tips, common question patterns, and memorization anchors."
}

Focus on what aspirants need to know. Be precise and exam-oriented.`

  try {
    const { data } = await aiRouter.generateJSON<Record<string, unknown>>(
      {
        messages: [
          { role: 'system', content: `You are an expert faculty for ${examTrack}.` },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
      },
      (parsed) => {
        const obj = parsed as Record<string, unknown>
        if (!obj || typeof obj !== 'object') throw new Error('Invalid JSON structure')
        return obj
      }
    )

    // Cache the summary for 24 hours (reusable across students safely)
    aiCache.set(cacheKey, data, 86400)

    return NextResponse.json({ summary: data })
  } catch (err) {
    console.error('AI summary error:', err)
    return NextResponse.json(
      {
        summary: {
          easyExplanation: `${fullTopic} is a core foundation topic in ${subject}. It establishes the primary rules and operating principles for problem solving.`,
          keyPoints: [
            `Understand the fundamental definition and scope of ${fullTopic}.`,
            'Identify boundary conditions and standard constraints.',
            'Memorize the core relationships and formulas.',
            'Practice past examination questions to recognize typical patterns.',
          ],
          revisionNotes: `Review textbook notes and lecture materials for ${fullTopic}. Pay attention to edge cases and calculation accuracy.`,
        },
        fallback: true,
      },
      { status: 200 }
    )
  }
}
