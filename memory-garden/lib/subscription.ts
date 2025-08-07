import { createClient } from '@/lib/supabase/server'

// Free tier limits
export const FREE_LIMITS = {
  TOPICS_PER_MONTH: 10,
  CARDS_PER_TOPIC: 50,
} as const

export interface UserSubscription {
  id: string
  user_id: string
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  status: string
  plan_type: string | null
  current_period_start: string | null
  current_period_end: string | null
  created_at: string
  updated_at: string
}

export interface UserUsage {
  topics_created: number
}

/**
 * Check if a user has an active subscription
 */
export async function isUserPro(userId: string): Promise<boolean> {
  const supabase = await createClient()
  
  const { data } = await supabase.rpc('is_user_pro', {
    p_user_id: userId
  })
  
  return Boolean(data)
}

/**
 * Get user's current subscription details
 */
export async function getUserSubscription(userId: string): Promise<UserSubscription | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single()
  
  if (error || !data) return null
  return data as UserSubscription
}

/**
 * Get user's current usage for this month
 */
export async function getUserUsage(userId: string): Promise<UserUsage> {
  const supabase = await createClient()
  
  const { data } = await supabase.rpc('get_user_usage', {
    p_user_id: userId
  })
  
  return {
    topics_created: data?.[0]?.topics_created || 0
  }
}

/**
 * Check if user can create a new topic
 */
export async function canCreateTopic(userId: string): Promise<{
  allowed: boolean
  reason?: string
  usage?: UserUsage
}> {
  // Check if user is pro
  const isPro = await isUserPro(userId)
  if (isPro) {
    return { allowed: true }
  }
  
  // Check usage for free users
  const usage = await getUserUsage(userId)
  
  if (usage.topics_created >= FREE_LIMITS.TOPICS_PER_MONTH) {
    return {
      allowed: false,
      reason: `Free users can create up to ${FREE_LIMITS.TOPICS_PER_MONTH} topics per month. Upgrade to Pro for unlimited topics!`,
      usage
    }
  }
  
  return { allowed: true, usage }
}

/**
 * Check if user can create a new card for a topic
 */
export async function canCreateCard(userId: string, topicId: string): Promise<{
  allowed: boolean
  reason?: string
  cardCount?: number
}> {
  // Check if user is pro
  const isPro = await isUserPro(userId)
  if (isPro) {
    return { allowed: true }
  }
  
  // Count cards for this topic
  const supabase = await createClient()
  const { count } = await supabase
    .from('cards')
    .select('*', { count: 'exact', head: true })
    .eq('topic_id', topicId)
  
  const cardCount = count || 0
  
  if (cardCount >= FREE_LIMITS.CARDS_PER_TOPIC) {
    return {
      allowed: false,
      reason: `Free users can create up to ${FREE_LIMITS.CARDS_PER_TOPIC} cards per topic. Upgrade to Pro for unlimited cards!`,
      cardCount
    }
  }
  
  return { allowed: true, cardCount }
}

/**
 * Increment topic usage (call when topic is successfully created)
 */
export async function incrementTopicUsage(userId: string): Promise<number> {
  const supabase = await createClient()
  
  const { data } = await supabase.rpc('increment_topic_usage', {
    p_user_id: userId
  })
  
  return data || 0
}

/**
 * Create or update user subscription record
 */
export async function upsertUserSubscription(subscription: Partial<UserSubscription>): Promise<void> {
  const supabase = await createClient()
  
  await supabase
    .from('user_subscriptions')
    .upsert(subscription, {
      onConflict: 'user_id'
    })
}