import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Image as ImageIcon, X } from 'lucide-react';
import type { Chat } from '@/data/mock';

interface MediaGalleryProps {
  chat: Chat;
  onBack: () => void;
}

export function MediaGallery({ chat, onBack }: MediaGalleryProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const images = chat.messages.filter((m) => m.text.startsWith('image:')).map((m) => m.text.replace('image:', ''));

  return (
    <div className="h-full overflow-y-auto pb-8" style={{ background: 'var(--bg-main)' }}>
      <div className="px-4 py-3 flex items-center gap-3 sticky top-0 z-10 bg-transparent">
        <motion.button
          whileTap={{ scale: 0.9, y: 2 }}
          onClick={onBack}
          className="w-12 h-12 rounded-full bg-sevchik-cream text-sevchik-text btn-3d flex items-center justify-center"
          style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
        >
          <ArrowLeft size={22} />
        </motion.button>
        <h2 className="font-heading font-bold text-lg text-sevchik-text">Медиафайлы</h2>
      </div>

      <div className="px-4 sm:px-6 mt-2 max-w-2xl mx-auto">
        {images.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-20 text-sevchik-textSecondary">
            <ImageIcon size={40} className="mb-3 opacity-50" />
            <p className="text-sm font-body">Общих медиафайлов пока нет</p>
            <p className="text-xs font-body mt-1 opacity-70">Фото, отправленные в этом чате, появятся здесь</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {images.map((src, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: i * 0.03 }}
                onClick={() => setSelected(src)}
                className="aspect-square overflow-hidden rounded-xl"
              >
                <img src={src} alt="" className="w-full h-full object-cover" />
              </motion.button>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-5"
            onClick={() => setSelected(null)}
          >
            <button
              onClick={() => setSelected(null)}
              className="absolute top-4 right-4 w-11 h-11 rounded-full bg-white/15 flex items-center justify-center text-white"
              aria-label="Закрыть"
            >
              <X size={20} />
            </button>
            <img src={selected} alt="" className="max-h-[85vh] max-w-full rounded-2xl object-contain" onClick={(e) => e.stopPropagation()} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
