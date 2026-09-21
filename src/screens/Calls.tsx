import { motion } from 'framer-motion';
import { Phone, PhoneIncoming, PhoneOutgoing, Video } from 'lucide-react';
import type { Screen } from '@/data/mock';

interface CallsProps {
  onNavigate: (screen: Screen) => void;
}

export function Calls({ onNavigate }: CallsProps) {
  return (
    <div className="flex flex-col h-full bg-[var(--bg-main)]">
      <div className="px-4 sm:px-6 pt-4 pb-3 sticky top-0 z-20 bg-transparent">
        <div className="flex items-center justify-between mb-4">
          <h1 className="font-heading font-semibold text-sm text-sevchik-textSecondary">Звонки</h1>
          <motion.button
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => alert('📞 Функция звонков скоро будет доступна!')}
            className="w-11 h-11 rounded-full flex items-center justify-center text-white"
            style={{ background: '#6546C7', boxShadow: '0 4px 12px rgba(101,70,199,0.2)' }}
          >
            <Phone size={22} />
          </motion.button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-24 md:pb-0 flex flex-col items-center justify-center text-center">
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
        <p className="text-sevchik-textSecondary font-body max-w-xs mb-8">
          Здесь будет история ваших звонков. Мы уже работаем над интеграцией видеосвязи!
        </p>
        
        <div className="w-full max-w-sm space-y-3">
          <div className="bg-white rounded-2xl p-4 flex items-center gap-4" style={{ boxShadow: '0 4px 12px rgba(15,23,42,0.05)' }}>
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
              <PhoneIncoming size={18} />
            </div>
            <div className="flex-1 text-left">
              <p className="font-heading font-bold text-sm text-[#1A1A1A]">Анна Смирнова</p>
              <p className="text-xs text-sevchik-textSecondary font-body">Входящий • 10:45</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 flex items-center gap-4" style={{ boxShadow: '0 4px 12px rgba(15,23,42,0.05)' }}>
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <PhoneOutgoing size={18} />
            </div>
            <div className="flex-1 text-left">
              <p className="font-heading font-bold text-sm text-[#1A1A1A]">Клуб путешественников</p>
              <p className="text-xs text-sevchik-textSecondary font-body">Исходящий • Вчера</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}