'use client'
import { useState } from 'react'
import { Plus, Loader2, BookOpen, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function AddSubjectForm() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [subject, setSubject] = useState('')
  const [topic, setTopic] = useState('')
  const [subtopic, setSubtopic] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const submit = async () => {
    if (!subject.trim() || !topic.trim() || !subtopic.trim()) { 
      setError('Subject, Topic, and Subtopic are required')
      return 
    }
    setSaving(true); setError('')
    const res = await fetch('/api/learning/topics', {
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject, topic, subtopic, description }),
    })
    const data = await res.json()
    if (data.topic) { 
      setOpen(false)
      setSubject('')
      setTopic('')
      setSubtopic('')
      setDescription('')
      router.refresh()
    } else {
      setError(data.error ?? 'Failed to add subject')
    }
    setSaving(false)
  }

  if (!open) return (
    <button onClick={() => setOpen(true)} className="btn-secondary px-6 py-2.5 flex items-center gap-2">
      <Plus className="w-5 h-5" /> Add New Subject
    </button>
  )

  return (
    <div className="card p-6 space-y-4 mb-8 border-2 animate-fade-in" style={{ borderColor: 'rgba(99,102,241,0.3)' }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
          <BookOpen className="w-5 h-5 text-indigo-400" /> Create New Subject Curriculum
        </div>
        <button onClick={() => setOpen(false)} className="btn-ghost p-2"><X className="w-5 h-5" /></button>
      </div>
      
      <div className="grid md:grid-cols-3 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Subject Name</label>
          <input className="input" placeholder="e.g. Discrete Math"
            value={subject} onChange={e => setSubject(e.target.value)} />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>First Main Topic</label>
          <input className="input" placeholder="e.g. Logic"
            value={topic} onChange={e => setTopic(e.target.value)} />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>First Subtopic</label>
          <input className="input" placeholder="e.g. Propositional Logic"
            value={subtopic} onChange={e => setSubtopic(e.target.value)} />
        </div>
      </div>
      
      <div className="space-y-1">
        <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Description (optional)</label>
        <textarea className="input resize-none" placeholder="Brief description of this first topic..." rows={2}
          value={description} onChange={e => setDescription(e.target.value)} />
      </div>

      {error && <div className="text-xs p-2 rounded bg-red-500/10 text-red-400">{error}</div>}
      
      <div className="flex justify-end">
        <button onClick={submit} disabled={saving} className="btn-primary px-6 py-2 flex items-center gap-2">
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />} Add Subject
        </button>
      </div>
    </div>
  )
}
