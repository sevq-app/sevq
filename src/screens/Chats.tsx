import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MoreVertical, Plus, Check, Trash2, CheckCheck } from 'lucide-react';
import { Avatar } from '@/components/Avatar';
import { chats as initialChats } from '@/data/mock';
import type { Chat } from '@/data/mock';

interface ChatsProps {
  onOpenChat: (chat: Chat) => void;
  onStartChat?: () => void;
  grayMode: boolean;
  fontSize: number;
}

export function Chats({ onOpenChat, onStartChat, grayMode, fontSize }: ChatsProps) {
  const [query, setQuery] = useState('');
  const [chats, setChats] = useState(initialChats);
  const [showMenu, setShowMenu] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const filtered = chats.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase())
  );

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
    setChats((prev) =>
      prev.map((c) =>
        selectedIds.includes(c.id) ? { ...c, unread: 0 } : c
      )
    );
    exitSelectMode();
  };

  const deleteSelected = () => {
    setChats((prev) => prev.filter((c) => !selectedIds.includes(c.id)));
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
                background: 'linear-gradient(135deg, #8366D9, #6546C7)',
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
            <h1 className="font-heading font-semibold text-sm text-sevchik-textSecondary">
              Чаты
            </h1>
            <div className="flex items-center gap-2">
              {/* Кнопка «три точки» */}
              <div className="relative">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setShowMenu(!showMenu)}
                  className="w-11 h-11 rounded-full flex items-center justify-center text-sevchik-textSecondary bg-white"
                  style={{ boxShadow: '0 4px 12px rgba(15,23,42,0.07)' }}
                >
                  <MoreVertical size={22} />
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
                className="w-11 h-11 rounded-full flex items-center justify-center text-white"
                style={{
                  background: 'linear-gradient(135deg, #8366D9, #6546C7)',
                  boxShadow: '0 4px 12px rgba(101,70,199,0.2)',
                }}
              >
                <Plus size={22} />
              </motion.button>
            </div>
          </div>
        )}

        {/* Поиск */}
        <div className="relative">
          <Search
            size={20}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Люди, группы и сообщения"
            className="w-full text-[var(--text-main)] placeholder:text-[var(--text-secondary)] rounded-card py-3.5 pl-12 pr-4 focus:outline-none font-body text-sm relative overflow-hidden bg-[var(--bg-input)]"
            style={{
              background: 'var(--bg-input)',
              boxShadow: 'none',
            }}
          />
        </div>
      </div>

      {/* Список чатов */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-24 md:pb-0">
        <div className="space-y-2">
          {filtered.map((chat, i) => {
            const isSelected = selectedIds.includes(chat.id);
            return (
              <motion.button
                key={chat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (selectMode) {
                    toggleSelect(chat.id);
                  } else {
                    onOpenChat(chat);
                  }
                }}
                className={`w-full h-[72px] flex items-center gap-3 px-4 py-3 ${
                  grayMode ? 'bg-[#2d2d3a]' : 'bg-white'
                } rounded-2xl text-left btn-3d ${
                  isSelected ? 'ring-2 ring-[#6546C7]' : ''
                }`}
                style={{ boxShadow: '0 8px 24px rgba(15,23,42,0.06)' }}
              >
                {/* Кружочек выбора (только в режиме выбора) */}
                {selectMode && (
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all ${
                      isSelected
                        ? 'bg-[#6546C7]'
                        : 'bg-[#E5E7EB]'
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
                )}

                <Avatar
                  initials={chat.initials}
                  color={chat.avatarColor}
                  size="md"
                  online={chat.online}
                  ringColor={chat.online ? '#4FD3C8' : undefined}
                />
                <div className="flex-1 min-w-0 relative z-10">
                  <div className="flex items-center justify-between gap-2">
                    <h3
                      className="font-heading font-bold text-sevchik-text truncate"
                      style={{ fontSize: `${fontSize}px` }}
                    >
                      {chat.name}
                    </h3>
                    <span
                      className="text-xs text-sevchik-textSecondary font-body shrink-0"
                      style={{ fontSize: `${fontSize}px` }}
                    >
                      {chat.time}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-1">
                    <p
                      className="text-sm text-sevchik-textSecondary font-body truncate"
                      style={{ fontSize: `${fontSize}px` }}
                    >
                      {chat.lastMessage}
                    </p>
                    {chat.unread > 0 && (
                      <span
                        className="shrink-0 text-white text-xs font-heading font-bold rounded-pill min-w-[22px] h-[22px] px-1.5 flex items-center justify-center"
                        style={{
                          background: 'linear-gradient(135deg, #8366D9, #6546C7)',
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
                          background: 'linear-gradient(135deg, #6BE3D9, #4FD3C8)',
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
                  background: 'linear-gradient(135deg, #4FD3C8, #38b2ac)',
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
                  background: 'linear-gradient(135deg, #FF6B6B, #EF4444)',
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
