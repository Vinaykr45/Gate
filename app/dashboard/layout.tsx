'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'
import {
  LayoutDashboard, FileText, BarChart2,
  Sparkles, BookOpen, LogOut, Menu, X,
  FlaskConical, TrendingUp, History, PlusCircle
} from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'

const NAV_SECTIONS = [
  {
    label: 'Study',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/learn', label: 'Learning Hub', icon: BookOpen },
      { href: '/test', label: 'Mock Tests', icon: FileText },
      { href: '/test-history', label: 'Test History', icon: History },
    ],
  },
  {
    label: 'Analyze',
    items: [
      { href: '/analytics', label: 'Analytics', icon: BarChart2 },
      { href: '/insights', label: 'AI Insights', icon: Sparkles },
    ],
  },
  {
    label: 'Manage',
    items: [
      { href: '/dashboard/add-pyq', label: 'Add PYQ', icon: PlusCircle },
    ],
  },
]

interface Profile { full_name?: string; email?: string }

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase.from('profiles').select('full_name, email').eq('id', user.id).single()
          .then(({ data }) => setProfile(data))
      }
    })
  }, [])

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
            style={{ background: 'var(--brand-gradient)' }}>G</div>
          <div>
            <span className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>
              GateFlow <span className="gradient-text">Pro</span>
            </span>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>GATE 2026 Prep</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 space-y-6 overflow-y-auto">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label}>
              <p className="text-xs font-semibold uppercase px-3 mb-2 tracking-widest"
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
                    isActive = pathname === '/test'
                  } else if (item.href === '/test-history') {
                    isActive = pathname === '/test-history' || pathname.startsWith('/test-history/') || (pathname.startsWith('/test/') && pathname.includes('/results'))
                  } else {
                    isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                  }
                  return (
                    <Link key={item.href} href={item.href}
                      className={`nav-item ${isActive ? 'active' : ''}`}
                      onClick={() => setSidebarOpen(false)}>
                      <Icon className="w-4 h-4 shrink-0" />
                      {item.label}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}

          {/* Quick Actions */}
          <div>
            <p className="text-xs font-semibold uppercase px-3 mb-2 tracking-widest"
              style={{ color: 'var(--text-muted)' }}>Quick Start</p>
            <div className="space-y-2 px-1">
              <Link href="/test" onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-2 p-3 rounded-xl text-sm font-medium transition-all duration-200"
                style={{ background: 'rgba(99,102,241,0.08)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.15)' }}>
                <FlaskConical className="w-4 h-4" />
                Generate Practice Quiz
              </Link>
              <Link href="/analytics" onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-2 p-3 rounded-xl text-sm font-medium transition-all duration-200"
                style={{ background: 'rgba(16,185,129,0.06)', color: '#6ee7b7', border: '1px solid rgba(16,185,129,0.12)' }}>
                <TrendingUp className="w-4 h-4" />
                View Performance
              </Link>
            </div>
          </div>
        </nav>

        {/* User footer */}
        <div className="px-3 pb-4 border-t pt-4 shrink-0" style={{ borderColor: 'var(--border-subtle)' }}>
          {profile && (
            <div className="flex items-center gap-3 px-3 py-2.5 mb-2 rounded-xl"
              style={{ background: 'rgba(99,102,241,0.06)' }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                style={{ background: 'var(--brand-gradient)' }}>
                {(profile.full_name?.[0] || profile.email?.[0] || 'U').toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                  {profile.full_name || 'Student'}
                </div>
                <div className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                  {profile.email}
                </div>
              </div>
            </div>
          )}
          <button onClick={handleLogout}
            className="nav-item w-full text-left"
            style={{ color: 'var(--text-muted)' }}>
            <LogOut className="w-4 h-4 shrink-0" />
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
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--brand-gradient)' }} />
              <h2 className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
                {currentLabel}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/test"
              className="btn-primary text-sm px-4 py-2 hidden sm:inline-flex">
              <FlaskConical className="w-4 h-4" />
              Practice
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
