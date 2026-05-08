import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateQuestionsFromTopicContent } from '@/lib/gemini/generate-questions'

/**
 * POST /api/generate-test/from-learning
 *
 * Generates GATE-style questions using Gemini AI from Learning Hub
 * notes and video content for a specific topic — no PYQ upload needed.
 *
 * Body: { topic_id: string, count?: number }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { topic_id, count = 10 } = await request.json()

    if (!topic_id) {
      return NextResponse.json({ error: 'topic_id is required' }, { status: 400 })
    }

    const questionCount = Math.min(Math.max(parseInt(count) || 10, 3), 30)

    // ── 1. Fetch topic metadata ──────────────────────────────────
    const { data: topic, error: topicError } = await supabase
      .from('learning_topics')
      .select('*')
      .eq('id', topic_id)
      .single()

    if (topicError || !topic) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 })
    }

    // ── 2. Fetch curated notes for this topic ────────────────────
    const { data: notes } = await supabase
      .from('notes')
      .select('title, content')
      .eq('topic_id', topic_id)
      .order('order_num')

    // ── 3. Fetch video titles for this topic ─────────────────────
    const { data: videos } = await supabase
      .from('videos')
      .select('title')
      .eq('topic_id', topic_id)
      .order('order_num')

    // ── 4. Also fetch user's personal notes (extra context) ──────
    const { data: userNotes } = await supabase
      .from('user_notes')
      .select('content')
      .eq('topic_id', topic_id)
      .eq('user_id', user.id)

    // Merge all notes content
    const allNotes = [
      ...(notes ?? []),
      ...(userNotes ?? []).map((un) => ({ title: 'Personal Note', content: un.content })),
    ]

    // ── 5. Generate questions via Gemini ─────────────────────────
    const generated = await generateQuestionsFromTopicContent({
      subject: topic.subject,
      topic: topic.topic,
      subtopic: topic.subtopic,
      description: topic.description,
      notes: allNotes,
      videoTitles: (videos ?? []).map((v) => v.title),
      count: questionCount,
    })

    if (!generated || generated.length === 0) {
      return NextResponse.json(
        { error: 'Gemini could not generate questions. Please ensure notes are added to this topic.' },
        { status: 422 },
      )
    }

    // ── 6. Save generated questions to the questions table ────────
    const questionsToInsert = generated.map((q) => ({
      question_text: q.question_text,
      options: q.options,
      correct_answer: q.correct_answer,
      subject: q.subject,
      topic: q.topic,
      difficulty: q.difficulty,
      explanation: q.explanation ?? null,
      source_file: `learning_hub:${topic_id}`,
      is_verified: false,
      created_by: user.id,
    }))

    const { data: savedQuestions, error: saveError } = await supabase
      .from('questions')
      .insert(questionsToInsert)
      .select('id, difficulty')

    if (saveError || !savedQuestions || savedQuestions.length === 0) {
      console.error('Failed to save generated questions:', saveError)
      return NextResponse.json({ error: 'Failed to save questions' }, { status: 500 })
    }

    // ── 7. Create a test record ───────────────────────────────────
    const testTitle = `${topic.subtopic} — AI Practice Quiz`
    const { data: test, error: testError } = await supabase
      .from('tests')
      .insert({
        user_id: user.id,
        title: testTitle,
        type: 'topic',
        subject: topic.subject,
        topic: `${topic.topic} - ${topic.subtopic}`,
        duration: Math.max(savedQuestions.length * 120, 600), // 2 min/question, min 10 min
        question_count: savedQuestions.length,
      })
      .select()
      .single()

    if (testError || !test) {
      console.error('Test creation error:', testError)
      // Cleanup saved questions
      await supabase
        .from('questions')
        .delete()
        .in('id', savedQuestions.map((q) => q.id))
      return NextResponse.json({ error: 'Failed to create test' }, { status: 500 })
    }

    // ── 8. Link questions to test ─────────────────────────────────
    const testQuestions = savedQuestions.map((q, idx) => ({
      test_id: test.id,
      question_id: q.id,
      order_num: idx,
    }))

    const { error: tqError } = await supabase.from('test_questions').insert(testQuestions)

    if (tqError) {
      console.error('Test questions link error:', tqError)
      await supabase.from('tests').delete().eq('id', test.id)
      return NextResponse.json({ error: 'Failed to link questions to test' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      testId: test.id,
      title: testTitle,
      questionCount: savedQuestions.length,
      duration: test.duration,
      topic: topic.subtopic,
      generatedFrom: 'learning_hub',
    })
  } catch (error) {
    console.error('from-learning route error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
