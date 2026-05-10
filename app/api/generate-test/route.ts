import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { type, subject, topic, count = 30, difficulty } = await request.json()

    const validTypes = ['topic', 'subject', 'full']
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: 'Invalid test type' }, { status: 400 })
    }

    // Build question query
    let query = supabase.from('questions').select('*')

    if (type === 'topic') {
      // Filter by subject first, then topic (exact match from DB values)
      if (subject) query = query.eq('subject', subject)
      if (topic) query = query.eq('topic', topic)
    } else if (type === 'subject' && subject) {
      query = query.eq('subject', subject)
    }
    // type === 'full' → no filter, all subjects

    if (difficulty) {
      query = query.eq('difficulty', difficulty)
    }

    const requestedCount = Math.min(Math.max(parseInt(count) || 30, 5), 65)
    query = query.limit(requestedCount * 3) // Fetch more, then randomly select

    const { data: questions, error: questionError } = await query

    if (questionError) {
      console.error('Question fetch error:', questionError)
      return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 })
    }

    if (!questions || questions.length === 0) {
      return NextResponse.json({
        error: 'No questions found for the selected criteria. Try uploading some GATE questions first.'
      }, { status: 404 })
    }

    // Adaptive shuffling: mix difficulties
    const shuffled = shuffleWithDiversityBias(questions, requestedCount)

    // Generate test title
    const title = generateTestTitle(type, subject, topic)

    // Create test record
    const { data: test, error: testError } = await supabase
      .from('tests')
      .insert({
        user_id: user.id,
        title,
        type,
        subject: subject || null,
        topic: topic || null,
        duration: Math.round(shuffled.length * (10800 / 65)),
        question_count: shuffled.length,
      })
      .select()
      .single()

    if (testError) {
      console.error('Test creation error:', testError)
      return NextResponse.json({ error: 'Failed to create test' }, { status: 500 })
    }

    // Create test_questions records
    const testQuestions = shuffled.map((q, idx) => ({
      test_id: test.id,
      question_id: q.id,
      order_num: idx,
    }))

    const { error: tqError } = await supabase
      .from('test_questions')
      .insert(testQuestions)

    if (tqError) {
      console.error('Test questions error:', tqError)
      // Cleanup test
      await supabase.from('tests').delete().eq('id', test.id)
      return NextResponse.json({ error: 'Failed to setup test questions' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      testId: test.id,
      title: test.title,
      questionCount: shuffled.length,
      duration: test.duration,
    })
  } catch (error) {
    console.error('Generate test route error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function shuffleWithDiversityBias(questions: Record<string, unknown>[], count: number): Record<string, unknown>[] {
  // Group by difficulty
  const easy = questions.filter((q) => q.difficulty === 'easy')
  const medium = questions.filter((q) => q.difficulty === 'medium')
  const hard = questions.filter((q) => q.difficulty === 'hard')

  // Approximate GATE distribution: 30% easy, 50% medium, 20% hard
  const easyCount = Math.min(Math.round(count * 0.3), easy.length)
  const hardCount = Math.min(Math.round(count * 0.2), hard.length)
  const mediumCount = Math.min(count - easyCount - hardCount, medium.length)

  const selected = [
    ...shuffleArray(easy).slice(0, easyCount),
    ...shuffleArray(medium).slice(0, mediumCount),
    ...shuffleArray(hard).slice(0, hardCount),
  ]

  // Fill remaining from any difficulty if needed
  if (selected.length < count) {
    const remaining = questions.filter((q) => !selected.includes(q))
    selected.push(...shuffleArray(remaining).slice(0, count - selected.length))
  }

  return shuffleArray(selected).slice(0, count)
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

function generateTestTitle(type: string, subject?: string, topic?: string): string {
  const date = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
  if (type === 'full') return `Full GATE Mock Test — ${date}`
  if (type === 'subject') return `${subject || 'Subject'} Test — ${date}`
  if (type === 'topic') return `${topic || 'Topic'} Quiz — ${date}`
  return `Test — ${date}`
}
