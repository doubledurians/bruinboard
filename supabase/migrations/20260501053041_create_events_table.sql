create table events (
  id                uuid primary key default gen_random_uuid(),
  title             text not null,
  description       text,
  start_datetime    timestamptz not null,
  end_datetime      timestamptz,
  location          text,
  url               text,
  ticket_url        text,
  price             text,
  category          text check (category in ('academic','popup','fun')),
  source            text check (source in ('burkle','cap_ucla','library')),
  image_url         text,
  is_active         boolean default true,
  scraped_at        timestamptz default now(),
  recurrence_rule   text,
  status            text default 'active' check (status in ('active','pending','rejected')),
  submitted_by      text
);

create index on events (start_datetime);
create index on events (source);
create index on events (category);