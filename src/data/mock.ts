export type Screen =
  | 'login'
  | 'register'
  | 'chats'
  | 'conversation'
  | 'contacts'
  | 'calls'
  | 'clubs'
  | 'profile'
  | 'search'
  | 'settings'
  | 'appearance'
  | 'about'
  | 'photos'
  | 'my-groups'
  | 'group'
  | 'contact-profile'
  | 'contact-edit'
  | 'media-gallery'
  | 'start-chat';

export type DeliveryStatus = 'sent' | 'delivered' | 'read';

export interface Message {
  id: string;
  senderId: string;
  text: string;
  time: string;
  date?: string;
  status?: DeliveryStatus;
  edited?: boolean;
  replyTo?: { text: string; senderName: string };
  reaction?: string;
}

export interface Chat {
  id: string;
  name: string;
  avatarColor: string;
  initials: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  isNew?: boolean;
  /** Системный чат "Избранное" (свои сохранённые сообщения) — не человек,
   * без статуса "в сети"/"печатает", всегда закреплён первым в списке. */
  isFavorites?: boolean;
  /** Настоящий чат с зарегистрированным пользователем (хранится в Supabase),
   * в отличие от остальных чатов, которые целиком собраны из моковых данных. */
  isReal?: boolean;
  /** id чата в таблице public.chats — нужен для отправки/подписки на сообщения. */
  remoteChatId?: string;
  /** id собеседника в таблице public.profiles. */
  remoteUserId?: string;
  messages: Message[];
}

export interface Story {
  id: string;
  name: string;
  avatarColor: string;
  initials: string;
  ringColor: string;
  hasStatusDot: boolean;
}

export interface SearchResult {
  id: string;
  name: string;
  handle: string;
  avatarColor: string;
  initials: string;
  status: string;
  online: boolean;
}

// ==========================================
// ДАННЫЕ
// ==========================================

/** ISO-дата (YYYY-MM-DD) для N дней назад от текущего момента — используется
 * для разделителей по датам в переписке ("Сегодня"/"Вчера"/конкретная дата). */
function isoDaysAgo(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

// Истории (оставляем на будущее)
export const stories: Story[] = [
  { id: 's1', name: 'Алексей', avatarColor: '#6546C7', initials: 'АЛ', ringColor: '#4FD3C8', hasStatusDot: true },
  { id: 's2', name: 'Мария', avatarColor: '#FF6B6B', initials: 'МА', ringColor: '#FF9848', hasStatusDot: false },
  { id: 's3', name: 'Дмитрий', avatarColor: '#4FD3C8', initials: 'ДМ', ringColor: '#6546C7', hasStatusDot: true },
  { id: 's4', name: 'Елена', avatarColor: '#FFD93D', initials: 'ЕЛ', ringColor: '#4FD3C8', hasStatusDot: false },
  { id: 's5', name: 'Саша', avatarColor: '#A78BFA', initials: 'СА', ringColor: '#FF9848', hasStatusDot: true },
];

// Чаты (основа для экранов Chats и Conversation)
export const FAVORITES_CHAT_ID = 'favorites';

export const chats: Chat[] = [
  {
    id: FAVORITES_CHAT_ID,
    name: 'Избранное',
    avatarColor: '#6546C7',
    initials: '',
    isFavorites: true,
    lastMessage: 'Сохраняйте сюда важные сообщения',
    time: '',
    unread: 0,
    online: false,
    messages: [],
  },
  {
    id: 'c1',
    name: 'Анна Петрова',
    avatarColor: '#FF9848',
    initials: 'АП',
    lastMessage: 'Привет! Ты идёшь завтра на встречу?',
    time: '14:32',
    unread: 3,
    online: true,
    messages: [
      { id: 'm1', senderId: 'c1', text: 'Привет! Как дела?', time: '14:20', date: isoDaysAgo(0) },
      { id: 'm2', senderId: 'me', text: 'Привет! Всё отлично, как у тебя?', time: '14:22', date: isoDaysAgo(0), status: 'read' },
      { id: 'm3', senderId: 'c1', text: 'Тоже хорошо! Ты идёшь завтра на встречу?', time: '14:25', date: isoDaysAgo(0) },
      { id: 'm4', senderId: 'c1', text: 'Привет! Ты идёшь завтра на встречу?', time: '14:32', date: isoDaysAgo(0) },
    ],
  },
  {
    id: 'c2',
    name: 'Миша Иванов',
    avatarColor: '#4FD3C8',
    initials: 'МИ',
    lastMessage: 'Спасибо за помощь!',
    time: '13:15',
    unread: 0,
    online: true,
    messages: [
      { id: 'm1', senderId: 'c2', text: 'Можешь скинуть те документы?', time: '12:50', date: isoDaysAgo(0) },
      { id: 'm2', senderId: 'me', text: 'Сейчас, секунду', time: '12:55', date: isoDaysAgo(0), status: 'read' },
      { id: 'm3', senderId: 'me', text: 'Отправил на почту', time: '13:00', date: isoDaysAgo(0), status: 'read' },
      { id: 'm4', senderId: 'c2', text: 'Спасибо за помощь!', time: '13:15', date: isoDaysAgo(0) },
    ],
  },
  {
    id: 'c3',
    name: 'Клуб путешественников',
    avatarColor: '#6546C7',
    initials: 'КП',
    lastMessage: 'Лена: Кто-нибудь был в Грузии недавно?',
    time: '12:40',
    unread: 12,
    online: false,
    isNew: true,
    messages: [
      { id: 'm1', senderId: 'c3', text: 'Лена: Кто-нибудь был в Грузии недавно?', time: '12:40', date: isoDaysAgo(0) },
      { id: 'm2', senderId: 'me', text: 'Я был в прошлом месяце, классно!', time: '12:42', date: isoDaysAgo(0), status: 'delivered' },
    ],
  },
  {
    id: 'c4',
    name: 'Катя Сидорова',
    avatarColor: '#FF6B6B',
    initials: 'КС',
    lastMessage: 'Ок, договорились',
    time: 'Вчера',
    unread: 0,
    online: false,
    messages: [
      { id: 'm1', senderId: 'me', text: 'Давай встретимся в субботу', time: '20:10', date: isoDaysAgo(1), status: 'read' },
      { id: 'm2', senderId: 'c4', text: 'Ок, договорились', time: '20:15', date: isoDaysAgo(1) },
    ],
  },
  {
    id: 'c5',
    name: 'Лёша Кузнецов',
    avatarColor: '#4ECDC4',
    initials: 'ЛК',
    lastMessage: 'Глянул проект, огонь!',
    time: 'Вчера',
    unread: 1,
    online: true,
    isNew: true,
    messages: [
      { id: 'm1', senderId: 'c5', text: 'Глянул проект, огонь!', time: '19:30', date: isoDaysAgo(1) },
    ],
  },
  {
    id: 'c6',
    name: 'Даша Морозова',
    avatarColor: '#FFD93D',
    initials: 'ДМ',
    lastMessage: 'С днём рождения!',
    time: 'Пн',
    unread: 0,
    online: false,
    messages: [
      { id: 'm1', senderId: 'c6', text: 'С днём рождения!', time: '10:00', date: isoDaysAgo(3) },
      { id: 'm2', senderId: 'me', text: 'Спасибо большое!', time: '10:05', date: isoDaysAgo(3), status: 'delivered' },
    ],
  },
  {
    id: 'c7',
    name: 'Никита Волков',
    avatarColor: '#A78BFA',
    initials: 'НВ',
    lastMessage: 'Давай созвонимся вечером',
    time: 'Пн',
    unread: 2,
    online: true,
    messages: [
      { id: 'm1', senderId: 'c7', text: 'Давай созвонимся вечером', time: '18:00', date: isoDaysAgo(3) },
    ],
  },
];

// Результаты поиска (для экрана Search)
export const searchResults: SearchResult[] = [
  { id: 'r1', name: 'Анна Петрова', handle: '@anna_p', avatarColor: '#FF9848', initials: 'АП', status: 'В сети', online: true },
  { id: 'r2', name: 'Миша Иванов', handle: '@misha_iv', avatarColor: '#4FD3C8', initials: 'МИ', status: 'В сети', online: true },
  { id: 'r3', name: 'Катя Сидорова', handle: '@kate_sid', avatarColor: '#FF6B6B', initials: 'КС', status: 'Был(а) 2 ч назад', online: false },
  { id: 'r4', name: 'Лёша Кузнецов', handle: '@lesha_k', avatarColor: '#4ECDC4', initials: 'ЛК', status: 'В сети', online: true },
  { id: 'r5', name: 'Даша Морозова', handle: '@dasha_m', avatarColor: '#FFD93D', initials: 'ДМ', status: 'Был(а) вчера', online: false },
  { id: 'r6', name: 'Никита Волков', handle: '@nikita_v', avatarColor: '#A78BFA', initials: 'НВ', status: 'В сети', online: true },
  { id: 'r7', name: 'Оля Зайцева', handle: '@olya_z', avatarColor: '#FF9848', initials: 'ОЗ', status: 'Был(а) 30 мин назад', online: false },
];

// Данные друзей/контактов (для экрана "Начать общение" и Contacts)
export const friendsData = [
  { id: 'f1', name: 'Анна Петрова', handle: '@anna_p', avatarColor: '#FF9848', initials: 'АП', status: 'В сети', online: true },
  { id: 'f2', name: 'Миша Иванов', handle: '@misha_iv', avatarColor: '#4FD3C8', initials: 'МИ', status: 'В сети', online: true },
  { id: 'f3', name: 'Лёша Кузнецов', handle: '@lesha_k', avatarColor: '#4ECDC4', initials: 'ЛК', status: 'В сети', online: true },
  { id: 'f4', name: 'Никита Волков', handle: '@nikita_v', avatarColor: '#A78BFA', initials: 'НВ', status: 'В сети', online: true },
  { id: 'f5', name: 'Оля Зайцева', handle: '@olya_z', avatarColor: '#FF9848', initials: 'ОЗ', status: 'Был(а) 30 мин назад', online: false },
  { id: 'f6', name: 'Катя Сидорова', handle: '@kate_sid', avatarColor: '#FF6B6B', initials: 'КС', status: 'Был(а) 2 ч назад', online: false },
];
