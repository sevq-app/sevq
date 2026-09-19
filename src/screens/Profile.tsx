import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Users, LogOut } from 'lucide-react';
import { Avatar } from '@/components/Avatar';
import { userProfile, themeCircles, themeStickers } from '@/data/mock';
import { supabase } from '@/lib/supabase';
import type { Screen } from '@/data/mock';

export function Profile({ onNavigate }: { onNavigate?: (screen: Screen) => void }) {
  const [online, setOnline] = useState(userProfile.online);
  const [selectedTheme, setSelectedTheme] = useState(0);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      await supabase.auth.signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Ошибка при выходе:', error);
      alert('Не удалось выйти из аккаунта');
    } finally {
      setLogoutLoading(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto pb-24 md:pb-6">
      {/* Header */}
      <div className="px-4 sm:px-6 pt-6 pb-2 flex items-center justify-between">
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl">Мой Севчик</h1>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => onNavigate?.('settings')}
          className="w-11 h-11 rounded-card bg-white flex items-center justify-center text-sevchik-textSecondary hover:text-sevchik-purple transition-colors btn-3d"
          style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
        >
          <Settings size={20} />
        </motion.button>
      </div>

      {/* Avatar + name */}
      <div className="flex flex-col items-center px-4 sm:px-6 mb-6 mt-2">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <div
            className="p-1 rounded-full"
            style={{ background: 'linear-gradient(135deg, #FFB87A, #FF9848)', boxShadow: '0 8px 24px rgba(255,152,72,0.35)' }}
          >
            <div className="p-[3px] rounded-full bg-white">
              <Avatar initials={userProfile.initials} color={userProfile.avatarColor} size="xxl" online={online} />
            </div>
          </div>
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.4, type: 'spring', stiffness: 300, damping: 15 }}
            className="absolute -top-1 -right-1 w-9 h-9 rounded-full bg-white flex items-center justify-center text-lg"
            style={{ boxShadow: '0 4px 12px rgba(101,70,199,0.2)' }}
          >
            ✨
          </motion.div>
        </motion.div>
        <h2 className="font-heading font-extrabold text-xl mt-4">{userProfile.name}</h2>
        <p className="text-sevchik-textSecondary text-sm font-body mt-0.5">{userProfile.bio}</p>
      </div>

      <div className="px-4 sm:px-6 space-y-4 max-w-2xl mx-auto">
        {/* Status toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-card p-5 flex items-center justify-between plastic-card"
          style={{ boxShadow: '0 8px 24px rgba(101,70,199,0.08)' }}
        >
          <div className="relative z-10">
            <h3 className="font-heading font-bold text-sevchik-text">Статус</h3>
            <p className="text-sm text-sevchik-textSecondary font-body mt-0.5 flex items-center gap-1.5">
              {online && <span className="w-2 h-2 rounded-full bg-sevchik-mint" />}
              {online ? 'В сети' : 'Не в сети'}
            </p>
          </div>
          <button
            onClick={() => setOnline(!online)}
            className={`relative w-14 h-8 rounded-full transition-colors duration-300 ${online ? 'bg-sevchik-mint' : 'bg-sevchik-textSecondary/20'}`}
            style={online ? { boxShadow: '0 3px 12px rgba(79,211,200,0.4)' } : undefined}
          >
            <motion.div
              layout
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              className={`absolute top-1 w-6 h-6 rounded-full bg-white ${online ? 'left-7' : 'left-1'}`}
              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
            />
          </button>
        </motion.div>

        {/* About */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-card p-5 plastic-card"
          style={{ boxShadow: '0 8px 24px rgba(101,70,199,0.08)' }}
        >
          <h3 className="font-heading font-bold text-sevchik-text mb-2 relative z-10">Обо мне</h3>
          <p className="text-sm text-sevchik-textSecondary font-body leading-relaxed relative z-10">{userProfile.about}</p>
        </motion.div>

        {/* Photos — Polaroid effect */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white rounded-card p-5 plastic-card"
          style={{ boxShadow: '0 8px 24px rgba(101,70,199,0.08)' }}
        >
          <h3 className="font-heading font-bold text-sevchik-text mb-3 relative z-10">Фотографии</h3>
          <div className="grid grid-cols-3 gap-3 relative z-10">
            {[
              { color: '#6546C7', emoji: '🏔️', rotate: -3 },
              { color: '#FF9848', emoji: '🌊', rotate: 2 },
              { color: '#4FD3C8', emoji: '🌅', rotate: -2 },
            ].map((photo, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -4, rotate: 0, scale: 1.05 }}
                className="bg-white rounded-xl p-1.5"
                style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)', rotate: `${photo.rotate}deg` }}
              >
                <div
                  className="aspect-square rounded-lg flex items-center justify-center text-2xl relative overflow-hidden"
                  style={{ background: `linear-gradient(135deg, ${photo.color}, ${photo.color}aa)` }}
                >
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.25) 0%, transparent 50%)' }} />
                  <span className="relative z-10">{photo.emoji}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Favorite community */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-card p-5 flex items-center gap-4 plastic-card"
          style={{ boxShadow: '0 8px 24px rgba(101,70,199,0.08)' }}
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shrink-0 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #8366D9, #6546C7)', boxShadow: '0 4px 12px rgba(101,70,199,0.25)' }}
          >
            <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.2) 0%, transparent 50%)' }} />
            <Users size={26} className="relative z-10" />
          </div>
          <div className="flex-1 min-w-0 relative z-10">
            <h3 className="font-heading font-bold text-sevchik-text">Любимое сообщество</h3>
            <p className="text-sm text-sevchik-text font-body mt-0.5 truncate">{userProfile.favoriteCommunity}</p>
            <p className="text-xs text-sevchik-textSecondary font-body">{userProfile.communityMembers}</p>
          </div>
        </motion.div>

        {/* Personal theme */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white rounded-card p-5 plastic-card"
          style={{ boxShadow: '0 8px 24px rgba(101,70,199,0.08)' }}
        >
          <h3 className="font-heading font-bold text-sevchik-text mb-4 relative z-10">Персональная тема</h3>
          <div className="flex gap-4 mb-4 relative z-10">
            {themeCircles.map((theme, i) => (
              <motion.button
                key={theme.id}
                whileTap={{ scale: 0.88, y: 2 }}
                whileHover={{ y: -3 }}
                onClick={() => setSelectedTheme(i)}
                className={`relative w-14 h-14 rounded-full flex items-center justify-center transition-all relative overflow-hidden ${selectedTheme === i ? 'ring-4 ring-white' : ''}`}
                style={{
                  background: `linear-gradient(135deg, ${theme.color}dd, ${theme.color})`,
                  boxShadow: selectedTheme === i
                    ? `0 0 0 3px ${theme.color}, 0 6px 16px ${theme.color}50`
                    : `0 4px 12px ${theme.color}40`,
                }}
              >
                <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 50%)' }} />
                <span className="text-lg relative z-10">{theme.emoji}</span>
              </motion.button>
            ))}
          </div>
          <div className="flex gap-3 relative z-10">
            {themeStickers.map((sticker, i) => (
              <motion.button
                key={sticker.id}
                whileTap={{ scale: 0.85, y: 2 }}
                whileHover={{ y: -3, rotate: 5 }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + i * 0.06, type: 'spring', stiffness: 300 }}
                className="w-11 h-11 rounded-2xl bg-sevchik-cream flex items-center justify-center text-xl"
                style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
                title={sticker.label}
              >
                {sticker.emoji}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Кнопка выхода */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="pt-2 pb-6"
        >
          <motion.button
            whileHover={{ scale: 1.02, boxShadow: '0 8px 20px rgba(239, 68, 68, 0.3)' }}
            whileTap={{ scale: 0.98, y: 2 }}
            onClick={handleLogout}
            disabled={logoutLoading}
            className="w-full py-4 rounded-2xl text-white font-heading font-bold text-lg relative overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            style={{
              background: 'linear-gradient(135deg, #FF6B6B 0%, #EF4444 100%)',
              boxShadow: '0 4px 14px rgba(239, 68, 68, 0.25)',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
            <LogOut size={22} className="relative z-10" />
            <span className="relative z-10">
              {logoutLoading ? 'Выход...' : 'Выйти из аккаунта'}
            </span>
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}