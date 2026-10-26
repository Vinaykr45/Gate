import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft, ChevronRight, CheckCircle2, Clock, FlaskConical, Layers } from 'lucide-react'
import type { Metadata } from 'next'
import { AddTopicForm } from '@/components/learn/AddTopicForm'
import { DeleteTopicButton } from '@/components/learn/DeleteTopicButton'
import { DeleteGroupButton } from '@/components/learn/DeleteGroupButton'
import { GATE_SUBJECTS } from '@/lib/utils'
import { CURRICULUM_REGISTRY, findCurriculumStructure } from '@/lib/curriculum/registry'
import { ALL_SUBJECT_META } from '../CurriculumHubClient'

interface Props { params: Promise<{ subject: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { subject } = await params
  return { title: `${decodeURIComponent(subject)} — Learning Hub` }
}

export default async function SubjectPage({ params }: Props) {
  const { subject: encodedSubject } = await params
  const subject = decodeURIComponent(encodedSubject)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 1. Fetch any database-persisted topics for this subject
  const { data: dbTopics } = await supabase
    .from('learning_topics')
    .select('*')
    .eq('subject', subject)
    .order('order_num')

  // 2. Check if this is a known subject from GATE, CURRICULUM_REGISTRY, or DB
  const curriculumInfo = findCurriculumStructure(subject)
  const isGate = GATE_SUBJECTS.includes(subject as any)
  const isCustomDb = (dbTopics && dbTopics.length > 0)

  // 3. User progress
  const { data: progress } = user
    ? await supabase
        .from('learning_progress')
        .select('topic_id, completed, watched_videos, read_notes')
        .eq('user_id', user.id)
    : { data: [] }

  const progressMap = new Map(progress?.map(p => [p.topic_id, p]) ?? [])

  // 4. Build topics map: use DB topics if available, else derive from CURRICULUM_REGISTRY
  let byTopic: Record<string, Array<{ id: string; subject: string; topic: string; subtopic: string; description?: string }>> = {}

  if (dbTopics && dbTopics.length > 0) {
    byTopic = dbTopics.reduce<Record<string, typeof dbTopics>>((acc, t) => {
      if (!acc[t.topic]) acc[t.topic] = []
      acc[t.topic]!.push(t)
      return acc
    }, {})
  } else if (curriculumInfo) {
    // Generate structure from CURRICULUM_REGISTRY
    if (curriculumInfo.type === 'chapter' && curriculumInfo.chapter) {
      const ch = curriculumInfo.chapter
      for (const t of ch.topics) {
        byTopic[t.title] = t.subtopics.map(s => ({
          id: s.id,
          subject,
          topic: t.title,
          subtopic: s.title,
          description: s.description || `${subject} — ${t.title}`,
        }))
      }
    } else if (curriculumInfo.type === 'paper' && curriculumInfo.paper) {
      const p = curriculumInfo.paper
      for (const ch of p.chapters) {
        byTopic[ch.title] = ch.topics.flatMap(t =>
          t.subtopics.map(s => ({
            id: s.id,
            subject,
            topic: ch.title,
            subtopic: s.title,
            description: s.description || `${ch.title} — ${t.title}`,
          }))
        )
      }
    }
  }

  const allTopicsList = Object.values(byTopic).flat()
  const completedCount = allTopicsList.filter(t => progressMap.get(t.id)?.completed).length
  const totalCount = allTopicsList.length
  const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  const meta = ALL_SUBJECT_META[subject] || {
    icon: '📚',
    color: '#6366f1',
    desc: curriculumInfo?.paper?.title || 'Comprehensive preparation topics and syllabus breakdown',
    marks: curriculumInfo?.paper ? `${curriculumInfo.paper.marks} Marks` : '',
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <Link href="/learn" className="hover:text-indigo-400 transition-colors flex items-center gap-1">
          <ChevronLeft className="w-4 h-4" /> Curriculum Hub
        </Link>
        <span>/</span>
        <span className="text-white font-medium">{subject}</span>
      </div>

      {/* Header */}
      <div
        className="relative rounded-2xl overflow-hidden p-7"
        style={{
          background: `linear-gradient(135deg, ${meta.color}15 0%, rgba(15,23,42,0.6) 100%)`,
          border: `1px solid ${meta.color}30`,
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0 shadow-sm"
              style={{ background: `${meta.color}20`, border: `1px solid ${meta.color}40` }}
            >
              {meta.icon}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-black text-white">{subject}</h1>
                {meta.marks && (
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: `${meta.color}20`, color: meta.color }}
                  >
                    {meta.marks}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                {meta.desc}
              </p>
              <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                <span>{totalCount} subtopics</span>
                <span>•</span>
                <span>{completedCount} completed</span>
                <span>•</span>
                <span>~{totalCount * 45} min estimated study time</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <div className="text-center">
              <div className="text-3xl font-black gradient-text">{pct}%</div>
              <div className="text-xs text-slate-400">complete</div>
            </div>
            <Link
              href="/test"
              className="btn-primary text-sm px-4 py-2 flex items-center gap-2"
            >
              <FlaskConical className="w-4 h-4" /> Practice Quiz
            </Link>
          </div>
        </div>
        <div className="mt-5">
          <div className="progress-track h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="progress-fill h-full transition-all duration-700 rounded-full"
              style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${meta.color}, #06b6d4)` }}
            />
          </div>
        </div>
      </div>

      {/* Add Topic Form */}
      <AddTopicForm subject={subject} />

      {/* Topic Groups */}
      <div className="space-y-5">
        {Object.keys(byTopic).length === 0 ? (
          <div className="card p-12 text-center border-dashed border-slate-800 bg-transparent">
            <div
              className="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-2xl mb-4 bg-slate-800/60 border border-slate-700"
            >
              📭
            </div>
            <h3 className="text-lg font-bold text-white">No topics yet</h3>
            <p className="text-sm mt-1 max-w-sm mx-auto text-slate-400">
              Use the form above to add custom subtopics for {subject}.
            </p>
          </div>
        ) : (
          Object.entries(byTopic).map(([topicName, subtopicsRaw]) => {
            const subtopics = subtopicsRaw || []
            const groupCompleted = subtopics.filter(s => progressMap.get(s.id)?.completed).length
            const groupPct = subtopics.length > 0 ? Math.round((groupCompleted / subtopics.length) * 100) : 0

            return (
              <div key={topicName} className="card overflow-hidden border border-slate-800">
                {/* Group header */}
                <div
                  className="px-6 py-4 flex items-center justify-between border-b border-slate-800 bg-slate-900/60"
                >
                  <div>
                    <h2 className="font-bold text-base text-white">{topicName}</h2>
                    <p className="text-xs mt-0.5 text-slate-400">
                      {groupCompleted}/{subtopics.length} done · ~{subtopics.length * 45} min
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-bold text-indigo-400">
                      {groupPct}%
                    </div>
                    <div className="w-16 h-1.5 rounded-full overflow-hidden bg-slate-800">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${groupPct}%`,
                          background: groupPct === 100 ? '#10b981' : 'linear-gradient(90deg,#6366f1,#8b5cf6)',
                        }}
                      />
                    </div>
                    {/* Delete group button for custom topics */}
                    {subtopics[0]?.id && !subtopics[0].id.includes('_') && (
                      <DeleteGroupButton ids={subtopics.map(s => s.id)} label={topicName} />
                    )}
                  </div>
                </div>

                {/* Subtopics */}
                <div className="divide-y divide-slate-800/80">
                  {subtopics.map((subtopic, idx) => {
                    const prog = progressMap.get(subtopic.id)
                    const isDone = prog?.completed ?? false
                    const videoCount = prog?.watched_videos?.length ?? 0
                    const noteCount = prog?.read_notes?.length ?? 0
                    const hasActivity = videoCount > 0 || noteCount > 0

                    return (
                      <div key={subtopic.id || idx} className="relative group hover:bg-slate-800/30 transition-colors">
                        <Link
                          href={`/learn/${encodedSubject}/${encodeURIComponent(subtopic.id)}`}
                          className="flex items-center gap-4 px-6 py-3.5 text-inherit no-underline"
                          style={{
                            background: isDone ? 'rgba(16,185,129,0.03)' : undefined,
                            paddingRight: 80,
                          }}
                        >
                          {/* Step number / check */}
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                              isDone
                                ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
                                : 'bg-slate-800 border border-slate-700 text-slate-400'
                            }`}
                          >
                            {isDone ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : idx + 1}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className={`font-medium text-sm ${isDone ? 'text-emerald-400' : 'text-slate-200'}`}>
                              {subtopic.subtopic}
                            </div>
                            {subtopic.description && (
                              <p className="text-xs mt-0.5 text-slate-400 truncate">
                                {subtopic.description}
                              </p>
                            )}
                            {hasActivity && (
                              <div className="flex gap-3 mt-1 text-[11px] text-slate-500">
                                {videoCount > 0 && <span>🎥 {videoCount} watched</span>}
                                {noteCount > 0 && <span>📝 {noteCount} read</span>}
                              </div>
                            )}
                          </div>

                          {/* Time estimate */}
                          <div className="flex items-center gap-1 text-xs text-slate-400 shrink-0">
                            <Clock className="w-3 h-3" /> 45 min
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 group-hover:translate-x-1 transition-transform" />
                        </Link>

                        {/* Delete button for DB stored subtopics */}
                        {subtopic.id && !subtopic.id.includes('_') && (
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10">
                            <DeleteTopicButton
                              id={subtopic.id}
                              label={subtopic.subtopic}
                              type="subtopic"
                            />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
