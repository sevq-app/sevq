import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TabBar, Sidebar } from '@/components/Navigation';
import { Chats } from '@/screens/Chats';
import { Conversation } from '@/screens/Conversation';
import { Friends } from '@/screens/Friends';
import { Calls } from '@/screens/Calls';
import { Clubs } from '@/screens/Clubs';
import { Profile } from '@/screens/Profile';
import { AboutMe } from '@/screens/AboutMe';
import { Photos } from '@/screens/Photos';
import { MyGroups } from '@/screens/MyGroups';
import { Group } from '@/screens/Group';
import { Search } from '@/screens/Search';
import { Settings } from '@/screens/Settings';
import { Appearance } from '@/screens/Appearance';
import { Login } from '@/screens/Login';
import type { Chat, Screen } from '@/data/mock';
import { chats } from '@/data/mock';
import { supabase } from '@/lib/supabase';

function App() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [profileData, setProfileData] = useState<any>({});
  const [screen, setScreen] = useState<Screen>('chats');
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState<number>(15);
  const [grayMode, setGrayMode] = useState<boolean>(false);
  const [selectedTheme, setSelectedTheme] = useState<string>(() => {
    const saved = localStorage.getItem('selectedTheme');
    return saved || 'spring';
  });

  // Проверка текущей сессии Supabase при загрузке приложения
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setCurrentUser(data.session?.user ?? null);
      setAuthLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user ?? null);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // Восстановление темы при загрузке
  useEffect(() => {
    const savedTheme = localStorage.getItem('selectedTheme');
    if (savedTheme) {
      document.documentElement.className = savedTheme;
      setSelectedTheme(savedTheme);
    } else {
      document.documentElement.className = 'spring';
    }
  }, []);

  // Сохранение темы при изменении
  useEffect(() => {
    localStorage.setItem('selectedTheme', selectedTheme);
  }, [selectedTheme]);

  const handleOpenChat = (chat: Chat) => {
    setActiveChat(chat);
    setScreen('conversation');
  };

  const handleSearchWrite = (chat: Chat) => {
    setActiveChat(chat);
    setScreen('conversation');
  };

  const handleWriteToName = (name: string) => {
    const chat = chats.find((c) => c.name === name);
    if (chat) {
      setActiveChat(chat);
      setScreen('conversation');
    }
  };

  const handleOpenGroup = (groupName: string) => {
    setActiveGroup(groupName);
    setScreen('group');
  };

  const handleLogout = () => {
    supabase.auth.signOut();
    setCurrentUser(null);
    setProfileData({});
    setScreen('chats');
    setActiveChat(null);
  };

  const updateGrayMode = (value: boolean) => {
    setGrayMode(value);
    if (value) {
      document.documentElement.classList.add('gray-theme');
    } else {
      document.documentElement.classList.remove('gray-theme');
    }
  };

  const handleTabNavigate = (tab: Screen) => {
    setScreen(tab);
  };

  const showTabBar = screen !== 'login' && screen !== 'conversation' && screen !== 'search' && screen !== 'settings' && screen !== 'appearance' && screen !== 'about' && screen !== 'photos' && screen !== 'my-groups' && screen !== 'group';

  if (authLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[var(--bg-main)]">
        <span className="text-sevchik-text">Загрузка...</span>
      </div>
    );
  }

  if (!currentUser) {
    return <Login onLogin={() => {}} onRegister={() => {}} />;
  }

  return (
    <div className={`h-screen w-screen overflow-hidden ${grayMode ? 'gray-theme' : ''}`}>
      <div className="h-full w-full flex bg-[var(--bg-main)]">
        {showTabBar && <Sidebar current={screen} onNavigate={handleTabNavigate} />}
        <div className="h-full w-full flex flex-col overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={screen}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex-1 overflow-hidden"
          >
            {screen === 'chats' && (
              <Chats
                onOpenChat={handleOpenChat}
                grayMode={grayMode}
                fontSize={fontSize}
              />
            )}
            {screen === 'conversation' && activeChat && (
              <Conversation chat={activeChat} onBack={() => setScreen('chats')} fontSize={fontSize} />
            )}
            {screen === 'contacts' && <Friends onWriteMessage={handleWriteToName} />}
            {screen === 'calls' && <Calls onNavigate={setScreen} />}
            {screen === 'clubs' && <Clubs onOpenClub={() => {}} />}
            {screen === 'profile' && <Profile user={currentUser} profileData={profileData} onNavigate={setScreen} />}
            {screen === 'about' && <AboutMe user={currentUser} setProfileData={setProfileData} onBack={() => setScreen('profile')} />}
            {screen === 'photos' && <Photos onBack={() => setScreen('profile')} />}
            {screen === 'my-groups' && <MyGroups groups={[]} onBack={() => setScreen('profile')} onOpenGroup={handleOpenGroup} />}
            {screen === 'group' && activeGroup && <Group name={activeGroup} onBack={() => setScreen('my-groups')} />}
            {screen === 'search' && (
              <Search onBack={() => setScreen('chats')} onWriteMessage={handleWriteToName} />
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

        {showTabBar && <TabBar current={screen} onNavigate={handleTabNavigate} />}
        </div>
      </div>
    </div>
  );
}

export default App;
