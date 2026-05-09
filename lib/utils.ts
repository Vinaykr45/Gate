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
// Section 1: General Aptitude (GA)
// Section 2: Computer Science & IT
// ─────────────────────────────────────────────────────────────

export const GATE_SUBJECTS = [
  'Engineering Mathematics',
  'Digital Logic',
  'Computer Organization and Architecture',
  'Programming and Data Structures',
  'Algorithms',
  'Theory of Computation',
  'Compiler Design',
  'Operating System',
  'Databases',
  'Computer Networks',
  'General Aptitude',
] as const

// Alias kept for backward compatibility
export const SUBJECTS = GATE_SUBJECTS

export const TOPICS_BY_SUBJECT: Record<string, string[]> = {
  'Engineering Mathematics': [
    // Discrete Mathematics
    'Propositional and first order logic',
    'Sets, relations, functions, partial orders and lattices',
    'Monoids and Groups',
    'Graphs: connectivity, matching, colouring',
    'Combinatorics: counting, recurrence relations, generating functions',
    // Linear Algebra
    'Matrices',
    'Determinants',
    'System of linear equations',
    'Eigenvalues and eigenvectors',
    'LU decomposition',
    // Calculus
    'Limits',
    'Continuity and differentiability',
    'Maxima and minima',
    'Mean value theorem',
    'Integration',
    // Probability and Statistics
    'Random variables',
    'Uniform distribution',
    'Normal distribution',
    'Exponential distribution',
    'Poisson distribution',
    'Binomial distribution',
    'Mean, median, mode',
    'Standard deviation',
    'Conditional probability',
    'Bayes theorem',
  ],

  'Digital Logic': [
    'Boolean algebra',
    'Combinational circuits',
    'Sequential circuits',
    'Minimization',
    'Number representations',
    'Computer arithmetic (fixed and floating point)',
  ],

  'Computer Organization and Architecture': [
    'Machine instructions and addressing modes',
    'ALU, datapath and control unit',
    'Instruction pipelining',
    'Pipeline hazards',
    'Memory hierarchy',
    'Cache memory',
    'Main memory and secondary storage',
    'I/O interface',
    'Interrupt and DMA mode',
  ],

  'Programming and Data Structures': [
    'Programming in C',
    'Recursion',
    'Arrays',
    'Stacks',
    'Queues',
    'Linked lists',
    'Trees',
    'Binary search trees',
    'Binary heaps',
    'Graphs',
  ],

  'Algorithms': [
    'Searching',
    'Sorting',
    'Hashing',
    'Asymptotic worst case time and space complexity',
    'Greedy algorithms',
    'Dynamic programming',
    'Divide and conquer',
    'Graph traversals',
    'Minimum spanning trees',
    'Shortest paths',
  ],

  'Theory of Computation': [
    'Regular expressions',
    'Finite automata',
    'Context-free grammars',
    'Push-down automata',
    'Regular and context-free languages',
    'Pumping lemma',
    'Turing machines',
    'Undecidability',
  ],

  'Compiler Design': [
    'Lexical analysis',
    'Parsing',
    'Syntax-directed translation',
    'Runtime environments',
    'Intermediate code generation',
    'Local optimization',
    'Data flow analysis',
    'Constant propagation',
    'Liveness analysis',
    'Common subexpression elimination',
  ],

  'Operating System': [
    'System calls',
    'Processes',
    'Threads',
    'Inter-process communication',
    'Concurrency and synchronization',
    'Deadlock',
    'CPU scheduling',
    'I/O scheduling',
    'Memory management and virtual memory',
    'File systems',
  ],

  'Databases': [
    'ER model',
    'Relational model',
    'Relational algebra',
    'Tuple calculus',
    'SQL',
    'Integrity constraints',
    'Normal forms',
    'File organization',
    'Indexing (B and B+ trees)',
    'Transactions',
    'Concurrency control',
  ],

  'Computer Networks': [
    'OSI and TCP/IP protocol stacks',
    'Packet, circuit and virtual circuit switching',
    'Data link layer',
    'Framing',
    'Error detection',
    'Medium access control',
    'Ethernet bridging',
    'Routing protocols',
    'Shortest path routing',
    'Flooding',
    'Distance vector and link state routing',
    'Fragmentation and IP addressing',
    'IPv4',
    'CIDR notation',
    'ARP, DHCP, ICMP',
    'Network Address Translation (NAT)',
    'Transport layer',
    'Flow control and congestion control',
    'UDP',
    'TCP',
    'Sockets',
    'Application layer protocols',
    'DNS',
    'SMTP',
    'HTTP',
    'FTP',
    'Email',
  ],

  'General Aptitude': [
    // Verbal Aptitude
    'Basic English grammar: tenses, articles, adjectives, prepositions, conjunctions, verb-noun agreement, and other parts of speech',
    'Basic vocabulary: words, idioms, and phrases in context',
    'Reading and comprehension',
    'Narrative sequencing',
    // Quantitative Aptitude
    'Data interpretation: bar graphs, pie charts, other graphs, maps, and tables',
    '2-dimensional and 3-dimensional plots',
    'Numerical computation and estimation',
    'Ratios',
    'Percentages',
    'Powers, exponents, and logarithms',
    'Permutations and combinations',
    'Series',
    'Mensuration and geometry',
    'Elementary statistics and probability',
    // Analytical Aptitude
    'Logic: deduction and induction',
    'Analogy',
    'Numerical relations and reasoning',
    // Spatial Aptitude
    'Transformation of shapes',
    'Translation',
    'Rotation',
    'Scaling',
    'Mirroring',
    'Assembling and grouping',
    'Paper folding and cutting',
    'Patterns in 2D and 3D',
  ],
}
