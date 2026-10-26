import { describe, it } from 'node:test'
import assert from 'node:assert'
import { extractJsonFromText, validateGeneratedQuestions, validateTopicSummary } from '../lib/ai/validation.ts'
import { aiCache } from '../lib/ai/cache.ts'
import { AIProviderError, AIRateLimitError, AIAuthError, AITimeoutError } from '../lib/ai/errors.ts'

describe('AI Validation and JSON Extraction', () => {
  it('extracts pure JSON from clean string', () => {
    const jsonStr = '{"key": "value", "count": 42}'
    const result = extractJsonFromText(jsonStr) as Record<string, unknown>
    assert.strictEqual(result.key, 'value')
    assert.strictEqual(result.count, 42)
  })

  it('extracts JSON wrapped in markdown code blocks', () => {
    const raw = '```json\n[\n  {"question_text": "What is an algorithm?", "options": {"A": "A step-by-step procedure", "B": "A hardware device"}, "correct_answer": "A"}\n]\n```'
    const result = extractJsonFromText(raw) as Array<Record<string, unknown>>
    assert.strictEqual(Array.isArray(result), true)
    assert.strictEqual(result.length, 1)
    assert.strictEqual(result[0].question_text, 'What is an algorithm?')
  })

  it('validates and normalizes generated question payloads', () => {
    const sample = [
      {
        question_text: 'Which data structure follows FIFO?',
        options: { a: 'Queue', b: 'Stack', c: 'Tree' },
        correct_answer: 'A',
        subject: 'Algorithms',
        topic: 'Queues',
        difficulty: 'easy',
      },
    ]

    const validated = validateGeneratedQuestions(sample)
    assert.strictEqual(validated.length, 1)
    assert.strictEqual(validated[0].options.A, 'Queue')
    assert.strictEqual(validated[0].options.B, 'Stack')
    assert.strictEqual(validated[0].difficulty, 'easy')
    assert.strictEqual(validated[0].is_verified, false) // Must be draft for admin approval
  })

  it('validates topic summary payloads with defaults', () => {
    const sample = {
      title: 'Operating System Scheduling',
      overview: 'Round robin and priority scheduling concepts.',
      key_concepts: ['Context switching', 'Quantum sizing'],
      exam_tips: ['Look for preemptive vs non-preemptive distinction'],
    }

    const validated = validateTopicSummary(sample, 'Default Title')
    assert.strictEqual(validated.title, 'Operating System Scheduling')
    assert.strictEqual(validated.key_concepts.length, 2)
  })
})

describe('AI Error Normalization', () => {
  it('instantiates AIRateLimitError with retry-after metadata', () => {
    const err = new AIRateLimitError('groq', 5)
    assert.strictEqual(err.provider, 'groq')
    assert.strictEqual(err.statusCode, 429)
    assert.strictEqual(err.retryAfterSeconds, 5)
    assert.strictEqual(err.retryable, true)
  })

  it('instantiates AIAuthError as non-retryable', () => {
    const err = new AIAuthError('openrouter', 'Invalid API key')
    assert.strictEqual(err.provider, 'openrouter')
    assert.strictEqual(err.statusCode, 401)
    assert.strictEqual(err.retryable, false)
  })
})

describe('AI Cache and Deduplication', () => {
  it('stores and retrieves cache entries within TTL', () => {
    aiCache.set('test_prompt_key', { output: 'cached-result' }, 60)
    const cached = aiCache.get<{ output: string }>('test_prompt_key')
    assert.deepStrictEqual(cached, { output: 'cached-result' })
  })

  it('deduplicates concurrent requests', async () => {
    let callCount = 0
    const expensiveOperation = async () => {
      callCount++
      await new Promise(r => setTimeout(r, 20))
      return 'done'
    }

    const [res1, res2] = await Promise.all([
      aiCache.deduplicate('same_key', expensiveOperation),
      aiCache.deduplicate('same_key', expensiveOperation),
    ])

    assert.strictEqual(res1, 'done')
    assert.strictEqual(res2, 'done')
    assert.strictEqual(callCount, 1) // Only called once!
  })
})

describe('API Key Pool Manager & Admin APIs', () => {
  it('retrieves key pool summary with masked credentials', async () => {
    const { getKeyPoolSummary } = await import('../lib/ai/key-manager.ts')
    const summary = getKeyPoolSummary()
    assert.ok(summary.gemini)
    assert.strictEqual(typeof summary.gemini.totalKeys, 'number')
    assert.ok(Array.isArray(summary.gemini.keys))
    if (summary.gemini.keys.length > 0) {
      assert.ok(summary.gemini.keys[0].maskedKey.includes('••••'))
    }
  })
})
