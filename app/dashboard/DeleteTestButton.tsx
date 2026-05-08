'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Loader2 } from 'lucide-react'

export default function DeleteTestButton({ testId }: { testId: string }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm('Delete this test? This cannot be undone.')) return

    setIsDeleting(true)
    try {
      const res = await fetch(`/api/tests/${testId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed')
      router.refresh()
    } catch {
      alert('Error deleting test.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="p-1.5 rounded-lg transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
      style={{ color: 'var(--text-muted)' }}
      onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
      title="Delete test"
    >
      {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
    </button>
  )
}
