import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Type, Sun, Moon, Palette } from 'lucide-react';

interface AppearanceProps {
  onBack: () => void;
}

const themes = [
  {
    id: 'joy',
    name: 'Радость',
    gradient: 'linear-gradient(135deg, #FFD93D 0%, #FF9848 100%)',
    bg: '#FFF8ED',
    messageColor: '#FF9848',
  },
  {
    id: 'sadness',
    name: 'Печаль',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    bg: '#F0F4FF',
    messageColor: '#667eea',
  },
  {
    id: 'happiness',
    name: 'Счастье',
    gradient: 'linear-gradient(135deg, #4FD3C8 0%, #48BB78 100%)',
    bg: '#F0FFF4',
    messageColor: '#4FD3C8',
  },
  {
    id: 'calm',
    name: 'Спокойствие',
    gradient: 'linear-gradient(135deg, #A78BFA 0%, #6546C7 100%)',
    bg: '#FAF5FF',
    messageColor: '#A78BFA',
  },
  {
    id: 'surprise',
    name: 'Удивление',
    gradient: 'linear-gradient(135deg, #F093FB 0%, #F5576C 100%)',
    bg: '#FFF0F5',
    messageColor: '#F093FB',
  },
];

export function Appearance({ onBack }: AppearanceProps) {
  const [fontSize, setFontSize] = useState(16);
  const [darkMode, setDarkMode] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState('calm');

  const getFontSizeLabel = () => {
    if (fontSize < 14) return 'Мелко';
    if (fontSize > 18) return 'Крупно';
    return 'Стандарт';
  };

  const currentTheme = themes.find(t => t.id === selectedTheme);

  return (
    <div
      className="h-full overflow-y-auto pb-24 md:pb-6 transition-colors duration-500"
      style={{ background: darkMode ? '#1A1A1A' : currentTheme?.bg || '#FFF8ED' }}
    >
      {/* Шапка */}
      <div
        className="px-4 sm:px-6 pt-6 pb-4 sticky top-0 z-20"
        style={{
          background: darkMode
            ? 'linear-gradient(180deg, #1A1A1A 80%, transparent 100%)'
            : `linear-gradient(180deg, ${currentTheme?.bg || '#FFF8ED'} 80%, transparent 100%)`,
        }}
      >
        <div className="flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onBack}
            className="w-11 h-11 rounded-2xl bg-white flex items-center justify-center text-[#6546C7]"
            style={{ boxShadow: '0 4px 12px rgba(101,70,199,0.15)' }}
          >
            <ChevronLeft size={22} />
          </motion.button>
          <h1
            className="font-heading font-extrabold text-2xl sm:text-3xl"
            style={{ color: darkMode ? '#FFFFFF' : '#1A1A1A' }}
          >
            Оформление
          </h1>
        </div>
      </div>

      <div className="px-4 sm:px-6 space-y-6 max-w-2xl mx-auto pt-2">
        {/* Размер текста */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-5"
          style={{ boxShadow: '0 8px 24px rgba(101,70,199,0.08)' }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #6546C7, #8366D9)',
                boxShadow: '0 4px 12px rgba(101,70,199,0.3)',
              }}
            >
              <Type size={20} className="text-white" />
            </div>
            <h3 className="font-heading font-bold text-[#1A1A1A]">Размер текста</h3>
          </div>

          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-[#6B7280] font-body">Текущий размер:</span>
            <span className="font-heading font-bold text-[#6546C7]">{getFontSizeLabel()}</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs text-[#9CA3AF] font-body">A</span>
            <input
              type="range"
              min="12"
              max="24"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="flex-1 h-2 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #6546C7 ${((fontSize - 12) / 12) * 100}%, #E5E7EB ${((fontSize - 12) / 12) * 100}%)`,
              }}
            />
            <span className="text-lg text-[#9CA3AF] font-body font-bold">A</span>
          </div>

          <div className="mt-4 p-4 bg-[#F9FAFB] rounded-2xl">
            <p
              className="text-[#1A1A1A] font-body transition-all duration-300"
              style={{ fontSize: `${fontSize}px` }}
            >
              Пример текста для просмотра размера шрифта
            </p>
          </div>
        </motion.div>

        {/* Тема (светлая/темная) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl p-5"
          style={{ boxShadow: '0 8px 24px rgba(101,70,199,0.08)' }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #FF9848, #FFB87A)',
                boxShadow: '0 4px 12px rgba(255,152,72,0.3)',
              }}
            >
              {darkMode ? <Moon size={20} className="text-white" /> : <Sun size={20} className="text-white" />}
            </div>
            <div className="flex-1">
              <h3 className="font-heading font-bold text-[#1A1A1A]">Тема</h3>
              <p className="text-xs text-[#6B7280] font-body mt-0.5">
                Выберите тему, чтобы изменить фон и цвет сообщений
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setDarkMode(false)}
              className={`flex-1 py-3 rounded-2xl font-heading font-bold transition-all ${
                !darkMode ? 'bg-[#6546C7] text-white' : 'bg-[#F3F4F6] text-[#6B7280]'
              }`}
              style={!darkMode ? { boxShadow: '0 4px 12px rgba(101,70,199,0.3)' } : {}}
            >
              Светлая
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setDarkMode(true)}
              className={`flex-1 py-3 rounded-2xl font-heading font-bold transition-all ${
                darkMode ? 'bg-[#6546C7] text-white' : 'bg-[#F3F4F6] text-[#6B7280]'
              }`}
              style={darkMode ? { boxShadow: '0 4px 12px rgba(101,70,199,0.3)' } : {}}
            >
              Тёмная
            </motion.button>
          </div>
        </motion.div>

        {/* Макеты тем */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl p-5"
          style={{ boxShadow: '0 8px 24px rgba(101,70,199,0.08)' }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #4FD3C8, #38b2ac)',
                boxShadow: '0 4px 12px rgba(79,211,200,0.3)',
              }}
            >
              <Palette size={20} className="text-white" />
            </div>
            <h3 className="font-heading font-bold text-[#1A1A1A]">Цветовая тема</h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {themes.map((theme) => (
              <motion.button
                key={theme.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedTheme(theme.id)}
                className={`relative p-4 rounded-2xl text-left transition-all ${
                  selectedTheme === theme.id ? 'ring-4 ring-[#6546C7]' : ''
                }`}
                style={{
                  background: theme.gradient,
                  boxShadow: selectedTheme === theme.id
                    ? `0 8px 24px ${theme.messageColor}60`
                    : '0 4px 12px rgba(0,0,0,0.1)',
                }}
              >
                <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.2) 0%, transparent 50%)' }} />
                <div className="relative z-10">
                  <h4 className="font-heading font-bold text-white text-sm mb-1">{theme.name}</h4>
                  <div className="flex gap-1">
                    <div className="w-6 h-6 rounded-full bg-white/30" />
                    <div className="w-6 h-6 rounded-full bg-white/20" />
                    <div className="w-6 h-6 rounded-full bg-white/10" />
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Предпросмотр сообщения */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-3xl p-5"
          style={{ boxShadow: '0 8px 24px rgba(101,70,199,0.08)' }}
        >
          <h3 className="font-heading font-bold text-[#1A1A1A] mb-4">Предпросмотр</h3>
          <div className="space-y-3">
            <div
              className="p-3 rounded-2xl rounded-tl-none max-w-[80%]"
              style={{
                background: currentTheme?.gradient || 'linear-gradient(135deg, #6546C7, #8366D9)',
                color: 'white',
              }}
            >
              <p className="text-sm font-body">Привет! Как дела? </p>
            </div>
            <div className="p-3 rounded-2xl rounded-tr-none max-w-[80%] ml-auto bg-[#F3F4F6]">
              <p className="text-sm font-body text-[#1A1A1A]">Отлично! А у тебя?</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}