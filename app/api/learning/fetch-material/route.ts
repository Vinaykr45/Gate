import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateWithFallback } from '@/lib/gemini/client'

/**
 * POST /api/learning/fetch-material
 *
 * Uses Gemini to generate rich learning material for a topic:
 * - concept_explanation: detailed explanation
 * - key_formulas: important formulas/rules
 * - gate_patterns: common GATE question patterns
 * - mnemonics: memory tricks
 * - worked_examples: 2-3 solved examples
 * - further_reading: suggested YouTube searches & resources
 *
 * Body: { topic_id: string, mode: 'ai' | 'comprehensive' }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { topic_id, mode = 'ai' } = await request.json()
    if (!topic_id) return NextResponse.json({ error: 'topic_id is required' }, { status: 400 })

    // Fetch topic metadata
    const { data: topic, error: topicError } = await supabase
      .from('learning_topics')
      .select('*')
      .eq('id', topic_id)
      .single()

    if (topicError || !topic) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 })
    }

    const fullTopic = `${topic.topic} — ${topic.subtopic}`

    const prompt = `You are a GATE CS expert. Generate a concise learning guide for:
- Subject: ${topic.subject}
- Topic: ${topic.topic}
- Subtopic: ${topic.subtopic}

IMPORTANT: Keep EVERY string value under 150 characters. Be brief and exam-focused.
Return ONLY a valid JSON object matching this exact schema (no markdown, no extra text):

{
  "concept_explanation": "2-3 sentence simple explanation with one analogy. Max 200 chars.",
  "key_points": [
    "Fact 1 (max 100 chars)",
    "Fact 2",
    "Fact 3",
    "Fact 4",
    "Fact 5"
  ],
  "gate_patterns": [
    {"pattern": "Question type (max 80 chars)", "tip": "Approach tip (max 100 chars)", "frequency": "High"},
    {"pattern": "Question type 2", "tip": "Approach tip 2", "frequency": "Medium"}
  ],
  "worked_example": {
    "question": "Short GATE-style MCQ (max 150 chars)",
    "solution": "Step-by-step answer (max 200 chars)",
    "key_insight": "Core concept tested (max 100 chars)"
  },
  "mnemonics": ["Trick 1 (max 80 chars)", "Trick 2"],
  "common_mistakes": ["Mistake 1 (max 100 chars)", "Mistake 2", "Mistake 3"],
  "resources": {
    "youtube_searches": ["Search query 1", "Search query 2"],
    "key_books": ["Book + chapter"]
  },
  "difficulty_breakdown": {
    "easy": "What easy Qs test (max 80 chars)",
    "medium": "What medium Qs test (max 80 chars)",
    "hard": "What hard Qs test (max 80 chars)"
  }
}`

    // ── Generate via shared key-rotating client ───────────────
    const { text } = await generateWithFallback({
      prompt,
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 16384,
        responseMimeType: 'application/json',
      },
    })

    const material = parseGeminiJson(text) as {
      concept_explanation: string
      key_points: string[]
      gate_patterns: { pattern: string; tip: string; frequency: string }[]
      worked_example: { question: string; solution: string; key_insight: string }
      mnemonics: string[]
      common_mistakes: string[]
      resources: { youtube_searches: string[]; key_books: string[] }
      difficulty_breakdown: { easy: string; medium: string; hard: string }
    } | null
    if (!material) {
      console.error('Raw Gemini response (first 600 chars):', text.slice(0, 600))
      throw new Error('Could not parse Gemini JSON response')
    }

    // Auto-save the concept explanation as a curated note if none exist
    if (mode === 'comprehensive') {
      const { data: existingNotes } = await supabase
        .from('notes')
        .select('id')
        .eq('topic_id', topic_id)
        .limit(1)

      if (!existingNotes || existingNotes.length === 0) {
        const notesToInsert = [
          {
            topic_id,
            title: `${topic.subtopic} — Core Concepts`,
            content: material.concept_explanation + '\n\n📌 Key Points:\n' + material.key_points.map((p: string, i: number) => `${i + 1}. ${p}`).join('\n'),
            type: 'text',
            order_num: 1,
          },
          {
            topic_id,
            title: 'GATE Question Patterns',
            content: material.gate_patterns.map((p: { pattern: string; tip: string; frequency: string }) =>
              `🎯 ${p.pattern} [${p.frequency}]\n→ ${p.tip}`
            ).join('\n\n'),
            type: 'text',
            order_num: 2,
          },
          {
            topic_id,
            title: 'Common Mistakes to Avoid',
            content: material.common_mistakes.map((m: string, i: number) => `⚠️ ${i + 1}. ${m}`).join('\n'),
            type: 'text',
            order_num: 3,
          },
        ]
        await supabase.from('notes').insert(notesToInsert)
      }
    }

    return NextResponse.json({ material, topic: fullTopic })
  } catch (error) {
    console.error('fetch-material error:', error)
    const msg = String(error)
    if (msg.includes('503') || msg.includes('429') || msg.includes('busy')) {
      return NextResponse.json(
        { error: 'AI service is temporarily busy. Please try again in 30 seconds.' },
        { status: 503 }
      )
    }
    return NextResponse.json({ error: 'Failed to generate learning material' }, { status: 500 })
  }
}

/**
 * Robustly parse JSON from Gemini 2.5 Flash output.
 * Handles: markdown fences, BOM, control chars, trailing commas, smart quotes.
 */
function parseGeminiJson(raw: string): Record<string, unknown> | null {
  // 1. Strip markdown code fences and BOM
  let text = raw
    .replace(/^\uFEFF/, '')
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .trim()

  // 2. Remove ASCII control characters (tab/newline/CR are fine)
  // eslint-disable-next-line no-control-regex
  text = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')

  // 3. Direct parse (fast path — works when responseMimeType:'application/json')
  try { return JSON.parse(text) } catch { /* fall through */ }

  // 4. Balanced-brace extraction — finds the outermost { } correctly
  const start = text.indexOf('{')
  if (start === -1) return null

  let depth = 0
  let inString = false
  let escape = false
  let end = -1

  for (let i = start; i < text.length; i++) {
    const ch = text[i]
    if (escape) { escape = false; continue }
    if (ch === '\\' && inString) { escape = true; continue }
    if (ch === '"') { inString = !inString; continue }
    if (inString) continue
    if (ch === '{') depth++
    if (ch === '}') { depth--; if (depth === 0) { end = i; break } }
  }

  if (end === -1) return null
  const jsonSlice = text.slice(start, end + 1)

  // 5. Parse the extracted slice
  try { return JSON.parse(jsonSlice) } catch { /* fall through */ }

  // 6. Sanitize common Gemini output issues and retry
  const sanitized = jsonSlice
    .replace(/,\s*([}\]])/g, '$1')      // trailing commas
    .replace(/[\u2018\u2019]/g, "'")    // smart single quotes
    .replace(/[\u201C\u201D]/g, '"')    // smart double quotes

  try { return JSON.parse(sanitized) } catch (e) {
    console.error('parseGeminiJson: all strategies failed:', (e as Error).message)
    return null
  }
}

