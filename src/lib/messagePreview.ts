// Человекочитаемое превью текста сообщения для списка чатов —
// голосовые/стикеры/фото хранятся с технически-служебным префиксом
// (voice:/sticker:/image:), который не нужно показывать пользователю.
export function previewText(text: string | undefined, fallback: string): string {
  if (!text) return fallback;
  if (text.startsWith('voice:')) return '🎤 Голосовое сообщение';
  if (text.startsWith('sticker:')) return `${text.replace('sticker:', '')} Стикер`;
  if (text.startsWith('image:')) return '📷 Фото';
  return text;
}
