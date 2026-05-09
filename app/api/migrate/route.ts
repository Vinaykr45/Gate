import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()

  const { data, error } = await supabase.from('questions').select('id, subject, topic')
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  let updated = 0
  for (const q of data || []) {
    let newSubject = q.subject

    if (q.subject === 'Computer Science' || q.subject === 'Mathematics') {
      newSubject = 'Programming and Data Structures'
      if (q.subject === 'Mathematics') newSubject = 'Engineering Mathematics'
      
      const lower = q.topic?.toLowerCase() || ''
      if (lower.includes('schedul') || lower.includes('deadlock') || lower.includes('paging') || lower.includes('memory') || lower.includes('process')) newSubject = 'Operating System'
      if (lower.includes('normaliz') || lower.includes('sql') || lower.includes('transaction') || lower.includes('b-tree')) newSubject = 'Databases'
      if (lower.includes('sort') || lower.includes('tree') || lower.includes('graph') || lower.includes('dp')) newSubject = 'Algorithms'
      if (lower.includes('osi') || lower.includes('tcp') || lower.includes('mac')) newSubject = 'Computer Networks'
      if (lower.includes('regular') || lower.includes('context') || lower.includes('turing')) newSubject = 'Theory of Computation'
      if (lower.includes('matrix') || lower.includes('calculus') || lower.includes('probability')) newSubject = 'Engineering Mathematics'
    }

    if (newSubject === 'Operating Systems') newSubject = 'Operating System'
    if (newSubject === 'Computer Organization & Architecture') newSubject = 'Computer Organization and Architecture'
    if (newSubject === 'Programming & Data Structures') newSubject = 'Programming and Data Structures'

    if (newSubject !== q.subject) {
      await supabase.from('questions').update({ subject: newSubject }).eq('id', q.id)
      updated++
    }
  }
  
  return NextResponse.json({ updated })
}

