-- Add sources field to cards table
-- This migration adds support for sources (URLs) on definition and knowledge cards

ALTER TABLE cards 
ADD COLUMN sources TEXT[] DEFAULT NULL;

-- Add comment for clarity
COMMENT ON COLUMN cards.sources IS 'Array of source URLs for definition and knowledge cards only';

-- Create index for cards with sources for better query performance
CREATE INDEX idx_cards_sources ON cards USING GIN (sources) WHERE sources IS NOT NULL;

-- Sample update to add sources to existing cards (optional)
-- UPDATE cards 
-- SET sources = ARRAY['https://example.com/quantum-physics', 'https://wikipedia.org/wiki/Quantum_entanglement']
-- WHERE type IN ('definition', 'knowledge') 
-- AND content ILIKE '%quantum%' 
-- AND sources IS NULL;