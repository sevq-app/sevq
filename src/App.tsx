import { useState } from 'react'; 
import { AnimatePresence, motion } from 'framer-motion';
import { Search as SearchIcon } from 'lucide-react';
import { Sidebar, TabBar } from '@/components/Navigation';
import { QLogo } from '@/components/QLogo';
import { Login, Register } from '@/screens/Login';
import { Chats } from '@/screens/Chats';
import { Conversation } from '@/screens/Conversation';
import { Profile } from '@/screens/Profile';
import { Search } from '@/screens/Search';
import { Friends } from '@/screens/Friends';
import { Clubs } from '@/screens/Clubs';
import { Settings } from '@/screens/Settings';
import { Calls } from '@/screens/Calls';
import type { Screen, Chat } from '@/data/mock';

function App() {
  const [screen, setScreen] = useState<Screen>('login');
  const [activeChat, setActiveChat] = useState<Chat | null>(null);

  const handleOpenChat = (chat: Chat) => {
    setActiveChat(chat);
    setScreen('conversation');
  };

  const handleSearchWrite = (name: string) => {
    const chat = {
      id: `search-${name}`,
      name,
      avatarColor: '#6546C7',
      initials: name.slice(0, 2).toUpperCase(),
      lastMessage: '',
      time: '',
      unread: 0,
      online: true,
      messages: [],
    } as Chat;
    setActiveChat(chat);
    setScreen('conversation');
  };

  // Auth screens
  if (screen === 'login') {
    return <Login onLogin={() => setScreen('chats')} onRegister={() => setScreen('register')} />;
  }
  if (screen === 'register') {
    return <Register onRegister={() => setScreen('chats')} onLogin={() => setScreen('login')} />;
  }

  // ИСПРАВЛЕНО: 'friends' заменен на 'contacts'
  const showTabBar = screen === 'chats' || screen === 'profile' || screen === 'search' || screen === 'contacts' || screen === 'calls' || screen === 'clubs';

  const pageVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar current={screen} onNavigate={setScreen} />

      <div className="flex-1 min-w-0 flex h-screen overflow-hidden">
        <div className="flex-1 min-w-0 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={screen}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="h-full"
            >
              {screen === 'chats' && <Chats onOpenChat={handleOpenChat} />}
              {screen === 'conversation' && activeChat && (
                <Conversation chat={activeChat} onBack={() => setScreen('chats')} />
              )}
              
              {/* ИСПРАВЛЕНО: 'friends' заменен на 'contacts' */}
              {screen === 'contacts' && <Friends onWriteMessage={handleSearchWrite} />}
              
              {screen === 'calls' && <Calls onNavigate={setScreen} />}
              {screen === 'clubs' && <Clubs onOpenClub={() => {}} />}
              {screen === 'profile' && <Profile onNavigate={setScreen} />}
              {screen === 'search' && (
                <Search onBack={() => setScreen('chats')} onWriteMessage={handleSearchWrite} />
              )}
              {screen === 'settings' && (
                <Settings onBack={() => setScreen('profile')} onLogout={() => setScreen('login')} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="hidden xl:block w-80 shrink-0 overflow-y-auto p-5 border-l border-sevq-purple/8">
          <ProfilePreview />
        </div>
      </div>

      {showTabBar && <TabBar current={screen} onNavigate={setScreen} />}
    </div>
  );
}

function ProfilePreview() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <QLogo size={36} />
        <span className="font-heading font-extrabold text-xl text-sevq-text">SevQ</span>
      </div>

      <div className="bg-white rounded-card p-5 flex flex-col items-center plastic-card" style={{ boxShadow: '0 8px 24px rgba(101,70,199,0.08)' }}>
        <div className="relative z-10">
          <div className="p-1 rounded-full" style={{ background: 'linear-gradient(135deg, #FFB87A, #FF9848)', boxShadow: '0 4px 14px rgba(255,152,72,0.3)' }}>
            <div className="p-[2px] rounded-full bg-white">
              <div className="w-16 h-16 rounded-full flex items-center justify-center font-heading font-extrabold text-white text-lg relative overflow-hidden" style={{ background: '#6546C7' }}>
                <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 50%)' }} />
                <span className="relative z-10">АВ</span>
              </div>
            </div>
          </div>
        </div>
        <h3 className="font-heading font-extrabold text-base mt-3 relative z-10">Александр В.</h3>
        <p className="text-xs text-sevq-textSecondary font-body mt-0.5 relative z-10">Твой маленький большой мир</p>
        <div className="flex items-center gap-1.5 mt-2 relative z-10">
          <span className="w-2 h-2 rounded-full bg-sevq-mint" />
          <span className="text-xs text-sevq-mint font-body">В сети</span>
        </div>
      </div>

      <div className="bg-white rounded-card p-4 flex items-center gap-3 plastic-card" style={{ boxShadow: '0 8px 24px rgba(101,70,199,0.08)' }}>
        <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white relative overflow-hidden shrink-0" style={{ background: 'linear-gradient(135deg, #8366D9, #6546C7)' }}>
          <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.2) 0%, transparent 50%)' }} />
          <span className="relative z-10 text-sm font-heading font-bold">КП</span>
        </div>
        <div className="flex-1 min-w-0 relative z-10">
          <p className="text-sm font-heading font-bold text-sevq-text truncate">Клуб путешественников</p>
          <p className="text-xs text-sevq-textSecondary font-body">1.2k участников</p>
        </div>
      </div>

      <div className="bg-white rounded-card p-4 plastic-card" style={{ boxShadow: '0 8px 24px rgba(101,70,199,0.08)' }}>
        <h4 className="font-heading font-bold text-sm text-sevq-text mb-3 relative z-10">Персональная тема</h4>
        <div className="flex gap-3 relative z-10">
          {['#6546C7', '#FF9848', '#4FD3C8'].map((color, i) => (
            <div
              key={i}
              className="w-10 h-10 rounded-full relative overflow-hidden"
              style={{ background: `linear-gradient(135deg, ${color}dd, ${color})`, boxShadow: `0 3px 10px ${color}40` }}
            >
              <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.25) 0%, transparent 50%)' }} />
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-3 relative z-10">
          {['⭐', '😊', '🌿', '❤️', '✨'].map((emoji, i) => (
            <div key={i} className="w-8 h-8 rounded-xl bg-sevq-cream flex items-center justify-center text-sm" style={{ boxShadow: '0 2px 6px rgba(0,0,0,0.05)' }}>
              {emoji}
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={() => window.dispatchEvent(new CustomEvent('sevq-navigate', { detail: 'search' }))}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-card text-white font-heading font-bold btn-3d relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #FFB87A, #FF9848)', boxShadow: '0 4px 14px rgba(255,152,72,0.25)' }}
      >
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 50%)' }} />
        <SearchIcon size={18} className="relative z-10" />
        <span className="relative z-10 text-sm">Найти друзей</span>
      </button>
    </div>
  );
}

export default App;