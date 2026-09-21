import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Trash2 } from 'lucide-react';
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

export function StickerEmojiPanel({ onSelectEmoji, onSelectSticker }: StickerEmojiPanelProps) {
  const [tab, setTab] = useState<'stickers' | 'emoji'>('stickers');
  const [stickerSearch, setStickerSearch] = useState('');
  const [recentStickers, setRecentStickers] = useState<string[]>(() => loadRecent(RECENT_STICKERS_KEY));
  const [recentEmoji, setRecentEmoji] = useState<string[]>(() => loadRecent(RECENT_EMOJI_KEY));
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const holdTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 340, opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className="overflow-hidden bg-white relative"
      style={{ boxShadow: '0 -4px 16px rgba(15,23,42,0.05)' }}
    >
      <div className="h-[340px] flex flex-col">
        {/* Вкладки */}
        <div className="flex items-center gap-2 px-4 pt-3 pb-2">
          <button
            onClick={() => setTab('stickers')}
            className="px-4 py-2 rounded-full font-heading font-bold text-sm transition-colors"
            style={
              tab === 'stickers'
                ? { background: '#6546C7', color: '#fff' }
                : { background: 'var(--bg-input)', color: 'var(--text-secondary)' }
            }
          >
            Стикеры
          </button>
          <button
            onClick={() => setTab('emoji')}
            className="px-4 py-2 rounded-full font-heading font-bold text-sm transition-colors"
            style={
              tab === 'emoji'
                ? { background: '#6546C7', color: '#fff' }
                : { background: 'var(--bg-input)', color: 'var(--text-secondary)' }
            }
          >
            Эмодзи
          </button>
        </div>

        {tab === 'stickers' ? (
          <>
            <div className="px-4 pb-2">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                <input
                  type="text"
                  value={stickerSearch}
                  onChange={(e) => setStickerSearch(e.target.value)}
                  placeholder="Поиск стикеров"
                  className="w-full bg-[var(--bg-input)] rounded-full py-2 pl-9 pr-3 text-sm font-body text-[var(--text-main)] placeholder:text-[var(--text-secondary)] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-3">
              {recentStickers.length > 0 && !stickerSearch && (
                <div className="mb-3">
                  <h3 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Недавние</h3>
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
                        className="aspect-square rounded-2xl bg-[var(--bg-input)] flex items-center justify-center text-3xl"
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
                    className="aspect-square rounded-2xl bg-[var(--bg-input)] flex items-center justify-center text-3xl"
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
            </div>
          </>
        ) : (
          <div className="flex-1 overflow-y-auto px-4 pb-3 pt-1">
            {recentEmoji.length > 0 && (
              <div className="mb-3">
                <h3 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Недавние</h3>
                <div className="grid grid-cols-8 gap-1">
                  {recentEmoji.map((emoji, i) => (
                    <button
                      key={`recent-e-${i}`}
                      onClick={() => handleEmojiClick(emoji)}
                      className="aspect-square rounded-xl flex items-center justify-center text-2xl hover:bg-[var(--bg-input)]"
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
                    className="aspect-square rounded-xl flex items-center justify-center text-2xl hover:bg-[var(--bg-input)]"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {emojiCategories.map((cat) => (
              <div key={cat.id} className="mb-3">
                <h3 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">{cat.label}</h3>
                <div className="grid grid-cols-8 gap-1">
                  {cat.emojis.map((emoji, i) => (
                    <button
                      key={`${cat.id}-${i}`}
                      onClick={() => handleEmojiClick(emoji)}
                      className="aspect-square rounded-xl flex items-center justify-center text-2xl hover:bg-[var(--bg-input)]"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
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
