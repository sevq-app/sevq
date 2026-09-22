import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Trash2, Clock } from 'lucide-react';
import { stickers, emojiCategories, animatedEmojis } from '@/data/stickers';

interface StickerEmojiPanelProps {
  onSelectEmoji: (emoji: string) => void;
  onSelectSticker: (emoji: string) => void;
}

const RECENT_STICKERS_KEY = 'sevchik_recent_stickers';
const RECENT_EMOJI_KEY = 'sevchik_recent_emoji';
const MAX_RECENT = 18;

function loadRecent(key: string): string[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function pushRecent(key: string, value: string, current: string[]): string[] {
  const next = [value, ...current.filter((v) => v !== value)].slice(0, MAX_RECENT);
  try {
    localStorage.setItem(key, JSON.stringify(next));
  } catch {
    // хранилище недоступно — молча игнорируем
  }
  return next;
}

const GLASS_BG = 'rgba(255,255,255,0.65)';

export function StickerEmojiPanel({ onSelectEmoji, onSelectSticker }: StickerEmojiPanelProps) {
  const [tab, setTab] = useState<'stickers' | 'emoji'>('stickers');
  const [stickerSearch, setStickerSearch] = useState('');
  const [recentStickers, setRecentStickers] = useState<string[]>(() => loadRecent(RECENT_STICKERS_KEY));
  const [recentEmoji, setRecentEmoji] = useState<string[]>(() => loadRecent(RECENT_EMOJI_KEY));
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const holdTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    return () => {
      if (holdTimeoutRef.current) clearTimeout(holdTimeoutRef.current);
    };
  }, []);

  const filteredStickers = stickers.filter((s) =>
    s.label.toLowerCase().includes(stickerSearch.toLowerCase())
  );

  const handleStickerClick = (emoji: string) => {
    setRecentStickers((prev) => pushRecent(RECENT_STICKERS_KEY, emoji, prev));
    onSelectSticker(emoji);
  };

  const handleEmojiClick = (emoji: string) => {
    setRecentEmoji((prev) => pushRecent(RECENT_EMOJI_KEY, emoji, prev));
    onSelectEmoji(emoji);
  };

  const handleStickerHoldStart = () => {
    holdTimeoutRef.current = setTimeout(() => setShowClearConfirm(true), 400);
  };

  const handleStickerHoldEnd = () => {
    if (holdTimeoutRef.current) {
      clearTimeout(holdTimeoutRef.current);
      holdTimeoutRef.current = null;
    }
  };

  const handleClearRecentStickers = () => {
    setRecentStickers([]);
    try {
      localStorage.removeItem(RECENT_STICKERS_KEY);
    } catch {
      // хранилище недоступно — молча игнорируем
    }
    setShowClearConfirm(false);
  };

  const scrollToSection = (id: string) => {
    sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: '45vh', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className="shrink-0 overflow-hidden relative"
      style={{
        background: GLASS_BG,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        boxShadow: '0 -4px 16px rgba(15,23,42,0.05)',
        maxHeight: '400px',
      }}
    >
      <div className="h-full flex flex-col">
        {/* Строка быстрого перехода по категориям */}
        <div className="flex items-center gap-2 px-3 pt-3 pb-2 overflow-x-auto no-scrollbar shrink-0">
          <button
            onClick={() => scrollToSection('recent')}
            className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.6)' }}
          >
            <Clock size={16} style={{ color: 'var(--text-secondary)' }} />
          </button>
          {tab === 'emoji' &&
            emojiCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => scrollToSection(cat.id)}
                className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-lg"
                style={{ background: 'rgba(255,255,255,0.6)' }}
              >
                {cat.emojis[0]}
              </button>
            ))}
        </div>

        {tab === 'stickers' && (
          <div className="px-4 pb-2 shrink-0">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
              <input
                type="text"
                value={stickerSearch}
                onChange={(e) => setStickerSearch(e.target.value)}
                placeholder="Найти стикер"
                className="w-full rounded-full py-2 pl-9 pr-3 text-sm font-body text-[var(--text-main)] placeholder:text-[var(--text-secondary)] focus:outline-none"
                style={{ background: 'rgba(255,255,255,0.6)' }}
              />
            </div>
          </div>
        )}

        <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto px-4 pb-2">
          {tab === 'stickers' ? (
            <>
              {recentStickers.length > 0 && !stickerSearch && (
                <div ref={(el) => { sectionRefs.current.recent = el; }} className="mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Недавние</h3>
                    <button onClick={() => setShowClearConfirm(true)} className="text-[var(--text-secondary)]">
                      <X size={14} />
                    </button>
                  </div>
                  <div className="grid grid-cols-6 gap-2">
                    {recentStickers.map((emoji, i) => (
                      <motion.button
                        key={`recent-${i}`}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleStickerClick(emoji)}
                        onMouseDown={handleStickerHoldStart}
                        onMouseUp={handleStickerHoldEnd}
                        onMouseLeave={handleStickerHoldEnd}
                        onTouchStart={handleStickerHoldStart}
                        onTouchEnd={handleStickerHoldEnd}
                        className="aspect-square rounded-2xl flex items-center justify-center text-3xl"
                        style={{ background: 'rgba(255,255,255,0.5)' }}
                      >
                        {emoji}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              <h3 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Все стикеры</h3>
              <div className="grid grid-cols-6 gap-2">
                {filteredStickers.map((s) => (
                  <motion.button
                    key={s.id}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleStickerClick(s.emoji)}
                    onMouseDown={handleStickerHoldStart}
                    onMouseUp={handleStickerHoldEnd}
                    onMouseLeave={handleStickerHoldEnd}
                    onTouchStart={handleStickerHoldStart}
                    onTouchEnd={handleStickerHoldEnd}
                    className="aspect-square rounded-2xl flex items-center justify-center text-3xl"
                    style={{ background: 'rgba(255,255,255,0.5)' }}
                    title={s.label}
                  >
                    {s.emoji}
                  </motion.button>
                ))}
                {filteredStickers.length === 0 && (
                  <p className="col-span-6 text-center text-sm text-[var(--text-secondary)] font-body py-8">
                    Ничего не найдено
                  </p>
                )}
              </div>
            </>
          ) : (
            <>
              {recentEmoji.length > 0 && (
                <div ref={(el) => { sectionRefs.current.recent = el; }} className="mb-3">
                  <h3 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Недавние</h3>
                  <div className="grid grid-cols-8 gap-1">
                    {recentEmoji.map((emoji, i) => (
                      <button
                        key={`recent-e-${i}`}
                        onClick={() => handleEmojiClick(emoji)}
                        className="aspect-square rounded-xl flex items-center justify-center text-2xl"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-3">
                <h3 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Анимированные</h3>
                <div className="grid grid-cols-8 gap-1">
                  {animatedEmojis.map((emoji, i) => (
                    <button
                      key={`anim-${i}`}
                      onClick={() => handleEmojiClick(emoji)}
                      className="aspect-square rounded-xl flex items-center justify-center text-2xl"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {emojiCategories.map((cat) => (
                <div key={cat.id} ref={(el) => { sectionRefs.current[cat.id] = el; }} className="mb-3">
                  <h3 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">{cat.label}</h3>
                  <div className="grid grid-cols-8 gap-1">
                    {cat.emojis.map((emoji, i) => (
                      <button
                        key={`${cat.id}-${i}`}
                        onClick={() => handleEmojiClick(emoji)}
                        className="aspect-square rounded-xl flex items-center justify-center text-2xl"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Вкладки снизу панели */}
        <div className="flex items-center gap-2 px-4 py-2.5 shrink-0" style={{ background: 'rgba(255,255,255,0.35)' }}>
          <button
            onClick={() => setTab('stickers')}
            className="px-4 py-1.5 rounded-full font-heading font-bold text-sm transition-colors"
            style={
              tab === 'stickers'
                ? { background: '#6546C7', color: '#fff' }
                : { background: 'rgba(255,255,255,0.5)', color: 'var(--text-secondary)' }
            }
          >
            Стикеры
          </button>
          <button
            onClick={() => setTab('emoji')}
            className="px-4 py-1.5 rounded-full font-heading font-bold text-sm transition-colors"
            style={
              tab === 'emoji'
                ? { background: '#6546C7', color: '#fff' }
                : { background: 'rgba(255,255,255,0.5)', color: 'var(--text-secondary)' }
            }
          >
            Эмодзи
          </button>
        </div>
      </div>

      {/* Подтверждение очистки недавних стикеров */}
      <AnimatePresence>
        {showClearConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 flex items-end justify-center bg-black/30"
            onClick={() => setShowClearConfirm(false)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full bg-white rounded-t-3xl p-4"
              style={{ boxShadow: '0 -12px 32px rgba(15,23,42,0.12)' }}
            >
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleClearRecentStickers}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-left"
              >
                <Trash2 size={20} className="text-[#EF4444]" />
                <span className="font-heading font-semibold text-sm text-[#EF4444]">Очистить последние стикеры</span>
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowClearConfirm(false)}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-left"
              >
                <X size={20} style={{ color: 'var(--text-secondary)' }} />
                <span className="font-heading font-semibold text-sm text-[#1A1A1A]">Отмена</span>
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
