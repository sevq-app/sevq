import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Users, Phone, User, Smile, Volume2 } from 'lucide-react';
import { QLogo } from './QLogo';
import type { Screen } from '@/data/mock';

interface SidebarProps {
  current: Screen;
  onNavigate: (s: Screen) => void;
}

const navItems: { key: Screen; label: string; icon: React.ElementType }[] = [
  { key: 'chats', label: 'Чаты', icon: MessageCircle },
  { key: 'contacts', label: 'Контакты', icon: Users }, // <-- ИСПРАВЛЕНО: ключ теперь 'contacts'
  { key: 'calls', label: 'Звонки', icon: Phone },
  { key: 'profile', label: 'Мой SevQ', icon: User },
];

export function Sidebar({ current, onNavigate }: SidebarProps) {
  const [soundOn, setSoundOn] = useState(true);

  return (
    <div className="hidden md:flex flex-col w-20 lg:w-64 py-6 px-3 shrink-0 h-screen sticky top-0 z-30">
      <div className="mb-8 flex items-center gap-3 px-2">
        <QLogo size={44} />
        <span className="hidden lg:block font-heading font-extrabold text-2xl text-sevq-text">SevQ</span>
      </div>

      <nav className="flex flex-col gap-2.5 flex-1">
        {navItems.map(({ key, label, icon: Icon }) => {
          const active = current === key;
          return (
            <motion.button
              key={key}
              whileTap={{ scale: 0.97, y: 2 }}
              whileHover={{ y: -2 }}
              onClick={() => onNavigate(key)}
              className={`flex items-center gap-4 px-4 py-3 rounded-btn transition-all relative overflow-hidden ${
                active ? 'text-white' : 'bg-white text-sevq-textSecondary'
              }`}
              style={
                active
                  ? { background: 'linear-gradient(135deg, #8366D9, #6546C7)', boxShadow: '0 8px 20px rgba(101,70,199,0.3)' }
                  : { boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }
              }
            >
              {active && (
                <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.2) 0%, transparent 50%)' }} />
              )}
              <Icon size={22} className="shrink-0 relative z-10" />
              <span className={`hidden lg:block font-heading font-bold text-base relative z-10 ${active ? 'text-white' : ''}`}>{label}</span>
            </motion.button>
          );
        })}
      </nav>

      <div className="flex flex-col gap-2.5 pt-4">
        <motion.button
          whileTap={{ scale: 0.97, y: 2 }}
          whileHover={{ y: -2 }}
          onClick={() => alert('🎨 Коллекция стикеров скоро будет доступна!')}
          className="flex items-center gap-4 px-4 py-3 rounded-btn bg-white text-sevq-textSecondary hover:text-sevq-purple transition-colors"
          style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
          title="Стикеры"
        >
          <Smile size={22} className="shrink-0" />
          <span className="hidden lg:block font-heading font-bold text-base">Стикеры</span>
        </motion.button>

        <div className="flex items-center gap-4 px-4 py-3 rounded-btn bg-white" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <Volume2 size={22} className={`shrink-0 ${soundOn ? 'text-sevq-purple' : 'text-sevq-textSecondary'}`} />
          <span className="hidden lg:block font-heading font-bold text-base text-sevq-textSecondary flex-1">Звук</span>
          <button
            onClick={() => setSoundOn(!soundOn)}
            className={`relative w-12 h-7 rounded-full transition-colors duration-300 ${soundOn ? 'bg-sevq-mint' : 'bg-sevq-textSecondary/20'}`}
            style={soundOn ? { boxShadow: '0 2px 8px rgba(79,211,200,0.4)' } : undefined}
          >
            <motion.div
              layout
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              className={`absolute top-1 w-5 h-5 rounded-full bg-white ${soundOn ? 'left-6' : 'left-1'}`}
              style={{ boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}
            />
          </button>
        </div>
      </div>
    </div>
  );
}

interface TabBarProps {
  current: Screen;
  onNavigate: (s: Screen) => void;
}

export function TabBar({ current, onNavigate }: TabBarProps) {
  const items = [
    { key: 'chats' as Screen, label: 'Чаты', icon: MessageCircle },
    { key: 'contacts' as Screen, label: 'Контакты', icon: Users }, // <-- ИСПРАВЛЕНО: ключ теперь 'contacts'
    { key: 'calls' as Screen, label: 'Звонки', icon: Phone },
    { key: 'profile' as Screen, label: 'SevQ', icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-3 py-2 pb-3" style={{ background: 'rgba(255,248,237,0.95)', backdropFilter: 'blur(12px)', borderTop: '1px solid rgba(101,70,199,0.08)' }}>
      <div className="flex items-center justify-around">
        {items.map(({ key, label, icon: Icon }) => {
          const active = current === key;
          return (
            <motion.button
              key={key}
              whileTap={{ scale: 0.9, y: 2 }}
              onClick={() => onNavigate(key)}
              className="flex flex-col items-center gap-1 px-3 py-1.5"
            >
              <div
                className={`p-2.5 rounded-2xl transition-all relative overflow-hidden ${active ? 'text-white' : 'text-sevq-textSecondary'}`}
                style={
                  active
                    ? { background: 'linear-gradient(135deg, #8366D9, #6546C7)', boxShadow: '0 4px 12px rgba(101,70,199,0.3)' }
                    : { background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }
                }
              >
                <Icon size={20} />
              </div>
              <span className={`text-[10px] font-heading font-bold ${active ? 'text-sevq-purple' : 'text-sevq-textSecondary'}`}>
                {label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}