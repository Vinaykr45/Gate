/**
 * lib/ai/providers/groq.ts
 *
 * Groq AI Provider implementation using high-speed LPUs.
 * Uses OpenAI-compatible HTTP interface with native fetch and AbortSignal timeout.
 */

import { AI_CONFIG } from '../config'
import type { AIProvider, AICompletionOptions, AICompletionResponse, AIProviderHealth } from '../types'
import { AIProviderError, AIRateLimitError, AIAuthError, AITimeoutError } from '../errors'

export class GroqProvider implements AIProvider {
  public readonly name = 'groq' as const
  private consecutiveErrors = 0
  private lastLatencyMs = 0
  private lastCheckAt?: string
  private lastSuccessAt?: string
  private lastErrorAt?: string

  isAvailable(): boolean {
    return Boolean(AI_CONFIG.groq.apiKey && AI_CONFIG.groq.apiKey.trim().length > 0)
  }

  async complete(opts: AICompletionOptions): Promise<AICompletionResponse> {
    if (!this.isAvailable()) {
      throw new AIAuthError('groq', 'GROQ_API_KEY is not configured in environment')
    }

    const timeout = opts.timeoutMs || AI_CONFIG.timeoutMs
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)
    const startTime = Date.now()

    try {
      const body: Record<string, unknown> = {
        model: AI_CONFIG.groq.model,
        messages: opts.messages,
        temperature: opts.temperature ?? 0.2,
        max_tokens: opts.maxTokens ?? 4096,
      }

      if (opts.responseFormat === 'json_object') {
        body.response_format = { type: 'json_object' }
      }

      const res = await fetch(AI_CONFIG.groq.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AI_CONFIG.groq.apiKey}`,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
      const latencyMs = Date.now() - startTime
      this.lastLatencyMs = latencyMs
      this.lastCheckAt = new Date().toISOString()

      if (!res.ok) {
        this.consecutiveErrors++
        this.lastErrorAt = new Date().toISOString()

        const errText = await res.text().catch(() => '')
        if (res.status === 401 || res.status === 403) {
          throw new AIAuthError('groq', errText)
        }
        if (res.status === 429) {
          const retryHeader = res.headers.get('retry-after')
          const retrySec = retryHeader ? parseInt(retryHeader, 10) : undefined
          throw new AIRateLimitError('groq', retrySec)
        }

        throw new AIProviderError(`HTTP ${res.status}: ${errText.slice(0, 200)}`, 'groq', res.status)
      }

      const data = await res.json()
      const content = data.choices?.[0]?.message?.content

      if (!content || typeof content !== 'string') {
        throw new AIProviderError('Empty or invalid content in Groq completion response', 'groq')
      }

      this.consecutiveErrors = 0
      this.lastSuccessAt = new Date().toISOString()

      return {
        content,
        provider: 'groq',
        model: data.model || AI_CONFIG.groq.model,
        latencyMs,
        usage: {
          promptTokens: data.usage?.prompt_tokens,
          completionTokens: data.usage?.completion_tokens,
          totalTokens: data.usage?.total_tokens,
        },
      }
    } catch (err: unknown) {
      clearTimeout(timeoutId)
      this.consecutiveErrors++
      this.lastErrorAt = new Date().toISOString()

      if (err instanceof AIProviderError) throw err
      if ((err as Error)?.name === 'AbortError') {
        throw new AITimeoutError('groq', timeout)
      }
      throw new AIProviderError((err as Error)?.message || String(err), 'groq', undefined, true)
    }
  }

  async checkHealth(): Promise<AIProviderHealth> {
    if (!this.isAvailable()) {
      return {
        name: 'groq',
        isConfigured: false,
        consecutiveErrors: this.consecutiveErrors,
        averageLatencyMs: this.lastLatencyMs,
        status: 'unconfigured',
      }
    }

    const status = this.consecutiveErrors >= 3
      ? 'offline'
      : this.consecutiveErrors > 0
        ? 'degraded'
        : 'healthy'

    return {
      name: 'groq',
      isConfigured: true,
      lastCheckAt: this.lastCheckAt,
      lastSuccessAt: this.lastSuccessAt,
      lastErrorAt: this.lastErrorAt,
      consecutiveErrors: this.consecutiveErrors,
      averageLatencyMs: this.lastLatencyMs,
      status,
    }
  }
}
