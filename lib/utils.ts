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
  'Operating Systems',
  'DBMS',
  'Data Structures & Algorithms',
  'Computer Networks',
  'Theory of Computation',
  'Mathematics',
  'General Aptitude',
] as const

export const TOPICS_BY_SUBJECT: Record<string, string[]> = {
  'Computer Science': [
    'Operating Systems',
    'DBMS',
    'Data Structures & Algorithms',
    'Computer Networks',
    'Theory of Computation',
    'Compiler Design',
    'Computer Organization',
  ],
  'Operating Systems': [
    'Process Management',
    'CPU Scheduling',
    'Deadlock',
    'Memory Management',
    'File Systems',
    'Paging & Segmentation',
    'Synchronization',
  ],
  'DBMS': [
    'Relational Model',
    'Normalization',
    'SQL',
    'Transactions & Concurrency',
    'Indexing & Hashing',
    'Query Processing',
    'ER Model',
  ],
  'Data Structures & Algorithms': [
    'Arrays & Strings',
    'Trees & Binary Trees',
    'Graphs',
    'Sorting & Searching',
    'Dynamic Programming',
    'Hashing',
    'Heaps & Priority Queues',
    'Recursion & Backtracking',
  ],
  'Computer Networks': [
    'OSI & TCP/IP Model',
    'Data Link Layer',
    'Network Layer & Routing',
    'Transport Layer',
    'Application Layer',
    'Congestion Control',
    'MAC Protocols',
  ],
  'Theory of Computation': [
    'Regular Languages & DFA',
    'Context-Free Languages & PDA',
    'Turing Machines',
    'Complexity Theory',
    'Decidability',
  ],
  'Mathematics': [
    'Linear Algebra',
    'Calculus',
    'Probability & Statistics',
    'Combinatorics',
    'Discrete Mathematics',
    'Graph Theory',
    'Set Theory',
  ],
  'General Aptitude': [
    'Verbal Ability',
    'Numerical Aptitude',
    'Logical Reasoning',
    'Data Interpretation',
    'Analytical Puzzles',
  ],
}
