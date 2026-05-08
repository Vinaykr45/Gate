import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify test belongs to user
    const { data: test, error: fetchError } = await supabase
      .from('tests')
      .select('user_id')
      .eq('id', id)
      .single()

    if (fetchError || !test || test.user_id !== user.id) {
      return NextResponse.json({ error: 'Test not found or unauthorized' }, { status: 404 })
    }

    // Supabase should cascade delete test_questions and attempts if configured.
    // If not, we should manually delete them. Let's do manual just in case.
    await supabase.from('attempts').delete().eq('test_id', id)
    await supabase.from('test_questions').delete().eq('test_id', id)
    
    // Now delete the test
    const { error: deleteError } = await supabase.from('tests').delete().eq('id', id)

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete test route error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
