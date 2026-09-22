import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';

export function AboutEdit({ onBack }: { onBack: () => void }) {
  const [about, setAbout] = useState('');
  return <div className="h-full overflow-y-auto px-4 sm:px-6 pt-6 pb-28 max-w-2xl mx-auto"><button onClick={onBack} className="flex items-center gap-2 text-sevchik-textSecondary mb-8"><ArrowLeft size={20} /> Назад</button><h1 className="font-heading font-extrabold text-2xl mb-5">О себе</h1><div className="bg-[var(--bg-card)] rounded-2xl p-5 shadow-[0_8px_24px_rgba(101,70,199,0.08)]"><textarea autoFocus value={about} onChange={(event) => setAbout(event.target.value)} placeholder="Расскажите о себе" className="w-full min-h-32 resize-none bg-transparent outline-none text-[var(--text-main)] placeholder:text-sevchik-textSecondary" /></div><button onClick={onBack} className="w-full mt-4 rounded-2xl bg-sevchik-purple text-white py-3 font-heading font-bold">Сохранить</button></div>;
}
