/**
 * lib/ai/types.ts
 *
 * Core interfaces and type definitions for the PrepAxis AI Provider System.
 */

export type AIProviderName = 'groq' | 'openrouter' | 'gemini'

export interface AIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface AICompletionOptions {
  messages: AIMessage[]
  temperature?: number
  maxTokens?: number
  responseFormat?: 'json_object' | 'text'
  timeoutMs?: number
  preferredProvider?: AIProviderName
}

export interface AICompletionResponse {
  content: string
  provider: AIProviderName
  model: string
  latencyMs: number
  cached?: boolean
  usage?: {
    promptTokens?: number
    completionTokens?: number
    totalTokens?: number
  }
}

export interface AIProviderHealth {
  name: AIProviderName
  isConfigured: boolean
  lastCheckAt?: string
  lastSuccessAt?: string
  lastErrorAt?: string
  consecutiveErrors: number
  averageLatencyMs: number
  status: 'healthy' | 'degraded' | 'unconfigured' | 'offline'
}

export interface AIProvider {
  readonly name: AIProviderName
  isAvailable(): boolean
  complete(opts: AICompletionOptions): Promise<AICompletionResponse>
  checkHealth(): Promise<AIProviderHealth>
}

// Structured schemas for parsed outputs
export interface GeneratedQuestionPayload {
  question_text: string
  options: Record<string, string> // e.g. { A: "...", B: "...", C: "...", D: "..." }
  correct_answer: string
  subject: string
  topic: string
  difficulty: 'easy' | 'medium' | 'hard'
  explanation: string
  exam_track?: string
  syllabus_version?: string
  is_verified?: boolean
}

export interface TopicSummaryPayload {
  title: string
  subject: string
  topic: string
  overview: string
  key_concepts: string[]
  exam_tips: string[]
  common_pitfalls: string[]
  flashcards: Array<{ front: string; back: string }>
}

export interface PerformanceInsightPayload {
  summary: string
  priority_recommendations: Array<{
    priority: 'high' | 'medium' | 'low'
    subject: string
    topic: string
    message: string
    action: string
    accuracy?: number
  }>
}
