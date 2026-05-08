'use client'
import { useState } from 'react'
import { Trash2, Loader2, AlertTriangle, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Props {
  ids: string[]
  label: string
}

export function DeleteGroupButton({ ids, label }: Props) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  const handleDelete = async () => {
    setDeleting(true)
    setError('')
    try {
      await Promise.all(
        ids.map(id => fetch(`/api/learning/topics?id=${id}`, { method: 'DELETE' }))
      )
      router.refresh()
    } catch {
      setError('Delete failed')
      setDeleting(false)
      setConfirming(false)
    }
  }

  if (!confirming) {
    return (
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setConfirming(true) }}
        title={`Delete topic group "${label}"`}
        style={{
          padding: '4px 8px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.25)',
          background: 'rgba(239,68,68,0.06)', cursor: 'pointer',
          color: '#f87171', display: 'flex', alignItems: 'center', gap: 4,
          fontSize: 12, fontWeight: 600, transition: 'background 0.15s',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.14)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.06)')}
      >
        <Trash2 style={{ width: 13, height: 13 }} />
        Delete Group
      </button>
    )
  }

  return (
    <div
      className="animate-fade-in"
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '4px 10px', borderRadius: 12,
        background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
      }}
      onClick={(e) => { e.preventDefault(); e.stopPropagation() }}
    >
      {error ? (
        <>
          <span style={{ fontSize: 12, color: '#f87171' }}>{error}</span>
          <button onClick={() => setError('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f87171', display: 'flex' }}>
            <X style={{ width: 12, height: 12 }} />
          </button>
        </>
      ) : (
        <>
          <AlertTriangle style={{ width: 13, height: 13, color: '#f87171', flexShrink: 0 }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: '#f87171', whiteSpace: 'nowrap' }}>
            Delete &ldquo;{label.slice(0, 20)}&rdquo; ({ids.length} subtopics)?
          </span>
          <button
            onClick={handleDelete}
            disabled={deleting}
            style={{
              fontSize: 11, padding: '2px 8px', borderRadius: 6, fontWeight: 700,
              background: '#ef4444', color: '#fff', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 4, opacity: deleting ? 0.7 : 1,
            }}
          >
            {deleting && <Loader2 style={{ width: 11, height: 11, animation: 'spin 1s linear infinite' }} />}
            {deleting ? 'Deleting…' : 'Delete all'}
          </button>
          <button
            onClick={() => setConfirming(false)}
            style={{
              fontSize: 11, padding: '2px 8px', borderRadius: 6, fontWeight: 600,
              background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)', border: 'none', cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        </>
      )}
    </div>
  )
}
