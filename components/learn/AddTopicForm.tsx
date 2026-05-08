'use client'
import { useState } from 'react'
import { Plus, Loader2, BookOpen, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Props { subject: string }

export function AddTopicForm({ subject }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [topic, setTopic] = useState('')
  const [subtopic, setSubtopic] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const submit = async () => {
    if (!topic.trim() || !subtopic.trim()) { setError('Topic and Subtopic are required'); return }
    setSaving(true); setError('')
    const res = await fetch('/api/learning/topics', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject, topic, subtopic, description }),
    })
    const data = await res.json()
    if (data.topic) { 
      setOpen(false); setTopic(''); setSubtopic(''); setDescription('');
      router.refresh();
    }
    else setError(data.error ?? 'Failed to add topic')
    setSaving(false)
  }

  if (!open) return (
    <button onClick={() => setOpen(true)} className="btn-secondary text-sm px-4 py-2 flex items-center gap-2">
      <Plus className="w-4 h-4" /> Add Topic
    </button>
  )

  return (
    <div className="card p-5 space-y-3 mb-6 border-2" style={{ borderColor: 'rgba(16,185,129,0.3)' }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
          <BookOpen className="w-4 h-4 text-emerald-500" /> Add New Topic to {decodeURIComponent(subject)}
        </div>
        <button onClick={() => setOpen(false)} className="btn-ghost p-1"><X className="w-4 h-4" /></button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <input className="input text-sm" placeholder="Main Topic (e.g. Operating Systems)"
          value={topic} onChange={e => setTopic(e.target.value)} />
        <input className="input text-sm" placeholder="Subtopic (e.g. Memory Management)"
          value={subtopic} onChange={e => setSubtopic(e.target.value)} />
      </div>
      <textarea className="input text-sm resize-none" placeholder="Brief description (optional)" rows={2}
        value={description} onChange={e => setDescription(e.target.value)} />
      {error && <div className="text-xs text-red-400">{error}</div>}
      <button onClick={submit} disabled={saving} className="btn-primary text-sm px-4 py-2 flex items-center gap-2">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Create Topic
      </button>
    </div>
  )
}
