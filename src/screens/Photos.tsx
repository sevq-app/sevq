import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';

const photosKey = 'sevchik-profile-photos';
export function Photos({ onBack }: { onBack: () => void }) {
  const [photos] = useState<string[]>(() => { try { return JSON.parse(localStorage.getItem(photosKey) || '[]'); } catch { return []; } });
  const [selected, setSelected] = useState<string | null>(null);
  return <div className="h-full overflow-y-auto px-4 sm:px-6 pt-6 pb-24 max-w-2xl mx-auto"><button onClick={onBack} className="flex items-center gap-2 text-sevchik-textSecondary mb-8"><ArrowLeft size={20} /> Назад</button><h1 className="font-heading font-extrabold text-2xl mb-5">Фотографии</h1>{photos.length ? <div className="grid grid-cols-3 gap-2">{photos.map((photo) => <button key={photo} onClick={() => setSelected(photo)} className="aspect-square overflow-hidden rounded-xl"><img src={photo} alt="" className="w-full h-full object-cover" /></button>)}</div> : <p className="text-sm text-sevchik-textSecondary">Фото ещё не загрузили</p>}{selected && <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-5" onClick={() => setSelected(null)}><img src={selected} alt="Увеличенное фото" className="max-h-[85vh] max-w-full rounded-2xl object-contain" /></div>}</div>;
}
