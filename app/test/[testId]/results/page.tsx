'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, XCircle, MinusCircle, Clock, Target, Award, RotateCcw, Loader2 } from 'lucide-react'

interface Question {
  id: string; question_text: string; options: Record<string, string>
  correct_answer: string; subject: string; topic: string
  difficulty: string; explanation?: string
}
interface Answer {
  question_id: string; selected_option?: string; is_correct: boolean
  time_spent: number; marked_review: boolean; question: Question
}
interface Attempt {
  id: string; score: number; total_marks: number; accuracy: number
  time_taken: number; completed: boolean
}
interface Test { id: string; title: string; type: string }
interface SolutionData { attempt: Attempt; test: Test; answers: Answer[] }

function ResultsContent({ params }: { params: Promise<{ testId: string }> }) {
  const searchParams = useSearchParams()
  const attemptId = searchParams.get('attemptId')
  const [data, setData] = useState<SolutionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'correct' | 'wrong' | 'skipped'>('all')

  useEffect(() => {
    if (!attemptId) return
    fetch(`/api/test-solution?attemptId=${attemptId}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [attemptId])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto flex flex-col items-center justify-center py-24 gap-4">
        <Loader2 className="w-10 h-10 animate-spin" style={{ color: '#a5b4fc' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Generating AI explanations...</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="max-w-4xl mx-auto text-center py-24">
        <p style={{ color: 'var(--text-muted)' }}>Results not found. <Link href="/test" className="text-indigo-400">Go back</Link></p>
      </div>
    )
  }

  const { attempt, test, answers } = data
  const correct = answers.filter(a => a.is_correct).length
  const wrong = answers.filter(a => !a.is_correct && a.selected_option).length
  const skipped = answers.filter(a => !a.selected_option).length
  const mins = Math.floor(attempt.time_taken / 60)
  const secs = attempt.time_taken % 60

  const filtered = answers.filter(a => {
    if (filter === 'correct') return a.is_correct
    if (filter === 'wrong') return !a.is_correct && a.selected_option
    if (filter === 'skipped') return !a.selected_option
    return true
  })

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      {/* Score Summary Card */}
      <div className="card p-8 text-center" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.08))' }}>
        <div className="text-5xl mb-2 font-black gradient-text">{attempt.accuracy.toFixed(1)}%</div>
        <div className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{test.title}</div>
        <div className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
          Score: {attempt.score.toFixed(2)} / {attempt.total_marks.toFixed(0)} · Time: {mins}m {secs}s
        </div>

        <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto">
          {[
            { label: 'Correct', value: correct, icon: <CheckCircle2 className="w-5 h-5" />, color: '#10b981' },
            { label: 'Wrong', value: wrong, icon: <XCircle className="w-5 h-5" />, color: '#ef4444' },
            { label: 'Skipped', value: skipped, icon: <MinusCircle className="w-5 h-5" />, color: '#94a3b8' },
          ].map(item => (
            <div key={item.label} className="rounded-xl p-3" style={{ background: `${item.color}10`, border: `1px solid ${item.color}20` }}>
              <div style={{ color: item.color }}>{item.icon}</div>
              <div className="text-2xl font-bold mt-1" style={{ color: item.color }}>{item.value}</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.label}</div>
            </div>
          ))}
        </div>

        <div className="flex justify-center gap-3 mt-6">
          <Link href="/test" className="btn-secondary text-sm px-5 py-2">
            <RotateCcw className="w-4 h-4" /> New Test
          </Link>
          <Link href="/analytics" className="btn-primary text-sm px-5 py-2">
            <Target className="w-4 h-4" /> View Analytics
          </Link>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {([
          { id: 'all', label: `All (${answers.length})` },
          { id: 'correct', label: `✅ Correct (${correct})` },
          { id: 'wrong', label: `❌ Wrong (${wrong})` },
          { id: 'skipped', label: `⬜ Skipped (${skipped})` },
        ] as const).map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
              filter === f.id ? 'text-white' : ''
            }`}
            style={filter === f.id
              ? { background: 'var(--brand-gradient)' }
              : { background: 'rgba(255,255,255,0.04)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }
            }>
            {f.label}
          </button>
        ))}
      </div>

      {/* Question Solutions */}
      <div className="space-y-5">
        {filtered.map((answer, idx) => {
          const q = answer.question
          const isCorrect = answer.is_correct
          const isSkipped = !answer.selected_option
          const statusColor = isCorrect ? '#10b981' : isSkipped ? '#94a3b8' : '#ef4444'

          return (
            <div key={answer.question_id} className="card overflow-hidden">
              {/* Question header */}
              <div className="px-6 py-4 border-b flex items-center justify-between gap-4"
                style={{ borderColor: 'var(--border-subtle)', borderLeft: `3px solid ${statusColor}` }}>
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-sm font-bold shrink-0" style={{ color: 'var(--text-muted)' }}>Q{idx + 1}</span>
                  <div className={`badge ${q.difficulty === 'easy' ? 'badge-easy' : q.difficulty === 'hard' ? 'badge-hard' : 'badge-medium'}`}>
                    {q.difficulty}
                  </div>
                  <span className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{q.topic}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                  {!isCorrect && !isSkipped && <XCircle className="w-5 h-5 text-red-400" />}
                  {isSkipped && <MinusCircle className="w-5 h-5 text-slate-500" />}
                  {answer.time_spent > 0 && (
                    <span className="text-xs flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                      <Clock className="w-3 h-3" /> {answer.time_spent}s
                    </span>
                  )}
                </div>
              </div>

              <div className="p-6 space-y-4">
                {/* Question text */}
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                  {q.question_text}
                </p>

                {/* Options */}
                <div className="grid gap-2">
                  {Object.entries(q.options).map(([key, value]) => {
                    const isChosen = answer.selected_option === key
                    const isRight = q.correct_answer === key
                    let optionStyle = {}
                    let labelStyle = { color: 'var(--text-secondary)' }

                    if (isRight) {
                      optionStyle = { borderColor: 'rgba(16,185,129,0.5)', background: 'rgba(16,185,129,0.06)' }
                      labelStyle = { color: '#10b981' }
                    } else if (isChosen && !isCorrect) {
                      optionStyle = { borderColor: 'rgba(239,68,68,0.5)', background: 'rgba(239,68,68,0.06)' }
                      labelStyle = { color: '#ef4444' }
                    }

                    return (
                      <div key={key}
                        className="flex items-start gap-3 p-3 rounded-xl border transition-all"
                        style={{ borderColor: 'var(--border-subtle)', ...optionStyle }}>
                        <span className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                          style={{ background: isRight ? 'rgba(16,185,129,0.15)' : isChosen && !isCorrect ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.06)', ...labelStyle }}>
                          {key}
                        </span>
                        <span className="text-sm leading-relaxed" style={labelStyle}>{value}</span>
                        {isRight && <CheckCircle2 className="w-4 h-4 ml-auto shrink-0 text-emerald-400 mt-0.5" />}
                        {isChosen && !isCorrect && <XCircle className="w-4 h-4 ml-auto shrink-0 text-red-400 mt-0.5" />}
                      </div>
                    )
                  })}
                </div>

                {/* Explanation */}
                {q.explanation && (
                  <div className="rounded-xl p-4" style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="w-4 h-4 text-indigo-400" />
                      <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Explanation</span>
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                      {q.explanation}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function TestResultsPage({ params }: { params: Promise<{ testId: string }> }) {
  return (
    <Suspense fallback={
      <div className="max-w-4xl mx-auto flex items-center justify-center py-24">
        <Loader2 className="w-10 h-10 animate-spin" style={{ color: '#a5b4fc' }} />
      </div>
    }>
      <ResultsContent params={params} />
    </Suspense>
  )
}
