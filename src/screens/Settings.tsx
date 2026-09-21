import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Star, Smartphone, Bell, Shield, HardDrive, Battery,
  UserPlus, Palette, Languages, HelpCircle, Info,
  LogOut, ChevronRight
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Screen } from '@/data/mock';

interface SettingsProps {
  onBack: () => void;
  onLogout: () => void;
  onNavigate?: (screen: Screen) => void;
  grayMode: boolean;
}

type SettingsItem = {
  icon: React.ElementType;
  label: string;
  color: string;
  hasChevron?: boolean;
  value?: string | boolean;
  isToggle?: boolean;
  action?: () => void;
};

export function Settings({ onBack, onLogout, onNavigate, grayMode }: SettingsProps) {
  const [notifications, setNotifications] = useState(true);
  const [powerSaving, setPowerSaving] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onLogout();
  };

  const sections: { title: string; items: SettingsItem[] }[] = [
    {
      title: 'Основное',
      items: [
        { icon: Star, label: 'Избранное', color: '#FF9848', hasChevron: true },
        { icon: Smartphone, label: 'Устройства', color: '#6546C7', hasChevron: true, value: '1 активно' },
      ],
    },
    {
      title: 'Уведомления и вид',
      items: [
        { icon: Bell, label: 'Уведомления и звуки', color: '#FF9848', isToggle: true, value: notifications, action: () => setNotifications(!notifications) },
        // ИСПРАВЛЕНО: теперь эта кнопка открывает экран оформления
        { icon: Palette, label: 'Оформление', color: '#6546C7', hasChevron: true, action: () => onNavigate?.('appearance') },
        { icon: Battery, label: 'Энергосбережение', color: '#4FD3C8', isToggle: true, value: powerSaving, action: () => setPowerSaving(!powerSaving) },
      ],
    },
    {
      title: 'Конфиденциальность и данные',
      items: [
        { icon: Shield, label: 'Безопасность', color: '#4FD3C8', hasChevron: true },
        { icon: HardDrive, label: 'Данные и память', color: '#6B7280', hasChevron: true, value: '124 МБ' },
      ],
    },
    {
      title: 'Поддержка',
      items: [
        { icon: UserPlus, label: 'Пригласить друзей', color: '#6546C7', hasChevron: true },
        { icon: Languages, label: 'Язык приложения', color: '#6B7280', hasChevron: true, value: 'Русский' },
        { icon: HelpCircle, label: 'Помощь', color: '#6B7280', hasChevron: true },
        { icon: Info, label: 'О приложении', color: '#6B7280', hasChevron: true, value: 'v1.0.0' },
      ],
    },
  ];

  return (
    <div className="h-full overflow-y-auto pb-24 md:pb-6 bg-[var(--bg-main)]">
      <div className="px-4 sm:px-6 pt-4 pb-3 flex items-center gap-3 sticky top-0 bg-transparent z-20">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onBack}
          className="w-11 h-11 rounded-2xl bg-white flex items-center justify-center text-[#6546C7] transition-colors"
          style={{ boxShadow: '0 4px 12px rgba(101,70,199,0.15)' }}
        >
          <ChevronRight size={22} className="rotate-180" />
        </motion.button>
        <h1 className="font-heading font-semibold text-sm text-sevchik-textSecondary">Настройки</h1>
      </div>

      <div className="px-4 sm:px-6 space-y-6 max-w-2xl mx-auto pt-2">
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
            
            <div className="bg-white rounded-3xl overflow-hidden" style={{ boxShadow: '0 8px 24px rgba(15,23,42,0.06)' }}>
              {section.items.map((item, itemIdx) => (
                <motion.button
                  key={item.label}
                  whileHover={{ backgroundColor: grayMode ? '#2d2d3a' : '#FAFAFA' }}
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
                      boxShadow: `0 4px 12px ${item.color}26`,
                    }}
                  >
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
                  ) : (
                    <>
                      {item.value && !item.isToggle && (
                        <span className="text-sm text-[#6B7280] font-body mr-1">{item.value}</span>
                      )}
                      {item.hasChevron && (
                        <ChevronRight size={18} className="text-[#9CA3AF]" />
                      )}
                    </>
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        ))}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="pt-4 pb-8"
        >
          <motion.button
            whileHover={{ scale: 1.02, boxShadow: '0 8px 20px rgba(239, 68, 68, 0.3)' }}
            whileTap={{ scale: 0.98, y: 2 }}
            onClick={handleLogout}
            className="w-full py-4 rounded-2xl text-white font-heading font-bold text-base relative overflow-hidden flex items-center justify-center gap-3"
            style={{
              background: '#EF4444',
              boxShadow: '0 4px 14px rgba(239, 68, 68, 0.25)',
            }}
          >
            <LogOut size={20} className="relative z-10" />
            <span className="relative z-10">Выйти из аккаунта</span>
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}