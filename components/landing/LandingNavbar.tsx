'use client'
import Link from 'next/link'
import { ArrowRight, Sun, Moon, Menu, X } from 'lucide-react'
import { useState, useEffect } from 'react'

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'Learning Hub', href: '#hub' },
  { label: 'How it Works', href: '#how-it-works' },
]

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    // Read initial theme
    const stored = localStorage.getItem('gateflow-theme')
    const sys = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
    setTheme((stored as 'dark' | 'light') || sys)

    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next)
    localStorage.setItem('gateflow-theme', next)
  }

  const isLight = theme === 'light'

  return (
    <nav className="landing-nav" data-scrolled={scrolled ? 'true' : 'false'}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontWeight: 900, fontSize: 16, color: '#fff',
            background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
            boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
            flexShrink: 0,
          }}>G</div>
          <div>
            <span className="landing-logo-text" style={{ fontWeight: 800, fontSize: 17 }}>GateFlow </span>
            <span className="gradient-text hidden sm:inline" style={{ fontWeight: 800, fontSize: 17 }}>Pro</span>
          </div>
        </Link>

        {/* Nav links — desktop */}
        <div className="hidden md:flex" style={{ alignItems: 'center', gap: 28 }}>
          {NAV_LINKS.map(item => (
            <NavLink key={item.label} href={item.href}>{item.label}</NavLink>
          ))}
        </div>

        {/* Right: theme toggle + CTAs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            style={{
              width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.07)',
              border: `1px solid ${isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'}`,
              cursor: 'pointer', color: isLight ? '#475569' : '#94a3b8', transition: 'all 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#6366f1')}
            onMouseLeave={e => (e.currentTarget.style.color = isLight ? '#475569' : '#94a3b8')}
          >
            {isLight ? <Moon style={{ width: 16, height: 16 }} /> : <Sun style={{ width: 16, height: 16 }} />}
          </button>

          <Link href="/login" className="btn-secondary hidden sm:inline-flex" style={{ fontSize: 13, padding: '7px 16px' }}>
            Sign In
          </Link>
          <Link href="/register" className="btn-primary" style={{ fontSize: 13, padding: '7px 16px', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <span className="hidden sm:inline">Get Started</span>
            <span className="sm:hidden">Start</span>
            <ArrowRight style={{ width: 13, height: 13 }} />
          </Link>
          
          <button 
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            style={{
              width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.07)',
              border: `1px solid ${isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'}`,
              cursor: 'pointer', color: isLight ? '#475569' : '#94a3b8', transition: 'all 0.2s',
            }}
          >
            {isMobileMenuOpen ? <X style={{ width: 16, height: 16 }} /> : <Menu style={{ width: 16, height: 16 }} />}
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden" style={{ borderTop: `1px solid ${isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)'}`, padding: '16px 24px', background: isLight ? '#fff' : 'var(--bg-secondary)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {NAV_LINKS.map(item => (
              <a key={item.label} href={item.href} className="landing-nav-link" onClick={() => setIsMobileMenuOpen(false)}>
                {item.label}
              </a>
            ))}
            <Link href="/login" className="btn-secondary sm:hidden" style={{ fontSize: 14, padding: '10px 16px', justifyContent: 'center' }} onClick={() => setIsMobileMenuOpen(false)}>
              Sign In
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} className="landing-nav-link">
      {children}
    </a>
  )
}

