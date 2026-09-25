-- Выполнить в Supabase Dashboard -> SQL Editor.
-- Идемпотентно: безопасно запускать повторно (например, если не уверены,
-- применился ли скрипт раньше целиком, или чат всё равно не создаётся/не
-- открывается) — таблицы создаются через IF NOT EXISTS, политики
-- пересоздаются через DROP POLICY IF EXISTS + CREATE POLICY.
-- Добавляет таблицы, нужные для реальной переписки между зарегистрированными
-- пользователями (profiles/chats/chat_members/messages) + RLS + Realtime.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  full_name text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Явно переименовано в profiles_select_all/profiles_insert_own/profiles_update_own —
-- удаляем старые имена, иначе после запуска этого блока на базе останутся сразу
-- и старые, и новые политики (Postgres допускает несколько политик с разными
-- именами одновременно, они комбинируются через OR).
drop policy if exists "Profiles are viewable by authenticated users" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;

drop policy if exists "profiles_select_all" on public.profiles;
create policy "profiles_select_all"
  on public.profiles for select
  to authenticated
  using (true);

-- Без этой политики upsertMyProfile() падает с 42501 (new row violates row-level
-- security policy): у profiles не было policy для INSERT, а upsert выполняет
-- INSERT ... ON CONFLICT DO UPDATE, для которого нужны права именно на INSERT.
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

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

-- ВАЖНО: политики для chats/chat_members/messages используют функцию is_chat_member
-- с SECURITY DEFINER. Это сделано специально, чтобы избежать бесконечной рекурсии RLS.
-- НЕ упрощайте эти политики обратно до прямых SELECT из chat_members внутри политики —
-- это сломает все чаты (ошибка 42P17, infinite recursion).
--
-- Раньше SELECT-политика на chat_members сама проверяла членство подзапросом К ТОЙ ЖЕ
-- chat_members ("Members can view chat membership" ниже была удалена) — при выполнении
-- этого подзапроса Postgres заново применяет RLS к chat_members, и получается
-- бесконечная рекурсия: "infinite recursion detected in policy for relation
-- chat_members". Разрывает цикл SECURITY DEFINER-функция: она выполняется от имени
-- владельца (в Supabase Dashboard SQL Editor это обычно роль с BYPASSRLS), поэтому её
-- внутренний запрос к chat_members НЕ проходит через RLS заново.
create or replace function public.is_chat_member(p_chat_id uuid, p_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.chat_members
    where chat_id = p_chat_id and user_id = p_user_id
  );
$$;

grant execute on function public.is_chat_member(uuid, uuid) to authenticated;

-- Старые политики (в т.ч. рекурсивная) удаляем явно по именам: при повторном запуске
-- этого скрипта их не заменили бы автоматически — Postgres допускает несколько политик
-- с разными именами одновременно, и старая рекурсивная политика продолжала бы ломать
-- чаты, даже когда рядом с ней уже появилась новая безопасная.
drop policy if exists "Members can view their chats" on public.chats;
drop policy if exists "Users can create chats" on public.chats;
drop policy if exists "Members can view chat membership" on public.chat_members;
drop policy if exists "Users can add chat members" on public.chat_members;

drop policy if exists "chat_members_select_members" on public.chat_members;
create policy "chat_members_select_members"
  on public.chat_members for select
  to authenticated
  using ( public.is_chat_member(chat_id, auth.uid()) );

drop policy if exists "chat_members_insert_auth" on public.chat_members;
create policy "chat_members_insert_auth"
  on public.chat_members for insert
  to authenticated
  with check ( auth.uid() is not null );

drop policy if exists "chats_select_members" on public.chats;
create policy "chats_select_members"
  on public.chats for select
  to authenticated
  using ( public.is_chat_member(id, auth.uid()) );

drop policy if exists "chats_insert_auth" on public.chats;
create policy "chats_insert_auth"
  on public.chats for insert
  to authenticated
  with check ( auth.uid() is not null );

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null references public.chats(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  text text not null,
  created_at timestamptz not null default now()
);

alter table public.messages enable row level security;

drop policy if exists "Members can read messages" on public.messages;
drop policy if exists "Members can send messages" on public.messages;

drop policy if exists "messages_select_members" on public.messages;
create policy "messages_select_members"
  on public.messages for select
  to authenticated
  using ( public.is_chat_member(chat_id, auth.uid()) );

drop policy if exists "messages_insert_members" on public.messages;
create policy "messages_insert_members"
  on public.messages for insert
  to authenticated
  with check (
    -- sender_id = auth.uid() добавлен сверх присланного шаблона: без него любой участник
    -- чата мог бы вставить сообщение с чужим sender_id (выдать его за другого участника).
    -- Рекурсию это условие не создаёт — это обычное сравнение, без обращения к chat_members.
    sender_id = auth.uid()
    and public.is_chat_member(chat_id, auth.uid())
  );

-- Редактирование сообщений: время правки хранится отдельно от created_at (времени
-- отправки), чтобы подпись "изменено" в UI показывала момент правки, а не отправки.
alter table public.messages add column if not exists edited_at timestamptz;

-- Без этой политики UPDATE вообще запрещён RLS (deny by default) — редактирование
-- падало бы так же, как раньше падало INSERT в chats без policy. sender_id = auth.uid()
-- и в using, и в with_check — редактировать можно только свои сообщения, и нельзя
-- перезаписать sender_id чужим при апдейте.
drop policy if exists "messages_update_own" on public.messages;
create policy "messages_update_own"
  on public.messages for update
  to authenticated
  using ( sender_id = auth.uid() )
  with check ( sender_id = auth.uid() );

-- Удаление сообщений: обычный DELETE (не soft-delete), ограничен своими сообщениями
-- и в клиентском коде (.eq('sender_id', myId)), и здесь на уровне RLS.
drop policy if exists "messages_delete_own" on public.messages;
create policy "messages_delete_own"
  on public.messages for delete
  to authenticated
  using ( sender_id = auth.uid() );

-- По умолчанию Postgres кладёт в DELETE-событие Realtime только первичный ключ
-- (id) — этого недостаточно, чтобы подписка отфильтровала событие по
-- chat_id=eq.<chatId> (фильтр просто не сработает, и удаление не долетит до
-- собеседника). REPLICA IDENTITY FULL заставляет класть в событие всю
-- удаляемую строку целиком.
alter table public.messages replica identity full;

-- Ответы на сообщения: reply_to_id — id сообщения, на которое отвечают.
-- on delete set null — если оригинал удалят, ссылка у ответа просто обнулится
-- (сам ответ и его текст никуда не денутся); цитата на клиенте всё равно
-- рендерится по собственному сохранённому снимку (текст+автор), а не через
-- live join на этот столбец.
alter table public.messages add column if not exists reply_to_id uuid references public.messages(id) on delete set null;

-- Включаем Realtime для мгновенной доставки новых сообщений (идемпотентно —
-- ALTER PUBLICATION ... ADD TABLE падает с ошибкой, если таблица уже добавлена)
do $$
begin
  alter publication supabase_realtime add table public.messages;
exception
  when duplicate_object then null;
end $$;

-- Username: код приложения (messagingService.ts) уже читает/пишет profiles.username
-- и profiles.phone, но этот скрипт раньше их не создавал — добавляем идемпотентно
-- на случай, если колонок ещё нет.
alter table public.profiles add column if not exists username text;
alter table public.profiles add column if not exists phone text;

-- Уникальность + формат username (латиница/цифры/_, 5-32 символа, регистронезависимо).
-- Пустой (ещё не заданный) username разрешён — его заполняют позже в "Информации о себе".
-- Сначала чистим уже сохранённые значения, которые не пройдут новые правила, —
-- иначе ALTER TABLE ADD CONSTRAINT / CREATE UNIQUE INDEX упадут на существующих данных.
update public.profiles set username = null
where username is not null and username !~ '^[A-Za-z0-9_]{5,32}$';

-- При регистронезависимых дублях оставляем более раннюю запись (по id), у остальных обнуляем.
update public.profiles p set username = null
where username is not null
  and exists (
    select 1 from public.profiles p2
    where p2.id < p.id and lower(p2.username) = lower(p.username)
  );

alter table public.profiles drop constraint if exists profiles_username_format;
alter table public.profiles add constraint profiles_username_format
  check (username is null or username ~ '^[A-Za-z0-9_]{5,32}$');

create unique index if not exists profiles_username_unique_idx
  on public.profiles (lower(username))
  where username is not null;

-- Аватарка: раньше хранилась только в localStorage браузера, поэтому не переживала переход
-- на другое устройство. Теперь ссылка на файл в Supabase Storage хранится в profiles.avatar_url.
alter table public.profiles add column if not exists avatar_url text;

-- Бакет для аватарок — публичный на чтение (как у Telegram/GitHub: маленькая аватарка сама
-- по себе не секрет, а публичный бакет позволяет отдавать её напрямую по URL в <img>, без
-- лишней прослойки на подписанные ссылки). Запись — только в свою же папку {user_id}/...
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists "Avatars are publicly readable" on storage.objects;
create policy "Avatars are publicly readable"
  on storage.objects for select
  using (bucket_id = 'avatars');

drop policy if exists "Users can upload their own avatar" on storage.objects;
create policy "Users can upload their own avatar"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Users can update their own avatar" on storage.objects;
create policy "Users can update their own avatar"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Users can delete their own avatar" on storage.objects;
create policy "Users can delete their own avatar"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- Галерея "Фотографии": раньше тоже хранилась только в localStorage. public.photos — список
-- фото пользователя (по одной строке на файл), сами файлы — в бакете photos.
create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  path text not null,
  url text not null,
  created_at timestamptz not null default now()
);

alter table public.photos enable row level security;

drop policy if exists "Users can view own photos" on public.photos;
create policy "Users can view own photos"
  on public.photos for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "Users can insert own photos" on public.photos;
create policy "Users can insert own photos"
  on public.photos for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "Users can delete own photos" on public.photos;
create policy "Users can delete own photos"
  on public.photos for delete
  to authenticated
  using (user_id = auth.uid());

-- Бакет для самих файлов галереи — тот же прагматичный выбор, что и для avatars выше:
-- публичный на чтение (путь содержит случайный UUID — угадать чужую ссылку по факту
-- невозможно), без чего пришлось бы подписывать каждую ссылку отдельно и продлевать их
-- по истечении срока. Запись/удаление — только в свою же папку {user_id}/...
insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do nothing;

drop policy if exists "Photos are publicly readable" on storage.objects;
create policy "Photos are publicly readable"
  on storage.objects for select
  using (bucket_id = 'photos');

drop policy if exists "Users can upload their own photos" on storage.objects;
create policy "Users can upload their own photos"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Users can delete their own photos" on storage.objects;
create policy "Users can delete their own photos"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text);

-- ПРОВЕРКА: выполните отдельно после миграции, чтобы своими глазами увидеть
-- итоговый список политик на этих трёх таблицах.
-- select schemaname, tablename, policyname, cmd, qual, with_check
-- from pg_policies
-- where schemaname = 'public' and tablename in ('chats', 'chat_members', 'messages')
-- order by tablename, cmd;
