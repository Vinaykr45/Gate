'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'
import {
  LayoutDashboard, FileText, BarChart2,
  Sparkles, BookOpen, LogOut, Menu, X,
  FlaskConical, TrendingUp, History, PlusCircle,
  CalendarCheck, Repeat, ShieldCheck, ChevronDown
} from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'
import { BRAND, type ExamTrackId } from '@/lib/brand'

const NAV_SECTIONS = [
  {
    label: 'Curriculum & Tests',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/learn', label: 'Curriculum Hub', icon: BookOpen },
      { href: '/test', label: 'Mock Tests', icon: FileText },
      { href: '/test-history', label: 'Test History', icon: History },
      { href: '/planner', label: 'Study Planner', icon: CalendarCheck },
    ],
  },
  {
    label: 'Analyze & Retain',
    items: [
      { href: '/revision', label: 'Mistake Book (SRS)', icon: Repeat },
      { href: '/analytics', label: 'Analytics', icon: BarChart2 },
      { href: '/insights', label: 'AI Diagnostics', icon: Sparkles },
    ],
  },
  {
    label: 'Management',
    items: [
      { href: '/dashboard/add-pyq', label: 'Add Questions', icon: PlusCircle },
      { href: '/admin', label: 'Admin & AI Health', icon: ShieldCheck },
    ],
  },
]

interface Profile {
  full_name?: string
  email?: string
  target_track?: string
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [currentTrack, setCurrentTrack] = useState<ExamTrackId>('gate_cse')
  const supabase = createClient()

  useEffect(() => {
    // Check local storage for active exam track
    const savedTrack = localStorage.getItem('prepaxis_active_track') as ExamTrackId | null
    if (savedTrack && BRAND.tracks.some(t => t.id === savedTrack)) {
      setCurrentTrack(savedTrack)
    }

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase.from('profiles').select('full_name, email').eq('id', user.id).single()
          .then(({ data }) => {
            const metaTrack = (user.user_metadata?.target_track as ExamTrackId) || 'gate_cse'
            setProfile({ ...data, target_track: metaTrack })
            if (!savedTrack) {
              setCurrentTrack(metaTrack)
              localStorage.setItem('prepaxis_active_track', metaTrack)
            }
          })
      }
    })
  }, [])

  const handleTrackChange = (newTrack: ExamTrackId) => {
    setCurrentTrack(newTrack)
    localStorage.setItem('prepaxis_active_track', newTrack)
    window.dispatchEvent(new CustomEvent('prepaxis:track-changed', { detail: { track: newTrack } }))
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const allItems = NAV_SECTIONS.flatMap(s => s.items)
  const currentItem = allItems.find(n =>
    n.href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(n.href)
  )
  const currentLabel = currentItem?.label || 'Dashboard'
  const activeTrackObj = BRAND.tracks.find(t => t.id === currentTrack) || BRAND.tracks[0]

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-primary)' }}>

      {/* ── Sidebar ── */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 flex flex-col w-64 border-r transition-transform duration-300
        md:relative md:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `} style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}>

        {/* Logo */}
        <div className="flex items-center gap-3 px-5 h-16 border-b shrink-0" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-sm shrink-0"
            style={{ background: 'linear-gradient(135deg,#0f172a,#4f46e5)', border: '1px solid rgba(99,102,241,0.3)' }}>P</div>
          <div>
            <span className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>
              PrepAxis <span className="gradient-text">AI</span>
            </span>
            <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Multi-Exam Prep</div>
          </div>
        </div>

        {/* Exam Track Switcher */}
        <div className="px-3 pt-3 pb-1 shrink-0">
          <label className="text-[10px] font-semibold uppercase tracking-wider block px-2 mb-1 text-slate-400">
            Active Exam Track
          </label>
          <div className="relative">
            <select
              value={currentTrack}
              onChange={(e) => handleTrackChange(e.target.value as ExamTrackId)}
              className="w-full text-xs font-semibold py-2 px-3 pr-8 rounded-lg bg-slate-800/80 border border-slate-700/60 text-white appearance-none cursor-pointer focus:outline-none focus:border-indigo-500"
            >
              {BRAND.tracks.map(t => (
                <option key={t.id} value={t.id} className="bg-slate-900 text-white">
                  {t.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 space-y-5 overflow-y-auto">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label}>
              <p className="text-[11px] font-semibold uppercase px-3 mb-1.5 tracking-wider"
                style={{ color: 'var(--text-muted)' }}>
                {section.label}
              </p>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon
                  let isActive = false
                  if (item.href === '/dashboard') {
                    isActive = pathname === '/dashboard'
                  } else if (item.href === '/test') {
                    isActive = pathname === '/test' && !pathname.includes('/results')
                  } else if (item.href === '/test-history') {
                    isActive = pathname === '/test-history' || pathname.startsWith('/test-history/') || (pathname.startsWith('/test/') && pathname.includes('/results'))
                  } else {
                    isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                  }
                  return (
                    <Link key={item.href} href={item.href}
                      className={`nav-item text-xs font-medium py-2 ${isActive ? 'active' : ''}`}
                      onClick={() => setSidebarOpen(false)}>
                      <Icon className="w-4 h-4 shrink-0" />
                      {item.label}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User footer */}
        <div className="px-3 pb-3 border-t pt-3 shrink-0" style={{ borderColor: 'var(--border-subtle)' }}>
          {profile && (
            <div className="flex items-center gap-2.5 px-2.5 py-2 mb-1.5 rounded-xl"
              style={{ background: 'rgba(99,102,241,0.06)' }}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                style={{ background: 'linear-gradient(135deg,#4f46e5,#06b6d4)' }}>
                {(profile.full_name?.[0] || profile.email?.[0] || 'U').toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                  {profile.full_name || 'Student'}
                </div>
                <div className="text-[10px] truncate text-slate-400">
                  {profile.email}
                </div>
              </div>
            </div>
          )}
          <button onClick={handleLogout}
            className="nav-item w-full text-left text-xs py-1.5"
            style={{ color: 'var(--text-muted)' }}>
            <LogOut className="w-3.5 h-3.5 shrink-0" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden"
          style={{ background: 'rgba(0,0,0,0.6)' }}
          onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top bar */}
        <header className="h-16 flex items-center justify-between px-6 border-b shrink-0 glass"
          style={{ borderColor: 'var(--border-subtle)' }}>

          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 rounded-lg btn-ghost">
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="hidden md:flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ background: activeTrackObj.color }} />
              <h2 className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
                {currentLabel} <span className="text-xs font-normal text-slate-500">({activeTrackObj.name})</span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/test"
              className="btn-primary text-xs px-3.5 py-1.5 hidden sm:inline-flex items-center gap-1.5">
              <FlaskConical className="w-3.5 h-3.5" />
              Take Mock Test
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 md:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
