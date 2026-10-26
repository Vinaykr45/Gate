import fs from 'fs'
import path from 'path'
import { AI_CONFIG } from './config.ts'
import type { AIProviderName } from './types.ts'
import { GoogleGenerativeAI } from '@google/generative-ai'

export interface KeyEntry {
  id: string
  provider: 'gemini' | 'groq' | 'openrouter'
  index?: number
  maskedKey: string
  prefix: string
  suffix: string
  model?: string
  isPrimary?: boolean
  status: 'active' | 'configured' | 'unconfigured'
}

export interface KeyPoolSummary {
  primaryProvider: AIProviderName
  fallbackProviders: AIProviderName[]
  gemini: {
    totalKeys: number
    model: string
    fallbackModels: string[]
    keys: KeyEntry[]
  }
  groq: {
    configured: boolean
    maskedKey: string
    model: string
  }
  openrouter: {
    configured: boolean
    maskedKey: string
    model: string
  }
}

function maskApiKey(key: string): { maskedKey: string; prefix: string; suffix: string } {
  if (!key || key.length < 8) {
    return { maskedKey: '••••••••', prefix: '', suffix: '' }
  }
  const prefix = key.slice(0, Math.min(8, Math.floor(key.length / 3)))
  const suffix = key.slice(-Math.min(6, Math.floor(key.length / 4)))
  return {
    maskedKey: `${prefix}••••••••${suffix}`,
    prefix,
    suffix,
  }
}

/**
 * Persist updated keys and config back to .env / .env.local file
 */
function persistToEnvFile(updates: Record<string, string | null>) {
  try {
    const cwd = process.cwd()
    const envLocalPath = path.join(cwd, '.env.local')
    const envPath = path.join(cwd, '.env')
    const targetFile = fs.existsSync(envLocalPath) ? envLocalPath : envPath

    let content = ''
    if (fs.existsSync(targetFile)) {
      content = fs.readFileSync(targetFile, 'utf8')
    }

    const lines = content.split(/\r?\n/)
    const updatedKeys = new Set<string>()

    const newLines = lines.map(line => {
      const match = line.match(/^\s*([A-Za-z0-9_]+)\s*=(.*)$/)
      if (match) {
        const key = match[1]
        if (key in updates) {
          updatedKeys.add(key)
          const newVal = updates[key]
          if (newVal === null) {
            return `# ${line} (removed by admin)`
          }
          return `${key}=${newVal}`
        }
      }
      return line
    })

    // Append any keys that weren't found in the existing file
    for (const [key, val] of Object.entries(updates)) {
      if (!updatedKeys.has(key) && val !== null) {
        newLines.push(`${key}=${val}`)
      }
    }

    fs.writeFileSync(targetFile, newLines.join('\n'), 'utf8')

    // Also update process.env
    for (const [key, val] of Object.entries(updates)) {
      if (val === null) {
        delete process.env[key]
      } else {
        process.env[key] = val
      }
    }
  } catch (err) {
    console.error('Failed to persist keys to env file:', err)
  }
}

export function getKeyPoolSummary(): KeyPoolSummary {
  const geminiKeys: KeyEntry[] = AI_CONFIG.gemini.apiKeys.map((k, idx) => {
    const { maskedKey, prefix, suffix } = maskApiKey(k)
    return {
      id: `gemini-${idx}`,
      provider: 'gemini',
      index: idx,
      maskedKey,
      prefix,
      suffix,
      model: AI_CONFIG.gemini.model,
      status: 'active',
    }
  })

  const groqMask = maskApiKey(AI_CONFIG.groq.apiKey)
  const openrouterMask = maskApiKey(AI_CONFIG.openrouter.apiKey)

  return {
    primaryProvider: AI_CONFIG.primaryProvider,
    fallbackProviders: AI_CONFIG.fallbackProviders,
    gemini: {
      totalKeys: AI_CONFIG.gemini.apiKeys.length,
      model: AI_CONFIG.gemini.model,
      fallbackModels: [...AI_CONFIG.gemini.fallbackModels],
      keys: geminiKeys,
    },
    groq: {
      configured: Boolean(AI_CONFIG.groq.apiKey),
      maskedKey: groqMask.maskedKey,
      model: AI_CONFIG.groq.model,
    },
    openrouter: {
      configured: Boolean(AI_CONFIG.openrouter.apiKey),
      maskedKey: openrouterMask.maskedKey,
      model: AI_CONFIG.openrouter.model,
    },
  }
}

export function addGeminiKeysBatch(rawKeys: string[], model?: string): { addedCount: number; totalCount: number } {
  // Parse raw keys: split by newlines, commas, or semicolons
  const parsed = rawKeys
    .flatMap(k => k.split(/[\r\n,;]+/))
    .map(k => k.trim())
    .filter(k => k.length >= 15)

  if (parsed.length === 0) {
    throw new Error('No valid Gemini API keys found. Keys must be valid Google AI keys.')
  }

  // Deduplicate against existing keys
  const existingSet = new Set(AI_CONFIG.gemini.apiKeys)
  const newlyAdded: string[] = []

  for (const k of parsed) {
    if (!existingSet.has(k)) {
      existingSet.add(k)
      newlyAdded.push(k)
    }
  }

  if (newlyAdded.length === 0) {
    return { addedCount: 0, totalCount: AI_CONFIG.gemini.apiKeys.length }
  }

  // Append in-memory
  AI_CONFIG.gemini.apiKeys.push(...newlyAdded)
  if (model) {
    AI_CONFIG.gemini.model = model
  }

  // Prepare env updates
  const envUpdates: Record<string, string> = {}
  AI_CONFIG.gemini.apiKeys.forEach((key, idx) => {
    const envName = idx === 0 ? 'GEMINI_API_KEY' : `GEMINI_API_KEY_${idx + 1}`
    envUpdates[envName] = key
  })

  if (model) {
    envUpdates['GEMINI_MODEL'] = model
  }

  persistToEnvFile(envUpdates)

  return { addedCount: newlyAdded.length, totalCount: AI_CONFIG.gemini.apiKeys.length }
}

export function removeGeminiKeyByIndex(index: number): { success: boolean; remainingCount: number } {
  if (index < 0 || index >= AI_CONFIG.gemini.apiKeys.length) {
    throw new Error(`Invalid key index: ${index}`)
  }

  const oldLength = AI_CONFIG.gemini.apiKeys.length
  AI_CONFIG.gemini.apiKeys.splice(index, 1)

  // Re-write all GEMINI_API_KEY env variables
  const envUpdates: Record<string, string | null> = {}
  
  // Clear the old maximum slots
  for (let i = 1; i <= oldLength + 5; i++) {
    const varName = i === 1 ? 'GEMINI_API_KEY' : `GEMINI_API_KEY_${i}`
    envUpdates[varName] = null
  }

  // Set reindexed keys
  AI_CONFIG.gemini.apiKeys.forEach((key, idx) => {
    const varName = idx === 0 ? 'GEMINI_API_KEY' : `GEMINI_API_KEY_${idx + 1}`
    envUpdates[varName] = key
  })

  persistToEnvFile(envUpdates)

  return { success: true, remainingCount: AI_CONFIG.gemini.apiKeys.length }
}

export function updateGroqConfig(apiKey?: string, model?: string): void {
  const envUpdates: Record<string, string> = {}
  if (apiKey !== undefined && apiKey.trim().length > 0) {
    AI_CONFIG.groq.apiKey = apiKey.trim()
    envUpdates['GROQ_API_KEY'] = apiKey.trim()
  }
  if (model) {
    AI_CONFIG.groq.model = model
    envUpdates['GROQ_MODEL'] = model
  }
  if (Object.keys(envUpdates).length > 0) {
    persistToEnvFile(envUpdates)
  }
}

export function updateOpenRouterConfig(apiKey?: string, model?: string): void {
  const envUpdates: Record<string, string> = {}
  if (apiKey !== undefined && apiKey.trim().length > 0) {
    AI_CONFIG.openrouter.apiKey = apiKey.trim()
    envUpdates['OPENROUTER_API_KEY'] = apiKey.trim()
  }
  if (model) {
    AI_CONFIG.openrouter.model = model
    envUpdates['OPENROUTER_MODEL'] = model
  }
  if (Object.keys(envUpdates).length > 0) {
    persistToEnvFile(envUpdates)
  }
}

export function updateRouterSettings(settings: {
  primaryProvider?: AIProviderName
  fallbackProviders?: AIProviderName[]
}): void {
  const envUpdates: Record<string, string> = {}
  if (settings.primaryProvider) {
    AI_CONFIG.primaryProvider = settings.primaryProvider
    envUpdates['AI_PRIMARY_PROVIDER'] = settings.primaryProvider
  }
  if (settings.fallbackProviders) {
    AI_CONFIG.fallbackProviders = settings.fallbackProviders
    envUpdates['AI_FALLBACK_PROVIDERS'] = settings.fallbackProviders.join(',')
  }
  if (Object.keys(envUpdates).length > 0) {
    persistToEnvFile(envUpdates)
  }
}

export async function testKeyConnection(params: {
  provider: 'gemini' | 'groq' | 'openrouter'
  apiKey?: string
  keyIndex?: number
  model?: string
}): Promise<{ success: boolean; latencyMs: number; message: string; sampleResponse?: string }> {
  const startTime = Date.now()
  const { provider, model } = params

  try {
    let key = params.apiKey
    if (!key && provider === 'gemini') {
      const idx = params.keyIndex ?? 0
      key = AI_CONFIG.gemini.apiKeys[idx]
    } else if (!key && provider === 'groq') {
      key = AI_CONFIG.groq.apiKey
    } else if (!key && provider === 'openrouter') {
      key = AI_CONFIG.openrouter.apiKey
    }

    if (!key) {
      throw new Error(`No API key provided for ${provider}`)
    }

    if (provider === 'gemini') {
      let targetModel = model || AI_CONFIG.gemini.model || 'gemini-3-flash-preview'
      if (targetModel === 'gemini-3-flash' || targetModel === '3-flash') targetModel = 'gemini-3-flash-preview'
      if (targetModel === '3.5-flash-lite') targetModel = 'gemini-3.5-flash-lite'
      const client = new GoogleGenerativeAI(key)
      const genModel = client.getGenerativeModel({
        model: targetModel,
        generationConfig: { maxOutputTokens: 20 },
      })
      const result = await genModel.generateContent('Say: Online')
      const latencyMs = Date.now() - startTime
      const text = result.response.text()?.trim() || 'OK'
      return {
        success: true,
        latencyMs,
        message: `Successfully connected to Gemini (${targetModel})`,
        sampleResponse: text,
      }
    }

    if (provider === 'groq') {
      const targetModel = model || AI_CONFIG.groq.model || 'llama-3.3-70b-versatile'
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`,
        },
        body: JSON.stringify({
          model: targetModel,
          messages: [{ role: 'user', content: 'Say: Online' }],
          max_tokens: 10,
        }),
      })

      const latencyMs = Date.now() - startTime
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}))
        throw new Error(errJson?.error?.message || `Groq HTTP ${res.status}: ${res.statusText}`)
      }

      const data = await res.json()
      return {
        success: true,
        latencyMs,
        message: `Successfully connected to Groq (${targetModel})`,
        sampleResponse: data.choices?.[0]?.message?.content || 'OK',
      }
    }

    if (provider === 'openrouter') {
      const targetModel = model || AI_CONFIG.openrouter.model || 'meta-llama/llama-3.3-70b-instruct'
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`,
        },
        body: JSON.stringify({
          model: targetModel,
          messages: [{ role: 'user', content: 'Say: Online' }],
          max_tokens: 10,
        }),
      })

      const latencyMs = Date.now() - startTime
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}))
        throw new Error(errJson?.error?.message || `OpenRouter HTTP ${res.status}: ${res.statusText}`)
      }

      const data = await res.json()
      return {
        success: true,
        latencyMs,
        message: `Successfully connected to OpenRouter (${targetModel})`,
        sampleResponse: data.choices?.[0]?.message?.content || 'OK',
      }
    }

    throw new Error(`Unsupported provider: ${provider}`)
  } catch (err: unknown) {
    const latencyMs = Date.now() - startTime
    const message = (err as Error)?.message || String(err)
    return {
      success: false,
      latencyMs,
      message,
    }
  }
}
