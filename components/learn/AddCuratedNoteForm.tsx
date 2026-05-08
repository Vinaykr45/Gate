'use client'
import { useState } from 'react'
import { Plus, Loader2, FileText, Link as LinkIcon, X } from 'lucide-react'

interface Props { topicId: string; onAdded: (note: unknown) => void }

export function AddCuratedNoteForm({ topicId, onAdded }: Props) {
  const [open, setOpen] = useState(false)
  const [noteType, setNoteType] = useState<'text' | 'link'>('text')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [link, setLink] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const submit = async () => {
    if (!title.trim()) { setError('Title is required'); return }
    if (noteType === 'link' && !link.trim()) { setError('URL is required for link notes'); return }
    setSaving(true); setError('')
    const res = await fetch('/api/notes', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'curated', topic_id: topicId, title, content: content || null, link: link || null, type: noteType }),
    })
    const data = await res.json()
    if (data.note) {
      onAdded({ ...data.note, bookmarked: false })
      setOpen(false); setTitle(''); setContent(''); setLink('')
    } else setError(data.error ?? 'Failed to add note')
    setSaving(false)
  }

  if (!open) return (
    <button onClick={() => setOpen(true)} className="btn-secondary text-sm px-4 py-2 flex items-center gap-2 w-full">
      <Plus className="w-4 h-4" /> Add Resource Note
    </button>
  )

  return (
    <div className="card p-5 space-y-3 border-2" style={{ borderColor: 'rgba(99,102,241,0.3)' }}>
      <div className="flex items-center justify-between">
        <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Add Resource Note</span>
        <button onClick={() => setOpen(false)} className="btn-ghost p-1"><X className="w-4 h-4" /></button>
      </div>

      {/* Type toggle */}
      <div className="flex gap-2">
        {(['text', 'link'] as const).map(t => (
          <button key={t} onClick={() => setNoteType(t)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${noteType === t ? 'text-white' : 'btn-ghost'}`}
            style={noteType === t ? { background: 'var(--brand-gradient)' } : {}}>
            {t === 'text' ? <FileText className="w-3 h-3" /> : <LinkIcon className="w-3 h-3" />}
            {t === 'text' ? 'Text Note' : 'External Link'}
          </button>
        ))}
      </div>

      <input className="input text-sm" placeholder="Note title (e.g. Four Conditions for Deadlock)"
        value={title} onChange={e => setTitle(e.target.value)} />

      {noteType === 'text' && (
        <textarea className="input text-sm resize-none" rows={4}
          placeholder="Write the note content here... Supports plain text."
          value={content} onChange={e => setContent(e.target.value)} />
      )}

      {noteType === 'link' && (
        <input className="input text-sm" placeholder="URL (e.g. https://geeksforgeeks.org/...)"
          value={link} onChange={e => setLink(e.target.value)} />
      )}

      {error && <div className="text-xs text-red-400">{error}</div>}
      <button onClick={submit} disabled={saving} className="btn-primary text-sm px-4 py-2 flex items-center gap-2">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Add Note
      </button>
    </div>
  )
}
