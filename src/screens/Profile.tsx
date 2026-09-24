import { ChangeEvent, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { Camera, Copy, Link, QrCode, Share2, ChevronRight, Settings, Sparkles, Users, X } from 'lucide-react';
import type { Screen } from '@/data/mock';
import type { ProfileData } from '@/screens/AboutMe';

const photosKey = 'sevchik-profile-photos';
const profileStorageKey = 'sevchik-profile-data';

export type ProfileGroup = { id: string; name: string; initials?: string; avatarUrl?: string };
type ProfileUser = User & { name?: string; username?: string; avatarUrl?: string };

type ProfileProps = { user: ProfileUser | null; profileData: ProfileData; onNavigate?: (screen: Screen) => void };

function readPhotos() {
  try { return JSON.parse(localStorage.getItem(photosKey) || '[]') as string[]; } catch { return []; }
}

function readSavedProfile(): Partial<ProfileData> {
  try {
    return JSON.parse(localStorage.getItem(profileStorageKey) || '{}') as Partial<ProfileData>;
  } catch {
    return {};
  }
}

function getMetadata(user: ProfileUser | null, profileData: ProfileData) {
  const metadata = user?.user_metadata as Record<string, unknown> | undefined;
  const savedProfile = profileData.name || profileData.username ? profileData : readSavedProfile();
  const emailName = user?.email?.split('@')[0] || '';
  const metadataName = typeof metadata?.full_name === 'string' ? metadata.full_name : '';
  const metadataUsername = typeof metadata?.username === 'string' ? metadata.username : '';
  const name = savedProfile.name || metadataName || user?.name || emailName || 'Пользователь';
  const username = savedProfile.username || metadataUsername || user?.username || emailName;
  const avatarUrl = user?.avatarUrl || (typeof metadata?.avatarUrl === 'string' ? metadata.avatarUrl : typeof metadata?.avatar_url === 'string' ? metadata.avatar_url : '');
  const groups = Array.isArray(metadata?.groups) ? metadata.groups.filter((group): group is ProfileGroup => typeof group === 'object' && group !== null && typeof (group as ProfileGroup).id === 'string' && typeof (group as ProfileGroup).name === 'string') : [];
  return { name, username, avatarUrl, groups };
}

export function getProfileGroups(user: ProfileUser | null): ProfileGroup[] {
  return getMetadata(user, {} as ProfileData).groups;
}

export function Profile({ user, profileData, onNavigate }: ProfileProps) {
  const [online, setOnline] = useState(true);
  const [photos, setPhotos] = useState<string[]>(readPhotos);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [isPhotoAccessOpen, setPhotoAccessOpen] = useState(false);
  const [isInviteOpen, setInviteOpen] = useState(false);
  const [inviteMode, setInviteMode] = useState<'menu' | 'qr'>('menu');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { name, username, avatarUrl, groups } = getMetadata(user, profileData);
  const savedProfile = profileData.name || profileData.username ? profileData : readSavedProfile();
  const displayName = [savedProfile.name || name, savedProfile.lastName].filter(Boolean).join(' ') || user?.email?.split('@')[0] || 'Пользователь';
  const displayUsername = savedProfile.username || username || user?.email?.split('@')[0] || '';
  const profilePhoto = photos[0] || avatarUrl;

  useEffect(() => { localStorage.setItem(photosKey, JSON.stringify(photos)); }, [photos]);

  const openFilePicker = () => {
    setPhotoAccessOpen(false);
    fileInputRef.current?.click();
  };

  const handlePhotoUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { if (typeof reader.result === 'string') setPhotos((current) => [reader.result as string, ...current]); };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const inviteUrl = `${window.location.origin}/profile/${user?.id || 'user'}`;
  const referralUrl = `${inviteUrl}?ref=${user?.id || 'user'}`;

  return (
    <div className="h-full overflow-y-auto pb-28 md:pb-0">
      <div className="px-4 sm:px-6 pt-6 pb-2 flex items-center justify-between">
        <h1 className="font-heading font-extrabold text-xl text-sevchik-text">Мой Севчик</h1>
        <button onClick={() => onNavigate?.('settings')} className="w-12 h-12 rounded-card bg-[var(--bg-card)] flex items-center justify-center text-sevchik-textSecondary hover:text-sevchik-purple transition-colors" aria-label="Настройки"><Settings size={20} /></button>
      </div>

      <div className="flex flex-col items-center px-4 sm:px-6 mb-6 mt-2">
        <div className="relative">
          {/* Внешний ореол вместо звезды/кружка-статуса — светится только внешняя
              окантовка вокруг круга, отражая online */}
          <button
            onClick={() => profilePhoto ? setSelectedPhoto(profilePhoto) : setPhotoAccessOpen(true)}
            className="block rounded-full transition-shadow duration-300"
            aria-label={profilePhoto ? 'Открыть фото профиля' : 'Добавить фото профиля'}
            style={{
              boxShadow: online
                ? '0 0 0 4px rgba(79,211,200,0.45), 0 0 28px 8px rgba(79,211,200,0.4)'
                : '0 0 0 4px rgba(107,114,128,0.22)',
            }}
          >
            <div className="p-[3px] rounded-full bg-[var(--bg-card)]">
              {profilePhoto ? (
                <img src={profilePhoto} alt="Фото профиля" className="w-[120px] h-[120px] rounded-full object-cover" />
              ) : (
                <div
                  className="w-[140px] h-[140px] rounded-full flex flex-col items-center justify-center gap-1.5"
                  style={{ background: 'var(--avatar-placeholder-bg)', boxShadow: '0 2px 6px rgba(15,23,42,0.08)' }}
                >
                  <Camera size={30} style={{ color: 'var(--avatar-placeholder-icon)' }} />
                  <span className="text-[11px] font-heading font-semibold leading-none" style={{ color: 'var(--avatar-placeholder-icon)' }}>Добавить фото</span>
                </div>
              )}
            </div>
          </button>
        </div>
        <div className="text-center mt-4 space-y-1">
          <h2 className="font-heading font-semibold text-xl">{displayName}</h2>
          <p className="text-sm text-[var(--text-secondary)] font-body">{displayUsername ? `@${displayUsername.replace(/^@/, '')}` : ''}</p>
          {savedProfile.about && <p className="text-sm text-[var(--text-secondary)] font-body">{savedProfile.about}</p>}
        </div>
      </div>
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />

      <div className="px-4 sm:px-6 space-y-4 max-w-2xl mx-auto">
        <section className="bg-[var(--bg-card)] rounded-2xl p-5 flex items-center justify-between shadow-[0_10px_30px_rgba(101,70,199,0.16)]"><div><h3 className="font-heading font-bold">Статус</h3><p className="text-sm text-sevchik-textSecondary font-body mt-0.5 flex items-center gap-1.5"><span className={`w-2 h-2 rounded-full ${online ? 'bg-sevchik-mint' : 'bg-sevchik-textSecondary/50'}`} />{online ? 'В сети' : 'Не в сети'}</p></div><button onClick={() => setOnline(!online)} aria-label="Изменить статус" className={`relative w-14 h-8 rounded-full transition-colors duration-300 ${online ? 'bg-sevchik-mint' : 'bg-sevchik-textSecondary/20'}`}><span className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-[left] ${online ? 'left-7' : 'left-1'} shadow-[0_2px_8px_rgba(0,0,0,0.15)]`} /></button></section>
        <button onClick={() => onNavigate?.('about')} className="w-full bg-[var(--bg-card)] rounded-2xl p-5 flex items-center justify-between text-left shadow-[0_10px_30px_rgba(101,70,199,0.16)]"><span className="font-heading font-bold">Укажите информацию о себе</span><ChevronRight size={20} className="text-sevchik-textSecondary" /></button>

        <section className="bg-[var(--bg-card)] rounded-2xl p-5 shadow-[0_10px_30px_rgba(101,70,199,0.16)]"><button onClick={() => onNavigate?.('photos')} className="w-full flex items-center justify-between mb-3 text-left"><h3 className="font-heading font-bold">Фотографии</h3><ChevronRight size={20} className="text-sevchik-textSecondary" /></button>{photos.length === 0 ? <p className="text-sm text-sevchik-textSecondary font-body">Фото ещё не загрузили</p> : <div className="grid grid-cols-3 gap-2">{photos.slice(0, 6).map((photo) => <button key={photo} onClick={() => onNavigate?.('photos')} className="aspect-square overflow-hidden rounded-xl"><img src={photo} alt="" className="w-full h-full object-cover" /></button>)}</div>}</section>

        <section className="bg-[var(--bg-card)] rounded-2xl p-5 shadow-[0_10px_30px_rgba(101,70,199,0.16)]"><button onClick={() => onNavigate?.('my-groups')} className="w-full flex items-center justify-between text-left"><h3 className="font-heading font-bold">Мои группы</h3><ChevronRight size={20} className="text-sevchik-textSecondary" /></button>{groups.length === 0 ? <p className="text-sm text-sevchik-textSecondary mt-4">Вы ещё не состоите в группах</p> : <><div className="grid grid-cols-3 gap-3 mt-4">{groups.slice(0, 3).map((group) => <button key={group.id} onClick={() => onNavigate?.('my-groups')} className="min-w-0 text-left"><GroupIcon group={group} /><span className="block text-xs font-heading font-bold truncate mt-2">{group.name}</span></button>)}</div><button onClick={() => onNavigate?.('my-groups')} className="mt-4 text-sm font-heading font-bold text-sevchik-purple">Показать все</button></>}</section>

        <button onClick={() => undefined} className="w-full bg-[var(--bg-card)] rounded-2xl p-5 flex items-center gap-3 text-left shadow-[0_10px_30px_rgba(101,70,199,0.16)]"><Sparkles size={22} className="text-sevchik-purple" /><span className="font-heading font-bold">Стикеры</span></button>
        <button onClick={() => { setInviteMode('menu'); setInviteOpen(true); }} className="w-full bg-[var(--bg-card)] rounded-2xl p-5 flex items-center gap-3 text-left shadow-[0_10px_30px_rgba(101,70,199,0.16)]"><Link size={23} className="text-[#6546C7]" /><span className="flex-1 font-heading font-bold">Пригласить друзей</span><ChevronRight size={20} className="text-sevchik-textSecondary" /></button>
        <div className="pb-6" />
      </div>

      {selectedPhoto && <Modal onClose={() => setSelectedPhoto(null)}><img src={selectedPhoto} alt="Увеличенное фото" className="max-h-[85vh] max-w-full rounded-2xl object-contain" /></Modal>}
      {isPhotoAccessOpen && <Modal onClose={() => setPhotoAccessOpen(false)}><h2 className="font-heading font-extrabold text-xl">Разрешите доступ</h2><p className="text-sm text-sevchik-textSecondary mt-2">Выберите, какие фотографии можно использовать.</p><div className="space-y-2 mt-5"><button onClick={openFilePicker} className="w-full rounded-xl bg-sevchik-purple text-white py-3 font-heading font-bold">Разрешить полный доступ</button><button onClick={openFilePicker} className="w-full rounded-xl bg-sevchik-orange text-white py-3 font-heading font-bold">Разрешить один раз</button><button onClick={() => setPhotoAccessOpen(false)} className="w-full rounded-xl bg-[var(--bg-input)] py-3 font-heading font-bold">Запретить</button></div></Modal>}
      {isInviteOpen && <Modal onClose={() => setInviteOpen(false)}>{inviteMode === 'qr' ? <><h2 className="font-heading font-extrabold text-xl">QR-код</h2><QrCodeVisual value={inviteUrl} /><button onClick={() => setInviteMode('menu')} className="w-full rounded-xl bg-[var(--bg-input)] py-3 font-heading font-bold">Назад</button></> : <><h2 className="font-heading font-extrabold text-xl">Пригласить друзей</h2><div className="space-y-2 mt-5"><ShareAction icon={Copy} text="Скопировать ссылку" onClick={() => navigator.clipboard?.writeText(inviteUrl)} /><ShareAction icon={Link} text="Реферальная ссылка" onClick={() => navigator.clipboard?.writeText(referralUrl)} /><ShareAction icon={QrCode} text="QR-код" onClick={() => setInviteMode('qr')} /><ShareAction icon={Share2} text="Поделиться в других приложениях" onClick={() => { if (navigator.share) navigator.share({ title: 'Профиль', url: inviteUrl }); }} /></div></>}</Modal>}
    </div>
  );
}

function GroupIcon({ group }: { group: ProfileGroup }) {
  return group.avatarUrl ? <img src={group.avatarUrl} alt="" className="w-full aspect-square rounded-2xl object-cover" /> : <div className="w-full aspect-square rounded-2xl bg-sevchik-purple text-white flex items-center justify-center font-heading font-bold">{group.initials || group.name.slice(0, 2).toUpperCase()}</div>;
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-5" onClick={onClose}><div className="relative w-full max-w-sm rounded-2xl bg-[var(--bg-card)] p-5" onClick={(event) => event.stopPropagation()}><button onClick={onClose} className="absolute top-3 right-3 text-sevchik-textSecondary" aria-label="Закрыть"><X size={20} /></button>{children}</div></div>;
}

function ShareAction({ icon: Icon, text, onClick }: { icon: typeof Copy; text: string; onClick: () => void }) {
  return <button onClick={onClick} className="w-full flex items-center gap-3 rounded-xl bg-[var(--bg-input)] p-3 text-left"><Icon size={19} className="text-sevchik-purple" /><span className="font-body text-sm">{text}</span></button>;
}

function QrCodeVisual({ value }: { value: string }) {
  const cells = Array.from({ length: 81 }, (_, index) => ((index * 17 + value.length * 7) % 11) < 5);
  return <div className="grid grid-cols-9 gap-1 bg-white p-3 w-fit mx-auto my-6">{cells.map((filled, index) => <span key={index} className={`w-4 h-4 ${filled ? 'bg-black' : 'bg-white'}`} />)}</div>;
}
