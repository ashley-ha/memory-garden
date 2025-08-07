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
  // Flashcard fields - if front_content is not null, treat as flashcard
  front_content: string | null
  back_content: string | null
  author_id: string | null
  author_name: string | null
  helpful_count: number
  sources: string | string[] | null  // Sources - string for new cards, array for backward compatibility
  in_study_deck?: boolean  // Will be populated by API when user context is available
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

export interface UserStudyDeck {
  id: string
  user_id: string
  card_id: string
  added_at: string
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

// Form types for card creation
export interface CardFormData {
  type: 'analogy' | 'definition' | 'knowledge'
  isFlashcard: boolean  // For definition/knowledge cards only
  content?: string      // For general wisdom cards and analogies
  front_content?: string  // For flashcards
  back_content?: string   // For flashcards
  sources?: string       // Optional sources
  author_name?: string
}