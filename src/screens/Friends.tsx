import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Users, Link, Phone, Camera, ChevronLeft, X } from 'lucide-react';
import { friendsData } from '@/data/mock';

interface FriendsProps {
  onWriteMessage: (name: string) => void;
}

type FriendsView = 'main' | 'selectMembers' | 'createGroup';

export function Friends({ onWriteMessage }: FriendsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showConnectPrompt, setShowConnectPrompt] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [currentView, setCurrentView] = useState<FriendsView>('main');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [groupName, setGroupName] = useState('');
  const [groupSearch, setGroupSearch] = useState('');

  const filteredFriends = friendsData.filter(friend =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.handle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredForSelection = friendsData.filter(friend =>
    friend.name.toLowerCase().includes(groupSearch.toLowerCase()) ||
    friend.handle.toLowerCase().includes(groupSearch.toLowerCase())
  );

  const handleConnectContacts = () => {
    setShowConnectPrompt(true);
  };

  const handleAllowContacts = () => {
    alert('✅ Доступ к контактам разрешен! Теперь мы ищем ваших друзей...');
    setShowConnectPrompt(false);
  };

  const toggleMember = (friendId: string) => {
    setSelectedMembers(prev =>
      prev.includes(friendId)
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId]
    );
  };

  const handleCreateGroup = () => {
    if (!groupName.trim()) {
      alert('Пожалуйста, введите название группы');
      return;
    }
    alert(`🎉 Группа "${groupName}" создана!`);
    setCurrentView('main');
    setSelectedMembers([]);
    setGroupName('');
    setShowDropdown(false);
  };

  // ============================================
  // ЭКРАН 1: ГЛАВНЫЙ (Контакты)
  // ============================================
  if (currentView === 'main') {
    return (
      <div className="h-full overflow-y-auto pb-24 md:pb-6 relative" style={{ background: 'radial-gradient(circle at 50% 50%, #FFF8ED 0%, #FFF0DB 100%)' }}>
        {/* Шапка */}
        <div className="px-4 sm:px-6 pt-6 pb-4 sticky top-0 z-20" style={{ background: 'linear-gradient(180deg, #FFF8ED 80%, transparent 100%)' }}>
          <div className="flex items-center justify-between mb-4">
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#1A1A1A]">Контакты</h1>
            <div className="relative">
              <motion.button
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.05 }}
                onClick={() => setShowDropdown(!showDropdown)}
                className="w-11 h-11 rounded-full flex items-center justify-center text-white"
                style={{
                  background: 'linear-gradient(135deg, #8366D9, #6546C7)',
                  boxShadow: '0 4px 12px rgba(101,70,199,0.3)',
                }}
              >
                <Plus size={22} />
              </motion.button>
              {/* Выпадающее меню */}
              <AnimatePresence>
                {showDropdown && (
                  <>
                    {/* Оверлей фона */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setShowDropdown(false)}
                      className="fixed inset-0 z-30"
                    />
                    {/* Меню */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: -10 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                      className="absolute right-0 top-14 w-64 bg-white rounded-2xl overflow-hidden z-40"
                      style={{ boxShadow: '0 12px 40px rgba(101,70,199,0.2)' }}
                    >
                      {/* Пункт 1: Создать группу */}
                      <motion.button
                        whileHover={{ backgroundColor: '#F9FAFB' }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setShowDropdown(false);
                          setCurrentView('selectMembers');
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3.5 text-left border-b border-[#F3F4F6]"
                      >
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                          style={{
                            background: 'linear-gradient(135deg, #6546C7, #8366D9)',
                            boxShadow: '0 3px 10px rgba(101,70,199,0.3)',
                          }}
                        >
                          <Users size={18} className="text-white" />
                        </div>
                        <span className="font-heading font-semibold text-sm text-[#1A1A1A]">Создать группу</span>
                      </motion.button>
                      {/* Пункт 2: Пригласить по ссылке */}
                      <motion.button
                        whileHover={{ backgroundColor: '#F9FAFB' }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setShowDropdown(false);
                          alert('🔗 Ссылка для приглашения скопирована!');
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3.5 text-left border-b border-[#F3F4F6]"
                      >
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                          style={{
                            background: 'linear-gradient(135deg, #FF9848, #FFB87A)',
                            boxShadow: '0 3px 10px rgba(255,152,72,0.3)',
                          }}
                        >
                          <Link size={18} className="text-white" />
                        </div>
                        <span className="font-heading font-semibold text-sm text-[#1A1A1A]">Пригласить по ссылке</span>
                      </motion.button>
                      {/* Пункт 3: Найти по номеру */}
                      <motion.button
                        whileHover={{ backgroundColor: '#F9FAFB' }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setShowDropdown(false);
                          alert('📱 Введите номер телефона для поиска');
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
                      >
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                          style={{
                            background: 'linear-gradient(135deg, #4FD3C8, #38b2ac)',
                            boxShadow: '0 3px 10px rgba(79,211,200,0.3)',
                          }}
                        >
                          <Phone size={18} className="text-white" />
                        </div>
                        <span className="font-heading font-semibold text-sm text-[#1A1A1A]">Найти по номеру</span>
                      </motion.button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
          {/* Строка поиска */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск по имени или никнейму"
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white border-2 border-transparent focus:border-[#6546C7]/30 outline-none transition-all font-body text-[#1A1A1A] placeholder:text-[#9CA3AF]"
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
            className="bg-white rounded-3xl p-5"
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
                  className="bg-white rounded-2xl p-4 flex items-center gap-4 hover:shadow-lg transition-shadow"
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
                      <span className="w-2 h-2 rounded-full bg-sevchik-mint" />
                      <span className="text-xs text-sevchik-mint font-body">В сети</span>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
              <p className="text-[#6B7280] font-body text-sm">Ничего не найдено</p>
            </motion.div>
          )}
        </div>

        {/* Модальное окно запроса доступа к контактам */}
        <AnimatePresence>
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
                  <h3 className="font-heading font-extrabold text-xl text-[#1A1A1A] mb-2">Доступ к контактам</h3>
                  <p className="text-sm text-[#6B7280] font-body leading-relaxed">
                    Разрешите доступ к вашей телефонной книге. Это поможет найти здесь ваших друзей и знакомых, которые уже пользуются Севчик.
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
        </AnimatePresence>
      </div>
    );
  }

  // ============================================
  // ЭКРАН 2: ВЫБОР УЧАСТНИКОВ
  // ============================================
  if (currentView === 'selectMembers') {
    return (
      <div className="h-full overflow-y-auto pb-24 md:pb-6" style={{ background: 'radial-gradient(circle at 50% 50%, #FFF8ED 0%, #FFF0DB 100%)' }}>
        {/* Шапка */}
        <div className="px-4 sm:px-6 pt-6 pb-4 sticky top-0 z-20" style={{ background: 'linear-gradient(180deg, #FFF8ED 80%, transparent 100%)' }}>
          <div className="flex items-center gap-3 mb-4">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setCurrentView('main')}
              className="w-11 h-11 rounded-2xl bg-white flex items-center justify-center text-[#6546C7]"
              style={{ boxShadow: '0 4px 12px rgba(101,70,199,0.15)' }}
            >
              <ChevronLeft size={22} />
            </motion.button>
            <h1 className="font-heading font-extrabold text-2xl text-[#1A1A1A]">Выбери участников</h1>
          </div>
          {/* Поиск */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]" size={20} />
            <input
              type="text"
              value={groupSearch}
              onChange={(e) => setGroupSearch(e.target.value)}
              placeholder="Найти по имени"
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white border-2 border-transparent focus:border-[#6546C7]/30 outline-none transition-all font-body text-[#1A1A1A] placeholder:text-[#9CA3AF]"
              style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
            />
          </div>
          {/* Счетчик выбранных */}
          {selectedMembers.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 px-4 py-2 bg-[#6546C7] rounded-xl text-white text-sm font-heading font-bold inline-block"
              style={{ boxShadow: '0 4px 12px rgba(101,70,199,0.3)' }}
            >
              Выбрано: {selectedMembers.length}
            </motion.div>
          )}
        </div>

        <div className="px-4 sm:px-6 space-y-2 max-w-2xl mx-auto pt-2">
          {/* Список контактов по алфавиту */}
          {filteredForSelection.map((friend, index) => {
            const isSelected = selectedMembers.includes(friend.id);
            return (
              <motion.div
                key={friend.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 + index * 0.03 }}
              >
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => toggleMember(friend.id)}
                  className={`w-full bg-white rounded-2xl p-4 flex items-center gap-4 transition-all ${
                    isSelected ? 'ring-2 ring-[#6546C7]' : ''
                  }`}
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
                  <div className="flex-1 min-w-0 text-left">
                    <h3 className="font-heading font-bold text-[#1A1A1A] text-sm truncate">{friend.name}</h3>
                    <p className="text-xs text-[#6B7280] font-body mt-0.5">{friend.handle}</p>
                  </div>
                  {/* Галочка выбора */}
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all ${
                      isSelected ? 'bg-[#6546C7]' : 'bg-[#E5E7EB]'
                    }`}
                  >
                    {isSelected && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                </motion.button>
              </motion.div>
            );
          })}
        </div>

        {/* Кнопка "Создать пустую группу" внизу */}
        <div className="fixed bottom-20 md:bottom-6 left-0 right-0 px-4 sm:px-6 max-w-2xl mx-auto">
          <motion.button
            whileHover={{ scale: 1.02, boxShadow: '0 8px 20px rgba(101,70,199,0.3)' }}
            whileTap={{ scale: 0.98, y: 2 }}
            onClick={() => setCurrentView('createGroup')}
            className="w-full py-4 rounded-2xl text-white font-heading font-bold text-base relative overflow-hidden flex items-center justify-center gap-3"
            style={{
              background: 'linear-gradient(135deg, #8366D9 0%, #6546C7 100%)',
              boxShadow: '0 4px 14px rgba(101,70,199,0.25)',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
            <Plus size={20} className="relative z-10" />
            <span className="relative z-10">Создать пустую группу</span>
          </motion.button>
        </div>
      </div>
    );
  }

  // ============================================
  // ЭКРАН 3: СОЗДАНИЕ ГРУППЫ
  // ============================================
  if (currentView === 'createGroup') {
    return (
      <div className="h-full overflow-y-auto pb-24 md:pb-6" style={{ background: 'radial-gradient(circle at 50% 50%, #FFF8ED 0%, #FFF0DB 100%)' }}>
        {/* Шапка */}
        <div className="px-4 sm:px-6 pt-6 pb-4 sticky top-0 z-20" style={{ background: 'linear-gradient(180deg, #FFF8ED 80%, transparent 100%)' }}>
          <div className="flex items-center gap-3 mb-4">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setCurrentView('selectMembers')}
              className="w-11 h-11 rounded-2xl bg-white flex items-center justify-center text-[#6546C7]"
              style={{ boxShadow: '0 4px 12px rgba(101,70,199,0.15)' }}
            >
              <ChevronLeft size={22} />
            </motion.button>
            <h1 className="font-heading font-extrabold text-2xl text-[#1A1A1A]">Новая группа</h1>
          </div>
        </div>

        <div className="px-4 sm:px-6 space-y-6 max-w-2xl mx-auto pt-4">
          {/* Круг с фотоаппаратом */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center"
          >
            <p className="text-sm text-[#6B7280] font-body mb-4">Добавьте фото для вашего чата</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => alert('📷 Здесь откроется выбор фото из галереи или камеры')}
              className="w-28 h-28 rounded-full flex items-center justify-center relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #FFB87A, #FF9848)',
                boxShadow: '0 8px 24px rgba(255,152,72,0.35)',
              }}
            >
              <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.25) 0%, transparent 50%)' }} />
              <div className="relative z-10 flex flex-col items-center gap-1">
                <Camera size={28} className="text-white" />
                <Plus size={16} className="text-white" />
              </div>
            </motion.button>
          </motion.div>

          {/* Поле названия группы */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-2"
          >
            <label className="text-xs font-bold text-[#6B7280] uppercase tracking-wider ml-1">
              Название группы
            </label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Например: Друзья из школы"
              maxLength={50}
              className="w-full px-4 py-3.5 rounded-2xl bg-white border-2 border-transparent focus:border-[#6546C7]/30 outline-none transition-all font-body text-[#1A1A1A] placeholder:text-[#9CA3AF]"
              style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
            />
            <p className="text-xs text-[#9CA3AF] font-body text-right">
              {groupName.length}/50
            </p>
          </motion.div>

          {/* Выбранные участники (если есть) */}
          {selectedMembers.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="space-y-2"
            >
              <label className="text-xs font-bold text-[#6B7280] uppercase tracking-wider ml-1">
                Участники ({selectedMembers.length})
              </label>
              <div className="bg-white rounded-2xl p-4" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                {friendsData
                  .filter(f => selectedMembers.includes(f.id))
                  .map(friend => (
                    <div key={friend.id} className="flex items-center gap-3 py-2">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white font-heading font-bold text-xs"
                        style={{
                          background: `linear-gradient(135deg, ${friend.avatarColor}dd, ${friend.avatarColor})`,
                        }}
                      >
                        {friend.initials}
                      </div>
                      <span className="text-sm font-heading font-semibold text-[#1A1A1A]">{friend.name}</span>
                    </div>
                  ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Кнопка "Создать группу" внизу */}
        <div className="fixed bottom-20 md:bottom-6 left-0 right-0 px-4 sm:px-6 max-w-2xl mx-auto">
          <motion.button
            whileHover={{ scale: 1.02, boxShadow: '0 8px 20px rgba(79,211,200,0.4)' }}
            whileTap={{ scale: 0.98, y: 2 }}
            onClick={handleCreateGroup}
            disabled={!groupName.trim()}
            className="w-full py-4 rounded-2xl text-white font-heading font-bold text-base relative overflow-hidden flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: 'linear-gradient(135deg, #4FD3C8 0%, #38b2ac 100%)',
              boxShadow: '0 4px 14px rgba(79,211,200,0.3)',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
            <Users size={20} className="relative z-10" />
            <span className="relative z-10">Создать группу</span>
          </motion.button>
        </div>
      </div>
    );
  }

  return null;
}