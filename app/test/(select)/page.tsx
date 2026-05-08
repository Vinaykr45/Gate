'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SUBJECTS, TOPICS_BY_SUBJECT } from '@/lib/utils'
import { FlaskConical, Target, BookOpen, Trophy, ChevronDown, Loader2 } from 'lucide-react'

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
    desc: 'Complete simulation exam',
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

export default function TestPage() {
  const [testType, setTestType] = useState<'topic' | 'subject' | 'full'>('topic')
  const [selectedSubject, setSelectedSubject] = useState('Computer Science')
  const [selectedTopic, setSelectedTopic] = useState('')
  const [questionCount, setQuestionCount] = useState(20)
  const [difficulty, setDifficulty] = useState('')
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const topics = TOPICS_BY_SUBJECT[selectedSubject] || []

  const handleGenerate = async () => {
    setGenerating(true)
    setError('')

    const body = {
      type: testType,
      subject: testType !== 'full' ? selectedSubject : undefined,
      topic: testType === 'topic' ? selectedTopic : undefined,
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
      if (!res.ok) throw new Error(data.error || 'Failed to generate test')
      router.push(`/test/${data.testId}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to generate test')
      setGenerating(false)
    }
  }

  const selectedType = TEST_TYPES.find(t => t.id === testType)!

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black" style={{ color: 'var(--text-primary)' }}>
          Generate Mock Test
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
          Configure your test parameters — AI generates fresh GATE-style questions instantly
        </p>
      </div>

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
            Select Subject
          </h2>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Subject
            </label>
            <div className="relative">
              <select
                id="subject-select"
                value={selectedSubject}
                onChange={(e) => { setSelectedSubject(e.target.value); setSelectedTopic('') }}
                className="w-full appearance-none pr-10 rounded-xl py-3 px-4 text-sm font-medium border transition-colors"
                style={{
                  background: 'var(--bg-secondary)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)',
                }}
              >
                {SUBJECTS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
            </div>
          </div>

          {testType === 'topic' && (
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Topic <span className="text-xs font-normal" style={{ color: 'var(--text-muted)' }}>(optional — leave blank for all topics)</span>
              </label>
              <div className="relative">
                <select
                  id="topic-select"
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  className="w-full appearance-none pr-10 rounded-xl py-3 px-4 text-sm font-medium border transition-colors"
                  style={{
                    background: 'var(--bg-secondary)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <option value="">All topics in {selectedSubject}</option>
                  {topics.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Options */}
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
                How many questions do you want to attempt?
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
              max={65}
              step={5}
              value={questionCount}
              onChange={(e) => setQuestionCount(parseInt(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer relative z-10 transition-all"
              style={{ 
                background: `linear-gradient(to right, ${selectedType.color} ${(questionCount - 5) / (65 - 5) * 100}%, var(--border) ${(questionCount - 5) / (65 - 5) * 100}%)`,
              }}
            />
          </div>
          
          <div className="flex justify-between text-xs mt-3 font-semibold relative w-full" style={{ color: 'var(--text-muted)' }}>
            <span className="flex flex-col items-start gap-1.5 absolute left-0">
              <span className="w-1.5 h-1.5 rounded-full ml-1" style={{ background: questionCount >= 5 ? selectedType.color : 'var(--border-subtle)' }}></span>
              <span className="leading-tight text-left">5<br/><span className="text-[10px] opacity-75 font-medium">Quick</span></span>
            </span>
            <span className="flex flex-col items-center gap-1.5 w-16 text-center absolute" style={{ left: '25%', transform: 'translateX(-50%)' }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: questionCount >= 20 ? selectedType.color : 'var(--border-subtle)' }}></span>
              <span className="leading-tight">20<br/><span className="text-[10px] opacity-75 font-medium">Standard</span></span>
            </span>
            <span className="flex flex-col items-center gap-1.5 w-16 text-center absolute" style={{ left: '58.33%', transform: 'translateX(-50%)' }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: questionCount >= 40 ? selectedType.color : 'var(--border-subtle)' }}></span>
              <span className="leading-tight">40<br/><span className="text-[10px] opacity-75 font-medium">Extended</span></span>
            </span>
            <span className="flex flex-col items-end gap-1.5 absolute right-0">
              <span className="w-1.5 h-1.5 rounded-full mr-2" style={{ background: questionCount >= 65 ? selectedType.color : 'var(--border-subtle)' }}></span>
              <span className="leading-tight text-right">65<br/><span className="text-[10px] opacity-75 font-medium">Full GATE</span></span>
            </span>
          </div>
          <div className="h-8"></div> {/* Spacer for the absolute positioned text */}
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
          className="p-4 rounded-xl text-sm border"
          style={{ background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.2)', color: '#ef4444' }}
        >
          ⚠️ {error}
        </div>
      )}

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={generating}
        className="w-full py-4 rounded-2xl font-bold text-base text-white flex items-center justify-center gap-3 transition-all duration-200 hover:opacity-90 hover:scale-[1.01] disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
        style={{
          background: generating
            ? 'var(--bg-secondary)'
            : `linear-gradient(135deg, ${selectedType.color}, #6366f1)`,
          boxShadow: generating ? 'none' : `0 8px 32px ${selectedType.color}40`,
          color: generating ? 'var(--text-muted)' : 'white',
        }}
      >
        {generating ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Generating {questionCount} questions…</span>
          </>
        ) : (
          <>
            <FlaskConical className="w-5 h-5" />
            <span>Generate {questionCount}-Question Test</span>
          </>
        )}
      </button>
    </div>
  )
}
