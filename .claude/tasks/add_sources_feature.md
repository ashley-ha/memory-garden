# Add Sources Feature to Memory Garden Cards

## Overview
Allow users to add sources (links) to their scroll cards (knowledge/definition cards only, not analogies). Users can paste one or multiple links when creating cards, and other users can view these sources by clicking "View Sources" on the card.

## Implementation Plan

### 1. Database Schema Update
- Add `sources` field to `cards` table as TEXT[] or JSON array to store multiple URLs
- Only applicable for card types: "definition" and "knowledge" (not "analogy")

### 2. UI/UX Changes
- **Card Creation Form**: Add optional "Sources" input field
  - Show only for definition/knowledge cards
  - Allow multiple URLs (textarea or multiple input fields)
  - Validate URLs format
  
- **Card Display**: Add "View Sources" button/link
  - Only show if card has sources
  - Clicking opens modal or dropdown with clickable links
  - Style to match Rivendell aesthetic

### 3. Technical Implementation
- Update card creation API to handle sources data
- Modify card components to display sources option
- Create sources modal/display component
- Add URL validation helpers

### 4. User Flow
1. User creates knowledge/definition card
2. Optionally adds sources in textarea (one URL per line)
3. Card is saved with sources array
4. When viewing card, "View Sources" appears if sources exist
5. Clicking shows modal with clickable source links

## Reasoning
- Sources add credibility to knowledge cards
- Helps learners find additional information
- Only relevant for factual content (not creative analogies)
- Keeps interface clean by hiding sources behind click action

## Tasks Breakdown
- [ ] Research current schema and card creation system
- [ ] Update database schema for sources field
- [ ] Modify card creation form UI
- [ ] Update card display components
- [ ] Implement sources viewing modal
- [ ] Update API routes
- [ ] Test complete workflow