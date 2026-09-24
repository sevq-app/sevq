import { supabase } from '@/lib/supabase';

const AVATAR_PHOTO_KEY = 'sevchik-avatar-photo';
const AVATAR_BUCKET = 'avatars';

/**
 * Локальный кэш аватарки — только для мгновенной отрисовки на этом устройстве,
 * пока не пришёл ответ от fetchMyAvatarUrl(). Источник истины всегда
 * profiles.avatar_url в Supabase: без этого аватарка, загруженная на одном
 * устройстве, не появлялась бы на другом (localStorage не покидает браузер).
 */
export function readAvatarPhoto(): string | null {
  try {
    return localStorage.getItem(AVATAR_PHOTO_KEY) || null;
  } catch {
    return null;
  }
}

export function writeAvatarPhoto(dataUrl: string | null) {
  try {
    if (dataUrl) localStorage.setItem(AVATAR_PHOTO_KEY, dataUrl);
    else localStorage.removeItem(AVATAR_PHOTO_KEY);
  } catch {
    // квота localStorage — не критично, просто не сохранится
  }
}

/** Аватарка текущего пользователя из БД — доступна с любого устройства, где он вошёл. */
export async function fetchMyAvatarUrl(): Promise<string | null> {
  const { data: sessionData } = await supabase.auth.getSession();
  const myId = sessionData.session?.user?.id;
  if (!myId) return null;
  const { data, error } = await supabase.from('profiles').select('avatar_url').eq('id', myId).maybeSingle();
  if (error || !data) return null;
  return (data.avatar_url as string | null) ?? null;
}

/**
 * Загружает обрезанную аватарку в Supabase Storage (бакет avatars, путь
 * {userId}/avatar.jpg — при каждой новой загрузке перезаписывается) и
 * сохраняет публичную ссылку в profiles.avatar_url — это и есть синхронизация
 * между устройствами: любое устройство, где пользователь вошёл в аккаунт,
 * увидит ту же ссылку через fetchMyAvatarUrl().
 */
export async function uploadMyAvatar(dataUrl: string): Promise<string> {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  const myId = sessionData.session?.user?.id;
  if (sessionError || !myId) throw new Error('Не авторизован');

  const blob = await (await fetch(dataUrl)).blob();
  const path = `${myId}/avatar.jpg`;

  const { error: uploadError } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(path, blob, { contentType: 'image/jpeg', upsert: true });
  if (uploadError) throw uploadError;

  const { data: publicUrlData } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);
  // Путь в бакете один и тот же при каждой загрузке (перезапись) — добавляем versioning-параметр,
  // иначе браузер/CDN может отдавать закэшированную СТАРУЮ картинку по тому же самому URL.
  const versionedUrl = `${publicUrlData.publicUrl}?v=${Date.now()}`;

  const { error: updateError } = await supabase.from('profiles').update({ avatar_url: versionedUrl }).eq('id', myId);
  if (updateError) throw updateError;

  writeAvatarPhoto(versionedUrl);
  return versionedUrl;
}

/** Убирает аватарку из profiles.avatar_url (сам файл в Storage не трогаем — следующая загрузка его перезапишет). */
export async function clearMyAvatar(): Promise<void> {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  const myId = sessionData.session?.user?.id;
  if (sessionError || !myId) throw new Error('Не авторизован');

  const { error } = await supabase.from('profiles').update({ avatar_url: null }).eq('id', myId);
  if (error) throw error;
  writeAvatarPhoto(null);
}
