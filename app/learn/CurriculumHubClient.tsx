'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  BookOpen, ChevronRight, CheckCircle, TrendingUp, Clock, Zap,
  ExternalLink, Layers, ShieldCheck, Sparkles, Award
} from 'lucide-react'
import { BRAND, type ExamTrackId } from '@/lib/brand'
import { CURRICULUM_REGISTRY } from '@/lib/curriculum/registry'
import { GATE_SUBJECTS } from '@/lib/utils'
import { AddSubjectForm } from '@/components/learn/AddSubjectForm'

export const ALL_SUBJECT_META: Record<string, { icon: string; color: string; desc: string; marks: string }> = {
  // GATE CSE
  'Engineering Mathematics': {
    icon: '∑', color: '#ec4899',
    desc: 'Discrete Math, Linear Algebra, Calculus, Probability & Statistics',
    marks: '~15%',
  },
  'Digital Logic': {
    icon: '⚡', color: '#f59e0b',
    desc: 'Boolean algebra, combinational & sequential circuits, number systems',
    marks: '~4%',
  },
  'Computer Organization and Architecture': {
    icon: '🖥️', color: '#6366f1',
    desc: 'Pipelining, cache, memory hierarchy, I/O, ALU & control unit design',
    marks: '~5%',
  },
  'Programming and Data Structures': {
    icon: '🌲', color: '#10b981',
    desc: 'C programming, recursion, arrays, stacks, queues, trees, graphs',
    marks: '~12%',
  },
  'Algorithms': {
    icon: '⚙️', color: '#14b8a6',
    desc: 'Complexity, sorting, greedy, DP, graph algorithms, NP-completeness',
    marks: '~10%',
  },
  'Theory of Computation': {
    icon: '🔁', color: '#8b5cf6',
    desc: 'Automata, regular/CFL, pushdown automata, Turing machines, decidability',
    marks: '~8%',
  },
  'Compiler Design': {
    icon: '🔧', color: '#f97316',
    desc: 'Lexical analysis, parsing, syntax-directed translation, code generation',
    marks: '~6%',
  },
  'Operating System': {
    icon: '💿', color: '#3b82f6',
    desc: 'Processes, scheduling, deadlock, memory management, virtual memory, file systems',
    marks: '~10%',
  },
  'Databases': {
    icon: '🗄️', color: '#a855f7',
    desc: 'ER model, relational algebra, SQL, normalization, indexing, transactions',
    marks: '~10%',
  },
  'Computer Networks': {
    icon: '🌐', color: '#06b6d4',
    desc: 'OSI/TCP-IP, MAC, routing, TCP/UDP, congestion control, application layer',
    marks: '~8%',
  },
  'General Aptitude': {
    icon: '🧩', color: '#84cc16',
    desc: 'Verbal ability, quantitative aptitude, logical & analytical reasoning',
    marks: '15 marks',
  },

  // CA Foundation
  'Accounting': {
    icon: '📊', color: '#10b981',
    desc: 'Theoretical Framework, Accounting Process, BRS, Inventories, Partnership & Company Accounts',
    marks: '100 Marks',
  },
  'Business Laws': {
    icon: '⚖️', color: '#6366f1',
    desc: 'Indian Regulatory Framework, Contract Act 1872, Sale of Goods, Partnership, LLP & Companies Act',
    marks: '100 Marks',
  },
  'Quantitative Aptitude': {
    icon: '📐', color: '#06b6d4',
    desc: 'Math of Finance, Permutations, Equations, Calculus, Statistical Description & Probability',
    marks: '100 Marks',
  },
  'Business Economics': {
    icon: '📈', color: '#f59e0b',
    desc: 'Theory of Demand & Supply, Production, Cost, Market Structures, National Income & Public Finance',
    marks: '100 Marks',
  },

  // CA Intermediate
  'Advanced Accounting': {
    icon: '📑', color: '#10b981',
    desc: 'Applicability of AS 1-29, Financial Statements, Buyback, Amalgamation, Reconstruction, Branch Accounts',
    marks: '100 Marks',
  },
  'Corporate and Other Laws': {
    icon: '🏛️', color: '#8b5cf6',
    desc: 'Companies Act 2013, Management & Administration, Foreign Companies, FEMA 1999 & Interpretation of Statutes',
    marks: '100 Marks',
  },
  'Taxation': {
    icon: '💰', color: '#f59e0b',
    desc: 'Income-tax Law (Heads of income, deductions, TDS) and Goods and Services Tax (GST) Framework',
    marks: '100 Marks',
  },
  'Cost and Management Accounting': {
    icon: '🏷️', color: '#ec4899',
    desc: 'Material, Labour, Overheads, Activity Based Costing, Standard Costing, Marginal Costing, Budgets',
    marks: '100 Marks',
  },
  'Auditing and Ethics': {
    icon: '🔍', color: '#3b82f6',
    desc: 'Nature & Scope of Audit, Risk Assessment, Internal Control, Audit Sampling, Reporting & Code of Ethics',
    marks: '100 Marks',
  },
  'Financial Management and Strategic Management': {
    icon: '📊', color: '#14b8a6',
    desc: 'Financing Decisions, Capital Budgeting, Working Capital Management, Strategic Analysis & Formulation',
    marks: '100 Marks',
  },

  // CA Final
  'Financial Reporting': {
    icon: '📑', color: '#8b5cf6',
    desc: 'Ind AS Framework, Business Combinations, Consolidated Financial Statements, Financial Instruments',
    marks: '100 Marks',
  },
  'Advanced Financial Management': {
    icon: '💹', color: '#06b6d4',
    desc: 'Strategic Financial Policy, Portfolio Management, Derivatives, Foreign Exchange Risk Management',
    marks: '100 Marks',
  },
  'Advanced Auditing and Professional Ethics': {
    icon: '🛡️', color: '#3b82f6',
    desc: 'Quality Management (SQC 1), Forensic Audit, Group Audits, CARO 2020, NOCLAR & Professional Ethics',
    marks: '100 Marks',
  },
  'Direct Tax Laws & International Taxation': {
    icon: '⚖️', color: '#f59e0b',
    desc: 'Corporate Assessment, Transfer Pricing, DTAA, Equalisation Levy, Faceless Schemes & Search/Seizure',
    marks: '100 Marks',
  },
  'Indirect Tax Laws': {
    icon: '🏢', color: '#10b981',
    desc: 'GST Advanced Provisions (Place of supply, ITC, Refunds, Demands, Appeals) and Customs Law & FTP',
    marks: '100 Marks',
  },
  'Integrated Business Solutions': {
    icon: '🧩', color: '#ec4899',
    desc: 'Multidisciplinary Case Studies integrating FR, AFM, Auditing, Law, Direct and Indirect Taxation',
    marks: '100 Marks',
  },
}

const DIFFICULTY_LEVELS = [
  { label: 'Foundation', color: '#10b981', desc: 'Core definitions, principles & concepts' },
  { label: 'Intermediate', color: '#f59e0b', desc: 'Applied calculations & analytical reasoning' },
  { label: 'Advanced', color: '#ef4444', desc: 'Official examination-level complex scenarios' },
]

interface DbTopic {
  id: string
  subject: string
  topic: string
  subtopic: string
}

interface UserProgress {
  topic_id: string
  completed: boolean
}

interface CurriculumHubClientProps {
  initialTopics: DbTopic[] | null
  userProgress: UserProgress[] | null
}

export function CurriculumHubClient({ initialTopics, userProgress }: CurriculumHubClientProps) {
  const [currentTrack, setCurrentTrack] = useState<ExamTrackId>('gate_cse')
  const [dbTopics] = useState<DbTopic[]>(initialTopics || [])
  const [progressList] = useState<UserProgress[]>(userProgress || [])

  // Initialize track from localStorage & listen for changes
  useEffect(() => {
    const saved = localStorage.getItem('prepaxis_active_track') as ExamTrackId | null
    if (saved && BRAND.tracks.some(t => t.id === saved)) {
      setCurrentTrack(saved)
    }

    const onTrackChange = (e: Event) => {
      const newTrack = (e as CustomEvent).detail?.track as ExamTrackId
      if (newTrack && BRAND.tracks.some(t => t.id === newTrack)) {
        setCurrentTrack(newTrack)
      }
    }

    window.addEventListener('prepaxis:track-changed', onTrackChange)
    return () => window.removeEventListener('prepaxis:track-changed', onTrackChange)
  }, [])

  const handleTrackChange = (track: ExamTrackId) => {
    setCurrentTrack(track)
    localStorage.setItem('prepaxis_active_track', track)
    window.dispatchEvent(new CustomEvent('prepaxis:track-changed', { detail: { track } }))
  }

  // Active track information from BRAND and CURRICULUM_REGISTRY
  const trackObj = BRAND.tracks.find(t => t.id === currentTrack) || BRAND.tracks[0]
  const trackCurriculum = CURRICULUM_REGISTRY[currentTrack] || CURRICULUM_REGISTRY.gate_cse
  const syllabusMeta = trackCurriculum.versions[0]

  // Map progress
  const progressMap = new Map(progressList.map(p => [p.topic_id, p.completed]))

  // Build subject cards based on track
  let subjectCards: Array<{
    title: string
    code?: string
    group?: string
    marks: string
    durationMinutes?: number
    chapterCount: number
    subtopicsPreview: string[]
    totalSubtopics: number
    completedSubtopics: number
    pct: number
    color: string
    icon: string
    desc: string
  }> = []

  if (currentTrack === 'gate_cse') {
    // GATE CSE subjects are the chapters of the core CS paper
    const gatePaper = trackCurriculum.papers[0]
    const chapters = gatePaper?.chapters || []

    subjectCards = chapters.map((ch) => {
      const meta = ALL_SUBJECT_META[ch.title] || {
        icon: '📚', color: '#6366f1',
        desc: ch.topics.map(t => t.title).join(', '),
        marks: ch.weightageEstimated || '~8%',
      }

      // Collect subtopics from CURRICULUM_REGISTRY
      const registrySubtopics = ch.topics.flatMap(t => t.subtopics.map(s => s.title))
      
      // Also check if any DB topics match this subject
      const dbMatch = dbTopics.filter(t => t.subject === ch.title)
      const subtopicNames = dbMatch.length > 0
        ? dbMatch.map(t => t.subtopic)
        : registrySubtopics

      const completed = dbMatch.filter(t => progressMap.get(t.id)).length
      const total = subtopicNames.length
      const pct = total > 0 ? Math.round((completed / total) * 100) : 0

      return {
        title: ch.title,
        code: 'CS',
        marks: ch.weightageEstimated || meta.marks,
        chapterCount: ch.topics.length,
        subtopicsPreview: subtopicNames.slice(0, 3),
        totalSubtopics: total,
        completedSubtopics: completed,
        pct,
        color: meta.color,
        icon: meta.icon,
        desc: meta.desc,
      }
    })
  } else {
    // CA tracks: each paper is a major subject
    subjectCards = trackCurriculum.papers.map((p) => {
      const meta = ALL_SUBJECT_META[p.title] || {
        icon: '📖', color: '#10b981',
        desc: p.chapters.map(c => c.title).slice(0, 4).join(', '),
        marks: `${p.marks} Marks`,
      }

      // Collect all subtopics for this paper
      const allSubtopics = p.chapters.flatMap(c =>
        c.topics.flatMap(t => t.subtopics.map(s => s.title))
      )

      // Also check DB matches
      const dbMatch = dbTopics.filter(t => t.subject === p.title)
      const subtopicNames = dbMatch.length > 0 ? dbMatch.map(t => t.subtopic) : allSubtopics

      const completed = dbMatch.filter(t => progressMap.get(t.id)).length
      const total = subtopicNames.length
      const pct = total > 0 ? Math.round((completed / total) * 100) : 0

      return {
        title: p.title,
        code: p.code,
        group: p.group,
        marks: `${p.marks} Marks`,
        durationMinutes: p.durationMinutes,
        chapterCount: p.chapters.length,
        subtopicsPreview: p.chapters.map(c => c.title).slice(0, 3),
        totalSubtopics: total,
        completedSubtopics: completed,
        pct,
        color: meta.color,
        icon: meta.icon,
        desc: meta.desc,
      }
    })
  }

  // Aggregate progress statistics
  const totalSubtopicsAll = subjectCards.reduce((acc, s) => acc + s.totalSubtopics, 0)
  const completedSubtopicsAll = subjectCards.reduce((acc, s) => acc + s.completedSubtopics, 0)
  const overallPct = totalSubtopicsAll > 0
    ? Math.round((completedSubtopicsAll / totalSubtopicsAll) * 100)
    : 0

  return (
    <div className="space-y-8 animate-fade-in">

      {/* ── Active Track Selection Tabs Bar ── */}
      <div className="card p-3 flex flex-wrap items-center justify-between gap-3 border border-slate-800 bg-slate-900/60">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-400 shrink-0" />
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Active Track:</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {BRAND.tracks.map((t) => {
            const isSelected = t.id === currentTrack
            return (
              <button
                key={t.id}
                onClick={() => handleTrackChange(t.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'text-white shadow-md'
                    : 'text-slate-400 hover:text-white bg-slate-800/40 hover:bg-slate-800'
                }`}
                style={isSelected ? { background: t.color, color: '#fff' } : {}}
              >
                <span className="w-2 h-2 rounded-full" style={{ background: isSelected ? '#fff' : t.color }} />
                <span>{t.name}</span>
                <span className="text-[10px] opacity-75 hidden sm:inline">({t.badge})</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Hero Header ── */}
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${trackObj.color}15 0%, rgba(15,23,42,0.6) 100%)`,
          border: `1px solid ${trackObj.color}35`,
        }}
      >
        <div className="absolute inset-0 hero-grid opacity-30 pointer-events-none" />
        <div className="relative p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-3"
                style={{
                  background: `${trackObj.color}20`,
                  color: '#fff',
                  border: `1px solid ${trackObj.color}40`,
                }}
              >
                <Zap className="w-3 h-3" style={{ color: trackObj.color }} />
                {trackCurriculum.badge} · {trackCurriculum.activeSyllabusVersion}
              </div>
              <h1 className="text-3xl font-black mb-2 text-white">
                {trackCurriculum.trackName}
              </h1>
              <p className="text-sm max-w-xl text-slate-300 leading-relaxed">
                {syllabusMeta?.description ||
                  `Comprehensive syllabus aligned to official regulations with chapter-by-chapter weightage and AI practice.`}
              </p>
              {syllabusMeta?.applicableSessions && (
                <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
                  <span className="font-semibold text-slate-300">Applicable Sessions:</span>
                  <span>{syllabusMeta.applicableSessions.join(', ')}</span>
                </div>
              )}
            </div>

            {/* Progress summary */}
            <div className="flex flex-wrap justify-center gap-4 shrink-0">
              <div className="card p-5 text-center min-w-[95px] border-slate-800 bg-slate-900/80">
                <div className="text-3xl font-black" style={{ color: trackObj.color }}>
                  {overallPct}%
                </div>
                <div className="text-xs mt-1 text-slate-400">Curriculum</div>
              </div>
              <div className="card p-5 text-center min-w-[95px] border-slate-800 bg-slate-900/80">
                <div className="text-3xl font-black text-emerald-400">
                  {completedSubtopicsAll}
                </div>
                <div className="text-xs mt-1 text-slate-400">Completed</div>
              </div>
              <div className="card p-5 text-center min-w-[95px] border-slate-800 bg-slate-900/80">
                <div className="text-3xl font-black text-amber-400">
                  {subjectCards.length}
                </div>
                <div className="text-xs mt-1 text-slate-400">Subjects / Papers</div>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-6">
            <div className="flex justify-between text-xs mb-2 text-slate-400">
              <span>{completedSubtopicsAll} of {totalSubtopicsAll} subtopics mastered</span>
              <span className="font-semibold text-white">{overallPct}% complete</span>
            </div>
            <div className="progress-track h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="progress-fill h-full transition-all duration-1000 rounded-full"
                style={{
                  width: `${overallPct}%`,
                  background: `linear-gradient(90deg, ${trackObj.color}, #06b6d4)`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Active Track Syllabus Quick Reference Grid ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            {trackCurriculum.trackName} Structure & Weightage
          </span>
          {syllabusMeta?.officialSourceUrl && (
            <a
              href={syllabusMeta.officialSourceUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-indigo-400 hover:underline inline-flex items-center gap-1"
            >
              Official Syllabus Document <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
          {subjectCards.map((s) => (
            <div
              key={s.title}
              className="rounded-xl border px-3 py-2.5 flex items-center justify-between gap-2"
              style={{ background: `${s.color}0a`, borderColor: `${s.color}25` }}
            >
              <div className="min-w-0">
                <div className="text-xs font-semibold text-slate-200 truncate flex items-center gap-1.5">
                  <span>{s.icon}</span>
                  <span className="truncate">{s.title}</span>
                </div>
                {s.code && (
                  <span className="text-[10px] text-slate-400 font-mono">
                    {s.code} {s.group ? `· ${s.group}` : ''}
                  </span>
                )}
              </div>
              <span className="text-xs font-bold shrink-0 font-mono" style={{ color: s.color }}>
                {s.marks}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Study Path Difficulty Hierarchy ── */}
      <div className="grid md:grid-cols-3 gap-4">
        {DIFFICULTY_LEVELS.map((d) => (
          <div key={d.label} className="card p-4 flex items-center gap-3 border border-slate-800">
            <div className="w-3 h-8 rounded-full shrink-0" style={{ background: d.color }} />
            <div>
              <div className="text-sm font-semibold text-white">{d.label}</div>
              <div className="text-xs text-slate-400">{d.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Add Custom Subject Form ── */}
      <AddSubjectForm />

      {/* ── Subject / Paper Cards ── */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="section-title flex items-center gap-2 text-xl font-bold text-white">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            <span>Curriculum Subjects ({subjectCards.length})</span>
          </h2>
          <span className="text-xs text-slate-400">
            Click any subject to view detailed chapters, curated videos, and AI summaries
          </span>
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {subjectCards.map((subject) => {
            const isComplete = subject.pct === 100 && subject.totalSubtopics > 0

            return (
              <Link
                key={subject.title}
                href={`/learn/${encodeURIComponent(subject.title)}`}
                className="card p-6 group cursor-pointer block relative overflow-hidden border border-slate-800 hover:border-slate-700 transition-all duration-300"
                style={isComplete ? { borderColor: 'rgba(16,185,129,0.4)' } : {}}
              >
                {/* Hover gradient glow */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{
                    background: `linear-gradient(135deg, ${subject.color}10 0%, transparent 70%)`,
                  }}
                />

                <div className="relative">
                  {/* Top Bar */}
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 transition-transform duration-200 group-hover:scale-110 shadow-sm"
                      style={{
                        background: `${subject.color}18`,
                        border: `1px solid ${subject.color}35`,
                      }}
                    >
                      {subject.icon}
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      {isComplete && (
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                      )}
                      <div className="flex items-center gap-1.5">
                        {subject.group && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                            {subject.group}
                          </span>
                        )}
                        <span
                          className="text-xs font-bold px-2 py-0.5 rounded-full"
                          style={{
                            background: `${subject.color}18`,
                            color: subject.color,
                            border: `1px solid ${subject.color}30`,
                          }}
                        >
                          {subject.marks}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="font-bold text-base mb-1.5 text-white group-hover:text-indigo-300 transition-colors">
                    {subject.title}
                  </h3>
                  <p className="text-xs mb-4 leading-relaxed line-clamp-2 text-slate-400">
                    {subject.desc}
                  </p>

                  {/* Subtopics / Chapters Preview Pills */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {subject.subtopicsPreview.map((sub, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 truncate max-w-[200px]"
                      >
                        {sub}
                      </span>
                    ))}
                    {subject.chapterCount > subject.subtopicsPreview.length && (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-900/60 border border-slate-800 text-slate-500">
                        +{subject.chapterCount - subject.subtopicsPreview.length} more
                      </span>
                    )}
                  </div>

                  {/* Progress Indicator */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        {subject.completedSubtopics} / {subject.totalSubtopics} topics
                      </span>
                      <span style={{ color: subject.color }} className="font-semibold">
                        {subject.pct}% done
                      </span>
                    </div>
                    <div className="progress-track h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${subject.pct}%`,
                          background: `linear-gradient(90deg, ${subject.color}, ${subject.color}99)`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between mt-4 pt-3.5 border-t border-slate-800">
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                      <Clock className="w-3 h-3" />
                      <span>{subject.totalSubtopics * 45 || 180} min est.</span>
                    </div>
                    <div
                      className="flex items-center gap-1 text-xs font-semibold transition-all duration-200 group-hover:translate-x-1"
                      style={{ color: subject.color }}
                    >
                      Study syllabus <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* ── Quick Switch to Other Examination Curricula ── */}
      <div className="pt-6 border-t border-slate-800 space-y-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            Switch Curriculum Tracks
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Select another official track to instantly load its complete chapter hierarchy and syllabus structure.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {BRAND.tracks.map((t) => {
            const isCurrent = t.id === currentTrack
            const trackData = CURRICULUM_REGISTRY[t.id]
            const papersCount = trackData?.papers.length || 0

            return (
              <div
                key={t.id}
                onClick={() => handleTrackChange(t.id)}
                className={`card p-4 cursor-pointer transition-all border ${
                  isCurrent
                    ? 'border-indigo-500/50 bg-indigo-500/10'
                    : 'border-slate-800 hover:border-slate-700 bg-slate-900/60'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                    style={{ background: `${t.color}20`, color: t.color }}>
                    {t.badge}
                  </span>
                  {isCurrent && (
                    <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Active
                    </span>
                  )}
                </div>
                <div className="font-bold text-sm text-white mb-1">{t.name}</div>
                <div className="text-xs text-slate-400">
                  {papersCount} Papers · {t.level}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── How Curriculum Hub Works ── */}
      <div className="card p-6 border border-slate-800 bg-slate-900/40">
        <h3 className="font-bold mb-4 text-white flex items-center gap-2">
          <Zap className="w-4 h-4 text-indigo-400" /> How Learning Hub Works
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { step: '01', title: 'Pick a Subject', desc: 'Browse subjects → chapters → subtopics across your active track', icon: '🎯' },
            { step: '02', title: 'Study Curriculum', desc: 'Read curated notes and official syllabus breakdowns', icon: '📖' },
            { step: '03', title: 'AI Summary & Q&A', desc: 'Generate high-yield explanations and retention key points', icon: '🧠' },
            { step: '04', title: 'Adaptive Practice', desc: 'Take exam-calibrated mock quizzes with negative marking rules', icon: '🧪' },
          ].map((item) => (
            <div key={item.step} className="flex gap-3">
              <div className="text-3xl shrink-0">{item.icon}</div>
              <div>
                <div className="text-xs font-bold mb-0.5 text-indigo-400">Step {item.step}</div>
                <div className="text-sm font-semibold text-white">{item.title}</div>
                <div className="text-xs mt-0.5 leading-relaxed text-slate-400">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
