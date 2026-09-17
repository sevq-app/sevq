import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Search as SearchIcon, MessageSquare } from 'lucide-react';
import { Avatar } from '@/components/Avatar';
import { searchResults } from '@/data/mock';

interface SearchProps {
  onBack: () => void;
  onWriteMessage: (name: string) => void;
}

export function Search({ onBack, onWriteMessage }: SearchProps) {
  const [query, setQuery] = useState('');

  const filtered = query.trim()
    ? searchResults.filter(
        (r) =>
          r.name.toLowerCase().includes(query.toLowerCase()) ||
          r.handle.toLowerCase().includes(query.toLowerCase())
      )
    : searchResults;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="sticky top-0 z-10 px-4 py-3 flex items-center gap-3" style={{ background: 'rgba(255,248,237,0.95)', backdropFilter: 'blur(12px)' }}>
        <motion.button
          whileTap={{ scale: 0.9, y: 2 }}
          onClick={onBack}
          className="p-2 rounded-full bg-white text-sevq-text btn-3d"
          style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
        >
          <ArrowLeft size={20} />
        </motion.button>
        <h1 className="font-heading font-extrabold text-xl flex-1">Поиск</h1>
      </div>

      {/* Big orange search */}
      <div className="px-4 sm:px-6 py-4">
        <div className="relative">
          <SearchIcon size={22} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск людей..."
            className="w-full text-white placeholder:text-white/80 rounded-card py-4 pl-12 pr-4 focus:outline-none font-body text-base"
            style={{
              background: 'linear-gradient(135deg, #FFB87A, #FF9848)',
              boxShadow: '0 6px 20px rgba(255,152,72,0.3)',
            }}
          />
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-24 md:pb-6">
        {filtered.length > 0 ? (
          <div className="space-y-2.5">
            {filtered.map((person, i) => (
              <motion.div
                key={person.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                whileHover={{ y: -4 }}
                className="bg-white rounded-card p-3.5 flex items-center gap-3 plastic-card"
                style={{ boxShadow: '0 8px 24px rgba(101,70,199,0.08)' }}
              >
                <Avatar
                  initials={person.initials}
                  color={person.avatarColor}
                  size="md"
                  online={person.online}
                  ringColor={person.online ? '#4FD3C8' : undefined}
                />
                <div className="flex-1 min-w-0 relative z-10">
                  <h3 className="font-heading font-bold text-sevq-text truncate">{person.name}</h3>
                  <p className="text-sm text-sevq-purple font-body truncate">{person.handle}</p>
                  <p className={`text-xs font-body mt-0.5 flex items-center gap-1 ${person.online ? 'text-sevq-mint' : 'text-sevq-textSecondary'}`}>
                    {person.online && <span className="w-1.5 h-1.5 rounded-full bg-sevq-mint" />}
                    {person.status}
                  </p>
                </div>
                <motion.button
                  whileTap={{ scale: 0.9, y: 2 }}
                  onClick={() => onWriteMessage(person.name)}
                  className="shrink-0 text-white rounded-btn px-4 py-2.5 font-heading font-bold text-sm btn-3d relative overflow-hidden flex items-center gap-1.5"
                  style={{ background: 'linear-gradient(135deg, #8366D9, #6546C7)', boxShadow: '0 4px 14px rgba(101,70,199,0.25)' }}
                >
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 50%)' }} />
                  <MessageSquare size={16} className="relative z-10" />
                  <span className="relative z-10">Написать</span>
                </motion.button>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mb-4" style={{ boxShadow: '0 8px 24px rgba(101,70,199,0.08)' }}>
              <SearchIcon size={36} className="text-sevq-purple/40" />
            </div>
            <p className="text-sevq-text font-heading font-bold text-lg">Никого не нашли</p>
            <p className="text-sevq-textSecondary font-body text-sm mt-1">Попробуйте изменить запрос</p>
          </div>
        )}
      </div>
    </div>
  );
}
