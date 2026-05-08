'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { formatTime, getDifficultyBg } from '@/lib/utils'
import type { Question, Test } from '@/lib/types'

interface TestQuestion {
  id: string
  order_num: number
  question: Question
}

interface AnswerState {
  selected_option: string | null
  marked_review: boolean
  time_spent: number
}

export default function TestInterfacePage({ params }: { params: Promise<{ testId: string }> }) {
  const [test, setTest] = useState<Test | null>(null)
  const [questions, setQuestions] = useState<TestQuestion[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<string, AnswerState>>({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showSubmitDialog, setShowSubmitDialog] = useState(false)
  const [result, setResult] = useState<Record<string, unknown> | null>(null)
  const [questionStartTime, setQuestionStartTime] = useState(Date.now())
  const [testId, setTestId] = useState<string>('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    params.then((p) => setTestId(p.testId))
  }, [params])

  useEffect(() => {
    if (!testId) return
    const fetchTest = async () => {
      const { data: testData } = await supabase
        .from('tests')
        .select('*')
        .eq('id', testId)
        .single()

      if (!testData) { router.push('/test'); return }

      const { data: tqs } = await supabase
        .from('test_questions')
        .select('id, order_num, question:questions(*)')
        .eq('test_id', testId)
        .order('order_num')

      setTest(testData)
      setTimeLeft(testData.duration)
      const fetchedQuestions = (tqs as unknown as TestQuestion[]) || []
      setQuestions(fetchedQuestions)

      // Init answers
      const initAnswers: Record<string, AnswerState> = {}
      fetchedQuestions.forEach((tq) => {
        initAnswers[tq.question.id] = { selected_option: null, marked_review: false, time_spent: 0 }
      })
      setAnswers(initAnswers)
      setLoading(false)
    }
    fetchTest()
  }, [testId, router, supabase])

  // Countdown timer
  useEffect(() => {
    if (loading || result || timeLeft <= 0) return
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) { handleSubmit(); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [loading, result, timeLeft])

  const currentQuestion = questions[currentIdx]?.question

  const selectOption = (option: string) => {
    if (!currentQuestion) return
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: { ...prev[currentQuestion.id], selected_option: option },
    }))
  }

  const toggleReview = () => {
    if (!currentQuestion) return
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        ...prev[currentQuestion.id],
        marked_review: !prev[currentQuestion.id]?.marked_review,
      },
    }))
  }

  const goToQuestion = (idx: number) => {
    // Save time spent on current question
    if (currentQuestion) {
      const elapsed = Math.floor((Date.now() - questionStartTime) / 1000)
      setAnswers((prev) => ({
        ...prev,
        [currentQuestion.id]: {
          ...prev[currentQuestion.id],
          time_spent: (prev[currentQuestion.id]?.time_spent || 0) + elapsed,
        },
      }))
    }
    setCurrentIdx(idx)
    setQuestionStartTime(Date.now())
  }

  const handleSubmit = useCallback(async () => {
    if (submitting) return
    setSubmitting(true)
    setShowSubmitDialog(false)

    const submittedAnswers = Object.entries(answers).map(([question_id, ans]) => ({
      question_id,
      selected_option: ans.selected_option,
      time_spent: ans.time_spent,
      marked_review: ans.marked_review,
    }))

    const timeTaken = test ? test.duration - timeLeft : 0

    const res = await fetch('/api/submit-test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ testId, answers: submittedAnswers, timeTaken }),
    })
    const data = await res.json()

    if (res.ok && data.attemptId) {
      router.push(`/test/${testId}/results?attemptId=${data.attemptId}`)
    } else {
      alert('Failed to submit test. Please try again.')
      setSubmitting(false)
    }
  }, [answers, test, timeLeft, testId, submitting, router])

  const getNavClass = (idx: number) => {
    const q = questions[idx]?.question
    if (!q) return 'question-nav-btn unanswered'
    if (idx === currentIdx) return 'question-nav-btn current'
    const ans = answers[q.id]
    if (ans?.marked_review) return 'question-nav-btn review'
    if (ans?.selected_option) return 'question-nav-btn answered'
    return 'question-nav-btn unanswered'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: 'var(--bg-primary)' }}>
        <div className="text-center">
          <svg className="animate-spin w-12 h-12 mx-auto mb-4" viewBox="0 0 24 24" fill="none" style={{ color: '#6366f1' }}>
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          <p style={{ color: 'var(--text-secondary)' }}>Loading your test...</p>
        </div>
      </div>
    )
  }

  // Result is now shown on the /results page; show loading state while redirecting
  if (submitting && !showSubmitDialog) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: 'var(--bg-primary)' }}>
        <div className="text-center">
          <svg className="animate-spin w-12 h-12 mx-auto mb-4" viewBox="0 0 24 24" fill="none" style={{ color: '#6366f1' }}>
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          <p style={{ color: 'var(--text-secondary)' }}>Submitting your test...</p>
        </div>
      </div>
    )
  }

  if (!currentQuestion) return null

  const currentAnswer = answers[currentQuestion.id]
  const answeredCount = Object.values(answers).filter((a) => a.selected_option).length
  const reviewCount = Object.values(answers).filter((a) => a.marked_review).length

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      {/* Test Header */}
      <header className="h-14 glass border-b flex items-center justify-between px-6 shrink-0"
        style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-white">{test?.title}</span>
          <span className="badge badge-easy">Q {currentIdx + 1} / {questions.length}</span>
        </div>

        {/* Timer */}
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-bold text-lg ${
          timeLeft < 300 ? 'bg-red-500/10 border-red-500/20 text-red-400' :
          timeLeft < 600 ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
          'text-indigo-300'
        } border`}>
          ⏱ {formatTime(timeLeft)}
        </div>

        <button onClick={() => setShowSubmitDialog(true)}
          className="btn-primary text-sm px-4 py-2">
          Submit Test
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Question Panel */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Question meta */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className="badge badge-easy">{currentQuestion.subject}</span>
              <span className="text-xs px-2.5 py-1 rounded-lg border"
                style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)', color: 'var(--text-secondary)' }}>
                {currentQuestion.topic}
              </span>
              <span className={`badge ${getDifficultyBg(currentQuestion.difficulty)} border`}>
                {currentQuestion.difficulty}
              </span>
              {currentQuestion.year && (
                <span className="text-xs px-2.5 py-1 rounded-lg border"
                  style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)', color: 'var(--text-secondary)' }}>
                  GATE {currentQuestion.year}
                </span>
              )}
            </div>

            {/* Question text */}
            <div className="card p-6">
              <p className="text-white text-base leading-relaxed font-medium">
                {currentQuestion.question_text}
              </p>
            </div>

            {/* Options */}
            <div className="space-y-3">
              {Object.entries(currentQuestion.options).map(([key, text]) => (
                <button
                  key={key}
                  onClick={() => selectOption(key)}
                  className={`question-option w-full text-left ${currentAnswer?.selected_option === key ? 'selected' : ''}`}>
                  <div className={`w-8 h-8 rounded-lg border flex items-center justify-center text-sm font-bold shrink-0 ${
                    currentAnswer?.selected_option === key
                      ? 'border-indigo-400 text-indigo-300'
                      : 'border-slate-600 text-slate-400'
                  }`}
                    style={currentAnswer?.selected_option === key ? { background: 'rgba(99,102,241,0.15)' } : {}}>
                    {key}
                  </div>
                  <span className="text-sm leading-relaxed" style={{ color: currentAnswer?.selected_option === key ? '#f1f5f9' : 'var(--text-secondary)' }}>
                    {text}
                  </span>
                </button>
              ))}
            </div>

            {/* Question actions */}
            <div className="flex items-center justify-between">
              <button onClick={toggleReview}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                  currentAnswer?.marked_review
                    ? 'border-amber-500/30 text-amber-400'
                    : 'border-white/10 text-slate-400'
                }`}
                style={currentAnswer?.marked_review ? { background: 'rgba(245,158,11,0.1)' } : { background: 'rgba(255,255,255,0.04)' }}>
                🔖 {currentAnswer?.marked_review ? 'Marked for Review' : 'Mark for Review'}
              </button>

              <div className="flex gap-3">
                <button onClick={() => goToQuestion(Math.max(0, currentIdx - 1))}
                  disabled={currentIdx === 0}
                  className="btn-secondary px-4 py-2 text-sm disabled:opacity-40">
                  ← Prev
                </button>
                <button onClick={() => goToQuestion(Math.min(questions.length - 1, currentIdx + 1))}
                  disabled={currentIdx === questions.length - 1}
                  className="btn-primary px-4 py-2 text-sm disabled:opacity-40">
                  Next →
                </button>
              </div>
            </div>
          </div>
        </main>

        {/* Navigation Panel */}
        <aside className="w-56 border-l overflow-y-auto p-4 hidden lg:block"
          style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-secondary)' }}>
          <p className="text-xs font-semibold uppercase mb-3" style={{ color: 'var(--text-muted)' }}>Questions</p>

          <div className="grid grid-cols-5 gap-1.5 mb-4">
            {questions.map((_, idx) => (
              <button key={idx} onClick={() => goToQuestion(idx)} className={getNavClass(idx)}>
                {idx + 1}
              </button>
            ))}
          </div>

          {/* Legend */}
          <div className="space-y-2 mt-4 pt-4 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
            <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>Legend</p>
            {[
              { cls: 'question-nav-btn answered', label: 'Answered' },
              { cls: 'question-nav-btn unanswered', label: 'Not answered' },
              { cls: 'question-nav-btn review', label: 'Marked review' },
            ].map(({ cls, label }) => (
              <div key={label} className="flex items-center gap-2">
                <div className={`${cls} !w-6 !h-6 !text-xs pointer-events-none`}>{' '}</div>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</span>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="mt-4 pt-4 border-t space-y-2" style={{ borderColor: 'var(--border-subtle)' }}>
            <div className="flex justify-between text-xs">
              <span style={{ color: 'var(--text-muted)' }}>Answered</span>
              <span className="text-emerald-400 font-semibold">{answeredCount}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span style={{ color: 'var(--text-muted)' }}>Review</span>
              <span className="text-amber-400 font-semibold">{reviewCount}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span style={{ color: 'var(--text-muted)' }}>Skipped</span>
              <span className="text-slate-400 font-semibold">{questions.length - answeredCount}</span>
            </div>
          </div>
        </aside>
      </div>

      {/* Submit Dialog */}
      {showSubmitDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.8)' }}>
          <div className="card p-8 max-w-md w-full mx-4 animate-slide-up">
            <h3 className="text-xl font-bold text-white mb-2">Submit Test?</h3>
            <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
              You&apos;ve answered <strong className="text-white">{answeredCount}</strong> of <strong className="text-white">{questions.length}</strong> questions.
              {questions.length - answeredCount > 0 && <span className="text-amber-400"> {questions.length - answeredCount} unattempted.</span>}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowSubmitDialog(false)} className="btn-secondary flex-1 py-3">
                Continue Test
              </button>
              <button onClick={handleSubmit} disabled={submitting} className="btn-primary flex-1 py-3">
                {submitting ? 'Submitting...' : 'Submit & See Score'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
