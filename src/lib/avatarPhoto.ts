const AVATAR_PHOTO_KEY = 'sevchik-avatar-photo';

/** Аватар хранится отдельно от галереи «Фотографии» — это кроп, а не оригинал. */
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
