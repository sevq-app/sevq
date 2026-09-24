import { motion } from 'framer-motion';
import { Users, Search } from 'lucide-react';

interface ClubsProps {
  onOpenClub: () => void;
}

const mockClubs = [
  { id: 1, name: 'Клуб путешественников', members: '1.2k', color: '#6546C7', initials: 'КП' },
  { id: 2, name: 'Дизайн и UI/UX', members: '856', color: '#FF9848', initials: 'ДУ' },
  { id: 3, name: 'Разработчики', members: '2.4k', color: '#4FD3C8', initials: 'РЗ' },
];

export function Clubs({ onOpenClub }: ClubsProps) {
  return (
    <div className="flex flex-col h-full bg-[var(--bg-main)]">
      <div className="px-4 sm:px-6 pt-4 pb-3 sticky top-0 z-20 bg-transparent">
        <div className="flex items-center justify-between mb-4">
          <h1 className="font-heading font-extrabold text-xl text-sevchik-text">Клубы</h1>
          <div className="w-11 h-11 rounded-full bg-sevchik-orange flex items-center justify-center font-heading font-extrabold text-white text-sm" style={{ boxShadow: '0 2px 8px rgba(255,152,72,0.2)' }}>
            <span>АВ</span>
          </div>
        </div>
        <div className="relative">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
          <input
            type="text"
            placeholder="Поиск клубов..."
            className="w-full text-[var(--text-main)] placeholder:text-[var(--text-secondary)] rounded-card py-3.5 pl-12 pr-4 focus:outline-none font-body text-sm relative overflow-hidden bg-[var(--bg-input)]"
            style={{ boxShadow: 'none' }}
          />
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 pb-40 md:pb-0">
        <div className="space-y-3 mt-2">
          {mockClubs.map((club, i) => (
            <motion.button
              key={club.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.05 }}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={onOpenClub}
              className="w-full flex items-center gap-3 p-3.5 bg-white rounded-card text-left btn-3d"
              style={{ boxShadow: '0 8px 24px rgba(15,23,42,0.06)' }}
            >
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-heading font-bold text-base shrink-0" style={{ background: `linear-gradient(135deg, ${club.color}dd, ${club.color})`, boxShadow: `0 4px 12px ${club.color}26` }}>
                <span>{club.initials}</span>
              </div>
              <div className="flex-1 min-w-0 relative z-10">
                <h3 className="font-heading font-bold text-sevchik-text truncate">{club.name}</h3>
                <p className="text-xs text-sevchik-textSecondary font-body mt-0.5 flex items-center gap-1">
                  <Users size={12} /> {club.members} участников
                </p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
