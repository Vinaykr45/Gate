import { findRegistryTopic } from './registry'

export const isUUID = (str: string): boolean =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str)

/**
 * Ensures a topic has a valid record and UUID in the database learning_topics table.
 * Resolves static curriculum subtopics (e.g. 'prop_logic', 's1') into database records
 * so foreign key constraints on `notes`, `user_notes`, and `learning_progress` are satisfied.
 */
export async function ensureTopicInDb(
  supabase: any,
  topicId: string,
  fallbackMeta?: { subject: string; topic: string; subtopic: string; description?: string; order_num?: number }
): Promise<string | null> {
  // 1. If it's already a valid UUID, check if it exists in learning_topics
  if (isUUID(topicId)) {
    const { data: existing } = await supabase
      .from('learning_topics')
      .select('id')
      .eq('id', topicId)
      .maybeSingle()
    if (existing) return existing.id
  }

  // 2. Resolve metadata from registry or fallback
  const meta = fallbackMeta || findRegistryTopic(topicId)
  if (!meta) return null

  // 3. Check if a database topic already exists with matching subject & subtopic
  const { data: byName } = await supabase
    .from('learning_topics')
    .select('id')
    .eq('subject', meta.subject)
    .eq('subtopic', meta.subtopic)
    .maybeSingle()

  if (byName) return byName.id

  // 4. Auto-insert topic record so foreign keys in notes / user_notes succeed
  const { data: created, error } = await supabase
    .from('learning_topics')
    .insert({
      subject: meta.subject,
      topic: meta.topic,
      subtopic: meta.subtopic,
      description: meta.description || `${meta.topic} — ${meta.subtopic}`,
      order_num: meta.order_num || 1,
    })
    .select('id')
    .maybeSingle()

  if (created) return created.id
  if (error) {
    console.warn('ensureTopicInDb insert warning:', error.message)
    // Retry finding by subject & subtopic in case of race condition
    const { data: retry } = await supabase
      .from('learning_topics')
      .select('id')
      .eq('subject', meta.subject)
      .eq('subtopic', meta.subtopic)
      .maybeSingle()
    if (retry) return retry.id
  }

  return null
}
