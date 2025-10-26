create sequence "public"."debug_logs_id_seq";

create table "public"."categories" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "created_by" uuid not null,
    "created_at" timestamp with time zone default now()
);


alter table "public"."categories" enable row level security;

create table "public"."debug_logs" (
    "id" integer not null default nextval('debug_logs_id_seq'::regclass),
    "message" text,
    "created_at" timestamp with time zone default now()
);


create table "public"."groups" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "created_by" uuid not null,
    "created_at" timestamp with time zone default now()
);


alter table "public"."groups" enable row level security;

create table "public"."incidents" (
    "id" uuid not null default gen_random_uuid(),
    "student_id" uuid not null,
    "category_id" uuid not null,
    "severity" text not null,
    "description" text not null,
    "date" date not null,
    "teacher_id" uuid not null,
    "created_at" timestamp with time zone default now()
);


alter table "public"."incidents" enable row level security;

create table "public"."roles" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "created_at" timestamp with time zone default now()
);


create table "public"."students" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "group_id" uuid not null,
    "created_at" timestamp with time zone default now()
);


alter table "public"."students" enable row level security;

create table "public"."users" (
    "id" uuid not null,
    "role_id" uuid not null,
    "display_name" text not null,
    "school_role" text not null,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."users" enable row level security;

alter sequence "public"."debug_logs_id_seq" owned by "public"."debug_logs"."id";

CREATE UNIQUE INDEX categories_pkey ON public.categories USING btree (id);

CREATE UNIQUE INDEX debug_logs_pkey ON public.debug_logs USING btree (id);

CREATE UNIQUE INDEX groups_pkey ON public.groups USING btree (id);

CREATE UNIQUE INDEX incidents_pkey ON public.incidents USING btree (id);

CREATE UNIQUE INDEX roles_name_key ON public.roles USING btree (name);

CREATE UNIQUE INDEX roles_pkey ON public.roles USING btree (id);

CREATE UNIQUE INDEX students_pkey ON public.students USING btree (id);

CREATE UNIQUE INDEX users_pkey ON public.users USING btree (id);

alter table "public"."categories" add constraint "categories_pkey" PRIMARY KEY using index "categories_pkey";

alter table "public"."debug_logs" add constraint "debug_logs_pkey" PRIMARY KEY using index "debug_logs_pkey";

alter table "public"."groups" add constraint "groups_pkey" PRIMARY KEY using index "groups_pkey";

alter table "public"."incidents" add constraint "incidents_pkey" PRIMARY KEY using index "incidents_pkey";

alter table "public"."roles" add constraint "roles_pkey" PRIMARY KEY using index "roles_pkey";

alter table "public"."students" add constraint "students_pkey" PRIMARY KEY using index "students_pkey";

alter table "public"."users" add constraint "users_pkey" PRIMARY KEY using index "users_pkey";

alter table "public"."categories" add constraint "categories_created_by_fkey" FOREIGN KEY (created_by) REFERENCES users(id) not valid;

alter table "public"."categories" validate constraint "categories_created_by_fkey";

alter table "public"."groups" add constraint "groups_created_by_fkey" FOREIGN KEY (created_by) REFERENCES users(id) not valid;

alter table "public"."groups" validate constraint "groups_created_by_fkey";

alter table "public"."incidents" add constraint "incidents_category_id_fkey" FOREIGN KEY (category_id) REFERENCES categories(id) not valid;

alter table "public"."incidents" validate constraint "incidents_category_id_fkey";

alter table "public"."incidents" add constraint "incidents_severity_check" CHECK ((severity = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text]))) not valid;

alter table "public"."incidents" validate constraint "incidents_severity_check";

alter table "public"."incidents" add constraint "incidents_student_id_fkey" FOREIGN KEY (student_id) REFERENCES students(id) not valid;

alter table "public"."incidents" validate constraint "incidents_student_id_fkey";

alter table "public"."incidents" add constraint "incidents_teacher_id_fkey" FOREIGN KEY (teacher_id) REFERENCES users(id) not valid;

alter table "public"."incidents" validate constraint "incidents_teacher_id_fkey";

alter table "public"."roles" add constraint "roles_name_check" CHECK ((name = ANY (ARRAY['admin'::text, 'coordinator'::text, 'teacher'::text]))) not valid;

alter table "public"."roles" validate constraint "roles_name_check";

alter table "public"."roles" add constraint "roles_name_key" UNIQUE using index "roles_name_key";

alter table "public"."students" add constraint "students_group_id_fkey" FOREIGN KEY (group_id) REFERENCES groups(id) not valid;

alter table "public"."students" validate constraint "students_group_id_fkey";

alter table "public"."users" add constraint "users_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."users" validate constraint "users_id_fkey";

alter table "public"."users" add constraint "users_role_id_fkey" FOREIGN KEY (role_id) REFERENCES roles(id) not valid;

alter table "public"."users" validate constraint "users_role_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  teacher_role_id UUID;
BEGIN
  -- Get the teacher role ID
  SELECT id INTO teacher_role_id FROM public.roles WHERE name = 'teacher' LIMIT 1;
  
  -- Insert user with teacher role as default
  INSERT INTO public.users (id, role_id, display_name, school_role)
  VALUES (NEW.id, teacher_role_id, NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'school_role');
  RETURN NEW;
END;
$function$
;

create policy "Coordinators and admins can manage categories"
on "public"."categories"
as permissive
for all
to public
using ((EXISTS ( SELECT 1
   FROM users
  WHERE ((users.id = auth.uid()) AND (users.role_id IN ( SELECT roles.id
           FROM roles
          WHERE (roles.name = ANY (ARRAY['coordinator'::text, 'admin'::text]))))))));


create policy "Teachers can view all categories"
on "public"."categories"
as permissive
for select
to public
using (true);


create policy "Coordinators and admins can manage groups"
on "public"."groups"
as permissive
for all
to public
using ((EXISTS ( SELECT 1
   FROM users
  WHERE ((users.id = auth.uid()) AND (users.role_id IN ( SELECT roles.id
           FROM roles
          WHERE (roles.name = ANY (ARRAY['coordinator'::text, 'admin'::text]))))))));


create policy "Teachers can view all groups"
on "public"."groups"
as permissive
for select
to public
using (true);


create policy "Teachers can manage incidents"
on "public"."incidents"
as permissive
for all
to public
using (true);


create policy "Teachers can manage students"
on "public"."students"
as permissive
for all
to public
using (true);


create policy "Admins can delete users"
on "public"."users"
as permissive
for delete
to public
using (is_admin());


create policy "Admins can insert users"
on "public"."users"
as permissive
for insert
to public
with check (is_admin());


create policy "Admins can update users"
on "public"."users"
as permissive
for update
to public
using (is_admin());


create policy "Admins can view all users"
on "public"."users"
as permissive
for select
to public
using (is_admin());


create policy "Users can view self"
on "public"."users"
as permissive
for select
to public
using ((id = auth.uid()));



