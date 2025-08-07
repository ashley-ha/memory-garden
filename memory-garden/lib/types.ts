// Database types for Memory Garden

export interface Topic {
  id: string
  title: string
  description: string | null
  author_id: string | null
  author_name: string | null
  created_at: string
}

export interface Card {
  id: string
  topic_id: string
  type: 'analogy' | 'definition' | 'knowledge'
  content: string
  author_id: string | null
  author_name: string | null
  helpful_count: number
  sources: string[] | null  // Array of source URLs for definition and knowledge cards
  created_at: string
}

export interface Review {
  id: string
  user_id: string
  card_id: string
  rating: 'again' | 'hard' | 'good' | 'easy'
  next_review: string
  created_at: string
}

export interface HelpfulVote {
  id: string
  user_id: string
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

export interface UserProfile {
  id: string;
  username: string;
  avatar_url: string | null;
}