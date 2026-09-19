import { motion } from 'framer-motion';
import { Phone, PhoneIncoming, PhoneOutgoing, Video } from 'lucide-react';

export function Calls({ darkMode = false }: { darkMode?: boolean }) {
  return (
    <div className="flex flex-col h-full" style={{ background: darkMode ? 'linear-gradient(180deg, #1f1f28 0%, #25252f 100%)' : 'linear-gradient(180deg, #FFF8ED 0%, #FFF0DB 100%)' }}>
      <div className="px-4 sm:px-6 pt-6 pb-4 sticky top-0 z-20" style={{ background: darkMode ? 'linear-gradient(180deg, #1f1f28 80%, transparent)' : 'linear-gradient(180deg, #FFF8ED 80%, transparent)' }}>
        <div className="flex items-center justify-between mb-4">
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl" style={{ color: darkMode ? '#e8e8f0' : '#1A1A1A' }}>Звонки</h1>
          <motion.button
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => alert('📞 Функция звонков скоро будет доступна!')}
            className="w-11 h-11 rounded-full flex items-center justify-center text-white"
            style={{ background: 'linear-gradient(135deg, #8366D9, #6546C7)', boxShadow: '0 4px 12px rgba(101,70,199,0.3)' }}
          >
            <Phone size={22} />
          </motion.button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-24 md:pb-6 flex flex-col items-center justify-center text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
          style={{ background: darkMode ? '#2d2d3a' : '#FFF8ED', boxShadow: '0 8px 24px rgba(101,70,199,0.1)' }}
        >
          <Video size={40} className={darkMode ? 'text-[#4FD3C8]' : 'text-sevchik-purple'} />
        </motion.div>
        <h2 className="font-heading font-extrabold text-xl mb-2" style={{ color: darkMode ? '#e8e8f0' : '#1A1A1A' }}>Звонки в Севчик</h2>
        <p className="font-body max-w-xs mb-8" style={{ color: darkMode ? '#a0a0b0' : '#6B7280' }}>
          Здесь будет история ваших звонков. Мы уже работаем над интеграцией видеосвязи!
        </p>
        
        <div className="w-full max-w-sm space-y-3">
          <div className="rounded-2xl p-4 flex items-center gap-4" style={{ background: darkMode ? '#2d2d3a' : '#FFFFFF', boxShadow: '0 4px 12px rgba(101,70,199,0.06)' }}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: darkMode ? '#1a4d3e' : '#dcfce7', color: darkMode ? '#6ee7b7' : '#16a34a' }}>
              <PhoneIncoming size={18} />
            </div>
            <div className="flex-1 text-left">
              <p className="font-heading font-bold text-sm" style={{ color: darkMode ? '#e8e8f0' : '#1A1A1A' }}>Анна Смирнова</p>
              <p className="text-xs font-body" style={{ color: darkMode ? '#a0a0b0' : '#6B7280' }}>Входящий • 10:45</p>
            </div>
          </div>
          <div className="rounded-2xl p-4 flex items-center gap-4" style={{ background: darkMode ? '#2d2d3a' : '#FFFFFF', boxShadow: '0 4px 12px rgba(101,70,199,0.06)' }}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: darkMode ? '#1a3d6e' : '#dbeafe', color: darkMode ? '#60a5fa' : '#2563eb' }}>
              <PhoneOutgoing size={18} />
            </div>
            <div className="flex-1 text-left">
              <p className="font-heading font-bold text-sm" style={{ color: darkMode ? '#e8e8f0' : '#1A1A1A' }}>Клуб путешественников</p>
              <p className="text-xs font-body" style={{ color: darkMode ? '#a0a0b0' : '#6B7280' }}>Исходящий • Вчера</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}