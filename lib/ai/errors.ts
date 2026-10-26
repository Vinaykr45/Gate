/**
 * lib/ai/errors.ts
 *
 * Normalized error classes for the AI subsystem.
 */

import type { AIProviderName } from './types'

export class AIProviderError extends Error {
  public readonly provider: AIProviderName
  public readonly statusCode?: number
  public readonly retryable: boolean

  constructor(message: string, provider: AIProviderName, statusCode?: number, retryable = true) {
    super(`[AI:${provider}] ${message}`)
    this.name = 'AIProviderError'
    this.provider = provider
    this.statusCode = statusCode
    this.retryable = retryable
  }
}

export class AIRateLimitError extends AIProviderError {
  public readonly retryAfterSeconds?: number

  constructor(provider: AIProviderName, retryAfterSeconds?: number) {
    super(`Rate limit exceeded (429)${retryAfterSeconds ? `, retry after ${retryAfterSeconds}s` : ''}`, provider, 429, true)
    this.name = 'AIRateLimitError'
    this.retryAfterSeconds = retryAfterSeconds
  }
}

export class AIAuthError extends AIProviderError {
  constructor(provider: AIProviderName, details?: string) {
    super(`Authentication failed (401/403). Verify API key. ${details || ''}`, provider, 401, false)
    this.name = 'AIAuthError'
  }
}

export class AITimeoutError extends AIProviderError {
  constructor(provider: AIProviderName, timeoutMs: number) {
    super(`Request timed out after ${timeoutMs}ms`, provider, 408, true)
    this.name = 'AITimeoutError'
  }
}

export class AIAllProvidersExhaustedError extends Error {
  public readonly errors: Record<AIProviderName, string>

  constructor(errors: Record<string, string>) {
    super(`All configured AI providers failed or are unavailable: ${JSON.stringify(errors)}`)
    this.name = 'AIAllProvidersExhaustedError'
    this.errors = errors as Record<AIProviderName, string>
  }
}
