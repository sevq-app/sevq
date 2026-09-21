import { useState, useEffect } from 'react'; 
import { AnimatePresence, motion } from 'framer-motion';
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
import { AboutMe, type ProfileData } from '@/screens/AboutMe';
import { Photos } from '@/screens/Photos';
import { MyGroups } from '@/screens/MyGroups';
import { Group } from '@/screens/Group';
import { StartChat } from '@/screens/StartChat';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';
import type { Screen, Chat } from '@/data/mock';

function App() {
  const [screen, setScreen] = useState<Screen>('login');
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [profileData, setProfileData] = useState<ProfileData>(() => {
    try {
      return JSON.parse(localStorage.getItem('sevchik-profile-data') || '{}') as ProfileData;
    } catch {
      return {} as ProfileData;
    }
  });
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
        
        // Проверяем, есть ли сохранённая переписка в sessionStorage
        const savedChat = sessionStorage.getItem('sevchik-active-chat');
        if (savedChat) {
          try {
            const chat = JSON.parse(savedChat) as Chat;
            setActiveChat(chat);
            setScreen('conversation');
          } catch {
            setScreen('chats');
          }
        } else {
          setScreen('chats');
        }
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
        
        // Проверяем sessionStorage при изменении состояния авторизации
        const savedChat = sessionStorage.getItem('sevchik-active-chat');
        if (savedChat) {
          try {
            const chat = JSON.parse(savedChat) as Chat;
            setActiveChat(chat);
            setScreen('conversation');
          } catch {
            setScreen('chats');
          }
        } else {
          setScreen('chats');
        }
      } else {
        setCurrentUser(null);
        setScreen('login');
        sessionStorage.removeItem('sevchik-active-chat');
      }
    });
    
    return () => subscription.unsubscribe();
  }, []);

  const handleOpenChat = (chat: Chat) => {
    setActiveChat(chat);
    setScreen('conversation');
    // Сохраняем в sessionStorage для восстановления при переключении вкладок
    sessionStorage.setItem('sevchik-active-chat', JSON.stringify(chat));
  };

  const handleBackFromChat = () => {
    setActiveChat(null);
    setScreen('chats');
    // Очищаем sessionStorage при выходе из переписки
    sessionStorage.removeItem('sevchik-active-chat');
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
    sessionStorage.setItem('sevchik-active-chat', JSON.stringify(chat));
  };

  const handleOpenGroup = (groupName: string) => {
    setActiveGroup(groupName);
    setScreen('group');
  };

  const handleLogout = () => {
    supabase.auth.signOut();
    setScreen('login');
    setActiveChat(null);
    sessionStorage.removeItem('sevchik-active-chat');
  };

  const handleTabNavigate = (tab: Screen) => {
    // Если переключаемся на chats и есть активная переписка — показываем её
    if (tab === 'chats' && activeChat) {
      setScreen('conversation');
    } else {
      setScreen(tab);
    }
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
    <div className="flex h-screen overflow-hidden">
      <Sidebar current={screen} onNavigate={handleTabNavigate} />
      <div className="flex-1 min-w-0 flex h-screen overflow-hidden">
        <div className="flex-1 min-w-0 h-full overflow-hidden">
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
                <Chats 
                  onOpenChat={handleOpenChat} 
                  onStartChat={() => setScreen('start-chat')} 
                  grayMode={grayMode} 
                  fontSize={fontSize} 
                />
              )}
              {screen === 'start-chat' && (
                <StartChat onBack={() => setScreen('chats')} />
              )}
              {screen === 'conversation' && activeChat && (
                <Conversation chat={activeChat} onBack={handleBackFromChat} fontSize={fontSize} />
              )}
              {screen === 'contacts' && <Friends onWriteMessage={handleSearchWrite} />}
              {screen === 'calls' && <Calls onNavigate={setScreen} />}
              {screen === 'clubs' && <Clubs onOpenClub={() => {}} />}
              {screen === 'profile' && <Profile user={currentUser} profileData={profileData} onNavigate={setScreen} />}
              {screen === 'about' && <AboutMe user={currentUser} setProfileData={setProfileData} onBack={() => setScreen('profile')} />}
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
      </div>
      {showTabBar && <TabBar current={screen} onNavigate={handleTabNavigate} />}
    </div>
  );
}

export default App;
