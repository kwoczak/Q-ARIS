-- Create table for tracking TTS assets
create table if not exists tts_assets (
  id uuid default gen_random_uuid() primary key,
  curator_id uuid references auth.users not null,
  label text not null,
  text_content text not null,
  voice_name text not null,
  voice_id text not null,
  file_path text not null, -- Storage path
  public_url text not null,
  created_at timestamptz default now()
);

-- Enable RLS
alter table tts_assets enable row level security;

-- Policies
create policy "Users can view their own TTS assets"
  on tts_assets for select
  using ( auth.uid() = curator_id );

create policy "Users can insert their own TTS assets"
  on tts_assets for insert
  with check ( auth.uid() = curator_id );

create policy "Users can delete their own TTS assets"
  on tts_assets for delete
  using ( auth.uid() = curator_id );

-- Grant access to authenticated users
grant all on tts_assets to authenticated;
grant all on tts_assets to service_role;
