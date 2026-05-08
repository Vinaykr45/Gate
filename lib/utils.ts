import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTime(seconds: number): string {
  const hrs = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  if (hrs > 0) return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case 'easy': return 'text-emerald-400'
    case 'medium': return 'text-amber-400'
    case 'hard': return 'text-red-400'
    default: return 'text-slate-400'
  }
}

export function getDifficultyBg(difficulty: string): string {
  switch (difficulty) {
    case 'easy': return 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20'
    case 'medium': return 'bg-amber-400/10 text-amber-400 border-amber-400/20'
    case 'hard': return 'bg-red-400/10 text-red-400 border-red-400/20'
    default: return 'bg-slate-400/10 text-slate-400 border-slate-400/20'
  }
}

export function getAccuracyColor(accuracy: number): string {
  if (accuracy >= 70) return 'text-emerald-400'
  if (accuracy >= 50) return 'text-amber-400'
  return 'text-red-400'
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

export function calculateScore(correct: number, total: number, negativeMarking = false): number {
  if (negativeMarking) {
    // GATE marking: +1 for correct, -0.33 for wrong
    return correct // simplified for now
  }
  return correct
}

export const SUBJECTS = [
  'Computer Science',
  'Mathematics',
  'General Aptitude',
  'Electronics',
  'Electrical',
  'Mechanical',
  'Civil',
  'Chemical',
] as const

export const TOPICS_BY_SUBJECT: Record<string, string[]> = {
  'Computer Science': [
    'Operating Systems - CPU Scheduling',
    'Operating Systems - Memory Management',
    'Operating Systems - Paging',
    'Operating Systems - Deadlock',
    'Operating Systems - File Systems',
    'DBMS - Normalization',
    'DBMS - SQL',
    'DBMS - Transactions',
    'DBMS - Indexing',
    'DSA - Arrays',
    'DSA - Trees',
    'DSA - Graphs',
    'DSA - Sorting',
    'DSA - Dynamic Programming',
    'DSA - Heaps',
    'Computer Networks - OSI Model',
    'Computer Networks - TCP/IP',
    'Computer Networks - MAC Protocols',
    'Theory of Computation - Regular Languages',
    'Theory of Computation - Context Free',
    'Theory of Computation - Turing Machines',
    'Computer Organization',
    'Compiler Design',
    'Programming in C',
  ],
  Mathematics: [
    'Linear Algebra',
    'Calculus',
    'Probability',
    'Statistics',
    'Combinatorics',
    'Discrete Mathematics',
    'Graph Theory',
  ],
  'General Aptitude': [
    'Verbal Reasoning',
    'Numerical Reasoning',
    'Algebra',
    'Time Speed Distance',
    'Percentages',
    'Set Theory',
    'Probability',
  ],
}
