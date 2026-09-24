import { supabase } from '@/lib/supabase';

const PHOTOS_BUCKET = 'photos';

export interface RemotePhoto {
  id: string;
  path: string;
  url: string;
  createdAt: string;
}

async function requireMyId(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  const id = data.session?.user?.id;
  if (!id) throw new Error('Не авторизован');
  return id;
}

/** Фотографии текущего пользователя из public.photos — источник истины и для экрана
 * "Фотографии", и для превью в профиле, доступный с любого устройства. */
export async function listMyPhotos(): Promise<RemotePhoto[]> {
  const myId = await requireMyId();
  const { data, error } = await supabase
    .from('photos')
    .select('id, path, url, created_at')
    .eq('user_id', myId)
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  return data.map((p) => ({ id: p.id as string, path: p.path as string, url: p.url as string, createdAt: p.created_at as string }));
}

/** Загружает оригинал фото в Supabase Storage и добавляет запись в public.photos. Кроп здесь не участвует. */
export async function uploadMyPhoto(dataUrl: string): Promise<RemotePhoto> {
  const myId = await requireMyId();
  const blob = await (await fetch(dataUrl)).blob();
  const path = `${myId}/${crypto.randomUUID()}.jpg`;

  const { error: uploadError } = await supabase.storage.from(PHOTOS_BUCKET).upload(path, blob, { contentType: 'image/jpeg' });
  if (uploadError) throw uploadError;

  const { data: publicUrlData } = supabase.storage.from(PHOTOS_BUCKET).getPublicUrl(path);

  const { data: row, error: insertError } = await supabase
    .from('photos')
    .insert({ user_id: myId, path, url: publicUrlData.publicUrl })
    .select('id, created_at')
    .single();
  if (insertError || !row) throw insertError ?? new Error('Не удалось сохранить фото');

  return { id: row.id as string, path, url: publicUrlData.publicUrl, createdAt: row.created_at as string };
}

/** Удаляет фото и из public.photos, и из Storage. */
export async function deleteMyPhotos(photos: RemotePhoto[]): Promise<void> {
  if (photos.length === 0) return;
  await supabase.storage.from(PHOTOS_BUCKET).remove(photos.map((p) => p.path));
  const { error } = await supabase
    .from('photos')
    .delete()
    .in('id', photos.map((p) => p.id));
  if (error) throw error;
}
