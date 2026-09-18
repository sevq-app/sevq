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
  | 'appearance'; // <-- должен быть!
  
export interface Message {
  id: string;
  senderId: string;
  text: string;
  time: string;
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

export interface UserProfile {
  name: string;
  bio: string;
  avatarColor: string;
  initials: string;
  online: boolean;
  favoriteCommunity: string;
  communityMembers: string;
  about: string;
}

export const stories: Story[] = [
  { id: 's1', name: 'Алексей', avatarColor: '#6546C7', initials: 'АЛ', ringColor: '#4FD3C8', hasStatusDot: true },
  { id: 's2', name: 'Мария', avatarColor: '#FF6B6B', initials: 'МА', ringColor: '#FF9848', hasStatusDot: false },
  { id: 's3', name: 'Дмитрий', avatarColor: '#4FD3C8', initials: 'ДМ', ringColor: '#6546C7', hasStatusDot: true },
  { id: 's4', name: 'Елена', avatarColor: '#FFD93D', initials: 'ЕЛ', ringColor: '#4FD3C8', hasStatusDot: false },
  { id: 's5', name: 'Саша', avatarColor: '#A78BFA', initials: 'СА', ringColor: '#FF9848', hasStatusDot: true },
];

export const chats: Chat[] = [
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
      { id: 'm1', senderId: 'c1', text: 'Привет! Как дела?', time: '14:20' },
      { id: 'm2', senderId: 'me', text: 'Привет! Всё отлично, как у тебя?', time: '14:22' },
      { id: 'm3', senderId: 'c1', text: 'Тоже хорошо! Ты идёшь завтра на встречу?', time: '14:25' },
      { id: 'm4', senderId: 'c1', text: 'Привет! Ты идёшь завтра на встречу?', time: '14:32' },
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
      { id: 'm1', senderId: 'c2', text: 'Можешь скинуть те документы?', time: '12:50' },
      { id: 'm2', senderId: 'me', text: 'Сейчас, секунду', time: '12:55' },
      { id: 'm3', senderId: 'me', text: 'Отправил на почту', time: '13:00' },
      { id: 'm4', senderId: 'c2', text: 'Спасибо за помощь!', time: '13:15' },
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
      { id: 'm1', senderId: 'c3', text: 'Лена: Кто-нибудь был в Грузии недавно?', time: '12:40' },
      { id: 'm2', senderId: 'me', text: 'Я был в прошлом месяце, классно!', time: '12:42' },
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
      { id: 'm1', senderId: 'me', text: 'Давай встретимся в субботу', time: '20:10' },
      { id: 'm2', senderId: 'c4', text: 'Ок, договорились', time: '20:15' },
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
      { id: 'm1', senderId: 'c5', text: 'Глянул проект, огонь!', time: '19:30' },
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
      { id: 'm1', senderId: 'c6', text: 'С днём рождения!', time: '10:00' },
      { id: 'm2', senderId: 'me', text: 'Спасибо большое!', time: '10:05' },
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
      { id: 'm1', senderId: 'c7', text: 'Давай созвонимся вечером', time: '18:00' },
    ],
  },
];

export const searchResults: SearchResult[] = [
  { id: 'r1', name: 'Анна Петрова', handle: '@anna_p', avatarColor: '#FF9848', initials: 'АП', status: 'В сети', online: true },
  { id: 'r2', name: 'Миша Иванов', handle: '@misha_iv', avatarColor: '#4FD3C8', initials: 'МИ', status: 'В сети', online: true },
  { id: 'r3', name: 'Катя Сидорова', handle: '@kate_sid', avatarColor: '#FF6B6B', initials: 'КС', status: 'Был(а) 2 ч назад', online: false },
  { id: 'r4', name: 'Лёша Кузнецов', handle: '@lesha_k', avatarColor: '#4ECDC4', initials: 'ЛК', status: 'В сети', online: true },
  { id: 'r5', name: 'Даша Морозова', handle: '@dasha_m', avatarColor: '#FFD93D', initials: 'ДМ', status: 'Был(а) вчера', online: false },
  { id: 'r6', name: 'Никита Волков', handle: '@nikita_v', avatarColor: '#A78BFA', initials: 'НВ', status: 'В сети', online: true },
  { id: 'r7', name: 'Оля Зайцева', handle: '@olya_z', avatarColor: '#FF9848', initials: 'ОЗ', status: 'Был(а) 30 мин назад', online: false },
];

export const friendsData = [
  { id: 'f1', name: 'Анна Петрова', handle: '@anna_p', avatarColor: '#FF9848', initials: 'АП', status: 'В сети', online: true },
  { id: 'f2', name: 'Миша Иванов', handle: '@misha_iv', avatarColor: '#4FD3C8', initials: 'МИ', status: 'В сети', online: true },
  { id: 'f3', name: 'Лёша Кузнецов', handle: '@lesha_k', avatarColor: '#4ECDC4', initials: 'ЛК', status: 'В сети', online: true },
  { id: 'f4', name: 'Никита Волков', handle: '@nikita_v', avatarColor: '#A78BFA', initials: 'НВ', status: 'В сети', online: true },
  { id: 'f5', name: 'Оля Зайцева', handle: '@olya_z', avatarColor: '#FF9848', initials: 'ОЗ', status: 'Был(а) 30 мин назад', online: false },
  { id: 'f6', name: 'Катя Сидорова', handle: '@kate_sid', avatarColor: '#FF6B6B', initials: 'КС', status: 'Был(а) 2 ч назад', online: false },
];

export const clubsData = [
  { id: 'cl1', name: 'Клуб путешественников', members: '1.2k участников', avatarColor: '#6546C7', initials: 'КП', desc: 'Делимся маршрутами и историями' },
  { id: 'cl2', name: 'Фотоклуб', members: '856 участников', avatarColor: '#FF9848', initials: 'ФК', desc: 'Обсуждаем кадры и технику' },
  { id: 'cl3', name: 'Книголюбов', members: '2.1k участников', avatarColor: '#4FD3C8', initials: 'КЛ', desc: 'Читаем и обсуждаем вместе' },
  { id: 'cl4', name: 'Киноклуб', members: '643 участника', avatarColor: '#FF6B6B', initials: 'КК', desc: 'Фильмы недели и дискуссии' },
  { id: 'cl5', name: 'Музыкальный клуб', members: '987 участников', avatarColor: '#A78BFA', initials: 'МК', desc: 'Плейлисты и новые релизы' },
];

export const userProfile: UserProfile = {
  name: 'Александр В.',
  bio: 'Твой маленький большой мир',
  avatarColor: '#6546C7',
  initials: 'АВ',
  online: true,
  favoriteCommunity: 'Клуб путешественников',
  communityMembers: '1.2k участников',
  about: 'Люблю прозрачную электронику и уютные чаты',
};

export const themeCircles = [
  { id: 't1', color: '#6546C7', emoji: '⭐' },
  { id: 't2', color: '#FF9848', emoji: '😊' },
  { id: 't3', color: '#4FD3C8', emoji: '🌿' },
];

export const themeStickers = [
  { id: 'st1', emoji: '⭐', label: 'Звезда' },
  { id: 'st2', emoji: '😊', label: 'Смайл' },
  { id: 'st3', emoji: '🌿', label: 'Лист' },
  { id: 'st4', emoji: '❤️', label: 'Сердечко' },
  { id: 'st5', emoji: '✨', label: 'Звездочка' },
];
