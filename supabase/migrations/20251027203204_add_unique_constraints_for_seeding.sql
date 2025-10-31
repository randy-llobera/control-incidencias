-- Idempotent seeding needs conflict targets:
--  - one row per group name
--  - one row per category name
--  - one student name per group

alter table public.groups
  add constraint groups_name_key unique (name);

alter table public.categories
  add constraint categories_name_key unique (name);

alter table public.students
  add constraint students_name_group_key unique (name, group_id);