import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface SubmitAnswer {
  question_id: string
  selected_option: string | null
  time_spent: number
  marked_review: boolean
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { testId, answers, timeTaken } = await request.json() as {
      testId: string
      answers: SubmitAnswer[]
      timeTaken: number
    }

    if (!testId || !answers || !Array.isArray(answers)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verify the test belongs to this user
    const { data: test, error: testError } = await supabase
      .from('tests')
      .select('*')
      .eq('id', testId)
      .eq('user_id', user.id)
      .single()

    if (testError || !test) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 })
    }

    // Fetch correct answers for all questions in the test
    const questionIds = answers.map((a) => a.question_id)
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('id, correct_answer')
      .in('id', questionIds)

    if (questionsError) {
      return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 })
    }

    const correctAnswerMap = new Map(questions?.map((q) => [q.id, q.correct_answer]) || [])

    // Calculate scores
    let correct = 0
    let incorrect = 0
    let unattempted = 0

    const processedAnswers = answers.map((answer) => {
      const correctAnswer = correctAnswerMap.get(answer.question_id)
      const isCorrect = correctAnswer && correctAnswer !== 'unknown'
        ? answer.selected_option === correctAnswer
        : false

      if (!answer.selected_option) {
        unattempted++
      } else if (isCorrect) {
        correct++
      } else {
        incorrect++
      }

      return {
        question_id: answer.question_id,
        selected_option: answer.selected_option || null,
        is_correct: isCorrect,
        time_spent: answer.time_spent || 0,
        marked_review: answer.marked_review || false,
      }
    })

    // GATE marking scheme: +1 for correct, -0.33 for incorrect (1-mark questions)
    const score = correct - (incorrect * 0.33)
    const totalMarks = answers.length
    const accuracy = answers.length > 0
      ? (correct / answers.filter((a) => a.selected_option).length) * 100 || 0
      : 0

    // Create attempt record
    const { data: attempt, error: attemptError } = await supabase
      .from('attempts')
      .insert({
        user_id: user.id,
        test_id: testId,
        score: Math.max(0, parseFloat(score.toFixed(2))),
        total_marks: totalMarks,
        accuracy: parseFloat(accuracy.toFixed(2)),
        time_taken: timeTaken || 0,
        completed: true,
        completed_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (attemptError) {
      console.error('Attempt insert error:', attemptError)
      return NextResponse.json({ error: 'Failed to save attempt' }, { status: 500 })
    }

    // Insert all answers
    const answersToInsert = processedAnswers.map((a) => ({
      ...a,
      attempt_id: attempt.id,
    }))

    const { error: answersError } = await supabase
      .from('answers')
      .insert(answersToInsert)

    if (answersError) {
      console.error('Answers insert error:', answersError)
    }

    return NextResponse.json({
      success: true,
      attemptId: attempt.id,
      score: attempt.score,
      totalMarks,
      accuracy: attempt.accuracy,
      correct,
      incorrect,
      unattempted,
      timeTaken,
    })
  } catch (error) {
    console.error('Submit test route error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
