export function TopicCardSkeleton() {
  return (
    <div className="card-elvish">
      {/* Title skeleton */}
      <div className="h-6 bg-gold/20 rounded mb-2 shimmer"></div>
      
      {/* Description skeleton - 2 lines */}
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-gold/10 rounded shimmer"></div>
        <div className="h-4 bg-gold/10 rounded w-3/4 shimmer"></div>
      </div>
      
      {/* Stats skeleton */}
      <div className="flex justify-between items-center mb-3">
        <div className="h-3 bg-gold/10 rounded w-16 shimmer"></div>
        <div className="h-3 bg-gold/10 rounded w-20 shimmer"></div>
      </div>
      
      {/* Border line */}
      <div className="border-t border-gold/10 pt-3">
        {/* Button skeletons */}
        <div className="flex gap-2">
          <div className="h-8 bg-gold/15 rounded w-16 shimmer"></div>
          <div className="h-8 bg-gold/15 rounded w-24 shimmer"></div>
        </div>
      </div>
    </div>
  )
}

export function TopicGridSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flow-in" style={{ animationDelay: `${0.4 + i * 0.1}s` }}>
          <TopicCardSkeleton />
        </div>
      ))}
    </div>
  )
}