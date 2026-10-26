import { createClient } from '@/lib/supabase/server'
import { CurriculumHubClient } from './CurriculumHubClient'

export const metadata = { title: 'Curriculum Hub — PrepAxis AI' }

export default async function LearnPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: topics } = await supabase
    .from('learning_topics')
    .select('id, subject, topic, subtopic')
    .order('order_num')

  const { data: progress } = user
    ? await supabase.from('learning_progress').select('topic_id, completed').eq('user_id', user.id)
    : { data: [] }

  return (
    <CurriculumHubClient
      initialTopics={topics || []}
      userProgress={progress || []}
    />
  )
}
