import { geminiModel } from './client'
import type { ExtractedQuestion } from '@/lib/types'

// ============================================================
// SUBJECT + TOPIC CLASSIFICATION MAP
// ============================================================
const SUBJECT_TOPIC_MAP: Record<string, string[]> = {
  'Computer Science': [
    'operating system', 'os', 'process', 'thread', 'scheduling', 'paging', 'segmentation',
    'deadlock', 'semaphore', 'mutex', 'memory management', 'virtual memory', 'file system',
    'database', 'dbms', 'sql', 'normalization', 'transaction', 'indexing', 'b-tree',
    'data structure', 'algorithm', 'sorting', 'searching', 'tree', 'graph', 'heap', 'dp', 'dynamic programming',
    'network', 'tcp', 'ip', 'http', 'dns', 'routing', 'osi', 'mac', 'aloha',
    'automata', 'turing', 'regular', 'context free', 'grammar', 'pumping lemma',
    'compiler', 'lexer', 'parser', 'code generation',
    'computer organization', 'cache', 'pipeline', 'instruction',
    'programming', 'c language', 'pointer', 'recursion',
  ],
  Mathematics: [
    'matrix', 'eigenvalue', 'linear algebra', 'vector', 'determinant',
    'calculus', 'derivative', 'integral', 'limit', 'differential',
    'probability', 'bayes', 'distribution', 'expectation', 'variance',
    'combinatorics', 'permutation', 'combination', 'counting',
    'discrete math', 'propositional logic', 'predicate logic', 'set theory',
    'number theory', 'modular', 'gcd', 'lcm',
  ],
  'General Aptitude': [
    'speed', 'distance', 'time', 'train', 'boat', 'upstream',
    'percentage', 'profit', 'loss', 'interest', 'compound',
    'ratio', 'proportion', 'mixture',
    'work', 'efficiency', 'pipe',
    'verbal', 'reading comprehension', 'grammar',
    'aptitude', 'reasoning', 'puzzle',
  ],
}

function classifySubject(text: string): string {
  const lower = text.toLowerCase()
  for (const [subject, keywords] of Object.entries(SUBJECT_TOPIC_MAP)) {
    if (keywords.some((kw) => lower.includes(kw))) return subject
  }
  return 'Computer Science' // default
}

function classifyTopic(text: string, subject: string): string {
  const lower = text.toLowerCase()
  // OS topics
  if (lower.includes('schedul')) return 'Operating Systems - CPU Scheduling'
  if (lower.includes('deadlock') || lower.includes('banker')) return 'Operating Systems - Deadlock'
  if (lower.includes('paging') || lower.includes('page table') || lower.includes('page fault')) return 'Operating Systems - Paging'
  if (lower.includes('virtual memory') || lower.includes('memory management')) return 'Operating Systems - Memory Management'
  if (lower.includes('semaphore') || lower.includes('mutex') || lower.includes('synchronization')) return 'Operating Systems - Synchronization'
  if (lower.includes('file system') || lower.includes('inode')) return 'Operating Systems - File Systems'
  if (lower.includes('process') || lower.includes('thread')) return 'Operating Systems - Processes'
  // DBMS
  if (lower.includes('normaliz') || lower.includes('nf') || lower.includes('functional depend')) return 'DBMS - Normalization'
  if (lower.includes('sql') || lower.includes('query') || lower.includes('join') || lower.includes('select')) return 'DBMS - SQL'
  if (lower.includes('transaction') || lower.includes('acid') || lower.includes('rollback') || lower.includes('commit')) return 'DBMS - Transactions'
  if (lower.includes('b-tree') || lower.includes('b+ tree') || lower.includes('index')) return 'DBMS - Indexing'
  // DSA
  if (lower.includes('sort') || lower.includes('quick') || lower.includes('merge sort') || lower.includes('heap sort')) return 'DSA - Sorting'
  if (lower.includes('tree') || lower.includes('bst') || lower.includes('avl') || lower.includes('binary')) return 'DSA - Trees'
  if (lower.includes('graph') || lower.includes('dijkstra') || lower.includes('bfs') || lower.includes('dfs')) return 'DSA - Graphs'
  if (lower.includes('dynamic programming') || lower.includes('dp ') || lower.includes('memoiz')) return 'DSA - Dynamic Programming'
  if (lower.includes('heap') || lower.includes('priority queue')) return 'DSA - Heaps'
  // Networks
  if (lower.includes('osi') || lower.includes('layer')) return 'Computer Networks - OSI Model'
  if (lower.includes('tcp') || lower.includes('udp') || lower.includes('ip address')) return 'Computer Networks - TCP/IP'
  if (lower.includes('aloha') || lower.includes('csma') || lower.includes('mac')) return 'Computer Networks - MAC Protocols'
  // TOC
  if (lower.includes('regular') || lower.includes('finite automata') || lower.includes('dfa') || lower.includes('nfa')) return 'Theory of Computation - Regular Languages'
  if (lower.includes('context free') || lower.includes('cfg') || lower.includes('pushdown')) return 'Theory of Computation - Context Free'
  if (lower.includes('turing')) return 'Theory of Computation - Turing Machines'
  // Math
  if (lower.includes('eigenvalue') || lower.includes('matrix') || lower.includes('determinant')) return 'Linear Algebra'
  if (lower.includes('probability') || lower.includes('bayes')) return 'Probability'
  if (lower.includes('permutation') || lower.includes('combination') || lower.includes('ways to arrange')) return 'Combinatorics'
  // Aptitude
  if (lower.includes('train') || lower.includes('speed') || lower.includes('distance')) return 'Time Speed Distance'
  if (lower.includes('profit') || lower.includes('loss') || lower.includes('interest')) return 'Percentages'
  if (lower.includes('students') || lower.includes('neither') || lower.includes('set')) return 'Set Theory'

  return `${subject} - General`
}

// ============================================================
// MAIN EXTRACTION PROMPT
// ============================================================
const EXTRACTION_SYSTEM_PROMPT = `You are a GATE exam question extractor specializing in engineering entrance exam preparation.

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

SUBJECT CLASSIFICATION:
- "Computer Science": OS, DBMS, DSA, Networks, TOC, Compiler Design, CO
- "Mathematics": Linear Algebra, Calculus, Probability, Combinatorics, Discrete Math
- "General Aptitude": Verbal, Numerical, Reasoning
- "Electronics" / "Electrical" / "Mechanical" / "Civil" / "Chemical": as applicable

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
    "subject": "Computer Science",
    "topic": "Operating Systems - CPU Scheduling",
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
