/**
 * lib/curriculum/types.ts
 *
 * Types for Multi-Exam Curriculum, Papers, Chapters, and Syllabus Versioning.
 */

export type ExamTrackType = 'gate_cse' | 'ca_foundation' | 'ca_intermediate' | 'ca_final'

export interface SyllabusVersionMeta {
  versionId: string
  examTrack: ExamTrackType
  title: string
  effectiveFrom: string
  applicableSessions: string[]
  officialSourceUrl: string
  publicationDate?: string
  lastVerifiedDate: string
  isApproved: boolean
  description: string
}

export interface CurriculumSubtopic {
  id: string
  title: string
  orderNum: number
  description?: string
}

export interface CurriculumTopic {
  id: string
  title: string
  orderNum: number
  subtopics: CurriculumSubtopic[]
  description?: string
}

export interface CurriculumChapter {
  id: string
  chapterNumber: number
  title: string
  weightageEstimated?: string
  topics: CurriculumTopic[]
  learningObjectives?: string[]
}

export interface ExamPaper {
  id: string
  paperNumber: number
  title: string
  code: string
  marks: number
  durationMinutes: number
  group?: 'Group I' | 'Group II'
  section?: string
  isObjectiveOnly?: boolean
  hasNegativeMarking?: boolean
  negativeMarkRate?: number // e.g. 0.25
  officialSourceUrl?: string
  chapters: CurriculumChapter[]
}

export interface ExamTrackCurriculum {
  track: ExamTrackType
  trackName: string
  badge: string
  activeSyllabusVersion: string
  versions: SyllabusVersionMeta[]
  papers: ExamPaper[]
}
