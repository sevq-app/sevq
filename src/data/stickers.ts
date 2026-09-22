export interface Sticker {
  id: string;
  emoji: string;
  label: string;
}

// Своей графики стикеров пока нет — используем крупные эмодзи как плейсхолдеры
export const stickers: Sticker[] = [
  { id: 'st1', emoji: '😻', label: 'кот' },
  { id: 'st2', emoji: '🐶', label: 'пёс' },
  { id: 'st3', emoji: '🥳', label: 'праздник' },
  { id: 'st4', emoji: '😭', label: 'слёзы' },
  { id: 'st5', emoji: '🔥', label: 'огонь' },
  { id: 'st6', emoji: '❤️', label: 'сердце' },
  { id: 'st7', emoji: '👍', label: 'класс' },
  { id: 'st8', emoji: '🎉', label: 'ура' },
  { id: 'st9', emoji: '😴', label: 'сон' },
  { id: 'st10', emoji: '🤔', label: 'думаю' },
  { id: 'st11', emoji: '😎', label: 'круто' },
  { id: 'st12', emoji: '🙈', label: 'стыдно' },
  { id: 'st13', emoji: '💪', label: 'сила' },
  { id: 'st14', emoji: '🥶', label: 'холодно' },
  { id: 'st15', emoji: '🤝', label: 'договорились' },
  { id: 'st16', emoji: '🌟', label: 'звезда' },
];

export interface EmojiCategory {
  id: string;
  label: string;
  emojis: string[];
}

export const animatedEmojis: string[] = ['✨', '💫', '🎊', '🔥', '💥', '⚡️', '🌟', '🎉', '💯', '❤️‍🔥'];

export const emojiCategories: EmojiCategory[] = [
  {
    id: 'smileys',
    label: 'Смайлы',
    emojis: ['😀', '😁', '😂', '🤣', '😊', '😍', '😘', '😜', '🤔', '😴', '😭', '😡', '🥳', '😎', '🤗', '🙄', '😇', '🥺'],
  },
  {
    id: 'gestures',
    label: 'Жесты',
    emojis: ['👍', '👎', '👏', '🙌', '🤝', '🙏', '💪', '✌️', '🤞', '👋', '🤙', '👌'],
  },
  {
    id: 'animals',
    label: 'Животные',
    emojis: ['🐶', '🐱', '🐭', '🐹', '🦊', '🐻', '🐼', '🐨', '🐷', '🐸', '🐵', '🦁'],
  },
  {
    id: 'food',
    label: 'Еда',
    emojis: ['🍎', '🍕', '🍔', '🍟', '🍩', '🍦', '☕', '🍺', '🍓', '🍇', '🌮', '🍰'],
  },
  {
    id: 'objects',
    label: 'Предметы',
    emojis: ['🎁', '💡', '📱', '💻', '⏰', '🎵', '📷', '⭐', '💯', '🔑', '📎', '💰'],
  },
  {
    id: 'symbols',
    label: 'Символы',
    emojis: ['❤️', '✅', '❌', '❗', '❓', '♻️', '🔔', '🔒', '💬', '🚀', '🌈', '☀️'],
  },
];
