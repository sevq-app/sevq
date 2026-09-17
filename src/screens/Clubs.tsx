import { motion } from 'framer-motion';
import { Users, ArrowRight } from 'lucide-react';
import { Avatar } from '@/components/Avatar';
import { clubsData } from '@/data/mock';

interface ClubsProps {
  onOpenClub?: (name: string) => void;
}

export function Clubs({ onOpenClub }: ClubsProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="sticky top-0 z-10 pt-6 pb-4 px-4 sm:px-6" style={{ background: 'linear-gradient(180deg, rgba(255,248,237,0.98) 80%, transparent)' }}>
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl">Клубы</h1>
        <p className="text-sevq-textSecondary text-sm font-body mt-1">Твои сообщества по интересам</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-24 md:pb-6">
        <div className="space-y-3">
          {clubsData.map((club, i) => (
            <motion.button
              key={club.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.06 }}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onOpenClub?.(club.name)}
              className="w-full bg-white rounded-card p-4 flex items-center gap-4 plastic-card text-left"
              style={{ boxShadow: '0 8px 24px rgba(101,70,199,0.08)' }}
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-white shrink-0 relative overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${club.avatarColor}dd, ${club.avatarColor})`, boxShadow: `0 4px 14px ${club.avatarColor}40` }}
              >
                <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.2) 0%, transparent 50%)' }} />
                <Users size={28} className="relative z-10" />
              </div>
              <div className="flex-1 min-w-0 relative z-10">
                <h3 className="font-heading font-bold text-sevq-text truncate">{club.name}</h3>
                <p className="text-sm text-sevq-textSecondary font-body mt-0.5 truncate">{club.desc}</p>
                <p className="text-xs text-sevq-purple font-heading font-bold mt-1">{club.members}</p>
              </div>
              <div className="shrink-0 w-9 h-9 rounded-full bg-sevq-cream flex items-center justify-center text-sevq-purple relative z-10" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <ArrowRight size={18} />
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
