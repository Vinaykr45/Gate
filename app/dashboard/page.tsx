import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { BookOpen, FlaskConical, ArrowRight, Clock, CheckCircle2, History } from 'lucide-react'


export const metadata = { title: 'Dashboard — GateFlow Pro' }

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [completedAttemptsRes, questionsRes, testsRes, profileRes, progressRes, allAttemptsRes] = await Promise.all([
    // All completed attempts for stats
    supabase.from('attempts').select('score, accuracy').eq('user_id', user!.id).eq('completed', true),
    // Total questions count
    supabase.from('questions').select('id', { count: 'exact', head: true }),
    // Recent tests (no join — fetch separately)
    supabase.from('tests').select('*').eq('user_id', user!.id).order('created_at', { ascending: false }).limit(10),
    // Profile
    supabase.from('profiles').select('*').eq('id', user!.id).single(),
    // Learning progress
    supabase.from('learning_progress').select('completed').eq('user_id', user!.id),
    // All attempts for this user (to match against test_ids)
    supabase.from('attempts').select('test_id, score, accuracy, completed').eq('user_id', user!.id),
  ])

  const completedAttempts = completedAttemptsRes.data || []
  const totalTests = completedAttempts.length
  const avgAccuracy = totalTests > 0
    ? (completedAttempts.reduce((s, a) => s + (a.accuracy || 0), 0) / totalTests).toFixed(1)
    : '0'
  const avgScore = totalTests > 0
    ? (completedAttempts.reduce((s, a) => s + (a.score || 0), 0) / totalTests).toFixed(1)
    : '0'

  const questionCount = questionsRes.count || 0
  const recentTests = testsRes.data || []
  const profile = profileRes.data
  const completedTopics = progressRes.data?.filter(p => p.completed).length ?? 0

  // Build a map: test_id → attempt data (for matching without relying on FK joins)
  const attemptsByTestId = new Map<string, { score: number; accuracy: number; completed: boolean }>()
  for (const a of allAttemptsRes.data || []) {
    if (a.test_id && !attemptsByTestId.has(a.test_id)) {
      attemptsByTestId.set(a.test_id, {
        score: a.score ?? 0,
        accuracy: a.accuracy ?? 0,
        completed: a.completed ?? false,
      })
    }
  }

  const stats = [
    { label: 'Questions in Bank', value: questionCount.toLocaleString(), icon: '🧠', color: '#6366f1', sub: 'Available for practice' },
    { label: 'Tests Completed', value: totalTests, icon: '📋', color: '#8b5cf6', sub: 'Mock exams taken' },
    { label: 'Avg Accuracy', value: `${avgAccuracy}%`, icon: '🎯', color: '#10b981', sub: 'Overall performance' },
    { label: 'Topics Mastered', value: completedTopics, icon: '✅', color: '#f59e0b', sub: 'Completed subtopics' },
  ]

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening'

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="relative rounded-2xl overflow-hidden p-6 sm:p-8"
        style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(139,92,246,0.08) 50%, rgba(168,85,247,0.06) 100%)', border: '1px solid rgba(99,102,241,0.2)' }}>
        <div className="absolute inset-0 hero-radial opacity-50 pointer-events-none" />
        <div className="relative">
          <div className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#a5b4fc' }}>
            Good {greeting} 👋
          </div>
          <h1 className="text-3xl font-black mb-1" style={{ color: 'var(--text-primary)' }}>
            {profile?.full_name ? `Welcome back, ${profile.full_name.split(' ')[0]}!` : 'Your GATE Dashboard'}
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            {totalTests === 0
              ? 'Start with the Learning Hub to build your foundation.'
              : `You've completed ${totalTests} test${totalTests > 1 ? 's' : ''}. Keep the momentum going!`}
          </p>
          <div className="flex flex-wrap gap-3 mt-5">
            <Link href="/learn" className="btn-primary text-sm px-5 py-2.5">
              <BookOpen className="w-4 h-4" /> Learning Hub
            </Link>
            <Link href="/test" className="btn-secondary text-sm px-5 py-2.5">
              <FlaskConical className="w-4 h-4" /> Start Mock Test
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="stat-card p-4 sm:p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xl sm:text-2xl">{stat.icon}</span>
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: stat.color }} />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black" style={{ color: 'var(--text-primary)' }}>{stat.value}</div>
              <div className="text-xs sm:text-sm font-semibold mt-1 line-clamp-1" style={{ color: 'var(--text-primary)' }}>{stat.label}</div>
              <div className="text-[10px] sm:text-xs mt-0.5 line-clamp-1" style={{ color: 'var(--text-muted)' }}>{stat.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main content: Quick Actions + Test History */}
      <div className="grid lg:grid-cols-3 gap-6 items-start">

        {/* Quick Actions */}
        <div className="space-y-4">
          <h2 className="section-title">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
            {QUICK_ACTIONS.map((action) => (
              <Link key={action.title} href={action.href}
                className="card overflow-hidden p-3.5 sm:p-4 flex items-center gap-3 group cursor-pointer">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                  style={{ background: `${action.color}15`, border: `1px solid ${action.color}25` }}>
                  {action.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm group-hover:text-indigo-400 transition-colors truncate" style={{ color: 'var(--text-primary)' }}>
                    {action.title}
                  </h3>
                  <p className="text-[11px] sm:text-xs mt-0.5 truncate" style={{ color: 'var(--text-secondary)' }}>{action.desc}</p>
                </div>
                <ArrowRight className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-1" style={{ color: 'var(--text-muted)' }} />
              </Link>
            ))}
          </div>

          {totalTests > 0 && (
            <div className="card overflow-hidden p-5" style={{ background: 'rgba(16,185,129,0.04)', borderColor: 'rgba(16,185,129,0.15)' }}>
              <div className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: '#6ee7b7' }}>Avg Score</div>
              <div className="text-3xl font-black truncate" style={{ color: '#10b981' }}>{avgScore} <span className="text-base font-normal">/ 100</span></div>
              <div className="text-xs mt-1 truncate" style={{ color: 'var(--text-muted)' }}>across {totalTests} tests</div>
            </div>
          )}
        </div>

        {/* Test History — 2 cols */}
        <div className="lg:col-span-2 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title flex items-center gap-2">
              <History className="w-4 h-4" style={{ color: '#a5b4fc' }} />
              Test History
            </h2>
            <Link href="/test-history" className="text-sm flex items-center gap-1 transition-colors shrink-0" style={{ color: '#a5b4fc' }}>
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentTests.length > 0 ? (
            <div className="card overflow-hidden">
              <div className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
                {recentTests.map((test) => {
                  const attempt = attemptsByTestId.get(test.id)
                  const isCompleted = !!attempt?.completed

                  return (
                    <div key={test.id} className="flex items-center gap-3 px-4 py-3.5 hover:bg-indigo-500/[0.03] transition-colors w-full overflow-hidden group">
                      {/* Type icon */}
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-base"
                        style={{
                          background: test.type === 'full' ? 'rgba(245,158,11,0.1)' : test.type === 'subject' ? 'rgba(99,102,241,0.1)' : 'rgba(16,185,129,0.1)',
                        }}>
                        {test.type === 'full' ? '🏆' : test.type === 'subject' ? '📚' : '🎯'}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <Link
                          href={isCompleted ? `/test/${test.id}/results` : `/test/${test.id}`}
                          className="text-sm font-semibold truncate block hover:text-indigo-400 transition-colors"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {test.title}
                        </Link>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                            {test.question_count}q
                          </span>
                          <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>·</span>
                          <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                            {formatDate(test.created_at)}
                          </span>
                          {isCompleted && attempt.score != null && (
                            <>
                              <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>·</span>
                              <span className="text-[11px] font-semibold text-emerald-500">
                                {attempt.score.toFixed(2)} pts
                              </span>
                            </>
                          )}
                          {isCompleted && attempt.accuracy != null && (
                            <>
                              <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>·</span>
                              <span className="text-[11px] font-medium"
                                style={{ color: attempt.accuracy >= 70 ? '#10b981' : attempt.accuracy >= 50 ? '#f59e0b' : '#ef4444' }}>
                                {attempt.accuracy.toFixed(1)}%
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Status + actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        {isCompleted ? (
                          <span className="flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-lg"
                            style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>
                            <CheckCircle2 className="w-3 h-3" /> Done
                          </span>
                        ) : (
                          <Link href={`/test/${test.id}`}
                            className="flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-lg transition-colors"
                            style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8' }}>
                            <Clock className="w-3 h-3" /> Resume
                          </Link>
                        )}
                        {/* <DeleteTestButton testId={test.id} /> */}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="card p-6 sm:p-12 text-center">
              <div className="text-5xl mb-4">📋</div>
              <h3 className="font-bold mb-2" style={{ color: 'var(--text-primary)' }}>No tests yet</h3>
              <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>
                Head to the Mock Test section and take your first practice exam.
              </p>
              <Link href="/test" className="btn-primary inline-flex px-6">
                <FlaskConical className="w-4 h-4" /> Start Mock Test
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const QUICK_ACTIONS = [
  { href: '/dashboard/add-pyq', title: 'Add PYQ', desc: 'Add PYQ (MCQ, MSQ, NAT) manually', icon: '📝', color: '#ec4899' },
  { href: '/learn', title: 'Learning Hub', desc: 'Study structured GATE CSE curriculum', icon: '📖', color: '#6366f1' },
  { href: '/test', title: 'Mock Test', desc: 'Start a test from available question bank', icon: '🧪', color: '#8b5cf6' },
  { href: '/insights', title: 'AI Insights', desc: 'Personalized study recommendations', icon: '✨', color: '#10b981' },
  { href: '/analytics', title: 'Analytics', desc: 'Track your progress and weak areas', icon: '📊', color: '#f59e0b' },
]
