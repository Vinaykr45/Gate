import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ensureTopicInDb } from '@/lib/curriculum/ensure-topic'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { topic_id, material, custom_topic, topic_meta } = await request.json()

    if (!topic_id || !material) {
      return NextResponse.json({ error: 'topic_id and material are required' }, { status: 400 })
    }

    // 1. Ensure the topic exists in database with a valid UUID
    const dbTopicId = await ensureTopicInDb(supabase, topic_id, topic_meta)

    if (!dbTopicId) {
      return NextResponse.json({ error: 'Failed to resolve topic in database' }, { status: 500 })
    }

    const prefix = custom_topic || topic_meta?.subtopic || 'Concept Note'
    const titles = [
      `${prefix} — Core Concepts & Resources`,
      `${prefix} — Exam Patterns & Examples`,
      `${prefix} — Mistakes & Mnemonics`,
    ]

    // 2. Remove any previous notes with exact same titles to avoid cluttering
    await supabase
      .from('notes')
      .delete()
      .eq('topic_id', dbTopicId)
      .in('title', titles)

    // 3. Format and insert the 3 curated notes
    const notesToInsert = [
      {
        topic_id: dbTopicId,
        title: titles[0],
        content: `### 💡 Concept Explanation\n${material.concept_explanation}\n\n---\n\n### 📌 Key Points\n${(material.key_points || []).map((p: string, i: number) => `* **${i + 1}.** ${p}`).join('\n')}\n\n---\n\n### 📚 Additional Resources\n* **Books:** ${(material.resources?.key_books || []).join(', ')}\n* **Search Terms:** ${(material.resources?.youtube_searches || []).map((s: string) => `\`${s}\``).join(', ')}`,
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

    const { data: savedNotes, error: notesError } = await supabase
      .from('notes')
      .insert(notesToInsert)
      .select()

    if (notesError) {
      console.error('Error inserting curated notes:', notesError)
      return NextResponse.json({ error: notesError.message }, { status: 500 })
    }

    // 4. Also add a summary personal user note
    const userNoteContent = `## 📖 ${prefix} Study Summary\n\n${material.concept_explanation}\n\n### Key Takeaways:\n${(material.key_points || []).slice(0, 4).map((k: string) => `• ${k}`).join('\n')}`

    await supabase.from('user_notes').insert({
      user_id: user.id,
      topic_id: dbTopicId,
      content: userNoteContent,
    })

    return NextResponse.json({
      success: true,
      message: 'Learning material successfully saved to Notes',
      notes: savedNotes,
    })
  } catch (err: unknown) {
    console.error('save-material-notes error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to save notes' },
      { status: 500 }
    )
  }
}
