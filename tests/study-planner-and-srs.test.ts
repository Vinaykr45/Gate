import { describe, it } from 'node:test'
import assert from 'node:assert'
import { generateStudyPlan } from '../lib/planner/study-planner.ts'
import { calculateNextReview } from '../lib/revision/spaced-repetition.ts'

describe('Deterministic Study Planner', () => {
  it('generates daily roadmap without AI dependencies', () => {
    const today = new Date('2026-01-01')
    const targetDate = '2026-02-01' // 31 days
    const plan = generateStudyPlan('gate_cse', targetDate, 3.0, '2026-01-01')

    assert.strictEqual(plan.examTrack, 'gate_cse')
    assert.strictEqual(plan.daysRemaining, 31)
    assert.strictEqual(plan.totalHoursPlanned, 31 * 3)
    assert.strictEqual(plan.schedule.length, 31)
    assert.ok(plan.weeklyMilestones.length >= 4)
  })

  it('allocates revision sprint and mock test days towards end of schedule', () => {
    const plan = generateStudyPlan('ca_foundation', '2026-03-01', 4.0, '2026-01-01')
    const lastDay = plan.schedule[plan.schedule.length - 1]

    assert.ok(lastDay.taskType === 'mock_test' || lastDay.taskType === 'revision')
  })
})

describe('SuperMemo-2 (SM-2) Spaced Repetition', () => {
  it('resets repetition count to 0 when recall grade is < 3', () => {
    const currentReps = 3
    const currentInterval = 10
    const currentEase = 2.50

    const updated = calculateNextReview(1, currentReps, currentInterval, currentEase)
    assert.strictEqual(updated.repetitions, 0)
    assert.strictEqual(updated.intervalDays, 1)
  })

  it('advances interval to 6 days on second successful repetition', () => {
    const currentReps = 1
    const currentInterval = 1
    const currentEase = 2.50

    const updated = calculateNextReview(4, currentReps, currentInterval, currentEase)
    assert.strictEqual(updated.repetitions, 2)
    assert.strictEqual(updated.intervalDays, 6)
  })

  it('maintains minimum ease factor at 1.30', () => {
    let ease = 1.40
    for (let i = 0; i < 5; i++) {
      const res = calculateNextReview(0, 0, 1, ease)
      ease = res.easeFactor
    }
    assert.ok(ease >= 1.30)
  })
})
