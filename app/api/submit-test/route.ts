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

    const { testId, answers, timeTaken, attemptId } = await request.json() as {
      testId: string
      answers: SubmitAnswer[]
      timeTaken: number
      attemptId?: string
    }

    if (!testId || !answers || !Array.isArray(answers)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Idempotency check: if an existing completed attempt is referenced, return it directly
    if (attemptId) {
      const { data: existingAttempt } = await supabase
        .from('attempts')
        .select('*')
        .eq('id', attemptId)
        .eq('user_id', user.id)
        .eq('completed', true)
        .single()

      if (existingAttempt) {
        return NextResponse.json({
          success: true,
          attemptId: existingAttempt.id,
          score: existingAttempt.score,
          totalMarks: existingAttempt.total_marks,
          accuracy: existingAttempt.accuracy,
          timeTaken: existingAttempt.time_taken,
          isDuplicate: true,
        })
      }
    }

    // Verify test belongs to this user
    const { data: test, error: testError } = await supabase
      .from('tests')
      .select('*')
      .eq('id', testId)
      .eq('user_id', user.id)
      .single()

    if (testError || !test) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 })
    }

    // Fetch correct answers, options, and metadata
    const questionIds = answers.map((a) => a.question_id)
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('id, correct_answer, options, subject, topic, difficulty')
      .in('id', questionIds)

    if (questionsError) {
      return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 })
    }

    const questionMap = new Map(questions?.map((q) => [q.id, q]) || [])

    // Determine exam track & negative marking rules
    const examTrack = (test.exam_track || 'gate_cse').toLowerCase()
    let negMarkDeduction = 0.33

    if (examTrack === 'ca_foundation') {
      // CA Foundation Paper 3 & 4 have 0.25 negative marks
      negMarkDeduction = 0.25
    } else if (examTrack === 'ca_intermediate' || examTrack === 'ca_final') {
      // CA Inter & Final 30% MCQs have NO negative marking under ICAI New Scheme
      negMarkDeduction = 0.0
    }

    let score = 0
    let correct = 0
    let incorrect = 0
    let unattempted = 0
    const incorrectQuestionsToRevise: Array<{ questionId: string; subject: string; topic: string }> = []

    const processedAnswers = answers.map((answer) => {
      const q = questionMap.get(answer.question_id)
      const correctAnswer = q?.correct_answer
      const qOptions = q?.options as Record<string, unknown> | undefined
      const isMSQ = qOptions?._type === 'MSQ'
      const isNAT = qOptions?._type === 'NAT'

      let isCorrect = false

      if (answer.selected_option && correctAnswer && correctAnswer !== 'unknown') {
        if (isNAT) {
          if (answer.selected_option === correctAnswer) {
            isCorrect = true
          } else {
            const parts = correctAnswer.split(/(?<!^)-/)
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
          isCorrect = answer.selected_option.trim() === correctAnswer.trim()
        }
      }

      if (!answer.selected_option) {
        unattempted++
      } else if (isCorrect) {
        correct++
        score += 1 // Standard 1 mark
      } else {
        incorrect++
        if (!isMSQ && !isNAT) {
          score -= negMarkDeduction
        }
        if (q) {
          incorrectQuestionsToRevise.push({
            questionId: answer.question_id,
            subject: q.subject || 'Core',
            topic: q.topic || 'General',
          })
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
    const attemptedCount = correct + incorrect
    const accuracy = attemptedCount > 0 ? (correct / attemptedCount) * 100 : 0
    const normalizedScore = Math.max(0, parseFloat(score.toFixed(2)))

    // Create attempt record
    const { data: attempt, error: attemptError } = await supabase
      .from('attempts')
      .insert({
        user_id: user.id,
        test_id: testId,
        score: normalizedScore,
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

    // Insert answers
    const answersToInsert = processedAnswers.map((a) => ({
      ...a,
      attempt_id: attempt.id,
    }))

    await supabase.from('answers').insert(answersToInsert)

    // Automatically update student's Mistake Book / SRS if table exists
    if (incorrectQuestionsToRevise.length > 0) {
      for (const item of incorrectQuestionsToRevise) {
        try {
          await supabase
            .from('revision_items')
            .upsert(
              {
                user_id: user.id,
                question_id: item.questionId,
                exam_track: examTrack,
                subject: item.subject,
                topic: item.topic,
                mistake_count: 1,
                repetitions: 0,
                ease_factor: 2.50,
                interval_days: 1,
                last_reviewed: new Date().toISOString(),
                next_due_date: new Date(Date.now() + 86400000).toISOString(),
              },
              { onConflict: 'user_id,question_id' }
            )
        } catch {
          // Non-fatal if table not yet migrated
        }
      }
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
