/**
 * lib/curriculum/validator.ts
 *
 * Curriculum hierarchy and import validator.
 * Validates external or admin-submitted curriculum structures before database insertion.
 */

import type { ExamPaper, ExamTrackType, CurriculumChapter } from './types'

export interface CurriculumValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  paperCount: number
  chapterCount: number
  topicCount: number
  subtopicCount: number
}

export function validateCurriculumImport(data: unknown, track: ExamTrackType): CurriculumValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  let paperCount = 0
  let chapterCount = 0
  let topicCount = 0
  let subtopicCount = 0

  if (!data || typeof data !== 'object') {
    return {
      isValid: false,
      errors: ['Curriculum data must be a valid JSON object'],
      warnings: [],
      paperCount: 0,
      chapterCount: 0,
      topicCount: 0,
      subtopicCount: 0,
    }
  }

  const papers = Array.isArray(data) ? data : (data as { papers?: unknown[] }).papers

  if (!Array.isArray(papers) || papers.length === 0) {
    errors.push(`No papers found for examination track: ${track}`)
    return { isValid: false, errors, warnings, paperCount, chapterCount, topicCount, subtopicCount }
  }

  for (let pIdx = 0; pIdx < papers.length; pIdx++) {
    const p = papers[pIdx] as Partial<ExamPaper>
    paperCount++

    if (!p.title || typeof p.title !== 'string') {
      errors.push(`Paper [index ${pIdx}]: Missing title`)
    }
    if (typeof p.paperNumber !== 'number') {
      warnings.push(`Paper "${p.title || pIdx}": Missing official paper number`)
    }

    if (!Array.isArray(p.chapters) || p.chapters.length === 0) {
      warnings.push(`Paper "${p.title || pIdx}": Contains zero chapters`)
      continue
    }

    for (let cIdx = 0; cIdx < p.chapters.length; cIdx++) {
      const c = p.chapters[cIdx] as Partial<CurriculumChapter>
      chapterCount++

      if (!c.title || typeof c.title !== 'string') {
        errors.push(`Paper "${p.title}" > Chapter [index ${cIdx}]: Missing title`)
      }

      if (Array.isArray(c.topics)) {
        for (const t of c.topics) {
          topicCount++
          if (Array.isArray(t.subtopics)) {
            subtopicCount += t.subtopics.length
          }
        }
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    paperCount,
    chapterCount,
    topicCount,
    subtopicCount,
  }
}
