import Link from 'next/link'
import { TopicWithStats } from '@/lib/types'

interface TopicCardProps {
  topic: TopicWithStats
}

export function TopicCard({ topic }: TopicCardProps) {
  return (
    <div className="card-elvish group cursor-pointer">
      <Link href={`/topic/${topic.id}`}>
        <h3 className="text-elvish-title text-lg mb-2 group-hover:text-gold transition-colors">
          {topic.title}
        </h3>
        <p className="text-elvish-body text-sm mb-4 line-clamp-2">
          {topic.description || 'No description provided'}
        </p>
        <div className="flex justify-between items-center text-xs text-forest/60 font-inter">
          <span>{topic.card_count} cards</span>
          <span>{topic.learner_count} learners</span>
        </div>
      </Link>
      
      <div className="mt-3 pt-3 border-t border-gold/10">
        <div className="flex space-x-2">
          <Link href={`/study/${topic.id}`}>
            <button className="btn-elvish text-xs py-2 px-3">
              Study
            </button>
          </Link>
          <Link href={`/topic/${topic.id}`}>
            <button className="btn-elvish bg-transparent border border-gold text-gold hover:bg-gold hover:text-forest text-xs py-2 px-3">
              View Scrolls
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}