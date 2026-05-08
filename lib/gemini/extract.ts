import { geminiModel } from './client'
import type { ExtractedQuestion } from '@/lib/types'

// ============================================================
// GATE CSE OFFICIAL SUBJECT CLASSIFICATION
// Maps keywords → official GATE CSE subject names
// These MUST match the subject names used in learning hub (utils.ts)
// ============================================================
const SUBJECT_KEYWORD_MAP: Array<{ subject: string; keywords: string[] }> = [
  {
    subject: 'Engineering Mathematics',
    keywords: [
      'matrix', 'eigenvalue', 'linear algebra', 'vector', 'determinant', 'lu decomposition',
      'calculus', 'derivative', 'integral', 'limit', 'differential equation', 'mean value',
      'probability', 'bayes', 'distribution', 'expectation', 'variance', 'binomial', 'poisson',
      'combinatorics', 'permutation', 'combination', 'counting', 'recurrence',
      'discrete math', 'propositional logic', 'predicate logic', 'set theory', 'lattice',
      'graph theory', 'connectivity', 'matching', 'coloring', 'group', 'monoid',
      'number theory', 'modular', 'gcd', 'lcm', 'generating function',
    ],
  },
  {
    subject: 'Digital Logic',
    keywords: [
      'boolean algebra', 'logic gate', 'truth table', 'karnaugh', 'k-map', 'minimization',
      'combinational circuit', 'multiplexer', 'mux', 'demux', 'decoder', 'encoder',
      'sequential circuit', 'flip-flop', 'latch', 'counter', 'register',
      'number representation', 'binary', 'hexadecimal', 'bcd', '2s complement',
      'floating point', 'fixed point', 'ieee 754',
    ],
  },
  {
    subject: 'Computer Organization & Architecture',
    keywords: [
      'machine instruction', 'addressing mode', 'alu', 'data-path', 'control unit',
      'microprogrammed', 'hardwired', 'pipeline', 'pipeline hazard', 'data hazard',
      'structural hazard', 'control hazard', 'cache memory', 'cache hit', 'cache miss',
      'cache mapping', 'virtual memory', 'tlb', 'page table', 'secondary storage',
      'dma', 'interrupt', 'i/o interface', 'memory hierarchy', 'computer organization',
      'computer architecture', 'risc', 'cisc',
    ],
  },
  {
    subject: 'Programming & Data Structures',
    keywords: [
      'c language', 'c programming', 'pointer', 'recursion', 'function call',
      'array', 'string', 'stack', 'queue', 'linked list', 'singly linked', 'doubly linked',
      'binary tree', 'binary search tree', 'bst', 'avl tree', 'red-black',
      'binary heap', 'priority queue', 'data structure',
    ],
  },
  {
    subject: 'Algorithms',
    keywords: [
      'time complexity', 'space complexity', 'asymptotic', 'big o', 'omega', 'theta',
      'searching', 'binary search', 'sorting', 'quicksort', 'merge sort', 'heap sort',
      'hashing', 'hash table', 'hash function', 'collision',
      'divide and conquer', 'greedy', 'dynamic programming', 'memoization', 'dp ',
      'bfs', 'dfs', 'graph traversal', 'minimum spanning tree', 'prim', 'kruskal',
      'shortest path', 'dijkstra', 'bellman-ford', 'floyd warshall',
      'np complete', 'np hard', 'reduction',
    ],
  },
  {
    subject: 'Theory of Computation',
    keywords: [
      'automata', 'finite automaton', 'dfa', 'nfa', 'regular expression', 'regular language',
      'pumping lemma', 'context free grammar', 'cfg', 'pushdown automaton', 'pda',
      'context free language', 'turing machine', 'decidability', 'undecidability',
      'halting problem', 'complexity class', 'np', 'polynomial', 'toc',
    ],
  },
  {
    subject: 'Compiler Design',
    keywords: [
      'lexical analysis', 'tokenization', 'lexer', 'scanner', 'token',
      'll parsing', 'lr parsing', 'slr', 'clr', 'lalr', 'parser', 'parsing',
      'syntax directed', 'translation scheme', 'runtime environment',
      'intermediate code', 'three address code', 'code generation', 'code optimization',
      'compiler', 'grammar', 'first set', 'follow set',
    ],
  },
  {
    subject: 'Operating Systems',
    keywords: [
      'process', 'thread', 'inter-process communication', 'ipc', 'semaphore', 'mutex',
      'concurrency', 'synchronization', 'critical section', 'monitor',
      'deadlock', 'banker', 'resource allocation', 'prevention', 'avoidance', 'detection',
      'cpu scheduling', 'round robin', 'fcfs', 'sjf', 'priority scheduling', 'preemptive',
      'memory management', 'paging', 'segmentation', 'page fault', 'page replacement',
      'lru', 'fifo', 'optimal replacement', 'thrashing',
      'file system', 'inode', 'directory', 'disk scheduling', 'operating system',
    ],
  },
  {
    subject: 'Databases',
    keywords: [
      'er model', 'entity relationship', 'relational model', 'relational algebra',
      'tuple calculus', 'sql', 'join', 'select', 'query', 'subquery',
      'normalization', 'normal form', '1nf', '2nf', '3nf', 'bcnf',
      'functional dependency', 'attribute closure', 'candidate key',
      'b-tree', 'b+ tree', 'indexing', 'file organization',
      'transaction', 'acid', 'rollback', 'commit', 'serializability',
      'concurrency control', '2pl', 'two phase locking', 'database',
    ],
  },
  {
    subject: 'Computer Networks',
    keywords: [
      'osi model', 'tcp/ip', 'tcp', 'udp', 'ip address', 'ipv4', 'ipv6', 'cidr', 'subnet',
      'routing', 'distance vector', 'link state', 'ospf', 'rip', 'bgp',
      'data link layer', 'framing', 'error detection', 'crc', 'checksum', 'parity',
      'mac protocol', 'aloha', 'csma', 'cdma', 'ethernet',
      'congestion control', 'flow control', 'sliding window', 'go-back-n', 'selective repeat',
      'application layer', 'dns', 'http', 'ftp', 'smtp', 'email', 'network',
    ],
  },
  {
    subject: 'General Aptitude',
    keywords: [
      'speed distance time', 'train problem', 'boat upstream', 'percentage', 'profit loss',
      'ratio proportion', 'mixture alligation', 'work time', 'pipes cistern',
      'verbal ability', 'reading comprehension', 'english grammar', 'vocabulary',
      'logical reasoning', 'puzzle', 'series', 'analogy', 'aptitude',
      'data interpretation', 'pie chart', 'bar graph',
    ],
  },
]

// Topic classification matching GATE CSE sub-topics
const TOPIC_CLASSIFIERS: Array<{ keywords: string[]; topic: string }> = [
  // Engineering Mathematics
  { keywords: ['eigenvalue', 'matrix', 'determinant', 'lu decomposition', 'linear equation'], topic: 'Matrices & Determinants' },
  { keywords: ['calculus', 'derivative', 'integral', 'limit', 'continuity', 'differentiability'], topic: 'Limits, Continuity & Differentiability' },
  { keywords: ['probability', 'bayes', 'conditional probability'], topic: 'Conditional Probability & Bayes Theorem' },
  { keywords: ['binomial distribution', 'poisson', 'normal distribution'], topic: 'Binomial, Poisson & Normal Distributions' },
  { keywords: ['permutation', 'combination', 'counting', 'ways', 'recurrence'], topic: 'Combinatorics – Counting & Recurrences' },
  { keywords: ['propositional logic', 'predicate logic', 'first order logic', 'tautology'], topic: 'Propositional & First-Order Logic' },
  { keywords: ['graph theory', 'graph coloring', 'connectivity', 'matching'], topic: 'Graph Theory – Connectivity & Matching' },
  // Digital Logic
  { keywords: ['boolean algebra', 'logic gate', 'k-map', 'minimization', 'sop', 'pos'], topic: 'Boolean Algebra & Logic Gates' },
  { keywords: ['flip-flop', 'counter', 'register', 'sequential circuit', 'latch'], topic: 'Sequential Circuits – Flip-Flops & Counters' },
  { keywords: ['multiplexer', 'mux', 'decoder', 'encoder', 'combinational'], topic: 'Combinational Circuits – Minimization' },
  { keywords: ['floating point', 'ieee', 'fixed point', '2s complement', 'number representation'], topic: 'Fixed-Point & Floating-Point Arithmetic' },
  // COA
  { keywords: ['pipeline', 'hazard', 'data hazard', 'control hazard', 'stall'], topic: 'Instruction Pipelining' },
  { keywords: ['cache', 'cache hit', 'cache miss', 'cache mapping', 'replacement policy'], topic: 'Cache Memory – Mapping & Replacement' },
  { keywords: ['addressing mode', 'machine instruction', 'alu', 'data-path'], topic: 'Machine Instructions & Addressing Modes' },
  { keywords: ['dma', 'interrupt', 'i/o interface', 'io interface'], topic: 'I/O Interface – Interrupt & DMA' },
  // Programming & DS
  { keywords: ['pointer', 'c language', 'c programming', 'recursion', 'function'], topic: 'Programming in C – Basics & Pointers' },
  { keywords: ['linked list', 'singly linked', 'doubly linked'], topic: 'Linked Lists' },
  { keywords: ['stack', 'queue', 'deque', 'circular queue'], topic: 'Stacks & Queues' },
  { keywords: ['binary tree', 'bst', 'avl', 'binary search tree', 'inorder', 'preorder'], topic: 'Trees & Binary Trees' },
  { keywords: ['heap', 'priority queue', 'heapify'], topic: 'Binary Heaps' },
  // Algorithms
  { keywords: ['sorting', 'quicksort', 'merge sort', 'heap sort', 'bubble sort', 'insertion sort'], topic: 'Searching & Sorting' },
  { keywords: ['dynamic programming', 'dp ', 'memoization', 'optimal substructure'], topic: 'Dynamic Programming' },
  { keywords: ['greedy'], topic: 'Greedy Algorithms' },
  { keywords: ['divide and conquer'], topic: 'Divide & Conquer' },
  { keywords: ['dijkstra', 'bellman-ford', 'shortest path', 'floyd warshall'], topic: 'Shortest Paths (Dijkstra, Bellman-Ford)' },
  { keywords: ['minimum spanning tree', 'prim', 'kruskal', 'mst'], topic: 'Minimum Spanning Tree (Prim, Kruskal)' },
  { keywords: ['bfs', 'dfs', 'graph traversal', 'breadth first', 'depth first'], topic: 'Graph Algorithms – BFS & DFS' },
  { keywords: ['hashing', 'hash table', 'hash function', 'collision'], topic: 'Hashing' },
  { keywords: ['np complete', 'np hard', 'np-complete', 'polynomial time', 'reduction'], topic: 'NP-Completeness' },
  { keywords: ['big o', 'time complexity', 'space complexity', 'asymptotic', 'omega', 'theta'], topic: 'Asymptotic Complexity – Time & Space' },
  // TOC
  { keywords: ['dfa', 'nfa', 'finite automaton', 'finite automata', 'regular expression'], topic: 'Regular Expressions & Finite Automata (DFA/NFA)' },
  { keywords: ['context free grammar', 'cfg', 'pushdown automaton', 'pda'], topic: 'Context-Free Grammars & Pushdown Automata' },
  { keywords: ['pumping lemma'], topic: 'Regular Languages & Pumping Lemma' },
  { keywords: ['turing machine', 'decidability', 'undecidability', 'halting'], topic: 'Turing Machines' },
  // Compiler
  { keywords: ['lexical', 'tokenization', 'lexer', 'scanner', 'token'], topic: 'Lexical Analysis & Tokenization' },
  { keywords: ['ll', 'lr', 'slr', 'clr', 'lalr', 'parser', 'parsing', 'first set', 'follow set'], topic: 'Parsing – LL & LR Grammars' },
  { keywords: ['syntax directed', 'translation scheme'], topic: 'Syntax-Directed Translation' },
  { keywords: ['intermediate code', 'three address', 'code generation'], topic: 'Intermediate Code Generation' },
  { keywords: ['code optimization', 'optimization'], topic: 'Local Code Optimization' },
  // OS
  { keywords: ['scheduling', 'round robin', 'fcfs', 'sjf', 'preemptive'], topic: 'CPU Scheduling Algorithms' },
  { keywords: ['deadlock', 'banker', 'resource allocation', 'prevention'], topic: 'Deadlock – Detection, Prevention & Avoidance' },
  { keywords: ['semaphore', 'mutex', 'monitor', 'critical section', 'synchronization'], topic: 'Concurrency & Synchronization' },
  { keywords: ['page replacement', 'lru', 'fifo', 'optimal', 'thrashing', 'page fault'], topic: 'Virtual Memory & Page Replacement' },
  { keywords: ['paging', 'segmentation', 'memory management'], topic: 'Memory Management & Paging' },
  { keywords: ['file system', 'inode', 'directory', 'disk scheduling'], topic: 'File Systems & I/O Management' },
  { keywords: ['process', 'thread', 'ipc', 'inter-process'], topic: 'Processes & Threads' },
  // DBMS
  { keywords: ['normalization', 'normal form', '1nf', '2nf', '3nf', 'bcnf', 'functional dependency'], topic: 'Normal Forms – 1NF to BCNF' },
  { keywords: ['sql', 'join', 'select query', 'subquery'], topic: 'SQL – Queries, Joins & Subqueries' },
  { keywords: ['transaction', 'acid', 'rollback', 'commit', 'serializability'], topic: 'Transactions & ACID Properties' },
  { keywords: ['b-tree', 'b+ tree', 'indexing', 'index'], topic: 'File Organization & Indexing (B/B+ Trees)' },
  { keywords: ['concurrency control', '2pl', 'two phase locking', 'locking'], topic: 'Concurrency Control – 2PL & Locking' },
  { keywords: ['relational algebra', 'relational model', 'tuple calculus'], topic: 'Relational Model & Relational Algebra' },
  { keywords: ['er model', 'entity relationship', 'er diagram'], topic: 'ER Model' },
  // Networks
  { keywords: ['osi model', 'osi layer', 'tcp/ip model'], topic: 'OSI & TCP/IP Reference Models' },
  { keywords: ['aloha', 'csma', 'cdma', 'mac protocol', 'ethernet'], topic: 'MAC Protocols (ALOHA, CSMA)' },
  { keywords: ['routing', 'distance vector', 'link state', 'ospf', 'rip'], topic: 'Routing Algorithms (Distance Vector, Link State)' },
  { keywords: ['tcp', 'udp', 'transport layer', 'congestion control', 'flow control', 'sliding window'], topic: 'Transport Layer – UDP & TCP' },
  { keywords: ['dns', 'http', 'ftp', 'smtp', 'email', 'application layer'], topic: 'Application Layer – DNS, HTTP, SMTP, FTP' },
  { keywords: ['ipv4', 'cidr', 'subnet', 'ip address', 'network layer'], topic: 'Network Layer – IPv4 & CIDR' },
  { keywords: ['error detection', 'crc', 'checksum', 'framing', 'data link'], topic: 'Data Link Layer – Framing & Error Detection' },
  // Aptitude
  { keywords: ['speed', 'distance', 'time', 'train', 'boat', 'upstream'], topic: 'Time, Speed & Distance' },
  { keywords: ['profit', 'loss', 'interest', 'percentage'], topic: 'Percentages, Profit & Loss' },
  { keywords: ['work', 'efficiency', 'pipe', 'cistern'], topic: 'Work & Time' },
  { keywords: ['ratio', 'proportion', 'mixture'], topic: 'Ratio, Proportion & Mixtures' },
  { keywords: ['reading comprehension', 'grammar', 'vocabulary', 'sentence'], topic: 'English Grammar & Vocabulary' },
  { keywords: ['logical', 'reasoning', 'analogy', 'deduction'], topic: 'Logical Deduction & Induction' },
]

function classifySubject(text: string): string {
  const lower = text.toLowerCase()
  for (const { subject, keywords } of SUBJECT_KEYWORD_MAP) {
    if (keywords.some((kw) => lower.includes(kw))) return subject
  }
  return 'Programming & Data Structures' // default for CS questions
}

function classifyTopic(text: string, subject: string): string {
  const lower = text.toLowerCase()
  for (const { keywords, topic } of TOPIC_CLASSIFIERS) {
    if (keywords.some((kw) => lower.includes(kw))) return topic
  }
  return `${subject} – General`
}

// ============================================================
// MAIN EXTRACTION PROMPT
// ============================================================
const EXTRACTION_SYSTEM_PROMPT = `You are a GATE CSE exam question extractor.

Your task: Extract ALL multiple-choice questions from the provided content and return them as a JSON array.

STRICT RULES (violation = invalid output):
1. NEVER hallucinate or invent information not present in the source
2. If correct_answer is not visible/readable → set "correct_answer": "unknown"
3. Each option must be EXACTLY as written in the source (do not paraphrase)
4. question_text must be EXACTLY as written (preserve mathematical notation)
5. Return ONLY the JSON array — no explanations, no markdown, no extra text
6. If no questions found → return empty array: []

DIFFICULTY CLASSIFICATION:
- "easy": Direct formula application, single-step, recall-based
- "medium": Requires concept understanding + 2-3 step reasoning
- "hard": Multi-step, tricky edge cases, counter-intuitive answers

SUBJECT CLASSIFICATION — use EXACTLY these subject names:
- "Engineering Mathematics"  → Discrete Math, Linear Algebra, Calculus, Probability, Combinatorics
- "Digital Logic"            → Boolean algebra, K-map, Flip-flops, Number systems
- "Computer Organization & Architecture" → Pipelining, Cache, ALU, Addressing modes
- "Programming & Data Structures" → C programming, Recursion, Arrays, Trees, Linked Lists, Heaps
- "Algorithms"               → Complexity, Sorting, Greedy, DP, Graph algorithms, NP
- "Theory of Computation"    → DFA/NFA, Regular languages, CFG, PDA, Turing machines
- "Compiler Design"          → Lexical analysis, Parsing, Code generation, Syntax-directed
- "Operating Systems"        → Scheduling, Deadlock, Memory management, File systems
- "Databases"                → SQL, Normalization, ER model, B-trees, Transactions
- "Computer Networks"        → OSI/TCP-IP, Routing, TCP/UDP, MAC protocols, DNS/HTTP
- "General Aptitude"         → Verbal, Numerical, Logical, Analytical reasoning

OUTPUT FORMAT (strict JSON array):
[
  {
    "question_text": "exact question text here",
    "options": {
      "A": "first option text",
      "B": "second option text",
      "C": "third option text",
      "D": "fourth option text"
    },
    "correct_answer": "A",
    "subject": "Operating Systems",
    "topic": "CPU Scheduling Algorithms",
    "difficulty": "medium",
    "year": 2021,
    "explanation": "brief explanation if answer is visible, else null"
  }
]

IMPORTANT: Only include options that actually exist. If a question has only 4 options labeled (i), (ii), (iii), (iv) — map them to A, B, C, D.
`


// ============================================================
// EXTRACTION FUNCTIONS
// ============================================================

export async function extractQuestionsFromText(text: string, sourceFile: string): Promise<ExtractedQuestion[]> {
  if (!text || text.trim().length < 20) return []

  const prompt = `${EXTRACTION_SYSTEM_PROMPT}

SOURCE CONTENT:
"""
${text.substring(0, 30000)} 
"""

Extract all GATE exam questions from the above content. Return JSON array only.`

  try {
    const result = await geminiModel.generateContent(prompt)
    const responseText = result.response.text()
    return parseGeminiResponse(responseText)
  } catch (error) {
    console.error('Gemini extraction error:', error)
    return []
  }
}

export async function extractQuestionsFromImage(imageBase64: string, mimeType: string, sourceFile: string): Promise<ExtractedQuestion[]> {
  const prompt = `${EXTRACTION_SYSTEM_PROMPT}

Extract all GATE exam questions from the image above. Return JSON array only.`

  try {
    const result = await geminiModel.generateContent([
      {
        inlineData: {
          mimeType: mimeType as 'image/png' | 'image/jpeg' | 'image/webp',
          data: imageBase64,
        },
      },
      prompt,
    ])
    const responseText = result.response.text()
    return parseGeminiResponse(responseText)
  } catch (error) {
    console.error('Gemini image extraction error:', error)
    return []
  }
}

function parseGeminiResponse(responseText: string): ExtractedQuestion[] {
  try {
    // Clean up the response
    let cleaned = responseText.trim()

    // Remove markdown code blocks if present
    cleaned = cleaned.replace(/```json\n?/gi, '').replace(/```\n?/g, '')

    // Find JSON array bounds
    const startIdx = cleaned.indexOf('[')
    const endIdx = cleaned.lastIndexOf(']')
    if (startIdx === -1 || endIdx === -1) return []

    const jsonStr = cleaned.substring(startIdx, endIdx + 1)
    const parsed = JSON.parse(jsonStr)

    if (!Array.isArray(parsed)) return []

    // Validate and clean each question
    return parsed
      .filter((q: Record<string, unknown>) => q.question_text && typeof q.question_text === 'string' && q.question_text.trim().length > 10)
      .map((q: Record<string, unknown>) => ({
        question_text: String(q.question_text || '').trim(),
        options: sanitizeOptions(q.options as Record<string, string>),
        correct_answer: sanitizeAnswer(q.correct_answer as string),
        subject: String(q.subject || classifySubject(String(q.question_text || ''))),
        topic: String(q.topic || classifyTopic(String(q.question_text || ''), String(q.subject || 'Computer Science'))),
        difficulty: sanitizeDifficulty(q.difficulty as string),
        year: q.year ? Number(q.year) : undefined,
        explanation: q.explanation ? String(q.explanation) : undefined,
      }))
  } catch (error) {
    console.error('Failed to parse Gemini response:', error)
    return []
  }
}

function sanitizeOptions(options: unknown): Record<string, string> {
  if (!options || typeof options !== 'object') return {}
  const result: Record<string, string> = {}
  const validKeys = ['A', 'B', 'C', 'D']
  for (const key of validKeys) {
    const val = (options as Record<string, unknown>)[key]
    if (val !== undefined && val !== null) {
      result[key] = String(val).trim()
    }
  }
  return result
}

function sanitizeAnswer(answer: unknown): string {
  if (!answer) return 'unknown'
  const str = String(answer).trim().toUpperCase()
  if (['A', 'B', 'C', 'D'].includes(str)) return str
  return 'unknown'
}

function sanitizeDifficulty(difficulty: unknown): 'easy' | 'medium' | 'hard' {
  const valid = ['easy', 'medium', 'hard']
  const str = String(difficulty || 'medium').toLowerCase()
  return valid.includes(str) ? (str as 'easy' | 'medium' | 'hard') : 'medium'
}
