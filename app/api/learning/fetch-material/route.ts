import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateWithFallback } from '@/lib/gemini/client'
import { findRegistryTopic } from '@/lib/curriculum/registry'
import { ensureTopicInDb, isUUID } from '@/lib/curriculum/ensure-topic'

/**
 * POST /api/learning/fetch-material
 *
 * Uses Gemini to generate rich learning material for a topic:
 * - concept_explanation: detailed explanation
 * - key_formulas: important formulas/rules
 * - gate_patterns: common question patterns
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

    const { topic_id, mode = 'ai', custom_topic } = await request.json()
    if (!topic_id) return NextResponse.json({ error: 'topic_id is required' }, { status: 400 })

    // Fetch topic metadata from database or CURRICULUM_REGISTRY
    let topic: any = null

    if (isUUID(topic_id)) {
      const { data: dbTopic } = await supabase
        .from('learning_topics')
        .select('*')
        .eq('id', topic_id)
        .maybeSingle()
      if (dbTopic) topic = dbTopic
    }

    if (!topic) {
      topic = findRegistryTopic(topic_id)
    }

    if (!topic) {
      const cleanTitle = (custom_topic || topic_id).replace(/[-_]/g, ' ')
      topic = {
        id: topic_id,
        subject: 'Curriculum',
        topic: cleanTitle,
        subtopic: cleanTitle,
        description: 'Comprehensive preparation concepts and syllabus insights',
      }
    }

    const fullTopic = custom_topic ? `${topic.topic} — ${custom_topic}` : `${topic.topic} — ${topic.subtopic}`

    const prompt = `You are an expert exam educator for ${topic.subject} (${topic.track || 'Engineering & Professional Exams'}). Generate a high-quality, professional learning guide for:
- Subject: ${topic.subject}
- Topic: ${topic.topic}
- Subtopic: ${custom_topic || topic.subtopic}

Your explanations must be conceptually clear, easy to learn, professional, and comprehensive (full, not partial) while remaining concise and highly relevant to the GATE exam.
Return ONLY a valid JSON object matching this exact schema (no markdown formatting outside of JSON, no extra text):

{
  "concept_explanation": "A clear, professional, and comprehensive explanation of the core concept. Make it easy to understand and learn.",
  "key_points": [
    "Important factual point or concept 1",
    "Important factual point or concept 2",
    "Important factual point or concept 3",
    "Important factual point or concept 4",
    "Important factual point or concept 5"
  ],
  "gate_patterns": [
    {"pattern": "Question type/pattern", "tip": "Actionable approach/tip to solve", "frequency": "High"},
    {"pattern": "Question type/pattern 2", "tip": "Actionable approach/tip 2", "frequency": "Medium"}
  ],
  "worked_example": {
    "question": "A realistic GATE-style question",
    "solution": "Clear, step-by-step solution",
    "key_insight": "The core trick or concept tested"
  },
  "mnemonics": ["Memory trick or shortcut 1", "Memory trick or shortcut 2"],
  "common_mistakes": ["Mistake 1 and how to avoid it", "Mistake 2 and how to avoid it", "Mistake 3 and how to avoid it"],
  "resources": {
    "youtube_searches": ["Search query 1", "Search query 2"],
    "key_books": ["Standard reference book + chapter/topic"]
  },
  "difficulty_breakdown": {
    "easy": "Description of what easy questions test",
    "medium": "Description of what medium questions test",
    "hard": "Description of what hard questions test"
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

    // Auto-save the concept explanation as a curated note
    if (mode === 'comprehensive') {
      const dbTopicId = await ensureTopicInDb(supabase, topic_id, topic)

      if (dbTopicId) {
        const prefix = custom_topic || topic.subtopic
        const titles = [
          `${prefix} — Core Concepts & Resources`,
          `${prefix} — Question Patterns & Examples`,
          `${prefix} — Mistakes & Mnemonics`,
        ]

        // Delete existing notes with these exact titles for this topic to avoid duplicates
        await supabase
          .from('notes')
          .delete()
          .eq('topic_id', dbTopicId)
          .in('title', titles)

        const notesToInsert = [
          {
            topic_id: dbTopicId,
            title: titles[0],
            content: `### 💡 Concept Explanation\n${material.concept_explanation}\n\n---\n\n### 📌 Key Points\n${material.key_points.map((p: string, i: number) => `* **${i + 1}.** ${p}`).join('\n')}\n\n---\n\n### 📚 Additional Resources\n* **Books:** ${(material.resources?.key_books || []).join(', ')}\n* **Search Terms:** ${(material.resources?.youtube_searches || []).map((s: string) => `\`${s}\``).join(', ')}`,
            type: 'text',
            order_num: 1,
          },
          {
            topic_id: dbTopicId,
            title: titles[1],
            content: `### 🎯 Question Patterns\n${(material.gate_patterns || []).map((p: any) => `#### 📌 ${p.pattern}\n**Frequency:** \`${p.frequency}\`\n> 💡 **Tip:** ${p.tip}`).join('\n\n')}\n\n---\n\n### 📝 Worked Example\n**Q:** ${material.worked_example?.question || ''}\n\n**Solution:**\n${material.worked_example?.solution || ''}\n\n> **Key Insight:** ${material.worked_example?.key_insight || ''}\n\n---\n\n### 📊 Difficulty Breakdown\n* **Easy:** ${material.difficulty_breakdown?.easy || 'N/A'}\n* **Medium:** ${material.difficulty_breakdown?.medium || 'N/A'}\n* **Hard:** ${material.difficulty_breakdown?.hard || 'N/A'}`,
            type: 'text',
            order_num: 2,
          },
          {
            topic_id: dbTopicId,
            title: titles[2],
            content: `### ⚠️ Common Pitfalls & Mistakes\n${(material.common_mistakes || []).map((m: string) => `* ❌ ${m}`).join('\n')}\n\n---\n\n### 🧠 Mnemonics & Memory Tricks\n${(material.mnemonics || []).map((m: string) => `* ✨ ${m}`).join('\n')}`,
            type: 'text',
            order_num: 3,
          },
        ]
        await supabase.from('notes').insert(notesToInsert)

        // Also add user summary note
        await supabase.from('user_notes').insert({
          user_id: user.id,
          topic_id: dbTopicId,
          content: `## 📖 ${prefix} Summary\n\n${material.concept_explanation}\n\n${(material.key_points || []).slice(0, 4).map((k: string) => `• ${k}`).join('\n')}`,
        })
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

