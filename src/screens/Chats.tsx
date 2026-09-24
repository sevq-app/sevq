import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MoreVertical, Plus, Check, Trash2, CheckCheck, Star, Loader2 } from 'lucide-react';
import { Avatar } from '@/components/Avatar';
import { getDisplayContact } from '@/lib/contactOverrides';
import { useChatStore } from '@/store/chatStore';
import { previewText } from '@/lib/messagePreview';
import { getOrCreateDirectChat, searchProfiles, type RemoteProfile } from '@/lib/messagingService';
import type { Chat } from '@/data/mock';

interface ChatsProps {
  onOpenChat: (chatId: string) => void;
  onStartChat?: () => void;
  grayMode: boolean;
  fontSize: number;
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function Chats({ onOpenChat, onStartChat, grayMode, fontSize }: ChatsProps) {
  const [query, setQuery] = useState('');
  const [profileResults, setProfileResults] = useState<RemoteProfile[]>([]);
  const [profilesLoading, setProfilesLoading] = useState(false);
  const [openingProfileId, setOpeningProfileId] = useState<string | null>(null);
  const chats = useChatStore((s) => s.chats);
  const markChatsRead = useChatStore((s) => s.markChatsRead);
  const deleteChats = useChatStore((s) => s.deleteChats);
  const upsertRealChat = useChatStore((s) => s.upsertRealChat);
  const [showMenu, setShowMenu] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  // Стекло (backdrop-filter) карточек отключается сразу при входе в режим
  // выбора и включается обратно только после того, как чекбоксы закончат
  // анимированно скрываться — иначе blur и reflow совпадают по кадру и
  // Chromium/WebKit оставляет на аватарке цветной артефакт, который не
  // смывается сам.
  const [cardsBlurred, setCardsBlurred] = useState(true);
  useEffect(() => {
    if (selectMode) {
      setCardsBlurred(false);
      return;
    }
    const t = setTimeout(() => setCardsBlurred(true), 200);
    return () => clearTimeout(t);
  }, [selectMode]);

  useEffect(() => {
    const searchQuery = query.trim();
    if (!searchQuery) {
      setProfileResults([]);
      setProfilesLoading(false);
      return;
    }

    let cancelled = false;
    setProfilesLoading(true);
    const timer = window.setTimeout(async () => {
      try {
        const found = await searchProfiles(searchQuery);
        if (!cancelled) setProfileResults(found);
      } catch (error) {
        console.error(error);
        if (!cancelled) setProfileResults([]);
      } finally {
        if (!cancelled) setProfilesLoading(false);
      }
    }, 400);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query]);

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

  const openProfileChat = async (profile: RemoteProfile) => {
    setOpeningProfileId(profile.id);
    try {
      const remoteChatId = await getOrCreateDirectChat(profile.id);
      const name = profile.full_name?.trim() || profile.username?.trim() || profile.email;
      const chat: Chat = {
        id: `real-${remoteChatId}`,
        name,
        avatarColor: '#6546C7',
        initials: initialsOf(name),
        lastMessage: '',
        time: '',
        unread: 0,
        online: false,
        isReal: true,
        remoteChatId,
        remoteUserId: profile.id,
        messages: [],
      };
      upsertRealChat(chat);
      onOpenChat(chat.id);
    } catch (error) {
      console.error(error);
    } finally {
      setOpeningProfileId(null);
    }
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
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск"
            className="w-full text-[var(--text-main)] placeholder:text-[var(--text-secondary)] rounded-card py-3.5 pl-12 pr-4 focus:outline-none font-body text-sm"
            style={{ background: '#F2F2F7' }}
          />
        </div>
      </div>

      {/* Список чатов */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 pb-28 md:pb-0">
        {!selectMode && query.trim() && (profilesLoading || profileResults.length > 0) && (
          <div className="mb-4">
            <h2 className="mb-2 ml-1 text-xs font-bold uppercase tracking-wider text-sevchik-textSecondary">Пользователи</h2>
            <div className="overflow-hidden rounded-2xl bg-white" style={{ boxShadow: '0 8px 24px rgba(15,23,42,0.06)' }}>
              {profilesLoading && profileResults.length === 0 ? (
                <div className="flex items-center justify-center gap-2 px-4 py-5 text-sm font-body text-sevchik-textSecondary">
                  <Loader2 size={16} className="animate-spin" /> Ищем пользователей...
                </div>
              ) : (
                profileResults.map((profile, index) => {
                  const name = profile.full_name?.trim() || profile.username?.trim() || profile.email;
                  const details = [profile.username && `@${profile.username}`, profile.phone].filter(Boolean).join(' · ');
                  return (
                    <motion.button
                      key={profile.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => openProfileChat(profile)}
                      disabled={openingProfileId === profile.id}
                      className={`flex w-full items-center gap-4 px-4 py-3 text-left disabled:opacity-60 ${index !== profileResults.length - 1 ? 'border-b border-[#F3F4F6]' : ''}`}
                    >
                      <Avatar initials={initialsOf(name)} color="#6546C7" size="lg" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-heading font-bold text-sevchik-text">{name}</p>
                        {details && <p className="truncate text-xs font-body text-sevchik-textSecondary">{details}</p>}
                      </div>
                      {openingProfileId === profile.id && <Loader2 size={18} className="animate-spin text-sevchik-purple" />}
                    </motion.button>
                  );
                })
              )}
            </div>
          </div>
        )}
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
                  // В режиме выбора карточка без backdrop-filter (сплошной,
                  // более непрозрачный фон вместо стекла): сочетание
                  // blur-эффекта с reflow при появлении/исчезновении
                  // чекбокса давало устойчивый цветной артефакт на
                  // аватарке, который не смывался даже после завершения
                  // анимации — баг компоновки в Chromium/WebKit, а не
                  // тайминга. Без блюра источнику артефакта просто
                  // неоткуда взяться.
                  background: cardsBlurred
                    ? (grayMode ? 'rgba(45,45,58,0.65)' : 'rgba(255,255,255,0.65)')
                    : (grayMode ? 'rgba(45,45,58,0.92)' : 'rgba(255,255,255,0.92)'),
                  backdropFilter: cardsBlurred ? 'blur(16px)' : 'none',
                  WebkitBackdropFilter: cardsBlurred ? 'blur(16px)' : 'none',
                  boxShadow: isSelected
                    ? '0 0 0 2px #6546C7, 0 10px 30px rgba(15,23,42,0.12)'
                    : '0 10px 30px rgba(15,23,42,0.12)',
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
