import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Users } from 'lucide-react';
import { friendsData } from '@/data/mock';

interface FriendsProps {
  onWriteMessage: (name: string) => void;
}

export function Friends({ onWriteMessage }: FriendsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showConnectPrompt, setShowConnectPrompt] = useState(false);

  const filteredFriends = friendsData.filter(friend =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.handle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleConnectContacts = () => {
    setShowConnectPrompt(true);
    // Здесь позже будет реальная логика запроса доступа к контактам
  };

  const handleAllowContacts = () => {
    alert(' Доступ к контактам разрешен! Теперь мы ищем ваших друзей...');
    setShowConnectPrompt(false);
    // Здесь будет реальная логика синхронизации контактов
  };

  return (
    <div className="h-full overflow-y-auto pb-24 md:pb-6" style={{ background: 'radial-gradient(circle at 50% 50%, #FFF8ED 0%, #FFF0DB 100%)' }}>
      {/* Шапка с заголовком и кнопкой + */}
      <div className="px-4 sm:px-6 pt-6 pb-4 sticky top-0 z-20" style={{ background: 'linear-gradient(180deg, #FFF8ED 80%, transparent 100%)' }}>
        <div className="flex items-center justify-between mb-4">
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#1A1A1A]">Контакты</h1>
          <motion.button
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => alert('➕ Добавить новый контакт (скоро будет доступно!)')}
            className="w-11 h-11 rounded-full flex items-center justify-center text-white"
            style={{
              background: 'linear-gradient(135deg, #8366D9, #6546C7)',
              boxShadow: '0 4px 12px rgba(101,70,199,0.3)',
            }}
          >
            <Plus size={22} />
          </motion.button>
        </div>

        {/* Строка поиска */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по имени или никнейму"
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white border-2 border-transparent focus:border-[#6546C7]/30 focus:bg-white outline-none transition-all font-body text-[#1A1A1A] placeholder:text-[#9CA3AF]"
            style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
          />
        </div>
      </div>

      <div className="px-4 sm:px-6 space-y-4 max-w-2xl mx-auto pt-2">
        {/* Кнопка подключения контактов */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl p-5 plastic-card"
          style={{ boxShadow: '0 8px 24px rgba(101,70,199,0.08)' }}
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleConnectContacts}
            className="w-full flex items-center gap-4"
          >
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #4FD3C8, #38b2ac)',
                boxShadow: '0 4px 12px rgba(79,211,200,0.4)',
              }}
            >
              <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.25) 0%, transparent 50%)' }} />
              <Users size={24} className="text-white relative z-10" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-heading font-bold text-[#1A1A1A] text-sm">Подключите контакты</h3>
              <p className="text-xs text-[#6B7280] font-body mt-0.5">Разрешите доступ, чтобы найти друзей</p>
            </div>
          </motion.button>
        </motion.div>

        {/* Список друзей */}
        {filteredFriends.length > 0 ? (
          <div className="space-y-2">
            <h2 className="text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-3 ml-1">
              Ваши контакты ({filteredFriends.length})
            </h2>
            {filteredFriends.map((friend, index) => (
              <motion.div
                key={friend.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + index * 0.05 }}
                className="bg-white rounded-2xl p-4 flex items-center gap-4 plastic-card hover:shadow-lg transition-shadow"
                style={{ boxShadow: '0 4px 12px rgba(101,70,199,0.06)' }}
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-heading font-bold text-base relative overflow-hidden shrink-0"
                  style={{
                    background: `linear-gradient(135deg, ${friend.avatarColor}dd, ${friend.avatarColor})`,
                    boxShadow: `0 4px 12px ${friend.avatarColor}40`,
                  }}
                >
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.25) 0%, transparent 50%)' }} />
                  <span className="relative z-10">{friend.initials}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-heading font-bold text-[#1A1A1A] text-sm truncate">{friend.name}</h3>
                  <p className="text-xs text-[#6B7280] font-body mt-0.5">{friend.handle}</p>
                </div>
                {friend.online && (
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-sevq-mint" />
                    <span className="text-xs text-sevq-mint font-body">В сети</span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-[#6B7280] font-body text-sm">Ничего не найдено</p>
          </motion.div>
        )}
      </div>

      {/* Модальное окно запроса доступа к контактам */}
      {showConnectPrompt && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={() => setShowConnectPrompt(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl p-6 max-w-sm w-full"
            style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}
          >
            <div className="text-center mb-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3"
                style={{
                  background: 'linear-gradient(135deg, #4FD3C8, #38b2ac)',
                  boxShadow: '0 8px 24px rgba(79,211,200,0.3)',
                }}
              >
                <Users size={32} className="text-white" />
              </div>
              <h3 className="font-heading font-extrabold text-xl text-[#1A1A1A] mb-2">
                Доступ к контактам
              </h3>
              <p className="text-sm text-[#6B7280] font-body leading-relaxed">
                Разрешите доступ к вашей телефонной книге. Это поможет найти здесь ваших друзей и знакомых, которые уже пользуются SevQ.
              </p>
            </div>
            <div className="flex gap-3 mt-6">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowConnectPrompt(false)}
                className="flex-1 py-3 rounded-2xl bg-[#F3F4F6] text-[#4B5563] font-heading font-bold hover:bg-[#E5E7EB] transition-colors"
              >
                Отмена
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.02 }}
                onClick={handleAllowContacts}
                className="flex-1 py-3 rounded-2xl text-white font-heading font-bold"
                style={{
                  background: 'linear-gradient(135deg, #4FD3C8, #38b2ac)',
                  boxShadow: '0 4px 12px rgba(79,211,200,0.3)',
                }}
              >
                Разрешить
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}