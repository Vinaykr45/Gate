'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FlaskConical, Target, BookOpen, Trophy, ChevronDown, Loader2, AlertCircle, Database } from 'lucide-react'
import { GATE_SUBJECTS, TOPICS_BY_SUBJECT } from '@/lib/utils'

const TEST_TYPES = [
  {
    id: 'topic' as const,
    label: 'Topic-wise',
    desc: 'Focus on one specific topic',
    icon: Target,
    color: '#10b981',
    bg: 'rgba(16,185,129,0.1)',
    border: 'rgba(16,185,129,0.25)',
    time: '~30 min',
  },
  {
    id: 'subject' as const,
    label: 'Subject-wise',
    desc: 'Cover all topics in a subject',
    icon: BookOpen,
    color: '#6366f1',
    bg: 'rgba(99,102,241,0.1)',
    border: 'rgba(99,102,241,0.25)',
    time: '~90 min',
  },
  {
    id: 'full' as const,
    label: 'Full GATE Mock',
    desc: 'All subjects combined',
    icon: Trophy,
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.1)',
    border: 'rgba(245,158,11,0.25)',
    time: '~180 min',
  },
]

const DIFFICULTY_OPTIONS = [
  { val: '', label: 'Mixed', desc: 'All difficulties' },
  { val: 'easy', label: 'Easy', desc: 'Foundation level' },
  { val: 'medium', label: 'Medium', desc: 'Applied problems' },
  { val: 'hard', label: 'Hard', desc: 'GATE-level hard' },
]

interface AvailableData {
  subjects: string[]
  topicsBySubject: Record<string, string[]>
  totalQuestions: number
  counts: { total: number; bySubject: Record<string, number>; bySubjectTopic: Record<string, number> }
}

export default function TestPage() {
  const [testType, setTestType] = useState<'topic' | 'subject' | 'full'>('topic')
  const [selectedSubject, setSelectedSubject] = useState('')
  const [selectedTopic, setSelectedTopic] = useState('')
  const [questionCount, setQuestionCount] = useState(20)
  const [difficulty, setDifficulty] = useState('')
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [available, setAvailable] = useState<AvailableData>({ subjects: [], topicsBySubject: {}, totalQuestions: 0, counts: { total: 0, bySubject: {}, bySubjectTopic: {} } })
  const [loadingOptions, setLoadingOptions] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function fetchOptions() {
      try {
        const res = await fetch('/api/questions/available')
        const data = await res.json()
        if (data.subjects && data.topicsBySubject) {
          setAvailable({
            subjects: data.subjects,
            topicsBySubject: data.topicsBySubject,
            totalQuestions: data.totalQuestions || 0,
            counts: data.counts || { total: 0, bySubject: {}, bySubjectTopic: {} }
          })
          if (data.subjects.length > 0) {
            setSelectedSubject(data.subjects[0])
          }
        }
      } catch (err) {
        console.error('Failed to load question options:', err)
      } finally {
        setLoadingOptions(false)
      }
    }
    fetchOptions()
  }, [])

  // Reset topic when subject changes
  useEffect(() => {
    setSelectedTopic('')
  }, [selectedSubject])

  const topics = available.topicsBySubject[selectedSubject] || []
  const selectedType = TEST_TYPES.find(t => t.id === testType)!
  const hasQuestions = available.subjects.length > 0

  let maxQuestions = 65
  if (testType === 'full') {
    maxQuestions = Math.min(65, available.counts.total)
  } else if (testType === 'subject' && selectedSubject) {
    maxQuestions = Math.min(65, available.counts.bySubject[selectedSubject] || 0)
  } else if (testType === 'topic' && selectedSubject) {
    if (selectedTopic) {
      maxQuestions = Math.min(65, available.counts.bySubjectTopic[`${selectedSubject}|${selectedTopic}`] || 0)
    } else {
      maxQuestions = Math.min(65, available.counts.bySubject[selectedSubject] || 0)
    }
  }
  if (maxQuestions < 5) maxQuestions = 5 // keep a floor of 5 to avoid rendering errors

  // Keep question count within bounds
  useEffect(() => {
    if (questionCount > maxQuestions) {
      setQuestionCount(maxQuestions)
    }
  }, [maxQuestions, questionCount])

  const handleGenerate = async () => {
    setGenerating(true)
    setError('')

    const body = {
      type: testType,
      subject: testType !== 'full' ? selectedSubject : undefined,
      topic: testType === 'topic' ? (selectedTopic || undefined) : undefined,
      count: questionCount,
      difficulty: difficulty || undefined,
    }

    try {
      const res = await fetch('/api/generate-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to start test')
      router.push(`/test/${data.testId}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to start test')
      setGenerating(false)
    }
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black" style={{ color: 'var(--text-primary)' }}>
          Mock Test
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
          Shuffles & compiles from your question bank — no AI generation needed
        </p>
      </div>

      {/* No questions warning */}
      {!loadingOptions && !hasQuestions && (
        <div className="rounded-xl border p-5 flex items-start gap-3"
          style={{ background: 'rgba(245,158,11,0.06)', borderColor: 'rgba(245,158,11,0.2)' }}>
          <AlertCircle className="w-5 h-5 mt-0.5 shrink-0 text-amber-400" />
          <div>
            <p className="font-semibold text-sm text-amber-400">No questions in the bank</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
              Upload GATE question PDFs or images first to populate the question bank.
            </p>
          </div>
        </div>
      )}

      {/* Question bank info */}
      {!loadingOptions && hasQuestions && (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs"
          style={{ background: 'rgba(99,102,241,0.05)', borderColor: 'rgba(99,102,241,0.15)', color: 'var(--text-secondary)' }}>
          <Database className="w-3.5 h-3.5" style={{ color: '#818cf8' }} />
          <span>
            <span className="font-semibold" style={{ color: '#818cf8' }}>{available.subjects.length} subject{available.subjects.length !== 1 ? 's' : ''}</span>
            {' '}available in question bank
          </span>
        </div>
      )}

      {/* Test Type Selection */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
          Test Type
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {TEST_TYPES.map((type) => {
            const Icon = type.icon
            const isActive = testType === type.id
            return (
              <button
                key={type.id}
                onClick={() => setTestType(type.id)}
                className="p-4 rounded-xl border text-left transition-all duration-200 hover:scale-[1.01]"
                style={{
                  background: isActive ? type.bg : 'var(--bg-card)',
                  borderColor: isActive ? type.border : 'var(--border-subtle)',
                  boxShadow: isActive ? `0 0 0 1px ${type.border}` : 'none',
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: type.bg, border: `1px solid ${type.border}` }}
                >
                  <Icon className="w-5 h-5" style={{ color: type.color }} />
                </div>
                <div className="font-bold text-sm" style={{ color: isActive ? type.color : 'var(--text-primary)' }}>
                  {type.label}
                </div>
                <div className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {type.desc}
                </div>
                <div className="text-xs font-semibold mt-2" style={{ color: type.color }}>
                  ⏱ {type.time}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Subject / Topic Selection */}
      {testType !== 'full' && (
        <div className="rounded-xl border p-5 space-y-4" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}>
          <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            {testType === 'topic' ? 'Subject & Topic' : 'Subject'}
          </h2>

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Subject
            </label>
            <div className="relative">
              <select
                id="subject-select"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                disabled={loadingOptions || !hasQuestions}
                className="w-full appearance-none pr-10 rounded-xl py-3 px-4 text-sm font-medium border transition-colors disabled:opacity-50 cursor-pointer"
                style={{
                  background: 'var(--bg-secondary)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)',
                }}
              >
                {loadingOptions ? (
                  <option>Loading…</option>
                ) : !hasQuestions ? (
                  <option>No questions available</option>
                ) : (
                  available.subjects.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))
                )}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
            </div>
          </div>

          {/* Topic (only for topic-wise) */}
          {testType === 'topic' && (
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Topic{' '}
                <span className="text-xs font-normal" style={{ color: 'var(--text-muted)' }}>
                  (optional — leave blank for all topics in subject)
                </span>
              </label>
              <div className="relative">
                <select
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  disabled={!selectedSubject || topics.length === 0}
                  className="w-full appearance-none pr-10 rounded-xl py-3 px-4 text-sm font-medium border transition-colors disabled:opacity-50 cursor-pointer"
                  style={{
                    background: 'var(--bg-secondary)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <option value="">All Topics</option>
                  {topics.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
              </div>
              {topics.length > 0 && (
                <p className="mt-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                  {topics.length} topic{topics.length !== 1 ? 's' : ''} available in this subject
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Configure Test */}
      <div className="rounded-xl border p-5 space-y-5" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}>
        <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          Configure Test
        </h2>

        {/* Question Count */}
        <div className="p-4 sm:p-5 rounded-2xl border" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}>
          <div className="flex justify-between items-end mb-5">
            <div>
              <label className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Questions
              </label>
              <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                How many questions to attempt?
              </div>
            </div>
            <div className="text-4xl font-black" style={{ color: selectedType.color }}>
              {questionCount}
            </div>
          </div>

          <div className="relative pt-2 pb-2">
            <input
              id="question-count"
              type="range"
              min={5}
              max={maxQuestions}
              step={5}
              value={questionCount}
              onChange={(e) => setQuestionCount(parseInt(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer relative z-10 transition-all"
              style={{
                background: `linear-gradient(to right, ${selectedType.color} ${(questionCount - 5) / (maxQuestions - 5 || 1) * 100}%, var(--border) ${(questionCount - 5) / (maxQuestions - 5 || 1) * 100}%)`,
              }}
            />
          </div>

          <div className="flex justify-between text-xs mt-3 font-semibold relative w-full" style={{ color: 'var(--text-muted)' }}>
            {[
              { val: 5, label: 'Quick' },
              { val: 20, label: 'Standard' },
              { val: 40, label: 'Extended' },
              { val: 65, label: 'Full GATE' },
            ]
              .filter(m => m.val < maxQuestions)
              .concat([{ val: maxQuestions, label: maxQuestions === 65 ? 'Full GATE' : 'Max' }])
              .map((m, i, arr) => {
                const posPercent = maxQuestions > 5 ? ((m.val - 5) / (maxQuestions - 5) * 100) : 0;
                const isFirst = i === 0;
                const isLast = i === arr.length - 1;
                return (
                  <span key={m.val} className={`flex flex-col gap-1.5 absolute ${isFirst ? 'items-start' : isLast ? 'items-end' : 'items-center -translate-x-1/2'}`} 
                        style={{ left: isLast ? 'auto' : `${posPercent}%`, right: isLast ? '0' : 'auto' }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: questionCount >= m.val ? selectedType.color : 'var(--border-subtle)' }} />
                    <span className="leading-tight">{m.val}<br /><span className="text-[10px] opacity-75 font-medium">{m.label}</span></span>
                  </span>
                )
            })}
          </div>
          <div className="h-8" />
        </div>

        {/* Difficulty */}
        <div>
          <label className="block text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>
            Difficulty
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {DIFFICULTY_OPTIONS.map(({ val, label, desc }) => {
              const isSelected = difficulty === val
              return (
                <button
                  key={val}
                  onClick={() => setDifficulty(val)}
                  className="py-2.5 px-3 rounded-xl text-sm font-medium transition-all duration-150 border text-left"
                  style={isSelected ? {
                    background: 'rgba(99,102,241,0.12)',
                    borderColor: 'rgba(99,102,241,0.4)',
                    color: '#6366f1',
                  } : {
                    background: 'var(--bg-secondary)',
                    borderColor: 'var(--border-subtle)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <div className="font-semibold text-xs">{label}</div>
                  <div className="text-xs mt-0.5 font-normal" style={{ color: isSelected ? '#818cf8' : 'var(--text-muted)' }}>{desc}</div>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* GATE Marking Scheme */}
      <div
        className="rounded-xl border p-4 flex flex-wrap items-center gap-4 sm:gap-8"
        style={{ background: 'rgba(99,102,241,0.04)', borderColor: 'rgba(99,102,241,0.15)' }}
      >
        <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#818cf8' }}>
          GATE Marking
        </p>
        <div className="flex flex-wrap gap-4 text-sm">
          <span style={{ color: 'var(--text-secondary)' }}>
            ✅ Correct: <span className="font-bold text-emerald-500">+1</span>
          </span>
          <span style={{ color: 'var(--text-secondary)' }}>
            ❌ Wrong: <span className="font-bold text-red-500">−0.33</span>
          </span>
          <span style={{ color: 'var(--text-secondary)' }}>
            ⬜ Skipped: <span className="font-bold" style={{ color: 'var(--text-muted)' }}>0</span>
          </span>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          className="p-4 rounded-xl text-sm border flex items-center gap-2"
          style={{ background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.2)', color: '#ef4444' }}
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Start Button */}
      <button
        onClick={handleGenerate}
        disabled={generating || !hasQuestions || loadingOptions}
        className="w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-3 transition-all duration-200 hover:opacity-90 hover:scale-[1.01] disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
        style={{
          background: generating || !hasQuestions
            ? 'var(--bg-secondary)'
            : `linear-gradient(135deg, ${selectedType.color}, #6366f1)`,
          boxShadow: generating || !hasQuestions ? 'none' : `0 8px 32px ${selectedType.color}40`,
          color: generating || !hasQuestions ? 'var(--text-muted)' : 'white',
        }}
      >
        {generating ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Compiling {questionCount} questions…</span>
          </>
        ) : !hasQuestions ? (
          <>
            <AlertCircle className="w-5 h-5" />
            <span>No questions available</span>
          </>
        ) : (
          <>
            <FlaskConical className="w-5 h-5" />
            <span>Start {questionCount}-Question Test</span>
          </>
        )}
      </button>
    </div>
  )
}
