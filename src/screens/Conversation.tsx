import { useState, useRef, useEffect, type MouseEvent, type ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, MoreVertical, Send, Phone, Bell, Check, CheckCheck, Search, X, Mic, Paperclip, Play, Pause, Image, File, BarChart3, Contact, Reply, Forward, EyeOff, Copy, Flag, Trash2, CheckSquare, Smile, Keyboard, ChevronLeft, Star } from 'lucide-react';
import { Avatar } from '@/components/Avatar';
import { ForwardChat } from '@/screens/ForwardChat';
import { StickerEmojiPanel } from '@/components/StickerEmojiPanel';
import type { Message, DeliveryStatus } from '@/data/mock';
import { playSound, triggerHaptic } from '@/lib/feedback';
import { getDisplayContact } from '@/lib/contactOverrides';
import { useChatStore } from '@/store/chatStore';

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

// Компонент голосового сообщения
function VoiceMessageBubble({ duration, time, isMe, status }: { duration: string; time: string; isMe: boolean; status?: DeliveryStatus }) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
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
  const forwardMessageToChats = useChatStore((s) => s.forwardMessageToChats);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [menuMessage, setMenuMessage] = useState<Message | null>(null);
  const [forwardMessage, setForwardMessage] = useState<Message | null>(null);
  const [showStickerPanel, setShowStickerPanel] = useState(false);
  
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showHoldHint, setShowHoldHint] = useState(false);
  
  const endRef = useRef<HTMLDivElement>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const holdTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messageHoldTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const messages = chat?.messages ?? [];

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

  const handleSend = () => {
    if (!input.trim()) return;
    const msg: Message = {
      id: `m-${Date.now()}`,
      senderId: 'me',
      text: input.trim(),
      time: new Date().toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' }),
      date: todayIso(),
      status: 'sent',
    };
    sendMessage(chat.id, msg);
    setInput('');
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
    };
    sendMessage(chat.id, msg);
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

  const reactionEmojis = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

  const handleMessageHoldStart = (msg: Message) => {
    messageHoldTimeoutRef.current = setTimeout(() => {
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
    setMenuMessage(msg);
  };

  const handleReaction = () => {
    setMenuMessage(null);
  };

  const handleReply = () => {
    alert('↩️ Ответ на сообщение будет добавлен позже');
    setMenuMessage(null);
  };

  const handleForward = () => {
    setForwardMessage(menuMessage);
    setMenuMessage(null);
  };

  const handleMarkUnread = () => {
    alert('✉️ Отметка "непрочитанным" будет добавлена позже');
    setMenuMessage(null);
  };

  const handleCopyText = async () => {
    if (menuMessage) {
      try {
        await navigator.clipboard.writeText(menuMessage.text);
      } catch {
        // буфер обмена недоступен — молча игнорируем
      }
    }
    setMenuMessage(null);
  };

  const handleReport = () => {
    alert('🚩 Жалоба будет добавлена позже');
    setMenuMessage(null);
  };

  const handleDeleteMessage = () => {
    if (menuMessage) {
      deleteMessage(chat.id, menuMessage.id);
    }
    setMenuMessage(null);
  };

  const handleSelectMessage = () => {
    setForwardMessage(menuMessage);
    setMenuMessage(null);
  };

  const handleSendForward = (chatIds: string[]) => {
    if (!forwardMessage) return;
    forwardMessageToChats(chatIds, forwardMessage.text);
    setForwardMessage(null);
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
      };
      sendMessage(chat.id, voiceMsg);
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
    };
    sendMessage(chat.id, msg);
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
                      alert('✅ Режим выбора будет добавлен позже');
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

      {/* Messages */}
      <div className="messages-list flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-3">
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
              className={`flex select-none ${isMe ? 'justify-end' : 'justify-start'}`}
              onContextMenu={(e) => handleMessageContextMenu(e, msg)}
              onMouseDown={() => handleMessageHoldStart(msg)}
              onMouseUp={handleMessageHoldEnd}
              onMouseLeave={handleMessageHoldEnd}
              onTouchStart={() => handleMessageHoldStart(msg)}
              onTouchEnd={handleMessageHoldEnd}
            >
              {isSticker ? (
                <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <span className="text-6xl leading-none">{getStickerEmoji(msg.text)}</span>
                  <div className={`flex items-center gap-1 mt-1 ${isMe ? 'text-sevchik-textSecondary' : 'text-sevchik-textSecondary'}`}>
                    <span className="text-[11px]">{msg.time}</span>
                    {isMe && <DeliveryTicks status={msg.status} size={12} />}
                  </div>
                </div>
              ) : isVoice ? (
                <VoiceMessageBubble duration={voiceDuration} time={msg.time} isMe={isMe} status={msg.status} />
              ) : isImage ? (
                <div className="relative max-w-[75%] rounded-2xl overflow-hidden" style={{ boxShadow: '0 4px 16px rgba(15,23,42,0.1)' }}>
                  <img src={getImageSrc(msg.text)} alt="" className="block max-h-[320px] w-auto object-cover" />
                  <div className="absolute bottom-1.5 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-white text-[11px]" style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)' }}>
                    <span>{msg.time}</span>
                    {isMe && <DeliveryTicks status={msg.status} size={12} />}
                  </div>
                </div>
              ) : (
                <div
                  className={`max-w-[75%] px-4 py-3 font-body text-sm relative overflow-hidden ${
                    isMe
                      ? 'message-outgoing-pattern text-white rounded-2xl rounded-br-sm'
                      : 'message-incoming-pattern text-[var(--text-main)] rounded-2xl rounded-bl-sm'
                  }`}
                  style={{ boxShadow: isMe ? '0 4px 16px rgba(101,70,199,0.14)' : '0 4px 16px rgba(15,23,42,0.05)' }}
                >
                  <p className="relative z-10" style={{ fontSize: `${fontSize}px` }}>{msg.text}</p>
                  <div className={`flex items-center justify-end gap-1 mt-1 relative z-10 ${isMe ? 'text-white/50' : 'text-sevchik-textSecondary'}`}>
                    <span className="text-[11px]">{msg.time}</span>
                    {isMe && <DeliveryTicks status={msg.status} size={13} />}
                  </div>
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

      {/* Input Panel — стеклянный контейнер статичен и не пересоздаётся,
          чтобы backdrop-filter не «глючил» на iOS Safari во время
          анимации перехода между состояниями (баг с блюр-артефактом) */}
      <div
        className="shrink-0 px-4 py-2.5 pb-4"
        style={{
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

      {/* Контекстное меню сообщения */}
      <AnimatePresence>
        {menuMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm"
            onClick={() => setMenuMessage(null)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl rounded-t-3xl p-6"
              style={{
                background: 'rgba(255,255,255,0.75)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                boxShadow: '0 -20px 60px rgba(0,0,0,0.2)',
              }}
            >
              {/* Быстрые реакции */}
              <div className="flex items-center justify-between gap-2 mb-4">
                {reactionEmojis.map((emoji) => (
                  <motion.button
                    key={emoji}
                    whileTap={{ scale: 0.8 }}
                    whileHover={{ scale: 1.2 }}
                    onClick={handleReaction}
                    className="text-2xl w-11 h-11 flex items-center justify-center rounded-full"
                  >
                    {emoji}
                  </motion.button>
                ))}
              </div>

              <div className="space-y-1">
                <motion.button
                  whileHover={{ backgroundColor: '#F9FAFB' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleReply}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-left"
                >
                  <Reply size={20} style={{ color: 'var(--theme-primary)' }} />
                  <span className="font-heading font-semibold text-sm text-[#1A1A1A]">Ответить</span>
                </motion.button>

                <motion.button
                  whileHover={{ backgroundColor: '#F9FAFB' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleForward}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-left"
                >
                  <Forward size={20} style={{ color: 'var(--theme-primary)' }} />
                  <span className="font-heading font-semibold text-sm text-[#1A1A1A]">Переслать</span>
                </motion.button>

                <motion.button
                  whileHover={{ backgroundColor: '#F9FAFB' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleMarkUnread}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-left"
                >
                  <EyeOff size={20} style={{ color: 'var(--theme-primary)' }} />
                  <span className="font-heading font-semibold text-sm text-[#1A1A1A]">Отметить непрочитанным</span>
                </motion.button>

                {!isVoiceMessage(menuMessage.text) && !isStickerMessage(menuMessage.text) && !isImageMessage(menuMessage.text) && (
                  <motion.button
                    whileHover={{ backgroundColor: '#F9FAFB' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCopyText}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-left"
                  >
                    <Copy size={20} style={{ color: 'var(--theme-primary)' }} />
                    <span className="font-heading font-semibold text-sm text-[#1A1A1A]">Скопировать текст</span>
                  </motion.button>
                )}

                <motion.button
                  whileHover={{ backgroundColor: '#F9FAFB' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleReport}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-left"
                >
                  <Flag size={20} className="text-[#EF4444]" />
                  <span className="font-heading font-semibold text-sm text-[#EF4444]">Пожаловаться</span>
                </motion.button>

                <motion.button
                  whileHover={{ backgroundColor: '#F9FAFB' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDeleteMessage}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-left"
                >
                  <Trash2 size={20} className="text-[#EF4444]" />
                  <span className="font-heading font-semibold text-sm text-[#EF4444]">Удалить</span>
                </motion.button>

                <motion.button
                  whileHover={{ backgroundColor: '#F9FAFB' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSelectMessage}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-left"
                >
                  <CheckSquare size={20} style={{ color: 'var(--theme-primary)' }} />
                  <span className="font-heading font-semibold text-sm text-[#1A1A1A]">Выбрать</span>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
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
    </div>
  );
}

