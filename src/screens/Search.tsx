import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Search as SearchIcon, Clock, TrendingUp, Loader2 } from 'lucide-react';
import { displayNameOf, searchProfiles, getOrCreateDirectChat, type RemoteProfile } from '@/lib/messagingService';
import { useChatStore } from '@/store/chatStore';
import type { Chat } from '@/data/mock';

interface SearchProps {
  onBack: () => void;
  onWriteMessage: (name: string) => void;
  onOpenChat: (chatId: string) => void;
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function Search({ onBack, onWriteMessage, onOpenChat }: SearchProps) {
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [openingId, setOpeningId] = useState<string | null>(null);
  const [searchError, setSearchError] = useState('');
  const [results, setResults] = useState<RemoteProfile[]>([]);
  const upsertRealChat = useChatStore((s) => s.upsertRealChat);
  const recentSearches = ['Анна', 'Клуб путешественников', 'Дизайн'];

  // Поиск реальных пользователей по имени/никнейму/телефону/email с debounce,
  // чтобы не долбить базу на каждое нажатие клавиши.
  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults([]);
      setSearchError('');
      return;
    }
    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        const found = await searchProfiles(q);
        setResults(found);
        setSearchError(found.length === 0 ? 'Никто не найден по этому запросу' : '');
      } catch (e) {
        setSearchError('Не удалось выполнить поиск. Попробуйте ещё раз.');
        console.error(e);
      } finally {
        setSearching(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  const handleOpenProfile = async (profile: RemoteProfile) => {
    setOpeningId(profile.id);
    try {
      const remoteChatId = await getOrCreateDirectChat(profile.id);
      const name = displayNameOf(profile);
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
    } catch (e) {
      setSearchError('Не удалось открыть чат. Попробуйте ещё раз.');
      console.error(e);
    } finally {
      setOpeningId(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg-main)]">
      {/* Header */}
      <div className="px-4 sm:px-6 pt-4 pb-3 flex items-center gap-3 sticky top-0 z-20 bg-transparent">
        <motion.button whileTap={{ scale: 0.9 }} onClick={onBack} className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-sevchik-purple" style={{ boxShadow: '0 4px 12px rgba(101,70,199,0.15)' }}>
          <ArrowLeft size={22} />
        </motion.button>
        <h1 className="font-heading font-extrabold text-xl text-sevchik-text">Поиск</h1>
      </div>

      {/* Search Input */}
      <div className="px-4 sm:px-6 mb-6">
        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]" size={20} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Имя, никнейм или номер телефона..."
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-[var(--bg-input)] border-2 border-transparent focus:border-sevchik-purple/30 outline-none transition-all font-body text-[var(--text-main)] placeholder:text-[var(--text-secondary)]"
            style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 pb-28 md:pb-0">
        {query ? (
          <div className="space-y-4">
            {searching && (
              <div className="flex items-center justify-center gap-2 py-6 text-sevchik-textSecondary font-body text-sm">
                <Loader2 size={16} className="animate-spin" /> Ищем…
              </div>
            )}
            {!searching && results.length > 0 && (
              <div className="bg-white rounded-3xl overflow-hidden" style={{ boxShadow: '0 8px 24px rgba(15,23,42,0.06)' }}>
                {results.map((profile, i) => {
                  const name = displayNameOf(profile);
                  const subtitleParts = [profile.username && `@${profile.username}`, profile.phone, profile.email].filter(Boolean);
                  return (
                    <motion.button
                      key={profile.id}
                      whileHover={{ backgroundColor: '#FAFAFA' }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleOpenProfile(profile)}
                      disabled={openingId === profile.id}
                      className={`w-full flex items-center gap-4 px-5 py-4 text-left transition-colors disabled:opacity-60 ${i !== results.length - 1 ? 'border-b border-[#F3F4F6]' : ''}`}
                    >
                      <div className="w-11 h-11 rounded-2xl bg-sevchik-cream flex items-center justify-center text-sevchik-purple font-heading font-bold text-sm shrink-0">
                        {openingId === profile.id ? <Loader2 size={18} className="animate-spin" /> : initialsOf(name)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-heading font-semibold text-sm text-[#1A1A1A] truncate">{name}</p>
                        {subtitleParts.length > 0 && (
                          <p className="text-xs text-sevchik-textSecondary font-body truncate">{subtitleParts.join(' · ')}</p>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            )}
            {!searching && searchError && (
              <p className="text-center text-sevchik-textSecondary font-body text-sm py-8">{searchError}</p>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h2 className="text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-3 ml-1 flex items-center gap-2">
                <Clock size={14} /> Недавние
              </h2>
              <div className="bg-white rounded-3xl overflow-hidden" style={{ boxShadow: '0 8px 24px rgba(15,23,42,0.06)' }}>
                {recentSearches.map((item, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ backgroundColor: '#FAFAFA' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onWriteMessage(item)}
                    className={`w-full flex items-center gap-4 px-5 py-4 text-left transition-colors ${i !== recentSearches.length - 1 ? 'border-b border-[#F3F4F6]' : ''}`}
                  >
                    <div className="w-11 h-11 rounded-2xl bg-sevchik-cream flex items-center justify-center text-sevchik-purple shrink-0">
                      <SearchIcon size={18} />
                    </div>
                    <span className="font-heading font-semibold text-sm text-[#1A1A1A]">{item}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-3 ml-1 flex items-center gap-2">
                <TrendingUp size={14} /> Популярное в Севчик
              </h2>
              <div className="bg-white rounded-3xl overflow-hidden" style={{ boxShadow: '0 8px 24px rgba(15,23,42,0.06)' }}>
                {['Новости дизайна', 'IT сообщество', 'Музыка 24/7'].map((item, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ backgroundColor: '#FAFAFA' }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full flex items-center gap-4 px-5 py-4 text-left transition-colors ${i !== 2 ? 'border-b border-[#F3F4F6]' : ''}`}
                  >
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shrink-0" style={{ background: '#FF9848' }}>
                      <TrendingUp size={18} />
                    </div>
                    <span className="font-heading font-semibold text-sm text-[#1A1A1A]">{item}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
