import Link from 'next/link'
import { BookOpen, FlaskConical, BarChart2, Sparkles, ArrowRight, CheckCircle, Brain, Target } from 'lucide-react'
import { LandingNavbar } from '@/components/landing/LandingNavbar'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'GateFlow Pro — AI-Powered GATE CSE Preparation',
  description: 'Study smarter for GATE CSE with AI-generated explanations, adaptive mock tests, and personalized analytics. Built on Gemini AI.',
}

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <LandingNavbar />

      {/* ── Hero ── */}
      <section className="hero-grid hero-radial landing-hero">
        <div className="landing-container" style={{ textAlign: 'center', padding: '100px 24px 80px' }}>

          {/* Badge */}
          <div className="landing-badge animate-fade-in">
            <span className="landing-badge-dot" />
            Powered by Google Gemini 2.5 Flash
          </div>

          {/* Headline */}
          <h1 className="landing-h1 animate-slide-up">
            Crack GATE CSE with{' '}
            <span className="gradient-text animate-gradient">AI Intelligence</span>
          </h1>

          <p className="landing-subtitle animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Structured GATE curriculum, AI-generated explanations, GATE-style practice quizzes,
            and personalized analytics — everything in one platform.
          </p>

          {/* CTAs */}
          <div className="animate-slide-up" style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 60, animationDelay: '0.2s' }}>
            <Link href="/register" className="btn-primary landing-cta-primary">
              Start Preparing Free <ArrowRight style={{ width: 16, height: 16 }} />
            </Link>
            <Link href="/login" className="btn-secondary landing-cta-secondary">
              View Dashboard →
            </Link>
          </div>

          {/* Stats row */}
          <div className="landing-stats animate-fade-in" style={{ animationDelay: '0.3s' }}>
            {[
              { value: '190+', label: 'Syllabus Topics' },
              { value: '10', label: 'Core Subjects' },
              { value: 'AI', label: 'Quiz Generator' },
              { value: 'Gemini', label: '2.5 Flash' },
            ].map(s => (
              <div key={s.label} className="landing-stat-card">
                <div className="gradient-text" style={{ fontSize: 24, fontWeight: 900 }}>{s.value}</div>
                <div className="landing-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Learning Hub section ── */}
      <section id="hub" className="landing-section landing-section-alt">
        <div className="landing-container">
          <div className="landing-section-header">
            <div className="landing-pill" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }}>
              📚 Learning Hub
            </div>
            <h2 className="landing-h2">
              Full GATE CSE <span className="gradient-text">Curriculum</span>
            </h2>
            <p className="landing-section-desc">
              190+ subtopics across 10 subjects. Study → Watch → Practice — all in one structured flow.
            </p>
          </div>

          <div className="landing-grid-2">
            {SUBJECTS.map(s => (
              <div key={s.name} className="card landing-subject-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div className="landing-subject-icon" style={{ background: `${s.color}15`, border: `1px solid ${s.color}25` }}>
                    {s.icon}
                  </div>
                  <div>
                    <div className="landing-subject-name">{s.name}</div>
                    <div className="landing-subject-count">{s.count} subtopics</div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {s.tags.map(t => (
                    <span key={t} className="landing-tag" style={{ background: `${s.color}10`, color: s.color, border: `1px solid ${s.color}20` }}>{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <Link href="/register" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 28px' }}>
              <BookOpen style={{ width: 16, height: 16 }} /> Start Learning Free
            </Link>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="landing-section">
        <div className="landing-container">
          <div className="landing-section-header">
            <h2 className="landing-h2">
              Everything you need to <span className="gradient-text">ace GATE</span>
            </h2>
            <p className="landing-section-desc">Powered by Google Gemini AI for intelligent learning</p>
          </div>
          <div className="landing-grid-3">
            {FEATURES.map((f, i) => (
              <div key={f.title} className="card landing-feature-card animate-slide-up" style={{ animationDelay: `${i * 0.07}s` }}>
                <div className="landing-feature-icon" style={{ background: `${f.color}12`, border: `1px solid ${f.color}20` }}>
                  <f.Icon style={{ width: 22, height: 22, color: f.color }} />
                </div>
                <h3 className="landing-feature-title">{f.title}</h3>
                <p className="landing-feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it Works ── */}
      <section id="how-it-works" className="landing-section landing-section-alt">
        <div className="landing-container">
          <div className="landing-section-header">
            <h2 className="landing-h2">
              Study in <span className="gradient-text">4 simple steps</span>
            </h2>
          </div>
          <div className="landing-grid-4">
            {STEPS.map((step, i) => (
              <div key={step.title} style={{ textAlign: 'center' }}>
                <div className="landing-step-num">{i + 1}</div>
                <div className="landing-step-title">{step.title}</div>
                <p className="landing-step-desc">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="landing-section">
        <div className="landing-container" style={{ maxWidth: 720 }}>
          <div className="card landing-cta-card">
            <div style={{ fontSize: 48, marginBottom: 16 }}>🚀</div>
            <h2 className="landing-h2" style={{ marginBottom: 14 }}>Ready to crack GATE?</h2>
            <p className="landing-section-desc" style={{ marginBottom: 32 }}>
              Join students preparing smarter with AI-powered learning, practice quizzes, and analytics.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 28 }}>
              <Link href="/register" className="btn-primary landing-cta-primary">
                Start Free <ArrowRight style={{ width: 16, height: 16 }} />
              </Link>
              <Link href="/login" className="btn-secondary landing-cta-secondary">
                Sign In
              </Link>
            </div>
            <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap' }}>
              {['Full GATE CSE syllabus', 'AI quiz from notes', 'Performance analytics'].map(f => (
                <div key={f} className="landing-check-item">
                  <CheckCircle style={{ width: 14, height: 14, color: '#10b981', flexShrink: 0 }} /> {f}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="landing-footer">
        <div className="landing-container landing-footer-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 13, color: '#fff' }}>G</div>
            <span className="landing-footer-brand">GateFlow Pro</span>
          </div>
          <p className="landing-footer-copy">© 2026 GateFlow Pro · Built for GATE CSE aspirants</p>
          <div style={{ display: 'flex', gap: 20 }}>
            <Link href="/dashboard" className="footer-link">Dashboard</Link>
            <Link href="/learn" className="footer-link">Learning Hub</Link>
            <Link href="#features" className="footer-link">Features</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

/* ─── Data ─── */
const SUBJECTS = [
  { name: 'Engineering Mathematics', icon: '∑', color: '#ec4899', count: 16, tags: ['Discrete Math', 'Linear Algebra', 'Probability'] },
  { name: 'Digital Logic', icon: '⚡', color: '#f59e0b', count: 12, tags: ['Boolean Algebra', 'Flip-Flops', 'FSM'] },
  { name: 'Computer Organization', icon: '💾', color: '#6366f1', count: 10, tags: ['Pipelining', 'Cache', 'Virtual Mem'] },
  { name: 'Programming & DSA', icon: '🌲', color: '#10b981', count: 14, tags: ['C Language', 'Trees', 'Graphs'] },
  { name: 'Algorithms', icon: '🧮', color: '#3b82f6', count: 13, tags: ['DP', 'Greedy', 'Graph Algo'] },
  { name: 'Theory of Computation', icon: '⚙️', color: '#8b5cf6', count: 10, tags: ['Automata', 'CFG', 'Turing'] },
  { name: 'Compiler Design', icon: '🔧', color: '#14b8a6', count: 10, tags: ['Parsing', 'SDT', 'Optimization'] },
  { name: 'Operating Systems', icon: '🖥️', color: '#6366f1', count: 15, tags: ['Scheduling', 'Memory', 'Deadlock'] },
  { name: 'Databases', icon: '🗄️', color: '#a78bfa', count: 14, tags: ['SQL', 'Normalization', 'Transactions'] },
  { name: 'Computer Networks', icon: '🌐', color: '#38bdf8', count: 19, tags: ['TCP/IP', 'Routing', 'DNS'] },
]

const FEATURES = [
  { title: 'AI Learning Material', desc: 'Gemini generates explanations, GATE patterns, worked examples, mnemonics, and resource links for every topic.', Icon: Brain, color: '#6366f1' },
  { title: 'Practice Quiz Engine', desc: 'AI generates GATE-style MCQs from your notes and video content with GATE marking scheme.', Icon: FlaskConical, color: '#8b5cf6' },
  { title: 'Full GATE Syllabus', desc: '190+ structured subtopics across 10 subjects, mapped to the official GATE CSE 2025 syllabus.', Icon: BookOpen, color: '#10b981' },
  { title: 'AI Topic Summary', desc: 'Instant AI summaries with easy explanations, key revision points, and exam-focused tips per subtopic.', Icon: Sparkles, color: '#f59e0b' },
  { title: 'Performance Analytics', desc: 'Track accuracy, scores, and time per topic. Identify weak areas with visual progress indicators.', Icon: BarChart2, color: '#3b82f6' },
  { title: 'Real GATE Experience', desc: 'Timed tests, review panel, mark-for-review — authentic GATE interface for realistic practice.', Icon: Target, color: '#ec4899' },
]

const STEPS = [
  { title: 'Choose Topic', desc: 'Browse the full GATE CSE curriculum organized by subject and subtopic.' },
  { title: 'Study Material', desc: 'Read curated notes, watch videos, and generate AI explanations instantly.' },
  { title: 'AI Quiz', desc: 'Generate GATE-style practice questions from your study material on demand.' },
  { title: 'Track Progress', desc: 'Monitor accuracy, streaks, and weak areas via the analytics dashboard.' },
]
