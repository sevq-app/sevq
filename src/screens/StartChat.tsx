import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, Users, Link, Phone } from 'lucide-react';
import { Avatar } from '@/components/Avatar';
import { friendsData } from '@/data/mock';

interface StartChatProps {
  onBack: () => void;
}

export function StartChat({ onBack }: StartChatProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFriends = friendsData.filter(friend =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.handle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Группировка контактов по первой букве имени
  const grouped = filteredFriends.reduce((acc, friend) => {
    const letter = friend.name[0].toUpperCase();
    if (!acc[letter]) acc[letter] = [];
    acc[letter].push(friend);
    return acc;
  }, {} as Record<string, typeof friendsData>);

  const letters = Object.keys(grouped).sort();

  const scrollToLetter = (letter: string) => {
    const element = document.getElementById(`letter-${letter}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg-main)]">
      {/* Header */}
      <div className="px-4 sm:px-6 pt-4 pb-3 sticky top-0 z-20 bg-transparent">
        <div className="flex items-center gap-3 mb-4">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onBack}
            className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-[#6546C7]"
            style={{ boxShadow: '0 4px 12px rgba(15,23,42,0.07)' }}
          >
            <ArrowLeft size={22} />
          </motion.button>
          <h1 className="font-heading font-extrabold text-xl text-sevchik-text">Начать общение</h1>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Найти по имени"
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-[var(--bg-input)] border-2 border-transparent focus:border-[#6546C7]/30 outline-none transition-all font-body text-[var(--text-main)] placeholder:text-[var(--text-secondary)]"
            style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-28 md:pb-0 relative">
        <div className="max-w-2xl mx-auto pt-2">
          {/* Action buttons */}
          <div className="space-y-2 mb-6">
            <motion.button
              whileTap={{ scale: 0.98 }}
              className="w-full bg-white rounded-2xl p-4 flex items-center gap-4 text-left"
              style={{ boxShadow: '0 4px 12px rgba(15,23,42,0.05)' }}
            >
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-[var(--bg-input)]">
                <Users size={18} style={{ color: 'var(--theme-primary)' }} />
              </div>
              <span className="font-heading font-semibold text-sm text-[#1A1A1A]">Создать группу</span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.98 }}
              className="w-full bg-white rounded-2xl p-4 flex items-center gap-4 text-left"
              style={{ boxShadow: '0 4px 12px rgba(15,23,42,0.05)' }}
            >
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-[var(--bg-input)]">
                <Phone size={18} style={{ color: 'var(--theme-primary)' }} />
              </div>
              <span className="font-heading font-semibold text-sm text-[#1A1A1A]">Найти по номеру</span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.98 }}
              className="w-full bg-white rounded-2xl p-4 flex items-center gap-4 text-left"
              style={{ boxShadow: '0 4px 12px rgba(15,23,42,0.05)' }}
            >
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-[var(--bg-input)]">
                <Link size={18} style={{ color: 'var(--theme-primary)' }} />
              </div>
              <span className="font-heading font-semibold text-sm text-[#1A1A1A]">Пригласить по ссылке</span>
            </motion.button>
          </div>

          {/* Contacts list */}
          {filteredFriends.length > 0 ? (
            <div className="space-y-4">
              {letters.map(letter => (
                <div key={letter} id={`letter-${letter}`}>
                  <h2 className="text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-2 ml-1 sticky top-0 bg-[var(--bg-main)] py-1 z-10">
                    {letter}
                  </h2>
                  <div className="space-y-2">
                    {grouped[letter].map(friend => (
                      <motion.button
                        key={friend.id}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-white rounded-2xl p-4 flex items-center gap-4 text-left"
                        style={{ boxShadow: '0 4px 12px rgba(15,23,42,0.05)' }}
                      >
                        <Avatar
                          initials={friend.initials}
                          color={friend.avatarColor}
                          size="md"
                          online={friend.online}
                        />
                        <div className="flex-1 min-w-0 text-left">
                          <h3 className="font-heading font-bold text-[#1A1A1A] text-sm truncate">{friend.name}</h3>
                          <p className="text-xs text-[#6B7280] font-body mt-0.5">{friend.status}</p>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-[#6B7280] font-body text-sm">Ничего не найдено</p>
            </div>
          )}
        </div>

        {/* Alphabet index (буквенный указатель справа) */}
        {letters.length > 0 && (
          <div className="fixed right-3 top-1/2 -translate-y-1/2 flex flex-col gap-1 z-30">
            {letters.map(letter => (
              <button
                key={letter}
                onClick={() => scrollToLetter(letter)}
                className="w-6 h-6 flex items-center justify-center text-xs font-heading font-bold text-[#6546C7] bg-white/80 rounded-full backdrop-blur-sm"
                style={{ boxShadow: '0 2px 8px rgba(15,23,42,0.08)' }}
              >
                {letter}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}