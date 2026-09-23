import { useState, useRef, useEffect, type MouseEvent, type ChangeEvent, type CSSProperties } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, MoreVertical, Send, Phone, Bell, Check, CheckCheck, Search, X, Mic, Paperclip, Play, Pause, Image, File, BarChart3, Contact, Reply, Forward, EyeOff, Copy, Flag, Trash2, CheckSquare, Smile, Keyboard, ChevronLeft, Star, Pencil, Download } from 'lucide-react';
import { Avatar } from '@/components/Avatar';
import { ForwardChat } from '@/screens/ForwardChat';
import { StickerEmojiPanel } from '@/components/StickerEmojiPanel';
import type { Message, DeliveryStatus } from '@/data/mock';
import { playSound, triggerHaptic } from '@/lib/feedback';
import { getDisplayContact } from '@/lib/contactOverrides';
import { useChatStore } from '@/store/chatStore';
import { supabase } from '@/lib/supabase';
import { fetchMessages, sendRealMessage, subscribeToChatMessages, type RemoteMessage } from '@/lib/messagingService';

interface ConversationProps {
  chatId: string;
  onBack: () => void;
  onOpenProfile: () => void;
  fontSize: number;
  soundsEnabled: boolean;
  hapticsEnabled: boolean;
}

// Разделитель по датам между сообщениями разных дней
function DateSeparator({ label }: { label: string }) {
  return (
    <div className="flex justify-center my-1">
      <span
        className="text-xs font-heading font-semibold px-3 py-1 rounded-full"
        style={{
          background: 'rgba(255,255,255,0.55)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          color: 'var(--text-secondary)',
        }}
      >
        {label}
      </span>
    </div>
  );
}

// "Сегодня" / "Вчера" / полная дата — относительно текущего момента
function formatDateLabel(dateStr: string): string {
  const msgDate = new Date(`${dateStr}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((today.getTime() - msgDate.getTime()) / 86400000);
  if (diffDays === 0) return 'Сегодня';
  if (diffDays === 1) return 'Вчера';
  const sameYear = msgDate.getFullYear() === today.getFullYear();
  return msgDate.toLocaleDateString('ru', sameYear ? { day: 'numeric', month: 'long' } : { day: 'numeric', month: 'long', year: 'numeric' });
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

// Галочки статуса доставки: отправлено (1 галочка) → доставлено (2 галочки,
// приглушённые) → прочитано (2 галочки, выделены цветом)
function DeliveryTicks({ status, size = 13 }: { status?: DeliveryStatus; size?: number }) {
  if (status === 'read') return <CheckCheck size={size} className="text-sevchik-mint" />;
  if (status === 'delivered') return <CheckCheck size={size} />;
  return <Check size={size} />;
}

// Цитата отвечаемого сообщения — показывается внутри пузыря над контентом
function ReplyQuotePreview({ replyTo, isMe }: { replyTo: NonNullable<Message['replyTo']>; isMe: boolean }) {
  return (
    <div
      className={`mb-1.5 px-2.5 py-1.5 rounded-lg border-l-2 text-xs max-w-full ${isMe ? 'border-white/60 bg-white/10' : 'bg-black/5'}`}
      style={!isMe ? { borderColor: 'var(--theme-primary)' } : undefined}
    >
      <div className="font-heading font-bold truncate" style={{ color: isMe ? 'rgba(255,255,255,0.9)' : 'var(--theme-primary)' }}>
        {replyTo.senderName}
      </div>
      <div className={`truncate ${isMe ? 'text-white/70' : 'text-[var(--text-secondary)]'}`}>{replyTo.text}</div>
    </div>
  );
}

// Живые эмодзи: у каждого своя зацикленная анимация, подобранная под его
// характер — огонь мерцает, сердце бьётся, смайлы покачиваются и т.д.
// Крутится непрерывно и независимо от любых внешних анимаций (появление,
// выбор) — те управляют внешним элементом, эта только самим "лицом" эмодзи.
const EMOJI_IDLE_ANIMATIONS: Record<string, { animate: Record<string, (number | string)[]>; transition: Record<string, unknown> }> = {
  '👍': { animate: { rotate: [0, -18, 14, 0] }, transition: { duration: 1.6, repeat: Infinity, repeatDelay: 0.6, ease: 'easeInOut' } },
  '👎': { animate: { rotate: [0, 14, -18, 0] }, transition: { duration: 1.6, repeat: Infinity, repeatDelay: 0.6, ease: 'easeInOut' } },
  '❤️': { animate: { scale: [1, 1.28, 1, 1.16, 1] }, transition: { duration: 1, repeat: Infinity, ease: 'easeInOut' } },
  '😍': { animate: { scale: [1, 1.22, 1, 1.12, 1] }, transition: { duration: 1.1, repeat: Infinity, ease: 'easeInOut' } },
  '🔥': { animate: { scale: [1, 1.12, 0.95, 1.08, 1], rotate: [0, -3, 3, -2, 0] }, transition: { duration: 0.9, repeat: Infinity, ease: 'easeInOut' } },
  '😂': { animate: { rotate: [0, -10, 10, -6, 6, 0], y: [0, -2, 0, -2, 0] }, transition: { duration: 0.8, repeat: Infinity, ease: 'easeInOut' } },
  '😮': { animate: { scale: [1, 1.22, 1] }, transition: { duration: 1.3, repeat: Infinity, repeatDelay: 0.5, ease: 'easeInOut' } },
  '🤯': { animate: { scale: [1, 1.32, 0.9, 1], rotate: [0, -5, 5, 0] }, transition: { duration: 1, repeat: Infinity, repeatDelay: 0.5, ease: 'easeInOut' } },
  '😢': { animate: { rotate: [0, -6, 6, 0], y: [0, 2, 0] }, transition: { duration: 1.6, repeat: Infinity, ease: 'easeInOut' } },
  '🙏': { animate: { y: [0, -3, 0] }, transition: { duration: 1.4, repeat: Infinity, ease: 'easeInOut' } },
  '🎉': { animate: { rotate: [0, 15, -15, 0], scale: [1, 1.15, 1] }, transition: { duration: 1, repeat: Infinity, repeatDelay: 0.4, ease: 'easeInOut' } },
  '👏': { animate: { scale: [1, 0.85, 1.1, 1] }, transition: { duration: 0.6, repeat: Infinity, ease: 'easeInOut' } },
};
const DEFAULT_EMOJI_IDLE = { animate: { y: [0, -2, 0] }, transition: { duration: 1.8, repeat: Infinity, ease: 'easeInOut' } };

function AnimatedEmoji({ emoji, className }: { emoji: string; className?: string }) {
  const preset = EMOJI_IDLE_ANIMATIONS[emoji] ?? DEFAULT_EMOJI_IDLE;
  return (
    <motion.span
      className={className}
      style={{ display: 'inline-block' }}
      animate={preset.animate}
      transition={preset.transition}
    >
      {emoji}
    </motion.span>
  );
}

// Значок реакции — маленькая "таблетка" с эмодзи, выступающая за нижний
// край пузыря сообщения (со стороны, противоположной хвостику), тап
// снимает реакцию. Рендерится вне overflow-hidden пузыря, поэтому не
// обрезается его скруглением/паттерном фона.
function ReactionBadge({ emoji, isMe, onClick }: { emoji: string; isMe: boolean; onClick: () => void }) {
  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      whileTap={{ scale: 0.85 }}
      transition={{ type: 'spring', damping: 15, stiffness: 400 }}
      onClick={onClick}
      className={`absolute -bottom-2.5 ${isMe ? 'right-1.5' : 'left-1.5'} flex items-center justify-center w-6 h-6 rounded-full text-xs z-10`}
      style={{ background: '#ffffff', boxShadow: '0 2px 8px rgba(15,23,42,0.18)' }}
    >
      <AnimatedEmoji emoji={emoji} />
    </motion.button>
  );
}

// Компонент голосового сообщения
function VoiceMessageBubble({ duration, time, isMe, status, replyTo, reaction, onToggleReaction }: { duration: string; time: string; isMe: boolean; status?: DeliveryStatus; replyTo?: Message['replyTo']; reaction?: string; onToggleReaction?: () => void }) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className={`relative flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
      <div
        className={`flex flex-col gap-1 px-4 py-3 rounded-2xl ${
          isMe ? 'text-white rounded-br-sm' : 'text-[var(--text-main)] rounded-bl-sm'
        }`}
        style={{
          minWidth: 'min(220px, 65vw)',
          maxWidth: 'min(280px, 75vw)',
          background: isMe ? 'rgba(var(--theme-primary-rgb), 0.55)' : 'rgba(255,255,255,0.55)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          boxShadow: isMe ? '0 4px 16px rgba(101,70,199,0.14)' : '0 4px 16px rgba(15,23,42,0.05)',
        }}
      >
        {replyTo && <ReplyQuotePreview replyTo={replyTo} isMe={isMe} />}
        <div className="flex items-center gap-3">
        {/* Кнопка Play/Pause — белая с цветной иконкой */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsPlaying(!isPlaying)}
          className="shrink-0 w-11 h-11 rounded-full flex items-center justify-center"
          style={{
            background: '#ffffff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }}
        >
          {isPlaying ? (
            <Pause size={18} fill="currentColor" strokeWidth={0} style={{ color: 'var(--theme-primary)' }} />
          ) : (
            <Play size={18} fill="currentColor" strokeWidth={0} style={{ color: 'var(--theme-primary)', marginLeft: '2px' }} />
          )}
        </motion.button>

        {/* Волна */}
        <div className="flex-1 flex items-center gap-0.5 h-8">
          {[0.3, 0.6, 1, 0.7, 0.5, 0.8, 0.4, 0.9, 0.6, 0.7, 0.5, 0.8].map((height, i) => (
            <div
              key={i}
              className="w-1 rounded-full"
              style={{
                height: `${height * 100}%`,
                background: isMe ? 'rgba(255,255,255,0.6)' : 'var(--theme-primary)',
              }}
            />
          ))}
        </div>

        {/* Таймер */}
        <span className={`text-xs font-mono font-bold shrink-0 ${isMe ? 'text-white/90' : ''}`}
          style={{ color: isMe ? undefined : 'var(--theme-primary)' }}
        >
          {duration}
        </span>
        </div>

        {/* Время и статус прочтения — внутри пузыря, снизу справа */}
        <div className={`flex items-center justify-end gap-1 ${isMe ? 'text-white/70' : 'text-sevchik-textSecondary'}`}>
          <span className="text-[11px]">{time}</span>
          {isMe && <DeliveryTicks status={status} size={13} />}
        </div>
      </div>
      {reaction && onToggleReaction && <ReactionBadge emoji={reaction} isMe={isMe} onClick={onToggleReaction} />}
    </div>
  );
}

// Анимированные точки для индикатора "печатает..."
function TypingDots() {
  return (
    <span className="flex items-center gap-0.5">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-1 h-1 rounded-full bg-sevchik-mint"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.2, ease: 'easeInOut' }}
        />
      ))}
    </span>
  );
}

export function Conversation({ chatId, onBack, onOpenProfile, fontSize, soundsEnabled, hapticsEnabled }: ConversationProps) {
  const chat = useChatStore((s) => s.chats.find((c) => c.id === chatId));
  const sendMessage = useChatStore((s) => s.sendMessage);
  const updateMessageStatus = useChatStore((s) => s.updateMessageStatus);
  const markAllMineRead = useChatStore((s) => s.markAllMineRead);
  const deleteMessage = useChatStore((s) => s.deleteMessage);
  const deleteMessages = useChatStore((s) => s.deleteMessages);
  const editMessage = useChatStore((s) => s.editMessage);
  const toggleReaction = useChatStore((s) => s.toggleReaction);
  const markChatUnread = useChatStore((s) => s.markChatUnread);
  const forwardMessageToChats = useChatStore((s) => s.forwardMessageToChats);
  const setChatMessages = useChatStore((s) => s.setChatMessages);
  const appendIncomingMessage = useChatStore((s) => s.appendIncomingMessage);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [menuMessage, setMenuMessage] = useState<Message | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<{ top: number; bottom: number; left: number; right: number; isMe: boolean } | null>(null);
  const [forwardMessage, setForwardMessage] = useState<Message | null>(null);
  const [bulkForwardTexts, setBulkForwardTexts] = useState<string[] | null>(null);
  const [showStickerPanel, setShowStickerPanel] = useState(false);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [reportingMessage, setReportingMessage] = useState<Message | null>(null);
  const [reportSent, setReportSent] = useState(false);
  const [messageSelectMode, setMessageSelectMode] = useState(false);
  const [selectedMessageIds, setSelectedMessageIds] = useState<string[]>([]);
  // Эмодзи, который сейчас "выстреливает" крупной пружинной анимацией при
  // выборе реакции — меню закрывается чуть позже, чтобы анимация успела
  // доиграть (как в iMessage/Telegram).
  const [poppingEmoji, setPoppingEmoji] = useState<string | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showHoldHint, setShowHoldHint] = useState(false);
  
  const endRef = useRef<HTMLDivElement>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const holdTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messageHoldTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const pressedMessageElRef = useRef<HTMLDivElement | null>(null);

  const messages = chat?.messages ?? [];

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Реальный чат (Supabase): подгружаем историю и подписываемся на новые
  // сообщения через Realtime — вместо локальной заглушки-автоответа.
  useEffect(() => {
    if (!chat?.isReal || !chat.remoteChatId) return;
    const remoteChatId = chat.remoteChatId;
    const contactSenderId = chat.remoteUserId;
    let cancelled = false;

    const toLocalMessage = (m: RemoteMessage, myId: string | undefined): Message => ({
      id: m.id,
      senderId: m.sender_id === myId ? 'me' : chat.id,
      text: m.text,
      time: new Date(m.created_at).toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' }),
      date: m.created_at.slice(0, 10),
    });

    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      const myId = userData.user?.id;
      const history = await fetchMessages(remoteChatId);
      if (cancelled) return;
      setChatMessages(chat.id, history.map((m) => toLocalMessage(m, myId)));
    })();

    const unsubscribe = subscribeToChatMessages(remoteChatId, async (m) => {
      const { data: userData } = await supabase.auth.getUser();
      const myId = userData.user?.id;
      appendIncomingMessage(chat.id, toLocalMessage(m, myId));
      if (m.sender_id === contactSenderId && soundsEnabled) playSound('receive');
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [chat?.isReal, chat?.remoteChatId, chat?.remoteUserId, chat?.id, setChatMessages, appendIncomingMessage, soundsEnabled]);

  useEffect(() => {
    if (isRecording) {
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 10);
      }, 10);
    } else {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
    }
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, [isRecording]);

  if (!chat) return null;
  const isFavoritesChat = !!chat.isFavorites;
  const { name: displayName, initials: displayInitials } = getDisplayContact(chat);

  // Снимок цитируемого сообщения на момент отправки — хранится прямо в
  // новом сообщении (а не по ссылке на id), чтобы цитата не терялась,
  // если оригинал потом удалят
  const getReplySnapshot = (): Message['replyTo'] | undefined => {
    if (!replyTo) return undefined;
    const senderName = replyTo.senderId === 'me' ? 'Вы' : displayName;
    let text = replyTo.text;
    if (isImageMessage(text)) text = '📷 Фото';
    else if (isVoiceMessage(text)) text = '🎤 Голосовое сообщение';
    else if (isStickerMessage(text)) text = `${getStickerEmoji(text)} Стикер`;
    return { text, senderName };
  };

  const handleSend = () => {
    if (!input.trim()) return;

    if (editingMessageId) {
      editMessage(chat.id, editingMessageId, input.trim());
      setEditingMessageId(null);
      setInput('');
      return;
    }

    const text = input.trim();
    setInput('');
    setReplyTo(null);
    if (soundsEnabled) playSound('send');
    if (hapticsEnabled) triggerHaptic(12);

    // Реальный чат: сообщение уходит в Supabase, а не в мок-стор — оно
    // появится у обеих сторон через realtime-подписку выше.
    if (chat.isReal && chat.remoteChatId) {
      sendRealMessage(chat.remoteChatId, text).catch((e) => console.error('Не удалось отправить сообщение:', e));
      return;
    }

    const msg: Message = {
      id: `m-${Date.now()}`,
      senderId: 'me',
      text,
      time: new Date().toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' }),
      date: todayIso(),
      status: 'sent',
      replyTo: getReplySnapshot(),
    };
    sendMessage(chat.id, msg);
    if (isFavoritesChat) {
      setTimeout(() => updateMessageStatus(chat.id, msg.id, 'read'), 300);
      return;
    }
    setTimeout(() => {
      updateMessageStatus(chat.id, msg.id, 'delivered');
    }, 500);
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      markAllMineRead(chat.id);
      const reply: Message = {
        id: `m-${Date.now()}-r`,
        senderId: chat.id,
        text: 'Принято! 👍',
        time: new Date().toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' }),
        date: todayIso(),
      };
      sendMessage(chat.id, reply);
      if (soundsEnabled) playSound('receive');
      if (hapticsEnabled) triggerHaptic([0, 12, 40, 12]);
    }, 1500);
  };

  const attachOptions = [
    { label: 'Галерея', icon: Image },
    { label: 'Файл', icon: File },
    { label: 'Опрос', icon: BarChart3 },
    { label: 'Контакт', icon: Contact },
  ];

  const handleAttach = (label: string) => {
    if (label === 'Галерея') {
      setShowAttachMenu(false);
      galleryInputRef.current?.click();
      return;
    }
    alert(`${label}: функция будет добавлена позже`);
    setShowAttachMenu(false);
  };

  const handleSendImage = (dataUrl: string) => {
    const msg: Message = {
      id: `img-${Date.now()}`,
      senderId: 'me',
      text: `image:${dataUrl}`,
      time: new Date().toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' }),
      date: todayIso(),
      status: 'sent',
      replyTo: getReplySnapshot(),
    };
    sendMessage(chat.id, msg);
    setReplyTo(null);
    if (soundsEnabled) playSound('send');
    if (hapticsEnabled) triggerHaptic(12);
    if (isFavoritesChat) {
      setTimeout(() => updateMessageStatus(chat.id, msg.id, 'read'), 300);
      return;
    }
    setTimeout(() => {
      updateMessageStatus(chat.id, msg.id, 'delivered');
    }, 500);
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      markAllMineRead(chat.id);
      const reply: Message = {
        id: `img-${Date.now()}-r`,
        senderId: chat.id,
        text: 'Красиво! 😍',
        time: new Date().toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' }),
        date: todayIso(),
      };
      sendMessage(chat.id, reply);
      if (soundsEnabled) playSound('receive');
      if (hapticsEnabled) triggerHaptic([0, 12, 40, 12]);
    }, 1500);
  };

  const handleGalleryFileSelected = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') handleSendImage(reader.result);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const reactionEmojis = ['👍', '👎', '❤️', '🔥', '😂', '😮', '😢', '🙏', '🎉', '👏', '😍', '🤯'];

  // Снимок положения сообщения на экране в момент открытия меню — по нему
  // меню "вырастает" из самого сообщения, а не выезжает с низа экрана.
  const captureAnchor = (el: HTMLDivElement, msg: Message) => {
    const rect = el.getBoundingClientRect();
    setMenuAnchor({ top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right, isMe: msg.senderId === 'me' });
  };

  const closeMenu = () => {
    setMenuMessage(null);
    setMenuAnchor(null);
  };

  const handleMessageHoldStart = (msg: Message, el: HTMLDivElement) => {
    if (messageSelectMode) return;
    pressedMessageElRef.current = el;
    messageHoldTimeoutRef.current = setTimeout(() => {
      if (pressedMessageElRef.current) captureAnchor(pressedMessageElRef.current, msg);
      setMenuMessage(msg);
    }, 400);
  };

  const handleMessageHoldEnd = () => {
    if (messageHoldTimeoutRef.current) {
      clearTimeout(messageHoldTimeoutRef.current);
      messageHoldTimeoutRef.current = null;
    }
  };

  const handleMessageContextMenu = (e: MouseEvent, msg: Message) => {
    e.preventDefault();
    if (messageSelectMode) return;
    captureAnchor(e.currentTarget as HTMLDivElement, msg);
    setMenuMessage(msg);
  };

  const handleMessageClick = (msg: Message) => {
    if (messageSelectMode) toggleMessageSelect(msg.id);
  };

  // Лёгкая, короткая тактильная вибрация на тап по пункту меню — без звука,
  // как в iOS. Каждый пункт меню выбирается одним обычным тапом (onClick),
  // как в Telegram/WhatsApp/MAX — никакой отдельной системы жестов не нужно.
  const menuHaptic = () => {
    if (hapticsEnabled) triggerHaptic(10);
  };

  const handleSelectReaction = (emoji: string) => {
    menuHaptic();
    if (menuMessage) toggleReaction(chat.id, menuMessage.id, emoji);
    setPoppingEmoji(emoji);
    setTimeout(() => {
      setPoppingEmoji(null);
      closeMenu();
    }, 220);
  };

  const handleReply = () => {
    menuHaptic();
    setReplyTo(menuMessage);
    closeMenu();
  };

  const handleForward = () => {
    menuHaptic();
    setForwardMessage(menuMessage);
    closeMenu();
  };

  const handleEditMessage = () => {
    menuHaptic();
    if (menuMessage) {
      setEditingMessageId(menuMessage.id);
      setInput(menuMessage.text);
    }
    closeMenu();
  };

  const handleMarkUnread = () => {
    menuHaptic();
    markChatUnread(chat.id);
    closeMenu();
  };

  const handleCopyText = async () => {
    menuHaptic();
    if (menuMessage) {
      try {
        await navigator.clipboard.writeText(menuMessage.text);
      } catch {
        // буфер обмена недоступен — молча игнорируем
      }
    }
    closeMenu();
  };

  const handleSaveToGallery = () => {
    menuHaptic();
    if (menuMessage && isImageMessage(menuMessage.text)) {
      const a = document.createElement('a');
      a.href = getImageSrc(menuMessage.text);
      a.download = `sevchik-photo-${Date.now()}.png`;
      a.click();
    }
    closeMenu();
  };

  const handleReport = () => {
    menuHaptic();
    setReportingMessage(menuMessage);
    setReportSent(false);
    closeMenu();
  };

  const handleSubmitReport = () => {
    setReportSent(true);
    setTimeout(() => {
      setReportingMessage(null);
      setReportSent(false);
    }, 1200);
  };

  const handleDeleteMessage = () => {
    menuHaptic();
    if (menuMessage) {
      deleteMessage(chat.id, menuMessage.id);
    }
    closeMenu();
  };

  const toggleMessageSelect = (id: string) => {
    setSelectedMessageIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const handleSelectMessage = () => {
    menuHaptic();
    setMessageSelectMode(true);
    setSelectedMessageIds(menuMessage ? [menuMessage.id] : []);
    closeMenu();
  };

  const exitMessageSelectMode = () => {
    setMessageSelectMode(false);
    setSelectedMessageIds([]);
  };

  const handleBulkDelete = () => {
    deleteMessages(chat.id, selectedMessageIds);
    exitMessageSelectMode();
  };

  const handleBulkForward = () => {
    const texts = messages.filter((m) => selectedMessageIds.includes(m.id)).map((m) => m.text);
    setBulkForwardTexts(texts);
  };

  const handleSendForward = (chatIds: string[]) => {
    if (!forwardMessage) return;
    forwardMessageToChats(chatIds, forwardMessage.text);
    setForwardMessage(null);
  };

  const handleSendBulkForward = (chatIds: string[]) => {
    if (!bulkForwardTexts) return;
    bulkForwardTexts.forEach((text) => forwardMessageToChats(chatIds, text));
    setBulkForwardTexts(null);
    exitMessageSelectMode();
  };

  const handleMute = (duration: string) => {
    alert(`🔕 Уведомления отключены: ${duration}`);
    setShowNotificationsModal(false);
    setShowMenu(false);
  };

  const formatRecordingTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = Math.floor((ms % 1000) / 10);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')},${milliseconds.toString().padStart(2, '0')}`;
  };

  const formatVoiceDuration = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleMicHoldStart = () => {
    setShowHoldHint(false);
    holdTimeoutRef.current = setTimeout(() => {
      setIsRecording(true);
      setRecordingTime(0);
      if (hapticsEnabled) triggerHaptic(15);
    }, 300);
  };

  const handleMicHoldEnd = () => {
    if (holdTimeoutRef.current) {
      clearTimeout(holdTimeoutRef.current);
      holdTimeoutRef.current = null;
    }
    
    if (isRecording) {
      const duration = formatVoiceDuration(recordingTime);
      const voiceMsg: Message = {
        id: `voice-${Date.now()}`,
        senderId: 'me',
        text: `voice:${duration}`,
        time: new Date().toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' }),
        date: todayIso(),
        status: 'sent',
        replyTo: getReplySnapshot(),
      };
      sendMessage(chat.id, voiceMsg);
      setReplyTo(null);
      setIsRecording(false);
      setRecordingTime(0);
      if (soundsEnabled) playSound('send');
      if (hapticsEnabled) triggerHaptic(12);

      if (isFavoritesChat) {
        setTimeout(() => updateMessageStatus(chat.id, voiceMsg.id, 'read'), 300);
        return;
      }

      setTimeout(() => {
        updateMessageStatus(chat.id, voiceMsg.id, 'delivered');
      }, 500);

      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        markAllMineRead(chat.id);
        const reply: Message = {
          id: `voice-${Date.now()}-r`,
          senderId: chat.id,
          text: 'Прослушал голосовое 👂',
          time: new Date().toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' }),
          date: todayIso(),
        };
        sendMessage(chat.id, reply);
        if (soundsEnabled) playSound('receive');
        if (hapticsEnabled) triggerHaptic([0, 12, 40, 12]);
      }, 1500);
    } else {
      setShowHoldHint(true);
      setTimeout(() => setShowHoldHint(false), 2000);
    }
  };

  const handleCancelRecording = () => {
    setIsRecording(false);
    setRecordingTime(0);
  };

  const isVoiceMessage = (text: string) => text.startsWith('voice:');
  const getVoiceDuration = (text: string) => text.replace('voice:', '');
  const isStickerMessage = (text: string) => text.startsWith('sticker:');
  const getStickerEmoji = (text: string) => text.replace('sticker:', '');
  const isImageMessage = (text: string) => text.startsWith('image:');
  const getImageSrc = (text: string) => text.replace('image:', '');

  const handleSelectEmoji = (emoji: string) => {
    setInput((prev) => prev + emoji);
  };

  const handleSelectSticker = (emoji: string) => {
    const msg: Message = {
      id: `sticker-${Date.now()}`,
      senderId: 'me',
      text: `sticker:${emoji}`,
      time: new Date().toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' }),
      date: todayIso(),
      status: 'sent',
      replyTo: getReplySnapshot(),
    };
    sendMessage(chat.id, msg);
    setReplyTo(null);
    setShowStickerPanel(false);
    if (soundsEnabled) playSound('send');
    if (hapticsEnabled) triggerHaptic(12);
    setTimeout(() => {
      updateMessageStatus(chat.id, msg.id, isFavoritesChat ? 'read' : 'delivered');
    }, 500);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden chat-wallpaper">
      {/* Header */}
      {messageSelectMode ? (
        <div className="shrink-0 sticky top-0 z-10 px-4 py-3 flex items-center justify-between gap-3 bg-transparent">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={exitMessageSelectMode}
            className="px-4 py-2 rounded-2xl font-heading font-bold text-sm text-white"
            style={{ background: '#6546C7', boxShadow: '0 4px 12px rgba(101,70,199,0.2)' }}
          >
            Готово
          </motion.button>
          <span className="font-heading font-bold text-sm text-sevchik-textSecondary">
            Выбрано: {selectedMessageIds.length}
          </span>
        </div>
      ) : (
      <div className="shrink-0 sticky top-0 z-10 px-4 py-3 flex items-center gap-3 bg-transparent">
        <motion.button
          whileTap={{ scale: 0.9, y: 2 }}
          onClick={onBack}
          className="w-12 h-12 rounded-full bg-sevchik-cream text-sevchik-text btn-3d flex items-center justify-center"
          style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
        >
          <ArrowLeft size={22} />
        </motion.button>
        {isFavoritesChat ? (
          <div className="flex items-center gap-3 flex-1 min-w-0 text-left">
            <Avatar initials="" color={chat.avatarColor} size="sm" icon={<Star size={16} fill="white" strokeWidth={0} />} />
            <div className="flex-1 min-w-0">
              <h2 className="font-heading font-bold text-lg text-sevchik-text truncate">{displayName}</h2>
              <p className="text-sm font-body text-sevchik-textSecondary">Сохранённые сообщения</p>
            </div>
          </div>
        ) : (
          <button onClick={onOpenProfile} className="flex items-center gap-3 flex-1 min-w-0 text-left">
            <Avatar initials={displayInitials} color={chat.avatarColor} size="sm" online={chat.online} />
            <div className="flex-1 min-w-0">
              <h2 className="font-heading font-bold text-lg text-sevchik-text truncate">{displayName}</h2>
              <p className={`text-sm font-body flex items-center gap-1 ${isTyping || chat.online ? 'text-sevchik-mint' : 'text-sevchik-textSecondary'}`}>
                {isTyping ? (
                  <>
                    печатает
                    <TypingDots />
                  </>
                ) : (
                  <>
                    {chat.online && <span className="w-1.5 h-1.5 rounded-full bg-sevchik-mint" />}
                    {chat.online ? 'в сети' : 'не в сети'}
                  </>
                )}
              </p>
            </div>
          </button>
        )}

        {!isFavoritesChat && (
          <motion.button
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => alert('📞 Функция звонков скоро будет доступна!')}
            className="w-12 h-12 rounded-full bg-sevchik-cream text-sevchik-textSecondary btn-3d flex items-center justify-center"
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
          >
            <Phone size={22} />
          </motion.button>
        )}

        <div className="relative">
          <motion.button
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => setShowMenu(!showMenu)}
            className="w-12 h-12 rounded-full bg-sevchik-cream text-sevchik-textSecondary btn-3d flex items-center justify-center"
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
          >
            <MoreVertical size={22} />
          </motion.button>

          <AnimatePresence>
            {showMenu && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowMenu(false)}
                  className="fixed inset-0 z-30"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -10 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className="absolute right-0 top-14 w-60 bg-white rounded-2xl overflow-hidden z-40"
                  style={{ boxShadow: '0 12px 32px rgba(15,23,42,0.12)' }}
                >
                  <motion.button
                    whileHover={{ backgroundColor: '#F9FAFB' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setShowMenu(false);
                      setShowNotificationsModal(true);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3.5 text-left border-b border-[#F3F4F6]"
                  >
                    <Bell size={19} style={{ color: 'var(--text-secondary)' }} />
                    <span className="font-heading font-semibold text-sm text-[#1A1A1A]">Уведомления</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ backgroundColor: '#F9FAFB' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setShowMenu(false);
                      setMessageSelectMode(true);
                      setSelectedMessageIds([]);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3.5 text-left border-b border-[#F3F4F6]"
                  >
                    <Check size={19} style={{ color: 'var(--text-secondary)' }} />
                    <span className="font-heading font-semibold text-sm text-[#1A1A1A]">Выбрать</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ backgroundColor: '#F9FAFB' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setShowMenu(false);
                      alert('🔍 Поиск по переписке будет добавлен позже');
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
                  >
                    <Search size={19} style={{ color: 'var(--text-secondary)' }} />
                    <span className="font-heading font-semibold text-sm text-[#1A1A1A]">Найти</span>
                  </motion.button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
      )}

      {/* Messages */}
      <div
        className={`messages-list flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-3 ${messageSelectMode ? 'pb-20' : ''}`}
        style={{ touchAction: 'pan-y' }}
      >
        {messages.map((msg, i) => {
          const isMe = msg.senderId === 'me';
          const isVoice = isVoiceMessage(msg.text);
          const voiceDuration = isVoice ? getVoiceDuration(msg.text) : '';
          const isSticker = isStickerMessage(msg.text);
          const isImage = isImageMessage(msg.text);
          const showDateSeparator = !!msg.date && msg.date !== messages[i - 1]?.date;

          return (
            <div key={msg.id}>
            {showDateSeparator && <DateSeparator label={formatDateLabel(msg.date!)} />}
            <motion.div
              initial={isMe ? { scale: 0.95, opacity: 0 } : { y: 15, opacity: 0 }}
              animate={isMe ? { scale: 1, opacity: 1 } : { y: 0, opacity: 1 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className={`relative flex select-none ${isMe ? 'justify-end' : 'justify-start'}`}
              style={{ touchAction: 'pan-y' }}
              onContextMenu={(e) => handleMessageContextMenu(e, msg)}
              onMouseDown={(e) => handleMessageHoldStart(msg, e.currentTarget)}
              onMouseUp={handleMessageHoldEnd}
              onMouseLeave={handleMessageHoldEnd}
              onTouchStart={(e) => handleMessageHoldStart(msg, e.currentTarget)}
              onTouchEnd={handleMessageHoldEnd}
              onClick={() => handleMessageClick(msg)}
            >
              <AnimatePresence>
                {messageSelectMode && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className={`absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center border-2 ${isMe ? 'left-0' : 'right-0'}`}
                    style={{
                      borderColor: selectedMessageIds.includes(msg.id) ? '#6546C7' : 'rgba(107,114,128,0.4)',
                      background: selectedMessageIds.includes(msg.id) ? '#6546C7' : 'transparent',
                    }}
                  >
                    {selectedMessageIds.includes(msg.id) && <Check size={14} className="text-white" />}
                  </motion.div>
                )}
              </AnimatePresence>
              {isSticker ? (
                <div className={`relative flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  {msg.replyTo && (
                    <div className="mb-1 max-w-[75%]">
                      <ReplyQuotePreview replyTo={msg.replyTo} isMe={false} />
                    </div>
                  )}
                  <span className="text-6xl leading-none">{getStickerEmoji(msg.text)}</span>
                  <div className={`flex items-center gap-1 mt-1 ${isMe ? 'text-sevchik-textSecondary' : 'text-sevchik-textSecondary'}`}>
                    <span className="text-[11px]">{msg.time}</span>
                    {isMe && <DeliveryTicks status={msg.status} size={12} />}
                  </div>
                  {msg.reaction && (
                    <ReactionBadge emoji={msg.reaction} isMe={isMe} onClick={() => toggleReaction(chat.id, msg.id, msg.reaction!)} />
                  )}
                </div>
              ) : isVoice ? (
                <VoiceMessageBubble
                  duration={voiceDuration}
                  time={msg.time}
                  isMe={isMe}
                  status={msg.status}
                  replyTo={msg.replyTo}
                  reaction={msg.reaction}
                  onToggleReaction={() => toggleReaction(chat.id, msg.id, msg.reaction!)}
                />
              ) : isImage ? (
                <div className={`relative flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  {msg.replyTo && (
                    <div className="mb-1 max-w-[75%] w-full">
                      <ReplyQuotePreview replyTo={msg.replyTo} isMe={isMe} />
                    </div>
                  )}
                  <div className="relative max-w-[75%] rounded-2xl overflow-hidden" style={{ boxShadow: '0 4px 16px rgba(15,23,42,0.1)' }}>
                    <img src={getImageSrc(msg.text)} alt="" className="block max-h-[320px] w-auto object-cover" />
                    <div className="absolute bottom-1.5 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-white text-[11px]" style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)' }}>
                      <span>{msg.time}</span>
                      {isMe && <DeliveryTicks status={msg.status} size={12} />}
                    </div>
                  </div>
                  {msg.reaction && (
                    <ReactionBadge emoji={msg.reaction} isMe={isMe} onClick={() => toggleReaction(chat.id, msg.id, msg.reaction!)} />
                  )}
                </div>
              ) : (
                <div className="relative max-w-[75%]">
                  <div
                    className={`px-4 py-3 font-body text-sm relative overflow-hidden ${
                      isMe
                        ? 'message-outgoing-pattern text-white rounded-2xl rounded-br-sm'
                        : 'message-incoming-pattern text-[var(--text-main)] rounded-2xl rounded-bl-sm'
                    }`}
                    style={{ boxShadow: isMe ? '0 4px 16px rgba(101,70,199,0.14)' : '0 4px 16px rgba(15,23,42,0.05)' }}
                  >
                    {msg.replyTo && (
                      <div className="relative z-10">
                        <ReplyQuotePreview replyTo={msg.replyTo} isMe={isMe} />
                      </div>
                    )}
                    <p className="relative z-10" style={{ fontSize: `${fontSize}px` }}>{msg.text}</p>
                    <div className={`flex items-center justify-end gap-1 mt-1 relative z-10 ${isMe ? 'text-white/50' : 'text-sevchik-textSecondary'}`}>
                      {msg.edited && <span className="text-[11px] italic">изменено</span>}
                      <span className="text-[11px]">{msg.time}</span>
                      {isMe && <DeliveryTicks status={msg.status} size={13} />}
                    </div>
                  </div>
                  {msg.reaction && (
                    <ReactionBadge emoji={msg.reaction} isMe={isMe} onClick={() => toggleReaction(chat.id, msg.id, msg.reaction!)} />
                  )}
                </div>
              )}
            </motion.div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      {/* Панель стикеров и эмодзи */}
      <AnimatePresence>
        {showStickerPanel && (
          <StickerEmojiPanel onSelectEmoji={handleSelectEmoji} onSelectSticker={handleSelectSticker} />
        )}
      </AnimatePresence>

      {/* Панель ответа/редактирования — над полем ввода */}
      <AnimatePresence>
        {!messageSelectMode && (replyTo || editingMessageId) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="shrink-0 px-4 overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.65)' }}
          >
            <div className="flex items-center gap-2 py-2 border-t border-black/5">
              {editingMessageId ? (
                <Pencil size={18} style={{ color: 'var(--theme-primary)' }} className="shrink-0" />
              ) : (
                <Reply size={18} style={{ color: 'var(--theme-primary)' }} className="shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="text-xs font-heading font-bold" style={{ color: 'var(--theme-primary)' }}>
                  {editingMessageId ? 'Редактирование' : (replyTo?.senderId === 'me' ? 'Вы' : displayName)}
                </div>
                <div className="text-xs truncate text-sevchik-textSecondary">
                  {editingMessageId
                    ? messages.find((m) => m.id === editingMessageId)?.text
                    : replyTo && (isImageMessage(replyTo.text) ? '📷 Фото' : isVoiceMessage(replyTo.text) ? '🎤 Голосовое сообщение' : isStickerMessage(replyTo.text) ? `${getStickerEmoji(replyTo.text)} Стикер` : replyTo.text)}
                </div>
              </div>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  setReplyTo(null);
                  if (editingMessageId) {
                    setEditingMessageId(null);
                    setInput('');
                  }
                }}
                className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sevchik-textSecondary"
              >
                <X size={16} />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Panel — стеклянный контейнер статичен и не пересоздаётся,
          чтобы backdrop-filter не «глючил» на iOS Safari во время
          анимации перехода между состояниями (баг с блюр-артефактом).
          Скрыт в режиме выбора сообщений — вместо него снизу появляется
          панель массовых действий. */}
      <div
        className="shrink-0 px-4 py-2.5 pb-4"
        style={{
          display: messageSelectMode ? 'none' : undefined,
          background: 'rgba(255,255,255,0.65)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: '0 -4px 16px rgba(15,23,42,0.04)',
        }}
      >
        <AnimatePresence mode="wait">
          {isRecording ? (
            <motion.div
              key="recording"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="select-none"
              style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
            >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={handleCancelRecording}
                  className="shrink-0 w-9 h-9 rounded-full bg-[#F3F4F6] flex items-center justify-center text-[#6B7280]"
                >
                  <Trash2 size={17} />
                </motion.button>

                <div className="flex items-center gap-1.5 shrink-0">
                  <motion.div
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
                    className="w-2 h-2 rounded-full bg-red-500 shrink-0"
                  />
                  <span className="font-mono text-sm font-bold text-[var(--text-main)] select-none" style={{ userSelect: 'none', WebkitUserSelect: 'none' }}>
                    {formatRecordingTime(recordingTime)}
                  </span>
                </div>

                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={handleCancelRecording}
                  className="flex items-center gap-0.5 text-sm font-body text-[var(--text-secondary)] truncate"
                >
                  <ChevronLeft size={15} className="shrink-0" />
                  <span className="truncate">Отменить</span>
                </motion.button>
              </div>

              <div className="relative shrink-0">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={handleMicHoldEnd}
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white"
                  style={{
                    background: 'var(--theme-primary)',
                    boxShadow: '0 4px 14px rgba(101,70,199,0.22)',
                  }}
                >
                  <Send size={20} />
                </motion.button>
              </div>
            </div>
            </motion.div>
          ) : (
            <motion.div
              key="input"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
            <div className="flex items-center gap-2">
              <motion.button
                whileTap={{ scale: 0.9, y: 2 }}
                whileHover={{ scale: 1.05 }}
                onClick={() => setShowAttachMenu(true)}
                className="shrink-0 w-12 h-12 rounded-full bg-sevchik-cream flex items-center justify-center text-sevchik-purple btn-3d"
                style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
              >
                <Paperclip size={22} />
              </motion.button>

              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Написать сообщение..."
                className="flex-1 bg-sevchik-cream/60 rounded-btn py-3 px-4 text-sevchik-text placeholder:text-sevchik-textSecondary/60 focus:outline-none focus:ring-2 focus:ring-sevchik-purple/30 font-body text-sm"
              />

              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowStickerPanel((prev) => !prev)}
                className="shrink-0 w-12 h-12 rounded-full flex items-center justify-center btn-3d"
                style={{
                  background: showStickerPanel ? '#6546C7' : 'var(--bg-input)',
                  color: showStickerPanel ? '#fff' : 'var(--theme-primary)',
                }}
              >
                <Smile size={20} />
              </motion.button>

              <AnimatePresence mode="wait">
                {input.trim() ? (
                  <motion.button
                    key="send"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    whileTap={{ scale: 0.88, y: 2 }}
                    onClick={handleSend}
                    className="shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white btn-3d relative overflow-hidden"
                    style={{ background: 'var(--theme-message-gradient)', boxShadow: '0 4px 14px rgba(101,70,199,0.22)' }}
                  >
                    <Send size={20} className="relative z-10" />
                  </motion.button>
                ) : showStickerPanel ? (
                  <motion.button
                    key="keyboard"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    whileTap={{ scale: 0.88, y: 2 }}
                    onClick={() => setShowStickerPanel(false)}
                    className="shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white btn-3d"
                    style={{ background: '#4FD3C8', boxShadow: '0 4px 14px rgba(79,211,200,0.22)' }}
                  >
                    <Keyboard size={20} />
                  </motion.button>
                ) : (
                  <div className="relative">
                    <AnimatePresence>
                      {showHoldHint && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute bottom-14 right-0 bg-[#1A1A1A] text-white text-xs px-3 py-2 rounded-xl whitespace-nowrap"
                          style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}
                        >
                          Удерживайте для записи
                          <div className="absolute bottom-0 right-4 w-2 h-2 bg-[#1A1A1A] rotate-45 translate-y-1" />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <motion.button
                      key="mic"
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.5, opacity: 0 }}
                      whileTap={{ scale: 0.88, y: 2 }}
                      onMouseDown={handleMicHoldStart}
                      onMouseUp={handleMicHoldEnd}
                      onMouseLeave={handleMicHoldEnd}
                      onTouchStart={handleMicHoldStart}
                      onTouchEnd={handleMicHoldEnd}
                      className="shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white btn-3d relative overflow-hidden"
                      style={{ background: '#4FD3C8', boxShadow: '0 4px 14px rgba(79,211,200,0.22)' }}
                    >
                      <Mic size={20} className="relative z-10" />
                    </motion.button>
                  </div>
                )}
              </AnimatePresence>
            </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Модальное окно "Уведомления" */}
      <AnimatePresence>
        {showNotificationsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm"
            onClick={() => setShowNotificationsModal(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl bg-white rounded-t-3xl p-6"
              style={{ boxShadow: '0 -20px 60px rgba(0,0,0,0.2)' }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-heading font-extrabold text-xl text-[#1A1A1A]">Отключить уведомления</h3>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowNotificationsModal(false)}
                  className="w-11 h-11 rounded-full bg-[#F3F4F6] flex items-center justify-center text-[#6B7280]"
                >
                  <X size={20} />
                </motion.button>
              </div>

              <div className="space-y-2">
                {[
                  { label: 'На 1 час', color: '#6546C7' },
                  { label: 'На 4 часа', color: '#6546C7' },
                  { label: 'На 24 часа', color: '#6546C7' },
                  { label: 'Навсегда', color: '#EF4444' },
                ].map((item) => (
                  <motion.button
                    key={item.label}
                    whileHover={{ backgroundColor: '#F9FAFB' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleMute(item.label)}
                    className="w-full flex items-center justify-between px-5 py-4 rounded-2xl text-left transition-colors"
                  >
                    <span
                      className="font-heading font-semibold text-base"
                      style={{ color: item.color }}
                    >
                      {item.label}
                    </span>
                  </motion.button>
                ))}
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowNotificationsModal(false)}
                className="w-full mt-4 py-4 rounded-2xl bg-[#F3F4F6] text-[#4B5563] font-heading font-bold text-base hover:bg-[#E5E7EB] transition-colors"
              >
                Отменить
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <input ref={galleryInputRef} type="file" accept="image/*" className="hidden" onChange={handleGalleryFileSelected} />

      {/* Модальное окно "Вложения" */}
      <AnimatePresence>
        {showAttachMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm"
            onClick={() => setShowAttachMenu(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl bg-white rounded-t-3xl p-6"
              style={{ boxShadow: '0 -20px 60px rgba(0,0,0,0.2)' }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-heading font-extrabold text-xl text-[#1A1A1A]">Вложения</h3>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowAttachMenu(false)}
                  className="w-11 h-11 rounded-full bg-[#F3F4F6] flex items-center justify-center text-[#6B7280]"
                >
                  <X size={20} />
                </motion.button>
              </div>

              <div className="grid grid-cols-4 gap-3 pb-2">
                {attachOptions.map((item) => {
                  const Icon = item.icon;
                  return (
                    <motion.button
                      key={item.label}
                      whileTap={{ scale: 0.94 }}
                      onClick={() => handleAttach(item.label)}
                      className="flex flex-col items-center gap-2"
                    >
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center bg-[var(--bg-input)]"
                        style={{ boxShadow: '0 2px 8px rgba(15,23,42,0.05)' }}
                      >
                        <Icon size={22} style={{ color: 'var(--theme-primary)' }} />
                      </div>
                      <span className="font-heading font-semibold text-xs text-[#1A1A1A] text-center">{item.label}</span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Контекстное меню сообщения — компактное, "вырастает" прямо из
          сообщения (позиционируется по снимку его координат на экране,
          см. menuAnchor), а не выезжает бланком на весь низ экрана. */}
      <AnimatePresence>
        {menuMessage && menuAnchor && (() => {
          const MENU_WIDTH = 244;
          const MENU_MARGIN = 10;
          const vw = window.innerWidth;
          const vh = window.innerHeight;
          const openBelow = menuAnchor.top < vh / 2;
          const left = menuAnchor.isMe
            ? Math.max(MENU_MARGIN, Math.min(menuAnchor.right - MENU_WIDTH, vw - MENU_WIDTH - MENU_MARGIN))
            : Math.max(MENU_MARGIN, Math.min(menuAnchor.left, vw - MENU_WIDTH - MENU_MARGIN));
          const noSelect: CSSProperties = {
            WebkitUserSelect: 'none',
            userSelect: 'none',
            WebkitTouchCallout: 'none',
          };
          const glass: CSSProperties = {
            background: 'rgba(255,255,255,0.68)',
            backdropFilter: 'blur(26px) saturate(180%)',
            WebkitBackdropFilter: 'blur(26px) saturate(180%)',
            boxShadow: '0 10px 30px rgba(15,23,42,0.2)',
          };

          const isText = !isVoiceMessage(menuMessage.text) && !isStickerMessage(menuMessage.text) && !isImageMessage(menuMessage.text);
          const isImg = isImageMessage(menuMessage.text);
          const isMine = menuMessage.senderId === 'me';

          // Каждый пункт — обычная кнопка с onClick, выбирается одним тапом
          // (как в Telegram/WhatsApp/MAX). Никакой отдельной системы жестов.
          const actionRowClass = 'w-full flex items-center gap-2.5 px-3.5 py-2.5 text-left';

          const reactionsBar = (
            <div
              key="reactions"
              className="flex items-center gap-0.5 px-2 py-1.5 rounded-full overflow-x-auto no-scrollbar"
              style={glass}
            >
              {reactionEmojis.map((emoji, i) => (
                <motion.button
                  key={emoji}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    scale: poppingEmoji === emoji ? 1.7 : 1,
                    opacity: 1,
                    rotate: poppingEmoji === emoji ? [0, -12, 10, 0] : 0,
                  }}
                  transition={
                    poppingEmoji === emoji
                      ? { type: 'spring', damping: 9, stiffness: 420 }
                      : { type: 'spring', damping: 14, stiffness: 380, delay: 0.04 + i * 0.025 }
                  }
                  whileTap={{ scale: 0.8 }}
                  onClick={() => handleSelectReaction(emoji)}
                  className="text-lg w-7 h-7 shrink-0 flex items-center justify-center rounded-full"
                >
                  <AnimatedEmoji emoji={emoji} />
                </motion.button>
              ))}
            </div>
          );

          const actionsCard = (
            <div key="actions" className="rounded-2xl overflow-hidden divide-y divide-black/5" style={glass}>
              {isMine && isText && (
                <motion.button whileTap={{ scale: 0.97 }} onClick={handleEditMessage} className={actionRowClass}>
                  <Pencil size={17} style={{ color: 'var(--theme-primary)' }} />
                  <span className="font-heading font-semibold text-[13px] text-[#1A1A1A]">Редактировать</span>
                </motion.button>
              )}

              <motion.button whileTap={{ scale: 0.97 }} onClick={handleReply} className={actionRowClass}>
                <Reply size={17} style={{ color: 'var(--theme-primary)' }} />
                <span className="font-heading font-semibold text-[13px] text-[#1A1A1A]">Ответить</span>
              </motion.button>

              <motion.button whileTap={{ scale: 0.97 }} onClick={handleForward} className={actionRowClass}>
                <Forward size={17} style={{ color: 'var(--theme-primary)' }} />
                <span className="font-heading font-semibold text-[13px] text-[#1A1A1A]">Переслать</span>
              </motion.button>

              {isImg && (
                <motion.button whileTap={{ scale: 0.97 }} onClick={handleSaveToGallery} className={actionRowClass}>
                  <Download size={17} style={{ color: 'var(--theme-primary)' }} />
                  <span className="font-heading font-semibold text-[13px] text-[#1A1A1A]">Сохранить в галерею</span>
                </motion.button>
              )}

              <motion.button whileTap={{ scale: 0.97 }} onClick={handleMarkUnread} className={actionRowClass}>
                <EyeOff size={17} style={{ color: 'var(--theme-primary)' }} />
                <span className="font-heading font-semibold text-[13px] text-[#1A1A1A]">Отметить непрочитанным</span>
              </motion.button>

              {isText && (
                <motion.button whileTap={{ scale: 0.97 }} onClick={handleCopyText} className={actionRowClass}>
                  <Copy size={17} style={{ color: 'var(--theme-primary)' }} />
                  <span className="font-heading font-semibold text-[13px] text-[#1A1A1A]">Скопировать текст</span>
                </motion.button>
              )}

              {!isMine && (
                <motion.button whileTap={{ scale: 0.97 }} onClick={handleReport} className={actionRowClass}>
                  <Flag size={17} className="text-[#EF4444]" />
                  <span className="font-heading font-semibold text-[13px] text-[#EF4444]">Пожаловаться</span>
                </motion.button>
              )}

              <motion.button whileTap={{ scale: 0.97 }} onClick={handleDeleteMessage} className={actionRowClass}>
                <Trash2 size={17} className="text-[#EF4444]" />
                <span className="font-heading font-semibold text-[13px] text-[#EF4444]">Удалить</span>
              </motion.button>

              <motion.button whileTap={{ scale: 0.97 }} onClick={handleSelectMessage} className={actionRowClass}>
                <CheckSquare size={17} style={{ color: 'var(--theme-primary)' }} />
                <span className="font-heading font-semibold text-[13px] text-[#1A1A1A]">Выбрать</span>
              </motion.button>
            </div>
          );

          return (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/20 backdrop-blur-[2px]"
                onClick={closeMenu}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.35 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.35 }}
                transition={{ type: 'spring', damping: 22, stiffness: 380 }}
                onClick={(e) => e.stopPropagation()}
                className="fixed z-50 flex flex-col gap-2"
                style={{
                  width: MENU_WIDTH,
                  left,
                  top: openBelow ? menuAnchor.bottom + 8 : undefined,
                  bottom: !openBelow ? vh - menuAnchor.top + 8 : undefined,
                  maxHeight: vh - MENU_MARGIN * 2,
                  transformOrigin: `${openBelow ? 'top' : 'bottom'} ${menuAnchor.isMe ? 'right' : 'left'}`,
                  ...noSelect,
                }}
              >
                {openBelow ? (
                  <>
                    {reactionsBar}
                    <div className="overflow-y-auto" style={{ maxHeight: vh - menuAnchor.bottom - MENU_MARGIN * 3 }}>{actionsCard}</div>
                  </>
                ) : (
                  <>
                    <div className="overflow-y-auto" style={{ maxHeight: menuAnchor.top - MENU_MARGIN * 3 }}>{actionsCard}</div>
                    {reactionsBar}
                  </>
                )}
              </motion.div>
            </>
          );
        })()}
      </AnimatePresence>

      {/* Экран пересылки */}
      <AnimatePresence>
        {forwardMessage && (
          <ForwardChat
            excludeChatId={chat.id}
            onClose={() => setForwardMessage(null)}
            onSend={handleSendForward}
          />
        )}
      </AnimatePresence>

      {/* Экран пересылки нескольких выбранных сообщений */}
      <AnimatePresence>
        {bulkForwardTexts && (
          <ForwardChat
            excludeChatId={chat.id}
            onClose={() => setBulkForwardTexts(null)}
            onSend={handleSendBulkForward}
          />
        )}
      </AnimatePresence>

      {/* Модальное окно "Пожаловаться" */}
      <AnimatePresence>
        {reportingMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-6"
            onClick={() => !reportSent && setReportingMessage(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm bg-white rounded-3xl p-6"
              style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}
            >
              {reportSent ? (
                <div className="flex flex-col items-center gap-3 py-4">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: '#4FD3C8' }}>
                    <Check size={28} className="text-white" />
                  </div>
                  <p className="font-heading font-bold text-base text-[#1A1A1A] text-center">Жалоба отправлена</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-2">
                    <Flag size={22} className="text-[#EF4444]" />
                    <h3 className="font-heading font-extrabold text-lg text-[#1A1A1A]">Пожаловаться</h3>
                  </div>
                  <p className="text-sm font-body text-sevchik-textSecondary mb-5">
                    Сообщение будет отправлено на модерацию. Вы уверены, что хотите пожаловаться на это сообщение?
                  </p>
                  <div className="flex gap-2">
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setReportingMessage(null)}
                      className="flex-1 py-3 rounded-2xl bg-[#F3F4F6] text-[#4B5563] font-heading font-bold text-sm"
                    >
                      Отмена
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={handleSubmitReport}
                      className="flex-1 py-3 rounded-2xl text-white font-heading font-bold text-sm"
                      style={{ background: '#EF4444' }}
                    >
                      Пожаловаться
                    </motion.button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Нижняя панель действий в режиме выбора сообщений */}
      <AnimatePresence>
        {messageSelectMode && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="fixed bottom-0 left-0 right-0 z-40 px-6 py-4 flex items-center justify-around"
            style={{
              background: 'rgba(255,255,255,0.85)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              boxShadow: '0 -4px 16px rgba(15,23,42,0.08)',
            }}
          >
            <motion.button
              whileTap={{ scale: 0.92 }}
              disabled={selectedMessageIds.length === 0}
              onClick={handleBulkForward}
              className="flex flex-col items-center gap-1 disabled:opacity-40"
            >
              <Forward size={22} style={{ color: 'var(--theme-primary)' }} />
              <span className="text-xs font-heading font-semibold text-[#1A1A1A]">Переслать</span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.92 }}
              disabled={selectedMessageIds.length === 0}
              onClick={handleBulkDelete}
              className="flex flex-col items-center gap-1 disabled:opacity-40"
            >
              <Trash2 size={22} className="text-[#EF4444]" />
              <span className="text-xs font-heading font-semibold text-[#EF4444]">Удалить</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

