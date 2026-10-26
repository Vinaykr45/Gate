/**
 * lib/revision/spaced-repetition.ts
 *
 * SuperMemo-2 (SM-2) Spaced Repetition Scheduling Algorithm for PrepAxis AI.
 * Deterministic scheduling for mistake retention, bookmarked questions, and tricky concepts.
 */

export interface SRSItem {
  id: string
  repetitions: number
  intervalDays: number
  easeFactor: number
  lastReviewed: string
  nextDueDate: string
}

export type ReviewGrade = 0 | 1 | 2 | 3 | 4 | 5

export interface ReviewCalculationResult {
  repetitions: number
  intervalDays: number
  easeFactor: number
  nextDueDate: string
}

/**
 * Calculates updated SM-2 interval and ease factor based on student response grade (0-5)
 * 5: Perfect recall without hesitation
 * 4: Correct response after a hesitation
 * 3: Correct response recalled with serious difficulty
 * 2: Incorrect response; where the correct one seemed easy to recall
 * 1: Incorrect response; the correct one remembered
 * 0: Complete blackout
 */
export function calculateNextReview(
  grade: ReviewGrade,
  currentReps = 0,
  currentInterval = 1,
  currentEaseFactor = 2.50,
  reviewDate = new Date()
): ReviewCalculationResult {
  let repetitions = currentReps
  let intervalDays = currentInterval
  let easeFactor = currentEaseFactor

  // Ease factor calculation
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  easeFactor = easeFactor + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02))
  if (easeFactor < 1.30) {
    easeFactor = 1.30
  }

  // If grade < 3, the student failed to recall correctly; restart repetition cycle
  if (grade < 3) {
    repetitions = 0
    intervalDays = 1
  } else {
    // Successful recall
    repetitions += 1
    if (repetitions === 1) {
      intervalDays = 1
    } else if (repetitions === 2) {
      intervalDays = 6
    } else {
      intervalDays = Math.round(intervalDays * easeFactor)
    }
  }

  const nextDue = new Date(reviewDate)
  nextDue.setDate(nextDue.getDate() + intervalDays)

  return {
    repetitions,
    intervalDays,
    easeFactor: parseFloat(easeFactor.toFixed(2)),
    nextDueDate: nextDue.toISOString(),
  }
}
