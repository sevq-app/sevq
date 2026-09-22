import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MoreVertical, Plus, Check, Trash2, CheckCheck, Star } from 'lucide-react';
import { Avatar } from '@/components/Avatar';
import { getDisplayContact } from '@/lib/contactOverrides';
import { useChatStore } from '@/store/chatStore';
import { previewText } from '@/lib/messagePreview';

interface ChatsProps {
  onOpenChat: (chatId: string) => void;
  onStartChat?: () => void;
  grayMode: boolean;
  fontSize: number;
}

export function Chats({ onOpenChat, onStartChat, grayMode, fontSize }: ChatsProps) {
  const [query, setQuery] = useState('');
  const chats = useChatStore((s) => s.chats);
  const markChatsRead = useChatStore((s) => s.markChatsRead);
  const deleteChats = useChatStore((s) => s.deleteChats);
  const [showMenu, setShowMenu] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Чат "Избранное" всегда закреплён первым, независимо от порядка в сторе
  const filtered = chats
    .filter((c) => c.name.toLowerCase().includes(query.toLowerCase()))
    .slice()
    .sort((a, b) => Number(!!b.isFavorites) - Number(!!a.isFavorites));

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const exitSelectMode = () => {
    setSelectMode(false);
    setSelectedIds([]);
    setShowMenu(false);
  };

  const markAllRead = () => {
    markChatsRead(selectedIds);
    exitSelectMode();
  };

  const deleteSelected = () => {
    deleteChats(selectedIds);
    exitSelectMode();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="sticky top-0 z-10 pt-4 pb-3 px-4 sm:px-6 bg-transparent">
        {selectMode ? (
          /* Шапка в режиме выбора */
          <div className="flex items-center justify-between mb-4">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={exitSelectMode}
              className="px-4 py-2 rounded-2xl font-heading font-bold text-sm text-white"
              style={{
                background: '#6546C7',
                boxShadow: '0 4px 12px rgba(101,70,199,0.2)',
              }}
            >
              Готово
            </motion.button>
            <span className="font-heading font-bold text-sm text-sevchik-textSecondary">
              Выбрано: {selectedIds.length}
            </span>
          </div>
        ) : (
          /* Обычная шапка */
          <div className="flex items-center justify-between mb-4">
            <h1 className="font-heading font-extrabold text-xl text-sevchik-text">
              Чаты
            </h1>
            <div className="flex items-center gap-2">
              {/* Кнопка «три точки» */}
              <div className="relative">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setShowMenu(!showMenu)}
                  className="w-12 h-12 rounded-full flex items-center justify-center text-sevchik-textSecondary bg-white"
                  style={{ boxShadow: '0 4px 12px rgba(15,23,42,0.07)' }}
                >
                  <MoreVertical size={24} />
                </motion.button>

                {/* Выпадающее меню */}
                <AnimatePresence>
                  {showMenu && !selectMode && (
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
                        className="absolute right-0 top-14 w-56 bg-white rounded-2xl overflow-hidden z-40"
                        style={{ boxShadow: '0 12px 32px rgba(15,23,42,0.12)' }}
                      >
                        <motion.button
                          whileHover={{ backgroundColor: '#F9FAFB' }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setShowMenu(false);
                            setSelectMode(true);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
                        >
                          <Check size={19} style={{ color: 'var(--text-secondary)' }} />
                          <span className="font-heading font-semibold text-sm text-[#1A1A1A]">
                            Выбрать
                          </span>
                        </motion.button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* Кнопка «+» */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.05 }}
                onClick={() => onStartChat?.()}
                className="w-12 h-12 rounded-full flex items-center justify-center text-white"
                style={{
                  background: '#6546C7',
                  boxShadow: '0 4px 12px rgba(101,70,199,0.2)',
                }}
              >
                <Plus size={24} />
              </motion.button>
            </div>
          </div>
        )}

        {/* Поиск */}
        <div className="relative">
          <Search
            size={20}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Люди, группы и сообщения"
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
      <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 pb-28 md:pb-0">
        <div className="space-y-3">
          {filtered.map((chat, i) => {
            const isSelected = selectedIds.includes(chat.id);
            const { name: displayName, initials: displayInitials } = getDisplayContact(chat);
            return (
              <motion.button
                key={chat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (selectMode && !chat.isFavorites) {
                    toggleSelect(chat.id);
                  } else {
                    onOpenChat(chat.id);
                  }
                }}
                className="w-full h-24 flex items-center gap-4 px-4 py-4 rounded-2xl text-left btn-3d"
                style={{
                  background: grayMode ? 'rgba(45,45,58,0.65)' : 'rgba(255,255,255,0.65)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  boxShadow: isSelected
                    ? '0 0 0 2px #6546C7, 0 8px 24px rgba(15,23,42,0.06)'
                    : '0 8px 24px rgba(15,23,42,0.06)',
                }}
              >
                {/* Кружочек выбора (только в режиме выбора) — нейтральный,
                    без выбора — просто тонкое кольцо в тон фона карточки.
                    У системного чата "Избранное" его нет — он неудаляемый.
                    Появление анимировано (а не мгновенный reflow), иначе
                    резкий сдвиг контента в паре с backdrop-filter на долю
                    кадра даёт цветной артефакт-полоску на аватарке. */}
                <AnimatePresence initial={false}>
                  {selectMode && !chat.isFavorites && (
                    <motion.div
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: 24, opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{ duration: 0.18, ease: 'easeOut' }}
                      className="shrink-0 overflow-hidden"
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors ${
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
                    </motion.div>
                  )}
                </AnimatePresence>

                <Avatar
                  initials={displayInitials}
                  color={chat.avatarColor}
                  size="lg"
                  online={chat.online}
                  ringColor={chat.online ? '#4FD3C8' : undefined}
                  icon={chat.isFavorites ? <Star size={28} fill="white" strokeWidth={0} /> : undefined}
                />
                <div className="flex-1 min-w-0 relative z-10">
                  <div className="flex items-center justify-between gap-2">
                    <h3
                      className="font-heading font-bold text-sevchik-text truncate"
                      style={{ fontSize: `${fontSize + 2}px` }}
                    >
                      {displayName}
                    </h3>
                    <span
                      className="text-xs text-sevchik-textSecondary font-body shrink-0"
                      style={{ fontSize: `${fontSize}px` }}
                    >
                      {chat.time}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-1.5">
                    <p
                      className="text-sm text-sevchik-textSecondary font-body truncate"
                      style={{ fontSize: `${fontSize}px` }}
                    >
                      {chat.isFavorites ? previewText(chat.messages[chat.messages.length - 1]?.text, chat.lastMessage) : chat.lastMessage}
                    </p>
                    {chat.unread > 0 && (
                      <span
                        className="shrink-0 text-white text-xs font-heading font-bold rounded-pill min-w-[26px] h-[26px] px-2 flex items-center justify-center"
                        style={{
                          background: '#6546C7',
                          boxShadow: '0 3px 10px rgba(101,70,199,0.18)',
                        }}
                      >
                        <span style={{ fontSize: `${fontSize}px` }}>{chat.unread}</span>
                      </span>
                    )}
                    {chat.isNew && chat.unread === 0 && (
                      <span
                        className="shrink-0 text-white text-[10px] font-heading font-bold rounded-pill px-2 h-[20px] flex items-center justify-center"
                        style={{
                          background: '#4FD3C8',
                          boxShadow: '0 3px 10px rgba(79,211,200,0.18)',
                        }}
                      >
                        <span style={{ fontSize: `${fontSize}px` }}>Новое</span>
                      </span>
                    )}
                  </div>
                </div>
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

      {/* Нижняя панель действий (только в режиме выбора) */}
      <AnimatePresence>
        {selectMode && selectedIds.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-20 md:bottom-6 left-0 right-0 px-4 sm:px-6 max-w-2xl mx-auto z-20"
          >
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={markAllRead}
                className="flex-1 py-4 rounded-2xl text-white font-heading font-bold text-base flex items-center justify-center gap-2 relative overflow-hidden"
                style={{
                  background: '#4FD3C8',
                  boxShadow: '0 4px 14px rgba(79,211,200,0.2)',
                }}
              >
                <CheckCheck size={20} className="relative z-10" />
                <span className="relative z-10">Прочитать всё</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={deleteSelected}
                className="flex-1 py-4 rounded-2xl text-white font-heading font-bold text-base flex items-center justify-center gap-2 relative overflow-hidden"
                style={{
                  background: '#EF4444',
                  boxShadow: '0 4px 14px rgba(239,68,68,0.2)',
                }}
              >
                <Trash2 size={20} className="relative z-10" />
                <span className="relative z-10">Удалить</span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
