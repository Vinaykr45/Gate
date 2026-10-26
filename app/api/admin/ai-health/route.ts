import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { aiRouter } from '@/lib/ai/router'
import { AI_CONFIG } from '@/lib/ai/config'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const health = await aiRouter.checkAllHealth()

    // Configuration overview without revealing secret keys
    const configOverview = {
      primaryProvider: AI_CONFIG.primaryProvider,
      fallbackProviders: AI_CONFIG.fallbackProviders,
      timeoutMs: AI_CONFIG.timeoutMs,
      maxRetries: AI_CONFIG.maxRetries,
      cacheEnabled: AI_CONFIG.cacheEnabled,
      providers: {
        groq: {
          configured: Boolean(AI_CONFIG.groq.apiKey),
          model: AI_CONFIG.groq.model,
          keyPrefix: AI_CONFIG.groq.apiKey ? `${AI_CONFIG.groq.apiKey.slice(0, 7)}...` : 'Not set',
        },
        openrouter: {
          configured: Boolean(AI_CONFIG.openrouter.apiKey),
          model: AI_CONFIG.openrouter.model,
          keyPrefix: AI_CONFIG.openrouter.apiKey ? `${AI_CONFIG.openrouter.apiKey.slice(0, 10)}...` : 'Not set',
        },
        gemini: {
          configured: AI_CONFIG.gemini.apiKeys.length > 0,
          keyCount: AI_CONFIG.gemini.apiKeys.length,
          model: AI_CONFIG.gemini.model,
          fallbackModels: AI_CONFIG.gemini.fallbackModels,
        },
      },
    }

    return NextResponse.json({
      success: true,
      health,
      config: configOverview,
    })
  } catch (error) {
    console.error('AI Health check error:', error)
    return NextResponse.json({ error: 'Failed to check AI health' }, { status: 500 })
  }
}
