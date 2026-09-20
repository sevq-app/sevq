import { useState, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { ArrowLeft, Eye, ChevronDown } from 'lucide-react';
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
    <div className="h-full overflow-y-auto px-4 sm:px-6 pt-6 pb-24 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="w-10 h-10 rounded-xl bg-[var(--bg-card)] flex items-center justify-center" aria-label="Назад"><ArrowLeft size={20} /></button>
        <h1 className="font-heading font-extrabold text-2xl">Информация о себе</h1>
      </div>

      <div className="space-y-4">
        <Field label="Имя"><input value={data.firstName} onChange={(event) => update('firstName', event.target.value)} placeholder="Введите имя" /></Field>
        <Field label="Фамилия"><input value={data.lastName} onChange={(event) => update('lastName', event.target.value)} placeholder="Введите фамилию" /></Field>
        <Field label="Никнейм"><input value={data.username} onChange={(event) => update('username', event.target.value)} placeholder="Введите никнейм" /></Field>
        <VisibilityField label="Дата рождения" value={data.birthDate} placeholder="Укажите дату рождения" type="date" visibility={data.birthDateVisibility} isOpen={openVisibility === 'birthDateVisibility'} onChange={(value) => update('birthDate', value)} onToggle={() => setOpenVisibility(openVisibility === 'birthDateVisibility' ? null : 'birthDateVisibility')} onVisibilityChange={(value) => { update('birthDateVisibility', value); setOpenVisibility(null); }} />
        <Field label="О себе"><textarea rows={3} value={data.about} onChange={(event) => update('about', event.target.value)} placeholder="Расскажите о себе" /></Field>
        <Field label="Email" help="Никто не видит ваш email. Нужен для восстановления доступа"><input type="email" value={data.email} onChange={(event) => update('email', event.target.value)} placeholder="Добавьте свой адрес электронной почты" /></Field>
        <VisibilityField label="Другие соцсети" value={data.social} placeholder="Добавьте ссылки на другие соцсети" visibility={data.socialVisibility} isOpen={openVisibility === 'socialVisibility'} onChange={(value) => update('social', value)} onToggle={() => setOpenVisibility(openVisibility === 'socialVisibility' ? null : 'socialVisibility')} onVisibilityChange={(value) => { update('socialVisibility', value); setOpenVisibility(null); }} />
        <VisibilityField label="Сайт" value={data.website} placeholder="Добавьте ссылку на сайт" visibility={data.websiteVisibility} isOpen={openVisibility === 'websiteVisibility'} onChange={(value) => update('website', value)} onToggle={() => setOpenVisibility(openVisibility === 'websiteVisibility' ? null : 'websiteVisibility')} onVisibilityChange={(value) => { update('websiteVisibility', value); setOpenVisibility(null); }} />
      </div>

      <button onClick={handleSave} disabled={saving} className="w-full mt-6 rounded-2xl bg-sevchik-purple text-white py-3.5 font-heading font-bold disabled:opacity-60">{saving ? 'Сохранение...' : 'Сохранить'}</button>
    </div>
  );
}

function Field({ label, help, children }: { label: string; help?: string; children: ReactNode }) {
  return <label className="block bg-[var(--bg-card)] rounded-2xl p-4"><span className="block text-sm font-heading font-bold mb-2">{label}</span><div className="field-input [&_input]:w-full [&_input]:bg-transparent [&_input]:outline-none [&_input]:text-[var(--text-main)] [&_input]:placeholder:text-sevchik-textSecondary [&_textarea]:w-full [&_textarea]:bg-transparent [&_textarea]:outline-none [&_textarea]:resize-none [&_textarea]:text-[var(--text-main)] [&_textarea]:placeholder:text-sevchik-textSecondary">{children}</div>{help && <span className="block text-xs text-sevchik-textSecondary mt-2">{help}</span>}</label>;
}

function VisibilityField({ label, value, placeholder, type = 'text', visibility, isOpen, onChange, onToggle, onVisibilityChange }: { label: string; value: string; placeholder: string; type?: string; visibility: Visibility; isOpen: boolean; onChange: (value: string) => void; onToggle: () => void; onVisibilityChange: (value: Visibility) => void }) {
  return <div className="relative bg-[var(--bg-card)] rounded-2xl p-4"><span className="block text-sm font-heading font-bold mb-2">{label}</span><div className="flex items-center gap-2"><div className="field-input flex-1 [&_input]:w-full [&_input]:bg-transparent [&_input]:outline-none [&_input]:text-[var(--text-main)] [&_input]:placeholder:text-sevchik-textSecondary"><input type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} /></div><button type="button" onClick={onToggle} className="w-9 h-9 shrink-0 rounded-xl bg-[var(--bg-input)] flex items-center justify-center" aria-label={`Видимость: ${visibility}`}><Eye size={17} /></button></div>{isOpen && <div className="absolute right-4 top-[5.5rem] z-10 w-36 rounded-xl bg-[var(--bg-card)] shadow-lg border border-[var(--border-color)] p-1">{(['Все', 'Друзья', 'Никто'] as Visibility[]).map((option) => <button type="button" key={option} onClick={() => onVisibilityChange(option)} className="w-full text-left rounded-lg px-3 py-2 text-sm hover:bg-[var(--bg-input)]">{option}</button>)}</div>}</div>;
}
