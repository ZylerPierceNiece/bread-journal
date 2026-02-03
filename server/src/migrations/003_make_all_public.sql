-- Migration to make all bread posts public
-- Update all existing posts to be public
UPDATE breads SET privacy = 'public' WHERE privacy != 'public';

-- Set default to public for new posts
ALTER TABLE breads ALTER COLUMN privacy SET DEFAULT 'public';
