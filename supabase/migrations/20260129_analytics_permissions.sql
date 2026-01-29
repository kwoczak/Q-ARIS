-- Grant permissions for analytics_events
-- Needed because RLS policies are not enough if the role doesn't have table-level privileges

grant insert, select on table analytics_events to anon;
grant insert, select on table analytics_events to authenticated;
grant insert, select on table analytics_events to service_role;
