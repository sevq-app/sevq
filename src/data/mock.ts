export type Screen =
  | 'login'
  | 'register'
  | 'chats'
  | 'conversation'
  | 'contacts'
  | 'calls'
  | 'clubs'
  | 'profile'
  | 'settings'
  | 'appearance'
  | 'about'
  | 'photos'
  | 'my-groups'
  | 'group'
  | 'contact-profile'
  | 'contact-edit'
  | 'media-gallery';

export type DeliveryStatus = 'sent' | 'delivered' | 'read';

export interface Message {
  id: string;
  senderId: string;
  text: string;
  time: string;
  date?: string;
  status?: DeliveryStatus;
  edited?: boolean;
  /** Время последнего редактирования (тот же формат, что у time) — показывается вместо time рядом с пометкой "изменено". */
  editedAt?: string;
  /** id родительского сообщения — нужен, чтобы клик по цитате прокручивал к оригиналу. */
  replyTo?: { id?: string; text: string; senderName: string };
  reaction?: string;
}

export interface Chat {
  id: string;
  name: string;
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
  /** Групповой чат (несколько участников) — используется, чтобы отделить секцию
   * "Группы" от личных чатов в результатах поиска на вкладке "Чаты". */
  isGroup?: boolean;
  /** id чата в таблице public.chats — нужен для отправки/подписки на сообщения. */
  remoteChatId?: string;
  /** id собеседника в таблице public.profiles. */
  remoteUserId?: string;
  messages: Message[];
}

// ==========================================
// ДАННЫЕ
// ==========================================
// Здесь раньше жили демо-персонажи (Анна Петрова, Миша Иванов, Клуб
// путешественников и т.д.) — они были нужны только пока в приложении не было
// реальной переписки через Supabase. Единственное, что остаётся статическим
// списком, — системный чат "Избранное" (аналог Saved Messages): он не
// связан ни с каким пользователем и существует у всех по умолчанию.

export const FAVORITES_CHAT_ID = 'favorites';

export const chats: Chat[] = [
  {
    id: FAVORITES_CHAT_ID,
    name: 'Избранное',
    initials: '',
    isFavorites: true,
    lastMessage: 'Сохраняйте сюда важные сообщения',
    time: '',
    unread: 0,
    online: false,
    messages: [],
  },
];
