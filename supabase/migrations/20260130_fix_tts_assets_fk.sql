-- Fix user reference in tts_assets table
-- Previous migration referenced auth.users, but the app uses a custom public.users table

ALTER TABLE tts_assets
DROP CONSTRAINT tts_assets_curator_id_fkey;

ALTER TABLE tts_assets
ADD CONSTRAINT tts_assets_curator_id_fkey
FOREIGN KEY (curator_id)
REFERENCES public.users (id)
ON DELETE CASCADE;
