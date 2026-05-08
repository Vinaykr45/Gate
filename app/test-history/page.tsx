import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { CheckCircle2, Clock, History, FileText, Target, Play, FlaskConical } from 'lucide-react'
import DeleteTestButton from './DeleteTestButton'

export const metadata = { title: 'Test History — GateFlow Pro' }

export default async function TestHistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="card p-8 text-center">
          <p style={{ color: 'var(--text-muted)' }}>Please sign in to view your test history.</p>
          <Link href="/login" className="btn-primary mt-4 inline-flex">Sign In</Link>
        </div>
      </div>
    )
  }

  // Fetch tests + attempts separately (avoid FK join dependency)
  const [testsRes, attemptsRes] = await Promise.all([
    supabase
      .from('tests')
      .select('id, title, type, subject, topic, question_count, created_at, duration')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('attempts')
      .select('id, test_id, score, accuracy, completed, time_taken')
      .eq('user_id', user.id),
  ])

  const tests = testsRes.data ?? []
  const dbError = testsRes.error

  // Build map: test_id → attempt (with attempt.id for results link)
  const attemptsByTestId = new Map<string, {
    id: string
    score: number
    accuracy: number
    completed: boolean
    time_taken: number
  }>()
  for (const a of attemptsRes.data ?? []) {
    if (a.test_id && !attemptsByTestId.has(a.test_id)) {
      attemptsByTestId.set(a.test_id, {
        id: a.id,
        score: a.score ?? 0,
        accuracy: a.accuracy ?? 0,
        completed: a.completed ?? false,
        time_taken: a.time_taken ?? 0,
      })
    }
  }

  const completedCount = tests.filter(t => attemptsByTestId.get(t.id)?.completed).length
  const avgAccuracy = completedCount > 0
    ? (tests.reduce((sum, t) => {
        const a = attemptsByTestId.get(t.id)
        return sum + (a?.completed ? (a.accuracy ?? 0) : 0)
      }, 0) / completedCount).toFixed(1)
    : '0'

  return (
    <div className="space-y-6 max-w-4xl mx-auto">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <History className="w-6 h-6" style={{ color: '#a5b4fc' }} />
            Test History
          </h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {tests.length} total &middot; {completedCount} completed &middot; {avgAccuracy}% avg accuracy
          </p>
        </div>
      </div>

      {/* DB error */}
      {dbError && (
        <div className="rounded-xl border p-4 text-sm"
          style={{ background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.2)', color: '#ef4444' }}>
          Failed to load tests: {dbError.message}
        </div>
      )}

      {/* Stats Grid */}
      {tests.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card p-6 relative overflow-hidden group border border-indigo-500/10 hover:border-indigo-500/30 transition-colors">
            <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center justify-between relative z-10">
               <div>
                  <div className="text-sm font-semibold tracking-wide text-indigo-400/80 mb-1">TOTAL TESTS</div>
                  <div className="text-3xl font-black text-white drop-shadow-sm">{tests.length}</div>
               </div>
               <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                  <FileText className="w-6 h-6 text-indigo-400" />
               </div>
            </div>
          </div>

          <div className="card p-6 relative overflow-hidden group border border-emerald-500/10 hover:border-emerald-500/30 transition-colors">
            <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center justify-between relative z-10">
               <div>
                  <div className="text-sm font-semibold tracking-wide text-emerald-400/80 mb-1">COMPLETED</div>
                  <div className="text-3xl font-black text-white drop-shadow-sm">{completedCount}</div>
               </div>
               <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
               </div>
            </div>
          </div>

          <div className="card p-6 relative overflow-hidden group border border-amber-500/10 hover:border-amber-500/30 transition-colors">
            <div className="absolute inset-0 bg-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center justify-between relative z-10">
               <div>
                  <div className="text-sm font-semibold tracking-wide text-amber-400/80 mb-1">AVG ACCURACY</div>
                  <div className="text-3xl font-black text-white drop-shadow-sm">{avgAccuracy}%</div>
               </div>
               <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                  <Target className="w-6 h-6 text-amber-400" />
               </div>
            </div>
          </div>
        </div>
      )}



      {/* Test list */}
      <div className="space-y-4">
        {tests.length === 0 ? (
          <div className="card p-12 text-center space-y-4 border border-dashed border-white/10">
            <div className="text-5xl opacity-80">📋</div>
            <p className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>No test history yet</p>
            <p className="text-sm max-w-sm mx-auto" style={{ color: 'var(--text-muted)' }}>
              Start your first mock test to begin tracking your performance and accuracy.
            </p>
            <Link href="/test" className="btn-primary inline-flex px-6 mt-4 py-2.5">
              <FlaskConical className="w-4 h-4 mr-2" /> Start Mock Test
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tests.map((test) => {
              const attempt = attemptsByTestId.get(test.id)
              const isCompleted = !!attempt?.completed
              const resultsHref = isCompleted && attempt
                ? `/test/${test.id}/results?attemptId=${attempt.id}`
                : `/test/${test.id}`
              
              const typeColor = test.type === 'full' ? '#f59e0b' : test.type === 'subject' ? '#818cf8' : '#10b981'
              const typeBg = test.type === 'full' ? 'rgba(245,158,11,0.1)' : test.type === 'subject' ? 'rgba(99,102,241,0.1)' : 'rgba(16,185,129,0.1)'
              const typeIcon = test.type === 'full' ? '🏆' : test.type === 'subject' ? '📚' : '🎯'

              return (
                <div key={test.id}
                  className="card p-5 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between relative overflow-hidden group border border-white/5 hover:border-white/10 hover:shadow-2xl">
                  {/* Left colorful accent strip */}
                  <div className="absolute top-0 left-0 w-1 h-full" style={{ background: typeColor }} />
                  
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-lg shadow-inner" style={{ background: typeBg }}>
                        {typeIcon}
                      </div>
                      <div>
                        <Link href={resultsHref} className="font-semibold text-[15px] hover:text-indigo-400 transition-colors leading-tight line-clamp-1" title={test.title}>
                          {test.title}
                        </Link>
                        <div className="text-xs mt-1 font-medium" style={{ color: 'var(--text-muted)' }}>
                          {formatDate(test.created_at)} • {test.question_count}Qs
                        </div>
                      </div>
                    </div>
                    {/* Badge */}
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-md shrink-0"
                      style={{ background: typeBg, color: typeColor }}>
                      {test.type}
                    </span>
                  </div>

                  <div className="flex flex-col gap-3">
                    {test.subject && (
                      <div className="text-xs px-2.5 py-1 rounded-md self-start font-medium truncate max-w-full"
                        style={{ background: 'rgba(99,102,241,0.08)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.1)' }}>
                        {test.topic ?? test.subject}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between mt-1 pt-4 border-t border-white/5">
                      {isCompleted && attempt ? (
                        <div className="flex items-center gap-3">
                          <div>
                            <div className="text-[10px] uppercase tracking-wider text-white/40 font-semibold">Score</div>
                            <div className="text-sm font-bold text-emerald-400">{attempt.score.toFixed(2)}</div>
                          </div>
                          <div className="w-px h-6 bg-white/10"></div>
                          <div>
                            <div className="text-[10px] uppercase tracking-wider text-white/40 font-semibold">Accuracy</div>
                            <div className="text-sm font-bold" style={{ color: attempt.accuracy >= 70 ? '#10b981' : attempt.accuracy >= 50 ? '#f59e0b' : '#ef4444' }}>
                              {attempt.accuracy.toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm font-medium text-amber-400/80 flex items-center gap-1.5">
                          <Clock className="w-4 h-4" /> In Progress
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <DeleteTestButton testId={test.id} />
                        {isCompleted ? (
                          <Link href={resultsHref}
                            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white"
                            title="View Results">
                            <CheckCircle2 className="w-4 h-4" />
                          </Link>
                        ) : (
                          <Link href={`/test/${test.id}`}
                            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500 hover:text-white"
                            title="Resume Test">
                            <Play className="w-4 h-4 ml-0.5" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
