# Memory Garden MVP - Detailed Implementation Plan

## Project Overview
Creating a collaborative flashcard system that combines spaced repetition with community learning. The "Memory Garden of Imladris" aesthetic brings Rivendell's timeless wisdom to modern learning.

**Challenge Goal**: Uplift team human through beautiful, social learning that makes difficult concepts accessible and memorable.

## Technical Stack (Research-Based)
- **Framework**: Next.js 14+ (App Router) with TypeScript
- **Database**: Supabase (PostgreSQL with instant API)
- **Styling**: Tailwind CSS with custom Rivendell theme
- **Fonts**: Cinzel (headers), Crimson Text (body), Inter (UI)
- **Deployment**: Vercel (automatic GitHub integration)
- **Session Management**: Simple session-based IDs (no auth complexity)

## Database Schema (Supabase)

```sql
-- Topics table
CREATE TABLE topics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Cards table
CREATE TABLE cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('analogy', 'definition')),
  content TEXT NOT NULL,
  author_name TEXT,
  helpfulness_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Reviews table (for spaced repetition)
CREATE TABLE reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_session TEXT NOT NULL, -- Simple session-based user tracking
  card_id UUID REFERENCES cards(id) ON DELETE CASCADE,
  rating TEXT NOT NULL CHECK (rating IN ('again', 'hard', 'good', 'easy')),
  next_review TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Helpfulness votes
CREATE TABLE helpfulness (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_session TEXT NOT NULL,
  card_id UUID REFERENCES cards(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_session, card_id) -- Prevent duplicate votes
);

-- Enable RLS and allow anonymous access
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE helpfulness ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous access" ON topics FOR ALL USING (true);
CREATE POLICY "Allow anonymous access" ON cards FOR ALL USING (true);
CREATE POLICY "Allow anonymous access" ON reviews FOR ALL USING (true);
CREATE POLICY "Allow anonymous access" ON helpfulness FOR ALL USING (true);
```

## Design System: Rivendell Aesthetic

### Color Palette (The Colors of Imladris)
```css
:root {
  /* Rivendell-inspired palette */
  --parchment: #F5F5DC;           /* Warm parchment - like Bilbo's writings */
  --forest-green: #2C3E2C;        /* Deep forest green - Rivendell's eternal woods */
  --elvish-gold: #D4AF37;         /* Soft gold - elvish light and wisdom */
  --sage-knowledge: #6B8E5A;      /* Muted sage - peaceful learning */
  --warm-bronze: #CD853F;         /* Gentle bronze - encouraging growth */
  --scroll-white: #FEFEFE;        /* Card backgrounds - aged elvish scrolls */
  --starlight-shadow: rgba(212,175,55,0.1); /* Golden shadows */
  --soft-shadow: rgba(0,0,0,0.08); /* Gentle depth */
  
  /* Semantic colors */
  --text-primary: var(--forest-green);
  --text-secondary: #4A5A4A;
  --accent: var(--elvish-gold);
  --success: var(--sage-knowledge);
  --needs-review: var(--warm-bronze);
  --background: var(--parchment);
  --card-bg: var(--scroll-white);
}
```

### Typography (Elvish Elegance)
- **Headers**: Cinzel (elvish elegance - titles like "The Last Homely House")
- **Body**: Crimson Text (ancient manuscript feel for card content)
- **UI**: Inter (clean but warm for interface elements)

### Rivendell Design Elements
- **Golden Borders**: Cards get delicate gold borders when focused (elvish craftsmanship)
- **Flowing Transitions**: Gentle, water-like animations (like Rivendell's streams)
- **Starlight Effects**: Soft glows on interactive elements
- **Elegant Spacing**: Generous whitespace reflecting elvish attention to beauty
- **Success Magic**: Gentle sparkles when learning succeeds

### Card Design Philosophy (Scrolls of Wisdom)
- Cards should feel like precious elvish scrolls containing ancient wisdom
- Delicate golden borders appear on focus (reflecting elvish craftsmanship)
- Gentle animations flow like water in Rivendell's gardens
- Typography hierarchy guides the eye with elvish elegance
- Each card holds the warmth of community knowledge

## User Experience Flow

### 1. The Last Homely House (Homepage - `/`)
**Purpose**: Welcome weary travelers and showcase the halls of wisdom

```
┌─────────────────────────────────────────────────┐
│            ✨ Memory Garden ✨                  │
│         "The Last Homely House East             │
│           of the Sea" - Elrond                  │
│      Welcome, friend. What wisdom do you seek?  │
├─────────────────────────────────────────────────┤
│            [✨ Create New Scroll]                 │
├─────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────┐    │
│  │ 🌌 Quantum Entanglement                 │    │
│  │ "How particles stay mysteriously..."    │    │
│  │ 12 scrolls • 247 fellow learners        │    │
│  │ [Study] [Contribute Wisdom]        │    │
│  └─────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────┐    │
│  │ 🔮 Machine Learning                     │    │
│  │ "Teaching minds to learn and grow..."   │    │
│  │ 8 scrolls • 156 fellow learners         │    │
│  │ [Study] [Contribute Wisdom]        │    │
│  └─────────────────────────────────────────┘    │
└─────────────────────────────────────────────────┘
```

### 2. The Hall of Fire (`/topic/[id]`)
**Purpose**: Gather around the hearth to share and learn wisdom together

```
┌─────────────────────────────────────────────────┐
│         🌌 Quantum Entanglement                 │
│    "How particles stay mysteriously connected"  │
│      247 fellow learners • 12 scrolls           │
│  "In this hall, wisdom flows like starlight"    │
├─────────────────────────────────────────────────┤
│ [📚 Begin Study] [✨ Contribute Wisdom]         │
├─────────────────────────────────────────────────┤
│  📜 Scrolls of Analogy                          │
│  ┌─────────────────────────────────────────┐    │
│  │ "Like two dancers who practiced..."     │    │
│  │ shared by Emma • ⭐ 127 found helpful   │    │
│  │ [⭐ This Helped] [📚 Study]              │    │
│  └─────────────────────────────────────────┘    │
│                                                 │
│  📖 Scrolls of Definition                       │
│  ┌─────────────────────────────────────────┐    │
│  │ "When two particles share quantum..."   │    │
│  │ wisdom of Marcus • ⭐ 89 found helpful  │    │
│  │ [This Helped] [📚 Study]              │    │
│  └─────────────────────────────────────────┘    │
└─────────────────────────────────────────────────┘
```

### 3. The Path of Learning (`/study/[topicId]`)
**Purpose**: Walk the peaceful path of understanding, one memory at a time

```
┌─────────────────────────────────────────────────┐
│            🌌 Quantum Entanglement              │
│               Scroll 3 of 12                    │
│        Next contemplation in 2 days             │
│        "All we have to decide is what           │
│         to do with the time given us"           │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌─────────────────────────────────────────┐    │
│  │                                         │    │
│  │  "It's like two dancers who practiced   │    │
│  │   together for years. Even when they're │    │
│  │   in separate rooms, they move in       │    │
│  │   perfect synchronization, as if        │    │
│  │   connected by invisible threads."      │    │
│  │                                         │    │
│  │                    wisdom by Emma   │    │
│  └─────────────────────────────────────────┘    │
│                                                 │
│            [✨ Reveal Wisdom]                   │
│                                                 │
│  [Again] [Challenging] [Well Learned] [Mastered]│
│                                                 │
│     ⭐ 127 travelers found this helpful          │
│       "Your understanding grows like starlight" │
└─────────────────────────────────────────────────┘
```

## Spaced Repetition Algorithm (Simple)

```typescript
const getNextReviewTime = (rating: 'again' | 'hard' | 'good' | 'easy') => {
  const now = new Date();
  const intervals = {
    again: 1,      // 1 minute
    hard: 10,      // 10 minutes  
    good: 1440,    // 1 day (in minutes)
    easy: 5760     // 4 days (in minutes)
  };
  
  return new Date(now.getTime() + intervals[rating] * 60 * 1000);
};
```

## Implementation Phases

### Phase 1: Foundation & Setup (Days 1-2)
**Goal**: Project structure and basic Rivendell aesthetic

#### Tasks:
1. **Project Setup**
   - Initialize Next.js 14+ with TypeScript, Tailwind, App Router
   - Configure custom fonts (Cinzel, Crimson Text, Inter)
   - Set up Rivendell color palette and base components

2. **Supabase Integration**
   - Create Supabase project and database schema
   - Set up TypeScript types generation
   - Configure server/client Supabase clients

3. **Base Layout & Design System**
   - Implement root layout with fonts and colors
   - Create elvish component styles (card-elvish, btn-elvish)
   - Design basic page structure and navigation

#### Deliverables:
- Working Next.js project with Rivendell aesthetic
- Supabase database with all tables created
- Typography and color system implemented

### Phase 2: The Last Homely House (Homepage) (Days 3-4)
**Goal**: Beautiful topic listing and creation interface

#### Tasks:
1. **Homepage Layout**
   - "The Last Homely House" welcome header
   - Grid layout for topic cards
   - Floating "✨ Begin New Study" button

2. **Topic Management**
   - Server component for fetching topics
   - TopicCard component with study stats
   - Create topic modal/form
   - Topic submission handling

3. **Data Integration**
   - Topics CRUD operations
   - Real-time topic counting
   - Error handling and loading states

#### Deliverables:
- Functional homepage displaying topics
- Topic creation workflow
- Beautiful topic cards with stats

### Phase 3: The Hall of Fire (Topic Detail) (Days 5-6)
**Goal**: Topic detail view with card creation and management

#### Tasks:
1. **Topic Detail Layout**
   - Topic header with title and description
   - Card list with beautiful preview cards
   - "✨ Contribute Wisdom" card creation

2. **Card Management**
   - Inline card creation form (analogy/definition)
   - Card display with author attribution
   - Helpful voting system (⭐ counts)

3. **Community Features**
   - Author name attribution ("shared by Emma")
   - Helpful count display and interaction
   - Card type indicators (analogy vs definition)

#### Deliverables:
- Topic detail pages working
- Card creation and display
- Basic community interaction (helpful votes)

### Phase 4: The Path of Learning (Study Mode) (Days 7-8)
**Goal**: Beautiful spaced repetition study interface

#### Tasks:
1. **Study Interface**
   - Single card display with flip interaction
   - Rating buttons (Again/Hard/Good/Easy)
   - Progress indicator ("3 of 12 memories strengthened")

2. **Spaced Repetition Logic**
   - Simple interval calculation:
     - Again: 1 minute
     - Hard: 10 minutes  
     - Good: 1 day
     - Easy: 4 days
   - Review scheduling and queue management

3. **Session Management**
   - Session-based user identification
   - Review history tracking
   - Progress persistence

#### Deliverables:
- Functional study mode with card flipping
- Working spaced repetition system
- Progress tracking

### Phase 5: Polish & Magic (Days 9-10)
**Goal**: Rivendell magic touches and performance optimization

#### Tasks:
1. **Visual Polish**
   - Gentle animations and transitions
   - Success sparkles and elvish touches
   - Loading states and error boundaries

2. **Performance**
   - Image optimization
   - Loading states for all data fetching
   - Error handling improvements

3. **UX Refinements**
   - Keyboard navigation in study mode
   - Mobile responsiveness
   - Accessibility improvements

#### Deliverables:
- Polished, magical user experience
- Mobile-responsive design
- Smooth animations and interactions

### Phase 6: Deployment & Testing (Days 11-12)
**Goal**: Live, working application

#### Tasks:
1. **Deployment Setup**
   - Vercel project configuration
   - Environment variables setup
   - Database connection testing

2. **End-to-End Testing**
   - Full user journey testing
   - Cross-browser compatibility
   - Mobile device testing

3. **Content Seeding**
   - Create sample topics and cards
   - Test spaced repetition flows
   - Community interaction testing

#### Deliverables:
- Live application on Vercel
- Tested and working user flows
- Sample content for demonstration

## Key Technical Decisions

### Why This Stack?
1. **Next.js 14+ App Router**: Server components for performance, built-in optimization
2. **Supabase**: Instant PostgreSQL API, no backend complexity
3. **TypeScript**: Type safety for database operations and UI
4. **Tailwind**: Rapid custom styling for Rivendell aesthetic
5. **Session-based users**: No auth complexity, focus on core experience

### Spaced Repetition Simplified
```typescript
function calculateNextReview(rating: string): Date {
  const now = new Date();
  const intervals = {
    again: 1 * 60 * 1000,        // 1 minute
    hard: 10 * 60 * 1000,        // 10 minutes
    good: 24 * 60 * 60 * 1000,   // 1 day
    easy: 4 * 24 * 60 * 60 * 1000 // 4 days
  };
  
  return new Date(now.getTime() + intervals[rating]);
}
```

### User Session Strategy
```typescript
// Simple session ID generation
function getUserSession(): string {
  if (typeof window !== 'undefined') {
    let session = localStorage.getItem('memory-garden-session');
    if (!session) {
      session = crypto.randomUUID();
      localStorage.setItem('memory-garden-session', session);
    }
    return session;
  }
  return 'anonymous';
}
```

## Success Metrics for MVP
1. **Technical**: All three main views working (Homepage, Topic, Study)
2. **Functional**: Complete create→study→rate workflow
3. **Aesthetic**: Rivendell design system fully implemented
4. **Performance**: Fast loading on all pages
5. **Social**: Helpful voting and author attribution working

## Future Enhancements (Post-MVP)
- Visual cards with simple diagrams
- User accounts and reputation systems
- Real-time study companions
- Advanced spaced repetition algorithms
- Export functionality
- Resource suggestions per topic (books, videos, courses)

## Risk Mitigation
- **Database Issues**: Use Supabase's generous free tier, simple schema
- **Complex Features**: Focus on core MVP, defer advanced features
- **Performance**: Leverage Next.js optimizations, simple queries
- **Deployment**: Vercel's one-click deployment for Next.js

## Success Definition
A working prototype that makes learning feel magical and social, combining beautiful design with proven spaced repetition and community contribution. Users should feel they're learning in Rivendell's halls of wisdom rather than grinding through flashcards alone.