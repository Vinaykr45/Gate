import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { testKeyConnection } from '@/lib/ai/key-manager'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { provider, apiKey, keyIndex, model } = body

    if (!provider) {
      return NextResponse.json({ error: 'Provider is required' }, { status: 400 })
    }

    const result = await testKeyConnection({
      provider,
      apiKey,
      keyIndex,
      model,
    })

    return NextResponse.json(result)
  } catch (err: unknown) {
    const message = (err as Error)?.message || 'Failed to test key connection'
    return NextResponse.json({ success: false, message, latencyMs: 0 }, { status: 500 })
  }
}
