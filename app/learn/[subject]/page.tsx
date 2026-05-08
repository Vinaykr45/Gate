import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft, ChevronRight, CheckCircle2, Clock, FlaskConical } from 'lucide-react'
import type { Metadata } from 'next'
import { AddTopicForm } from '@/components/learn/AddTopicForm'
import { DeleteTopicButton } from '@/components/learn/DeleteTopicButton'
import { DeleteGroupButton } from '@/components/learn/DeleteGroupButton'

interface Props { params: Promise<{ subject: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { subject } = await params
  return { title: `${decodeURIComponent(subject)} — Learning Hub` }
}

const TOPIC_ICONS: Record<string, string> = {
  'Operating Systems': '🖥️', 'DBMS': '🗄️',
  'Data Structures & Algorithms': '🌲', 'Computer Networks': '🌐',
  'Theory of Computation': '⚙️', 'Compiler Design': '🔧',
  'Computer Organization': '💾', 'Mathematics': '∑', 'General Aptitude': '🧩',
}

export default async function SubjectPage({ params }: Props) {
  const { subject: encodedSubject } = await params
  const subject = decodeURIComponent(encodedSubject)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: topics } = await supabase
    .from('learning_topics').select('*').eq('subject', subject).order('order_num')

  if (!topics || topics.length === 0) notFound()

  const { data: progress } = user
    ? await supabase.from('learning_progress').select('topic_id, completed, watched_videos, read_notes').eq('user_id', user.id)
    : { data: [] }

  const progressMap = new Map(progress?.map(p => [p.topic_id, p]) ?? [])

  const byTopic = topics.reduce<Record<string, typeof topics>>((acc, t) => {
    if (!acc[t.topic]) acc[t.topic] = []
    acc[t.topic]!.push(t)
    return acc
  }, {})

  const completedCount = topics.filter(t => progressMap.get(t.id)?.completed).length
  const pct = Math.round((completedCount / topics.length) * 100)
  const icon = TOPIC_ICONS[subject] ?? '📚'

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
        <Link href="/learn" className="hover:text-indigo-400 transition-colors flex items-center gap-1">
          <ChevronLeft className="w-4 h-4" /> Learning Hub
        </Link>
        <span>/</span>
        <span style={{ color: 'var(--text-primary)' }}>{subject}</span>
      </div>

      {/* Header */}
      <div className="relative rounded-2xl overflow-hidden p-7"
        style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(139,92,246,0.05) 100%)', border: '1px solid rgba(99,102,241,0.15)' }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0"
              style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)' }}>
              {icon}
            </div>
            <div>
              <h1 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>{subject}</h1>
              <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                {topics.length} subtopics · {completedCount} completed · ~{topics.length * 45} min total
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <div className="text-center">
              <div className="text-3xl font-black gradient-text">{pct}%</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>complete</div>
            </div>
            <Link href="/test"
              className="btn-primary text-sm px-4 py-2 flex items-center gap-2">
              <FlaskConical className="w-4 h-4" /> Practice Quiz
            </Link>
          </div>
        </div>
        <div className="mt-5">
          <div className="progress-track h-1.5">
            <div className="progress-fill h-full transition-all duration-700" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>

      {/* Add Topic Form */}
      <AddTopicForm subject={subject} />

      {/* Topic Groups */}
      <div className="space-y-5">
        {Object.entries(byTopic).map(([topicName, subtopics]) => {
          const groupCompleted = subtopics.filter(s => progressMap.get(s.id)?.completed).length
          const groupPct = Math.round((groupCompleted / subtopics.length) * 100)

          return (
            <div key={topicName} className="card overflow-hidden">
              {/* Group header */}
              <div className="px-6 py-4 flex items-center justify-between border-b"
                style={{ borderColor: 'var(--border-subtle)', background: 'rgba(99,102,241,0.03)' }}>
                <div>
                  <h2 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>{topicName}</h2>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {groupCompleted}/{subtopics.length} done · ~{subtopics.length * 45} min
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-sm font-bold" style={{ color: groupPct === 100 ? '#10b981' : '#a5b4fc' }}>
                    {groupPct}%
                  </div>
                  <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${groupPct}%`, background: groupPct === 100 ? '#10b981' : 'linear-gradient(90deg,#6366f1,#8b5cf6)' }} />
                  </div>
                  <DeleteGroupButton ids={subtopics.map(s => s.id)} label={topicName} />
                </div>
              </div>

              {/* Subtopics */}
              <div className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
                {subtopics.map((subtopic, idx) => {
                  const prog = progressMap.get(subtopic.id)
                  const isDone = prog?.completed ?? false
                  const videoCount = prog?.watched_videos?.length ?? 0
                  const noteCount = prog?.read_notes?.length ?? 0
                  const hasActivity = videoCount > 0 || noteCount > 0

                  return (
                     <div key={subtopic.id} style={{ position: 'relative', borderBottom: '1px solid var(--border-subtle)' }}>
                       {/* Clickable link area */}
                       <Link
                         href={`/learn/${encodedSubject}/${subtopic.id}`}
                         style={{
                           display: 'flex', alignItems: 'center', gap: 16,
                           padding: '14px 24px', textDecoration: 'none',
                           background: isDone ? 'rgba(16,185,129,0.02)' : undefined,
                           paddingRight: 100, // leave room for delete button
                         }}>
                         {/* Step number / check */}
                         <div style={{
                           width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center',
                           justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0,
                           ...(isDone
                             ? { background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981' }
                             : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-muted)' })
                         }}>
                           {isDone ? <CheckCircle2 style={{ width: 14, height: 14, color: '#10b981' }} /> : idx + 1}
                         </div>

                         {/* Content */}
                         <div style={{ flex: 1, minWidth: 0 }}>
                           <div style={{ fontWeight: 500, fontSize: 14, color: isDone ? '#10b981' : 'var(--text-primary)' }}>
                             {subtopic.subtopic}
                           </div>
                           {subtopic.description && (
                             <p style={{ fontSize: 12, marginTop: 2, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                               {subtopic.description}
                             </p>
                           )}
                           {hasActivity && (
                             <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                               {videoCount > 0 && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>🎥 {videoCount} watched</span>}
                               {noteCount > 0 && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>📝 {noteCount} read</span>}
                             </div>
                           )}
                         </div>

                         {/* Time estimate */}
                         <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)', flexShrink: 0 }}>
                           <Clock style={{ width: 12, height: 12 }} /> 45 min
                         </div>
                         <ChevronRight style={{ width: 16, height: 16, color: 'var(--text-muted)', flexShrink: 0 }} />
                       </Link>

                       {/* Delete button — outside Link to avoid navigation */}
                       <div style={{ position: 'absolute', right: 50, top: '50%', transform: 'translateY(-50%)', zIndex: 10 }}>
                         <DeleteTopicButton
                           id={subtopic.id}
                           label={subtopic.subtopic}
                           type="subtopic"
                         />
                       </div>
                     </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
