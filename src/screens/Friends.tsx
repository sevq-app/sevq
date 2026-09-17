import { motion } from 'framer-motion';
import { UserPlus, MessageSquare } from 'lucide-react';
import { Avatar } from '@/components/Avatar';
import { friendsData } from '@/data/mock';

interface FriendsProps {
  onWriteMessage: (name: string) => void;
}

export function Friends({ onWriteMessage }: FriendsProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="sticky top-0 z-10 pt-6 pb-4 px-4 sm:px-6" style={{ background: 'linear-gradient(180deg, rgba(255,248,237,0.98) 80%, transparent)' }}>
        <div className="flex items-center justify-between">
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl">Друзья</h1>
          <span className="text-sm font-body text-sevq-textSecondary bg-white rounded-pill px-3 py-1" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            {friendsData.length} друзей
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-24 md:pb-6">
        <div className="space-y-2.5">
          {friendsData.map((friend, i) => (
            <motion.div
              key={friend.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.05 }}
              whileHover={{ y: -4 }}
              className="bg-white rounded-card p-3.5 flex items-center gap-3 plastic-card"
              style={{ boxShadow: '0 8px 24px rgba(101,70,199,0.08)' }}
            >
              <Avatar
                initials={friend.initials}
                color={friend.avatarColor}
                size="md"
                online={friend.online}
                ringColor={friend.online ? '#4FD3C8' : undefined}
              />
              <div className="flex-1 min-w-0 relative z-10">
                <h3 className="font-heading font-bold text-sevq-text truncate">{friend.name}</h3>
                <p className="text-sm text-sevq-purple font-body truncate">{friend.handle}</p>
                <p className={`text-xs font-body mt-0.5 flex items-center gap-1 ${friend.online ? 'text-sevq-mint' : 'text-sevq-textSecondary'}`}>
                  {friend.online && <span className="w-1.5 h-1.5 rounded-full bg-sevq-mint" />}
                  {friend.status}
                </p>
              </div>
              <motion.button
                whileTap={{ scale: 0.9, y: 2 }}
                className="shrink-0 w-10 h-10 rounded-full bg-sevq-cream flex items-center justify-center text-sevq-purple btn-3d"
                style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
              >
                <UserPlus size={18} />
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.9, y: 2 }}
                onClick={() => onWriteMessage(friend.name)}
                className="shrink-0 text-white rounded-btn px-3.5 py-2.5 font-heading font-bold text-sm btn-3d relative overflow-hidden flex items-center gap-1.5"
                style={{ background: 'linear-gradient(135deg, #8366D9, #6546C7)', boxShadow: '0 4px 14px rgba(101,70,199,0.25)' }}
              >
                <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 50%)' }} />
                <MessageSquare size={15} className="relative z-10" />
                <span className="relative z-10">Написать</span>
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
