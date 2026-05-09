import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // need service role to bypass RLS, or NEXT_PUBLIC_SUPABASE_ANON_KEY if RLS is off
)

async function migrate() {
  console.log('Migrating subjects...')
  
  // Update old "Computer Science" to something valid, or just let's see what's in the DB
  const { data, error } = await supabase.from('questions').select('id, subject, topic')
  if (error) {
    console.error(error)
    return
  }

  let updated = 0
  for (const q of data) {
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
  
  console.log(`Updated ${updated} questions.`)
}

migrate()

