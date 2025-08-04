// Database types for Memory Garden

export interface Topic {
  id: string
  title: string
  description: string | null
  created_at: string
}

export interface Card {
  id: string
  topic_id: string
  type: 'analogy' | 'definition'
  content: string
  author_name: string | null
  helpful_count: number
  created_at: string
}

export interface Review {
  id: string
  user_session: string
  card_id: string
  rating: 'again' | 'hard' | 'good' | 'easy'
  next_review: string
  created_at: string
}

export interface HelpfulVote {
  id: string
  user_session: string
  card_id: string
  created_at: string
}

// Enhanced types for UI
export interface TopicWithStats extends Topic {
  card_count: number
  learner_count: number
}

export interface CardWithTopic extends Card {
  topic: Topic
}