import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { BookOpen, ChevronRight, CheckCircle, TrendingUp, Clock, Zap } from 'lucide-react'
import { AddSubjectForm } from '@/components/learn/AddSubjectForm'

export const metadata = { title: 'Learning Hub — GateFlow Pro' }

const SUBJECT_META: Record<string, { icon: string; color: string; gradient: string; desc: string; topics: string[] }> = {
  'Computer Science': {
    icon: '💻', color: '#6366f1', gradient: 'from-indigo-500/20 to-violet-500/10',
    desc: 'Core CS concepts tested in GATE CS',
    topics: ['Operating Systems', 'DBMS', 'Data Structures & Algorithms', 'Computer Networks', 'Theory of Computation', 'Compiler Design', 'Computer Organization'],
  },
  'Operating Systems': {
    icon: '🖥️', color: '#6366f1', gradient: 'from-indigo-500/20 to-blue-500/10',
    desc: 'Processes, scheduling, memory management, deadlock, file systems',
    topics: ['Process Management', 'CPU Scheduling', 'Deadlock', 'Memory Management', 'File Systems'],
  },
  'DBMS': {
    icon: '🗄️', color: '#8b5cf6', gradient: 'from-violet-500/20 to-purple-500/10',
    desc: 'Normalization, transactions, indexing, SQL, query optimization',
    topics: ['Relational Model', 'Normalization', 'SQL', 'Transactions', 'Indexing'],
  },
  'Data Structures & Algorithms': {
    icon: '🌲', color: '#10b981', gradient: 'from-emerald-500/20 to-teal-500/10',
    desc: 'Trees, graphs, sorting, dynamic programming, complexity analysis',
    topics: ['Arrays & Strings', 'Trees & Graphs', 'Sorting & Searching', 'Dynamic Programming', 'Hashing'],
  },
  'Computer Networks': {
    icon: '🌐', color: '#3b82f6', gradient: 'from-blue-500/20 to-cyan-500/10',
    desc: 'OSI model, TCP/IP stack, routing, MAC protocols, application layer',
    topics: ['OSI & TCP/IP', 'Data Link Layer', 'Network Layer', 'Transport Layer', 'Application Layer'],
  },
  'Theory of Computation': {
    icon: '⚙️', color: '#f59e0b', gradient: 'from-amber-500/20 to-orange-500/10',
    desc: 'Automata, formal grammars, Turing machines, complexity classes',
    topics: ['Regular Languages', 'Context-Free Languages', 'Turing Machines', 'Complexity Theory'],
  },
  'Mathematics': {
    icon: '∑', color: '#ec4899', gradient: 'from-pink-500/20 to-rose-500/10',
    desc: 'Linear algebra, calculus, probability, combinatorics, discrete math',
    topics: ['Linear Algebra', 'Calculus', 'Probability', 'Combinatorics', 'Discrete Math'],
  },
  'General Aptitude': {
    icon: '🧩', color: '#14b8a6', gradient: 'from-teal-500/20 to-cyan-500/10',
    desc: 'Verbal reasoning, numerical aptitude, analytical puzzles',
    topics: ['Verbal Ability', 'Numerical Aptitude', 'Logical Reasoning', 'Data Interpretation'],
  },
}

const DIFFICULTY_LEVELS = [
  { label: 'Foundation', color: '#10b981', desc: 'Core definitions & concepts' },
  { label: 'Intermediate', color: '#f59e0b', desc: 'Applied problems & reasoning' },
  { label: 'Advanced', color: '#ef4444', desc: 'GATE-level complex questions' },
]

export default async function LearnPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: topics } = await supabase
    .from('learning_topics')
    .select('id, subject, topic, subtopic')
    .order('order_num')

  const { data: progress } = user
    ? await supabase.from('learning_progress').select('topic_id, completed').eq('user_id', user.id)
    : { data: [] }

  const progressMap = new Map(progress?.map(p => [p.topic_id, p.completed]) ?? [])

  const bySubject = (topics ?? []).reduce<Record<string, typeof topics>>((acc, t) => {
    if (!t) return acc
    if (!acc[t.subject]) acc[t.subject] = []
    acc[t.subject]!.push(t)
    return acc
  }, {})

  const subjects = Object.keys(bySubject)
  const totalTopics = topics?.length ?? 0
  const completedTopics = progress?.filter(p => p.completed).length ?? 0
  const overallPct = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0
  const studyStreak = 7 // placeholder — would be real data

  return (
    <div className="space-y-8 animate-fade-in">

      {/* ── Hero Header ── */}
      <div className="relative rounded-2xl overflow-hidden"
        style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(139,92,246,0.06) 100%)', border: '1px solid rgba(99,102,241,0.18)' }}>
        <div className="absolute inset-0 hero-grid opacity-30 pointer-events-none" />
        <div className="relative p-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-3"
                style={{ background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.25)' }}>
                <Zap className="w-3 h-3" /> AI-Powered Learning
              </div>
              <h1 className="text-3xl font-black mb-2" style={{ color: 'var(--text-primary)' }}>Learning Hub</h1>
              <p className="text-sm max-w-lg" style={{ color: 'var(--text-secondary)' }}>
                Structured GATE curriculum with AI-generated explanations, curated notes, and instant practice quizzes.
                Study smarter — not harder.
              </p>
            </div>

            {/* Progress summary */}
            <div className="flex gap-4 shrink-0">
              <div className="card p-5 text-center min-w-[90px]" style={{ borderColor: 'rgba(99,102,241,0.2)' }}>
                <div className="text-3xl font-black gradient-text">{overallPct}%</div>
                <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Progress</div>
              </div>
              <div className="card p-5 text-center min-w-[90px]" style={{ borderColor: 'rgba(16,185,129,0.2)' }}>
                <div className="text-3xl font-black" style={{ color: '#10b981' }}>{completedTopics}</div>
                <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Completed</div>
              </div>
              <div className="card p-5 text-center min-w-[90px]" style={{ borderColor: 'rgba(245,158,11,0.2)' }}>
                <div className="text-3xl font-black" style={{ color: '#f59e0b' }}>{studyStreak}</div>
                <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Day Streak 🔥</div>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          {totalTopics > 0 && (
            <div className="mt-6">
              <div className="flex justify-between text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
                <span>{completedTopics} / {totalTopics} subtopics completed</span>
                <span className="font-semibold" style={{ color: '#a5b4fc' }}>{overallPct}%</span>
              </div>
              <div className="progress-track h-2">
                <div className="progress-fill h-full transition-all duration-1000" style={{ width: `${overallPct}%` }} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Study Path Info ── */}
      <div className="grid md:grid-cols-3 gap-4">
        {DIFFICULTY_LEVELS.map((d) => (
          <div key={d.label} className="card p-4 flex items-center gap-3">
            <div className="w-3 h-8 rounded-full shrink-0" style={{ background: d.color }} />
            <div>
              <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{d.label}</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{d.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Add Subject Form ── */}
      <AddSubjectForm />

      {/* ── Subject Cards ── */}
      {subjects.length > 0 ? (
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="section-title flex items-center gap-2">
              <BookOpen className="w-5 h-5" style={{ color: '#a5b4fc' }} />
              Subjects
            </h2>
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{subjects.length} subjects</span>
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
            {subjects.map((subject) => {
              const meta = SUBJECT_META[subject] ?? {
                icon: '📚', color: '#6366f1', gradient: 'from-indigo-500/20 to-violet-500/10',
                desc: 'GATE preparation topics', topics: [],
              }
              const subjectTopics = bySubject[subject] ?? []
              const completed = subjectTopics.filter(t => progressMap.get(t!.id)).length
              const pct = subjectTopics.length > 0 ? Math.round((completed / subjectTopics.length) * 100) : 0
              const isComplete = pct === 100 && subjectTopics.length > 0

              return (
                <Link
                  key={subject}
                  href={`/learn/${encodeURIComponent(subject)}`}
                  className="card p-6 group cursor-pointer block relative overflow-hidden"
                  style={isComplete ? { borderColor: 'rgba(16,185,129,0.3)' } : {}}>

                  {/* Background gradient */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{ background: `linear-gradient(135deg, ${meta.color}08 0%, transparent 60%)` }} />

                  <div className="relative">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 transition-transform duration-200 group-hover:scale-110"
                        style={{ background: `${meta.color}15`, border: `1px solid ${meta.color}25` }}>
                        {meta.icon}
                      </div>
                      <div className="flex items-center gap-1.5">
                        {isComplete && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                        <span className="text-sm font-bold"
                          style={{ color: isComplete ? '#10b981' : pct > 0 ? meta.color : 'var(--text-muted)' }}>
                          {pct}%
                        </span>
                      </div>
                    </div>

                    {/* Title & desc */}
                    <h3 className="font-bold text-base mb-1 transition-colors"
                      style={{ color: 'var(--text-primary)' }}>
                      {subject}
                    </h3>
                    <p className="text-xs mb-4 leading-relaxed line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                      {meta.desc}
                    </p>

                    {/* Topic preview pills */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {subjectTopics.slice(0, 3).map(t => (
                        <span key={t!.id}
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={{
                            background: progressMap.get(t!.id) ? `${meta.color}15` : 'rgba(255,255,255,0.05)',
                            color: progressMap.get(t!.id) ? meta.color : 'var(--text-muted)',
                            border: `1px solid ${progressMap.get(t!.id) ? `${meta.color}25` : 'rgba(255,255,255,0.06)'}`,
                          }}>
                          {t!.subtopic}
                        </span>
                      ))}
                      {subjectTopics.length > 3 && (
                        <span className="text-xs px-2 py-0.5 rounded-full"
                          style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.06)' }}>
                          +{subjectTopics.length - 3} more
                        </span>
                      )}
                    </div>

                    {/* Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          {completed}/{subjectTopics.length} subtopics
                        </span>
                        <span style={{ color: meta.color }}>{pct}% done</span>
                      </div>
                      <div className="progress-track h-1.5">
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${meta.color}, ${meta.color}99)` }} />
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between mt-4 pt-4"
                      style={{ borderTop: '1px solid var(--border-subtle)' }}>
                      <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                        <Clock className="w-3 h-3" />
                        <span>{subjectTopics.length * 45} min est.</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs font-medium transition-all duration-200 group-hover:translate-x-0.5"
                        style={{ color: meta.color }}>
                        Study now <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="card p-16 text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4"
            style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
            📚
          </div>
          <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            Learning content not set up yet
          </h3>
          <p className="text-sm mb-4 max-w-md mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Run <code className="px-2 py-0.5 rounded text-xs" style={{ background: 'rgba(99,102,241,0.1)' }}>
              supabase/learning_schema.sql
            </code> in your Supabase SQL editor to populate GATE study material.
          </p>
        </div>
      )}

      {/* ── How Learning Hub Works ── */}
      <div className="card p-6" style={{ background: 'rgba(99,102,241,0.03)' }}>
        <h3 className="font-bold mb-4" style={{ color: 'var(--text-primary)' }}>🚀 How Learning Hub Works</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { step: '01', title: 'Pick a Topic', desc: 'Browse subjects → topics → subtopics at your pace', icon: '🎯' },
            { step: '02', title: 'Study Material', desc: 'Read curated notes & watch GATE-focused videos', icon: '📖' },
            { step: '03', title: 'AI Summary', desc: 'Generate easy explanations & key revision points', icon: '🧠' },
            { step: '04', title: 'Practice Quiz', desc: 'AI generates GATE-style MCQs from your notes', icon: '🧪' },
          ].map((item) => (
            <div key={item.step} className="flex gap-3">
              <div className="text-3xl shrink-0">{item.icon}</div>
              <div>
                <div className="text-xs font-bold mb-0.5" style={{ color: '#a5b4fc' }}>Step {item.step}</div>
                <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{item.title}</div>
                <div className="text-xs mt-0.5 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
