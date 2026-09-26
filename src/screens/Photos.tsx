import { useEffect, useRef, useState, type ChangeEvent, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, Loader2, MoreVertical, Plus, Share2, Trash2, X } from 'lucide-react';
import { AvatarCropper } from '@/components/AvatarCropper';
import { uploadMyAvatar } from '@/lib/avatarPhoto';
import { deleteMyPhotos, listMyPhotos, uploadMyPhoto, type RemotePhoto } from '@/lib/photoGallery';

const MAX_PHOTO_SIZE = 8 * 1024 * 1024;

async function urlToFile(url: string, filename: string) {
  const blob = await (await fetch(url)).blob();
  return new File([blob], filename, { type: blob.type || 'image/jpeg' });
}

function downloadUrl(url: string, filename: string) {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => (typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('empty result')));
    reader.onerror = () => reject(reader.error ?? new Error('read failed'));
    reader.readAsDataURL(file);
  });
}

export function Photos({ onBack }: { onBack: () => void }) {
  const [photos, setPhotos] = useState<RemotePhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selected, setSelected] = useState<RemotePhoto | null>(null);
  const [cropSource, setCropSource] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    listMyPhotos()
      .then((remote) => {
        if (!cancelled) setPhotos(remote);
      })
      .catch((err) => console.error('Не удалось загрузить фотографии:', err))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const exitSelectMode = () => {
    setSelectMode(false);
    setSelectedIds([]);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  };

  const handlePhotoClick = (photo: RemotePhoto) => {
    if (selectMode) {
      toggleSelect(photo.id);
      return;
    }
    setSelected(photo);
  };

  // Просто добавляет фото в галерею (и в Supabase Storage) — БЕЗ кроппера. Обрезка нужна
  // только для аватарки в профиле (см. "Сделать аватаркой" ниже и Profile.tsx).
  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = '';
    if (files.length === 0) return;

    setUploading(true);
    setError(null);
    let failed = 0;
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        setError('Один из файлов не является изображением. Выберите файлы в формате JPG, PNG или похожем.');
        failed += 1;
        continue;
      }
      if (file.size > MAX_PHOTO_SIZE) {
        setError('Один из файлов слишком большой. Максимальный размер — 8 МБ.');
        failed += 1;
        continue;
      }
      try {
        const dataUrl = await readFileAsDataUrl(file);
        const uploaded = await uploadMyPhoto(dataUrl);
        setPhotos((current) => [uploaded, ...current]);
      } catch (err) {
        console.error('Не удалось загрузить фото:', err);
        failed += 1;
      }
    }
    if (failed > 0 && files.length > 1) {
      setError(`Не удалось загрузить ${failed} из ${files.length} фото. Проверьте соединение и попробуйте ещё раз.`);
    } else if (failed > 0 && files.length === 1) {
      setError('Не удалось загрузить фото. Проверьте соединение и попробуйте ещё раз.');
    }
    setUploading(false);
  };

  const shareSelected = async () => {
    const targets = photos.filter((p) => selectedIds.includes(p.id));
    try {
      const files = await Promise.all(targets.map((p, i) => urlToFile(p.url, `sevchik-photo-${i + 1}.jpg`)));
      if (navigator.canShare?.({ files })) {
        await navigator.share({ files, title: files.length > 1 ? 'Фотографии' : 'Фотография' });
        return;
      }
    } catch (err) {
      if ((err as Error)?.name === 'AbortError') return; // пользователь сам отменил — не подменяем это скачиванием
    }
    // Запасной путь для браузеров без Web Share API с файлами (в основном десктоп) — скачиваем.
    targets.forEach((p, i) => downloadUrl(p.url, `sevchik-photo-${i + 1}.jpg`));
  };

  const deleteSelected = async () => {
    const targets = photos.filter((p) => selectedIds.includes(p.id));
    setDeleteConfirmOpen(false);
    exitSelectMode();
    try {
      await deleteMyPhotos(targets);
      setPhotos((current) => current.filter((p) => !targets.some((t) => t.id === p.id)));
    } catch (err) {
      console.error('Не удалось удалить фото:', err);
      setError('Не удалось удалить фото на сервере. Попробуйте ещё раз.');
    }
  };

  return (
    <div className="h-full overflow-y-auto px-4 sm:px-6 pt-6 pb-28 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        {selectMode ? (
          <>
            <button onClick={exitSelectMode} className="text-sevchik-textSecondary font-heading font-semibold">
              Отмена
            </button>
            <span className="font-heading font-bold text-sm text-sevchik-textSecondary">Выбрано: {selectedIds.length}</span>
          </>
        ) : (
          <>
            <button onClick={onBack} className="flex items-center gap-2 text-sevchik-textSecondary">
              <ArrowLeft size={20} /> Назад
            </button>
            <div className="relative">
              <motion.button
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.05 }}
                onClick={() => setShowMenu((v) => !v)}
                className="w-11 h-11 rounded-full flex items-center justify-center text-sevchik-textSecondary bg-[var(--bg-card)]"
                style={{ boxShadow: '0 4px 12px rgba(15,23,42,0.07)' }}
                aria-label="Ещё"
              >
                <MoreVertical size={20} />
              </motion.button>
              <AnimatePresence>
                {showMenu && (
                  <>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setShowMenu(false)}
                      className="fixed inset-0 z-30"
                    />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: -10 }}
                      transition={{ duration: 0.15, ease: 'easeOut' }}
                      className="absolute right-0 top-14 w-60 bg-[var(--bg-card)] rounded-2xl overflow-hidden z-40"
                      style={{ boxShadow: '0 12px 32px rgba(15,23,42,0.12)' }}
                    >
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setShowMenu(false);
                          fileInputRef.current?.click();
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3.5 text-left border-b border-[var(--border-color)]"
                      >
                        <Plus size={19} className="text-sevchik-textSecondary" />
                        <span className="font-heading font-semibold text-sm text-[var(--text-main)]">Добавить фотографию</span>
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setShowMenu(false);
                          setSelectMode(true);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
                      >
                        <Check size={19} className="text-sevchik-textSecondary" />
                        <span className="font-heading font-semibold text-sm text-[var(--text-main)]">Выбрать</span>
                      </motion.button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </>
        )}
      </div>
      <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} />

      <h1 className="font-heading font-extrabold text-2xl mb-5">Фотографии</h1>
      {loading ? (
        <div className="flex items-center gap-2 text-sm text-sevchik-textSecondary py-6">
          <Loader2 size={16} className="animate-spin" /> Загружаем фотографии…
        </div>
      ) : photos.length || uploading ? (
        <div className="grid grid-cols-3 gap-2">
          {uploading && (
            <div className="aspect-square rounded-xl bg-[var(--bg-input)] flex items-center justify-center">
              <Loader2 size={20} className="animate-spin text-sevchik-textSecondary" />
            </div>
          )}
          {photos.map((photo) => {
            const isSelected = selectedIds.includes(photo.id);
            return (
              <button key={photo.id} onClick={() => handlePhotoClick(photo)} className="relative aspect-square overflow-hidden rounded-xl">
                <img src={photo.url} alt="" className="w-full h-full object-cover" />
                {selectMode && (
                  <div
                    className={`absolute top-1.5 right-1.5 w-6 h-6 rounded-full flex items-center justify-center border-2 border-white transition-colors ${
                      isSelected ? 'bg-sevchik-accent' : 'bg-black/30'
                    }`}
                  >
                    {isSelected && <Check size={14} className="text-white" strokeWidth={3} />}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-sevchik-textSecondary">Фото ещё не загрузили</p>
      )}

      {/* Просмотр одной фотографии — не трогаем, работает как раньше. */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-black/80 flex flex-col items-center justify-center p-5" onClick={() => setSelected(null)}>
          <img src={selected.url} alt="Увеличенное фото" className="max-h-[75vh] max-w-full rounded-2xl object-contain" onClick={(event) => event.stopPropagation()} />
          <button
            onClick={(event) => {
              event.stopPropagation();
              setCropSource(selected.url);
            }}
            className="mt-6 px-6 py-3 rounded-xl bg-sevchik-accent text-white font-heading font-bold"
          >
            Сделать аватаркой
          </button>
        </div>
      )}

      {cropSource && (
        <AvatarCropper
          imageSrc={cropSource}
          onCancel={() => setCropSource(null)}
          onSave={(dataUrl) => {
            setCropSource(null);
            setSelected(null);
            uploadMyAvatar(dataUrl).catch((err) => {
              console.error('Не удалось сохранить аватарку в Supabase:', err);
              setError('Аватарка сохранилась только на этом устройстве — не удалось загрузить её на сервер. Проверьте соединение и попробуйте ещё раз.');
            });
          }}
        />
      )}

      {/* Нижняя панель действий (только в режиме выбора) */}
      <AnimatePresence>
        {selectMode && selectedIds.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-20 md:bottom-6 left-0 right-0 px-4 sm:px-6 max-w-2xl mx-auto z-20"
          >
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={shareSelected}
                className="flex-1 py-4 rounded-2xl text-white font-heading font-bold text-base flex items-center justify-center gap-2"
                style={{ background: '#4DC3C8', boxShadow: '0 4px 14px rgba(77,195,200,0.2)' }}
              >
                <Share2 size={20} />
                <span>Переслать</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setDeleteConfirmOpen(true)}
                className="flex-1 py-4 rounded-2xl text-white font-heading font-bold text-base flex items-center justify-center gap-2"
                style={{ background: '#EF4444', boxShadow: '0 4px 14px rgba(239,68,68,0.2)' }}
              >
                <Trash2 size={20} />
                <span>Удалить ({selectedIds.length})</span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {deleteConfirmOpen && (
        <Modal onClose={() => setDeleteConfirmOpen(false)}>
          <h2 className="font-heading font-extrabold text-xl">Удалить фото?</h2>
          <p className="text-sm text-sevchik-textSecondary mt-2">
            Вы уверены, что хотите удалить {selectedIds.length === 1 ? 'выбранное фото' : `выбранные фото (${selectedIds.length})`}? Это действие нельзя отменить.
          </p>
          <div className="space-y-2 mt-5">
            <button onClick={deleteSelected} className="w-full rounded-xl bg-red-500 text-white py-3 font-heading font-bold">
              Да, удалить
            </button>
            <button onClick={() => setDeleteConfirmOpen(false)} className="w-full rounded-xl bg-[var(--bg-input)] py-3 font-heading font-bold text-[var(--text-main)]">
              Отмена
            </button>
          </div>
        </Modal>
      )}

      {error && (
        <Modal onClose={() => setError(null)}>
          <h2 className="font-heading font-extrabold text-xl">Не получилось</h2>
          <p className="text-sm text-sevchik-textSecondary mt-2">{error}</p>
          <button onClick={() => setError(null)} className="w-full rounded-xl bg-sevchik-accent text-white py-3 font-heading font-bold mt-5">
            Понятно
          </button>
        </Modal>
      )}
    </div>
  );
}

function Modal({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-5" onClick={onClose}>
      <div className="relative w-full max-w-sm rounded-2xl bg-[var(--bg-card)] p-5" onClick={(event) => event.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 text-sevchik-textSecondary" aria-label="Закрыть">
          <X size={20} />
        </button>
        {children}
      </div>
    </div>
  );
}
