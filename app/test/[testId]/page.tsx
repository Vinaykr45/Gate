'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { formatTime, getDifficultyBg } from '@/lib/utils'
import type { Question, Test } from '@/lib/types'
import { ChevronLeft, ChevronRight, Bookmark, Send, Grid3X3, X } from 'lucide-react'

interface TestQuestion { id: string; order_num: number; question: Question }
interface AnswerState { selected_option: string | null; marked_review: boolean; time_spent: number }

export default function TestInterfacePage({ params }: { params: Promise<{ testId: string }> }) {
  const [test, setTest] = useState<Test | null>(null)
  const [questions, setQuestions] = useState<TestQuestion[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<string, AnswerState>>({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showSubmitDialog, setShowSubmitDialog] = useState(false)
  const [showNavPanel, setShowNavPanel] = useState(false)
  const [questionStartTime, setQuestionStartTime] = useState(Date.now())
  const [testId, setTestId] = useState<string>('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => { params.then((p) => setTestId(p.testId)) }, [params])

  useEffect(() => {
    if (!testId) return
    const fetchTest = async () => {
      const { data: testData } = await supabase.from('tests').select('*').eq('id', testId).single()
      if (!testData) { router.push('/test'); return }
      const { data: tqs } = await supabase
        .from('test_questions').select('id, order_num, question:questions(*)')
        .eq('test_id', testId).order('order_num')
      setTest(testData)
      setTimeLeft(testData.duration)
      const fetchedQuestions = (tqs as unknown as TestQuestion[]) || []
      setQuestions(fetchedQuestions)
      const initAnswers: Record<string, AnswerState> = {}
      fetchedQuestions.forEach((tq) => {
        initAnswers[tq.question.id] = { selected_option: null, marked_review: false, time_spent: 0 }
      })
      setAnswers(initAnswers)
      setLoading(false)
    }
    fetchTest()
  }, [testId, router, supabase])

  useEffect(() => {
    if (loading || timeLeft <= 0) return
    const interval = setInterval(() => {
      setTimeLeft((prev) => { if (prev <= 1) { handleSubmit(); return 0 } return prev - 1 })
    }, 1000)
    return () => clearInterval(interval)
  }, [loading, timeLeft])

  const currentQuestion = questions[currentIdx]?.question

  const selectOption = (option: string) => {
    if (!currentQuestion) return
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: { ...prev[currentQuestion.id], selected_option: option } }))
  }

  const toggleReview = () => {
    if (!currentQuestion) return
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: { ...prev[currentQuestion.id], marked_review: !prev[currentQuestion.id]?.marked_review } }))
  }

  const goToQuestion = (idx: number) => {
    if (currentQuestion) {
      const elapsed = Math.floor((Date.now() - questionStartTime) / 1000)
      setAnswers((prev) => ({ ...prev, [currentQuestion.id]: { ...prev[currentQuestion.id], time_spent: (prev[currentQuestion.id]?.time_spent || 0) + elapsed } }))
    }
    setCurrentIdx(idx)
    setQuestionStartTime(Date.now())
    setShowNavPanel(false)
  }

  const handleSubmit = useCallback(async () => {
    if (submitting) return
    setSubmitting(true)
    setShowSubmitDialog(false)
    const submittedAnswers = Object.entries(answers).map(([question_id, ans]) => ({
      question_id, selected_option: ans.selected_option, time_spent: ans.time_spent, marked_review: ans.marked_review,
    }))
    const timeTaken = test ? test.duration - timeLeft : 0
    const res = await fetch('/api/submit-test', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
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

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <div className="text-center space-y-3">
        <div className="w-12 h-12 border-4 rounded-full mx-auto animate-spin" style={{ borderColor: 'rgba(99,102,241,0.2)', borderTopColor: '#6366f1' }} />
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Loading your test…</p>
      </div>
    </div>
  )

  if (submitting && !showSubmitDialog) return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <div className="text-center space-y-3">
        <div className="w-12 h-12 border-4 rounded-full mx-auto animate-spin" style={{ borderColor: 'rgba(16,185,129,0.2)', borderTopColor: '#10b981' }} />
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Submitting your test…</p>
      </div>
    </div>
  )

  if (!currentQuestion) return null

  const currentAnswer = answers[currentQuestion.id]
  const answeredCount = Object.values(answers).filter((a) => a.selected_option).length
  const reviewCount = Object.values(answers).filter((a) => a.marked_review).length
  const isLowTime = timeLeft < 300
  const isWarnTime = timeLeft < 600

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: 'var(--bg-primary)' }}>

      {/* ── Header ── */}
      <header className="shrink-0 border-b px-3 sm:px-6 h-14 flex items-center justify-between gap-2"
        style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}>

        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs sm:text-sm font-semibold truncate max-w-[120px] sm:max-w-xs" style={{ color: 'var(--text-primary)' }}>
            {test?.title}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full font-semibold shrink-0"
            style={{ background: 'rgba(99,102,241,0.12)', color: '#6366f1', border: '1px solid rgba(99,102,241,0.2)' }}>
            {currentIdx + 1}/{questions.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Timer */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono font-bold text-sm border shrink-0`}
            style={isLowTime
              ? { background: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.3)', color: '#ef4444' }
              : isWarnTime
              ? { background: 'rgba(245,158,11,0.1)', borderColor: 'rgba(245,158,11,0.3)', color: '#f59e0b' }
              : { background: 'rgba(99,102,241,0.08)', borderColor: 'rgba(99,102,241,0.2)', color: '#6366f1' }
            }>
            ⏱ {formatTime(timeLeft)}
          </div>

          {/* Mobile nav toggle */}
          <button onClick={() => setShowNavPanel(true)}
            className="lg:hidden p-2 rounded-lg border transition-colors"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}>
            <Grid3X3 className="w-4 h-4" />
          </button>

          <button onClick={() => setShowSubmitDialog(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold text-white shrink-0 transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Submit</span>
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">

        {/* ── Main Question Area ── */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-5">

            {/* Question Meta */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs px-2.5 py-1 rounded-lg font-semibold"
                style={{ background: 'rgba(99,102,241,0.1)', color: '#6366f1', border: '1px solid rgba(99,102,241,0.2)' }}>
                {currentQuestion.subject}
              </span>
              <span className="text-xs px-2.5 py-1 rounded-lg border"
                style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}>
                {currentQuestion.topic}
              </span>
              <span className={`badge ${getDifficultyBg(currentQuestion.difficulty)} border text-xs`}>
                {currentQuestion.difficulty}
              </span>
              {currentQuestion.year && (
                <span className="text-xs px-2.5 py-1 rounded-lg border"
                  style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}>
                  GATE {currentQuestion.year}
                </span>
              )}
            </div>

            {/* Question Text */}
            <div className="rounded-2xl border p-5 sm:p-6"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
              <div className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
                Question {currentIdx + 1}
              </div>
              <p className="text-base leading-relaxed font-medium" style={{ color: 'var(--text-primary)' }}>
                {currentQuestion.question_text}
              </p>
            </div>

            {/* Options */}
            <div className="space-y-2.5">
              {Object.entries(currentQuestion.options).map(([key, text]) => {
                const isSelected = currentAnswer?.selected_option === key
                return (
                  <button
                    key={key}
                    onClick={() => selectOption(key)}
                    className="w-full text-left flex items-start gap-3 p-4 rounded-xl border transition-all duration-150 hover:scale-[1.005]"
                    style={isSelected ? {
                      background: 'rgba(99,102,241,0.1)',
                      borderColor: '#6366f1',
                      boxShadow: '0 0 0 1px rgba(99,102,241,0.3)',
                    } : {
                      background: 'var(--bg-card)',
                      borderColor: 'var(--border-subtle)',
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black shrink-0"
                      style={isSelected ? {
                        background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                        color: 'white',
                      } : {
                        background: 'var(--bg-secondary)',
                        color: 'var(--text-muted)',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      {key}
                    </div>
                    <span className="text-sm leading-relaxed pt-1"
                      style={{ color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                      {text as string}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Actions Row */}
            <div className="flex items-center justify-between gap-3 pt-1">
              <button
                onClick={toggleReview}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border transition-all"
                style={currentAnswer?.marked_review ? {
                  background: 'rgba(245,158,11,0.1)',
                  borderColor: 'rgba(245,158,11,0.3)',
                  color: '#f59e0b',
                } : {
                  background: 'var(--bg-card)',
                  borderColor: 'var(--border-subtle)',
                  color: 'var(--text-muted)',
                }}
              >
                <Bookmark className={`w-4 h-4 ${currentAnswer?.marked_review ? 'fill-current' : ''}`} />
                <span className="hidden sm:inline">{currentAnswer?.marked_review ? 'Marked' : 'Mark Review'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => goToQuestion(Math.max(0, currentIdx - 1))}
                  disabled={currentIdx === 0}
                  className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium border transition-all disabled:opacity-30"
                  style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}
                >
                  <ChevronLeft className="w-4 h-4" /> Prev
                </button>
                <button
                  onClick={() => goToQuestion(Math.min(questions.length - 1, currentIdx + 1))}
                  disabled={currentIdx === questions.length - 1}
                  className="flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-30"
                  style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </main>

        {/* ── Desktop Nav Sidebar ── */}
        <aside className="hidden lg:flex flex-col w-56 border-l overflow-y-auto p-4 shrink-0"
          style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}>
          <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
            Questions
          </p>
          <div className="grid grid-cols-5 gap-1.5 mb-5">
            {questions.map((_, idx) => (
              <button key={idx} onClick={() => goToQuestion(idx)} className={getNavClass(idx)}>
                {idx + 1}
              </button>
            ))}
          </div>

          {/* Legend */}
          <div className="space-y-2 pt-4 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
            <p className="text-xs font-bold mb-2" style={{ color: 'var(--text-muted)' }}>Legend</p>
            {[
              { cls: 'question-nav-btn answered', label: 'Answered' },
              { cls: 'question-nav-btn unanswered', label: 'Not answered' },
              { cls: 'question-nav-btn review', label: 'Marked review' },
            ].map(({ cls, label }) => (
              <div key={label} className="flex items-center gap-2">
                <div className={`${cls} !w-6 !h-6 !text-xs pointer-events-none`}> </div>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</span>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="mt-4 pt-4 border-t space-y-2" style={{ borderColor: 'var(--border-subtle)' }}>
            {[
              { label: 'Answered', value: answeredCount, color: '#10b981' },
              { label: 'Review', value: reviewCount, color: '#f59e0b' },
              { label: 'Skipped', value: questions.length - answeredCount, color: 'var(--text-muted)' },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex justify-between text-xs">
                <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                <span className="font-bold" style={{ color }}>{value}</span>
              </div>
            ))}
          </div>
        </aside>
      </div>

      {/* ── Mobile Navigation Drawer ── */}
      {showNavPanel && (
        <>
          <div className="fixed inset-0 z-40 lg:hidden" style={{ background: 'rgba(0,0,0,0.5)' }}
            onClick={() => setShowNavPanel(false)} />
          <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden rounded-t-2xl p-5 max-h-[80vh] overflow-y-auto"
            style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-subtle)' }}>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                All Questions
              </p>
              <button onClick={() => setShowNavPanel(false)}
                className="p-1 rounded-lg" style={{ color: 'var(--text-muted)' }}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-7 gap-2 mb-4">
              {questions.map((_, idx) => (
                <button key={idx} onClick={() => goToQuestion(idx)} className={getNavClass(idx)}>
                  {idx + 1}
                </button>
              ))}
            </div>
            <div className="flex gap-4 pt-3 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
              <span className="text-xs" style={{ color: '#10b981' }}>✓ {answeredCount} answered</span>
              <span className="text-xs" style={{ color: '#f59e0b' }}>🔖 {reviewCount} review</span>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>— {questions.length - answeredCount} skipped</span>
            </div>
          </div>
        </>
      )}

      {/* ── Submit Dialog ── */}
      {showSubmitDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="rounded-2xl border p-6 sm:p-8 max-w-md w-full animate-slide-up"
            style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
            <div className="text-4xl mb-4">📋</div>
            <h3 className="text-xl font-black mb-2" style={{ color: 'var(--text-primary)' }}>Submit Test?</h3>
            <p className="mb-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
              You&apos;ve answered <strong style={{ color: 'var(--text-primary)' }}>{answeredCount}</strong> of{' '}
              <strong style={{ color: 'var(--text-primary)' }}>{questions.length}</strong> questions.
            </p>
            {questions.length - answeredCount > 0 && (
              <p className="text-sm mb-5" style={{ color: '#f59e0b' }}>
                ⚠️ {questions.length - answeredCount} questions are unattempted and will be skipped.
              </p>
            )}
            <div className="flex gap-3">
              <button onClick={() => setShowSubmitDialog(false)}
                className="flex-1 py-3 rounded-xl text-sm font-semibold border transition-all"
                style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}>
                Continue Test
              </button>
              <button onClick={handleSubmit} disabled={submitting}
                className="flex-1 py-3 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
                {submitting ? 'Submitting…' : 'Submit & See Score'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
