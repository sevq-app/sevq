-- Выполнить один раз в Supabase Dashboard -> SQL Editor (после supabase-realtime-chat.sql).
-- Добавляет никнейм и телефон в profiles + индексы для поиска контактов
-- по имени/никнейму/номеру.

alter table public.profiles add column if not exists username text;
alter table public.profiles add column if not exists phone text;

create extension if not exists pg_trgm;

create index if not exists profiles_full_name_idx on public.profiles using gin (full_name gin_trgm_ops);
create index if not exists profiles_username_idx on public.profiles using gin (username gin_trgm_ops);
create index if not exists profiles_phone_idx on public.profiles (phone);
