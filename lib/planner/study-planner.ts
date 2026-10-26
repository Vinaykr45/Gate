/**
 * lib/planner/study-planner.ts
 *
 * Deterministic Study Planner for PrepAxis AI.
 * Generates structured day-by-day study targets, chapter milestones, and revision slots.
 * Does NOT require AI connectivity — guarantees reliable schedule calculation.
 */

import { CURRICULUM_REGISTRY } from '../curriculum/registry.ts'
import type { ExamTrackType } from '../curriculum/types.ts'

export interface DailyStudyTask {
  dayNumber: number
  dateStr: string
  paperTitle: string
  chapterTitle: string
  topicTitle: string
  taskType: 'study' | 'practice' | 'revision' | 'mock_test'
  estimatedHours: number
  isCompleted?: boolean
}

export interface StudyPlanResult {
  examTrack: ExamTrackType
  targetExamDate: string
  daysRemaining: number
  totalHoursPlanned: number
  dailyHours: number
  weeklyMilestones: Array<{
    weekNumber: number
    startDate: string
    endDate: string
    focusSubject: string
    targetChapters: string[]
  }>
  schedule: DailyStudyTask[]
}

export function generateStudyPlan(
  examTrack: ExamTrackType,
  targetExamDateStr: string,
  dailyHours = 3.0,
  startDateStr?: string
): StudyPlanResult {
  const start = startDateStr ? new Date(startDateStr) : new Date()
  const target = new Date(targetExamDateStr)

  const diffTime = target.getTime() - start.getTime()
  const daysRemaining = Math.max(Math.ceil(diffTime / (1000 * 60 * 60 * 24)), 7)

  const curriculum = CURRICULUM_REGISTRY[examTrack] || CURRICULUM_REGISTRY.gate_cse

  // Flatten all chapters and topics across papers
  const chapterUnits: Array<{ paper: string; chapter: string; topic: string }> = []
  for (const paper of curriculum.papers) {
    for (const chapter of paper.chapters) {
      if (chapter.topics.length > 0) {
        for (const topic of chapter.topics) {
          chapterUnits.push({
            paper: paper.title,
            chapter: chapter.title,
            topic: topic.title,
          })
        }
      } else {
        chapterUnits.push({
          paper: paper.title,
          chapter: chapter.title,
          topic: 'Fundamentals and Core Concepts',
        })
      }
    }
  }

  const schedule: DailyStudyTask[] = []
  const weeklyMilestones: StudyPlanResult['weeklyMilestones'] = []

  // Allocate 80% of days for initial coverage, 20% for full mock exams and revision
  const coverageDays = Math.max(Math.floor(daysRemaining * 0.8), 5)
  const finalRevisionDays = daysRemaining - coverageDays

  let unitIdx = 0
  const totalUnits = chapterUnits.length

  for (let day = 1; day <= coverageDays; day++) {
    const curDate = new Date(start)
    curDate.setDate(start.getDate() + day - 1)
    const dateStr = curDate.toISOString().split('T')[0]

    // Cycle or progress through syllabus units
    const unit = chapterUnits[unitIdx % totalUnits]
    unitIdx++

    const isPracticeDay = day % 4 === 0

    schedule.push({
      dayNumber: day,
      dateStr,
      paperTitle: unit.paper,
      chapterTitle: unit.chapter,
      topicTitle: unit.topic,
      taskType: isPracticeDay ? 'practice' : 'study',
      estimatedHours: dailyHours,
      isCompleted: false,
    })
  }

  // Final mock & revision sprint days
  for (let revDay = 1; revDay <= finalRevisionDays; revDay++) {
    const day = coverageDays + revDay
    const curDate = new Date(start)
    curDate.setDate(start.getDate() + day - 1)
    const dateStr = curDate.toISOString().split('T')[0]

    const isFullMock = revDay % 2 === 1

    schedule.push({
      dayNumber: day,
      dateStr,
      paperTitle: curriculum.papers[0]?.title || 'All Papers',
      chapterTitle: isFullMock ? 'Full-Length Timed Examination' : 'Mistake Book & Weak Areas',
      topicTitle: isFullMock ? 'GATE/ICAI Standard Mock Exam' : 'Spaced Repetition Review',
      taskType: isFullMock ? 'mock_test' : 'revision',
      estimatedHours: dailyHours,
      isCompleted: false,
    })
  }

  // Group into weekly milestones
  const totalWeeks = Math.ceil(daysRemaining / 7)
  for (let w = 1; w <= totalWeeks; w++) {
    const weekStart = new Date(start)
    weekStart.setDate(start.getDate() + (w - 1) * 7)
    const weekEnd = new Date(start)
    weekEnd.setDate(start.getDate() + Math.min(w * 7 - 1, daysRemaining - 1))

    const weekTasks = schedule.slice((w - 1) * 7, w * 7)
    const chaptersInWeek = Array.from(new Set(weekTasks.map(t => t.chapterTitle)))
    const primaryPaper = weekTasks[0]?.paperTitle || curriculum.papers[0]?.title || 'General'

    weeklyMilestones.push({
      weekNumber: w,
      startDate: weekStart.toISOString().split('T')[0],
      endDate: weekEnd.toISOString().split('T')[0],
      focusSubject: primaryPaper,
      targetChapters: chaptersInWeek.slice(0, 3),
    })
  }

  return {
    examTrack,
    targetExamDate: targetExamDateStr,
    daysRemaining,
    totalHoursPlanned: Math.round(daysRemaining * dailyHours),
    dailyHours,
    weeklyMilestones,
    schedule,
  }
}
