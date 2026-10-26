/**
 * lib/ai/router.ts
 *
 * Central AI Router with bounded fallback cascade, jittered backoff,
 * response validation, and provider health tracking.
 */

import { AI_CONFIG } from './config'
import type {
  AIProvider,
  AIProviderName,
  AICompletionOptions,
  AICompletionResponse,
  AIProviderHealth,
} from './types'
import { GroqProvider } from './providers/groq'
import { OpenRouterProvider } from './providers/openrouter'
import { GeminiProvider } from './providers/gemini'
import {
  AIProviderError,
  AIRateLimitError,
  AITimeoutError,
  AIAllProvidersExhaustedError,
} from './errors'
import { extractJsonFromText } from './validation'

class AIRouter {
  private providers: Map<AIProviderName, AIProvider>

  constructor() {
    this.providers = new Map()
    this.providers.set('groq', new GroqProvider())
    this.providers.set('openrouter', new OpenRouterProvider())
    this.providers.set('gemini', new GeminiProvider())
  }

  /**
   * Returns ordered list of providers to try based on config and availability
   */
  private getProviderChain(preferred?: AIProviderName): AIProviderName[] {
    const chain: AIProviderName[] = []

    if (preferred && this.providers.get(preferred)?.isAvailable()) {
      chain.push(preferred)
    }

    const primary = AI_CONFIG.primaryProvider
    if (!chain.includes(primary) && this.providers.get(primary)?.isAvailable()) {
      chain.push(primary)
    }

    for (const fb of AI_CONFIG.fallbackProviders) {
      if (!chain.includes(fb) && this.providers.get(fb)?.isAvailable()) {
        chain.push(fb)
      }
    }

    // Add any remaining available providers
    for (const [name, p] of this.providers.entries()) {
      if (!chain.includes(name) && p.isAvailable()) {
        chain.push(name)
      }
    }

    return chain
  }

  /**
   * Helper delay with exponential backoff and jitter
   */
  private async delayWithJitter(attempt: number, baseMs = 500): Promise<void> {
    const exp = Math.min(baseMs * Math.pow(2, attempt), 4000)
    const jitter = Math.random() * 300
    await new Promise(r => setTimeout(r, exp + jitter))
  }

  /**
   * Main completion method with bounded cascade across providers
   */
  async complete(opts: AICompletionOptions): Promise<AICompletionResponse> {
    const chain = this.getProviderChain(opts.preferredProvider)

    if (chain.length === 0) {
      throw new AIAllProvidersExhaustedError({
        all: 'No AI providers are configured with valid API keys in .env.local',
      })
    }

    const errors: Record<string, string> = {}

    for (const providerName of chain) {
      const provider = this.providers.get(providerName)
      if (!provider) continue

      for (let attempt = 0; attempt <= AI_CONFIG.maxRetries; attempt++) {
        try {
          if (attempt > 0) {
            await this.delayWithJitter(attempt)
          }

          const response = await provider.complete(opts)
          return response
        } catch (err: unknown) {
          const errMsg = (err as Error)?.message || String(err)
          errors[`${providerName}_attempt${attempt + 1}`] = errMsg

          // If rate limited with retry-after header and within budget, wait briefly
          if (err instanceof AIRateLimitError && err.retryAfterSeconds && err.retryAfterSeconds <= 3) {
            await new Promise(r => setTimeout(r, (err.retryAfterSeconds || 1) * 1000))
            continue
          }

          // If not retryable or final attempt on this provider, move to next provider in cascade
          if (err instanceof AIProviderError && !err.retryable) {
            break
          }
        }
      }
    }

    throw new AIAllProvidersExhaustedError(errors)
  }

  /**
   * Convenience wrapper that requests JSON and parses/validates the result
   */
  async generateJSON<T>(
    opts: AICompletionOptions,
    validator?: (parsed: unknown) => T
  ): Promise<{ data: T; response: AICompletionResponse }> {
    const completionOpts: AICompletionOptions = {
      ...opts,
      responseFormat: 'json_object',
    }

    const response = await this.complete(completionOpts)
    const parsed = extractJsonFromText(response.content)
    const data = validator ? validator(parsed) : (parsed as T)

    return { data, response }
  }

  /**
   * Check health of all registered providers
   */
  async checkAllHealth(): Promise<AIProviderHealth[]> {
    const results: AIProviderHealth[] = []
    for (const p of this.providers.values()) {
      results.push(await p.checkHealth())
    }
    return results
  }
}

export const aiRouter = new AIRouter()
