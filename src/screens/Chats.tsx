import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { Avatar } from '@/components/Avatar';
import { chats as initialChats, stories } from '@/data/mock';
import type { Chat } from '@/data/mock';

interface ChatsProps {
  onOpenChat: (chat: Chat) => void;
}

export function Chats({ onOpenChat }: ChatsProps) {
  const [query, setQuery] = useState('');
  const [chats] = useState(initialChats);

  const filtered = chats.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="sticky top-0 z-10 pt-6 pb-4 px-4 sm:px-6" style={{ background: 'linear-gradient(180deg, rgba(255,248,237,0.98) 80%, transparent)' }}>
        <div className="flex items-center justify-between mb-4">
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl">Чаты</h1>
          <div className="w-10 h-10 rounded-full bg-sevq-orange flex items-center justify-center font-heading font-extrabold text-white text-sm relative overflow-hidden" style={{ boxShadow: '0 4px 12px rgba(255,152,72,0.3)' }}>
            <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 50%)' }} />
            <span className="relative z-10">АВ</span>
          </div>
        </div>

        {/* Orange search bar */}
        <div className="relative">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск..."
            className="w-full text-white placeholder:text-white/80 rounded-card py-3.5 pl-12 pr-4 focus:outline-none font-body text-sm relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #FFB87A, #FF9848)',
              boxShadow: '0 6px 20px rgba(255,152,72,0.3)',
            }}
          />
        </div>
      </div>

      {/* Stories */}
      <div className="px-4 sm:px-6 py-3">
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
          {stories.map((story) => (
            <motion.button
              key={story.id}
              whileTap={{ scale: 0.93 }}
              whileHover={{ y: -2 }}
              className="flex flex-col items-center gap-1.5 shrink-0"
            >
              <div className="relative">
                <div
                  className="rounded-full p-[2px]"
                  style={{ background: story.ringColor, boxShadow: `0 4px 12px ${story.ringColor}40` }}
                >
                  <div className="p-[2px] rounded-full bg-white">
                    <Avatar
                      initials={story.initials}
                      color={story.avatarColor}
                      size="md"
                    />
                  </div>
                </div>
                {story.hasStatusDot && (
                  <div
                    className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white"
                    style={{ background: story.ringColor }}
                  />
                )}
              </div>
              <span className="text-xs font-body text-sevq-textSecondary max-w-[60px] truncate">
                {story.name}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-24 md:pb-6">
        <div className="space-y-2.5">
          {filtered.map((chat, i) => (
            <motion.button
              key={chat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onOpenChat(chat)}
              className="w-full flex items-center gap-3 p-3.5 bg-white rounded-card text-left plastic-card btn-3d"
              style={{ boxShadow: '0 8px 24px rgba(101,70,199,0.08)' }}
            >
              <Avatar
                initials={chat.initials}
                color={chat.avatarColor}
                size="lg"
                online={chat.online}
                ringColor={chat.online ? '#4FD3C8' : undefined}
              />
              <div className="flex-1 min-w-0 relative z-10">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-heading font-bold text-sevq-text truncate">{chat.name}</h3>
                  <span className="text-xs text-sevq-textSecondary font-body shrink-0">{chat.time}</span>
                </div>
                <div className="flex items-center justify-between gap-2 mt-1">
                  <p className="text-sm text-sevq-textSecondary font-body truncate">{chat.lastMessage}</p>
                  {chat.unread > 0 && (
                    <span
                      className="shrink-0 text-white text-xs font-heading font-bold rounded-pill min-w-[22px] h-[22px] px-1.5 flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg, #8366D9, #6546C7)', boxShadow: '0 3px 10px rgba(101,70,199,0.3)' }}
                    >
                      {chat.unread}
                    </span>
                  )}
                  {chat.isNew && chat.unread === 0 && (
                    <span
                      className="shrink-0 text-white text-[10px] font-heading font-bold rounded-pill px-2 h-[20px] flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg, #6BE3D9, #4FD3C8)', boxShadow: '0 3px 10px rgba(79,211,200,0.3)' }}
                    >
                      Новое
                    </span>
                  )}
                </div>
              </div>
            </motion.button>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-12 text-sevq-textSecondary font-body">Ничего не найдено</div>
          )}
        </div>
      </div>
    </div>
  );
}
