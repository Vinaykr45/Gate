'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { BRAND } from '@/lib/brand'

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Unhandled app error:', error)
  }, [error])

  return (
    <div className="min-h-screen hero-grid hero-radial flex items-center justify-center px-4" style={{ background: 'var(--bg-primary)' }}>
      <div className="w-full max-w-md card p-8 text-center animate-slide-up space-y-4">
        <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center font-black text-2xl text-red-400"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
          !
        </div>
        <h1 className="text-2xl font-bold text-white">Something went wrong</h1>
        <p className="text-sm text-slate-400">
          An unexpected application error occurred. Your saved examination progress and notes are secure.
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <button onClick={() => reset()} className="btn-primary text-xs px-5 py-2.5">
            Try Again
          </button>
          <Link href="/dashboard" className="btn-secondary text-xs px-5 py-2.5">
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
