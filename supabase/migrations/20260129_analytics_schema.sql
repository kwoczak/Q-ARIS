-- Analytics Events Table
create table if not exists analytics_events (
  id uuid default gen_random_uuid() primary key,
  story_id uuid references stories(id) on delete cascade not null,
  stage_id uuid references stages(id) on delete set null,
  event_type text not null, -- 'stage_view', 'interaction', etc.
  visitor_session_id text not null, -- Anonymized session ID from local storage
  metadata jsonb default '{}'::jsonb, -- Flexible field for extra data (e.g. choice made, duration)
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes for performance
create index if not exists idx_analytics_story_id on analytics_events(story_id);
create index if not exists idx_analytics_created_at on analytics_events(created_at);

-- RLS Policies
alter table analytics_events enable row level security;

-- Allow anyone (visitors) to insert events
create policy "Anyone can insert analytics events"
  on analytics_events for insert
  with check (true);

-- Allow curators to view analytics for their own stories
create policy "Curators can view analytics for their stories"
  on analytics_events for select
  using (
    exists (
      select 1 from stories
      where stories.id = analytics_events.story_id
      and stories.curator_id = auth.uid()
    )
  );

-- Allow admins to view all analytics
create policy "Admins can view all analytics"
  on analytics_events for select
  using (
    exists (
    exists (
      select 1 from users
      where users.id = auth.uid()
      and users.role in ('admin', 'museum')
    )
  );
