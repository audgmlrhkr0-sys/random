-- 이미 테이블을 만든 경우 SQL Editor에서 이것만 실행하세요.
alter table rooms add column if not exists team_names jsonb
  default '["1팀","2팀","3팀","4팀","5팀"]'::jsonb;

update rooms set team_names = '["1팀","2팀","3팀","4팀","5팀"]'::jsonb
  where team_names is null;
