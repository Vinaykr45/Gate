import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  getKeyPoolSummary,
  addGeminiKeysBatch,
  removeGeminiKeyByIndex,
  updateGroqConfig,
  updateOpenRouterConfig,
  updateRouterSettings,
} from '@/lib/ai/key-manager'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const summary = getKeyPoolSummary()
    return NextResponse.json({ success: true, ...summary })
  } catch (err: unknown) {
    const message = (err as Error)?.message || 'Failed to fetch API key summary'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, provider, keys, apiKey, model, primaryProvider, fallbackProviders } = body

    if (action === 'update_router') {
      updateRouterSettings({ primaryProvider, fallbackProviders })
      return NextResponse.json({
        success: true,
        message: 'AI Router settings updated successfully',
        summary: getKeyPoolSummary(),
      })
    }

    if (provider === 'gemini') {
      const keysToAdd: string[] = Array.isArray(keys) ? keys : (apiKey ? [apiKey] : [])
      if (keysToAdd.length === 0) {
        return NextResponse.json({ error: 'Please provide at least one Gemini API key' }, { status: 400 })
      }

      const result = addGeminiKeysBatch(keysToAdd, model)
      return NextResponse.json({
        success: true,
        message: `Successfully added ${result.addedCount} Gemini key(s) to pool. Total active: ${result.totalCount}`,
        ...result,
        summary: getKeyPoolSummary(),
      })
    }

    if (provider === 'groq') {
      if (!apiKey && !model) {
        return NextResponse.json({ error: 'Please provide a Groq API key or model' }, { status: 400 })
      }
      updateGroqConfig(apiKey, model)
      return NextResponse.json({
        success: true,
        message: 'Groq configuration updated successfully',
        summary: getKeyPoolSummary(),
      })
    }

    if (provider === 'openrouter') {
      if (!apiKey && !model) {
        return NextResponse.json({ error: 'Please provide an OpenRouter API key or model' }, { status: 400 })
      }
      updateOpenRouterConfig(apiKey, model)
      return NextResponse.json({
        success: true,
        message: 'OpenRouter configuration updated successfully',
        summary: getKeyPoolSummary(),
      })
    }

    return NextResponse.json({ error: 'Invalid provider specified' }, { status: 400 })
  } catch (err: unknown) {
    const message = (err as Error)?.message || 'Failed to update API key configuration'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const provider = searchParams.get('provider')
    const indexStr = searchParams.get('index')

    if (provider === 'gemini') {
      if (indexStr === null) {
        return NextResponse.json({ error: 'Key index is required' }, { status: 400 })
      }
      const index = parseInt(indexStr, 10)
      const result = removeGeminiKeyByIndex(index)
      return NextResponse.json({
        success: true,
        message: `Gemini key removed. Remaining in pool: ${result.remainingCount}`,
        summary: getKeyPoolSummary(),
      })
    }

    if (provider === 'groq') {
      updateGroqConfig('')
      return NextResponse.json({
        success: true,
        message: 'Groq API key removed',
        summary: getKeyPoolSummary(),
      })
    }

    if (provider === 'openrouter') {
      updateOpenRouterConfig('')
      return NextResponse.json({
        success: true,
        message: 'OpenRouter API key removed',
        summary: getKeyPoolSummary(),
      })
    }

    return NextResponse.json({ error: 'Invalid provider specified' }, { status: 400 })
  } catch (err: unknown) {
    const message = (err as Error)?.message || 'Failed to delete API key'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
