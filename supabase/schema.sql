-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- STORIES TABLE
create table public.stories (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- STAGES TABLE
-- 'content' is a flexible JSONB field for text, images, auto_audio, etc.
create type stage_type as enum ('content', 'ar_model', 'quiz', 'ending');

create table public.stages (
  id uuid primary key default uuid_generate_v4(),
  story_id uuid references public.stories(id) on delete cascade not null,
  title text not null, -- Internal name for the graph node
  type stage_type default 'content',
  content jsonb default '{}'::jsonb,
  position_x float default 0,
  position_y float default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- TRIGGERS TABLE
-- Links a QR code hash to a specific stage
create type trigger_type as enum ('start', 'checkpoint');

create table public.triggers (
  id uuid primary key default uuid_generate_v4(),
  code text unique not null,
  story_id uuid references public.stories(id) on delete cascade not null,
  target_stage_id uuid references public.stages(id) on delete cascade not null,
  type trigger_type default 'checkpoint',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- STORAGE BUCKETS (Simulated policy for setup)
-- In Supabase dashboard: Create a bucket named 'assets'
-- Policy: Public Read, Auth Insert/Update
