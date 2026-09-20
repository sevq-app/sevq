import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, MoreVertical, Plus, Send } from 'lucide-react';
import { Avatar } from '@/components/Avatar';
import type { Chat, Message } from '@/data/mock';

interface ConversationProps {
  chat: Chat;
  onBack: () => void;
  fontSize: number;
}

export function Conversation({ chat, onBack, fontSize }: ConversationProps) {
  const [messages, setMessages] = useState<Message[]>(chat.messages);
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const msg: Message = {
      id: `m-${Date.now()}`,
      senderId: 'me',
      text: input.trim(),
      time: new Date().toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, msg]);
    setInput('');
    setTimeout(() => {
      const reply: Message = {
        id: `m-${Date.now()}-r`,
        senderId: chat.id,
        text: 'Принято! 👍',
        time: new Date().toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, reply]);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="sticky top-0 z-10 px-4 py-3 flex items-center gap-3 bg-transparent"
      >
        <motion.button
          whileTap={{ scale: 0.9, y: 2 }}
          onClick={onBack}
          className="p-2 rounded-full bg-sevchik-cream text-sevchik-text btn-3d"
          style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
        >
          <ArrowLeft size={20} />
        </motion.button>
        <Avatar initials={chat.initials} color={chat.avatarColor} size="sm" online={chat.online} />
        <div className="flex-1 min-w-0">
          <h2 className="font-heading font-bold text-sevchik-text truncate">{chat.name}</h2>
          <p className={`text-xs font-body flex items-center gap-1 ${chat.online ? 'text-sevchik-mint' : 'text-sevchik-textSecondary'}`}>
            {chat.online && <span className="w-1.5 h-1.5 rounded-full bg-sevchik-mint" />}
            {chat.online ? 'в сети' : 'не в сети'}
          </p>
        </div>
        <button className="p-2 rounded-full bg-sevchik-cream text-sevchik-textSecondary btn-3d" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <MoreVertical size={20} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg) => {
          const isMe = msg.senderId === 'me';
          return (
            <motion.div
              key={msg.id}
              initial={isMe ? { scale: 0.95, opacity: 0 } : { y: 15, opacity: 0 }}
              animate={isMe ? { scale: 1, opacity: 1 } : { y: 0, opacity: 1 }}
              transition={isMe ? { duration: 0.22, ease: 'easeOut' } : { duration: 0.4, type: 'spring', bounce: 0.5 }}
              className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] px-4 py-2.5 font-body text-sm relative overflow-hidden ${
                  isMe
                    ? 'message-outgoing-pattern text-white rounded-2xl rounded-br-sm'
                    : 'message-incoming-pattern text-[var(--text-main)] rounded-2xl rounded-bl-sm'
                }`}
                style={{ boxShadow: isMe ? '0 4px 16px rgba(101,70,199,0.2)' : '0 4px 16px rgba(101,70,199,0.06)' }}
              >
                <p className="relative z-10" style={{ fontSize: `${fontSize}px` }}>{msg.text}</p>
                <p className={`text-[10px] mt-1 relative z-10 ${isMe ? 'text-white/50' : 'text-sevchik-textSecondary'}`} style={{ fontSize: `${fontSize}px` }}>{msg.time}</p>
              </div>
            </motion.div>
          );
        })}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 bg-white md:pb-4 pb-20" style={{ boxShadow: '0 -4px 16px rgba(101,70,199,0.04)' }}>
        <div className="flex items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.9, y: 2 }}
            className="shrink-0 w-11 h-11 rounded-full bg-sevchik-cream flex items-center justify-center text-sevchik-purple btn-3d"
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
          >
            <Plus size={22} />
          </motion.button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Написать сообщение..."
            className="flex-1 bg-sevchik-cream/60 rounded-btn py-3 px-4 text-sevchik-text placeholder:text-sevchik-textSecondary/60 focus:outline-none focus:ring-2 focus:ring-sevchik-purple/30 font-body text-sm"
          />
          <motion.button
            whileTap={{ scale: 0.88, y: 2 }}
            onClick={handleSend}
            className="shrink-0 w-11 h-11 rounded-full flex items-center justify-center text-white btn-3d relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #FFB87A, #FF9848)', boxShadow: '0 4px 14px rgba(255,152,72,0.35)' }}
          >
            <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.2) 0%, transparent 50%)' }} />
            <Send size={20} className="relative z-10" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}

