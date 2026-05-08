'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SUBJECTS, TOPICS_BY_SUBJECT } from '@/lib/utils'


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

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate test')
      }

      router.push(`/test/${data.testId}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to generate test')
      setGenerating(false)
    }
  }

  const TEST_TYPES = [
    { id: 'topic', label: 'Topic-wise', desc: 'Focus on one specific topic', icon: '🎯', time: '30 min' },
    { id: 'subject', label: 'Subject-wise', desc: 'Cover all topics in a subject', icon: '📚', time: '90 min' },
    { id: 'full', label: 'Full GATE Mock', desc: 'Complete GATE simulation', icon: '🏆', time: '180 min' },
  ] as const

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Generate Mock Test</h1>
        <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>
          Configure your test parameters and start practicing
        </p>
      </div>

      {/* Test Type */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-3">Test Type</h2>
        <div className="grid grid-cols-3 gap-4">
          {TEST_TYPES.map((type) => (
            <button key={type.id} onClick={() => setTestType(type.id)}
              className={`card p-5 text-left transition-all duration-200 ${testType === type.id ? 'border-indigo-500' : ''}`}
              style={testType === type.id ? { borderColor: 'rgba(99,102,241,0.5)', background: 'rgba(99,102,241,0.06)' } : {}}>
              <div className="text-2xl mb-2">{type.icon}</div>
              <div className="text-white font-semibold text-sm">{type.label}</div>
              <div className="text-xs mt-1 mb-2" style={{ color: 'var(--text-secondary)' }}>{type.desc}</div>
              <div className="text-xs font-medium" style={{ color: '#a5b4fc' }}>⏱ {type.time}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Subject / Topic Selection */}
      {testType !== 'full' && (
        <div className="card p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Subject</label>
            <select
              id="subject-select"
              value={selectedSubject}
              onChange={(e) => { setSelectedSubject(e.target.value); setSelectedTopic('') }}
              className="input">
              {SUBJECTS.map((s) => (
                <option key={s} value={s} style={{ background: '#111120' }}>{s}</option>
              ))}
            </select>
          </div>

          {testType === 'topic' && (
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Topic</label>
              <select
                id="topic-select"
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="input">
                <option value="" style={{ background: '#111120' }}>All topics in subject</option>
                {topics.map((t) => (
                  <option key={t} value={t} style={{ background: '#111120' }}>{t}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Advanced Options */}
      <div className="card p-6 space-y-5">
        <h3 className="text-white font-semibold">Options</h3>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
            Number of Questions: <span className="text-white font-bold">{questionCount}</span>
          </label>
          <input
            id="question-count"
            type="range"
            min={5} max={65} step={5}
            value={questionCount}
            onChange={(e) => setQuestionCount(parseInt(e.target.value))}
            className="w-full accent-indigo-500"
          />
          <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            <span>5</span><span>Quick (20)</span><span>Standard (30)</span><span>Full (65)</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Difficulty Filter</label>
          <div className="flex gap-3">
            {[{ val: '', label: 'Mixed' }, { val: 'easy', label: 'Easy' }, { val: 'medium', label: 'Medium' }, { val: 'hard', label: 'Hard' }].map(({ val, label }) => (
              <button key={val} onClick={() => setDifficulty(val)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150 border ${
                  difficulty === val
                    ? 'border-indigo-500 text-indigo-300'
                    : 'border-transparent text-slate-400'
                }`}
                style={difficulty === val ? { background: 'rgba(99,102,241,0.1)' } : { background: 'rgba(255,255,255,0.04)' }}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl text-sm border"
          style={{ background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.2)', color: '#fca5a5' }}>
          ⚠️ {error}
        </div>
      )}

      <button onClick={handleGenerate} disabled={generating} className="btn-primary w-full py-4 text-base">
        {generating ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            Generating test...
          </span>
        ) : `🚀 Generate ${questionCount}-Question Test`}
      </button>

      {/* GATE Info */}
      <div className="card p-5" style={{ background: 'rgba(99,102,241,0.04)' }}>
        <p className="text-xs font-semibold mb-2" style={{ color: '#a5b4fc' }}>GATE MARKING SCHEME</p>
        <div className="flex gap-6 text-sm">
          <span style={{ color: 'var(--text-secondary)' }}>✅ Correct: <span className="text-emerald-400 font-semibold">+1</span></span>
          <span style={{ color: 'var(--text-secondary)' }}>❌ Wrong: <span className="text-red-400 font-semibold">−0.33</span></span>
          <span style={{ color: 'var(--text-secondary)' }}>⬜ Skip: <span className="text-slate-400 font-semibold">0</span></span>
        </div>
      </div>
    </div>
  )
}
