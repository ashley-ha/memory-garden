-- Migration to add 'knowledge' card type
-- Run this in your Supabase SQL editor to update existing database

-- Drop the existing check constraint
ALTER TABLE cards DROP CONSTRAINT IF EXISTS cards_type_check;

-- Add the new check constraint that includes 'knowledge'
ALTER TABLE cards ADD CONSTRAINT cards_type_check CHECK (type IN ('analogy', 'definition', 'knowledge'));

-- Add a sample knowledge card for testing
INSERT INTO cards (topic_id, type, content, author_name) VALUES
  ((SELECT id FROM topics WHERE title = 'Quantum Entanglement'), 'knowledge', 'Quantum entanglement has practical applications in quantum computing and cryptography. Scientists have successfully demonstrated entanglement over distances of hundreds of kilometers using fiber optic cables.', 'Dr. Chen');