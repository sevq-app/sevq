import { useState, useEffect } from 'react'; 
import { AnimatePresence, motion } from 'framer-motion';
import { Search as SearchIcon } from 'lucide-react';
import { Sidebar, TabBar } from '@/components/Navigation';
import { QLogo } from '@/components/QLogo';
import { Login, Register } from '@/screens/Login';
import { Chats } from '@/screens/Chats';
import { Conversation } from '@/screens/Conversation';
import { getProfileGroups, Profile } from '@/screens/Profile';
import { Search } from '@/screens/Search';
import { Friends } from '@/screens/Friends';
import { Clubs } from '@/screens/Clubs';
import { Settings } from '@/screens/Settings';
import { Calls } from '@/screens/Calls';
import { Appearance } from '@/screens/Appearance';
import { AboutEdit } from '@/screens/AboutEdit';
import { Photos } from '@/screens/Photos';
import { MyGroups } from '@/screens/MyGroups';
import { Group } from '@/screens/Group';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';
import type { Screen, Chat } from '@/data/mock';

function App() {
  const [screen, setScreen] = useState<Screen>('login');
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 🎨 Глобальные настройки оформления
  const [fontSize, setFontSize] = useState(() => Number(localStorage.getItem('sevchik-fontSize')) || 16);
  const [selectedTheme, setSelectedTheme] = useState(() => localStorage.getItem('sevchik-theme') || 'calm');
  const [grayMode, setGrayMode] = useState(() => localStorage.getItem('sevchik-grayMode') === 'true');

  const updateGrayMode = (enabled: boolean) => {
    const html = document.documentElement;
    html.classList.add('theme-switching');
    setGrayMode(enabled);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => html.classList.remove('theme-switching'));
    });
  };

  // Применяем настройки оформления ко всему документу
  useEffect(() => {
    localStorage.setItem('sevchik-fontSize', String(fontSize));
    localStorage.setItem('sevchik-theme', selectedTheme);
    localStorage.setItem('sevchik-grayMode', String(grayMode));

    const html = document.documentElement;
    html.classList.toggle('gray-theme', grayMode);
  }, [fontSize, selectedTheme, grayMode]);

  // Проверяем состояние аутентификации при загрузке
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setCurrentUser(session.user);
        setScreen('chats');
      } else {
        setCurrentUser(null);
        setScreen('login');
      }
      setIsLoading(false);
    };
    checkAuth();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setCurrentUser(session.user);
        setScreen('chats');
      } else {
        setCurrentUser(null);
        setScreen('login');
      }
    });
    return () => subscription.unsubscribe();
  }, []);

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

  const handleOpenGroup = (groupName: string) => {
    setActiveGroup(groupName);
    setScreen('group');
  };

  const handleLogout = () => {
    supabase.auth.signOut();
    setScreen('login');
    setActiveChat(null);
  };

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center" style={{ background: 'var(--bg-main, radial-gradient(ellipse at top left, #FFF8ED 0%, #FFF0DC 60%, #FFE9CC 100%))' }}>
        <div className="flex flex-col items-center gap-4">
          <QLogo size={64} />
          <p className="font-body" style={{ color: 'var(--text-secondary, #6B7280)' }}>Загрузка...</p>
        </div>
      </div>
    );
  }

  if (screen === 'login') {
    return <Login onLogin={() => setScreen('chats')} onRegister={() => setScreen('register')} />;
  }
  if (screen === 'register') {
    return <Register onRegister={() => setScreen('chats')} onLogin={() => setScreen('login')} />;
  }

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
              {screen === 'chats' && (
                <Chats onOpenChat={handleOpenChat} grayMode={grayMode} fontSize={fontSize} />
              )}
              {screen === 'conversation' && activeChat && (
                <Conversation chat={activeChat} onBack={() => setScreen('chats')} fontSize={fontSize} />
              )}
              {screen === 'contacts' && <Friends onWriteMessage={handleSearchWrite} />}
              {screen === 'calls' && <Calls onNavigate={setScreen} />}
              {screen === 'clubs' && <Clubs onOpenClub={() => {}} />}
              {screen === 'profile' && <Profile user={currentUser} onNavigate={setScreen} />}
              {screen === 'about-edit' && <AboutEdit onBack={() => setScreen('profile')} />}
              {screen === 'photos' && <Photos onBack={() => setScreen('profile')} />}
              {screen === 'my-groups' && <MyGroups groups={getProfileGroups(currentUser)} onBack={() => setScreen('profile')} onOpenGroup={handleOpenGroup} />}
              {screen === 'group' && activeGroup && <Group name={activeGroup} onBack={() => setScreen('my-groups')} />}
              {screen === 'search' && (
                <Search onBack={() => setScreen('chats')} onWriteMessage={handleSearchWrite} />
              )}
              {screen === 'settings' && (
                <Settings 
                  onBack={() => setScreen('profile')} 
                  onLogout={handleLogout}
                  onNavigate={setScreen} 
                  grayMode={grayMode}
                />
              )}
              {screen === 'appearance' && (
                <Appearance 
                  onBack={() => setScreen('settings')}
                  fontSize={fontSize}
                  setFontSize={setFontSize}
                  selectedTheme={selectedTheme}
                  setSelectedTheme={setSelectedTheme}
                  grayMode={grayMode}
                  setGrayMode={updateGrayMode}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="hidden xl:block w-80 shrink-0 overflow-y-auto p-5 border-l border-sevchik-purple/8">
          <ProfilePreview user={currentUser} />
        </div>
      </div>
      {showTabBar && <TabBar current={screen} onNavigate={setScreen} />}
    </div>
  );
}

function ProfilePreview({ user }: { user: User | null }) {
  const metadata = user?.user_metadata as Record<string, unknown> | undefined;
  const name = typeof metadata?.name === 'string' ? metadata.name : typeof metadata?.full_name === 'string' ? metadata.full_name : '';
  const username = typeof metadata?.username === 'string' ? metadata.username : '';
  const avatarUrl = typeof metadata?.avatarUrl === 'string' ? metadata.avatarUrl : typeof metadata?.avatar_url === 'string' ? metadata.avatar_url : '';
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <QLogo size={36} />
        <span className="font-heading font-extrabold text-xl" style={{ color: 'var(--text-main, #1A1A1A)' }}>Севчик</span>
      </div>
      <div className="bg-white rounded-card p-5 flex flex-col items-center plastic-card" style={{ boxShadow: '0 8px 24px rgba(101,70,199,0.08)' }}>
        <div className="relative z-10">
          <div className="p-1 rounded-full" style={{ background: 'linear-gradient(135deg, #FFB87A, #FF9848)', boxShadow: '0 4px 14px rgba(255,152,72,0.3)' }}>
            <div className="p-[2px] rounded-full bg-white">
              {avatarUrl ? <img src={avatarUrl} alt="" className="w-16 h-16 rounded-full object-cover" /> : <div className="w-16 h-16 rounded-full flex items-center justify-center font-heading font-extrabold text-white text-lg relative overflow-hidden" style={{ background: '#6546C7' }}>
                <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 50%)' }} />
                <span className="relative z-10">+</span>
              </div>}
            </div>
          </div>
        </div>
        <h3 className="font-heading font-extrabold text-base mt-3 relative z-10" style={{ color: 'var(--text-main, #1A1A1A)' }}>{name || 'Загрузка...'}</h3>
        <p className="text-xs font-body mt-0.5 relative z-10" style={{ color: 'var(--text-secondary, #6B7280)' }}>{username ? `@${username.replace(/^@/, '')}` : ''}</p>
        <div className="flex items-center gap-1.5 mt-2 relative z-10">
          <span className="w-2 h-2 rounded-full bg-sevchik-mint" />
          <span className="text-xs text-sevchik-mint font-body">В сети</span>
        </div>
      </div>
      <div className="bg-white rounded-card p-4 plastic-card" style={{ boxShadow: '0 8px 24px rgba(101,70,199,0.08)' }}>
        <h4 className="font-heading font-bold text-sm mb-3 relative z-10" style={{ color: 'var(--text-main, #1A1A1A)' }}>Персональная тема</h4>
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
          {['⭐', '😊', '', '❤️', '✨'].map((emoji, i) => (
            <div key={i} className="w-8 h-8 rounded-xl bg-sevchik-cream flex items-center justify-center text-sm" style={{ boxShadow: '0 2px 6px rgba(0,0,0,0.05)' }}>
              {emoji}
            </div>
          ))}
        </div>
      </div>
      <button
        onClick={() => window.dispatchEvent(new CustomEvent('sevchik-navigate', { detail: 'search' }))}
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