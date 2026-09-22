// Центральное хранилище чатов и сообщений (Zustand).
// Раньше данные о чатах жили в трёх местах одновременно: статический
// массив в data/mock.ts, локальная копия внутри Chats.tsx и локальный
// state внутри Conversation.tsx (синхронизируемый обратно вручную) —
// из-за этого случались баги вроде дублирования сообщений при отправке.
// Теперь это единственный источник правды, и любой экран, которому
// нужны чаты или сообщения конкретного чата, читает их отсюда.

import { create } from 'zustand';
import { chats as initialChats } from '@/data/mock';
import type { Chat, Message, DeliveryStatus } from '@/data/mock';

interface ChatStore {
  chats: Chat[];
  sendMessage: (chatId: string, message: Message) => void;
  updateMessageStatus: (chatId: string, messageId: string, status: DeliveryStatus) => void;
  markAllMineRead: (chatId: string) => void;
  deleteMessage: (chatId: string, messageId: string) => void;
  deleteMessages: (chatId: string, messageIds: string[]) => void;
  editMessage: (chatId: string, messageId: string, newText: string) => void;
  markChatsRead: (chatIds: string[]) => void;
  markChatUnread: (chatId: string) => void;
  deleteChats: (chatIds: string[]) => void;
  forwardMessageToChats: (chatIds: string[], text: string) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  chats: initialChats,

  sendMessage: (chatId, message) =>
    set((state) => ({
      chats: state.chats.map((c) => (c.id === chatId ? { ...c, messages: [...c.messages, message] } : c)),
    })),

  updateMessageStatus: (chatId, messageId, status) =>
    set((state) => ({
      chats: state.chats.map((c) =>
        c.id === chatId
          ? { ...c, messages: c.messages.map((m) => (m.id === messageId ? { ...m, status } : m)) }
          : c
      ),
    })),

  markAllMineRead: (chatId) =>
    set((state) => ({
      chats: state.chats.map((c) =>
        c.id === chatId
          ? { ...c, messages: c.messages.map((m) => (m.senderId === 'me' ? { ...m, status: 'read' } : m)) }
          : c
      ),
    })),

  deleteMessage: (chatId, messageId) =>
    set((state) => ({
      chats: state.chats.map((c) =>
        c.id === chatId ? { ...c, messages: c.messages.filter((m) => m.id !== messageId) } : c
      ),
    })),

  deleteMessages: (chatId, messageIds) =>
    set((state) => ({
      chats: state.chats.map((c) =>
        c.id === chatId ? { ...c, messages: c.messages.filter((m) => !messageIds.includes(m.id)) } : c
      ),
    })),

  editMessage: (chatId, messageId, newText) =>
    set((state) => ({
      chats: state.chats.map((c) =>
        c.id === chatId
          ? { ...c, messages: c.messages.map((m) => (m.id === messageId ? { ...m, text: newText, edited: true } : m)) }
          : c
      ),
    })),

  markChatsRead: (chatIds) =>
    set((state) => ({
      chats: state.chats.map((c) => (chatIds.includes(c.id) ? { ...c, unread: 0 } : c)),
    })),

  markChatUnread: (chatId) =>
    set((state) => ({
      chats: state.chats.map((c) => (c.id === chatId ? { ...c, unread: Math.max(c.unread, 1) } : c)),
    })),

  deleteChats: (chatIds) =>
    set((state) => ({
      // Системный чат "Избранное" удалить нельзя
      chats: state.chats.filter((c) => c.isFavorites || !chatIds.includes(c.id)),
    })),

  forwardMessageToChats: (chatIds, text) =>
    set((state) => ({
      chats: state.chats.map((c) =>
        chatIds.includes(c.id)
          ? {
              ...c,
              messages: [
                ...c.messages,
                {
                  id: `fwd-${Date.now()}-${c.id}`,
                  senderId: 'me',
                  text,
                  time: new Date().toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' }),
                  date: new Date().toISOString().slice(0, 10),
                  status: 'sent' as DeliveryStatus,
                },
              ],
            }
          : c
      ),
    })),
}));
