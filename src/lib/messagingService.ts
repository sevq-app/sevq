// Реальный обмен сообщениями между зарегистрированными пользователями.
// Вся работа с бэкендом (сейчас — Supabase: таблицы profiles/chats/chat_members/messages
// + Realtime) спрятана за этими функциями, чтобы при смене бэкенда экраны
// (Search.tsx, Conversation.tsx) менять не пришлось — только реализацию здесь.

import { supabase } from '@/lib/supabase';

export interface RemoteProfile {
  id: string;
  email: string;
  full_name: string | null;
  username: string | null;
  phone: string | null;
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
async function requireUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getSession();
  const session = data.session;
  const id = session?.user?.id;
  if (error || !id) {
    console.error('[auth] getSession() не вернул сессию:', error ?? '(session отсутствует)');
    throw new Error('Не авторизован');
  }
  console.debug('[auth] сессия есть, отправляем запрос как:', decodeJwtRoleAndExp(session.access_token));
  return id;
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

/** Обновляет собственную запись в profiles (никнейм, телефон, имя) — вызывается при сохранении "О себе". */
export async function upsertMyProfile(fields: { full_name?: string; username?: string; phone?: string }): Promise<void> {
  const { data: userData } = await supabase.auth.getUser();
  const me = userData.user;
  if (!me) return;
  await supabase.from('profiles').upsert({
    id: me.id,
    email: me.email,
    full_name: fields.full_name || null,
    username: fields.username || null,
    phone: fields.phone || null,
  });
}

/** Ищет реальных пользователей по имени, никнейму, телефону или email (частичное совпадение). */
export async function searchProfiles(query: string): Promise<RemoteProfile[]> {
  const q = query.trim();
  if (!q) return [];
  const myId = await requireUserId().catch(() => null);
  const pattern = `%${q}%`;
  let request = supabase
    .from('profiles')
    .select('id, email, full_name, username, phone')
    .or(`full_name.ilike.${pattern},username.ilike.${pattern},phone.ilike.${pattern},email.ilike.${pattern}`)
    .limit(20);
  if (myId) request = request.neq('id', myId);
  const { data, error } = await request;
  if (error || !data) return [];
  return data as RemoteProfile[];
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

  const { data: chat, error: chatError } = await supabase.from('chats').insert({ is_group: false }).select('id').single();
  if (chatError || !chat) throw chatError ?? new Error('Не удалось создать чат');

  const { error: membersError } = await supabase.from('chat_members').insert([
    { chat_id: chat.id, user_id: myId },
    { chat_id: chat.id, user_id: otherUserId },
  ]);
  if (membersError) throw membersError;

  return chat.id as string;
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
