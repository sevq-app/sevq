import { motion } from 'framer-motion';
import { Phone, ChevronLeft } from 'lucide-react';

export function Calls({ onNavigate }: { onNavigate?: (screen: string) => void }) {
  return (
    <div className="h-full overflow-y-auto pb-24 md:pb-6" style={{ background: 'radial-gradient(circle at 50% 50%, #FFF8ED 0%, #FFF0DB 100%)' }}>
      {/* Шапка */}
      <div className="px-4 sm:px-6 pt-6 pb-4 flex items-center gap-3 sticky top-0 z-20" style={{ background: 'linear-gradient(180deg, #FFF8ED 80%, transparent 100%)' }}>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => onNavigate?.('chats')}
          className="w-11 h-11 rounded-2xl bg-white flex items-center justify-center text-[#6546C7] transition-colors"
          style={{ boxShadow: '0 4px 12px rgba(101,70,199,0.15)' }}
        >
          <ChevronLeft size={22} />
        </motion.button>
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#1A1A1A]">Звонки</h1>
      </div>

      {/* Контент-заглушка */}
      <div className="flex flex-col items-center justify-center h-[60vh] px-6 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="w-24 h-24 rounded-full bg-white flex items-center justify-center mb-6"
          style={{ boxShadow: '0 8px 24px rgba(101,70,199,0.15)' }}
        >
          <Phone size={40} className="text-[#6546C7]" />
        </motion.div>
        
        <h2 className="font-heading font-bold text-xl text-[#1A1A1A] mb-2">История звонков пуста</h2>
        <p className="text-[#6B7280] font-body text-sm mb-8 max-w-xs">
          Здесь будут отображаться ваши входящие и исходящие вызовы
        </p>

        <motion.button
          whileHover={{ scale: 1.05, boxShadow: '0 8px 20px rgba(79, 211, 200, 0.4)' }}
          whileTap={{ scale: 0.95, y: 2 }}
          onClick={() => alert('🚀 Скоро здесь откроется интерфейс выбора контакта для звонка через WebRTC!')}
          className="w-full max-w-xs py-4 rounded-2xl text-white font-heading font-bold text-lg relative overflow-hidden flex items-center justify-center gap-3"
          style={{
            background: 'linear-gradient(135deg, #4FD3C8 0%, #38b2ac 100%)',
            boxShadow: '0 4px 14px rgba(79, 211, 200, 0.3)',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
          <Phone size={22} className="relative z-10" />
          <span className="relative z-10">Начать новый звонок</span>
        </motion.button>
      </div>
    </div>
  );
}