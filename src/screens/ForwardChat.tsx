import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Send } from 'lucide-react';
import { Avatar } from '@/components/Avatar';
import { chats } from '@/data/mock';

interface ForwardChatProps {
  excludeChatId: string;
  onClose: () => void;
  onSend: (chatIds: string[]) => void;
}

export function ForwardChat({ excludeChatId, onClose, onSend }: ForwardChatProps) {
  const [query, setQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);

  const filtered = chats
    .filter((c) => c.id !== excludeChatId)
    .filter((c) => c.name.toLowerCase().includes(query.toLowerCase()));

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSend = () => {
    if (selectedIds.length === 0) return;
    onSend(selectedIds);
  };

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 28, stiffness: 300 }}
      className="fixed inset-0 z-50 flex flex-col bg-[var(--bg-main)]"
    >
      {/* Header */}
      <div className="sticky top-0 z-10 pt-4 pb-3 px-4 sm:px-6 bg-transparent">
        <div className="flex items-center justify-between mb-4">
          <h1 className="font-heading font-bold text-lg text-sevchik-text">Переслать</h1>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowCloseConfirm(true)}
            className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-sevchik-textSecondary"
            style={{ boxShadow: '0 4px 12px rgba(15,23,42,0.07)' }}
          >
            <X size={20} />
          </motion.button>
        </div>

        <div className="relative">
          <Search
            size={20}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Найти чат или канал"
            className="w-full text-[var(--text-main)] placeholder:text-[var(--text-secondary)] rounded-card py-3.5 pl-12 pr-4 focus:outline-none font-body text-sm bg-[var(--bg-input)]"
          />
        </div>
      </div>

      {/* Список чатов */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-28">
        <div className="space-y-2">
          {filtered.map((chat, i) => {
            const isSelected = selectedIds.includes(chat.id);
            return (
              <motion.button
                key={chat.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => toggleSelect(chat.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 bg-white rounded-2xl text-left btn-3d ${
                  isSelected ? 'ring-2 ring-[#6546C7]' : ''
                }`}
                style={{ boxShadow: '0 8px 24px rgba(15,23,42,0.06)' }}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all ${
                    isSelected ? 'bg-[#6546C7]' : 'bg-[#E5E7EB]'
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

                <Avatar initials={chat.initials} color={chat.avatarColor} size="md" online={chat.online} />
                <span className="font-heading font-bold text-sevchik-text truncate">{chat.name}</span>
              </motion.button>
            );
          })}
          {filtered.length === 0 && (
            <div className="text-center py-12 text-sevchik-textSecondary font-body">
              Ничего не найдено
            </div>
          )}
        </div>
      </div>

      {/* Нижняя фиолетовая плашка */}
      <div className="fixed bottom-0 left-0 right-0 px-4 sm:px-6 pb-6 pt-3 max-w-2xl mx-auto">
        <motion.button
          whileHover={selectedIds.length > 0 ? { scale: 1.02 } : {}}
          whileTap={selectedIds.length > 0 ? { scale: 0.98 } : {}}
          onClick={handleSend}
          disabled={selectedIds.length === 0}
          className="w-full py-4 rounded-2xl text-white font-heading font-bold text-base flex items-center justify-center gap-2 relative overflow-hidden disabled:opacity-40"
          style={{
            background: '#6546C7',
            boxShadow: selectedIds.length > 0 ? '0 4px 14px rgba(101,70,199,0.22)' : 'none',
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
              className="w-full max-w-sm bg-white rounded-3xl p-6"
              style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}
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
