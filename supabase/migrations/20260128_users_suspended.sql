-- Add suspended column to users
ALTER TABLE public.users 
ADD COLUMN suspended boolean DEFAULT false;

-- Add index on suspended
CREATE INDEX idx_users_suspended ON public.users(suspended);
