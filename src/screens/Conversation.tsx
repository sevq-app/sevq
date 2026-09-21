import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, MoreVertical, Plus, Send, Phone, Bell, Check, Search, X, Mic } from 'lucide-react';
import { Avatar } from '@/components/Avatar';
import type { Chat, Message } from '@/data/mock';

interface ConversationProps {
  chat: Chat;
  onBack: () => void;
  fontSize: number;
}

export function Conversation({ chat, onBack, fontSize }: ConversationProps) {
  const [messages, setMessages] = useState<Message[]>(chat.messages);
  const [input, setInput] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const msg: Message = {
      id: `m-${Date.now()}`,
      senderId: 'me',
      text: input.trim(),
      time: new Date().toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, msg]);
    setInput('');
    setTimeout(() => {
      const reply: Message = {
        id: `m-${Date.now()}-r`,
        senderId: chat.id,
        text: 'Принято! 👍',
        time: new Date().toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, reply]);
    }, 1500);
  };

  const handleMute = (duration: string) => {
    alert(`🔕 Уведомления отключены: ${duration}`);
    setShowNotificationsModal(false);
    setShowMenu(false);
  };

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
        {messages.map((msg) => {
          const isMe = msg.senderId === 'me';
          return (
            <motion.div
              key={msg.id}
              initial={isMe ? { scale: 0.95, opacity: 0 } : { y: 15, opacity: 0 }}
              animate={isMe ? { scale: 1, opacity: 1 } : { y: 0, opacity: 1 }}
              transition={isMe ? { duration: 0.22, ease: 'easeOut' } : { duration: 0.4, type: 'spring', bounce: 0.5 }}
              className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
            >
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
            </motion.div>
          );
        })}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 bg-white md:pb-4 pb-20" style={{ boxShadow: '0 -4px 16px rgba(101,70,199,0.04)' }}>
        <div className="flex items-center gap-2">
          {/* Кнопка вложений (скрепка) */}
          <motion.button
            whileTap={{ scale: 0.9, y: 2 }}
            onClick={() => alert('📎 Панель вложений будет добавлена позже')}
            className="shrink-0 w-11 h-11 rounded-full bg-sevchik-cream flex items-center justify-center text-sevchik-purple btn-3d"
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
          >
            <Plus size={22} />
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
              <motion.button
                key="mic"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                whileTap={{ scale: 0.88, y: 2 }}
                onClick={() => alert('🎤 Запись голосового будет добавлена позже')}
                className="shrink-0 w-11 h-11 rounded-full flex items-center justify-center text-white btn-3d relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #4FD3C8, #38b2ac)', boxShadow: '0 4px 14px rgba(79,211,200,0.35)' }}
              >
                <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.2) 0%, transparent 50%)' }} />
                <Mic size={20} className="relative z-10" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

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

