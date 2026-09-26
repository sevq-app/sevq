import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  AtSign,
  Calendar,
  Check,
  ChevronDown,
  Globe,
  Lock,
  LockOpen,
  Mail,
  MessageSquare,
  Phone,
  Share2,
  User as UserIcon,
} from 'lucide-react';
import { fetchMyProfile, isValidUsernameFormat, upsertMyProfile, UsernameFormatError, UsernameTakenError, USERNAME_HINT } from '@/lib/messagingService';

const storageKey = 'sevchik-about-me';
const profileStorageKey = 'sevchik-profile-data';
type Visibility = 'Все' | 'Контакты' | 'Никто';

type AboutData = {
  firstName: string;
  lastName: string;
  username: string;
  phone: string;
  phoneVisibility: Visibility;
  birthDate: string;
  birthDateVisibility: Visibility;
  about: string;
  email: string;
  social: string;
  socialVisibility: Visibility;
  website: string;
  websiteVisibility: Visibility;
};

export type ProfileData = {
  name: string;
  lastName: string;
  username: string;
  phone: string;
  phoneVisibility: Visibility;
  birthDate: string;
  birthDateVisibility: Visibility;
  about: string;
  socials: string;
  socialsVisibility: Visibility;
  site: string;
  siteVisibility: Visibility;
};

type AboutMeProps = {
  user: User | null;
  onBack: () => void;
  setProfileData: (data: ProfileData) => void;
};

const emptyData: AboutData = {
  firstName: '',
  lastName: '',
  username: '',
  phone: '',
  phoneVisibility: 'Все',
  birthDate: '',
  birthDateVisibility: 'Все',
  about: '',
  email: '',
  social: '',
  socialVisibility: 'Все',
  website: '',
  websiteVisibility: 'Все',
};

function normalizeVisibility(value: unknown): Visibility {
  if (value === 'Никто') return 'Никто';
  if (value === 'Контакты' || value === 'Друзья') return 'Контакты';
  return 'Все';
}

function readSavedData(): Partial<AboutData> {
  try {
    const legacy = JSON.parse(localStorage.getItem(storageKey) || '{}') as Partial<AboutData>;
    const profile = JSON.parse(localStorage.getItem(profileStorageKey) || '{}') as Partial<ProfileData>;
    return {
      ...legacy,
      firstName: profile.name || legacy.firstName,
      lastName: profile.lastName || legacy.lastName,
      username: profile.username || legacy.username,
      phone: profile.phone || legacy.phone,
      phoneVisibility: normalizeVisibility(profile.phoneVisibility || legacy.phoneVisibility),
      birthDate: profile.birthDate || legacy.birthDate,
      birthDateVisibility: normalizeVisibility(profile.birthDateVisibility || legacy.birthDateVisibility),
      about: profile.about || legacy.about,
      social: profile.socials || legacy.social,
      socialVisibility: normalizeVisibility(profile.socialsVisibility || legacy.socialVisibility),
      website: profile.site || legacy.website,
      websiteVisibility: normalizeVisibility(profile.siteVisibility || legacy.websiteVisibility),
    };
  } catch {
    return {};
  }
}

function initialData(user: User | null): AboutData {
  const metadata = user?.user_metadata as Record<string, unknown> | undefined;
  const saved = readSavedData();
  const emailName = user?.email?.split('@')[0] || '';
  const stringValue = (key: string) => typeof metadata?.[key] === 'string' ? metadata[key] as string : undefined;

  return {
    ...emptyData,
    ...saved,
    firstName: saved.firstName || stringValue('full_name') || stringValue('name') || stringValue('firstName') || emailName,
    lastName: saved.lastName || stringValue('lastName') || '',
    username: saved.username || stringValue('username') || emailName,
    phone: saved.phone || stringValue('phone') || stringValue('phoneNumber') || '',
    birthDate: saved.birthDate || stringValue('birthDate') || '',
    about: saved.about || stringValue('about') || '',
    email: user?.email || saved.email || '',
    social: saved.social || stringValue('social') || '',
    website: saved.website || stringValue('website') || '',
  };
}

export function AboutMe({ user, onBack, setProfileData }: AboutMeProps) {
  const [data, setData] = useState<AboutData>(() => initialData(user));
  const [openVisibility, setOpenVisibility] = useState<keyof AboutData | null>(null);
  const [saving, setSaving] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Локальный кэш/auth-метаданные (initialData выше) рисуются мгновенно при открытии
  // экрана, но источник истины — profiles в Supabase: подгружаем его и, если там ЕСТЬ
  // непустое значение поля, подменяем — иначе имя, сохранённое в прошлый раз (в т.ч. с
  // другого устройства), маскировалось бы тем, что попало в auth-метаданные один раз при
  // регистрации и с тех пор не менялось.
  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    fetchMyProfile()
      .then((profile) => {
        if (cancelled || !profile) return;
        setData((current) => {
          const next = { ...current };
          if (profile.full_name) {
            const [firstName, ...rest] = profile.full_name.trim().split(/\s+/);
            next.firstName = firstName;
            next.lastName = rest.join(' ');
          }
          if (profile.username) next.username = profile.username;
          if (profile.phone) next.phone = profile.phone;
          return next;
        });
      })
      .catch((error) => console.error('Не удалось загрузить профиль из базы:', error));
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const update = <K extends keyof AboutData>(key: K, value: AboutData[K]) => {
    if (key === 'username') {
      setUsernameError('');
      setSaveSuccess(false);
    }
    setData((current) => ({ ...current, [key]: value }));
  };

  // Формат проверяем сразу при вводе (без обращения к БД — это бесплатно), а не только по клику
  // "Сохранить": пункт 5 задачи требует подсвечивать поле сразу, как только формат неверный.
  const usernameFormatInvalid = data.username.trim().length > 0 && !isValidUsernameFormat(data.username.trim());

  const handleSave = async () => {
    if (usernameFormatInvalid) {
      setUsernameError(USERNAME_HINT);
      return;
    }
    setSaving(true);
    setUsernameError('');
    setSaveSuccess(false);

    // upsertMyProfile сохраняет имя/телефон отдельным запросом ДО проверки username и
    // независимо от её результата — так что ошибка именно в нике (в т.ч. занятый только
    // формально, но не по вине пользователя) не должна откатывать остальные поля: они уже
    // на месте в БД к моменту этого catch.
    let usernameFailed = false;
    try {
      await upsertMyProfile({
        full_name: `${data.firstName} ${data.lastName}`.trim(),
        username: data.username.trim(),
        phone: data.phone,
      });
    } catch (error) {
      if (error instanceof UsernameTakenError || error instanceof UsernameFormatError) {
        setUsernameError(error.message);
        usernameFailed = true;
      } else {
        setSaving(false);
        setUsernameError('Не удалось сохранить. Попробуйте ещё раз.');
        console.error('Не удалось сохранить профиль:', error);
        return;
      }
    }

    localStorage.setItem(storageKey, JSON.stringify(data));
    const profileData: ProfileData = {
      name: data.firstName,
      lastName: data.lastName,
      username: data.username,
      phone: data.phone,
      phoneVisibility: data.phoneVisibility,
      birthDate: data.birthDate,
      birthDateVisibility: data.birthDateVisibility,
      about: data.about,
      socials: data.social,
      socialsVisibility: data.socialVisibility,
      site: data.website,
      siteVisibility: data.websiteVisibility,
    };
    localStorage.setItem(profileStorageKey, JSON.stringify(profileData));
    setProfileData(profileData);

    setSaving(false);
    if (usernameFailed) return; // остаёмся на экране — ошибка у поля уже показана, остальное сохранено

    setSaveSuccess(true);
    // Даём увидеть галочку успеха перед возвратом назад, а не уводим со экрана мгновенно.
    setTimeout(onBack, 900);
  };

  return (
    <div className="h-full overflow-y-auto px-5 py-5 pb-28 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="w-11 h-11 rounded-full bg-[var(--bg-card)] flex items-center justify-center transition-all duration-200 ease-out hover:scale-105 hover:bg-[var(--bg-input)]" aria-label="Назад">
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-heading font-extrabold text-2xl">Информация о себе</h1>
      </div>

      <div className="space-y-3">
        <Field label="Имя" icon={UserIcon} iconColor="#4DC3C8"><input type="text" value={data.firstName} onChange={(event) => update('firstName', event.target.value)} placeholder="Введите имя" /></Field>
        <Field label="Фамилия" icon={UserIcon} iconColor="#FF9848"><input type="text" value={data.lastName} onChange={(event) => update('lastName', event.target.value)} placeholder="Введите фамилию" /></Field>
        <Field
          label="Никнейм"
          icon={AtSign}
          iconColor="#4FD3C8"
          help={USERNAME_HINT}
          error={usernameError || (usernameFormatInvalid ? USERNAME_HINT : '')}
          success={saveSuccess && !usernameFormatInvalid && !usernameError}
        >
          <input type="text" value={data.username} onChange={(event) => update('username', event.target.value)} placeholder="Введите никнейм" maxLength={32} />
        </Field>
        <Field label="Номер телефона" icon={Phone} iconColor="#FF9848"><input type="tel" value={data.phone} onChange={(event) => update('phone', event.target.value)} placeholder="Добавьте номер телефона" /></Field>
        <VisibilityField label="Дата рождения" icon={Calendar} iconColor="#A78BFA" value={data.birthDate} placeholder="ДД.ММ.ГГГГ" isDate visibility={data.birthDateVisibility} isOpen={openVisibility === 'birthDateVisibility'} onChange={(value) => update('birthDate', value)} onToggle={() => setOpenVisibility(openVisibility === 'birthDateVisibility' ? null : 'birthDateVisibility')} onVisibilityChange={(value) => { update('birthDateVisibility', value); setOpenVisibility(null); }} />
        <Field label="О себе" icon={MessageSquare} iconColor="#4FD3C8"><textarea rows={3} value={data.about} onChange={(event) => update('about', event.target.value)} placeholder="Расскажите о себе" /></Field>
        <Field label="Email" icon={Mail} iconColor="#FF9848" help="Никто не видит ваш email. Нужен для восстановления доступа"><input type="email" value={data.email} readOnly placeholder="Добавьте свой адрес электронной почты" /></Field>
        <VisibilityField label="Другие соцсети" icon={Share2} iconColor="#4DC3C8" value={data.social} placeholder="Добавьте ссылки на другие соцсети" visibility={data.socialVisibility} isOpen={openVisibility === 'socialVisibility'} onChange={(value) => update('social', value)} onToggle={() => setOpenVisibility(openVisibility === 'socialVisibility' ? null : 'socialVisibility')} onVisibilityChange={(value) => { update('socialVisibility', value); setOpenVisibility(null); }} />
        <VisibilityField label="Сайт" icon={Globe} iconColor="#4FD3C8" value={data.website} placeholder="Добавьте ссылку на сайт" visibility={data.websiteVisibility} isOpen={openVisibility === 'websiteVisibility'} onChange={(value) => update('website', value)} onToggle={() => setOpenVisibility(openVisibility === 'websiteVisibility' ? null : 'websiteVisibility')} onVisibilityChange={(value) => { update('websiteVisibility', value); setOpenVisibility(null); }} />
      </div>

      <button onClick={handleSave} disabled={saving || usernameFormatInvalid} className="w-full mt-6 rounded-2xl bg-gradient-to-r from-[#3D999D] to-[#4DC3C8] px-4 py-3.5 text-white font-heading font-medium shadow-[0_4px_14px_rgba(77,195,200,0.18)] transition-all duration-200 ease-out hover:scale-[1.02] hover:shadow-[0_8px_20px_rgba(77,195,200,0.22)] active:scale-95 disabled:opacity-60">
        {saving ? 'Сохранение...' : 'Сохранить'}
      </button>
    </div>
  );
}

function Field({ label, icon: Icon, iconColor, help, error, success, children }: { label: string; icon: typeof UserIcon; iconColor: string; help?: string; error?: string; success?: boolean; children: ReactNode }) {
  return (
    <label className={`group block bg-[var(--bg-card)] rounded-2xl px-5 py-4 border-2 transition-all duration-200 ease-out hover:bg-[var(--bg-input)] hover:scale-[1.01] ${error ? 'border-red-400 focus-within:border-red-500' : 'border-transparent focus-within:border-[#4DC3C8]/50'}`}>
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0" style={{ background: `${iconColor}20`, color: iconColor }}><Icon size={19} /></div>
        <div className="min-w-0 flex-1">
          <span className="block text-sm font-heading font-bold mb-2">{label}</span>
          <div className="flex items-center gap-2">
            <div className="field-input flex-1 [&_input]:w-full [&_input]:border-0 [&_input]:!bg-transparent [&_input]:shadow-none [&_input]:appearance-none [&_input]:outline-none [&_input]:pointer-events-auto [&_input]:cursor-text [&_input]:touch-manipulation [&_input]:transition-all [&_input]:duration-200 [&_input]:text-[var(--text-main)] [&_input]:placeholder:text-[var(--text-secondary)] [&_textarea]:w-full [&_textarea]:border-0 [&_textarea]:!bg-transparent [&_textarea]:shadow-none [&_textarea]:appearance-none [&_textarea]:outline-none [&_textarea]:pointer-events-auto [&_textarea]:cursor-text [&_textarea]:touch-manipulation [&_textarea]:resize-none [&_textarea]:transition-all [&_textarea]:duration-200 [&_textarea]:text-[var(--text-main)] [&_textarea]:placeholder:text-[var(--text-secondary)]">{children}</div>
            {success && (
              <span className="shrink-0 w-6 h-6 rounded-full bg-[#4FD3C8] flex items-center justify-center">
                <Check size={14} className="text-white" strokeWidth={3} />
              </span>
            )}
          </div>
          {error ? (
            <span className="block text-xs text-red-500 font-medium mt-2">{error}</span>
          ) : (
            help && <span className="block text-xs text-[var(--text-secondary)] mt-2">{help}</span>
          )}
        </div>
      </div>
    </label>
  );
}

function VisibilityField({ label, icon: Icon, iconColor, value, placeholder, type = 'text', isDate = false, visibility, isOpen, onChange, onToggle, onVisibilityChange }: { label: string; icon: typeof UserIcon; iconColor: string; value: string; placeholder: string; type?: string; isDate?: boolean; visibility: Visibility; isOpen: boolean; onChange: (value: string) => void; onToggle: () => void; onVisibilityChange: (value: Visibility) => void }) {
  const datePickerRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) onToggle();
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [isOpen, onToggle]);

  const handleTextChange = (nextValue: string) => {
    if (!isDate) { onChange(nextValue); return; }
    let masked = nextValue.replace(/\D/g, '').slice(0, 8);
    if (masked.length >= 2) masked = `${masked.slice(0, 2)}.${masked.slice(2)}`;
    if (masked.length >= 5) masked = `${masked.slice(0, 5)}.${masked.slice(5)}`;
    onChange(masked);
  };
  const handlePickerChange = (nextValue: string) => {
    const [year, month, day] = nextValue.split('-');
    onChange(year && month && day ? `${day}.${month}.${year}` : '');
  };
  const lockColor = visibility === 'Никто' ? 'bg-red-500' : 'bg-green-500';
  const LockIcon = visibility === 'Никто' ? Lock : LockOpen;

  return (
    <div className="group relative bg-[var(--bg-card)] rounded-2xl px-5 py-4 border-2 border-transparent transition-all duration-200 ease-out hover:bg-[var(--bg-input)] hover:scale-[1.01] focus-within:border-[#4DC3C8]/50">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0" style={{ background: `${iconColor}20`, color: iconColor }}><Icon size={19} /></div>
        <div className="min-w-0 flex-1">
          <span className="block text-sm font-heading font-bold mb-2">{label}</span>
          <div className="relative">
            <div className="field-input pr-14 [&_input]:w-full [&_input]:border-0 [&_input]:!bg-transparent [&_input]:shadow-none [&_input]:appearance-none [&_input]:outline-none [&_input]:touch-manipulation [&_input]:transition-all [&_input]:duration-200 [&_input]:text-[var(--text-main)] [&_input]:placeholder:text-[var(--text-secondary)]">
              <input type="text" value={value} onChange={(event) => handleTextChange(event.target.value)} placeholder={placeholder} maxLength={isDate ? 10 : undefined} autoFocus={false} onClick={(event) => event.stopPropagation()} onTouchStart={(event) => event.stopPropagation()} />
            </div>
            {isDate && <input ref={datePickerRef} type="date" value={value ? value.split('.').reverse().join('-') : ''} onChange={(event) => handlePickerChange(event.target.value)} className="absolute w-px h-px opacity-0 pointer-events-none" tabIndex={-1} />}
            <div ref={menuRef}>
              {isOpen && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="fixed inset-0 z-40 bg-black/15 backdrop-blur-[1px]" onClick={onToggle} aria-hidden="true" />}
              <button type="button" onClick={(event) => { event.stopPropagation(); onToggle(); }} className={`absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center gap-0.5 transition-all duration-200 hover:scale-105 ${lockColor}`} aria-label={`Видимость: ${visibility}`}>
                <LockIcon className="w-4 h-4 text-white" />
                <ChevronDown size={11} className="text-white" />
              </button>
              {isOpen && <motion.div initial={{ opacity: 0, scale: 0.94, y: 4 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.18, ease: 'easeOut' }} className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-36 rounded-2xl bg-[var(--bg-card)]/95 backdrop-blur-md shadow-2xl border border-[var(--border-color)] p-1.5">
                {(['Все', 'Контакты', 'Никто'] as Visibility[]).map((option) => <button type="button" key={option} onClick={() => { onVisibilityChange(option); onToggle(); }} className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${visibility === option ? 'bg-[#4DC3C8]/15 text-[#3D999D]' : 'text-[var(--text-main)] hover:bg-[var(--bg-input)]'}`}>{option}</button>)}
              </motion.div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
