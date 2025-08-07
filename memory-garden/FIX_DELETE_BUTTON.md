# Fix for Delete Button Not Showing

## The Issue
The delete button (X) is not showing on topic cards because the database schema is missing the `author_id` column in the topics table.

## Root Cause
The original database schema (`lib/database-schema.sql`) doesn't include `author_id` and `author_name` columns in the topics table, but the application code expects these fields to exist for delete permission checks.

## Solution
Run these SQL migrations in your Supabase SQL editor:

### 1. Add author columns to topics table:
```sql
-- Add author_id column to topics table
ALTER TABLE topics ADD COLUMN author_id TEXT;

-- Add author_name column to topics table  
ALTER TABLE topics ADD COLUMN author_name TEXT;
```

### 2. Add author_id to cards table:
```sql
-- Add author_id column to cards table
ALTER TABLE cards ADD COLUMN author_id TEXT;
```

## Verification Steps
1. After running the migrations, create a new topic
2. The topic should now have your session ID as the `author_id`
3. The delete button (X) should appear when hovering over topics you created
4. You should be able to delete only topics you created

## How It Works
- When you create a topic, it saves your session ID as the `author_id`
- The TopicCard component checks if the current session ID matches the topic's `author_id`
- If they match, the delete button (X) is shown on hover
- The API also verifies ownership before allowing deletion

## Note
Topics created before this migration will have `author_id = NULL` and won't be deletable by anyone. You can manually update these in the database if needed.