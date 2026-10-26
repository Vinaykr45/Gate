'use client'

import { useState, useEffect } from 'react'
import { Repeat, Brain, CheckCircle2, AlertCircle, ArrowRight, Sparkles, BookOpen, Clock } from 'lucide-react'
import { BRAND, type ExamTrackId } from '@/lib/brand'

interface RevisionItem {
  id: string
  question_id: string
  exam_track: string
  subject: string
  topic: string
  mistake_count: number
  repetitions: number
  interval_days: number
  ease_factor: number
  next_due_date: string
  question?: {
    question_text: string
    options: Record<string, string>
    correct_answer: string
    explanation: string
    difficulty: string
  }
}

export default function RevisionPage() {
  const [track, setTrack] = useState<ExamTrackId>('gate_cse')
  const [items, setItems] = useState<RevisionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const savedTrack = (localStorage.getItem('prepaxis_active_track') as ExamTrackId) || 'gate_cse'
    setTrack(savedTrack)
    loadRevisionItems(savedTrack)

    const onTrackChange = (e: Event) => {
      const newTrack = (e as CustomEvent).detail?.track
      if (newTrack) {
        setTrack(newTrack)
        loadRevisionItems(newTrack)
      }
    }
    window.addEventListener('prepaxis:track-changed', onTrackChange)
    return () => window.removeEventListener('prepaxis:track-changed', onTrackChange)
  }, [])

  const loadRevisionItems = async (t: ExamTrackId) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/revision?track=${t}`)
      const data = await res.json()
      setItems(data.items || [])
      setCurrentIndex(0)
      setRevealed(false)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleGrade = async (grade: number) => {
    const current = items[currentIndex]
    if (!current) return

    setSubmitting(true)
    try {
      await fetch('/api/revision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: current.id, grade }),
      })

      // Advance to next card
      if (currentIndex + 1 < items.length) {
        setCurrentIndex(currentIndex + 1)
        setRevealed(false)
      } else {
        // Reload list
        loadRevisionItems(track)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const activeItem = items[currentIndex]
  const dueItems = items.filter(i => new Date(i.next_due_date) <= new Date())

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2.5">
            <Repeat className="w-8 h-8 text-indigo-400" /> Mistake Book & Spaced Revision
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Scientifically scheduled review sessions using the SuperMemo-2 (SM-2) algorithm.
            Prioritizes questions you answered incorrectly during mock tests.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            {BRAND.tracks.find(t => t.id === track)?.name}
          </span>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="text-xs text-slate-400 font-medium">Mistake Book Total</div>
          <div className="text-2xl font-bold text-white mt-1">{items.length} Questions</div>
          <div className="text-[11px] text-slate-500 mt-1">Logged from test attempts</div>
        </div>
        <div className="card p-4">
          <div className="text-xs text-slate-400 font-medium">Due for Review Today</div>
          <div className="text-2xl font-bold text-amber-400 mt-1">{dueItems.length} Due</div>
          <div className="text-[11px] text-amber-500/80 mt-1">Scheduled by spaced interval</div>
        </div>
        <div className="card p-4">
          <div className="text-xs text-slate-400 font-medium">Repetition Algorithm</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">SM-2 Active</div>
          <div className="text-[11px] text-emerald-500/80 mt-1">Deterministic interval calculations</div>
        </div>
      </div>

      {/* Revision Card */}
      {loading ? (
        <div className="card p-12 text-center text-slate-400 text-sm">
          Loading revision items...
        </div>
      ) : activeItem && activeItem.question ? (
        <div className="card p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                Card {currentIndex + 1} of {items.length}
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-xs font-medium text-slate-400">
                {activeItem.subject} — {activeItem.topic}
              </span>
            </div>
            <div className="text-xs text-slate-500 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Interval: {activeItem.interval_days || 1}d
            </div>
          </div>

          {/* Question Text */}
          <div className="text-base text-white font-medium leading-relaxed">
            {activeItem.question.question_text}
          </div>

          {/* Options */}
          {activeItem.question.options && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {Object.entries(activeItem.question.options).map(([optKey, optVal]) => (
                <div
                  key={optKey}
                  className={`p-3.5 rounded-xl border text-sm flex items-start gap-2.5 transition-all ${
                    revealed && optKey === activeItem.question?.correct_answer
                      ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300'
                  }`}
                >
                  <span className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs shrink-0 ${
                    revealed && optKey === activeItem.question?.correct_answer
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {optKey}
                  </span>
                  <span>{optVal}</span>
                </div>
              ))}
            </div>
          )}

          {/* Solution / Explanation */}
          {!revealed ? (
            <div className="pt-4 text-center">
              <button
                onClick={() => setRevealed(true)}
                className="btn-primary px-6 py-2.5 text-sm inline-flex items-center gap-2"
              >
                Reveal Verified Solution & Answer →
              </button>
            </div>
          ) : (
            <div className="pt-4 space-y-4 border-t border-slate-800 animate-slide-up">
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
                <div className="text-xs font-bold text-emerald-400 mb-1">
                  Correct Answer: Option {activeItem.question.correct_answer}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {activeItem.question.explanation || 'Review the conceptual definition for this topic.'}
                </p>
              </div>

              {/* SM-2 Recall Feedback Grading Buttons */}
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-2 text-center">
                  How well did you recall this solution? (Schedules next review interval)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-xl mx-auto">
                  <button
                    disabled={submitting}
                    onClick={() => handleGrade(1)}
                    className="p-2.5 text-xs font-semibold rounded-lg bg-red-950/40 text-red-300 border border-red-800/40 hover:bg-red-900/50"
                  >
                    1 - Forgot (Reset)
                  </button>
                  <button
                    disabled={submitting}
                    onClick={() => handleGrade(2)}
                    className="p-2.5 text-xs font-semibold rounded-lg bg-amber-950/40 text-amber-300 border border-amber-800/40 hover:bg-amber-900/50"
                  >
                    2 - Hard (1 Day)
                  </button>
                  <button
                    disabled={submitting}
                    onClick={() => handleGrade(4)}
                    className="p-2.5 text-xs font-semibold rounded-lg bg-blue-950/40 text-blue-300 border border-blue-800/40 hover:bg-blue-900/50"
                  >
                    4 - Good (Expand)
                  </button>
                  <button
                    disabled={submitting}
                    onClick={() => handleGrade(5)}
                    className="p-2.5 text-xs font-semibold rounded-lg bg-emerald-950/40 text-emerald-300 border border-emerald-800/40 hover:bg-emerald-900/50"
                  >
                    5 - Mastered (Long)
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center bg-emerald-500/10 text-emerald-400 mb-4 border border-emerald-500/20">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Mistake Book is Clean!</h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
            You currently have no questions due for review in this examination track.
            Take mock tests to identify weak areas and automatically populate your review queue.
          </p>
          <a href="/test" className="btn-primary text-xs px-5 py-2.5 inline-flex items-center gap-1.5">
            Take a Practice Test →
          </a>
        </div>
      )}
    </div>
  )
}
