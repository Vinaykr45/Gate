export type Difficulty = 'easy' | 'medium' | 'hard'
export type TestType = 'topic' | 'subject' | 'full'

export interface Question {
  id: string
  question_text: string
  options: Record<string, string> // { A: '...', B: '...', C: '...', D: '...' }
  correct_answer: string // 'A' | 'B' | 'C' | 'D' | 'unknown'
  subject: string
  topic: string
  difficulty: Difficulty
  year?: number
  source_file?: string
  explanation?: string
  is_verified: boolean
  created_by?: string
  created_at: string
}

export interface Profile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  target_year: number
  created_at: string
  updated_at: string
}

export interface Test {
  id: string
  user_id: string
  title: string
  type: TestType
  subject?: string
  topic?: string
  duration: number
  question_count: number
  created_at: string
}

export interface TestQuestion {
  id: string
  test_id: string
  question_id: string
  order_num: number
  question?: Question
}

export interface Attempt {
  id: string
  user_id: string
  test_id: string
  score: number
  total_marks: number
  accuracy: number
  time_taken: number
  completed: boolean
  started_at: string
  completed_at?: string
  test?: Test
}

export interface Answer {
  id: string
  attempt_id: string
  question_id: string
  selected_option?: string
  is_correct: boolean
  time_spent: number
  marked_review: boolean
}

export interface Bookmark {
  id: string
  user_id: string
  question_id: string
  created_at: string
  question?: Question
}

export interface UploadJob {
  id: string
  user_id: string
  filename: string
  storage_path: string
  status: 'pending' | 'processing' | 'done' | 'error'
  questions_found: number
  error_message?: string
  created_at: string
  updated_at: string
}

// Gemini extraction result
export interface ExtractedQuestion {
  question_text: string
  options: Record<string, string>
  correct_answer: string
  subject: string
  topic: string
  difficulty: Difficulty
  year?: number
  explanation?: string
}

// Analytics
export interface SubjectStat {
  subject: string
  total: number
  correct: number
  accuracy: number
}

export interface TopicStat {
  topic: string
  subject: string
  total: number
  correct: number
  accuracy: number
}

export interface DailyTrend {
  date: string
  score: number
  tests: number
}

export interface AnalyticsData {
  totalAttempts: number
  avgScore: number
  avgAccuracy: number
  totalQuestions: number
  subjectStats: SubjectStat[]
  topicStats: TopicStat[]
  dailyTrend: DailyTrend[]
  weakTopics: TopicStat[]
  strongTopics: TopicStat[]
}

export interface AISuggestion {
  priority: 'high' | 'medium' | 'low'
  subject: string
  topic: string
  message: string
  action: string
  accuracy: number
}

// ── Learning Hub ──────────────────────────────────────────────

export interface LearningTopic {
  id: string
  subject: string
  topic: string
  subtopic: string
  description?: string
  order_num: number
  created_at: string
}

export interface LearningProgress {
  id: string
  user_id: string
  topic_id: string
  completed: boolean
  watched_videos: string[]
  read_notes: string[]
  updated_at: string
}

export interface Video {
  id: string
  topic_id: string
  title: string
  youtube_url: string
  duration_seconds: number
  order_num: number
  created_at: string
}

export interface Note {
  id: string
  topic_id: string
  title: string
  content?: string
  link?: string
  type: 'text' | 'link'
  order_num: number
  created_at: string
}

export interface UserNote {
  id: string
  user_id: string
  topic_id: string
  content: string
  created_at: string
  updated_at: string
}

export interface NoteBookmark {
  id: string
  user_id: string
  note_id: string
  created_at: string
}

export interface AISummary {
  easyExplanation: string
  keyPoints: string[]
  revisionNotes: string
}

// ── Test Results ──────────────────────────────────────────────

export interface TestResultQuestion {
  question: Question
  selectedOption?: string
  isCorrect: boolean
  timeSpent: number
  markedReview: boolean
}

export interface TestResult {
  attempt: Attempt
  test: Test
  questions: TestResultQuestion[]
}
