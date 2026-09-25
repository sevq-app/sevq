import { motion } from 'framer-motion';
import { MessageCircle, Users, Phone, User } from 'lucide-react';
import { QLogo } from './QLogo';
import { useChatStore } from '@/store/chatStore';
import type { Screen } from '@/data/mock';

interface SidebarProps {
  current: Screen;
  onNavigate: (s: Screen) => void;
  grayMode?: boolean;
}

// НОВЫЙ ПОРЯДОК: Контакты → Звонки → Чаты → Мой Севчик
const navItems: { key: Screen; label: string; icon: React.ElementType }[] = [
  { key: 'contacts', label: 'Контакты', icon: Users },
  { key: 'calls', label: 'Звонки', icon: Phone },
  { key: 'chats', label: 'Чаты', icon: MessageCircle },
  { key: 'profile', label: 'Мой Севчик', icon: User },
];

export function Sidebar({ current, onNavigate, grayMode = false }: SidebarProps) {
  return (
    <div className="hidden md:flex flex-col w-20 lg:w-64 py-6 px-3 shrink-0 h-screen sticky top-0 z-30">
      <div className="mb-8 flex items-center gap-3 px-2">
        <QLogo size={44} animate theme={grayMode ? 'dark' : 'light'} />
        <span className="hidden lg:block font-heading font-extrabold text-2xl text-sevchik-text">Севчик</span>
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
              className={`flex items-center gap-4 px-5 py-3.5 rounded-btn transition-all relative overflow-hidden ${
                active ? 'text-white' : 'text-sevchik-textSecondary'
              }`}
              style={
                active
                  ? { background: '#6546C7', boxShadow: '0 6px 16px rgba(101,70,199,0.2)' }
                  : {
                      background: 'rgba(255,255,255,0.65)',
                      backdropFilter: 'blur(16px)',
                      WebkitBackdropFilter: 'blur(16px)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    }
              }
            >
              <Icon size={26} className="shrink-0 relative z-10" />
              <span className={`hidden lg:block font-heading font-bold text-lg relative z-10 ${active ? 'text-white' : ''}`}>{label}</span>
            </motion.button>
          );
        })}
      </nav>
    </div>
  );
}

interface TabBarProps {
  current: Screen;
  onNavigate: (s: Screen) => void;
}

export function TabBar({ current, onNavigate }: TabBarProps) {
  // НОВЫЙ ПОРЯДОК для мобильной версии
  const items = [
    { key: 'contacts' as Screen, label: 'Контакты', icon: Users },
    { key: 'calls' as Screen, label: 'Звонки', icon: Phone },
    { key: 'chats' as Screen, label: 'Чаты', icon: MessageCircle },
    { key: 'profile' as Screen, label: 'Севчик', icon: User },
  ];

  // Суммарный бейдж непрочитанных на вкладке «Чаты» — то же число и тот же
  // стиль (сплошной кружок с цифрой), что и на бейджах отдельных чатов на
  // экране «Чаты» (см. Chats.tsx), только по всем чатам сразу.
  const totalUnread = useChatStore((s) => s.chats.reduce((sum, c) => sum + Math.max(c.unread, 0), 0));

  return (
    // Не position: fixed — намеренно: на iOS в режиме PWA «На экран Домой» «fixed» с
    // bottom: 0 привязывается к «безопасной» области экрана и НЕ дотягивается до
    // истинного нижнего края под домашней полоской жестов, даже с viewport-fit=cover и
    // 100dvh на предках — снизу оставалась чёрная полоса. Обычный поток (shrink-0
    // последний элемент в flex-col родителе из App.tsx) кладёт панель ровно там, где
    // реально заканчивается размеченный (100dvh) контейнер — без этой неоднозначности.
    //
    // Панель — «плавающая таблетка»: отступы слева/справа/снизу здесь, на прозрачной
    // обёртке — поэтому в них виден фон приложения (тот самый, который в предыдущих
    // правках уже доходит до истинного низа экрана), а не обрезанный угол панели.
    <div
      className="md:hidden shrink-0 px-4"
      style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
    >
      <div
        className="relative flex items-stretch justify-around overflow-hidden rounded-[26px] bg-[var(--bg-card)]"
        style={{ height: '68px', boxShadow: '0 12px 28px rgba(0,0,0,0.18)' }}
      >
        {items.map(({ key, label, icon: Icon }) => {
          const active = current === key;
          const badge = key === 'chats' ? totalUnread : 0;
          return (
            <motion.button
              key={key}
              whileTap={{ scale: 0.95 }}
              onClick={() => onNavigate(key)}
              className="relative flex-1 flex flex-col items-center justify-center gap-0.5"
            >
              {active && (
                <motion.div
                  layoutId="tabbar-active-pill"
                  className="absolute inset-1.5 rounded-[18px]"
                  style={{ background: 'rgba(var(--theme-primary-rgb), 0.14)' }}
                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                />
              )}
              <span className="relative">
                <Icon
                  size={32}
                  className="transition-colors duration-200"
                  style={{ color: active ? 'var(--theme-primary)' : 'var(--text-secondary)' }}
                />
                {badge > 0 && (
                  <span
                    className="absolute -top-1.5 -right-2 min-w-[18px] h-[18px] px-1 rounded-pill flex items-center justify-center text-white text-[10px] font-heading font-bold"
                    style={{ background: '#6546C7', boxShadow: '0 3px 10px rgba(101,70,199,0.18)' }}
                  >
                    {badge > 99 ? '99+' : badge}
                  </span>
                )}
              </span>
              <span
                className="relative text-[15px] font-heading font-bold transition-colors duration-200"
                style={{ color: active ? 'var(--theme-primary)' : 'var(--text-secondary)' }}
              >
                {label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
