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
    if (q.subject === 'Computer Science' || q.subject === 'Mathematics') {
      let newSubject = 'Programming & Data Structures'
      if (q.subject === 'Mathematics') newSubject = 'Engineering Mathematics'
      
      const lower = q.topic?.toLowerCase() || ''
      if (lower.includes('schedul') || lower.includes('deadlock') || lower.includes('paging') || lower.includes('memory') || lower.includes('process')) newSubject = 'Operating Systems'
      if (lower.includes('normaliz') || lower.includes('sql') || lower.includes('transaction') || lower.includes('b-tree')) newSubject = 'Databases'
      if (lower.includes('sort') || lower.includes('tree') || lower.includes('graph') || lower.includes('dp')) newSubject = 'Algorithms'
      if (lower.includes('osi') || lower.includes('tcp') || lower.includes('mac')) newSubject = 'Computer Networks'
      if (lower.includes('regular') || lower.includes('context') || lower.includes('turing')) newSubject = 'Theory of Computation'
      if (lower.includes('matrix') || lower.includes('calculus') || lower.includes('probability')) newSubject = 'Engineering Mathematics'
      
      await supabase.from('questions').update({ subject: newSubject }).eq('id', q.id)
      updated++
    }
  }
  
  return NextResponse.json({ updated })
}
