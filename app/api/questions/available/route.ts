import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()

  // Fetch distinct subject+topic pairs from the actual questions table
  const { data, error } = await supabase
    .from('questions')
    .select('subject, topic')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!data || data.length === 0) {
    return NextResponse.json({ subjects: [], topicsBySubject: {}, totalQuestions: 0 })
  }

  // Build unique sets and counts
  const subjectsSet = new Set<string>()
  const topicsBySubject: Record<string, Set<string>> = {}
  const counts = { total: data.length, bySubject: {} as Record<string, number>, bySubjectTopic: {} as Record<string, number> }

  data.forEach((q) => {
    const subject = q.subject?.trim()
    const topic = q.topic?.trim()

    if (subject) {
      subjectsSet.add(subject)
      counts.bySubject[subject] = (counts.bySubject[subject] || 0) + 1
      
      if (!topicsBySubject[subject]) {
        topicsBySubject[subject] = new Set()
      }
      if (topic) {
        topicsBySubject[subject].add(topic)
        const stKey = `${subject}|${topic}`
        counts.bySubjectTopic[stKey] = (counts.bySubjectTopic[stKey] || 0) + 1
      }
    }
  })

  // Sort subjects alphabetically
  const subjects = Array.from(subjectsSet).sort()

  // Convert topic sets to sorted arrays
  const topicsMap = Object.fromEntries(
    subjects.map((sub) => [
      sub,
      Array.from(topicsBySubject[sub] || []).sort(),
    ])
  )

  return NextResponse.json({
    subjects,
    topicsBySubject: topicsMap,
    counts,
    totalQuestions: data.length,
  })
}
