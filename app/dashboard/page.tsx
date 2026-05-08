import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { BookOpen, FlaskConical, TrendingUp, Sparkles, ArrowRight } from 'lucide-react'

export const metadata = { title: 'Dashboard — GateFlow Pro' }

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [attemptsRes, questionsRes, testsRes, profileRes, progressRes] = await Promise.all([
    supabase.from('attempts').select('*').eq('user_id', user!.id).eq('completed', true),
    supabase.from('questions').select('id', { count: 'exact', head: true }),
    supabase.from('tests').select('*').eq('user_id', user!.id).order('created_at', { ascending: false }).limit(5),
    supabase.from('profiles').select('*').eq('id', user!.id).single(),
    supabase.from('learning_progress').select('completed').eq('user_id', user!.id),
  ])

  const attempts = attemptsRes.data || []
  const totalTests = attempts.length
  const avgAccuracy = totalTests > 0
    ? (attempts.reduce((s, a) => s + (a.accuracy || 0), 0) / totalTests).toFixed(1)
    : '0'
  const avgScore = totalTests > 0
    ? (attempts.reduce((s, a) => s + (a.score || 0), 0) / totalTests).toFixed(1)
    : '0'
  const questionCount = questionsRes.count || 0
  const recentTests = testsRes.data || []
  const profile = profileRes.data
  const completedTopics = progressRes.data?.filter(p => p.completed).length ?? 0

  const stats = [
    { label: 'Questions in Bank', value: questionCount.toLocaleString(), icon: '🧠', color: '#6366f1', sub: 'AI-generated & curated' },
    { label: 'Tests Completed', value: totalTests, icon: '📋', color: '#8b5cf6', sub: 'Mock exams taken' },
    { label: 'Avg Accuracy', value: `${avgAccuracy}%`, icon: '🎯', color: '#10b981', sub: 'Overall performance' },
    { label: 'Topics Mastered', value: completedTopics, icon: '✅', color: '#f59e0b', sub: 'Completed subtopics' },
  ]

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="relative rounded-2xl overflow-hidden p-6 sm:p-8"
        style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(139,92,246,0.08) 50%, rgba(168,85,247,0.06) 100%)', border: '1px solid rgba(99,102,241,0.2)' }}>
        <div className="absolute inset-0 hero-radial opacity-50 pointer-events-none" />
        <div className="relative">
          <div className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#a5b4fc' }}>
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'} 👋
          </div>
          <h1 className="text-3xl font-black mb-1" style={{ color: 'var(--text-primary)' }}>
            {profile?.full_name ? `Welcome back, ${profile.full_name.split(' ')[0]}!` : 'Your GATE Dashboard'}
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            {totalTests === 0 ? "Start with the Learning Hub to build your foundation." : `You've completed ${totalTests} test${totalTests > 1 ? 's' : ''}. Keep the momentum going!`}
          </p>
          <div className="flex flex-wrap gap-3 mt-5">
            <Link href="/learn" className="btn-primary text-sm px-5 py-2.5">
              <BookOpen className="w-4 h-4" /> Learning Hub
            </Link>
            <Link href="/test" className="btn-secondary text-sm px-5 py-2.5">
              <FlaskConical className="w-4 h-4" /> Start Practice Quiz
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

      {/* Main content: Quick Actions + Recent Tests */}
      <div className="grid lg:grid-cols-3 gap-6 items-start">
        {/* Quick Actions — 1 col */}
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

          {/* Avg Score mini card */}
          {totalTests > 0 && (
            <div className="card overflow-hidden p-5" style={{ background: 'rgba(16,185,129,0.04)', borderColor: 'rgba(16,185,129,0.15)' }}>
              <div className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: '#6ee7b7' }}>Avg Score</div>
              <div className="text-3xl font-black truncate" style={{ color: '#10b981' }}>{avgScore} <span className="text-base font-normal">/ 100</span></div>
              <div className="text-xs mt-1 truncate" style={{ color: 'var(--text-muted)' }}>across {totalTests} tests</div>
            </div>
          )}
        </div>

        {/* Recent Tests — 2 cols */}
        <div className="lg:col-span-2 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Recent Tests</h2>
            <Link href="/test" className="text-sm flex items-center gap-1 transition-colors shrink-0"
              style={{ color: '#a5b4fc' }}>
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentTests.length > 0 ? (
            <div className="card overflow-hidden">
              <div className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
                {recentTests.map((test) => (
                  <div key={test.id} className="flex items-center gap-2.5 sm:gap-3 px-3 sm:px-5 py-3 sm:py-4 hover:bg-indigo-500/[0.03] transition-colors w-full overflow-hidden">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 text-sm sm:text-base"
                      style={{
                        background: test.type === 'full' ? 'rgba(239,68,68,0.1)' : test.type === 'subject' ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)',
                      }}>
                      {test.type === 'full' ? '🏆' : test.type === 'subject' ? '📚' : '🎯'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] sm:text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{test.title}</div>
                      <div className="text-[11px] sm:text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
                        {test.question_count}q · {formatDate(test.created_at)}
                      </div>
                    </div>
                    <span className={`badge shrink-0 text-[10px] sm:text-xs px-1.5 sm:px-2.5 ${test.type === 'full' ? 'badge-hard' : test.type === 'subject' ? 'badge-medium' : 'badge-easy'}`}>
                      {test.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="card p-6 sm:p-12 text-center">
              <div className="text-5xl mb-4">📋</div>
              <h3 className="font-bold mb-2" style={{ color: 'var(--text-primary)' }}>No tests yet</h3>
              <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>
                Head to Learning Hub, study a topic, then hit &ldquo;Practice Quiz&rdquo; to generate your first AI quiz.
              </p>
              <Link href="/learn" className="btn-primary inline-flex px-6">
                <BookOpen className="w-4 h-4" /> Go to Learning Hub
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const QUICK_ACTIONS = [
  { href: '/learn', title: 'Learning Hub', desc: 'Study structured GATE curriculum with AI', icon: '📖', color: '#6366f1' },
  { href: '/test', title: 'AI Practice Quiz', desc: 'Generate questions from your study material', icon: '🧪', color: '#8b5cf6' },
  { href: '/insights', title: 'AI Insights', desc: 'Personalized study recommendations', icon: '✨', color: '#10b981' },
  { href: '/analytics', title: 'Analytics', desc: 'Track your progress and weak areas', icon: '📊', color: '#f59e0b' },
]
