'use client'

import { useState, useEffect } from 'react'
import { CalendarCheck, Clock, CheckCircle2, Circle, Target, BookOpen, ChevronRight, Award } from 'lucide-react'
import { BRAND, type ExamTrackId } from '@/lib/brand'
import type { StudyPlanResult, DailyStudyTask } from '@/lib/planner/study-planner'

export default function StudyPlannerPage() {
  const [track, setTrack] = useState<ExamTrackId>('gate_cse')
  const [targetDate, setTargetDate] = useState('2026-02-01')
  const [dailyHours, setDailyHours] = useState(3.0)
  const [plan, setPlan] = useState<StudyPlanResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [completedMap, setCompletedMap] = useState<Record<number, boolean>>({})

  useEffect(() => {
    const savedTrack = (localStorage.getItem('prepaxis_active_track') as ExamTrackId) || 'gate_cse'
    setTrack(savedTrack)

    // Load completed tasks from local storage
    try {
      const savedCompleted = localStorage.getItem(`prepaxis_completed_tasks_${savedTrack}`)
      if (savedCompleted) {
        setCompletedMap(JSON.parse(savedCompleted))
      }
    } catch {}

    fetchPlan(savedTrack, targetDate, dailyHours)

    const onTrackChange = (e: Event) => {
      const newTrack = (e as CustomEvent).detail?.track
      if (newTrack) {
        setTrack(newTrack)
        fetchPlan(newTrack, targetDate, dailyHours)
      }
    }
    window.addEventListener('prepaxis:track-changed', onTrackChange)
    return () => window.removeEventListener('prepaxis:track-changed', onTrackChange)
  }, [])

  const fetchPlan = async (t: ExamTrackId, date: string, hours: number) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/planner?track=${t}&targetDate=${date}&dailyHours=${hours}`)
      const data = await res.json()
      if (data.plan) {
        setPlan(data.plan)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const toggleTask = (dayNumber: number) => {
    const updated = { ...completedMap, [dayNumber]: !completedMap[dayNumber] }
    setCompletedMap(updated)
    localStorage.setItem(`prepaxis_completed_tasks_${track}`, JSON.stringify(updated))
  }

  const totalTasks = plan?.schedule.length || 0
  const completedCount = Object.values(completedMap).filter(Boolean).length
  const progressPercent = totalTasks > 0 ? Math.min(Math.round((completedCount / totalTasks) * 100), 100) : 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2.5">
            <CalendarCheck className="w-8 h-8 text-indigo-400" /> Study Planner
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Deterministic roadmap for <strong className="text-white">{BRAND.tracks.find(t => t.id === track)?.name}</strong>.
            Guaranteed curriculum coverage without artificial backlogs.
          </p>
        </div>

        {/* Configuration Bar */}
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">Target Exam Date</label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => {
                setTargetDate(e.target.value)
                fetchPlan(track, e.target.value, dailyHours)
              }}
              className="px-3 py-1.5 text-xs rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">Daily Study Hours</label>
            <select
              value={dailyHours}
              onChange={(e) => {
                const h = parseFloat(e.target.value)
                setDailyHours(h)
                fetchPlan(track, targetDate, h)
              }}
              className="px-3 py-1.5 text-xs rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none cursor-pointer"
            >
              <option value="2.0">2.0 Hours / Day</option>
              <option value="3.0">3.0 Hours / Day</option>
              <option value="4.5">4.5 Hours / Day</option>
              <option value="6.0">6.0 Hours / Day</option>
            </select>
          </div>
        </div>
      </div>

      {/* Progress Cards */}
      {plan && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card p-4">
            <div className="text-xs text-slate-400 font-medium">Days Remaining</div>
            <div className="text-2xl font-bold text-white mt-1">{plan.daysRemaining} Days</div>
            <div className="text-[11px] text-indigo-400 mt-1">To target exam</div>
          </div>
          <div className="card p-4">
            <div className="text-xs text-slate-400 font-medium">Total Study Hours Planned</div>
            <div className="text-2xl font-bold text-white mt-1">{plan.totalHoursPlanned} hrs</div>
            <div className="text-[11px] text-emerald-400 mt-1">At {plan.dailyHours} hrs/day</div>
          </div>
          <div className="card p-4">
            <div className="text-xs text-slate-400 font-medium">Tasks Completed</div>
            <div className="text-2xl font-bold text-white mt-1">{completedCount} / {totalTasks}</div>
            <div className="text-[11px] text-amber-400 mt-1">{progressPercent}% roadmap completed</div>
          </div>
          <div className="card p-4">
            <div className="text-xs text-slate-400 font-medium">Weekly Milestones</div>
            <div className="text-2xl font-bold text-white mt-1">{plan.weeklyMilestones.length} Weeks</div>
            <div className="text-[11px] text-purple-400 mt-1">Includes revision sprints</div>
          </div>
        </div>
      )}

      {/* Weekly Milestones */}
      {plan && plan.weeklyMilestones.length > 0 && (
        <div className="card p-6">
          <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" /> Weekly Milestone Breakdown
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {plan.weeklyMilestones.slice(0, 6).map((m) => (
              <div key={m.weekNumber} className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/50">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-indigo-400">Week {m.weekNumber}</span>
                  <span className="text-slate-400 text-[11px]">{m.startDate}</span>
                </div>
                <div className="text-xs font-semibold text-white truncate mb-1">{m.focusSubject}</div>
                <div className="text-[11px] text-slate-400 line-clamp-2">
                  {m.targetChapters.join(', ') || 'Comprehensive review and practice'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Daily Tasks Schedule */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-indigo-400" /> Daily Action Checklist
          </h2>
          <span className="text-xs text-slate-400 font-medium">
            Showing first 30 days
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-sm">Calculating deterministic roadmap...</div>
        ) : plan && plan.schedule.length > 0 ? (
          <div className="space-y-2">
            {plan.schedule.slice(0, 30).map((task) => {
              const isDone = !!completedMap[task.dayNumber]
              return (
                <div
                  key={task.dayNumber}
                  onClick={() => toggleTask(task.dayNumber)}
                  className={`flex items-start justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isDone
                      ? 'bg-emerald-950/20 border-emerald-800/40 opacity-75'
                      : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button className="mt-0.5 text-slate-400 hover:text-emerald-400">
                      {isDone ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-500" />
                      )}
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">
                          Day {task.dayNumber} · {task.dateStr}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                          task.taskType === 'practice'
                            ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                            : task.taskType === 'mock_test'
                              ? 'bg-purple-500/10 text-purple-300 border border-purple-500/20'
                              : 'bg-blue-500/10 text-blue-300 border border-blue-500/20'
                        }`}>
                          {task.taskType.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <div className={`text-sm font-semibold mt-0.5 ${isDone ? 'line-through text-slate-400' : 'text-white'}`}>
                        {task.chapterTitle}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {task.paperTitle} — {task.topicTitle}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {task.estimatedHours}h
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="py-8 text-center text-slate-400 text-sm">No tasks scheduled.</div>
        )}
      </div>
    </div>
  )
}
