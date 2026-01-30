-- Add supported_languages column to stories table
ALTER TABLE stories 
ADD COLUMN IF NOT EXISTS supported_languages text[] DEFAULT ARRAY['en'];

-- Add default_language column to stories table
ALTER TABLE stories
ADD COLUMN IF NOT EXISTS default_language text DEFAULT 'en';
