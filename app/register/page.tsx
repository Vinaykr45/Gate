'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BRAND, type ExamTrackId } from '@/lib/brand'

export default function RegisterPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [examTrack, setExamTrack] = useState<ExamTrackId>('gate_cse')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          target_track: examTrack,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen hero-grid hero-radial flex items-center justify-center px-4" style={{ background: 'var(--bg-primary)' }}>
        <div className="w-full max-w-md card p-8 text-center animate-slide-up">
          <div className="w-14 h-14 rounded-full mx-auto flex items-center justify-center mb-4"
            style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Check your email</h2>
          <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
            We've sent a verification link to <strong className="text-white">{email}</strong>.
            Click the link in your inbox to activate your {BRAND.shortName} account.
          </p>
          <Link href="/login" className="btn-primary w-full py-3 inline-block">
            Proceed to Sign In
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen hero-grid hero-radial flex items-center justify-center px-4 py-12" style={{ background: 'var(--bg-primary)' }}>
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
              style={{ background: 'linear-gradient(135deg,#0f172a,#4f46e5)', border: '1px solid rgba(99,102,241,0.3)' }}>P</div>
            <span className="text-white font-bold text-xl">PrepAxis <span className="gradient-text">AI</span></span>
          </Link>
          <h1 className="text-3xl font-bold text-white">Create your account</h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Select your target exam and start personalized preparation
          </p>
        </div>

        <div className="card p-8">
          {error && (
            <div className="mb-6 p-4 rounded-xl text-sm border"
              style={{ background: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.2)', color: '#fca5a5' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Target Examination Track</label>
              <select
                id="examTrack"
                value={examTrack}
                onChange={(e) => setExamTrack(e.target.value as ExamTrackId)}
                className="input cursor-pointer"
              >
                {BRAND.tracks.map(t => (
                  <option key={t.id} value={t.id} className="bg-slate-900 text-white">
                    {t.name} — {t.level}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Full Name</label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="input"
                placeholder="e.g. John Doe"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Email Address</label>
              <input
                id="reg-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Password</label>
              <input
                id="reg-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="Minimum 6 characters"
                required
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Creating Account...
                </span>
              ) : 'Start Free Preparation'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm mt-6" style={{ color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link href="/login" className="font-medium" style={{ color: '#a5b4fc' }}>
            Sign in →
          </Link>
        </p>
      </div>
    </div>
  )
}
