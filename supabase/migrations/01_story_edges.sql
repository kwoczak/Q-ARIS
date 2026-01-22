-- STORY EDGES TABLE
-- Stores purely visual/logical connections between stages in the graph editor
create table public.story_edges (
  id uuid primary key default uuid_generate_v4(),
  story_id uuid references public.stories(id) on delete cascade not null,
  source_stage_id uuid references public.stages(id) on delete cascade not null,
  target_stage_id uuid references public.stages(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
