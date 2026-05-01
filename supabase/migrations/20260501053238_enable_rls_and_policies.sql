alter table events enable row level security;

create policy "Public read access"
  on events
  for select
  to anon
  using (status = 'active' and is_active = true);