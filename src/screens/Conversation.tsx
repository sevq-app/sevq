import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, MoreVertical, Send, Phone, Bell, Check, Search, X, Mic, Paperclip, Play, Pause } from 'lucide-react';
import { Avatar } from '@/components/Avatar';
import type { Chat, Message } from '@/data/mock';

interface ConversationProps {
  chat: Chat;
  onBack: () => void;
  fontSize: number;
}

// Компонент голосового сообщения
function VoiceMessageBubble({ duration, time, isMe }: { duration: string; time: string; isMe: boolean }) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-2xl ${isMe ? 'text-white rounded-br-sm' : 'bg-white text-[var(--text-main)] rounded-bl-sm'}`}
        style={{
          minWidth: '220px',
          maxWidth: '280px',
          background: isMe ? 'linear-gradient(135deg, #8366D9, #6546C7)' : undefined,
          boxShadow: isMe ? '0 4px 16px rgba(101,70,199,0.2)' : '0 4px 16px rgba(101,70,199,0.06)',
        }}
      >
        {/* Кнопка Play/Pause */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsPlaying(!isPlaying)}
          className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
          style={{
            background: isMe ? 'rgba(255,255,255,0.2)' : 'linear-gradient(135deg, #6546C7, #8366D9)',
          }}
        >
          {isPlaying ? (
            <Pause size={18} className="text-white" />
          ) : (
            <Play size={18} className="text-white ml-0.5" />
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
                background: isMe ? 'rgba(255,255,255,0.5)' : '#6546C7',
              }}
            />
          ))}
        </div>

        {/* Таймер */}
        <span className={`text-xs font-mono font-bold shrink-0 ${isMe ? 'text-white/90' : 'text-[#6546C7]'}`}>
          {duration}
        </span>
      </div>

      {/* Время */}
      <p className={`text-[10px] mt-1 ${isMe ? 'text-sevchik-textSecondary/60' : 'text-sevchik-textSecondary'}`}>
        {time}
      </p>
    </div>
  );
}

export function Conversation({ chat, onBack, fontSize }: ConversationProps) {
  const [messages, setMessages] = useState<Message[]>(chat.messages);
  const [input, setInput] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  
  // Состояния для записи голосового
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showHoldHint, setShowHoldHint] = useState(false);
  
  const endRef = useRef<HTMLDivElement>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const holdTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Таймер записи
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

  const handleSend = () => {
    if (!input.trim()) return;
    const msg: Message = {
      id: `m-${Date.now()}`,
      senderId: 'me',
      text: input.trim(),
      time: new Date().toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, msg]);
    setInput('');
    setTimeout(() => {
      const reply: Message = {
        id: `m-${Date.now()}-r`,
        senderId: chat.id,
        text: 'Принято! 👍',
        time: new Date().toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, reply]);
    }, 1500);
  };

  const handleMute = (duration: string) => {
    alert(`🔕 Уведомления отключены: ${duration}`);
    setShowNotificationsModal(false);
    setShowMenu(false);
  };

  // Форматирование времени записи (мм:сс,мс) - для таймера во время записи
  const formatRecordingTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = Math.floor((ms % 1000) / 10);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')},${milliseconds.toString().padStart(2, '0')}`;
  };

  // Форматирование длительности голосового (только мм:сс) - для отображения
  const formatVoiceDuration = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Начало удержания микрофона
  const handleMicHoldStart = () => {
    setShowHoldHint(false);
    holdTimeoutRef.current = setTimeout(() => {
      setIsRecording(true);
      setRecordingTime(0);
    }, 300);
  };

  // Конец удержания микрофона
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
        text: `voice:${duration}`, // ✅ Ключевой фикс: добавлен маркер "voice:"
        time: new Date().toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, voiceMsg]);
      setIsRecording(false);
      setRecordingTime(0);
      
      setTimeout(() => {
        const reply: Message = {
          id: `voice-${Date.now()}-r`,
          senderId: chat.id,
          text: 'Прослушал голосовое 👂',
          time: new Date().toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages(prev => [...prev, reply]);
      }, 1500);
    } else {
      setShowHoldHint(true);
      setTimeout(() => setShowHoldHint(false), 2000);
    }
  };

  // Отмена записи
  const handleCancelRecording = () => {
    setIsRecording(false);
    setRecordingTime(0);
  };

  // Проверка, является ли сообщение голосовым
  const isVoiceMessage = (text: string) => text.startsWith('voice:'); // ✅ Ключевой фикс: теперь проверяем "voice:"

  // Получение длительности из голосового сообщения
  const getVoiceDuration = (text: string) => text.replace('voice:', ''); // ✅ Ключевой фикс: теперь парсим "voice:00:04"

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="sticky top-0 z-10 px-4 py-3 flex items-center gap-3 bg-transparent">
        <motion.button
          whileTap={{ scale: 0.9, y: 2 }}
          onClick={onBack}
          className="p-2 rounded-full bg-sevchik-cream text-sevchik-text btn-3d"
          style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
        >
          <ArrowLeft size={20} />
        </motion.button>
        <Avatar initials={chat.initials} color={chat.avatarColor} size="sm" online={chat.online} />
        <div className="flex-1 min-w-0">
          <h2 className="font-heading font-bold text-sevchik-text truncate">{chat.name}</h2>
          <p className={`text-xs font-body flex items-center gap-1 ${chat.online ? 'text-sevchik-mint' : 'text-sevchik-textSecondary'}`}>
            {chat.online && <span className="w-1.5 h-1.5 rounded-full bg-sevchik-mint" />}
            {chat.online ? 'в сети' : 'не в сети'}
          </p>
        </div>
        
        {/* Кнопка аудиозвонка */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.05 }}
          onClick={() => alert('📞 Функция звонков скоро будет доступна!')}
          className="p-2 rounded-full bg-sevchik-cream text-sevchik-textSecondary btn-3d"
          style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
        >
          <Phone size={20} />
        </motion.button>

        {/* Кнопка "три точки" */}
        <div className="relative">
          <motion.button
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 rounded-full bg-sevchik-cream text-sevchik-textSecondary btn-3d"
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
          >
            <MoreVertical size={20} />
          </motion.button>

          {/* Выпадающее меню */}
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
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  className="absolute right-0 top-14 w-64 bg-white rounded-2xl overflow-hidden z-40"
                  style={{ boxShadow: '0 12px 40px rgba(101,70,199,0.2)' }}
                >
                  {/* Пункт 1: Уведомления */}
                  <motion.button
                    whileHover={{ backgroundColor: '#F9FAFB' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setShowMenu(false);
                      setShowNotificationsModal(true);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3.5 text-left border-b border-[#F3F4F6]"
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{
                        background: 'linear-gradient(135deg, #FF9848, #FFB87A)',
                        boxShadow: '0 3px 10px rgba(255,152,72,0.3)',
                      }}
                    >
                      <Bell size={18} className="text-white" />
                    </div>
                    <span className="font-heading font-semibold text-sm text-[#1A1A1A]">Уведомления</span>
                  </motion.button>

                  {/* Пункт 2: Выбрать */}
                  <motion.button
                    whileHover={{ backgroundColor: '#F9FAFB' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setShowMenu(false);
                      alert('✅ Режим выбора будет добавлен позже');
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3.5 text-left border-b border-[#F3F4F6]"
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{
                        background: 'linear-gradient(135deg, #6546C7, #8366D9)',
                        boxShadow: '0 3px 10px rgba(101,70,199,0.3)',
                      }}
                    >
                      <Check size={18} className="text-white" />
                    </div>
                    <span className="font-heading font-semibold text-sm text-[#1A1A1A]">Выбрать</span>
                  </motion.button>

                  {/* Пункт 3: Найти */}
                  <motion.button
                    whileHover={{ backgroundColor: '#F9FAFB' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setShowMenu(false);
                      alert('🔍 Поиск по переписке будет добавлен позже');
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{
                        background: 'linear-gradient(135deg, #4FD3C8, #38b2ac)',
                        boxShadow: '0 3px 10px rgba(79,211,200,0.3)',
                      }}
                    >
                      <Search size={18} className="text-white" />
                    </div>
                    <span className="font-heading font-semibold text-sm text-[#1A1A1A]">Найти</span>
                  </motion.button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map(msg => {
          const isMe = msg.senderId === 'me';
          const isVoice = isVoiceMessage(msg.text); // ✅ Теперь работает корректно
          const voiceDuration = isVoice ? getVoiceDuration(msg.text) : ''; // ✅ Теперь работает корректно

          return (
            <motion.div
              key={msg.id}
              initial={isMe ? { scale: 0.95, opacity: 0 } : { y: 15, opacity: 0 }}
              animate={isMe ? { scale: 1, opacity: 1 } : { y: 0, opacity: 1 }}
              transition={isMe ? { duration: 0.22, ease: 'easeOut' } : { duration: 0.4, type: 'spring', bounce: 0.5 }}
              className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
            >
              {isVoice ? (
                <VoiceMessageBubble duration={voiceDuration} time={msg.time} isMe={isMe} />
              ) : (
                <div
                  className={`max-w-[75%] px-4 py-2.5 font-body text-sm relative overflow-hidden ${
                    isMe
                      ? 'message-outgoing-pattern text-white rounded-2xl rounded-br-sm'
                      : 'message-incoming-pattern text-[var(--text-main)] rounded-2xl rounded-bl-sm'
                  }`}
                  style={{ boxShadow: isMe ? '0 4px 16px rgba(101,70,199,0.2)' : '0 4px 16px rgba(101,70,199,0.06)' }}
                >
                  <p className="relative z-10" style={{ fontSize: `${fontSize}px` }}>{msg.text}</p>
                  <p className={`text-[10px] mt-1 relative z-10 ${isMe ? 'text-white/50' : 'text-sevchik-textSecondary'}`} style={{ fontSize: `${fontSize}px` }}>{msg.time}</p>
                </div>
              )}
            </motion.div>
          );
        })}
        <div ref={endRef} />
      </div>

      {/* Input Panel */}
      <AnimatePresence mode="wait">
        {isRecording ? (
          /* Панель записи голосового с анимацией */
          <motion.div
            key="recording"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="px-4 py-3 bg-white md:pb-4 pb-20"
            style={{ boxShadow: '0 -4px 16px rgba(101,70,199,0.04)' }}
          >
            <div className="flex items-center gap-3">
              {/* Кнопка отмены */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleCancelRecording}
                className="shrink-0 w-11 h-11 rounded-full bg-[#F3F4F6] flex items-center justify-center text-[#6B7280]"
              >
                <X size={22} />
              </motion.button>

              {/* Анимированный микрофон с волнами */}
              <div className="flex-1 flex items-center justify-center gap-3">
                {/* Пульсирующие круги вокруг микрофона */}
                <div className="relative">
                  <motion.div
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.6, 0, 0.6],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    className="absolute inset-0 rounded-full bg-red-500/30"
                    style={{ width: '60px', height: '60px', left: '-8px', top: '-8px' }}
                  />
                  <motion.div
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.4, 0, 0.4],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: 0.3,
                    }}
                    className="absolute inset-0 rounded-full bg-red-500/20"
                    style={{ width: '70px', height: '70px', left: '-13px', top: '-13px' }}
                  />
                  
                  {/* Центральный микрофон */}
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 0.8,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    className="relative w-11 h-11 rounded-full flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, #FF6B6B, #EF4444)',
                      boxShadow: '0 4px 14px rgba(239,68,68,0.4)',
                    }}
                  >
                    <Mic size={20} className="text-white relative z-10" />
                  </motion.div>
                </div>

                {/* Таймер */}
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{
                      opacity: [1, 0.3, 1],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    className="w-2 h-2 rounded-full bg-red-500"
                  />
                  <span className="font-mono text-sm font-bold text-red-500">
                    {formatRecordingTime(recordingTime)}
                  </span>
                </div>
              </div>

              {/* Кнопка отправки */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleMicHoldEnd}
                className="shrink-0 w-11 h-11 rounded-full flex items-center justify-center text-white"
                style={{
                  background: 'linear-gradient(135deg, #4FD3C8, #38b2ac)',
                  boxShadow: '0 4px 14px rgba(79,211,200,0.35)',
                }}
              >
                <Send size={20} />
              </motion.button>
            </div>
          </motion.div>
        ) : (
          /* Обычная панель ввода */
          <motion.div
            key="input"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="px-4 py-3 bg-white md:pb-4 pb-20"
            style={{ boxShadow: '0 -4px 16px rgba(101,70,199,0.04)' }}
          >
            <div className="flex items-center gap-2">
              {/* Кнопка вложений (скрепка) */}
              <motion.button
                whileTap={{ scale: 0.9, y: 2 }}
                whileHover={{ scale: 1.05 }}
                onClick={() => alert('📎 Панель вложений будет добавлена позже')}
                className="shrink-0 w-11 h-11 rounded-full bg-sevchik-cream flex items-center justify-center text-sevchik-purple btn-3d"
                style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
              >
                <Paperclip size={22} />
              </motion.button>

              {/* Поле ввода */}
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Написать сообщение..."
                className="flex-1 bg-sevchik-cream/60 rounded-btn py-3 px-4 text-sevchik-text placeholder:text-sevchik-textSecondary/60 focus:outline-none focus:ring-2 focus:ring-sevchik-purple/30 font-body text-sm"
              />

              {/* Динамическая кнопка: микрофон или отправка */}
              <AnimatePresence mode="wait">
                {input.trim() ? (
                  <motion.button
                    key="send"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    whileTap={{ scale: 0.88, y: 2 }}
                    onClick={handleSend}
                    className="shrink-0 w-11 h-11 rounded-full flex items-center justify-center text-white btn-3d relative overflow-hidden"
                    style={{ background: 'linear-gradient(135deg, #8366D9, #6546C7)', boxShadow: '0 4px 14px rgba(101,70,199,0.35)' }}
                  >
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.2) 0%, transparent 50%)' }} />
                    <Send size={20} className="relative z-10" />
                  </motion.button>
                ) : (
                  <div className="relative">
                    {/* Подсказка "Удерживайте для записи" */}
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
                      className="shrink-0 w-11 h-11 rounded-full flex items-center justify-center text-white btn-3d relative overflow-hidden"
                      style={{ background: 'linear-gradient(135deg, #4FD3C8, #38b2ac)', boxShadow: '0 4px 14px rgba(79,211,200,0.35)' }}
                    >
                      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.2) 0%, transparent 50%)' }} />
                      <Mic size={20} className="relative z-10" />
                    </motion.button>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Модальное окно "Уведомления" (шторка снизу) */}
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
              {/* Заголовок */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-heading font-extrabold text-xl text-[#1A1A1A]">Отключить уведомления</h3>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowNotificationsModal(false)}
                  className="w-10 h-10 rounded-full bg-[#F3F4F6] flex items-center justify-center text-[#6B7280]"
                >
                  <X size={20} />
                </motion.button>
              </div>

              {/* Пункты */}
              <div className="space-y-2">
                {[
                  { label: 'На 1 час', color: '#6546C7' },
                  { label: 'На 4 часа', color: '#6546C7' },
                  { label: 'На 24 часа', color: '#6546C7' },
                  { label: 'Навсегда', color: '#EF4444' },
                ].map(item => (
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

              {/* Кнопка "Отменить" */}
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
    </div>
  );
}

