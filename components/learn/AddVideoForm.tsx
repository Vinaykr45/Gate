'use client'
import { useState } from 'react'
import { Plus, Loader2, PlayCircle, X } from 'lucide-react'

interface Props { topicId: string; onAdded: (video: unknown) => void }

export function AddVideoForm({ topicId, onAdded }: Props) {
  const [open, setOpen] = useState(false)
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const parseYtUrl = (u: string) => {
    const listMatch = u.match(/[?&]list=([^&\n?#]+)/)
    const videoMatch = u.match(/(?:v=|youtu\.be\/)([^&\n?#]+)/)
    return listMatch ? { type: 'playlist', id: listMatch[1] } : videoMatch ? { type: 'video', id: videoMatch[1] } : null
  }

  const submit = async () => {
    if (!url.trim() || !title.trim()) { setError('Title and URL are required'); return }
    if (!parseYtUrl(url)) { setError('Please enter a valid YouTube Video or Playlist URL'); return }
    setSaving(true); setError('')
    const res = await fetch('/api/videos', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic_id: topicId, title, youtube_url: url }),
    })
    const data = await res.json()
    if (data.video) { onAdded(data.video); setOpen(false); setUrl(''); setTitle('') }
    else setError(data.error ?? 'Failed to add video/playlist')
    setSaving(false)
  }

  if (!open) return (
    <button onClick={() => setOpen(true)} className="btn-secondary text-sm px-4 py-2 flex items-center gap-2 w-full justify-center">
      <Plus className="w-4 h-4" /> Add YouTube Video or Playlist
    </button>
  )

  return (
    <div className="card p-5 space-y-3 border-2 animate-fade-in" style={{ borderColor: 'rgba(99,102,241,0.3)' }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
          <PlayCircle className="w-4 h-4 text-red-500" /> Add YouTube Link
        </div>
        <button onClick={() => setOpen(false)} className="btn-ghost p-1"><X className="w-4 h-4" /></button>
      </div>
      <input className="input text-sm" placeholder="Title (e.g. OS Full Course Playlist)"
        value={title} onChange={e => setTitle(e.target.value)} />
      <input className="input text-sm" placeholder="YouTube URL (Video or Playlist)"
        value={url} onChange={e => setUrl(e.target.value)} />
      {url && parseYtUrl(url) && (
        <div className="text-xs rounded-lg px-3 py-2" style={{ background: 'rgba(16,185,129,0.08)', color: '#10b981' }}>
          ✓ Valid YouTube {parseYtUrl(url)?.type} detected
        </div>
      )}
      {error && <div className="text-xs text-red-400">{error}</div>}
      <button onClick={submit} disabled={saving} className="btn-primary text-sm px-4 py-2 flex items-center gap-2 justify-center w-full mt-2">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Save to Hub
      </button>
    </div>
  )
}
