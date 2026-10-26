/**
 * lib/ai/config.ts
 *
 * Central configuration for AI providers, fallback cascades, and model IDs.
 */

import type { AIProviderName } from './types'

export const AI_CONFIG = {
  primaryProvider: (process.env.AI_PRIMARY_PROVIDER || 'groq') as AIProviderName,
  fallbackProviders: (process.env.AI_FALLBACK_PROVIDERS
    ? process.env.AI_FALLBACK_PROVIDERS.split(',').map(p => p.trim())
    : ['openrouter', 'gemini']) as AIProviderName[],
  
  timeoutMs: parseInt(process.env.AI_REQUEST_TIMEOUT_MS || '30000', 10),
  maxRetries: parseInt(process.env.AI_MAX_RETRIES || '1', 10),
  cacheEnabled: process.env.AI_CACHE_ENABLED !== 'false',

  groq: {
    apiKey: process.env.GROQ_API_KEY || '',
    model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
    endpoint: 'https://api.groq.com/openai/v1/chat/completions',
  },

  openrouter: {
    apiKey: process.env.OPENROUTER_API_KEY || '',
    model: process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.3-70b-instruct',
    endpoint: 'https://openrouter.ai/api/v1/chat/completions',
  },

  gemini: {
    // Collect all primary & numbered keys: GEMINI_API_KEY, GEMINI_API_KEY_2... up to 100
    apiKeys: (() => {
      const keys: string[] = []
      if (process.env.GEMINI_API_KEY) keys.push(process.env.GEMINI_API_KEY)
      for (let i = 2; i <= 100; i++) {
        const k = process.env[`GEMINI_API_KEY_${i}`]
        if (k) keys.push(k)
      }
      return keys
    })(),
    model: process.env.GEMINI_MODEL || 'gemini-3-flash-preview',
    fallbackModels: [
      'gemini-3-flash-preview',
      'gemini-3.5-flash-lite',
      'gemini-flash-latest',
      'gemini-3.8-flash',
    ] as const,
  },
}
