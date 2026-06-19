-- Supabase SQL Editor에서 이 파일 내용을 실행하세요.

create table if not exists rooms (
  id text primary key,
  exclude_own_team boolean not null default false,
  draw_result jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists submissions (
  id uuid primary key default gen_random_uuid(),
  room_id text not null references rooms(id) on delete cascade,
  team_id integer not null,
  text text not null,
  created_at timestamptz not null default now(),
  drawn_by_team integer
);

create index if not exists idx_submissions_room_id on submissions(room_id);

alter table rooms enable row level security;
alter table submissions enable row level security;

create policy "rooms_all" on rooms for all using (true) with check (true);
create policy "submissions_all" on submissions for all using (true) with check (true);

grant usage on schema public to anon, authenticated;
grant all on rooms to anon, authenticated;
grant all on submissions to anon, authenticated;

-- Realtime 활성화 (대시보드에서 토글 못 찾으면 이 SQL로 켜세요)
alter publication supabase_realtime add table rooms;
alter publication supabase_realtime add table submissions;

-- 테이블 만들었는데 404가 나면 SQL Editor에서 이것도 실행
notify pgrst, 'reload schema';
