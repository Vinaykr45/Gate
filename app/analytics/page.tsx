'use client'

import { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Cell,
} from 'recharts'
import type { AnalyticsData } from '@/lib/types'

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/analytics')
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error)
        else setData(d)
        setLoading(false)
      })
      .catch(() => {
        setError('Failed to load analytics')
        setLoading(false)
      })
  }, [])

  if (loading) return <AnalyticsLoading />
  if (error || !data) return <AnalyticsEmpty />

  const hasData = data.totalAttempts > 0

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Analytics</h1>
        <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>
          Track your performance trends and identify areas for improvement
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Tests Taken', value: data.totalAttempts, icon: '📝', color: '#6366f1' },
          { label: 'Avg Accuracy', value: `${data.avgAccuracy}%`, icon: '🎯', color: data.avgAccuracy >= 70 ? '#10b981' : data.avgAccuracy >= 50 ? '#f59e0b' : '#ef4444' },
          { label: 'Avg Score', value: data.avgScore.toFixed(1), icon: '⭐', color: '#8b5cf6' },
          { label: 'Q Attempted', value: data.totalQuestions, icon: '❓', color: '#3b82f6' },
        ].map((s) => (
          <div key={s.label} className="stat-card">
            <div className="flex items-center justify-between">
              <span className="text-2xl">{s.icon}</span>
              <div className="w-2 h-2 rounded-full" style={{ background: s.color }}></div>
            </div>
            <div>
              <div className="text-3xl font-black" style={{ color: s.color }}>{s.value}</div>
              <div className="text-sm font-medium text-white mt-1">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {!hasData ? (
        <div className="card p-12 text-center">
          <div className="text-5xl mb-4">📊</div>
          <h3 className="text-xl font-bold text-white mb-2">No data yet</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Take some mock tests to see your analytics here.</p>
        </div>
      ) : (
        <>
          {/* Performance Trend */}
          {data.dailyTrend.length > 1 && (
            <div className="card p-6">
              <h2 className="section-title mb-6">Performance Trend (Last 30 Days)</h2>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={data.dailyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={(d) => d.slice(5)} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ background: '#111120', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '12px', color: '#f8fafc' }}
                    formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Accuracy']}
                  />
                  <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2.5} dot={{ fill: '#6366f1', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Subject Accuracy */}
          {data.subjectStats.length > 0 && (
            <div className="card p-6">
              <h2 className="section-title mb-6">Subject-wise Accuracy</h2>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={data.subjectStats} margin={{ left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} domain={[0, 100]} unit="%" />
                  <Tooltip
                    contentStyle={{ background: '#111120', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '12px', color: '#f8fafc' }}
                    formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Accuracy']}
                  />
                  <Bar dataKey="accuracy" radius={[6, 6, 0, 0]}>
                    {data.subjectStats.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.accuracy >= 70 ? '#10b981' : entry.accuracy >= 50 ? '#f59e0b' : '#ef4444'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Weak Topics */}
          {data.weakTopics.length > 0 && (
            <div className="card overflow-hidden">
              <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                <h2 className="section-title">Weak Topics — Focus Here 🎯</h2>
                <p className="section-subtitle">Topics with lowest accuracy (min. 2 attempts)</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                      {['Topic', 'Subject', 'Accuracy', 'Attempted', 'Correct'].map((h) => (
                        <th key={h} className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wide"
                          style={{ color: 'var(--text-muted)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.weakTopics.slice(0, 10).map((topic, i) => (
                      <tr key={topic.topic}
                        className="border-b transition-colors hover:bg-white/[0.02]"
                        style={{ borderColor: i < data.weakTopics.length - 1 ? 'var(--border-subtle)' : 'transparent' }}>
                        <td className="px-6 py-4 text-sm font-medium text-white">{topic.topic}</td>
                        <td className="px-6 py-4 text-sm" style={{ color: 'var(--text-secondary)' }}>{topic.subject}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-1.5 rounded-full max-w-24" style={{ background: 'rgba(255,255,255,0.08)' }}>
                              <div className="h-1.5 rounded-full transition-all"
                                style={{
                                  width: `${topic.accuracy}%`,
                                  background: topic.accuracy >= 70 ? '#10b981' : topic.accuracy >= 50 ? '#f59e0b' : '#ef4444'
                                }} />
                            </div>
                            <span className={`text-sm font-bold ${
                              topic.accuracy >= 70 ? 'text-emerald-400' :
                              topic.accuracy >= 50 ? 'text-amber-400' : 'text-red-400'
                            }`}>
                              {topic.accuracy}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm" style={{ color: 'var(--text-secondary)' }}>{topic.total}</td>
                        <td className="px-6 py-4 text-sm text-emerald-400 font-semibold">{topic.correct}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function AnalyticsLoading() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Analytics</h1>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="stat-card animate-pulse">
            <div className="h-8 w-16 rounded" style={{ background: 'rgba(255,255,255,0.08)' }}></div>
            <div className="h-4 w-24 rounded mt-2" style={{ background: 'rgba(255,255,255,0.06)' }}></div>
          </div>
        ))}
      </div>
      <div className="card p-6 h-64 animate-pulse" style={{ background: 'rgba(255,255,255,0.02)' }}></div>
    </div>
  )
}

function AnalyticsEmpty() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-white">Analytics</h1>
      <div className="card p-12 text-center">
        <div className="text-5xl mb-4">📈</div>
        <h3 className="text-xl font-bold text-white mb-2">No analytics yet</h3>
        <p style={{ color: 'var(--text-secondary)' }}>
          Take your first mock test to start seeing performance analytics.
        </p>
      </div>
    </div>
  )
}
