-- Выполнить один раз в Supabase Dashboard -> SQL Editor.
-- Добавляет таблицы, нужные для реальной переписки между зарегистрированными
-- пользователями (profiles/chats/chat_members/messages) + RLS + Realtime.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  full_name text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by authenticated users"
  on public.profiles for select
  to authenticated
  using (true);

create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

-- Автоматически создаёт запись в profiles при регистрации нового пользователя
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Разово заполнить profiles для уже существующих пользователей (в т.ч. Ульяны)
insert into public.profiles (id, email, full_name)
select id, email, raw_user_meta_data->>'full_name'
from auth.users
on conflict (id) do nothing;

create table if not exists public.chats (
  id uuid primary key default gen_random_uuid(),
  is_group boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.chats enable row level security;

create table if not exists public.chat_members (
  chat_id uuid not null references public.chats(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  primary key (chat_id, user_id)
);

alter table public.chat_members enable row level security;

create policy "Members can view their chats"
  on public.chats for select
  to authenticated
  using (exists (select 1 from public.chat_members cm where cm.chat_id = id and cm.user_id = auth.uid()));

create policy "Users can create chats"
  on public.chats for insert
  to authenticated
  with check (true);

create policy "Members can view chat membership"
  on public.chat_members for select
  to authenticated
  using (exists (select 1 from public.chat_members cm2 where cm2.chat_id = chat_members.chat_id and cm2.user_id = auth.uid()));

create policy "Users can add chat members"
  on public.chat_members for insert
  to authenticated
  with check (true);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null references public.chats(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  text text not null,
  created_at timestamptz not null default now()
);

alter table public.messages enable row level security;

create policy "Members can read messages"
  on public.messages for select
  to authenticated
  using (exists (select 1 from public.chat_members cm where cm.chat_id = messages.chat_id and cm.user_id = auth.uid()));

create policy "Members can send messages"
  on public.messages for insert
  to authenticated
  with check (
    sender_id = auth.uid()
    and exists (select 1 from public.chat_members cm where cm.chat_id = messages.chat_id and cm.user_id = auth.uid())
  );

-- Включаем Realtime для мгновенной доставки новых сообщений
alter publication supabase_realtime add table public.messages;
