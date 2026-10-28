-- user_todos 表（原 todos 已被占用，换名）
create table if not exists public.user_todos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  text text not null,
  done boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.user_todos enable row level security;

drop policy if exists "user_todos_select_own" on public.user_todos;
create policy "user_todos_select_own" on public.user_todos
  for select using (auth.uid() = user_id);

drop policy if exists "user_todos_insert_own" on public.user_todos;
create policy "user_todos_insert_own" on public.user_todos
  for insert with check (auth.uid() = user_id);

drop policy if exists "user_todos_update_own" on public.user_todos;
create policy "user_todos_update_own" on public.user_todos
  for update using (auth.uid() = user_id);

drop policy if exists "user_todos_delete_own" on public.user_todos;
create policy "user_todos_delete_own" on public.user_todos
  for delete using (auth.uid() = user_id);

-- blogs 表
create table if not exists public.blogs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  content text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.blogs enable row level security;

drop policy if exists "blogs_select_own" on public.blogs;
create policy "blogs_select_own" on public.blogs
  for select using (auth.uid() = user_id);

drop policy if exists "blogs_insert_own" on public.blogs;
create policy "blogs_insert_own" on public.blogs
  for insert with check (auth.uid() = user_id);

drop policy if exists "blogs_update_own" on public.blogs;
create policy "blogs_update_own" on public.blogs
  for update using (auth.uid() = user_id);

drop policy if exists "blogs_delete_own" on public.blogs;
create policy "blogs_delete_own" on public.blogs
  for delete using (auth.uid() = user_id);