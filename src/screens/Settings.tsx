import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User, Bell, Lock, Palette, Globe, HardDrive, Info,
  LogOut, ChevronRight, Moon, Sun, Volume2, VolumeX,
  Shield, MessageCircle, Trash2
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface SettingsProps {
  onBack: () => void;
  onLogout: () => void;
}

export function Settings({ onBack, onLogout }: SettingsProps) {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [showOnline, setShowOnline] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onLogout();
  };

  const sections = [
    {
      title: 'Аккаунт',
      items: [
        { icon: User, label: 'Редактировать профиль', color: '#6546C7', action: () => {} },
      ],
    },
    {
      title: 'Уведомления',
      items: [
        { icon: soundEnabled ? Volume2 : VolumeX, label: 'Звук сообщений', color: '#FF9848', action: () => setSoundEnabled(!soundEnabled), isToggle: true, value: soundEnabled },
        { icon: Bell, label: 'Push-уведомления', color: '#FF9848', action: () => setPushEnabled(!pushEnabled), isToggle: true, value: pushEnabled },
      ],
    },
    {
      title: 'Конфиденциальность',
      items: [
        { icon: Shield, label: 'Показывать статус "В сети"', color: '#4FD3C8', action: () => setShowOnline(!showOnline), isToggle: true, value: showOnline },
        { icon: MessageCircle, label: 'Кто может писать мне', color: '#4FD3C8', action: () => {}, hasChevron: true },
      ],
    },
    {
      title: 'Оформление',
      items: [
        { icon: darkMode ? Moon : Sun, label: 'Тёмная тема', color: '#6546C7', action: () => setDarkMode(!darkMode), isToggle: true, value: darkMode },
        { icon: Palette, label: 'Цвет акцента', color: '#6546C7', action: () => {}, hasChevron: true },
      ],
    },
    {
      title: 'Общие',
      items: [
        { icon: Globe, label: 'Язык', color: '#6B7280', action: () => {}, hasChevron: true, value: 'Русский' },
        { icon: HardDrive, label: 'Данные и память', color: '#6B7280', action: () => {}, hasChevron: true },
        { icon: Info, label: 'О приложении SevQ', color: '#6B7280', action: () => {}, hasChevron: true, value: 'v1.0.0' },
      ],
    },
  ];

  return (
    <div className="h-full overflow-y-auto pb-24 md:pb-6 bg-gradient-to-b from-[#FFF8ED] to-[#FFF0DB]">
      {/* Header */}
      <div className="px-4 sm:px-6 pt-6 pb-2 flex items-center gap-3">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onBack}
          className="w-11 h-11 rounded-2xl bg-white flex items-center justify-center text-[#6546C7] transition-colors"
          style={{ boxShadow: '0 4px 12px rgba(101,70,199,0.15)' }}
        >
          <ChevronRight size={20} className="rotate-180" />
        </motion.button>
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#1A1A1A]">Настройки</h1>
      </div>

      <div className="px-4 sm:px-6 space-y-6 max-w-2xl mx-auto pt-4">
        {sections.map((section, sectionIdx) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: sectionIdx * 0.08 }}
          >
            <h2 className="text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-3 ml-1">
              {section.title}
            </h2>
            <div className="bg-white rounded-3xl overflow-hidden" style={{ boxShadow: '0 8px 24px rgba(101,70,199,0.08)' }}>
              {section.items.map((item, itemIdx) => (
                <motion.button
                  key={item.label}
                  whileHover={{ backgroundColor: '#FAFAFA' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={item.action}
                  className={`w-full flex items-center gap-4 px-5 py-4 text-left transition-colors ${
                    itemIdx !== section.items.length - 1 ? 'border-b border-[#F3F4F6]' : ''
                  }`}
                >
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 relative overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, ${item.color}dd, ${item.color})`,
                      boxShadow: `0 4px 12px ${item.color}40`,
                    }}
                  >
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.25) 0%, transparent 50%)' }} />
                    <item.icon size={20} className="text-white relative z-10" />
                  </div>
                  <span className="flex-1 font-heading font-semibold text-[#1A1A1A] text-sm">
                    {item.label}
                  </span>
                  {item.isToggle ? (
                    <div className={`relative w-12 h-7 rounded-full transition-colors duration-300 ${item.value ? 'bg-[#4FD3C8]' : 'bg-[#E5E7EB]'}`}>
                      <motion.div
                        layout
                        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                        className={`absolute top-1 w-5 h-5 rounded-full bg-white ${item.value ? 'left-6' : 'left-1'}`}
                        style={{ boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}
                      />
                    </div>
                  ) : item.value ? (
                    <span className="text-sm text-[#6B7280] font-body mr-1">{item.value}</span>
                  ) : null}
                  {item.hasChevron && !item.isToggle && (
                    <ChevronRight size={18} className="text-[#9CA3AF]" />
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        ))}

        {/* Кнопка выхода */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="pt-2 pb-6"
        >
          <motion.button
            whileHover={{ scale: 1.02, boxShadow: '0 8px 20px rgba(239, 68, 68, 0.3)' }}
            whileTap={{ scale: 0.98, y: 2 }}
            onClick={handleLogout}
            className="w-full py-4 rounded-2xl text-white font-heading font-bold text-base relative overflow-hidden flex items-center justify-center gap-3"
            style={{
              background: 'linear-gradient(135deg, #FF6B6B 0%, #EF4444 100%)',
              boxShadow: '0 4px 14px rgba(239, 68, 68, 0.25)',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
            <LogOut size={20} className="relative z-10" />
            <span className="relative z-10">Выйти из аккаунта</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full mt-3 py-3 rounded-2xl text-[#EF4444] font-heading font-semibold text-sm bg-white flex items-center justify-center gap-2"
            style={{ boxShadow: '0 4px 12px rgba(239, 68, 68, 0.1)' }}
          >
            <Trash2 size={16} />
            Удалить аккаунт
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}