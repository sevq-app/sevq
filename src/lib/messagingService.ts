// Реальный обмен сообщениями между зарегистрированными пользователями.
// Вся работа с бэкендом (сейчас — Supabase: таблицы profiles/chats/chat_members/messages
// + Realtime) спрятана за этими функциями, чтобы при смене бэкенда экраны
// (Chats.tsx, Conversation.tsx) менять не пришлось — только реализацию здесь.

import { supabase } from '@/lib/supabase';

export interface RemoteProfile {
  id: string;
  email: string;
  full_name: string | null;
  username: string | null;
  phone: string | null;
}

/**
 * Имя для отображения: full_name → username → email → заглушка "Пользователь".
 * username сейчас NULL почти у всех (заполняется позже в "О себе"), так что
 * full_name всегда проверяется первым — эта функция не должна падать и не
 * должна оставлять чат безымянным, даже если все поля профиля пустые.
 */
export function displayNameOf(profile: Pick<RemoteProfile, 'full_name' | 'username' | 'email'>): string {
  return profile.full_name?.trim() || profile.username?.trim() || profile.email?.trim() || 'Пользователь';
}

/** Инициалы для аватарки-заглушки — первая буква первых двух слов имени. */
export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export interface RemoteMessage {
  id: string;
  chat_id: string;
  sender_id: string;
  text: string;
  created_at: string;
}

/**
 * Специально getSession(), а не getUser(): getSession() при устаревшем
 * access_token сам обновляет его перед возвратом (если это возможно по
 * refresh_token), тогда как getUser() просто шлёт текущий токен на сервер
 * как есть.
 *
 * Важно: сам @supabase/supabase-js (fetchWithAuth в SupabaseClient) и без
 * этой проверки берёт свежий access_token через собственный getSession() и
 * подставляет его в заголовок Authorization при КАЖДОМ запросе к REST —
 * то есть заголовок формируется правильно независимо от этой функции.
 * Если сервер всё равно отвечает 403/42501 ("new row violates row-level
 * security policy"), значит либо сессии реально нет (см. лог ниже — role
 * будет не "authenticated", или access_token вовсе отсутствует), либо
 * дело не в клиенте, а в настройках самого проекта Supabase (например,
 * JWT-ключ/роль в токене) — это уже нужно смотреть в Dashboard.
 */
async function requireSession(): Promise<{ id: string; email: string | null }> {
  const { data, error } = await supabase.auth.getSession();
  const session = data.session;
  const id = session?.user?.id;
  if (error || !id) {
    console.error('[auth] getSession() не вернул сессию:', error ?? '(session отсутствует)');
    throw new Error('Не авторизован');
  }
  console.debug('[auth] сессия есть, отправляем запрос как:', decodeJwtRoleAndExp(session.access_token));
  return { id, email: session.user.email ?? null };
}

async function requireUserId(): Promise<string> {
  return (await requireSession()).id;
}

/** Экранирует спецсимволы LIKE/ILIKE (% и _ имеют смысл wildcard'ов в SQL, но не должны в пользовательском вводе). */
function escapeIlikePattern(value: string): string {
  return value.replace(/[\\%_]/g, (ch) => `\\${ch}`);
}

/** Только для диагностики в консоли: достаёт role/exp из access_token, ничего не проверяет и не хранит. */
function decodeJwtRoleAndExp(accessToken: string): { role: unknown; exp: unknown; sub: unknown } | 'не удалось разобрать токен' {
  try {
    const payload = accessToken.split('.')[1];
    const json = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return { role: json.role, exp: json.exp, sub: json.sub };
  } catch {
    return 'не удалось разобрать токен';
  }
}

/** Ищет зарегистрированного пользователя по email (точное совпадение, без учёта регистра). */
export async function findProfileByEmail(email: string): Promise<RemoteProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, username, phone')
    .ilike('email', email.trim())
    .maybeSingle();
  if (error || !data) return null;
  return data as RemoteProfile;
}

/** Только латиница, цифры и подчёркивание, 5-32 символа — проверяется и на клиенте, и в БД (check-constraint). */
export const USERNAME_PATTERN = /^[A-Za-z0-9_]{5,32}$/;
export const USERNAME_HINT = 'Только латиница, цифры и _. Минимум 5 символов';

export function isValidUsernameFormat(username: string): boolean {
  return USERNAME_PATTERN.test(username);
}

export class UsernameTakenError extends Error {
  constructor() {
    super('Этот username уже занят. Попробуй другой');
    this.name = 'UsernameTakenError';
  }
}

export class UsernameFormatError extends Error {
  constructor() {
    super(USERNAME_HINT);
    this.name = 'UsernameFormatError';
  }
}

async function assertUsernameAvailable(username: string, myId: string): Promise<void> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .ilike('username', escapeIlikePattern(username))
    .neq('id', myId)
    .maybeSingle();
  if (error) throw error;
  if (data) throw new UsernameTakenError();
}

export interface MyProfileFields {
  full_name: string | null;
  username: string | null;
  phone: string | null;
}

/**
 * full_name/username/phone текущего пользователя из profiles — источник истины при
 * загрузке "Информации о себе": localStorage и auth.user_metadata (заполняется один раз
 * при регистрации и дальше не обновляется) не должны маскировать то, что пользователь
 * реально сохранил в последний раз.
 */
export async function fetchMyProfile(): Promise<MyProfileFields | null> {
  const { id: myId } = await requireSession();
  const { data, error } = await supabase.from('profiles').select('full_name, username, phone').eq('id', myId).maybeSingle();
  if (error || !data) return null;
  return data as MyProfileFields;
}

/**
 * Обновляет собственную запись в profiles (имя, телефон, никнейм) — вызывается при
 * сохранении "О себе". full_name/phone сохраняются отдельным запросом ДО проверки
 * username и независимо от её результата: ошибка в нике (например, "уже занят" — в т.ч.
 * ложное срабатывание на собственном же нике) не должна откатывать остальные поля.
 */
export async function upsertMyProfile(fields: { full_name?: string; username?: string; phone?: string }): Promise<void> {
  const { id: myId, email } = await requireSession();

  const { error: baseError } = await supabase.from('profiles').upsert({
    id: myId,
    email,
    full_name: fields.full_name || null,
    phone: fields.phone || null,
  });
  if (baseError) throw baseError;

  const username = fields.username?.trim() || null;
  if (!username) return;

  if (!isValidUsernameFormat(username)) throw new UsernameFormatError();

  // Ник не менялся (совпадает с уже сохранённым, без учёта регистра) — это не смена ника,
  // а просто повторное сохранение остальных полей. Проверка доступности здесь не нужна и
  // не должна её блокировать: иначе любое сохранение с уже занятым (собой же!) ником падало
  // бы с "занято", хотя реального конфликта нет.
  const { data: current } = await supabase.from('profiles').select('username').eq('id', myId).maybeSingle();
  const isUnchanged = typeof current?.username === 'string' && current.username.toLowerCase() === username.toLowerCase();
  if (!isUnchanged) {
    // Предварительная проверка — для мгновенной обратной связи в UI. Финальная гарантия —
    // уникальный индекс profiles_username_unique_idx в БД (см. catch на 23505 ниже):
    // между этой проверкой и записью два человека теоретически могут занять один
    // username одновременно, и тогда решает именно БД, а не порядок запросов клиента.
    await assertUsernameAvailable(username, myId);
  }

  const { error: usernameError } = await supabase.from('profiles').update({ username }).eq('id', myId);
  if (usernameError) {
    if (usernameError.code === '23505') throw new UsernameTakenError();
    throw usernameError;
  }
}

/**
 * Ищет зарегистрированных пользователей по имени/фамилии (full_name хранится одним
 * полем "Имя Фамилия", поэтому ilike-подстрока естественно матчит и фамилию тоже)
 * и по @username. Запрос, начинающийся с "@", ищет ТОЛЬКО по username — остальные
 * поля не трогаем (как в Telegram). Сортировка: сначала точное совпадение username,
 * потом префиксное совпадение username, затем всё остальное — по алфавиту.
 */
export async function searchProfiles(rawQuery: string): Promise<RemoteProfile[]> {
  const trimmed = rawQuery.trim();
  if (!trimmed) return [];
  const myId = await requireUserId().catch(() => null);

  const usernameOnly = trimmed.startsWith('@');
  const q = usernameOnly ? trimmed.slice(1).trim() : trimmed;
  if (!q) return [];
  const pattern = `%${escapeIlikePattern(q)}%`;

  const baseQuery = () => {
    let req = supabase.from('profiles').select('id, email, full_name, username, phone').limit(30);
    if (myId) req = req.neq('id', myId);
    return req;
  };

  let rows: RemoteProfile[];
  if (usernameOnly) {
    const { data, error } = await baseQuery().ilike('username', pattern);
    if (error || !data) return [];
    rows = data as RemoteProfile[];
  } else {
    // Два отдельных запроса вместо .or(`full_name.ilike.${pattern},...`): значение
    // пользовательского ввода нельзя безопасно подставлять в сырую строку фильтра
    // PostgREST (там запятая/скобки — служебные символы синтаксиса .or()).
    const [byName, byUsername] = await Promise.all([
      baseQuery().ilike('full_name', pattern),
      baseQuery().ilike('username', pattern),
    ]);
    const merged = new Map<string, RemoteProfile>();
    for (const row of [...(byName.data ?? []), ...(byUsername.data ?? [])] as RemoteProfile[]) {
      merged.set(row.id, row);
    }
    rows = Array.from(merged.values());
  }

  const qLower = q.toLowerCase();
  const rank = (p: RemoteProfile) => {
    const uname = p.username?.toLowerCase() ?? '';
    if (uname === qLower) return 0;
    if (uname.startsWith(qLower)) return 1;
    return 2;
  };
  return rows
    .sort((a, b) => {
      const diff = rank(a) - rank(b);
      if (diff !== 0) return diff;
      const nameA = a.full_name?.trim() || a.username || a.email;
      const nameB = b.full_name?.trim() || b.username || b.email;
      return nameA.localeCompare(nameB, 'ru');
    })
    .slice(0, 20);
}

/** Возвращает id уже существующего личного чата с пользователем либо создаёт новый. */
export async function getOrCreateDirectChat(otherUserId: string): Promise<string> {
  const myId = await requireUserId();

  const { data: myMemberships } = await supabase.from('chat_members').select('chat_id').eq('user_id', myId);
  const myChatIds = (myMemberships ?? []).map((r) => r.chat_id as string);

  if (myChatIds.length > 0) {
    const { data: shared } = await supabase
      .from('chat_members')
      .select('chat_id')
      .eq('user_id', otherUserId)
      .in('chat_id', myChatIds);
    const sharedChatIds = (shared ?? []).map((r) => r.chat_id as string);
    if (sharedChatIds.length > 0) {
      // Фильтруем по is_group = false — иначе общий групповой чат с этим человеком
      // ошибочно принимался бы за личную переписку.
      const { data: directChat } = await supabase
        .from('chats')
        .select('id')
        .in('id', sharedChatIds)
        .eq('is_group', false)
        .limit(1)
        .maybeSingle();
      if (directChat) return directChat.id as string;
    }
  }

  // Id генерируем на клиенте и НЕ вызываем .select() после этого insert. Раньше было
  // .insert({...}).select('id').single() — supabase-js на .select() строит запрос
  // INSERT ... RETURNING id, а Postgres проверяет для RETURNING ту же RLS-политику,
  // что и для обычного SELECT (chats_select_members: is_chat_member(id, auth.uid())).
  // В момент этой вставки строк в chat_members для нового чата ещё нет — то есть
  // текущий пользователь формально ещё не "участник" — поэтому RETURNING падал с
  // "new row violates row-level security policy for table \"chats\"", хотя сам INSERT
  // политикой chats_insert_auth (auth.uid() is not null) разрешён. Без .select()
  // supabase-js шлёт заголовок Prefer: return=minimal — PostgREST не строит RETURNING
  // и не проверяет SELECT-политику вовсе, а id уже известен нам заранее.
  const newChatId = crypto.randomUUID();
  const { error: chatError } = await supabase.from('chats').insert({ id: newChatId, is_group: false });
  if (chatError) throw chatError;

  const { error: membersError } = await supabase.from('chat_members').insert([
    { chat_id: newChatId, user_id: myId },
    { chat_id: newChatId, user_id: otherUserId },
  ]);
  if (membersError) throw membersError;

  return newChatId;
}

export interface RemoteChatSummary {
  chatId: string;
  profile: RemoteProfile;
  lastMessageText: string | null;
  lastMessageAt: string | null;
}

/**
 * Личные чаты текущего пользователя (только 1:1 — для групповых чатов пока
 * негде хранить название, поэтому они здесь не участвуют) с последним
 * сообщением для превью. Вызывается один раз при входе: до этого чат
 * появлялся в интерфейсе только через явный клик по результату поиска, так
 * что уже существующая переписка (например, с Ульяной) пропадала из списка
 * при каждой перезагрузке страницы, хотя сами данные в Supabase никуда не
 * девались.
 */
export async function listMyChats(): Promise<RemoteChatSummary[]> {
  const myId = await requireUserId();

  const { data: myMemberships } = await supabase.from('chat_members').select('chat_id').eq('user_id', myId);
  const chatIds = (myMemberships ?? []).map((r) => r.chat_id as string);
  if (chatIds.length === 0) return [];

  const [{ data: chatsData }, { data: allMembers }] = await Promise.all([
    supabase.from('chats').select('id').in('id', chatIds).eq('is_group', false),
    supabase.from('chat_members').select('chat_id, user_id').in('chat_id', chatIds),
  ]);

  const otherIdByChatId = new Map<string, string>();
  for (const m of allMembers ?? []) {
    if (m.user_id !== myId) otherIdByChatId.set(m.chat_id, m.user_id);
  }
  const otherIds = Array.from(new Set(otherIdByChatId.values()));
  if (otherIds.length === 0) return [];

  const [{ data: profiles }, { data: lastMessages }] = await Promise.all([
    supabase.from('profiles').select('id, email, full_name, username, phone').in('id', otherIds),
    supabase.from('messages').select('chat_id, text, created_at').in('chat_id', chatIds).order('created_at', { ascending: false }).limit(500),
  ]);
  const profileById = new Map((profiles ?? []).map((p) => [p.id as string, p as RemoteProfile]));
  const lastByChatId = new Map<string, { text: string; created_at: string }>();
  for (const m of lastMessages ?? []) {
    if (!lastByChatId.has(m.chat_id)) lastByChatId.set(m.chat_id, { text: m.text, created_at: m.created_at });
  }

  const summaries: RemoteChatSummary[] = [];
  for (const chat of chatsData ?? []) {
    const otherId = otherIdByChatId.get(chat.id);
    const profile = otherId ? profileById.get(otherId) : undefined;
    if (!profile) continue;
    const last = lastByChatId.get(chat.id);
    summaries.push({ chatId: chat.id, profile, lastMessageText: last?.text ?? null, lastMessageAt: last?.created_at ?? null });
  }
  return summaries;
}

export async function fetchMessages(chatId: string): Promise<RemoteMessage[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('id, chat_id, sender_id, text, created_at')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []) as RemoteMessage[];
}

export async function sendRealMessage(chatId: string, text: string): Promise<void> {
  const myId = await requireUserId();
  const { error } = await supabase.from('messages').insert({ chat_id: chatId, sender_id: myId, text });
  if (error) throw error;
}

/** Подписка на новые сообщения конкретного чата в реальном времени. Возвращает функцию отписки. */
export function subscribeToChatMessages(chatId: string, onInsert: (msg: RemoteMessage) => void): () => void {
  const channel = supabase
    .channel(`messages:${chatId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages', filter: `chat_id=eq.${chatId}` },
      (payload) => onInsert(payload.new as RemoteMessage)
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
