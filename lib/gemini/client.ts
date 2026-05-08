/**
 * lib/gemini/client.ts
 *
 * Gemini AI client with automatic API-key rotation + per-model retry.
 *
 * How it works:
 *   1. Reads GEMINI_API_KEY, GEMINI_API_KEY_2, GEMINI_API_KEY_3 … from env
 *   2. On every `generateWithFallback()` call it tries each key in round-robin
 *   3. If a key returns 429 (quota) or 503 (overload) it immediately rotates
 *      to the next key (and waits with exponential backoff per attempt)
 *   4. If all keys fail on a model it moves to the next model in the chain
 *
 * Setup — add to .env.local:
 *   GEMINI_API_KEY=your-primary-key
 *   GEMINI_API_KEY_2=your-second-key
 *   GEMINI_API_KEY_3=your-third-key
 */

import { GoogleGenerativeAI, type GenerationConfig } from '@google/generative-ai'

// ── Collect all configured keys ────────────────────────────────────────────
function loadKeys(): string[] {
  const keys: string[] = []
  // Always pick up the primary key
  if (process.env.GEMINI_API_KEY) keys.push(process.env.GEMINI_API_KEY)
  // Pick up numbered extras: GEMINI_API_KEY_2, _3 … _20
  for (let i = 2; i <= 20; i++) {
    const k = process.env[`GEMINI_API_KEY_${i}`]
    if (k) keys.push(k)
  }
  if (keys.length === 0) {
    console.warn('[Gemini] No API keys found. Set GEMINI_API_KEY in .env.local')
  }
  return keys
}

const API_KEYS = loadKeys()

// Round-robin index — shared across requests (module-level, resets on cold start)
let keyIndex = 0

/** Get the next key in round-robin order */
function nextKey(): string {
  const key = API_KEYS[keyIndex % API_KEYS.length]
  keyIndex = (keyIndex + 1) % API_KEYS.length
  return key
}

// ── Model fallback chain ───────────────────────────────────────────────────
export const MODEL_CHAIN = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
] as const

export type GeminiModel = (typeof MODEL_CHAIN)[number]

// ── Retry-able error detection ─────────────────────────────────────────────
function isRetryable(err: unknown): boolean {
  const s = (err as { status?: number })?.status
  const msg = String(err)
  return s === 429 || s === 503 || msg.includes('429') || msg.includes('503')
}

// ── Core: generate with automatic key rotation + model fallback ───────────
export interface GenerateOptions {
  prompt: string
  generationConfig?: Partial<GenerationConfig>
  /** Override the model chain for this call */
  models?: readonly string[]
  /** Max retries per (model, key) pair before rotating */
  maxRetriesPerKey?: number
  /** Base delay ms between retries (doubles each attempt) */
  baseDelayMs?: number
}

export interface GenerateResult {
  text: string
  model: string
  keyIndex: number
}

export async function generateWithFallback(opts: GenerateOptions): Promise<GenerateResult> {
  const {
    prompt,
    generationConfig = {},
    models = MODEL_CHAIN,
    maxRetriesPerKey = 1,
    baseDelayMs = 800,
  } = opts

  if (API_KEYS.length === 0) {
    throw new Error('No Gemini API keys configured')
  }

  const config: GenerationConfig = {
    temperature: 0.2,
    maxOutputTokens: 16384,
    responseMimeType: 'application/json',
    ...generationConfig,
  }

  let lastError: unknown = null
  const totalKeys = API_KEYS.length

  for (const modelName of models) {
    // Try every key for this model
    for (let ki = 0; ki < totalKeys; ki++) {
      const key = API_KEYS[(keyIndex + ki) % totalKeys]
      const usedKeyIndex = (keyIndex + ki) % totalKeys

      for (let attempt = 0; attempt <= maxRetriesPerKey; attempt++) {
        try {
          if (attempt > 0) {
            const delay = baseDelayMs * Math.pow(2, attempt - 1)
            await new Promise(r => setTimeout(r, delay))
          }

          const client = new GoogleGenerativeAI(key)
          const model = client.getGenerativeModel({ model: modelName, generationConfig: config })
          const result = await model.generateContent(prompt)
          const text = result.response.text()

          // Advance the global round-robin past the key that worked
          keyIndex = (usedKeyIndex + 1) % totalKeys
          console.log(`[Gemini] ✓ ${modelName} | key[${usedKeyIndex + 1}/${totalKeys}] | attempt ${attempt + 1}`)
          return { text, model: modelName, keyIndex: usedKeyIndex }

        } catch (err: unknown) {
          lastError = err
          console.warn(
            `[Gemini] ✗ ${modelName} | key[${usedKeyIndex + 1}/${totalKeys}] | attempt ${attempt + 1} |`,
            (err as { status?: number })?.status ?? String(err).slice(0, 80)
          )
          if (!isRetryable(err)) break // hard error on this key → try next key immediately
        }
      }
    }
    // All keys exhausted for this model → try next model
    console.warn(`[Gemini] All keys failed for ${modelName}, trying next model…`)
  }

  throw lastError ?? new Error('All Gemini models and keys exhausted')
}

// ── Convenience: is the error a retryable overload? ────────────────────────
export function isOverloadError(err: unknown): boolean {
  return isRetryable(err)
}

// ── Legacy exports (for files that import the old singleton) ───────────────
const _primary = new GoogleGenerativeAI(API_KEYS[0] ?? '')

export const geminiModel = _primary.getGenerativeModel({
  model: 'gemini-2.5-flash',
  generationConfig: {
    temperature: 0.1,
    topP: 0.8,
    topK: 10,
    maxOutputTokens: 8192,
    responseMimeType: 'application/json',
  },
})

export const geminiSuggestModel = _primary.getGenerativeModel({
  model: 'gemini-2.5-flash',
  generationConfig: {
    temperature: 0.4,
    topP: 0.9,
    maxOutputTokens: 2048,
    responseMimeType: 'application/json',
  },
})

export default _primary
