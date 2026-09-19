import { motion } from 'framer-motion';
import { ChevronLeft, Type, Palette, Moon } from 'lucide-react';

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
    gradient: 'linear-gradient(135deg, #A8E6CF 0%, #FFD3B6 50%, #FFAAA5 100%)',
    messageGradient: 'linear-gradient(135deg, #A8E6CF 0%, #FFAAA5 100%)',
    bg: '#F0FFF4'
  },
  { 
    id: 'summer', 
    name: 'Лето', 
    gradient: 'linear-gradient(135deg, #FFE259 0%, #FFA751 50%, #FF6B6B 100%)',
    messageGradient: 'linear-gradient(135deg, #FFE259 0%, #FF6B6B 100%)',
    bg: '#FFF9E6'
  },
  { 
    id: 'autumn', 
    name: 'Осень', 
    gradient: 'linear-gradient(135deg, #F09819 0%, #ED4264 50%, #C94B4B 100%)',
    messageGradient: 'linear-gradient(135deg, #F09819 0%, #C94B4B 100%)',
    bg: '#FFF5E6'
  },
  { 
    id: 'winter', 
    name: 'Зима', 
    gradient: 'linear-gradient(135deg, #E0EAFC 0%, #CFDEF3 50%, #A8C0FF 100%)',
    messageGradient: 'linear-gradient(135deg, #E0EAFC 0%, #A8C0FF 100%)',
    bg: '#F0F4FF'
  },
  { 
    id: 'aurora', 
    name: 'Северное сияние', 
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #4FD3C8 50%, #48BB78 75%, #667eea 100%)',
    messageGradient: 'linear-gradient(135deg, #667eea 0%, #4FD3C8 50%, #48BB78 100%)',
    bg: '#F0F0FF'
  },
  { 
    id: 'sea', 
    name: 'Море', 
    gradient: 'linear-gradient(135deg, #4FD3C8 0%, #3B82F6 50%, #1E3A8A 100%)',
    messageGradient: 'linear-gradient(135deg, #4FD3C8 0%, #1E3A8A 100%)',
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

  const cardBg = grayMode ? '#35383D' : '#FFFFFF';
  const previewBg = grayMode ? '#2B2E33' : '#F9FAFB';
  const textMain = grayMode ? '#FFFFFF' : '#1A1A1A';
  const textSecondary = grayMode ? '#D6D9DE' : '#6B7280';
  const containerBg = grayMode ? '#24272B' : (currentTheme?.bg || '#FFF8ED');

  return (
    <div
      className="h-full overflow-y-auto pb-24 md:pb-6 transition-colors duration-500 pattern-bg-light"
      style={{ background: containerBg }}
    >
      {/* Шапка */}
      <div
        className="px-4 sm:px-6 pt-6 pb-4 sticky top-0 z-20"
        style={{
          background: `linear-gradient(180deg, ${containerBg} 80%, transparent 100%)`,
        }}
      >
        <div className="flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onBack}
            className="w-11 h-11 rounded-2xl flex items-center justify-center text-[#6546C7]"
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

      <div className="px-4 sm:px-6 space-y-6 max-w-2xl mx-auto pt-2">
        
        {/* Размер текста */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl p-5"
          style={{ backgroundColor: cardBg, boxShadow: '0 8px 24px rgba(101,70,199,0.08)' }}
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
            <h3 className="font-heading font-bold" style={{ color: textMain }}>Размер текста</h3>
          </div>
          
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-body" style={{ color: textSecondary }}>Текущий размер:</span>
            <span className="font-heading font-bold text-[#6546C7]">{getFontSizeLabel()}</span>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-xs font-body" style={{ color: textSecondary }}>A</span>
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
            <span className="text-lg font-body font-bold" style={{ color: textSecondary }}>A</span>
          </div>
          
          <div className="mt-4 p-4 rounded-2xl" style={{ backgroundColor: previewBg }}>
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
          className="rounded-3xl p-5"
          style={{ backgroundColor: cardBg, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #555A62, #2B2E33)' }}
            >
              <Moon size={20} className="text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-heading font-bold" style={{ color: textMain }}>Серая тема</h3>
              <p className="text-xs font-body mt-0.5" style={{ color: textSecondary }}>
                Нейтральный фон и белый текст для лучшего контраста
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setGrayMode(!grayMode)}
            className="w-full py-3 rounded-2xl font-heading font-bold transition-colors"
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
          className="rounded-3xl p-5"
          style={{ backgroundColor: cardBg, boxShadow: '0 8px 24px rgba(101,70,199,0.08)' }}
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
            <h3 className="font-heading font-bold" style={{ color: textMain }}>Цветовая тема</h3>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            {themes.map((theme) => (
              <motion.button
                key={theme.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedTheme(theme.id)}
                className={`relative h-16 rounded-xl transition-all ${
                  selectedTheme === theme.id ? 'ring-2 ring-[#6546C7] ring-offset-2' : ''
                }`}
                style={{
                  background: theme.gradient,
                  boxShadow: selectedTheme === theme.id
                    ? `0 4px 12px rgba(101,70,199,0.4)`
                    : '0 2px 8px rgba(0,0,0,0.1)',
                }}
              >
                <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.25) 0%, transparent 50%)' }} />
                <div className="relative z-10 flex items-center justify-center h-full">
                  <span className="font-heading font-bold text-white text-xs drop-shadow-md">{theme.name}</span>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Предпросмотр сообщений с узорами */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-3xl p-5 pattern-bg-light"
          style={{ backgroundColor: cardBg, boxShadow: '0 8px 24px rgba(101,70,199,0.08)' }}
        >
          <h3 className="font-heading font-bold mb-4" style={{ color: textMain }}>Предпросмотр</h3>
          <div className="space-y-3">
            {/* Входящее сообщение (нейтральное) */}
            <div className="flex justify-start">
              <div
                className="p-3 rounded-2xl rounded-tl-none max-w-[80%]"
                style={{
                  backgroundColor: '#F3F4F6',
                  fontSize: `${fontSize}px`
                }}
              >
                <p className="font-body" style={{ color: textMain }}>
                  Здесь ты можешь поменять цвет под своё настроение 🎨
                </p>
              </div>
            </div>
            
            {/* Исходящее сообщение (цвет темы) */}
            <div className="flex justify-end">
              <div
                className="p-3 rounded-2xl rounded-tr-none max-w-[80%]"
                style={{
                  background: currentTheme?.messageGradient || 'linear-gradient(135deg, #6546C7, #8366D9)',
                  color: 'white',
                  fontSize: `${fontSize}px`,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}
              >
                <p className="font-body">
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