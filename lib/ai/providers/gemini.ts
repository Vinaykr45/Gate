/**
 * lib/ai/providers/gemini.ts
 *
 * Google Gemini AI Provider implementation.
 * Features round-robin key rotation across up to 20 keys and multi-model fallback chain.
 */

import { GoogleGenerativeAI } from '@google/generative-ai'
import { AI_CONFIG } from '../config'
import type { AIProvider, AICompletionOptions, AICompletionResponse, AIProviderHealth } from '../types'
import { AIProviderError, AIRateLimitError, AIAuthError, AITimeoutError } from '../errors'

export class GeminiProvider implements AIProvider {
  public readonly name = 'gemini' as const
  private keyIndex = 0
  private consecutiveErrors = 0
  private lastLatencyMs = 0
  private lastCheckAt?: string
  private lastSuccessAt?: string
  private lastErrorAt?: string

  isAvailable(): boolean {
    return AI_CONFIG.gemini.apiKeys.length > 0
  }

  private isRetryable(err: unknown): boolean {
    const s = (err as { status?: number })?.status
    const msg = String(err).toLowerCase()
    return (
      s === 429 ||
      s === 503 ||
      msg.includes('429') ||
      msg.includes('503') ||
      msg.includes('quota') ||
      msg.includes('overloaded') ||
      msg.includes('demand') ||
      msg.includes('temporar') ||
      msg.includes('unavailable')
    )
  }

  async complete(opts: AICompletionOptions): Promise<AICompletionResponse> {
    if (!this.isAvailable()) {
      throw new AIAuthError('gemini', 'No GEMINI_API_KEY configured in environment')
    }

    const keys = AI_CONFIG.gemini.apiKeys
    const totalKeys = keys.length
    const models = [AI_CONFIG.gemini.model, ...AI_CONFIG.gemini.fallbackModels.filter(m => m !== AI_CONFIG.gemini.model)]
    const timeout = opts.timeoutMs || AI_CONFIG.timeoutMs
    const startTime = Date.now()

    // Format messages for Gemini
    const systemMsg = opts.messages.find(m => m.role === 'system')?.content
    const nonSystemMsgs = opts.messages.filter(m => m.role !== 'system')
    const combinedPrompt = nonSystemMsgs.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n\n')

    let lastError: unknown = null

    for (const modelName of models) {
      for (let ki = 0; ki < totalKeys; ki++) {
        const key = keys[(this.keyIndex + ki) % totalKeys]
        const usedKeyIndex = (this.keyIndex + ki) % totalKeys

        try {
          const client = new GoogleGenerativeAI(key)
          const genModel = client.getGenerativeModel({
            model: modelName,
            systemInstruction: systemMsg ? { role: 'user', parts: [{ text: systemMsg }] } : undefined,
            generationConfig: {
              temperature: opts.temperature ?? 0.2,
              maxOutputTokens: opts.maxTokens ?? 8192,
              responseMimeType: opts.responseFormat === 'json_object' ? 'application/json' : 'text/plain',
            },
          })

          // Execute with timeout race
          const generatePromise = genModel.generateContent(combinedPrompt)
          const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new AITimeoutError('gemini', timeout)), timeout)
          )

          const result = await Promise.race([generatePromise, timeoutPromise])
          const content = result.response.text()

          if (!content || typeof content !== 'string') {
            throw new AIProviderError('Empty text received from Gemini model', 'gemini')
          }

          const latencyMs = Date.now() - startTime
          this.lastLatencyMs = latencyMs
          this.consecutiveErrors = 0
          this.lastCheckAt = new Date().toISOString()
          this.lastSuccessAt = new Date().toISOString()
          this.keyIndex = (usedKeyIndex + 1) % totalKeys

          return {
            content,
            provider: 'gemini',
            model: modelName,
            latencyMs,
          }
        } catch (err: unknown) {
          lastError = err
          this.consecutiveErrors++
          this.lastErrorAt = new Date().toISOString()

          if (!this.isRetryable(err)) {
            // Check for auth errors
            const msg = String(err).toLowerCase()
            if (msg.includes('api_key') || msg.includes('invalid') || msg.includes('unregistered')) {
              continue // Try next key
            }
          }
        }
      }
    }

    const errMsg = (lastError as Error)?.message || String(lastError)
    if (this.isRetryable(lastError)) {
      throw new AIRateLimitError('gemini')
    }
    throw new AIProviderError(`All Gemini keys and models failed: ${errMsg.slice(0, 200)}`, 'gemini')
  }

  async checkHealth(): Promise<AIProviderHealth> {
    if (!this.isAvailable()) {
      return {
        name: 'gemini',
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
      name: 'gemini',
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
