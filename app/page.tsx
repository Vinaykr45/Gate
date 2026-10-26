import Link from 'next/link'
import {
  BookOpen, FlaskConical, Sparkles, ArrowRight,
  CheckCircle, Brain, Target, ShieldCheck, Layers, Cpu, Award, Zap,
  Compass, ChevronRight, CheckCircle2, TrendingUp, Users, Flame, Lock
} from 'lucide-react'
import { LandingNavbar } from '@/components/landing/LandingNavbar'
import { HeroGlassPreview } from '@/components/landing/HeroGlassPreview'
import { BRAND } from '@/lib/brand'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: BRAND.seo.defaultTitle,
  description: BRAND.description,
}

export default function LandingPage() {
  return (
    <div className="min-h-screen relative overflow-x-hidden" style={{ background: 'var(--bg-primary)' }}>
      {/* ── Ambient Background Glow Mesh ── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Orb 1: Indigo Top Center */}
        <div
          className="absolute -top-[15%] left-1/2 -translate-x-1/2 w-[700px] h-[550px] rounded-full blur-[140px] opacity-40 animate-float-slow"
          style={{ background: 'radial-gradient(circle, #6366f1 0%, rgba(99,102,241,0) 70%)' }}
        />
        {/* Orb 2: Cyan Left Mid */}
        <div
          className="absolute top-[25%] -left-[10%] w-[550px] h-[550px] rounded-full blur-[150px] opacity-25 animate-float-reverse"
          style={{ background: 'radial-gradient(circle, #06b6d4 0%, rgba(6,182,212,0) 70%)' }}
        />
        {/* Orb 3: Purple Right Mid */}
        <div
          className="absolute top-[55%] -right-[10%] w-[600px] h-[600px] rounded-full blur-[160px] opacity-25 animate-float-slow"
          style={{ background: 'radial-gradient(circle, #a855f7 0%, rgba(168,85,247,0) 70%)' }}
        />
        {/* Orb 4: Emerald Bottom Center */}
        <div
          className="absolute bottom-[5%] left-1/3 w-[650px] h-[450px] rounded-full blur-[150px] opacity-20 animate-float-reverse"
          style={{ background: 'radial-gradient(circle, #10b981 0%, rgba(16,185,129,0) 70%)' }}
        />
      </div>

      <LandingNavbar />

      {/* ── Hero Section ── */}
      <section className="relative z-10 hero-grid pt-28 pb-20 md:pt-36 md:pb-28">
        <div className="landing-container px-4 sm:px-6 text-center">

          {/* Frosted Glass Announcement Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full glass-surface mb-8 border border-white/15 shadow-[0_4px_20px_rgba(99,102,241,0.15)] animate-fade-in hover:border-indigo-400/50 transition-all cursor-default">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
            <span className="text-xs font-semibold tracking-wide text-slate-200">
              Next-Gen Multi-Track Intelligence · <span className="text-indigo-400">GATE CSE & ICAI CA</span>
            </span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              2026 Ready
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-5xl mx-auto leading-[1.12] mb-6 animate-slide-up">
            Master GATE CSE & Chartered Accountancy with{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-cyan-300 bg-clip-text text-transparent">
              Precision AI
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed mb-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Structured curricula for GATE CSE, CA Foundation, CA Intermediate, and CA Final.
            Adaptive mock testing, deterministic study planning, and verified solutions in one unified glass platform.
          </p>

          {/* Glass CTA Actions */}
          <div className="flex items-center justify-center gap-4 flex-wrap mb-14 animate-slide-up" style={{ animationDelay: '0.15s' }}>
            <Link
              href="/register"
              className="btn-primary px-8 py-3.5 rounded-xl font-bold text-white flex items-center gap-2 text-base shadow-[0_0_30px_rgba(99,102,241,0.4)] hover:shadow-[0_0_40px_rgba(99,102,241,0.6)] hover:scale-[1.02] transition-all"
            >
              Start Free Preparation
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="glass-btn-secondary px-7 py-3.5 rounded-xl font-semibold text-sm flex items-center gap-2 hover:scale-[1.02] transition-all"
            >
              Go to Student Dashboard
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </Link>
          </div>

          {/* Quick Track Glance - Glass Pill Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto mb-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            {BRAND.tracks.map(t => (
              <Link
                key={t.id}
                href={`#track-${t.id}`}
                className="glass-card-interactive p-3.5 rounded-xl text-left border border-white/10 group cursor-pointer block"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full transition-transform group-hover:scale-125" style={{ background: t.color, boxShadow: `0 0 10px ${t.color}` }} />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-slate-200">
                      {t.badge}
                    </span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white transition-transform group-hover:translate-x-0.5" />
                </div>
                <div className="font-bold text-sm text-white group-hover:text-indigo-300 transition-colors">{t.name}</div>
                <div className="text-[11px] text-slate-400 truncate mt-0.5">{t.level}</div>
              </Link>
            ))}
          </div>

          {/* Live Interactive Glass Diagnostic HUD Console */}
          <HeroGlassPreview />

          {/* Frosted Glass Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mt-14 animate-fade-in" style={{ animationDelay: '0.25s' }}>
            {[
              { value: '4 Tracks', label: 'GATE CSE & CA Levels', sub: 'Isolated Curricula' },
              { value: '190+', label: 'GATE CSE Subtopics', sub: 'Comprehensive Coverage' },
              { value: 'ICAI 2026', label: 'Verified New Scheme', sub: 'Official Paper Structure' },
              { value: 'Multi-AI', label: 'Groq + OpenRouter + Gemini', sub: 'Zero Outage Failover' },
            ].map(s => (
              <div key={s.label} className="glass-surface p-4 rounded-2xl text-center border border-white/10 shadow-lg">
                <div className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-indigo-300 via-purple-300 to-cyan-300 bg-clip-text text-transparent">
                  {s.value}
                </div>
                <div className="text-xs font-bold text-white mt-1">{s.label}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{s.sub}</div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── Examination Tracks Section ── */}
      <section id="tracks" className="relative z-10 py-24 px-4 sm:px-6">
        <div className="landing-container max-w-6xl mx-auto">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full glass-pill text-xs font-bold uppercase tracking-wider text-indigo-400 border border-indigo-500/30 mb-3">
              🎯 Comprehensive Curricula
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4">
              Four Examination Tracks. <span className="bg-gradient-to-r from-indigo-400 to-cyan-300 bg-clip-text text-transparent">Zero Compromises.</span>
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Every track is strictly isolated with syllabus versioning, paper-wise structure, and dedicated mock engines.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* GATE CSE Track Card */}
            <div id="track-gate_cse" className="glass-card-interactive p-7 rounded-3xl border border-white/15 relative overflow-hidden flex flex-col justify-between group">
              <div className="absolute top-0 right-0 w-44 h-44 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-indigo-500/20 transition-all duration-500" />
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.25)]">
                      <Cpu className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors">GATE Computer Science & IT</h3>
                      <div className="text-xs text-indigo-400 font-semibold tracking-wide">10 Core Subjects + General Aptitude · 190+ Topics</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300">
                    GATE 2026
                  </span>
                </div>

                <p className="text-sm text-slate-300 mb-5 leading-relaxed">
                  Engineering syllabus coverage from Discrete Mathematics and Data Structures to Computer Networks and Operating Systems.
                  Full support for 1-mark & 2-mark MCQs, MSQs, and NAT numerical answer types with negative marking rules.
                </p>

                <div className="flex flex-wrap gap-2 mb-6">
                  {['Algorithms', 'Operating Systems', 'Databases', 'Computer Networks', 'Theory of Computation', 'Digital Logic'].map(sub => (
                    <span key={sub} className="text-xs px-2.5 py-1 rounded-lg glass-pill text-slate-300 border border-white/10">
                      {sub}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <Link href="/register?track=gate_cse" className="text-xs font-bold text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1.5 transition-colors">
                  Explore GATE CSE Track <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <span className="text-[11px] text-slate-400">190+ Interactive Subtopics</span>
              </div>
            </div>

            {/* CA Foundation Track Card */}
            <div id="track-ca_foundation" className="glass-card-interactive p-7 rounded-3xl border border-white/15 relative overflow-hidden flex flex-col justify-between group">
              <div className="absolute top-0 right-0 w-44 h-44 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/20 transition-all duration-500" />
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.25)]">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white group-hover:text-emerald-300 transition-colors">CA Foundation</h3>
                      <div className="text-xs text-emerald-400 font-semibold tracking-wide">ICAI New Scheme · 4 Comprehensive Papers</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-300">
                    ICAI Verified
                  </span>
                </div>

                <p className="text-sm text-slate-300 mb-5 leading-relaxed">
                  Foundational mastery across Accounting, Business Laws, Quantitative Aptitude, and Business Economics.
                  Includes subjective answer preparation alongside objective MCQ tests with -0.25 negative marking penalty.
                </p>

                <div className="flex flex-wrap gap-2 mb-6">
                  {['Paper 1: Accounting', 'Paper 2: Business Laws', 'Paper 3: Quantitative Aptitude', 'Paper 4: Business Economics'].map(p => (
                    <span key={p} className="text-xs px-2.5 py-1 rounded-lg glass-pill text-emerald-300 border border-emerald-500/25">
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <Link href="/register?track=ca_foundation" className="text-xs font-bold text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1.5 transition-colors">
                  Explore CA Foundation Track <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <span className="text-[11px] text-slate-400">4 Full ICAI Papers</span>
              </div>
            </div>

            {/* CA Intermediate Track Card */}
            <div id="track-ca_intermediate" className="glass-card-interactive p-7 rounded-3xl border border-white/15 relative overflow-hidden flex flex-col justify-between group">
              <div className="absolute top-0 right-0 w-44 h-44 bg-amber-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-amber-500/20 transition-all duration-500" />
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.25)]">
                      <Layers className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white group-hover:text-amber-300 transition-colors">CA Intermediate</h3>
                      <div className="text-xs text-amber-400 font-semibold tracking-wide">Group I & Group II · 6 Specialized Papers</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-300">
                    Group I & II
                  </span>
                </div>

                <p className="text-sm text-slate-300 mb-5 leading-relaxed">
                  Advanced Accounting, Corporate Laws, Direct & Indirect Taxation, Cost Management, Auditing, and FM-SM.
                  Includes 30% case-scenario based MCQs without negative marking and 70% descriptive examination practice.
                </p>

                <div className="flex flex-wrap gap-2 mb-6">
                  {['Adv. Accounting', 'Corp Laws', 'Taxation (IT & GST)', 'Costing', 'Audit & Ethics', 'FM & SM'].map(p => (
                    <span key={p} className="text-xs px-2.5 py-1 rounded-lg glass-pill text-amber-300 border border-amber-500/25">
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <Link href="/register?track=ca_intermediate" className="text-xs font-bold text-amber-400 hover:text-amber-300 inline-flex items-center gap-1.5 transition-colors">
                  Explore CA Intermediate Track <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <span className="text-[11px] text-slate-400">Case Law & Scenario Rubric</span>
              </div>
            </div>

            {/* CA Final & SPOM Track Card */}
            <div id="track-ca_final" className="glass-card-interactive p-7 rounded-3xl border border-white/15 relative overflow-hidden flex flex-col justify-between group">
              <div className="absolute top-0 right-0 w-44 h-44 bg-purple-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-purple-500/20 transition-all duration-500" />
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-purple-500/15 text-purple-400 border border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.25)]">
                      <Award className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors">CA Final & SPOM</h3>
                      <div className="text-xs text-purple-400 font-semibold tracking-wide">Professional Level · Multidisciplinary Case Studies</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/25 text-purple-300">
                    Final & SPOM
                  </span>
                </div>

                <p className="text-sm text-slate-300 mb-5 leading-relaxed">
                  Financial Reporting, Advanced Financial Management, Advanced Auditing, Direct Tax, Indirect Tax, and Integrated Business Solutions.
                  Covers Self-Paced Online Modules (SPOM Set A & Set B) tracking and corporate case evaluations.
                </p>

                <div className="flex flex-wrap gap-2 mb-6">
                  {['Financial Reporting', 'AFM', 'Adv. Auditing', 'Direct Tax', 'Indirect Tax', 'Integrated Business Solutions'].map(p => (
                    <span key={p} className="text-xs px-2.5 py-1 rounded-lg glass-pill text-purple-300 border border-purple-500/25">
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <Link href="/register?track=ca_final" className="text-xs font-bold text-purple-400 hover:text-purple-300 inline-flex items-center gap-1.5 transition-colors">
                  Explore CA Final Track <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <span className="text-[11px] text-slate-400">Integrated Case Solutions</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Features Section ── */}
      <section id="features" className="relative z-10 py-24 px-4 sm:px-6">
        <div className="landing-container max-w-6xl mx-auto">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full glass-pill text-xs font-bold uppercase tracking-wider text-cyan-400 border border-cyan-500/30 mb-3">
              ⚡ Cutting-Edge Architecture
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4">
              Engineered for <span className="bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">Academic Excellence</span>
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Multi-provider AI intelligence with automatic failover resilience and deterministic offline safety.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className="glass-card-interactive p-6 rounded-3xl border border-white/10 flex flex-col justify-between group"
              >
                <div>
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 border transition-transform group-hover:scale-110"
                    style={{
                      background: `${f.color}15`,
                      borderColor: `${f.color}35`,
                      boxShadow: `0 0 20px ${f.color}25`,
                    }}
                  >
                    <f.Icon style={{ width: 22, height: 22, color: f.color }} />
                  </div>
                  <h3 className="font-bold text-lg text-white mb-2 group-hover:text-indigo-200 transition-colors">
                    {f.title}
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed mb-4">
                    {f.desc}
                  </p>
                </div>
                <div className="pt-3 border-t border-white/05 flex items-center justify-between text-xs font-medium text-slate-400">
                  <span className="font-mono text-[11px] px-2 py-0.5 rounded-md bg-white/5 border border-white/10">
                    {f.tag}
                  </span>
                  <span className="text-indigo-400 inline-flex items-center gap-1">
                    Verified <CheckCircle className="w-3 h-3 text-emerald-400" />
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── How it Works Section ── */}
      <section id="how-it-works" className="relative z-10 py-24 px-4 sm:px-6">
        <div className="landing-container max-w-6xl mx-auto">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full glass-pill text-xs font-bold uppercase tracking-wider text-purple-400 border border-purple-500/30 mb-3">
              🚀 Proven Methodology
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4">
              The <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-cyan-300 bg-clip-text text-transparent">PrepAxis Workflow</span>
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              From onboarding to exam hall: a proven four-stage cycle built on cognitive science.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((step, i) => (
              <div
                key={step.title}
                className="glass-card-interactive p-6 rounded-3xl border border-white/10 text-center relative group"
              >
                <div className="w-14 h-14 rounded-2xl mx-auto mb-5 flex items-center justify-center font-black text-xl text-white bg-gradient-to-br from-indigo-500 to-purple-600 shadow-[0_0_24px_rgba(99,102,241,0.4)] group-hover:scale-110 transition-transform">
                  0{i + 1}
                </div>
                <h3 className="font-bold text-base text-white mb-2">{step.title}</h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{step.desc}</p>
                <div className="mt-4 pt-3 border-t border-white/05 text-[11px] font-semibold text-indigo-400">
                  {step.highlight}
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── Conversion CTA Glass Banner ── */}
      <section className="relative z-10 py-20 px-4 sm:px-6">
        <div className="landing-container max-w-4xl mx-auto">
          <div className="relative rounded-3xl border border-white/20 bg-slate-900/70 backdrop-blur-2xl p-8 sm:p-14 text-center overflow-hidden shadow-[0_25px_70px_-15px_rgba(0,0,0,0.8)]">
            
            {/* Inner Glow Aura */}
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-500/25 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-pill text-xs font-semibold text-emerald-400 border border-emerald-500/30 mb-6">
                <Sparkles className="w-3.5 h-3.5" /> Start Your Accelerated Prep Today
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-5 leading-tight">
                Ready to Elevate Your Exam Rank?
              </h2>

              <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto mb-8 leading-relaxed">
                Join thousands of GATE and CA aspirants preparing with structured curricula, verified questions, and multi-model AI diagnostics.
              </p>

              <div className="flex items-center justify-center gap-4 flex-wrap mb-8">
                <Link
                  href="/register"
                  className="btn-primary px-8 py-3.5 rounded-xl font-bold text-white flex items-center gap-2 text-base shadow-[0_0_30px_rgba(99,102,241,0.5)] hover:scale-105 transition-all"
                >
                  Get Started Free <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/login"
                  className="glass-btn-secondary px-7 py-3.5 rounded-xl font-semibold text-sm hover:scale-105 transition-all"
                >
                  Sign In to Account
                </Link>
              </div>

              <div className="flex items-center justify-center gap-6 flex-wrap text-xs text-slate-300">
                {['GATE CSE & CA New Scheme', 'Deterministic Study Plans', 'Zero AI Outage Blockers'].map(f => (
                  <div key={f} className="flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-white/10 py-10 px-4 sm:px-6 bg-black/40 backdrop-blur-xl">
        <div className="landing-container max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-slate-900 to-indigo-600 border border-indigo-500/40 flex items-center justify-center font-black text-sm text-white shadow-[0_0_12px_rgba(99,102,241,0.4)]">
              P
            </div>
            <div>
              <div className="font-bold text-sm text-white">{BRAND.name}</div>
              <div className="text-[11px] text-slate-400">{BRAND.tagline}</div>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-400">
            <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
            <Link href="/learn" className="hover:text-white transition-colors">Curriculum Hub</Link>
            <Link href="#tracks" className="hover:text-white transition-colors">Tracks</Link>
            <Link href="#features" className="hover:text-white transition-colors">Features</Link>
            <Link href="/admin" className="hover:text-white transition-colors">Admin Portal</Link>
          </div>

          <div className="text-xs text-slate-500">
            © 2026 {BRAND.name} · All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}

const FEATURES = [
  {
    title: 'Multi-Provider AI Router',
    desc: 'Powered by Groq for high-speed inference, OpenRouter for model breadth, and Google Gemini with multi-key pool failover.',
    tag: 'Latency < 250ms',
    Icon: Zap,
    color: '#6366f1',
  },
  {
    title: 'Multi-Exam Adaptive Engine',
    desc: 'Customized exam simulations for GATE CSE (NAT, MSQ, MCQ) and CA (Case Scenarios, MCQs, and Descriptive answer rubrics).',
    tag: 'Official Marking Rules',
    Icon: FlaskConical,
    color: '#8b5cf6',
  },
  {
    title: 'Versioned Curricula',
    desc: 'Track-isolated syllabi conforming to official GATE 2026 and ICAI New Scheme regulations with revision history.',
    tag: 'ICAI & IISc Aligned',
    Icon: BookOpen,
    color: '#10b981',
  },
  {
    title: 'Deterministic Study Planner',
    desc: 'Calculates day-by-day study targets, backlog recovery, and revision cycles mathematically without relying on AI uptime.',
    tag: '100% Deterministic Math',
    Icon: Target,
    color: '#f59e0b',
  },
  {
    title: 'Spaced Repetition & Mistake Book',
    desc: 'Automatic SuperMemo-based review queues for incorrect questions, weak concepts, and bookmarked problems.',
    tag: 'SuperMemo SM-2',
    Icon: Brain,
    color: '#3b82f6',
  },
  {
    title: 'Safe Question Extraction',
    desc: 'Upload past papers and coaching PDFs. Safe OCR chunking, automated schema validation, and administrative verification.',
    tag: 'Verified PYQ Archive',
    Icon: ShieldCheck,
    color: '#14b8a6',
  },
]

const STEPS = [
  {
    title: 'Select Exam Track',
    desc: 'Pick GATE CSE, CA Foundation, CA Intermediate, or CA Final during onboarding with isolated curricula.',
    highlight: 'Instant Track Isolation',
  },
  {
    title: 'Follow Study Plan',
    desc: 'Cover structured chapters, watch curated playlists, and write personal study notes on each subtopic.',
    highlight: 'Deterministic Milestones',
  },
  {
    title: 'Practice & Test',
    desc: 'Generate topic-level quizzes or take full timed mock examinations with real exam negative marking.',
    highlight: 'Live Real-Exam Simulator',
  },
  {
    title: 'Review Mistakes',
    desc: 'Use AI insights and the spaced-repetition Mistake Book to target weak concepts until 100% mastery.',
    highlight: 'Zero Forgotten Concepts',
  },
]
