import { describe, it } from 'node:test'
import assert from 'node:assert'

interface EvaluationInput {
  examTrack: string
  paperNumber?: number
  isMSQ?: boolean
  isNAT?: boolean
  isCorrect: boolean
  marks?: number
}

function calculateAnswerScore(input: EvaluationInput): number {
  const marks = input.marks || 1.0

  if (input.isCorrect) {
    return marks
  }

  // NAT and MSQ never have negative marking
  if (input.isNAT || input.isMSQ) {
    return 0
  }

  const track = input.examTrack.toLowerCase()

  if (track === 'ca_foundation') {
    // Only Papers 3 and 4 have negative marking of 0.25
    if (input.paperNumber === 3 || input.paperNumber === 4) {
      return -0.25
    }
    return 0
  }

  if (track === 'ca_intermediate' || track === 'ca_final') {
    // Under ICAI New Scheme, 30% case scenario MCQs have NO negative marking
    return 0
  }

  // GATE CSE default: -0.33 for 1 mark, -0.66 for 2 marks
  return marks === 2.0 ? -0.66 : -0.33
}

describe('Authoritative Multi-Exam Scoring Engine', () => {
  it('correctly calculates GATE CSE 1-mark MCQ score and penalty', () => {
    const correctScore = calculateAnswerScore({ examTrack: 'gate_cse', isCorrect: true, marks: 1.0 })
    const wrongScore = calculateAnswerScore({ examTrack: 'gate_cse', isCorrect: false, marks: 1.0 })
    assert.strictEqual(correctScore, 1.0)
    assert.strictEqual(wrongScore, -0.33)
  })

  it('correctly exempts GATE NAT and MSQ questions from negative marks', () => {
    const wrongNAT = calculateAnswerScore({ examTrack: 'gate_cse', isNAT: true, isCorrect: false })
    const wrongMSQ = calculateAnswerScore({ examTrack: 'gate_cse', isMSQ: true, isCorrect: false })
    assert.strictEqual(wrongNAT, 0)
    assert.strictEqual(wrongMSQ, 0)
  })

  it('correctly applies -0.25 negative marking for CA Foundation Paper 3 & 4', () => {
    const wrongP3 = calculateAnswerScore({ examTrack: 'ca_foundation', paperNumber: 3, isCorrect: false })
    const wrongP4 = calculateAnswerScore({ examTrack: 'ca_foundation', paperNumber: 4, isCorrect: false })
    const wrongP1 = calculateAnswerScore({ examTrack: 'ca_foundation', paperNumber: 1, isCorrect: false })

    assert.strictEqual(wrongP3, -0.25)
    assert.strictEqual(wrongP4, -0.25)
    assert.strictEqual(wrongP1, 0) // Paper 1 subjective has NO negative marks
  })

  it('correctly exempts CA Intermediate & Final MCQs from negative marking under New Scheme', () => {
    const wrongInter = calculateAnswerScore({ examTrack: 'ca_intermediate', isCorrect: false })
    const wrongFinal = calculateAnswerScore({ examTrack: 'ca_final', isCorrect: false })

    assert.strictEqual(wrongInter, 0)
    assert.strictEqual(wrongFinal, 0)
  })
})
