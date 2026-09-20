import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Users, Phone, User } from 'lucide-react';
import { QLogo } from './QLogo';
import type { Screen } from '@/data/mock';

interface SidebarProps {
  current: Screen;
  onNavigate: (s: Screen) => void;
}

// НОВЫЙ ПОРЯДОК: Контакты → Звонки → Чаты → Мой Севчик
const navItems: { key: Screen; label: string; icon: React.ElementType }[] = [
  { key: 'contacts', label: 'Контакты', icon: Users },
  { key: 'calls', label: 'Звонки', icon: Phone },
  { key: 'chats', label: 'Чаты', icon: MessageCircle },
  { key: 'profile', label: 'Мой Севчик', icon: User },
];

export function Sidebar({ current, onNavigate }: SidebarProps) {
  return (
    <div className="hidden md:flex flex-col w-20 lg:w-64 py-6 px-3 shrink-0 h-screen sticky top-0 z-30">
      <div className="mb-8 flex items-center gap-3 px-2">
        <QLogo size={44} />
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
              className={`flex items-center gap-4 px-4 py-3 rounded-btn transition-all relative overflow-hidden ${
                active ? 'text-white' : 'bg-white text-sevchik-textSecondary'
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

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 h-16 px-3 bg-[var(--bg-card)] border-t border-[var(--bg-input)] transition-all duration-200">
      <div className="h-full flex items-center justify-around">
        {items.map(({ key, label, icon: Icon }) => {
          const active = current === key;
          return (
            <motion.button
              key={key}
              whileTap={{ scale: 0.9, y: 2 }}
              onClick={() => onNavigate(key)}
              className="flex flex-col items-center gap-1 px-3 py-1.5 transition-all duration-200"
            >
              <div
                className={`p-2.5 rounded-2xl transition-all duration-200 relative overflow-hidden ${active ? 'text-white opacity-100' : 'text-[var(--text-secondary)] opacity-70'}`}
                style={
                  active
                    ? { background: 'linear-gradient(135deg, #8366D9, #6546C7)', boxShadow: '0 4px 12px rgba(101,70,199,0.3)' }
                    : { background: 'var(--bg-input)' }
                }
              >
                <Icon size={20} />
              </div>
              <span className={`text-[10px] font-heading font-bold transition-all duration-200 ${active ? 'text-sevchik-purple opacity-100' : 'text-[var(--text-secondary)] opacity-70'}`}>
                {label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
