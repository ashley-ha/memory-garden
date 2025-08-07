-- Migration to add author_id and author_name to topics table

-- Add author_id column to topics table
ALTER TABLE topics ADD COLUMN author_id TEXT;

-- Add author_name column to topics table  
ALTER TABLE topics ADD COLUMN author_name TEXT;

-- Update existing topics to have null author_id (making them unowned)
UPDATE topics SET author_id = NULL WHERE author_id IS NULL;