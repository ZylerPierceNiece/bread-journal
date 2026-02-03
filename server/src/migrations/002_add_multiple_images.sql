-- Migration to support multiple images per bread post
-- Add images column as JSONB array
ALTER TABLE breads ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]';

-- Migrate existing image_url data to images array
UPDATE breads
SET images = jsonb_build_array(jsonb_build_object('url', image_url, 'order', 0))
WHERE images = '[]' AND image_url IS NOT NULL;

-- Make image_url nullable since we're moving to images array
ALTER TABLE breads ALTER COLUMN image_url DROP NOT NULL;
