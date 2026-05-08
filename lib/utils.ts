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
    return correct // simplified for now
  }
  return correct
}

// ─────────────────────────────────────────────────────────────
// GATE CSE Official Syllabus (2024-2025)
// Section 1: General Aptitude (GA) — 15 marks
// Section 2: Computer Science & IT — 85 marks
// ─────────────────────────────────────────────────────────────

export const GATE_SUBJECTS = [
  'Engineering Mathematics',
  'Digital Logic',
  'Computer Organization & Architecture',
  'Programming & Data Structures',
  'Algorithms',
  'Theory of Computation',
  'Compiler Design',
  'Operating Systems',
  'Databases',
  'Computer Networks',
  'General Aptitude',
] as const

// Alias kept for backward compatibility
export const SUBJECTS = GATE_SUBJECTS

export const TOPICS_BY_SUBJECT: Record<string, string[]> = {
  'Engineering Mathematics': [
    // Discrete Mathematics
    'Propositional & First-Order Logic',
    'Sets, Relations & Functions',
    'Partial Orders & Lattices',
    'Groups & Monoids',
    'Graph Theory – Connectivity & Matching',
    'Combinatorics – Counting & Recurrences',
    // Linear Algebra
    'Matrices & Determinants',
    'System of Linear Equations',
    'Eigenvalues & Eigenvectors',
    'LU Decomposition',
    // Calculus
    'Limits, Continuity & Differentiability',
    'Maxima & Minima',
    'Mean Value Theorem',
    'Integration',
    // Probability & Statistics
    'Random Variables & Distributions',
    'Mean, Median, Mode & Standard Deviation',
    'Conditional Probability & Bayes Theorem',
    'Binomial, Poisson & Normal Distributions',
  ],

  'Digital Logic': [
    'Boolean Algebra & Logic Gates',
    'Combinational Circuits – Minimization',
    'Multiplexers, Decoders & Encoders',
    'Sequential Circuits – Flip-Flops & Counters',
    'Number Representations (Binary, Hex, BCD)',
    'Fixed-Point & Floating-Point Arithmetic',
  ],

  'Computer Organization & Architecture': [
    'Machine Instructions & Addressing Modes',
    'ALU Design & Data-Path',
    'Control Unit – Hardwired & Microprogrammed',
    'Instruction Pipelining',
    'Pipeline Hazards (Structural, Data, Control)',
    'Cache Memory – Mapping & Replacement',
    'Main Memory & Virtual Memory',
    'Secondary Storage',
    'I/O Interface – Interrupt & DMA',
  ],

  'Programming & Data Structures': [
    'Programming in C – Basics & Pointers',
    'Recursion',
    'Arrays & Strings',
    'Stacks & Queues',
    'Linked Lists',
    'Trees & Binary Trees',
    'Binary Search Trees (BST)',
    'Binary Heaps',
    'Graphs – Representation & Traversal',
  ],

  'Algorithms': [
    'Asymptotic Complexity – Time & Space',
    'Searching & Sorting',
    'Hashing',
    'Divide & Conquer',
    'Greedy Algorithms',
    'Dynamic Programming',
    'Graph Algorithms – BFS & DFS',
    'Minimum Spanning Tree (Prim, Kruskal)',
    'Shortest Paths (Dijkstra, Bellman-Ford)',
    'NP-Completeness',
  ],

  'Theory of Computation': [
    'Regular Expressions & Finite Automata (DFA/NFA)',
    'Regular Languages & Pumping Lemma',
    'Context-Free Grammars & Pushdown Automata',
    'Context-Free Languages & Pumping Lemma',
    'Turing Machines',
    'Decidability & Undecidability',
    'Complexity Classes – P, NP',
  ],

  'Compiler Design': [
    'Lexical Analysis & Tokenization',
    'Parsing – LL & LR Grammars',
    'Syntax-Directed Translation',
    'Runtime Environments',
    'Intermediate Code Generation',
    'Local Code Optimization',
  ],

  'Operating Systems': [
    'Processes & Threads',
    'Inter-Process Communication',
    'Concurrency & Synchronization',
    'Deadlock – Detection, Prevention & Avoidance',
    'CPU Scheduling Algorithms',
    'Memory Management & Paging',
    'Virtual Memory & Page Replacement',
    'File Systems & I/O Management',
  ],

  'Databases': [
    'ER Model',
    'Relational Model & Relational Algebra',
    'Tuple Relational Calculus',
    'SQL – Queries, Joins & Subqueries',
    'Integrity Constraints',
    'Normal Forms – 1NF to BCNF',
    'File Organization & Indexing (B/B+ Trees)',
    'Transactions & ACID Properties',
    'Concurrency Control – 2PL & Locking',
  ],

  'Computer Networks': [
    'OSI & TCP/IP Reference Models',
    'Data Link Layer – Framing & Error Detection',
    'MAC Protocols (ALOHA, CSMA)',
    'Network Layer – IPv4 & CIDR',
    'Routing Algorithms (Distance Vector, Link State)',
    'Transport Layer – UDP & TCP',
    'TCP Congestion Control',
    'Application Layer – DNS, HTTP, SMTP, FTP',
  ],

  'General Aptitude': [
    // Verbal
    'English Grammar & Vocabulary',
    'Reading Comprehension',
    'Sentence Completion & Correction',
    // Quantitative
    'Number System & Arithmetic',
    'Percentages, Profit & Loss',
    'Ratio, Proportion & Mixtures',
    'Time, Speed & Distance',
    'Work & Time',
    'Permutations & Combinations',
    'Probability Basics',
    'Data Interpretation – Graphs & Tables',
    // Analytical
    'Logical Deduction & Induction',
    'Analogies & Classification',
    'Numerical Reasoning',
    // Spatial
    'Pattern Recognition & Spatial Reasoning',
  ],
}
