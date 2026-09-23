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

async function requireUserId(): Promise<string> {
  const { data } = await supabase.auth.getUser();
  const id = data.user?.id;
  if (!id) throw new Error('Не авторизован');
  return id;
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
    if (shared && shared.length > 0) return shared[0].chat_id as string;
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
