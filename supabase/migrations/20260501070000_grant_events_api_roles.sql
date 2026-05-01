grant usage on schema public to anon, authenticated, service_role;

grant select on public.events to anon;
grant select, insert, update on public.events to service_role;
