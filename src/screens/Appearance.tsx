import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Type, Palette, Moon, Flower, Sun, Leaf, Snowflake, Sparkles, Waves } from 'lucide-react';

interface AppearanceProps {
  onBack: () => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  selectedTheme: string;
  setSelectedTheme: (theme: string) => void;
  grayMode: boolean;
  setGrayMode: (enabled: boolean) => void;
}

const themes = [
  {
    id: 'spring',
    name: 'Весна',
    icon: Flower,
    gradient: 'linear-gradient(135deg, #A8E6CF 0%, #FFD3B6 50%, #FFAAA5 100%)',
    messageGradient: 'linear-gradient(135deg, #A8E6CF 0%, #FFAAA5 100%)',
    primary: '#63B99D',
    bg: '#F0FFF4'
  },
  {
    id: 'summer',
    name: 'Лето',
    icon: Sun,
    gradient: 'linear-gradient(135deg, #FFE259 0%, #FFA751 50%, #FF6B6B 100%)',
    messageGradient: 'linear-gradient(135deg, #FFE259 0%, #FF6B6B 100%)',
    primary: '#E58A4A',
    bg: '#FFF9E6'
  },
  {
    id: 'autumn',
    name: 'Осень',
    icon: Leaf,
    gradient: 'linear-gradient(135deg, #F09819 0%, #ED4264 50%, #C94B4B 100%)',
    messageGradient: 'linear-gradient(135deg, #F09819 0%, #C94B4B 100%)',
    primary: '#C96B4B',
    bg: '#FFF5E6'
  },
  {
    id: 'winter',
    name: 'Зима',
    icon: Snowflake,
    gradient: 'linear-gradient(135deg, #E0EAFC 0%, #CFDEF3 50%, #A8C0FF 100%)',
    messageGradient: 'linear-gradient(135deg, #E0EAFC 0%, #A8C0FF 100%)',
    primary: '#6E91C9',
    bg: '#F0F4FF'
  },
  {
    id: 'aurora',
    name: 'Северное сияние',
    icon: Sparkles,
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #4FD3C8 50%, #48BB78 75%, #667eea 100%)',
    messageGradient: 'linear-gradient(135deg, #667eea 0%, #4FD3C8 50%, #48BB78 100%)',
    primary: '#4D9D99',
    bg: '#F0F0FF'
  },
  {
    id: 'sea',
    name: 'Море',
    icon: Waves,
    gradient: 'linear-gradient(135deg, #4FD3C8 0%, #3B82F6 50%, #1E3A8A 100%)',
    messageGradient: 'linear-gradient(135deg, #4FD3C8 0%, #1E3A8A 100%)',
    primary: '#277FC0',
    bg: '#E6F7FF'
  },
];

export function Appearance({
  onBack,
  fontSize,
  setFontSize,
  selectedTheme,
  setSelectedTheme,
  grayMode,
  setGrayMode,
}: AppearanceProps) {

  const getFontSizeLabel = () => {
    if (fontSize < 14) return 'Мелко';
    if (fontSize > 18) return 'Крупно';
    return 'Стандарт';
  };

  const currentTheme = themes.find(t => t.id === selectedTheme);

  const applyTheme = (themeId: string) => {
    const theme = themes.find((item) => item.id === themeId);
    if (!theme) return;

    setSelectedTheme(themeId);
    document.documentElement.setAttribute('data-theme', themeId);
    document.documentElement.style.setProperty('--theme-primary', theme.primary);
    document.documentElement.style.setProperty('--theme-message-gradient', theme.messageGradient);
  };

  useEffect(() => {
    if (currentTheme) {
      document.documentElement.setAttribute('data-theme', currentTheme.id);
      document.documentElement.style.setProperty('--theme-primary', currentTheme.primary);
      document.documentElement.style.setProperty('--theme-message-gradient', currentTheme.messageGradient);
    }
  }, [currentTheme]);

  const cardBg = grayMode ? '#35383D' : '#FFFFFF';
  const previewBg = grayMode ? '#2B2E33' : '#F9FAFB';
  const textMain = grayMode ? '#FFFFFF' : '#1A1A1A';
  const textSecondary = grayMode ? '#D6D9DE' : '#6B7280';
  const containerBg = grayMode
    ? 'radial-gradient(ellipse at top left, #34383F 0%, #24272B 60%, #1B1E22 100%)'
    : (currentTheme?.bg || '#FFF8ED');

  return (
    <div
      className="h-full overflow-y-auto pb-[96px] md:pb-[24px] transition-colors duration-500 pattern-bg-light"
      style={{ background: containerBg }}
    >
      {/* Шапка */}
      <div
        className="px-[16px] sm:px-[24px] pt-[24px] pb-[16px] sticky top-0 z-20 bg-[var(--bg-main)]"
      >
        <div className="flex items-center gap-[12px]">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onBack}
            className="w-[44px] h-[44px] rounded-2xl flex items-center justify-center text-[#6546C7]"
            style={{
              backgroundColor: cardBg,
              boxShadow: '0 4px 12px rgba(101,70,199,0.15)'
            }}
          >
            <ChevronLeft size={22} />
          </motion.button>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl" style={{ color: textMain }}>
            Оформление
          </h1>
        </div>
      </div>

      <div className="px-[16px] sm:px-[24px] space-y-[24px] max-w-2xl mx-auto pt-[8px]">

        {/* Размер текста */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl p-[20px]"
          style={{ backgroundColor: cardBg, boxShadow: '0 8px 24px rgba(101,70,199,0.08)' }}
        >
          <div className="flex items-center gap-[12px] mb-[16px]">
            <div
              className="w-[40px] h-[40px] rounded-2xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #6546C7, #8366D9)',
                boxShadow: '0 4px 12px rgba(101,70,199,0.3)',
              }}
            >
              <Type size={20} className="text-white" />
            </div>
            <h3 className="font-heading font-bold" style={{ color: textMain }}>Размер текста</h3>
          </div>

          <div className="flex items-center justify-between mb-[12px]">
            <span className="text-sm font-body" style={{ color: textSecondary }}>Текущий размер:</span>
            <span className="font-heading font-bold text-[#6546C7]">{getFontSizeLabel()}</span>
          </div>

          <div className="flex items-center gap-[16px]">
            <span className="text-xs font-body" style={{ color: textSecondary }}>A</span>
            <input
              type="range"
              min="12"
              max="24"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="flex-1 h-[8px] rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #6546C7 ${((fontSize - 12) / 12) * 100}%, #E5E7EB ${((fontSize - 12) / 12) * 100}%)`,
              }}
            />
            <span className="text-lg font-body font-bold" style={{ color: textSecondary }}>A</span>
          </div>

          <div className="mt-[16px] p-[16px] rounded-2xl" style={{ backgroundColor: previewBg }}>
            <p
              className="font-body transition-all duration-300"
              style={{ fontSize: `${fontSize}px`, color: textMain }}
            >
              Пример текста для просмотра размера шрифта
            </p>
          </div>
        </motion.div>

        {/* Серая тема */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-3xl p-[20px]"
          style={{ backgroundColor: cardBg, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
        >
          <div className="flex items-center gap-[12px] mb-[16px]">
            <div
              className="w-[40px] h-[40px] rounded-2xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #555A62, #2B2E33)' }}
            >
              <Moon size={20} className="text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-heading font-bold" style={{ color: textMain }}>Серая тема</h3>
              <p className="text-xs font-body mt-[2px]" style={{ color: textSecondary }}>
                Нейтральный фон и белый текст для лучшего контраста
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setGrayMode(!grayMode)}
            className="w-full py-[12px] rounded-2xl font-heading font-bold transition-colors"
            style={{
              backgroundColor: grayMode ? '#FFFFFF' : '#E5E7EB',
              color: grayMode ? '#24272B' : '#1A1A1A',
            }}
          >
            {grayMode ? 'Серая тема включена' : 'Включить серую тему'}
          </button>
        </motion.div>

        {/* Цветовые темы */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-3xl p-[20px]"
          style={{ backgroundColor: cardBg, boxShadow: '0 8px 24px rgba(101,70,199,0.08)' }}
        >
          <div className="flex items-center gap-[12px] mb-[16px]">
            <div
              className="w-[40px] h-[40px] rounded-2xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #4FD3C8, #38b2ac)',
                boxShadow: '0 4px 12px rgba(79,211,200,0.3)',
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

        {/* Предпросмотр сообщений с узорами */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-3xl p-[20px] pattern-bg-light"
          style={{ backgroundColor: cardBg, boxShadow: '0 8px 24px rgba(101,70,199,0.08)' }}
        >
          <h3 className="font-heading font-bold mb-[16px]" style={{ color: textMain }}>Предпросмотр</h3>
          <div className="space-y-[12px]">
            {/* Входящее сообщение (нейтральное) */}
            <div className="flex justify-start">
              <div
                className="message-incoming-pattern p-[12px] rounded-2xl rounded-bl-sm max-w-[80%]"
              >
                <p className="font-body" style={{ color: textMain, fontSize: `${fontSize}px` }}>
                  Здесь ты можешь поменять цвет под своё настроение 🎨
                </p>
              </div>
            </div>

            {/* Исходящее сообщение (цвет темы) */}
            <div className="flex justify-end">
              <div
                className="message-outgoing-pattern p-[12px] rounded-2xl rounded-br-sm max-w-[80%]"
                style={{
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}
              >
                <p className="font-body" style={{ fontSize: `${fontSize}px` }}>
                  Выбери, что тебе ближе 💜
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}