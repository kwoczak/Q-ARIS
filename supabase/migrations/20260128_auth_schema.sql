-- Create User Roles Enum
CREATE TYPE user_role AS ENUM ('admin', 'museum', 'curator');

-- Create Users Table
CREATE TABLE public.users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  username text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  role user_role NOT NULL,
  created_by uuid REFERENCES public.users(id), -- Who created this user
  museum_id uuid REFERENCES public.users(id), -- If curator, which museum they belong to
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Licenses Table (for Museums)
CREATE TABLE public.licenses (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  museum_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  max_seats int NOT NULL DEFAULT 1,
  expires_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add Curator to Stories
ALTER TABLE public.stories 
ADD COLUMN curator_id uuid REFERENCES public.users(id);

-- Create index for performance
CREATE INDEX idx_users_username ON public.users(username);
CREATE INDEX idx_users_museum_id ON public.users(museum_id);
CREATE INDEX idx_stories_curator_id ON public.stories(curator_id);
