import { useState, type ReactNode } from 'react';
import { ArrowLeft, User as UserIcon, Phone, MessageSquare } from 'lucide-react';
import { Avatar } from '@/components/Avatar';
import { getContactOverride, saveContactOverride, getDisplayContact } from '@/lib/contactOverrides';
import { useChatStore } from '@/store/chatStore';

interface ContactEditProps {
  chatId: string;
  onBack: () => void;
}

export function ContactEdit({ chatId, onBack }: ContactEditProps) {
  const chat = useChatStore((s) => s.chats.find((c) => c.id === chatId));
  const saved = getContactOverride(chatId);
  const [name, setName] = useState(saved.name || chat?.name || '');
  const [phone, setPhone] = useState(saved.phone || '');
  const [note, setNote] = useState(saved.note || '');
  const [saving, setSaving] = useState(false);

  if (!chat) return null;

  const { initials: previewInitials } = getDisplayContact(chat, { name, phone, note });

  const handleSave = () => {
    setSaving(true);
    saveContactOverride(chat.id, {
      name: name.trim() === chat.name ? '' : name.trim(),
      phone: phone.trim(),
      note: note.trim(),
    });
    setSaving(false);
    onBack();
  };

  return (
    <div className="h-full overflow-y-auto px-5 py-5 pb-28 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="w-11 h-11 rounded-full bg-[var(--bg-card)] flex items-center justify-center transition-all duration-200 ease-out hover:scale-105 hover:bg-[var(--bg-input)]"
          aria-label="Назад"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-heading font-extrabold text-2xl">Редактировать контакт</h1>
      </div>

      <div className="flex flex-col items-center mb-6">
        <Avatar initials={previewInitials} size="xl" online={chat.online} />
      </div>

      <div className="space-y-3">
        <Field label="Отображаемое имя" icon={UserIcon} iconColor="#4DC3C8">
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Введите имя" />
        </Field>
        <Field label="Номер телефона" icon={Phone} iconColor="#FF9848">
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Добавьте номер телефона" />
        </Field>
        <Field label="Заметка" icon={MessageSquare} iconColor="#4FD3C8" help="Видна только вам">
          <textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Например, откуда вы знакомы" />
        </Field>
      </div>

      <button
        onClick={handleSave}
        disabled={saving || !name.trim()}
        className="w-full mt-6 rounded-2xl bg-gradient-to-r from-[#3D999D] to-[#4DC3C8] px-4 py-3.5 text-white font-heading font-medium shadow-[0_4px_14px_rgba(77,195,200,0.18)] transition-all duration-200 ease-out hover:scale-[1.02] hover:shadow-[0_8px_20px_rgba(77,195,200,0.22)] active:scale-95 disabled:opacity-60"
      >
        {saving ? 'Сохранение...' : 'Сохранить'}
      </button>
    </div>
  );
}

function Field({ label, icon: Icon, iconColor, help, children }: { label: string; icon: typeof UserIcon; iconColor: string; help?: string; children: ReactNode }) {
  return (
    <label className="group block bg-[var(--bg-card)] rounded-2xl px-5 py-4 border-2 border-transparent transition-all duration-200 ease-out hover:bg-[var(--bg-input)] hover:scale-[1.01] focus-within:border-[#4DC3C8]/50">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0" style={{ background: `${iconColor}20`, color: iconColor }}>
          <Icon size={19} />
        </div>
        <div className="min-w-0 flex-1">
          <span className="block text-sm font-heading font-bold mb-2">{label}</span>
          <div className="field-input [&_input]:w-full [&_input]:border-0 [&_input]:!bg-transparent [&_input]:shadow-none [&_input]:appearance-none [&_input]:outline-none [&_input]:pointer-events-auto [&_input]:cursor-text [&_input]:touch-manipulation [&_input]:transition-all [&_input]:duration-200 [&_input]:text-[var(--text-main)] [&_input]:placeholder:text-[var(--text-secondary)] [&_textarea]:w-full [&_textarea]:border-0 [&_textarea]:!bg-transparent [&_textarea]:shadow-none [&_textarea]:appearance-none [&_textarea]:outline-none [&_textarea]:pointer-events-auto [&_textarea]:cursor-text [&_textarea]:touch-manipulation [&_textarea]:resize-none [&_textarea]:transition-all [&_textarea]:duration-200 [&_textarea]:text-[var(--text-main)] [&_textarea]:placeholder:text-[var(--text-secondary)]">
            {children}
          </div>
          {help && <span className="block text-xs text-[var(--text-secondary)] mt-2">{help}</span>}
        </div>
      </div>
    </label>
  );
}
