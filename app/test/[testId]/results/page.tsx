'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  CheckCircle2, XCircle, MinusCircle, Clock, Target,
  RotateCcw, Loader2, Lightbulb, TrendingUp, BookOpen,
  ChevronDown, ChevronUp, Award,
} from 'lucide-react'

interface Question {
  id: string; question_text: string; options: Record<string, string>
  correct_answer: string; subject: string; topic: string
  difficulty: string; explanation?: string | Record<string, string>; year?: number
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

/** Safely extract explanation string whether it's a string or an object */
function getExplanationText(exp: string | Record<string, string> | undefined | null): string {
  if (!exp) return ''
  if (typeof exp === 'string') {
    // Try to parse if it looks like JSON
    let trimmed = exp.trim()
    if (trimmed.startsWith('```json')) trimmed = trimmed.replace(/^```json/i, '')
    if (trimmed.startsWith('```')) trimmed = trimmed.replace(/^```/, '')
    if (trimmed.endsWith('```')) trimmed = trimmed.replace(/```$/, '')
    trimmed = trimmed.trim()
    
    if (trimmed.startsWith('{')) {
      try {
        const parsed = JSON.parse(trimmed)
        return parsed.explanation || parsed.text || parsed.content || Object.values(parsed)[0] || exp
      } catch {
        // Regex fallback for truncated JSON strings
        const match = trimmed.match(/"(?:explanation|text|content)"\s*:\s*"([^]+)/i)
        if (match && match[1]) {
           let val = match[1]
           if (val.endsWith('"}')) val = val.slice(0, -2)
           else if (val.endsWith('"')) val = val.slice(0, -1)
           // Clean up any remaining escaped newlines or quotes
           return val.replace(/\\n/g, '\n').replace(/\\"/g, '"')
        }
        return exp
      }
    }
    return trimmed
  }
  if (typeof exp === 'object') {
    return exp.explanation || exp.text || exp.content || Object.values(exp)[0] || ''
  }
  return String(exp)
}

function QuestionCard({ answer, idx }: { answer: Answer; idx: number }) {
  const [expanded, setExpanded] = useState(false)
  const q = answer.question
  const isCorrect = answer.is_correct
  const isSkipped = !answer.selected_option

  const statusColor = isCorrect ? '#10b981' : isSkipped ? '#94a3b8' : '#ef4444'
  const statusBg = isCorrect ? 'rgba(16,185,129,0.08)' : isSkipped ? 'rgba(148,163,184,0.08)' : 'rgba(239,68,68,0.08)'
  const StatusIcon = isCorrect ? CheckCircle2 : isSkipped ? MinusCircle : XCircle
  const statusLabel = isCorrect ? 'Correct' : isSkipped ? 'Skipped' : 'Wrong'

  const explanationText = getExplanationText(q.explanation)

  const difficultyStyle = {
    easy: { bg: 'rgba(16,185,129,0.1)', color: '#10b981', border: 'rgba(16,185,129,0.2)' },
    medium: { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: 'rgba(245,158,11,0.2)' },
    hard: { bg: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'rgba(239,68,68,0.2)' },
  }[q.difficulty] || { bg: 'rgba(99,102,241,0.1)', color: '#6366f1', border: 'rgba(99,102,241,0.2)' }

  return (
    <div className="rounded-2xl border overflow-hidden transition-all duration-200"
      style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}>

      {/* ── Status stripe + header ── */}
      <div className="flex items-center gap-3 px-4 sm:px-5 py-3.5 border-b"
        style={{ borderLeftWidth: 4, borderLeftColor: statusColor, borderBottomColor: 'var(--border-subtle)', background: statusBg }}>

        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-xs font-black w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: statusColor + '20', color: statusColor }}>
            {idx + 1}
          </span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full border"
            style={{ background: difficultyStyle.bg, color: difficultyStyle.color, borderColor: difficultyStyle.border }}>
            {q.difficulty}
          </span>
          <span className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{q.topic}</span>
          {q.year && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full border shrink-0"
              style={{ background: 'var(--bg-card)', color: 'var(--text-muted)', borderColor: 'var(--border-subtle)' }}>
              GATE {q.year}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {answer.time_spent > 0 && (
            <span className="text-xs flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
              <Clock className="w-3 h-3" />{answer.time_spent}s
            </span>
          )}
          <div className="flex items-center gap-1 text-xs font-semibold" style={{ color: statusColor }}>
            <StatusIcon className="w-4 h-4" />
            <span className="hidden sm:inline">{statusLabel}</span>
          </div>
        </div>
      </div>

      {/* ── Collapsed: toggle ── */}
      <button onClick={() => setExpanded(e => !e)}
        className="w-full text-left px-4 sm:px-5 py-4 flex items-start gap-3 hover:bg-white/[0.02] transition-colors">
        <p className="text-sm leading-relaxed flex-1" style={{ color: 'var(--text-primary)' }}>
          {q.question_text}
        </p>
        <div className="shrink-0 mt-0.5" style={{ color: 'var(--text-muted)' }}>
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* ── Expanded content ── */}
      {expanded && (
        <div className="px-4 sm:px-5 pb-5 space-y-4 border-t" style={{ borderColor: 'var(--border-subtle)' }}>

          {/* Options */}
          <div className="pt-4 space-y-2">
            {Object.entries(q.options).map(([key, value]) => {
              if (key === '_type') return null
              
              const isMSQ = q.options._type === 'MSQ'
              const chosenArr = answer.selected_option ? answer.selected_option.split(',') : []
              const rightArr = q.correct_answer ? q.correct_answer.split(',') : []
              
              const isChosen = isMSQ ? chosenArr.includes(key) : answer.selected_option === key
              const isRight = isMSQ ? rightArr.includes(key) : q.correct_answer === key
              const isWrongChoice = isChosen && !isRight

              let bg = 'var(--bg-secondary)'
              let border = 'var(--border-subtle)'
              let keyBg = 'var(--bg-card)'
              let keyColor = 'var(--text-muted)'
              let textColor = 'var(--text-secondary)'
              let icon = null

              if (isRight) {
                bg = 'rgba(16,185,129,0.08)'
                border = 'rgba(16,185,129,0.4)'
                keyBg = 'rgba(16,185,129,0.15)'
                keyColor = '#10b981'
                textColor = '#10b981'
                icon = <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 ml-auto" />
              } else if (isWrongChoice) {
                bg = 'rgba(239,68,68,0.08)'
                border = 'rgba(239,68,68,0.4)'
                keyBg = 'rgba(239,68,68,0.15)'
                keyColor = '#ef4444'
                textColor = '#ef4444'
                icon = <XCircle className="w-4 h-4 text-red-400 shrink-0 ml-auto" />
              }

              return (
                <div key={key} className="flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all"
                  style={{ background: bg, borderColor: border }}>
                  <span className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-black shrink-0"
                    style={{ background: keyBg, color: keyColor }}>
                    {key}
                  </span>
                  <span className="text-sm leading-relaxed flex-1" style={{ color: textColor }}>
                    {value}
                  </span>
                  {icon}
                </div>
              )
            })}
          </div>

          {/* Your answer vs correct */}
          {!isCorrect && (
            <div className="flex flex-wrap gap-3">
              {answer.selected_option ? (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold"
                  style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}>
                  <XCircle className="w-3.5 h-3.5" />
                  Your answer: {answer.selected_option}
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold"
                  style={{ background: 'rgba(148,163,184,0.08)', border: '1px solid rgba(148,163,184,0.2)', color: '#94a3b8' }}>
                  <MinusCircle className="w-3.5 h-3.5" />
                  Not attempted
                </div>
              )}
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold"
                style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: '#10b981' }}>
                <CheckCircle2 className="w-3.5 h-3.5" />
                Correct: {q.correct_answer}
              </div>
            </div>
          )}

          {/* Explanation */}
          {explanationText && (
            <div className="rounded-xl overflow-hidden border"
              style={{ borderColor: 'rgba(99,102,241,0.2)' }}>
              {/* Header */}
              <div className="flex items-center gap-2 px-4 py-2.5"
                style={{ background: 'rgba(99,102,241,0.12)', borderBottom: '1px solid rgba(99,102,241,0.15)' }}>
                <Lightbulb className="w-4 h-4" style={{ color: '#818cf8' }} />
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#818cf8' }}>
                  AI Explanation
                </span>
              </div>
              {/* Body */}
              <div className="px-4 py-3.5" style={{ background: 'rgba(99,102,241,0.05)' }}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>
                  {explanationText}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

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

  if (loading) return (
    <div className="max-w-4xl mx-auto flex flex-col items-center justify-center py-24 gap-4">
      <div className="w-12 h-12 border-4 rounded-full animate-spin"
        style={{ borderColor: 'rgba(99,102,241,0.15)', borderTopColor: '#6366f1' }} />
      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Loading your results…</p>
    </div>
  )

  if (!data) return (
    <div className="max-w-4xl mx-auto text-center py-24">
      <p style={{ color: 'var(--text-muted)' }}>Results not found.{' '}
        <Link href="/test" className="text-indigo-400 underline">Go back</Link>
      </p>
    </div>
  )

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

  const accuracyColor = attempt.accuracy >= 70 ? '#10b981' : attempt.accuracy >= 50 ? '#f59e0b' : '#ef4444'
  const grade = attempt.accuracy >= 80 ? 'Excellent' : attempt.accuracy >= 60 ? 'Good' : attempt.accuracy >= 40 ? 'Average' : 'Needs Work'

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-12">

      {/* ── Score Hero ── */}
      <div className="rounded-2xl border overflow-hidden"
        style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.06))', borderColor: 'rgba(99,102,241,0.2)' }}>

        <div className="p-6 sm:p-8 text-center">
          {/* Grade badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-4 border"
            style={{ background: accuracyColor + '15', color: accuracyColor, borderColor: accuracyColor + '30' }}>
            <Award className="w-3.5 h-3.5" />
            {grade}
          </div>

          {/* Big score */}
          <div className="text-5xl sm:text-6xl font-black mb-1" style={{ color: accuracyColor }}>
            {attempt.accuracy.toFixed(1)}%
          </div>
          <div className="text-base font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{test.title}</div>
          <div className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
            Score: <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>{attempt.score.toFixed(2)} / {attempt.total_marks.toFixed(0)}</span>
            {' '}·{' '}
            Time: <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>{mins}m {secs}s</span>
          </div>

          {/* Stats row */}
          <div className="flex justify-center gap-3 sm:gap-5 mb-6">
            {[
              { label: 'Correct', value: correct, icon: CheckCircle2, color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)' },
              { label: 'Wrong', value: wrong, icon: XCircle, color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)' },
              { label: 'Skipped', value: skipped, icon: MinusCircle, color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.2)' },
            ].map(item => {
              const Icon = item.icon
              return (
                <div key={item.label} className="flex flex-col items-center gap-1 px-4 sm:px-6 py-3 rounded-2xl border"
                  style={{ background: item.bg, borderColor: item.border }}>
                  <Icon className="w-5 h-5" style={{ color: item.color }} />
                  <div className="text-2xl font-black" style={{ color: item.color }}>{item.value}</div>
                  <div className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{item.label}</div>
                </div>
              )
            })}
          </div>

          {/* Progress bar */}
          <div className="max-w-sm mx-auto mb-6">
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${attempt.accuracy}%`, background: `linear-gradient(90deg, ${accuracyColor}, ${accuracyColor}99)` }} />
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/test" className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all hover:opacity-90"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
              <RotateCcw className="w-4 h-4" /> New Test
            </Link>
            <Link href="/analytics" className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
              <TrendingUp className="w-4 h-4" /> View Analytics
            </Link>
            <Link href="/learn" className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all hover:opacity-90"
              style={{ background: 'rgba(16,185,129,0.08)', borderColor: 'rgba(16,185,129,0.2)', color: '#10b981' }}>
              <BookOpen className="w-4 h-4" /> Study Weak Topics
            </Link>
          </div>
        </div>
      </div>

      {/* ── Filter tabs ── */}
      <div className="flex gap-2 flex-wrap">
        {([
          { id: 'all', label: `All`, count: answers.length },
          { id: 'correct', label: `Correct`, count: correct, color: '#10b981' },
          { id: 'wrong', label: `Wrong`, count: wrong, color: '#ef4444' },
          { id: 'skipped', label: `Skipped`, count: skipped, color: '#94a3b8' },
        ] as const).map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-150"
            style={filter === f.id ? {
              background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
              borderColor: 'transparent',
              color: 'white',
            } : {
              background: 'var(--bg-card)',
              borderColor: 'var(--border-subtle)',
              color: 'var(--text-secondary)',
            }}>
            {f.label}
            <span className="text-xs px-1.5 py-0.5 rounded-md font-bold"
              style={filter === f.id
                ? { background: 'rgba(255,255,255,0.2)', color: 'white' }
                : { background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>
              {f.count}
            </span>
          </button>
        ))}
      </div>

      {/* ── Hint: click to expand ── */}
      {filtered.length > 0 && (
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          💡 Click any question to expand options, see the correct answer, and read the explanation
        </p>
      )}

      {/* ── Question cards ── */}
      <div className="space-y-3">
        {filtered.map((answer, idx) => (
          <QuestionCard key={answer.question_id} answer={answer} idx={idx} />
        ))}
      </div>
    </div>
  )
}

export default function TestResultsPage({ params }: { params: Promise<{ testId: string }> }) {
  return (
    <Suspense fallback={
      <div className="max-w-4xl mx-auto flex items-center justify-center py-24">
        <div className="w-10 h-10 border-4 rounded-full animate-spin"
          style={{ borderColor: 'rgba(99,102,241,0.15)', borderTopColor: '#6366f1' }} />
      </div>
    }>
      <ResultsContent params={params} />
    </Suspense>
  )
}
