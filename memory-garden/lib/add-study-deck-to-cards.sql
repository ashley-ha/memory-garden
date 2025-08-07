-- Add in_study_deck field to cards table
-- This migration adds support for selective card study

ALTER TABLE cards 
ADD COLUMN in_study_deck BOOLEAN DEFAULT true;

-- Add comment for clarity
COMMENT ON COLUMN cards.in_study_deck IS 'Whether this card is included in the study deck';

-- Create index for cards in study deck for better query performance
CREATE INDEX idx_cards_in_study_deck ON cards (in_study_deck) WHERE in_study_deck = true;

-- Update existing cards to be in study deck by default
UPDATE cards SET in_study_deck = true WHERE in_study_deck IS NULL;