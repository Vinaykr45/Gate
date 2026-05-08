import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { questions } = body

    if (!questions || !Array.isArray(questions)) {
      return NextResponse.json({ error: 'Missing or invalid questions array' }, { status: 400 })
    }

    const { createClient: createAdminClient } = await import('@supabase/supabase-js')
    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: existingQuestions } = await adminSupabase
      .from('questions')
      .select('question_text')

    const existingSet = new Set(existingQuestions?.map(q => q.question_text.trim().toLowerCase()) || [])

    const validQuestions = questions.filter((q: any) => {
      const text = q.question_text?.trim()?.toLowerCase()
      return text && !existingSet.has(text)
    })

    if (validQuestions.length === 0) {
      return NextResponse.json({ success: true, count: 0, message: 'All questions were duplicates' })
    }

    const questionsToInsert = validQuestions.map((q: any) => {
      let options = q.options || {}
      
      if (q.type === 'MSQ') {
        options._type = 'MSQ'
      } else if (q.type === 'NAT') {
        options = { _type: 'NAT' }
      }

      return {
        question_text: q.question_text,
        options,
        correct_answer: q.correct_answer,
        subject: q.subject,
        topic: q.topic,
        difficulty: q.difficulty || 'medium',
        year: q.year || null,
        explanation: q.explanation || null,
        is_verified: true,
        created_by: user.id
      }
    })

    const { error } = await adminSupabase
      .from('questions')
      .insert(questionsToInsert)

    if (error) {
      console.error('Error inserting bulk questions:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      count: questionsToInsert.length,
      skipped: questions.length - questionsToInsert.length 
    })
  } catch (error) {
    console.error('Bulk API Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
