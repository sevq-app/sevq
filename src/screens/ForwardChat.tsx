import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Send, Check } from 'lucide-react';
import { Avatar } from '@/components/Avatar';
import { useChatStore } from '@/store/chatStore';
import { getDisplayContact } from '@/lib/contactOverrides';

interface ForwardChatProps {
  excludeChatId: string;
  onClose: () => void;
  onSend: (chatIds: string[]) => void;
}

export function ForwardChat({ excludeChatId, onClose, onSend }: ForwardChatProps) {
  const chats = useChatStore((s) => s.chats);
  const [query, setQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);

  const candidates = chats.filter((c) => c.id !== excludeChatId);
  const topFive = candidates
    .slice()
    .sort((a, b) => b.messages.length - a.messages.length)
    .slice(0, 5);
  const filtered = candidates.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()));

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSend = () => {
    if (selectedIds.length === 0) return;
    onSend(selectedIds);
  };

  const handleCloseClick = () => {
    if (selectedIds.length > 0) {
      setShowCloseConfirm(true);
    } else {
      onClose();
    }
  };

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 28, stiffness: 300 }}
      className="fixed inset-0 z-50 flex flex-col chat-wallpaper"
    >
      {/* Header */}
      <div className="sticky top-0 z-10 pt-4 pb-3 px-4 sm:px-6 bg-transparent">
        <div className="flex items-center justify-between mb-4">
          <h1 className="font-heading font-bold text-lg text-sevchik-text">Переслать</h1>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleCloseClick}
            className="w-11 h-11 rounded-full bg-sevchik-cream text-sevchik-textSecondary btn-3d flex items-center justify-center"
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
          >
            <X size={20} />
          </motion.button>
        </div>

        <div className="relative">
          <Search
            size={20}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Найти чат или контакт"
            className="w-full text-white placeholder:text-white/70 rounded-card py-3.5 pl-12 pr-4 focus:outline-none font-body text-sm"
            style={{
              background: 'rgba(255,152,72,0.65)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              boxShadow: '0 4px 14px rgba(255,152,72,0.28)',
            }}
          />
        </div>
      </div>

      {/* Список чатов */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 pb-28">
        {/* Быстрый доступ: часто отправляете */}
        {!query && topFive.length > 0 && (
          <div className="mb-4">
            <h2 className="text-xs font-bold text-white/70 uppercase tracking-wider mb-3 ml-1">
              Часто отправляете
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
              {topFive.map((chat) => {
                const isSelected = selectedIds.includes(chat.id);
                const { name, initials } = getDisplayContact(chat);
                return (
                  <button
                    key={chat.id}
                    onClick={() => toggleSelect(chat.id)}
                    className="flex flex-col items-center gap-1.5 shrink-0 w-16"
                  >
                    <div className="relative">
                      <Avatar initials={initials} color={chat.avatarColor} size="lg" online={chat.online} />
                      {isSelected && (
                        <div
                          className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center border-2 border-white"
                          style={{ background: '#6546C7' }}
                        >
                          <Check size={12} className="text-white" />
                        </div>
                      )}
                    </div>
                    <span className="text-xs font-body text-white/90 truncate w-full text-center">
                      {name.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="space-y-2">
          {filtered.map((chat, i) => {
            const isSelected = selectedIds.includes(chat.id);
            const { name, initials } = getDisplayContact(chat);
            return (
              <motion.button
                key={chat.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => toggleSelect(chat.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left btn-3d ${
                  isSelected ? 'ring-2 ring-[#6546C7]' : ''
                }`}
                style={{
                  background: 'rgba(255,255,255,0.65)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  boxShadow: '0 8px 24px rgba(15,23,42,0.06)',
                }}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all ${
                    isSelected ? 'bg-[#6546C7]' : 'border-2 border-[var(--text-secondary)]/25 bg-transparent'
                  }`}
                >
                  {isSelected && (
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>

                <Avatar initials={initials} color={chat.avatarColor} size="md" online={chat.online} />
                <span className="font-heading font-bold text-sevchik-text truncate">{name}</span>
              </motion.button>
            );
          })}
          {filtered.length === 0 && (
            <div className="text-center py-12 text-white/80 font-body">
              Ничего не найдено
            </div>
          )}
        </div>
      </div>

      {/* Нижняя плашка отправки */}
      <div className="fixed bottom-0 left-0 right-0 px-4 sm:px-6 pb-6 pt-3 max-w-2xl mx-auto">
        <motion.button
          whileHover={selectedIds.length > 0 ? { scale: 1.02 } : {}}
          whileTap={selectedIds.length > 0 ? { scale: 0.98 } : {}}
          onClick={handleSend}
          disabled={selectedIds.length === 0}
          className="w-full py-4 rounded-2xl text-white font-heading font-bold text-base flex items-center justify-center gap-2 relative overflow-hidden disabled:opacity-40"
          style={{
            background: 'var(--theme-message-gradient)',
            boxShadow: selectedIds.length > 0 ? '0 4px 14px rgba(101,70,199,0.22)' : 'none',
            backdropFilter: 'blur(8px)',
          }}
        >
          <Send size={20} className="relative z-10" />
          <span className="relative z-10">
            Отправить{selectedIds.length > 0 ? ` (${selectedIds.length})` : ''}
          </span>
        </motion.button>
      </div>

      {/* Подтверждение закрытия */}
      <AnimatePresence>
        {showCloseConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-6"
            onClick={() => setShowCloseConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-3xl p-6"
              style={{
                background: 'rgba(255,255,255,0.85)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
              }}
            >
              <h3 className="font-heading font-extrabold text-lg text-[#1A1A1A] text-center mb-6">
                Прервать отправку?
              </h3>
              <div className="flex flex-col gap-2">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="w-full py-3.5 rounded-2xl font-heading font-bold text-base text-[#EF4444]"
                >
                  Прервать
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowCloseConfirm(false)}
                  className="w-full py-3.5 rounded-2xl bg-[#F3F4F6] text-[#4B5563] font-heading font-bold text-base"
                >
                  Не прерывать
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
