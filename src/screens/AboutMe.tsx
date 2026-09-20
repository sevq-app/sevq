import { useState, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { motion } from 'framer-motion';
import { ArrowLeft, AtSign, Calendar, Eye, Globe, Mail, MessageSquare, Share2, User as UserIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const storageKey = 'sevchik-about-me';
type Visibility = 'Все' | 'Друзья' | 'Никто';
type AboutData = {
  firstName: string;
  lastName: string;
  username: string;
  birthDate: string;
  birthDateVisibility: Visibility;
  about: string;
  email: string;
  social: string;
  socialVisibility: Visibility;
  website: string;
  websiteVisibility: Visibility;
};

type AboutMeProps = { user: User | null; onBack: () => void };

const emptyData: AboutData = {
  firstName: '',
  lastName: '',
  username: '',
  birthDate: '',
  birthDateVisibility: 'Все',
  about: '',
  email: '',
  social: '',
  socialVisibility: 'Все',
  website: '',
  websiteVisibility: 'Все',
};

function readSavedData(): Partial<AboutData> {
  try {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) as Partial<AboutData> : {};
  } catch {
    return {};
  }
}

function initialData(user: User | null): AboutData {
  const metadata = user?.user_metadata as Record<string, unknown> | undefined;
  const saved = readSavedData();
  const stringValue = (key: string) => typeof metadata?.[key] === 'string' ? metadata[key] as string : undefined;
  return {
    ...emptyData,
    ...saved,
    firstName: saved.firstName || stringValue('firstName') || stringValue('name') || '',
    lastName: saved.lastName || stringValue('lastName') || '',
    username: saved.username || stringValue('username') || '',
    birthDate: saved.birthDate || stringValue('birthDate') || '',
    about: saved.about || stringValue('about') || '',
    email: saved.email || user?.email || '',
    social: saved.social || stringValue('social') || '',
    website: saved.website || stringValue('website') || '',
  };
}

export function AboutMe({ user, onBack }: AboutMeProps) {
  const [data, setData] = useState<AboutData>(() => initialData(user));
  const [openVisibility, setOpenVisibility] = useState<keyof AboutData | null>(null);
  const [saving, setSaving] = useState(false);

  const update = <K extends keyof AboutData>(key: K, value: AboutData[K]) => {
    setData((current) => ({ ...current, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    localStorage.setItem(storageKey, JSON.stringify(data));
    if (user) {
      await supabase.auth.updateUser({ data });
    }
    setSaving(false);
    onBack();
  };

  return (
    <div className="h-full overflow-y-auto px-5 py-5 pb-24 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="w-10 h-10 rounded-full bg-[var(--bg-card)] flex items-center justify-center transition-all duration-200 ease-out hover:scale-105 hover:bg-[var(--bg-input)]" aria-label="Назад"><ArrowLeft size={20} /></button>
        <h1 className="font-heading font-extrabold text-2xl">Информация о себе</h1>
      </div>

      <div className="space-y-3">
        <Field label="Имя" icon={UserIcon} iconColor="#6546C7"><input value={data.firstName} onChange={(event) => update('firstName', event.target.value)} placeholder="Введите имя" /></Field>
        <Field label="Фамилия" icon={UserIcon} iconColor="#FF9848"><input value={data.lastName} onChange={(event) => update('lastName', event.target.value)} placeholder="Введите фамилию" /></Field>
        <Field label="Никнейм" icon={AtSign} iconColor="#4FD3C8"><input value={data.username} onChange={(event) => update('username', event.target.value)} placeholder="Введите никнейм" /></Field>
        <VisibilityField label="Дата рождения" icon={Calendar} iconColor="#A78BFA" value={data.birthDate} placeholder="Укажите дату рождения" type="date" visibility={data.birthDateVisibility} isOpen={openVisibility === 'birthDateVisibility'} onChange={(value) => update('birthDate', value)} onToggle={() => setOpenVisibility(openVisibility === 'birthDateVisibility' ? null : 'birthDateVisibility')} onVisibilityChange={(value) => { update('birthDateVisibility', value); setOpenVisibility(null); }} />
        <Field label="О себе" icon={MessageSquare} iconColor="#4FD3C8"><textarea rows={3} value={data.about} onChange={(event) => update('about', event.target.value)} placeholder="Расскажите о себе" /></Field>
        <Field label="Email" icon={Mail} iconColor="#FF9848" help="Никто не видит ваш email. Нужен для восстановления доступа"><input type="email" value={data.email} onChange={(event) => update('email', event.target.value)} placeholder="Добавьте свой адрес электронной почты" /></Field>
        <VisibilityField label="Другие соцсети" icon={Share2} iconColor="#6546C7" value={data.social} placeholder="Добавьте ссылки на другие соцсети" visibility={data.socialVisibility} isOpen={openVisibility === 'socialVisibility'} onChange={(value) => update('social', value)} onToggle={() => setOpenVisibility(openVisibility === 'socialVisibility' ? null : 'socialVisibility')} onVisibilityChange={(value) => { update('socialVisibility', value); setOpenVisibility(null); }} />
        <VisibilityField label="Сайт" icon={Globe} iconColor="#4FD3C8" value={data.website} placeholder="Добавьте ссылку на сайт" visibility={data.websiteVisibility} isOpen={openVisibility === 'websiteVisibility'} onChange={(value) => update('website', value)} onToggle={() => setOpenVisibility(openVisibility === 'websiteVisibility' ? null : 'websiteVisibility')} onVisibilityChange={(value) => { update('websiteVisibility', value); setOpenVisibility(null); }} />
      </div>

      <button onClick={handleSave} disabled={saving} className="w-full mt-6 rounded-2xl bg-gradient-to-r from-purple-600 to-purple-500 px-4 py-3.5 text-white font-heading font-medium shadow-[0_4px_14px_rgba(101,70,199,0.25)] transition-all duration-200 ease-out hover:scale-[1.02] hover:shadow-[0_8px_20px_rgba(101,70,199,0.35)] active:scale-95 disabled:opacity-60">{saving ? 'Сохранение...' : 'Сохранить'}</button>
    </div>
  );
}

function Field({ label, icon: Icon, iconColor, help, children }: { label: string; icon: typeof UserIcon; iconColor: string; help?: string; children: ReactNode }) {
  return <label className="group block bg-[var(--bg-card)] rounded-2xl px-5 py-4 border-2 border-transparent transition-all duration-200 ease-out hover:bg-[var(--bg-input)] hover:scale-[1.01] focus-within:border-purple-500/50"><div className="flex items-start gap-3"><div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0" style={{ background: `${iconColor}20`, color: iconColor }}><Icon size={19} /></div><div className="min-w-0 flex-1"><span className="block text-sm font-heading font-bold mb-2">{label}</span><div className="field-input [&_input]:w-full [&_input]:border-0 [&_input]:!bg-transparent [&_input]:shadow-none [&_input]:appearance-none [&_input]:outline-none [&_input]:transition-all [&_input]:duration-200 [&_input]:text-[var(--text-main)] [&_input]:placeholder:text-[var(--text-secondary)] [&_textarea]:w-full [&_textarea]:border-0 [&_textarea]:!bg-transparent [&_textarea]:shadow-none [&_textarea]:appearance-none [&_textarea]:outline-none [&_textarea]:resize-none [&_textarea]:transition-all [&_textarea]:duration-200 [&_textarea]:text-[var(--text-main)] [&_textarea]:placeholder:text-[var(--text-secondary)]">{children}</div>{help && <span className="block text-xs text-[var(--text-secondary)] mt-2">{help}</span>}</div></div></label>;
}

function VisibilityField({ label, icon: Icon, iconColor, value, placeholder, type = 'text', visibility, isOpen, onChange, onToggle, onVisibilityChange }: { label: string; icon: typeof UserIcon; iconColor: string; value: string; placeholder: string; type?: string; visibility: Visibility; isOpen: boolean; onChange: (value: string) => void; onToggle: () => void; onVisibilityChange: (value: Visibility) => void }) {
  return <div className="group relative bg-[var(--bg-card)] rounded-2xl px-5 py-4 border-2 border-transparent transition-all duration-200 ease-out hover:bg-[var(--bg-input)] hover:scale-[1.01] focus-within:border-purple-500/50"><div className="flex items-start gap-3"><div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0" style={{ background: `${iconColor}20`, color: iconColor }}><Icon size={19} /></div><div className="min-w-0 flex-1"><span className="block text-sm font-heading font-bold mb-2">{label}</span><div className="flex items-center gap-2"><div className="field-input flex-1 [&_input]:w-full [&_input]:border-0 [&_input]:!bg-transparent [&_input]:shadow-none [&_input]:appearance-none [&_input]:outline-none [&_input]:transition-all [&_input]:duration-200 [&_input]:text-[var(--text-main)] [&_input]:placeholder:text-[var(--text-secondary)]"><input type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} /></div><button type="button" onClick={onToggle} className="w-8 h-8 shrink-0 rounded-full bg-transparent flex items-center justify-center transition-all duration-200 ease-out hover:bg-[var(--bg-input)] hover:scale-110" aria-label={`Видимость: ${visibility}`}><Eye size={16} /></button></div></div></div>{isOpen && <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.2, ease: 'easeOut' }} className="absolute right-5 top-[5.5rem] z-10 w-36 origin-top-right rounded-xl bg-[var(--bg-card)] shadow-lg border border-[var(--border-color)] p-1">{(['Все', 'Друзья', 'Никто'] as Visibility[]).map((option) => <button type="button" key={option} onClick={() => onVisibilityChange(option)} className="w-full text-left rounded-lg px-3 py-2 text-sm transition-all duration-200 ease-out hover:bg-[var(--bg-input)]">{option}</button>)}</motion.div>}</div>;
}
