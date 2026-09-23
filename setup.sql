-- NEON ENGLISH v2 — Supabase setup / upgrade
-- Designed to work on a fresh project OR on the original NEON v1 project.
-- It does not drop your existing users, enrolments, orders or customised rows.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- CORE TABLES (kept compatible with the original v1 schema)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.profiles add column if not exists year_group text default 'Year 11';
alter table public.profiles add column if not exists target_grade text default '5';
alter table public.profiles add column if not exists daily_goal integer default 30;
alter table public.profiles add column if not exists exam_board text default 'AQA';
alter table public.profiles add column if not exists exam_date date;
alter table public.profiles add column if not exists bio text;
alter table public.profiles add column if not exists updated_at timestamptz not null default now();

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  focus text not null default '',
  description text not null default '',
  price numeric(8,2) not null default 0,
  duration_days integer not null default 30,
  sort_order integer not null default 0,
  payment_url text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.courses add column if not exists detail text;
alter table public.courses add column if not exists days integer;
alter table public.courses add column if not exists accent text default 'green';
alter table public.courses add column if not exists featured boolean not null default false;
alter table public.courses add column if not exists updated_at timestamptz not null default now();
update public.courses set days=coalesce(days,duration_days), detail=coalesce(detail,description) where days is null or detail is null;
alter table public.courses alter column days set default 30;

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  course_slug text not null references public.courses(slug) on update cascade on delete cascade,
  title text not null,
  lesson_type text not null default 'lesson',
  body text not null default '',
  sort_order integer not null default 0,
  free_preview boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.lessons add column if not exists lesson_key text;
alter table public.lessons add column if not exists module_title text;
alter table public.lessons add column if not exists summary text;
alter table public.lessons add column if not exists type text;
alter table public.lessons add column if not exists position integer;
alter table public.lessons add column if not exists published boolean not null default true;
update public.lessons set type=coalesce(type,lesson_type), position=coalesce(position,sort_order) where type is null or position is null;

do $$ begin
  if not exists (select 1 from pg_constraint where conname='lessons_course_lesson_key_uq') then
    begin alter table public.lessons add constraint lessons_course_lesson_key_uq unique(course_slug,lesson_key);
    exception when others then null; end;
  end if;
end $$;

create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  user_email text,
  course_slug text not null references public.courses(slug) on update cascade on delete cascade,
  starts_at timestamptz not null default now(),
  expires_at timestamptz not null,
  source text not null default 'admin',
  created_at timestamptz not null default now()
);
create unique index if not exists enrollments_user_course_uq on public.enrollments(user_id,course_slug);
alter table public.enrollments add column if not exists order_id uuid;

-- Keep the v1 progress table untouched because it stores UUID lesson ids.
create table if not exists public.progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  completed boolean not null default true,
  score numeric,
  updated_at timestamptz not null default now(),
  primary key(user_id,lesson_id)
);

-- v2 progress stores the stable static lesson key used by GitHub Pages.
create table if not exists public.learner_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id text not null,
  course_slug text,
  completed boolean not null default false,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  unique(user_id,lesson_id)
);

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id text not null,
  body text not null default '',
  updated_at timestamptz not null default now(),
  unique(user_id,lesson_id)
);
create table if not exists public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id text not null,
  course_slug text,
  created_at timestamptz not null default now(),
  unique(user_id,lesson_id)
);
create table if not exists public.activity_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null,
  icon text default '✓',
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  customer_email text,
  course_slug text references public.courses(slug) on update cascade on delete set null,
  amount numeric(8,2) not null default 0,
  currency text not null default 'GBP',
  status text not null default 'pending',
  provider text,
  provider_reference text unique,
  created_at timestamptz not null default now()
);
alter table public.orders add column if not exists email text;
alter table public.orders add column if not exists payment_provider text;
alter table public.orders add column if not exists payment_ref text;
alter table public.orders add column if not exists coupon_code text;
alter table public.orders add column if not exists updated_at timestamptz not null default now();
update public.orders set email=coalesce(email,customer_email), payment_provider=coalesce(payment_provider,provider), payment_ref=coalesce(payment_ref,provider_reference)
where email is null or payment_provider is null or payment_ref is null;

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null default '',
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  discount_percent integer not null check(discount_percent between 1 and 100),
  course_slug text references public.courses(slug) on update cascade on delete cascade,
  max_uses integer,
  used_count integer not null default 0,
  expires_at timestamptz,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create table if not exists public.site_settings (
  key text primary key,
  value jsonb,
  is_public boolean not null default false,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- AUTH / ACCESS FUNCTIONS
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  insert into public.profiles(id,email,display_name)
  values(new.id,new.email,coalesce(new.raw_user_meta_data->>'display_name',split_part(new.email,'@',1)))
  on conflict(id) do update set email=excluded.email;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert or update of email on auth.users
for each row execute function public.handle_new_user();

insert into public.profiles(id,email,display_name)
select id,email,coalesce(raw_user_meta_data->>'display_name',split_part(email,'@',1)) from auth.users
on conflict(id) do update set email=excluded.email;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path=public as $$
  select coalesce((select is_admin from public.profiles where id=auth.uid()),false);
$$;

create or replace function public.protect_profile_security_fields()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  if (new.is_admin is distinct from old.is_admin or new.email is distinct from old.email)
     and not public.is_admin() then
    raise exception 'You cannot change protected profile security fields';
  end if;
  return new;
end; $$;

drop trigger if exists protect_profile_security_fields on public.profiles;
create trigger protect_profile_security_fields
before update on public.profiles
for each row execute function public.protect_profile_security_fields();

create or replace function public.has_course_access(p_course_slug text)
returns boolean language sql stable security definer set search_path=public as $$
  select public.is_admin() or exists(
    select 1 from public.enrollments e
    where e.user_id=auth.uid() and e.course_slug=p_course_slug and e.expires_at>now()
  );
$$;

create or replace function public.grant_access_by_email(p_email text,p_course_slug text,p_days integer)
returns void language plpgsql security definer set search_path=public as $$
declare uid uuid; em text;
begin
  if not public.is_admin() then raise exception 'Admin only'; end if;
  if p_days < 1 or p_days > 3650 then raise exception 'Invalid access length'; end if;
  select id,email into uid,em from public.profiles where lower(email)=lower(p_email) limit 1;
  if uid is null then raise exception 'No account found for that email. Ask the learner to sign up first.'; end if;
  insert into public.enrollments(user_id,user_email,course_slug,starts_at,expires_at,source)
  values(uid,em,p_course_slug,now(),now()+make_interval(days=>p_days),'admin')
  on conflict(user_id,course_slug) do update set starts_at=now(),expires_at=excluded.expires_at,user_email=excluded.user_email,source='admin';
end; $$;

-- ---------------------------------------------------------------------------
-- ROW LEVEL SECURITY
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.lessons enable row level security;
alter table public.enrollments enable row level security;
alter table public.progress enable row level security;
alter table public.learner_progress enable row level security;
alter table public.notes enable row level security;
alter table public.bookmarks enable row level security;
alter table public.activity_log enable row level security;
alter table public.orders enable row level security;
alter table public.announcements enable row level security;
alter table public.coupons enable row level security;
alter table public.site_settings enable row level security;

-- Profiles
drop policy if exists profiles_self_select on public.profiles;
create policy profiles_self_select on public.profiles for select using(id=auth.uid() or public.is_admin());
drop policy if exists profiles_self_update on public.profiles;
create policy profiles_self_update on public.profiles for update using(id=auth.uid() or public.is_admin()) with check(id=auth.uid() or public.is_admin());
drop policy if exists profiles_admin_all on public.profiles;
create policy profiles_admin_all on public.profiles for all using(public.is_admin()) with check(public.is_admin());

-- Courses
drop policy if exists courses_read on public.courses;
create policy courses_read on public.courses for select using(active or public.is_admin());
drop policy if exists courses_admin on public.courses;
create policy courses_admin on public.courses for all using(public.is_admin()) with check(public.is_admin());

-- Database lesson overrides are available to course members, admins, or explicit previews.
drop policy if exists lessons_read on public.lessons;
create policy lessons_read on public.lessons for select using(free_preview or public.has_course_access(course_slug) or public.is_admin());
drop policy if exists lessons_admin on public.lessons;
create policy lessons_admin on public.lessons for all using(public.is_admin()) with check(public.is_admin());

-- Enrolments
drop policy if exists enrollments_self on public.enrollments;
create policy enrollments_self on public.enrollments for select using(user_id=auth.uid() or public.is_admin());
drop policy if exists enrollments_admin on public.enrollments;
create policy enrollments_admin on public.enrollments for all using(public.is_admin()) with check(public.is_admin());

-- Old v1 progress
drop policy if exists progress_self on public.progress;
create policy progress_self on public.progress for all using(user_id=auth.uid() or public.is_admin()) with check(user_id=auth.uid() or public.is_admin());

-- v2 progress
drop policy if exists learner_progress_self on public.learner_progress;
create policy learner_progress_self on public.learner_progress for all using(user_id=auth.uid() or public.is_admin()) with check(user_id=auth.uid() or public.is_admin());

-- Notes
drop policy if exists notes_self on public.notes;
create policy notes_self on public.notes for all using(user_id=auth.uid() or public.is_admin()) with check(user_id=auth.uid() or public.is_admin());

-- Bookmarks
drop policy if exists bookmarks_select on public.bookmarks;
create policy bookmarks_select on public.bookmarks for select using(user_id=auth.uid() or public.is_admin());
drop policy if exists bookmarks_insert on public.bookmarks;
create policy bookmarks_insert on public.bookmarks for insert with check(user_id=auth.uid() or public.is_admin());
drop policy if exists bookmarks_delete on public.bookmarks;
create policy bookmarks_delete on public.bookmarks for delete using(user_id=auth.uid() or public.is_admin());

-- Activity
drop policy if exists activity_select on public.activity_log;
create policy activity_select on public.activity_log for select using(user_id=auth.uid() or public.is_admin());
drop policy if exists activity_insert on public.activity_log;
create policy activity_insert on public.activity_log for insert with check(user_id=auth.uid() or public.is_admin());
drop policy if exists activity_admin_delete on public.activity_log;
create policy activity_admin_delete on public.activity_log for delete using(public.is_admin());

-- Orders
drop policy if exists orders_self on public.orders;
create policy orders_self on public.orders for select using(user_id=auth.uid() or public.is_admin());
drop policy if exists orders_admin on public.orders;
create policy orders_admin on public.orders for all using(public.is_admin()) with check(public.is_admin());

-- Announcements
drop policy if exists announcements_read on public.announcements;
create policy announcements_read on public.announcements for select using(active or public.is_admin());
drop policy if exists announcements_admin on public.announcements;
create policy announcements_admin on public.announcements for all using(public.is_admin()) with check(public.is_admin());

-- Coupons: browser admin only. A real checkout must validate server-side.
drop policy if exists coupons_admin on public.coupons;
create policy coupons_admin on public.coupons for all using(public.is_admin()) with check(public.is_admin());

-- Public site settings
drop policy if exists settings_read on public.site_settings;
create policy settings_read on public.site_settings for select using(is_public=true or public.is_admin());
drop policy if exists settings_admin on public.site_settings;
create policy settings_admin on public.site_settings for all using(public.is_admin()) with check(public.is_admin());

-- ---------------------------------------------------------------------------
-- COURSE SEED — follows the spreadsheet/business plan
-- ---------------------------------------------------------------------------
insert into public.courses(slug,name,focus,description,detail,price,duration_days,days,sort_order,active,featured,accent)
values
('standard','Standard','English Literature — AQA','Focused Literature revision','Focused Literature revision with essay skills, quotation recall and core exam practice.',4.99,14,14,1,true,false,'green'),
('pro','Pro','English Language — AQA','Focused Language revision','Paper 1 and Paper 2 taught through the NEON Q5 → Q1 revision route.',5.99,21,21,2,true,false,'purple'),
('plus','Plus','Literature + Language essentials','A bit of both','A balanced mix of both GCSE English subjects.',7.99,30,30,3,true,false,'cyan'),
('premium','Premium','Literature + Language','Both in smaller detail','Both subjects in shorter, digestible lessons with longer access.',9.99,60,60,4,true,false,'orange'),
('plus-premium','Plus-Premium','Full Literature + Language','All detail + games','The complete library with detailed lessons, all games, planners and extras.',14.99,180,180,5,true,true,'green')
on conflict(slug) do update set
name=excluded.name,focus=excluded.focus,description=excluded.description,detail=excluded.detail,
price=excluded.price,duration_days=excluded.duration_days,days=excluded.days,
sort_order=excluded.sort_order,active=excluded.active,featured=excluded.featured,accent=excluded.accent,updated_at=now();

insert into public.site_settings(key,value,is_public) values
('homepage_notice',to_jsonb(''::text),true),
('signups_enabled','true'::jsonb,true),
('maintenance_mode','false'::jsonb,true)
on conflict(key) do nothing;

-- AFTER you have signed up with the owner email, make that account the admin:
-- update public.profiles set is_admin=true where lower(email)=lower('YOUR-EMAIL@example.com');
