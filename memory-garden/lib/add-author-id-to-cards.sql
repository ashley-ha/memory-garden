-- Migration to add author_id to cards table

-- Add author_id column to cards table
ALTER TABLE cards ADD COLUMN author_id TEXT;