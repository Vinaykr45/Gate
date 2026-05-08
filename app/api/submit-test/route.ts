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

    // Fetch correct answers and options for all questions in the test
    const questionIds = answers.map((a) => a.question_id)
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('id, correct_answer, options')
      .in('id', questionIds)

    if (questionsError) {
      return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 })
    }

    const questionMap = new Map(questions?.map((q) => [q.id, q]) || [])

    // Calculate scores
    let score = 0
    let correct = 0
    let incorrect = 0
    let unattempted = 0

    const processedAnswers = answers.map((answer) => {
      const q = questionMap.get(answer.question_id)
      const correctAnswer = q?.correct_answer
      const qOptions = q?.options as any
      const isMSQ = qOptions?._type === 'MSQ'
      const isNAT = qOptions?._type === 'NAT'

      let isCorrect = false

      if (answer.selected_option && correctAnswer && correctAnswer !== 'unknown') {
        if (isNAT) {
          // Check if NAT is a range e.g. "2.4-2.6" or "-1.5--1.0"
          // We can just use a simple regex or check if it's a direct match
          if (answer.selected_option === correctAnswer) {
            isCorrect = true
          } else {
            const parts = correctAnswer.split(/(?<!^)-/) // Split by '-' but not if it's the first char
            if (parts.length === 2) {
              const min = parseFloat(parts[0])
              const max = parseFloat(parts[1])
              const val = parseFloat(answer.selected_option)
              if (!isNaN(val) && val >= min && val <= max) {
                isCorrect = true
              }
            }
          }
        } else {
          // MCQ or MSQ
          isCorrect = answer.selected_option === correctAnswer
        }
      }

      if (!answer.selected_option) {
        unattempted++
      } else if (isCorrect) {
        correct++
        score += 1 // +1 for correct
      } else {
        incorrect++
        if (!isMSQ && !isNAT) {
          score -= 0.33 // -0.33 for incorrect MCQ. NAT and MSQ have NO negative marking in GATE
        }
      }

      return {
        question_id: answer.question_id,
        selected_option: answer.selected_option || null,
        is_correct: isCorrect,
        time_spent: answer.time_spent || 0,
        marked_review: answer.marked_review || false,
      }
    })

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
