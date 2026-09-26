import { motion } from 'framer-motion';
import { ArrowLeft, Pencil, Phone, Video, Bell, BellOff, Search, Image, Ban, Trash2, ChevronRight } from 'lucide-react';
import { Avatar } from '@/components/Avatar';
import { useState } from 'react';
import { getContactOverride, getDisplayContact } from '@/lib/contactOverrides';
import { useChatStore } from '@/store/chatStore';

interface ContactProfileProps {
  chatId: string;
  onBack: () => void;
  onEdit: () => void;
  onOpenMedia: () => void;
}

export function ContactProfile({ chatId, onBack, onEdit, onOpenMedia }: ContactProfileProps) {
  const chat = useChatStore((s) => s.chats.find((c) => c.id === chatId));
  const [isMuted, setIsMuted] = useState(false);
  if (!chat) return null;
  const override = getContactOverride(chat.id);
  const { name: displayName, initials: displayInitials } = getDisplayContact(chat, override);
  const statusText = chat.online ? 'В сети' : 'Не в сети';
  const mediaCount = chat.messages.filter((m) => m.text.startsWith('image:')).length;

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
        <h2 className="font-heading font-bold text-lg text-sevchik-text flex-1">Профиль</h2>
        <motion.button
          whileTap={{ scale: 0.9, y: 2 }}
          onClick={onEdit}
          className="w-12 h-12 rounded-full bg-sevchik-cream text-sevchik-textSecondary btn-3d flex items-center justify-center"
          style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
        >
          <Pencil size={19} />
        </motion.button>
      </div>

      <div className="flex flex-col items-center px-4 mt-2 mb-6">
        <Avatar initials={displayInitials} size="xxl" online={chat.online} />
        <h1 className="font-heading font-extrabold text-2xl text-sevchik-text mt-4">{displayName}</h1>
        {override.phone && <p className="text-sm text-[var(--text-secondary)] font-body mt-1">{override.phone}</p>}
        <p className={`text-sm font-body mt-1 flex items-center gap-1.5 ${chat.online ? 'text-sevchik-mint' : 'text-[var(--text-secondary)]'}`}>
          {chat.online && <span className="w-1.5 h-1.5 rounded-full bg-sevchik-mint" />}
          {statusText}
        </p>

        <div className="flex items-center gap-3 mt-5">
          <ActionButton icon={Phone} label="Позвонить" onClick={() => alert('📞 Функция звонков скоро будет доступна!')} />
          <ActionButton icon={Video} label="Видео" onClick={() => alert('🎥 Видеозвонки скоро будут доступны!')} />
          <ActionButton icon={Search} label="Найти" onClick={() => alert('🔍 Поиск по переписке будет добавлен позже')} />
          <ActionButton
            icon={isMuted ? BellOff : Bell}
            label={isMuted ? 'Без звука' : 'Звук'}
            active={isMuted}
            onClick={() => setIsMuted((prev) => !prev)}
          />
        </div>
      </div>

      <div className="px-4 sm:px-6 space-y-4 max-w-2xl mx-auto">
        {override.note && (
          <section className="bg-[var(--bg-card)] rounded-2xl p-5 shadow-[0_8px_24px_rgba(77,195,200,0.08)]">
            <h3 className="font-heading font-bold text-[var(--text-main)] mb-2">Заметка</h3>
            <p className="text-sm text-sevchik-textSecondary font-body">{override.note}</p>
          </section>
        )}

        <button
          onClick={onOpenMedia}
          className="w-full text-left bg-[var(--bg-card)] rounded-2xl p-5 shadow-[0_8px_24px_rgba(77,195,200,0.08)]"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-heading font-bold text-[var(--text-main)]">Медиафайлы</h3>
            <ChevronRight size={20} className="text-sevchik-textSecondary" />
          </div>
          <div className="flex items-center gap-2 text-sevchik-textSecondary">
            <Image size={18} />
            <p className="text-sm font-body">{mediaCount > 0 ? `${mediaCount} фото` : 'Общих медиафайлов пока нет'}</p>
          </div>
        </button>

        <section className="bg-[var(--bg-card)] rounded-2xl overflow-hidden shadow-[0_8px_24px_rgba(77,195,200,0.08)]">
          <button
            onClick={() => alert('🔕 Уведомления от этого контакта отключены')}
            className="w-full flex items-center gap-3 px-5 py-4 text-left border-b border-[#F3F4F6]"
          >
            <Ban size={19} className="text-[#EF4444]" />
            <span className="font-heading font-semibold text-sm text-[#EF4444]">Заблокировать контакт</span>
          </button>
          <button
            onClick={() => alert('🗑️ История переписки будет очищена')}
            className="w-full flex items-center gap-3 px-5 py-4 text-left"
          >
            <Trash2 size={19} className="text-[#EF4444]" />
            <span className="font-heading font-semibold text-sm text-[#EF4444]">Очистить историю</span>
          </button>
        </section>
      </div>
    </div>
  );
}

function ActionButton({
  icon: Icon,
  label,
  onClick,
  active,
}: {
  icon: typeof Phone;
  label: string;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      whileHover={{ scale: 1.05 }}
      onClick={onClick}
      className="flex flex-col items-center gap-1.5"
    >
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center"
        style={{
          background: active ? 'var(--theme-primary)' : 'var(--bg-input)',
          color: active ? '#fff' : 'var(--theme-primary)',
          boxShadow: '0 2px 8px rgba(15,23,42,0.05)',
        }}
      >
        <Icon size={22} />
      </div>
      <span className="font-heading font-semibold text-[11px] text-[var(--text-secondary)] text-center max-w-[64px] truncate">{label}</span>
    </motion.button>
  );
}
