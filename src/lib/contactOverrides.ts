// Локальные правки контакта (отображаемое имя, телефон, заметка),
// заданные пользователем через экран редактирования контакта.
// Хранятся отдельно от базовых моковых данных чата, чтобы не мутировать
// общий список чатов напрямую.

import type { Chat } from '@/data/mock';

export interface ContactOverride {
  name?: string;
  phone?: string;
  note?: string;
}

const STORAGE_KEY = 'sevchik_contact_overrides';

function readAll(): Record<string, ContactOverride> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') as Record<string, ContactOverride>;
  } catch {
    return {};
  }
}

export function getContactOverride(chatId: string): ContactOverride {
  return readAll()[chatId] || {};
}

export function saveContactOverride(chatId: string, override: ContactOverride) {
  const all = readAll();
  all[chatId] = override;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

function getInitials(name: string): string {
  const letterWords = name
    .trim()
    .split(/\s+/)
    .map((word) => word.match(/[a-zA-Zа-яА-ЯёЁ]+/)?.[0])
    .filter((word): word is string => Boolean(word));
  if (letterWords.length === 0) return '?';
  if (letterWords.length === 1) return letterWords[0].slice(0, 2).toUpperCase();
  return (letterWords[0][0] + letterWords[1][0]).toUpperCase();
}

/** Отображаемое имя и инициалы с учётом локальной правки контакта. */
export function getDisplayContact(chat: Chat, override?: ContactOverride) {
  const o = override ?? getContactOverride(chat.id);
  const name = o.name?.trim() || chat.name;
  const initials = o.name?.trim() ? getInitials(o.name.trim()) : chat.initials;
  return { name, initials };
}
