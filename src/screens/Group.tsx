import { ArrowLeft, Users } from 'lucide-react';

export function Group({ name, onBack }: { name: string; onBack: () => void }) {
  return <div className="h-full overflow-y-auto px-4 sm:px-6 pt-6 pb-24 max-w-2xl mx-auto"><button onClick={onBack} className="flex items-center gap-2 text-sevchik-textSecondary mb-8"><ArrowLeft size={20} /> Назад</button><div className="bg-[var(--bg-card)] rounded-2xl p-6 text-center shadow-[0_8px_24px_rgba(101,70,199,0.08)]"><div className="w-16 h-16 mx-auto rounded-2xl bg-sevchik-purple text-white flex items-center justify-center"><Users size={28} /></div><h1 className="font-heading font-extrabold text-2xl mt-4">{name}</h1><p className="text-sevchik-textSecondary mt-2">Вы вошли в группу</p></div></div>;
}
