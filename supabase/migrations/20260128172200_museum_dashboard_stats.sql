-- Create a view for Museum Dashboard Statistics
CREATE OR REPLACE VIEW public.museum_dashboard_stats AS
SELECT 
    m.id,
    m.username,
    m.suspended,
    m.created_at,
    l.id as license_id,
    l.max_seats,
    l.expires_at,
    -- Count curators (seats used)
    COALESCE((
        SELECT count(*) 
        FROM public.users u 
        WHERE u.museum_id = m.id AND u.role = 'curator'
    ), 0) as seats_used,
    -- Count stories (via curators)
    COALESCE((
        SELECT count(*) 
        FROM public.stories s 
        JOIN public.users u ON s.curator_id = u.id 
        WHERE u.museum_id = m.id
    ), 0) as total_stories,
    -- Count nodes/stages (via stories via curators)
    COALESCE((
        SELECT count(*) 
        FROM public.stages st 
        JOIN public.stories s ON st.story_id = s.id 
        JOIN public.users u ON s.curator_id = u.id 
        WHERE u.museum_id = m.id
    ), 0) as total_nodes
FROM public.users m
LEFT JOIN public.licenses l ON l.museum_id = m.id
WHERE m.role = 'museum';
