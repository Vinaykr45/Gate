'use client'

import { useState, useEffect } from 'react'
import type { AISuggestion } from '@/lib/types'
import Link from 'next/link'

const PRIORITY_CONFIG = {
  high: { label: 'High Priority', color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)', icon: '🔴' },
  medium: { label: 'Medium Priority', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', icon: '🟡' },
  low: { label: 'Low Priority', color: '#10b981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)', icon: '🟢' },
}

export default function InsightsPage() {
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  const fetchSuggestions = async () => {
    setRefreshing(true)
    try {
      const res = await fetch('/api/ai-suggestions')
      const data = await res.json()
      if (data.error) setError(data.error)
      else setSuggestions(data.suggestions || [])
    } catch {
      setError('Failed to load suggestions')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { fetchSuggestions() }, [])

  if (loading) return <InsightsLoading />

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">AI Study Coach</h1>
          <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>
            Personalized improvement recommendations powered by Gemini AI
          </p>
        </div>
        <button onClick={fetchSuggestions} disabled={refreshing}
          className="btn-secondary px-4 py-2.5 text-sm flex items-center gap-2">
          <svg className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* AI Banner */}
      <div className="card p-5 flex items-center gap-4"
        style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.08))', borderColor: 'rgba(99,102,241,0.15)' }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
          style={{ background: 'var(--brand-gradient)' }}>✨</div>
        <div>
          <p className="text-white font-semibold text-sm">Powered by Google Gemini 1.5 Flash</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            AI analyzes your test history and generates targeted study recommendations
          </p>
        </div>
      </div>

      {error && (
        <div className="card p-6 text-center">
          <p className="text-amber-400 mb-4">⚠️ {error}</p>
          <Link href="/test" className="btn-primary px-6 py-2.5 inline-flex">Take a Test First</Link>
        </div>
      )}

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="space-y-4">
          <h2 className="section-title">Your Study Recommendations</h2>
          {suggestions.map((s, i) => {
            const cfg = PRIORITY_CONFIG[s.priority]
            return (
              <div key={i} className="card p-6 animate-slide-up" style={{ animationDelay: `${i * 0.08}s` }}>
                <div className="flex items-start gap-4">
                  {/* Priority indicator */}
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                    style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                    {cfg.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className="badge" style={{ background: cfg.bg, color: cfg.color, borderColor: cfg.border }}>
                        {cfg.label}
                      </span>
                      <span className="text-xs px-2.5 py-1 rounded-lg border"
                        style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)', color: 'var(--text-secondary)' }}>
                        {s.subject}
                      </span>
                      {s.accuracy > 0 && (
                        <span className="text-xs px-2.5 py-1 rounded-lg border"
                          style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)', color: 'var(--text-secondary)' }}>
                          Current: <span style={{ color: cfg.color }}>{s.accuracy.toFixed(0)}%</span>
                        </span>
                      )}
                    </div>

                    <h3 className="text-white font-semibold mb-1">{s.topic}</h3>
                    <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>{s.message}</p>

                    <div className="flex items-start gap-3 p-3 rounded-xl"
                      style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.12)' }}>
                      <span className="text-indigo-400 shrink-0 mt-0.5">→</span>
                      <p className="text-sm font-medium" style={{ color: '#a5b4fc' }}>{s.action}</p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Quick actions */}
      <div className="grid md:grid-cols-2 gap-4">
        <Link href="/test" className="card p-6 flex items-center gap-4 group cursor-pointer">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
            style={{ background: 'rgba(99,102,241,0.1)' }}>📝</div>
          <div>
            <h3 className="text-white font-semibold group-hover:text-indigo-300 transition-colors">Practice Weak Topics</h3>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Generate a targeted topic-wise test</p>
          </div>
        </Link>
        <Link href="/analytics" className="card p-6 flex items-center gap-4 group cursor-pointer">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
            style={{ background: 'rgba(139,92,246,0.1)' }}>📊</div>
          <div>
            <h3 className="text-white font-semibold group-hover:text-violet-300 transition-colors">View Detailed Analytics</h3>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Full breakdown of your performance</p>
          </div>
        </Link>
      </div>
    </div>
  )
}

function InsightsLoading() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-white">AI Study Coach</h1>
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card p-6 animate-pulse">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl" style={{ background: 'rgba(255,255,255,0.06)' }}></div>
              <div className="flex-1 space-y-3">
                <div className="h-4 w-32 rounded" style={{ background: 'rgba(255,255,255,0.06)' }}></div>
                <div className="h-3 w-full rounded" style={{ background: 'rgba(255,255,255,0.04)' }}></div>
                <div className="h-3 w-3/4 rounded" style={{ background: 'rgba(255,255,255,0.04)' }}></div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="text-center" style={{ color: 'var(--text-secondary)' }}>
        <svg className="animate-spin w-6 h-6 mx-auto mb-2" viewBox="0 0 24 24" fill="none" style={{ color: '#6366f1' }}>
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
        Gemini AI is analyzing your performance...
      </div>
    </div>
  )
}
