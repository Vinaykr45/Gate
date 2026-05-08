'use client'

import { useState, useEffect, useCallback } from 'react'
import { notFound, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ChevronLeft, Play, BookOpen, Brain, CheckCircle2,
  Bookmark, Plus, Trash2, ExternalLink, Loader2, Sparkles, FlaskConical, Globe,
} from 'lucide-react'
import type { LearningTopic, Video, Note, UserNote, AISummary, LearningProgress } from '@/lib/types'
import { AddVideoForm } from '@/components/learn/AddVideoForm'
import { AddCuratedNoteForm } from '@/components/learn/AddCuratedNoteForm'

interface Props { params: Promise<{ subject: string; topicId: string }> }

type Tab = 'overview' | 'videos' | 'notes' | 'ai' | 'practice' | 'material'
type QuizCount = 5 | 10 | 15 | 20

interface FetchedMaterial {
  concept_explanation: string
  key_points: string[]
  gate_patterns: { pattern: string; tip: string; frequency: string }[]
  worked_example: { question: string; solution: string; key_insight: string }
  mnemonics: string[]
  common_mistakes: string[]
  resources: { youtube_searches: string[]; key_books: string[] }
  difficulty_breakdown: { easy: string; medium: string; hard: string }
}

export default function TopicDetailPage({ params }: Props) {
  const router = useRouter()
  const [resolvedParams, setResolvedParams] = useState<{ subject: string; topicId: string } | null>(null)
  const [topic, setTopic] = useState<LearningTopic | null>(null)
  const [progress, setProgress] = useState<LearningProgress | null>(null)
  const [videos, setVideos] = useState<Video[]>([])
  const [notes, setNotes] = useState<(Note & { bookmarked: boolean })[]>([])
  const [userNotes, setUserNotes] = useState<UserNote[]>([])
  const [summary, setSummary] = useState<AISummary | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [newNote, setNewNote] = useState('')
  const [loadingAI, setLoadingAI] = useState(false)
  const [savingNote, setSavingNote] = useState(false)
  const [activeVideo, setActiveVideo] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [generatingQuiz, setGeneratingQuiz] = useState(false)
  const [quizCount, setQuizCount] = useState<QuizCount>(10)
  const [quizError, setQuizError] = useState('')
  const [fetchingMaterial, setFetchingMaterial] = useState(false)
  const [fetchedMaterial, setFetchedMaterial] = useState<FetchedMaterial | null>(null)
  const [materialError, setMaterialError] = useState('')

  useEffect(() => {
    params.then(setResolvedParams)
  }, [params])

  const load = useCallback(async (topicId: string) => {
    const [topicsRes, videosRes, notesRes] = await Promise.all([
      fetch(`/api/learning/topics?topic_id=${topicId}`),
      fetch(`/api/videos?topic_id=${topicId}`),
      fetch(`/api/notes?topic_id=${topicId}`),
    ])

    const [topicsData, videosData, notesData] = await Promise.all([
      topicsRes.json(), videosRes.json(), notesRes.json(),
    ])

    const found = topicsData.topics?.find((t: LearningTopic) => t.id === topicId)
    if (!found) { setLoading(false); return }

    setTopic(found)
    setProgress(found.progress)
    setVideos(videosData.videos ?? [])
    setNotes(notesData.notes ?? [])
    setUserNotes(notesData.userNotes ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    if (resolvedParams) load(resolvedParams.topicId)
  }, [resolvedParams, load])

  const toggleComplete = async () => {
    if (!topic) return
    const next = !progress?.completed
    await fetch('/api/learning/progress', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic_id: topic.id, completed: next }),
    })
    setProgress(prev => prev ? { ...prev, completed: next } : { completed: next } as LearningProgress)
  }

  const markVideoWatched = async (videoId: string) => {
    if (!topic) return
    const res = await fetch('/api/learning/progress', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic_id: topic.id, watched_video_id: videoId }),
    })
    const data = await res.json()
    setProgress(data.progress)
  }

  const toggleBookmark = async (noteId: string) => {
    const res = await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'bookmark', note_id: noteId }),
    })
    const data = await res.json()
    setNotes(prev => prev.map(n => n.id === noteId ? { ...n, bookmarked: data.bookmarked } : n))
  }

  const addUserNote = async () => {
    if (!topic || !newNote.trim()) return
    setSavingNote(true)
    const res = await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic_id: topic.id, content: newNote }),
    })
    const data = await res.json()
    if (data.note) {
      setUserNotes(prev => [data.note, ...prev])
      setNewNote('')
    }
    setSavingNote(false)
  }

  const deleteUserNote = async (noteId: string) => {
    await fetch(`/api/notes?id=${noteId}`, { method: 'DELETE' })
    setUserNotes(prev => prev.filter(n => n.id !== noteId))
  }

  const generateSummary = async () => {
    if (!topic || loadingAI) return
    setLoadingAI(true)
    setActiveTab('ai')
    const res = await fetch('/api/ai-summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic: topic.topic, subject: topic.subject, subtopic: topic.subtopic }),
    })
    const data = await res.json()
    if (data.summary) setSummary(data.summary)
    setLoadingAI(false)
  }

  const generatePracticeQuiz = async () => {
    if (!topic || generatingQuiz) return
    setGeneratingQuiz(true)
    setQuizError('')
    try {
      const res = await fetch('/api/generate-test/from-learning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic_id: topic.id, count: quizCount }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to generate quiz')
      router.push(`/test/${data.testId}`)
    } catch (err: unknown) {
      setQuizError(err instanceof Error ? err.message : 'Failed to generate quiz')
      setGeneratingQuiz(false)
    }
  }

  const fetchMaterial = async (mode: 'ai' | 'comprehensive' = 'ai') => {
    if (!topic || fetchingMaterial) return
    setFetchingMaterial(true)
    setMaterialError('')
    setActiveTab('material')
    try {
      const res = await fetch('/api/learning/fetch-material', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic_id: topic.id, mode }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to fetch material')
      setFetchedMaterial(data.material)
      // Reload notes if comprehensive mode auto-saved them
      if (mode === 'comprehensive' && resolvedParams) {
        const notesRes = await fetch(`/api/notes?topic_id=${resolvedParams.topicId}`)
        const notesData = await notesRes.json()
        setNotes(notesData.notes ?? [])
      }
    } catch (err: unknown) {
      setMaterialError(err instanceof Error ? err.message : 'Failed to fetch material')
    } finally {
      setFetchingMaterial(false)
    }
  }

  const getYouTubeId = (url: string) => {
    const match = url.match(/(?:v=|youtu\.be\/)([^&\n?#]+)/)
    return match?.[1] ?? null
  }

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="skeleton h-6 w-48" />
        <div className="skeleton h-10 w-64" />
        <div className="skeleton h-48 w-full rounded-2xl" />
      </div>
    )
  }

  if (!topic || !resolvedParams) return notFound()

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'videos', label: `Videos (${videos.length})`, icon: <Play className="w-4 h-4" /> },
    { id: 'notes', label: `Notes (${notes.length + userNotes.length})`, icon: <BookOpen className="w-4 h-4" /> },
    { id: 'ai', label: 'AI Summary', icon: <Brain className="w-4 h-4" /> },
    { id: 'material', label: 'Learn Material', icon: <Globe className="w-4 h-4" /> },
    { id: 'practice', label: 'Practice Quiz', icon: <FlaskConical className="w-4 h-4" /> },
  ]

  const watchedIds = new Set(progress?.watched_videos ?? [])

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm flex-wrap" style={{ color: 'var(--text-muted)' }}>
        <Link href="/learn" className="hover:text-indigo-400 transition-colors">Learning Hub</Link>
        <span>/</span>
        <Link href={`/learn/${resolvedParams.subject}`} className="hover:text-indigo-400 transition-colors">
          {decodeURIComponent(resolvedParams.subject)}
        </Link>
        <span>/</span>
        <span style={{ color: 'var(--text-primary)' }}>{topic.subtopic}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
            {topic.subject} · {topic.topic}
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{topic.subtopic}</h1>
          {topic.description && (
            <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {topic.description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button onClick={() => fetchMaterial('ai')} disabled={fetchingMaterial}
            className="btn-secondary text-sm px-4 py-2 flex items-center gap-2">
            {fetchingMaterial ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
            Learn Material
          </button>
          <button onClick={generateSummary} disabled={loadingAI}
            className="btn-secondary text-sm px-4 py-2 flex items-center gap-2">
            {loadingAI ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            AI Summary
          </button>
          <button onClick={toggleComplete}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
              progress?.completed
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'btn-ghost border border-dashed'
            }`}
            style={!progress?.completed ? { borderColor: 'var(--border-subtle)' } : {}}>
            <CheckCircle2 className="w-4 h-4" />
            {progress?.completed ? 'Completed' : 'Mark Done'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-list">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`tab-item ${activeTab === tab.id ? 'active' : ''}`}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { label: 'Videos', value: videos.length, sub: `${watchedIds.size} watched`, icon: '🎥' },
              { label: 'Notes', value: notes.length, sub: `${notes.filter(n => n.bookmarked).length} bookmarked`, icon: '📝' },
              { label: 'My Notes', value: userNotes.length, sub: 'personal notes', icon: '✍️' },
            ].map(item => (
              <div key={item.label} className="card p-5 text-center">
                <div className="text-3xl mb-2">{item.icon}</div>
                <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{item.value}</div>
                <div className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{item.label}</div>
                <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{item.sub}</div>
              </div>
            ))}
          </div>
          <div className="card p-6">
            <h3 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Quick Actions</h3>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => setActiveTab('videos')} className="btn-secondary text-sm px-4 py-2">
                🎥 Watch Videos
              </button>
              <button onClick={() => setActiveTab('notes')} className="btn-secondary text-sm px-4 py-2">
                📝 Read Notes
              </button>
              <button onClick={() => fetchMaterial('comprehensive')} disabled={fetchingMaterial}
                className="btn-secondary text-sm px-4 py-2 flex items-center gap-2">
                {fetchingMaterial ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
                Fetch AI Material
              </button>
              <button onClick={generateSummary} className="btn-secondary text-sm px-4 py-2">
                🧠 AI Summary
              </button>
              <button onClick={() => setActiveTab('practice')} className="btn-primary text-sm px-4 py-2 flex items-center gap-2"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
                <FlaskConical className="w-4 h-4" /> Practice Quiz
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Videos */}
      {activeTab === 'videos' && (
        <div className="space-y-4">
          {/* Add Video Form */}
          {topic && (
            <AddVideoForm
              topicId={topic.id}
              onAdded={(v) => setVideos(prev => [...prev, v as Video])}
            />
          )}
          {videos.length === 0 && (
            <div className="card p-10 text-center" style={{ color: 'var(--text-muted)' }}>
              <Play className="w-10 h-10 mx-auto mb-3 opacity-40" />
              No videos yet — add one above!
            </div>
          )}
          {activeVideo && (
            <div className="card overflow-hidden">
              <div className="aspect-video w-full">
                <iframe
                  src={`https://www.youtube.com/embed/${getYouTubeId(activeVideo)}?autoplay=1`}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          )}
          <div className="space-y-3">
            {videos.map((video, i) => {
              const watched = watchedIds.has(video.id)
              const ytId = getYouTubeId(video.youtube_url)
              const mins = Math.floor(video.duration_seconds / 60)
              return (
                <div key={video.id} className="card p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
                    style={{ background: watched ? 'rgba(16,185,129,0.1)' : 'rgba(99,102,241,0.1)', color: watched ? '#10b981' : '#a5b4fc' }}>
                    {watched ? '✓' : i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate" style={{ color: 'var(--text-primary)' }}>{video.title}</div>
                    {mins > 0 && <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{mins} min</div>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => { setActiveVideo(video.youtube_url); markVideoWatched(video.id) }}
                      className="btn-primary text-xs px-3 py-1.5">
                      <Play className="w-3 h-3" /> Watch
                    </button>
                    <a href={video.youtube_url} target="_blank" rel="noopener noreferrer" className="btn-ghost p-2">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Tab: Notes */}
      {activeTab === 'notes' && (
        <div className="space-y-6">
          {/* Add Curated Note Form */}
          {topic && (
            <AddCuratedNoteForm
              topicId={topic.id}
              onAdded={(n) => setNotes(prev => [n as Note & { bookmarked: boolean }, ...prev])}
            />
          )}
          {/* Curated notes */}
          {notes.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Curated Notes
              </h3>
              {notes.map(note => (
                <div key={note.id} className="card p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h4 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{note.title}</h4>
                    <button onClick={() => toggleBookmark(note.id)} className="shrink-0 p-1.5 rounded-lg transition-colors"
                      style={{ color: note.bookmarked ? '#f59e0b' : 'var(--text-muted)' }}>
                      <Bookmark className={`w-4 h-4 ${note.bookmarked ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                  {note.content && (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>
                      {note.content}
                    </p>
                  )}
                  {note.link && (
                    <a href={note.link} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs mt-3 text-indigo-400 hover:text-indigo-300">
                      <ExternalLink className="w-3 h-3" /> Open resource
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Personal notes */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              My Notes
            </h3>
            <div className="card p-4 space-y-3">
              <textarea
                value={newNote} onChange={e => setNewNote(e.target.value)}
                placeholder="Add a personal note for this topic..."
                rows={3}
                className="input resize-none text-sm"
              />
              <button onClick={addUserNote} disabled={savingNote || !newNote.trim()}
                className="btn-primary text-sm px-4 py-2 flex items-center gap-2">
                {savingNote ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Add Note
              </button>
            </div>
            {userNotes.map(note => (
              <div key={note.id} className="card p-4 flex items-start gap-3">
                <p className="flex-1 text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>
                  {note.content}
                </p>
                <button onClick={() => deleteUserNote(note.id)} className="shrink-0 p-1.5 rounded-lg transition-colors hover:text-red-400"
                  style={{ color: 'var(--text-muted)' }}>
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: AI Summary */}
      {activeTab === 'ai' && (
        <div className="space-y-4">
          {loadingAI && (
            <div className="card p-12 text-center space-y-4">
              <Loader2 className="w-10 h-10 animate-spin mx-auto" style={{ color: '#a5b4fc' }} />
              <p style={{ color: 'var(--text-secondary)' }}>Gemini is summarizing this topic...</p>
            </div>
          )}
          {!loadingAI && !summary && (
            <div className="card p-12 text-center space-y-4">
              <Brain className="w-12 h-12 mx-auto opacity-40" style={{ color: 'var(--text-muted)' }} />
              <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>AI Summary</h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Let Gemini explain this topic in simple language with key points and revision notes.
              </p>
              <button onClick={generateSummary} className="btn-primary px-6 py-3 mx-auto">
                <Sparkles className="w-4 h-4" /> Generate Summary
              </button>
            </div>
          )}
          {summary && (
            <div className="space-y-4 animate-slide-up">
              <div className="card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg">💡</span>
                  <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>Easy Explanation</h3>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {summary.easyExplanation}
                </p>
              </div>
              <div className="card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg">🔑</span>
                  <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>Key Points</h3>
                </div>
                <ul className="space-y-2">
                  {summary.keyPoints.map((pt, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 text-white"
                        style={{ background: 'var(--brand-gradient)' }}>{i + 1}</span>
                      {pt}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg">📋</span>
                  <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>Revision Notes</h3>
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>
                  {summary.revisionNotes}
                </p>
              </div>
              <button onClick={generateSummary} className="btn-ghost text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Regenerate
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab: Practice Quiz */}
      {activeTab === 'practice' && (
        <div className="space-y-5 animate-fade-in">
          <div className="card p-6 space-y-5" style={{ background: 'rgba(99,102,241,0.04)', borderColor: 'rgba(99,102,241,0.15)' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #7c3aed22, #4f46e522)' }}>
                <FlaskConical className="w-5 h-5" style={{ color: '#a78bfa' }} />
              </div>
              <div>
                <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>AI Practice Quiz</h3>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  Gemini generates GATE-style questions from this topic&apos;s notes &amp; content
                </p>
              </div>
            </div>

            {/* How it works */}
            <div className="rounded-xl p-4 text-sm space-y-1.5" style={{ background: 'rgba(99,102,241,0.06)' }}>
              <p className="font-semibold text-xs uppercase tracking-wider mb-2" style={{ color: '#a5b4fc' }}>How it works</p>
              {[
                '🧠 Gemini reads the notes and video topics for this subtopic',
                '✍️  Generates fresh GATE-style MCQs (not from internet PYQs)',
                '🚀 Creates a timed test and redirects you automatically',
              ].map((step) => (
                <p key={step} className="text-xs" style={{ color: 'var(--text-secondary)' }}>{step}</p>
              ))}
            </div>

            {/* Question count selector */}
            <div>
              <label className="block text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>
                Number of Questions
              </label>
              <div className="flex gap-3 flex-wrap">
                {([5, 10, 15, 20] as QuizCount[]).map((n) => (
                  <button key={n} onClick={() => setQuizCount(n)}
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 border"
                    style={quizCount === n
                      ? { background: 'rgba(99,102,241,0.15)', borderColor: 'rgba(99,102,241,0.5)', color: '#a5b4fc' }
                      : { background: 'rgba(255,255,255,0.03)', borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }
                    }>
                    {n} Qs
                  </button>
                ))}
              </div>
              <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                ⏱ Estimated time: ~{quizCount * 2} minutes
              </p>
            </div>

            {/* Notes tip */}
            {notes.length === 0 && (
              <div className="rounded-xl p-3 text-xs flex items-start gap-2"
                style={{ background: 'rgba(245,158,11,0.06)', borderColor: 'rgba(245,158,11,0.2)', border: '1px solid' }}>
                <span>💡</span>
                <span style={{ color: '#fcd34d' }}>
                  Add notes to this topic for more accurate questions. Gemini will use them to tailor the quiz.
                </span>
              </div>
            )}

            {quizError && (
              <div className="rounded-xl p-3 text-sm"
                style={{ background: 'rgba(239,68,68,0.08)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.2)' }}>
                ⚠️ {quizError}
              </div>
            )}

            <button onClick={generatePracticeQuiz} disabled={generatingQuiz}
              className="btn-primary w-full py-3.5 text-base flex items-center justify-center gap-3"
              style={{ background: generatingQuiz ? undefined : 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
              {generatingQuiz ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Gemini is generating {quizCount} questions…</span>
                </>
              ) : (
                <>
                  <FlaskConical className="w-5 h-5" />
                  <span>Generate {quizCount}-Question Practice Quiz</span>
                </>
              )}
            </button>
          </div>

          {/* Info card */}
          <div className="card p-5" style={{ background: 'rgba(16,185,129,0.04)', borderColor: 'rgba(16,185,129,0.15)' }}>
            <p className="text-xs font-semibold mb-2" style={{ color: '#6ee7b7' }}>GATE MARKING SCHEME</p>
            <div className="flex gap-6 text-sm">
              <span style={{ color: 'var(--text-secondary)' }}>✅ Correct: <span className="text-emerald-400 font-semibold">+1</span></span>
              <span style={{ color: 'var(--text-secondary)' }}>❌ Wrong: <span className="text-red-400 font-semibold">−0.33</span></span>
              <span style={{ color: 'var(--text-secondary)' }}>⬜ Skip: <span className="text-slate-400 font-semibold">0</span></span>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Learn Material (AI + Internet) */}
      {activeTab === 'material' && (
        <div className="space-y-5 animate-fade-in">
          {/* Controls */}
          <div className="card p-5" style={{ background: 'rgba(59,130,246,0.04)', borderColor: 'rgba(59,130,246,0.15)' }}>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h3 className="font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <Globe className="w-4 h-4" style={{ color: '#60a5fa' }} /> AI Learning Material
                </h3>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  Gemini generates comprehensive GATE-focused content for {topic.subtopic}
                </p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button onClick={() => fetchMaterial('ai')} disabled={fetchingMaterial}
                  className="btn-secondary text-sm px-4 py-2 flex items-center gap-2">
                  {fetchingMaterial ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  Generate
                </button>
                <button onClick={() => fetchMaterial('comprehensive')} disabled={fetchingMaterial}
                  className="btn-primary text-sm px-4 py-2 flex items-center gap-2"
                  style={{ background: 'linear-gradient(135deg,#2563eb,#4f46e5)' }}>
                  {fetchingMaterial ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
                  Generate &amp; Save as Notes
                </button>
              </div>
            </div>
            {materialError && (
              <div className="mt-3 rounded-xl p-3 text-xs" style={{ background: 'rgba(239,68,68,0.08)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.2)' }}>
                ⚠️ {materialError}
              </div>
            )}
          </div>

          {fetchingMaterial && (
            <div className="card p-12 text-center">
              <Loader2 className="w-10 h-10 animate-spin mx-auto mb-3" style={{ color: '#60a5fa' }} />
              <p style={{ color: 'var(--text-secondary)' }}>Gemini is building your learning material…</p>
            </div>
          )}

          {fetchedMaterial && !fetchingMaterial && (
            <div className="space-y-4">
              {/* Concept Explanation */}
              <div className="card p-6">
                <h4 className="font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>💡 Concept Explanation</h4>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{fetchedMaterial.concept_explanation}</p>
              </div>

              {/* Key Points + Mnemonics side by side */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="card p-5">
                  <h4 className="font-bold mb-3 text-sm" style={{ color: 'var(--text-primary)' }}>🔑 Key Points for GATE</h4>
                  <ul className="space-y-2">
                    {fetchedMaterial.key_points.map((pt, i) => (
                      <li key={i} className="flex gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                        <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 text-white" style={{ background: 'var(--brand-gradient)' }}>{i + 1}</span>
                        {pt}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-4">
                  <div className="card p-5">
                    <h4 className="font-bold mb-3 text-sm" style={{ color: 'var(--text-primary)' }}>🧠 Memory Tricks</h4>
                    {fetchedMaterial.mnemonics.map((m, i) => (
                      <p key={i} className="text-xs mb-1" style={{ color: '#a5b4fc' }}>✨ {m}</p>
                    ))}
                  </div>
                  <div className="card p-5" style={{ borderColor: 'rgba(239,68,68,0.2)' }}>
                    <h4 className="font-bold mb-3 text-sm" style={{ color: 'var(--text-primary)' }}>⚠️ Common Mistakes</h4>
                    {fetchedMaterial.common_mistakes.map((m, i) => (
                      <p key={i} className="text-xs mb-1" style={{ color: '#fca5a5' }}>• {m}</p>
                    ))}
                  </div>
                </div>
              </div>

              {/* GATE Patterns */}
              <div className="card p-5">
                <h4 className="font-bold mb-3" style={{ color: 'var(--text-primary)' }}>🎯 GATE Question Patterns</h4>
                <div className="space-y-3">
                  {fetchedMaterial.gate_patterns.map((p, i) => (
                    <div key={i} className="rounded-xl p-3 flex gap-3" style={{ background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.1)' }}>
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold shrink-0 h-fit" style={{
                        background: p.frequency === 'High' ? 'rgba(239,68,68,0.15)' : p.frequency === 'Medium' ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.15)',
                        color: p.frequency === 'High' ? '#f87171' : p.frequency === 'Medium' ? '#fbbf24' : '#34d399',
                      }}>{p.frequency}</span>
                      <div>
                        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{p.pattern}</p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>→ {p.tip}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Worked Example */}
              <div className="card p-5" style={{ borderColor: 'rgba(16,185,129,0.2)' }}>
                <h4 className="font-bold mb-3" style={{ color: 'var(--text-primary)' }}>📝 Worked Example</h4>
                <div className="rounded-xl p-4 mb-3" style={{ background: 'rgba(16,185,129,0.05)' }}>
                  <p className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Q: {fetchedMaterial.worked_example.question}</p>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{fetchedMaterial.worked_example.solution}</p>
                </div>
                <p className="text-xs" style={{ color: '#6ee7b7' }}>💡 Key insight: {fetchedMaterial.worked_example.key_insight}</p>
              </div>

              {/* Difficulty Breakdown */}
              <div className="grid sm:grid-cols-3 gap-3">
                {(['easy','medium','hard'] as const).map(level => (
                  <div key={level} className="card p-4">
                    <span className={`badge mb-2 ${level === 'easy' ? 'badge-easy' : level === 'medium' ? 'badge-medium' : 'badge-hard'}`}>{level}</span>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{fetchedMaterial.difficulty_breakdown[level]}</p>
                  </div>
                ))}
              </div>

              {/* Resources */}
              <div className="card p-5">
                <h4 className="font-bold mb-3" style={{ color: 'var(--text-primary)' }}>📚 Study Resources</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#60a5fa' }}>YouTube Searches</p>
                    {fetchedMaterial.resources.youtube_searches.map((q, i) => (
                      <a key={i} href={`https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 text-xs mb-2 hover:text-indigo-400 transition-colors" style={{ color: 'var(--text-secondary)' }}>
                        <Play className="w-3 h-3 shrink-0" style={{ color: '#f87171' }} /> {q}
                      </a>
                    ))}
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#a78bfa' }}>Books &amp; References</p>
                    {fetchedMaterial.resources.key_books.map((b, i) => (
                      <p key={i} className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>📖 {b}</p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {!fetchedMaterial && !fetchingMaterial && (
            <div className="card p-12 text-center">
              <Globe className="w-12 h-12 mx-auto mb-4 opacity-30" style={{ color: '#60a5fa' }} />
              <h3 className="font-bold mb-2" style={{ color: 'var(--text-primary)' }}>AI Learning Material</h3>
              <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>Generate comprehensive study material including explanations, GATE patterns, worked examples, mnemonics, and resources.</p>
              <div className="flex gap-3 justify-center flex-wrap">
                <button onClick={() => fetchMaterial('ai')} className="btn-secondary px-5 py-2.5 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> Generate Material
                </button>
                <button onClick={() => fetchMaterial('comprehensive')} className="btn-primary px-5 py-2.5 flex items-center gap-2"
                  style={{ background: 'linear-gradient(135deg,#2563eb,#4f46e5)' }}>
                  <Globe className="w-4 h-4" /> Generate &amp; Auto-Save Notes
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
