import { motion } from 'framer-motion';
import { ArrowLeft, Palette, Sun, Flower, Leaf, Snowflake, Sparkles, Waves } from 'lucide-react';

interface AppearanceProps {
  onBack: () => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  selectedTheme: string;
  setSelectedTheme: (theme: string) => void;
  grayMode: boolean;
  setGrayMode: (value: boolean) => void;
}

const themes = [
  { id: 'spring', name: 'Весна', gradient: 'linear-gradient(135deg, #FFB87A, #FF9848)', primary: '#FF9848', icon: Flower },
  { id: 'summer', name: 'Лето', gradient: 'linear-gradient(135deg, #FFD93D, #FFB848)', primary: '#FFB848', icon: Sun },
  { id: 'autumn', name: 'Осень', gradient: 'linear-gradient(135deg, #FF6B6B, #FF9848)', primary: '#FF6B6B', icon: Leaf },
  { id: 'winter', name: 'Зима', gradient: 'linear-gradient(135deg, #A78BFA, #6546C7)', primary: '#6546C7', icon: Snowflake },
  { id: 'aurora', name: 'Северное сияние', gradient: 'linear-gradient(135deg, #4FD3C8, #6546C7)', primary: '#4FD3C8', icon: Sparkles },
  { id: 'sea', name: 'Море', gradient: 'linear-gradient(135deg, #38b2ac, #2c7a7b)', primary: '#38b2ac', icon: Waves },
];

export function Appearance({ onBack, fontSize, setFontSize, selectedTheme, setSelectedTheme, grayMode, setGrayMode }: AppearanceProps) {
  const applyTheme = (themeId: string) => {
    // Убираем все классы тем
    themes.forEach(t => {
      document.documentElement.classList.remove(t.id);
    });
    // Добавляем выбранную
    document.documentElement.classList.add(themeId);
    setSelectedTheme(themeId);
  };

  const textMain = 'var(--text-main)';
  const cardBg = 'var(--bg-card)';

  return (
    <div className="flex flex-col h-full bg-[var(--bg-main)]">
      {/* Header */}
      <div className="sticky top-0 z-10 px-4 py-3 flex items-center gap-3 bg-transparent">
        <motion.button
          whileTap={{ scale: 0.9, y: 2 }}
          onClick={onBack}
          className="p-2 rounded-full bg-sevchik-cream text-sevchik-text btn-3d"
          style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
        >
          <ArrowLeft size={20} />
        </motion.button>
        <h1 className="font-heading font-bold text-lg text-sevchik-text">Оформление</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6 max-w-2xl mx-auto w-full">
        {/* Размер шрифта */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl p-5"
          style={{ backgroundColor: cardBg, boxShadow: '0 8px 24px rgba(15,23,42,0.06)' }}
        >
          <div className="flex items-center gap-[12px] mb-[16px]">
            <div
              className="w-[40px] h-[40px] rounded-2xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #6546C7, #8366D9)',
                boxShadow: '0 4px 12px rgba(101,70,199,0.2)',
              }}
            >
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <h3 className="font-heading font-bold" style={{ color: textMain }}>Размер шрифта</h3>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm" style={{ color: textMain }}>A</span>
            <input
              type="range"
              min="12"
              max="20"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="flex-1 accent-[#6546C7]"
            />
            <span className="text-lg font-bold" style={{ color: textMain }}>A</span>
          </div>
          <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>
            Текущий размер: {fontSize}px
          </p>
        </motion.div>

        {/* Цветовая тема */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-3xl p-5"
          style={{ backgroundColor: cardBg, boxShadow: '0 8px 24px rgba(15,23,42,0.06)' }}
        >
          <div className="flex items-center gap-[12px] mb-[16px]">
            <div
              className="w-[40px] h-[40px] rounded-2xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #4FD3C8, #38b2ac)',
                boxShadow: '0 4px 12px rgba(79,211,200,0.2)',
              }}
            >
              <Palette size={20} className="text-white" />
            </div>
            <h3 className="font-heading font-bold" style={{ color: textMain }}>Цветовая тема</h3>
          </div>
          <div className="grid grid-cols-3 gap-[8px]">
            {themes.map((theme) => {
              const ThemeIcon = theme.icon;
              return (
                <motion.button
                  key={theme.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => applyTheme(theme.id)}
                  className={`group relative h-[80px] rounded-2xl bg-gradient-to-br transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-xl ${
                    selectedTheme === theme.id ? 'ring-2 ring-white/50 ring-offset-2 ring-offset-[var(--bg-main)]' : ''
                  }`}
                  style={{
                    background: theme.gradient,
                    boxShadow: selectedTheme === theme.id ? `0 12px 28px ${theme.primary}66` : `0 6px 16px ${theme.primary}33`,
                  }}
                >
                  <div className="relative z-10 flex h-full flex-col items-center justify-center gap-[4px] text-white drop-shadow-sm">
                    <ThemeIcon className="h-[24px] w-[24px]" />
                    <span className="font-heading font-bold text-xs">{theme.name}</span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Предпросмотр сообщений */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-3xl p-5 pattern-bg-light"
          style={{ backgroundColor: cardBg, boxShadow: '0 8px 24px rgba(15,23,42,0.06)' }}
        >
          <h3 className="font-heading font-bold mb-[16px]" style={{ color: textMain }}>Предпросмотр</h3>
          <div className="space-y-[12px]">
            <div className="flex justify-start">
              <div className="message-incoming-pattern p-[12px] rounded-2xl rounded-bl-sm max-w-[80%]">
                <p className="font-body" style={{ color: textMain, fontSize: `${fontSize}px` }}>
                  Здесь ты можешь поменять цвет под своё настроение 🎨
                </p>
              </div>
            </div>
            <div className="flex justify-end">
              <div
                className="message-outgoing-pattern p-[12px] rounded-2xl rounded-br-sm max-w-[80%]"
                style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
              >
                <p className="font-body" style={{ fontSize: `${fontSize}px` }}>
                  Выбери, что тебе ближе 💜
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Серый режим */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-3xl p-5 flex items-center justify-between"
          style={{ backgroundColor: cardBg, boxShadow: '0 8px 24px rgba(15,23,42,0.06)' }}
        >
          <div>
            <h3 className="font-heading font-bold" style={{ color: textMain }}>Серый режим</h3>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              Приглушённые цвета для комфортного чтения
            </p>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setGrayMode(!grayMode)}
            className={`w-14 h-8 rounded-full transition-colors ${
              grayMode ? 'bg-[#6546C7]' : 'bg-[var(--bg-input)]'
            }`}
          >
            <motion.div
              animate={{ x: grayMode ? 24 : 4 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="w-6 h-6 rounded-full bg-white shadow-md"
            />
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
