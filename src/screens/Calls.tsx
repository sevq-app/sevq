import { motion } from 'framer-motion';
import { Phone, Video } from 'lucide-react';
import type { Screen } from '@/data/mock';

interface CallsProps {
  onNavigate: (screen: Screen) => void;
}

export function Calls({ onNavigate }: CallsProps) {
  return (
    <div className="flex flex-col h-full bg-[var(--bg-main)]">
      <div className="px-4 sm:px-6 pt-4 pb-3 sticky top-0 z-20 bg-transparent">
        <div className="flex items-center justify-between mb-4">
          <h1 className="font-heading font-extrabold text-xl text-sevchik-text">Звонки</h1>
          <motion.button
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => alert('📞 Функция звонков скоро будет доступна!')}
            className="w-12 h-12 rounded-full flex items-center justify-center text-white"
            style={{ background: '#6546C7', boxShadow: '0 4px 12px rgba(101,70,199,0.2)' }}
          >
            <Phone size={22} />
          </motion.button>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 pb-40 md:pb-0 flex flex-col items-center justify-center text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="w-24 h-24 rounded-full bg-sevchik-cream flex items-center justify-center mb-6"
          style={{ boxShadow: '0 8px 24px rgba(15,23,42,0.07)' }}
        >
          <Video size={40} className="text-sevchik-purple" />
        </motion.div>
        <h2 className="font-heading font-extrabold text-xl text-[#1A1A1A] mb-2">Звонки в Севчик</h2>
        <p className="text-sevchik-textSecondary font-body max-w-xs">
          Здесь будет история ваших звонков. Мы уже работаем над интеграцией видеосвязи!
        </p>
      </div>
    </div>
  );
}