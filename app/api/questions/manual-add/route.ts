import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    // Allow users to add PYQs. We might want to restrict this to admins later.
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { question_text, options, correct_answer, subject, topic, difficulty, year, explanation } = body

    if (!question_text || !correct_answer || !subject || !topic || !difficulty) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Since we are inserting into the public questions table, we bypass RLS using the service role
    // because standard users might only have read access to questions depending on your RLS policies.
    const { createClient: createAdminClient } = await import('@supabase/supabase-js')
    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: existing } = await adminSupabase
      .from('questions')
      .select('id')
      .eq('question_text', question_text)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ error: 'A question with this exact text already exists.' }, { status: 409 })
    }

    const { error } = await adminSupabase
      .from('questions')
      .insert({
        question_text,
        options,
        correct_answer,
        subject,
        topic,
        difficulty,
        year,
        explanation: explanation || null,
        is_verified: true,
        created_by: user.id
      })

    if (error) {
      console.error('Error inserting question:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
