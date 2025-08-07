# Memory Garden: Personal Study Decks & Flashcards Implementation Plan

## Overview
Enhance Memory Garden with personalized study decks and front/back flashcard functionality to create a more effective spaced repetition learning experience.

## Key Features
1. **Personal Study Decks**: Users can curate their own study decks from community cards
2. **Front/Back Flashcards**: Default card creation supports question/answer format
3. **Mixed Card Types**: Seamlessly handle both flashcards and general wisdom cards

## Implementation Progress

### ✅ Phase 1: Database Schema Updates (COMPLETED)
- Created migration file: `lib/add-flashcards-and-study-decks.sql`
- Added `front_content` and `back_content` columns to cards table
- Created `user_study_decks` table with proper indexes
- Added helper SQL functions for deck management

### ✅ Phase 2: Type System Updates (COMPLETED)
- Updated Card interface with optional flashcard fields
- Created UserStudyDeck interface
- Added CardFormData type for form handling
- Maintained backward compatibility with optional fields

### ✅ Phase 3: API Development (COMPLETED)
- Created `POST /api/user-study-deck` - Add card to deck
- Created `DELETE /api/user-study-deck/[cardId]` - Remove card from deck
- Created `GET /api/user-study-deck` - Get user's deck with optional topic filter
- Updated `GET /api/cards` to include deck status when userId provided
- Updated `POST /api/cards` to support flashcard creation

### ✅ Phase 4: Card Creation UI (COMPLETED)
- Added flashcard toggle for definition/knowledge cards (defaults to flashcard)
- Front/Back input fields for flashcard creation
- General wisdom fallback option maintained
- Analogy cards remain single-content only
- Enhanced form validation for different card types

### ✅ Phase 5: Study Deck Management UI (COMPLETED)
- Add/Remove study deck buttons on each card
- Visual indicators for cards in user's deck
- Study button shows deck count in topic header
- Deck status messaging in topic view
- Seamless integration with existing Rivendell aesthetic

### ✅ Phase 6: Study Mode Enhancement (COMPLETED)
- Load cards only from user's personal study deck
- Flashcard display with front/back reveal flow
- Mixed card type handling (flashcards + general wisdom)
- Progress tracking and spaced repetition maintained
- Empty deck state with helpful messaging

### ✅ Phase 7: Testing & Compatibility (COMPLETED)
- Verified backward compatibility with existing cards
- Database migration uses IF NOT EXISTS for safety
- Types properly handle nullable flashcard fields
- API endpoints gracefully handle both card formats
- UI components detect and display card types appropriately

## 🎉 Implementation Complete!

All personal study deck and flashcard functionality has been successfully implemented:

### Key Features Delivered:
1. **Personal Study Decks**: Users can curate their own study decks from community cards
2. **Flashcard Support**: Default card creation for definition/knowledge cards uses front/back format
3. **Flexible Card Types**: Support for both flashcards and traditional "general wisdom" cards
4. **Study Deck Management**: Easy add/remove buttons with visual indicators
5. **Enhanced Study Mode**: Loads only personal deck cards with flashcard-specific UI
6. **Backward Compatibility**: Existing cards work seamlessly with new system

### Technical Improvements:
- Clean database schema with proper migrations
- Type-safe API endpoints with error handling
- Session-based user management (no auth required)
- Rivendell aesthetic maintained throughout
- Progressive enhancement approach

The system now provides a more effective and personalized learning experience while maintaining the collaborative spirit of Memory Garden!

## Implementation Plan

### Phase 1: Database Schema Updates
**Goal**: Add support for flashcards and user study decks

#### Tasks:
1. Add `front_content` and `back_content` columns to cards table
2. Create `user_study_decks` table for personalized deck management
3. Ensure backward compatibility with existing cards

#### Schema Changes:
```sql
-- Add flashcard support
ALTER TABLE cards ADD COLUMN front_content TEXT;
ALTER TABLE cards ADD COLUMN back_content TEXT;

-- User study decks
CREATE TABLE user_study_decks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  added_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, card_id)
);
```

### Phase 2: Type System Updates
**Goal**: Update TypeScript interfaces to support new functionality

#### Tasks:
1. Update Card interface with optional front/back content
2. Create UserStudyDeck interface
3. Update API response types

### Phase 3: API Development
**Goal**: Create endpoints for study deck management

#### Required Endpoints:
1. `POST /api/user-study-deck` - Add card to deck
2. `DELETE /api/user-study-deck/[cardId]` - Remove card from deck
3. `GET /api/user-study-deck` - Get user's deck
4. Update `GET /api/cards` to include deck status

### Phase 4: Card Creation UI
**Goal**: Enhance card creation with flashcard support

#### Changes:
1. Default UI shows "Front" and "Back" fields for definition/knowledge cards
2. Checkbox option for "general wisdom" format
3. Analogy cards always use single content field
4. Maintain Rivendell aesthetic

### Phase 5: Study Deck Management UI
**Goal**: Allow users to manage their personal study decks

#### Features:
1. Add/Remove buttons on each card
2. Visual indicators for cards in deck
3. Deck count display
4. Empty state handling

### Phase 6: Study Mode Enhancement
**Goal**: Update study mode for personal decks and flashcards

#### Changes:
1. Load only cards from user's personal deck
2. Flashcard flow: Front → Reveal → Back → Rate
3. Mixed card type handling
4. Progress tracking

## Technical Considerations

### Session-Based User Management
- Use session storage for user_id
- Generate unique ID per browser session
- No authentication required

### Backward Compatibility
- Cards with null front/back content treated as general wisdom
- Existing study behavior migrates gracefully
- No breaking changes to current functionality

### Performance
- Efficient queries for deck management
- Optimized loading of study cards
- Proper indexing on user_study_decks table

## UI/UX Flow

### Adding Cards to Deck
1. User browses topic cards
2. Clicks "Add to Study Deck" button
3. Card added with visual feedback
4. Deck count updates

### Creating Flashcards
1. User selects card type (definition/knowledge)
2. Sees front/back input fields by default
3. Can opt for general wisdom format
4. Submits with optional sources

### Study Session
1. User clicks "Study" (only if deck has cards)
2. Cards load from personal deck
3. Flashcards show front first
4. User reveals answer and rates understanding
5. Progress tracked with spaced repetition

## Success Metrics
- Users successfully create personal study decks
- Increased engagement with flashcard format
- Smooth migration from existing system
- No disruption to community contribution

## Risks & Mitigation
- **Risk**: Complex UI might confuse users
  - **Mitigation**: Clear defaults and progressive disclosure
- **Risk**: Performance impact with deck queries
  - **Mitigation**: Proper indexing and query optimization
- **Risk**: Breaking existing functionality
  - **Mitigation**: Thorough testing and gradual rollout

## Timeline
- Database & Types: Day 1
- API Endpoints: Day 2
- Card Creation UI: Day 3
- Deck Management: Day 4
- Study Mode Updates: Day 5
- Testing & Polish: Day 6

This plan ensures a smooth implementation of personal study decks and flashcard functionality while maintaining the collaborative spirit of Memory Garden.