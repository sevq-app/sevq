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
import { ContactProfile } from '@/screens/ContactProfile';
import { ContactEdit } from '@/screens/ContactEdit';
import { MediaGallery } from '@/screens/MediaGallery';
import { Search } from '@/screens/Search';
import { Settings } from '@/screens/Settings';
import { Appearance } from '@/screens/Appearance';
import { Login, Register } from '@/screens/Login';
import type { Screen } from '@/data/mock';
import { supabase } from '@/lib/supabase';
import { useChatStore } from '@/store/chatStore';
import { useAutoReloadOnNewVersion } from '@/hooks/useAutoReloadOnNewVersion';

function App() {
  useAutoReloadOnNewVersion();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [profileData, setProfileData] = useState<any>({});
  const [screen, setScreen] = useState<Screen>('chats');
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const chats = useChatStore((s) => s.chats);
  const [fontSize, setFontSize] = useState<number>(16);
  const [themeMode, setThemeMode] = useState<'system' | 'light' | 'dark'>(() => {
    const saved = localStorage.getItem('sevchik_themeMode');
    return saved === 'light' || saved === 'dark' ? saved : 'system';
  });
  const [systemPrefersDark, setSystemPrefersDark] = useState<boolean>(() => {
    return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const grayMode = themeMode === 'dark' || (themeMode === 'system' && systemPrefersDark);
  const [selectedTheme, setSelectedTheme] = useState<string>(() => {
    const saved = localStorage.getItem('selectedTheme');
    return saved || 'spring';
  });
  const [soundsEnabled, setSoundsEnabled] = useState<boolean>(() => {
    return localStorage.getItem('sevchik_sounds') !== 'false';
  });
  const [hapticsEnabled, setHapticsEnabled] = useState<boolean>(() => {
    return localStorage.getItem('sevchik_haptics') !== 'false';
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

  // Восстановление темы при загрузке (не трогаем class gray-theme)
  useEffect(() => {
    const savedTheme = localStorage.getItem('selectedTheme') || 'spring';
    document.documentElement.classList.add(savedTheme);
    setSelectedTheme(savedTheme);
  }, []);

  // Применение тёмного/серого режима при изменении вычисленного значения
  useEffect(() => {
    document.documentElement.classList.toggle('gray-theme', grayMode);
  }, [grayMode]);

  // Слежение за системной темой (для режима "Системная")
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setSystemPrefersDark(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Сохранение темы при изменении
  useEffect(() => {
    localStorage.setItem('selectedTheme', selectedTheme);
  }, [selectedTheme]);

  // Сохранение режима оформления (системная/светлая/тёмная) при изменении
  useEffect(() => {
    localStorage.setItem('sevchik_themeMode', themeMode);
  }, [themeMode]);

  // Сохранение настроек звука и вибрации при изменении
  useEffect(() => {
    localStorage.setItem('sevchik_sounds', String(soundsEnabled));
  }, [soundsEnabled]);

  useEffect(() => {
    localStorage.setItem('sevchik_haptics', String(hapticsEnabled));
  }, [hapticsEnabled]);

  const handleOpenChat = (chatId: string) => {
    setActiveChatId(chatId);
    setScreen('conversation');
  };

  const handleWriteToName = (name: string) => {
    const chat = chats.find((c) => c.name === name);
    if (chat) {
      setActiveChatId(chat.id);
      setScreen('conversation');
    }
  };

  const handleOpenGroup = (groupName: string) => {
    setActiveGroup(groupName);
    setScreen('group');
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Ошибка при выходе:', error.message);
    }
    setCurrentUser(null);
    setProfileData({});
    setScreen('chats');
    setActiveChatId(null);
  };

  const handleTabNavigate = (tab: Screen) => {
    setScreen(tab);
  };

  const showTabBar = screen !== 'login' && screen !== 'conversation' && screen !== 'search' && screen !== 'settings' && screen !== 'appearance' && screen !== 'about' && screen !== 'photos' && screen !== 'my-groups' && screen !== 'group' && screen !== 'contact-profile' && screen !== 'contact-edit' && screen !== 'media-gallery';

  if (authLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[var(--bg-main)]">
        <span className="text-sevchik-text">Загрузка...</span>
      </div>
    );
  }

  if (!currentUser) {
    return authView === 'login' ? (
      <Login onLogin={() => {}} onRegister={() => setAuthView('register')} />
    ) : (
      <Register onRegister={() => setAuthView('login')} onLogin={() => setAuthView('login')} />
    );
  }

  return (
    <div className={`h-screen w-screen overflow-hidden ${grayMode ? 'gray-theme' : ''}`}>
      <div className="h-full w-full flex bg-[var(--bg-main)]">
        {showTabBar && <Sidebar current={screen} onNavigate={handleTabNavigate} grayMode={grayMode} />}
        <div className="h-full w-full flex flex-col overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={screen}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex-1 min-h-0 overflow-hidden"
          >
            {screen === 'chats' && (
              <Chats
                onOpenChat={handleOpenChat}
                grayMode={grayMode}
                fontSize={fontSize}
              />
            )}
            {screen === 'conversation' && activeChatId && (
              <Conversation
                chatId={activeChatId}
                onBack={() => setScreen('chats')}
                onOpenProfile={() => setScreen('contact-profile')}
                fontSize={fontSize}
                soundsEnabled={soundsEnabled}
                hapticsEnabled={hapticsEnabled}
              />
            )}
            {screen === 'contact-profile' && activeChatId && (
              <ContactProfile
                chatId={activeChatId}
                onBack={() => setScreen('conversation')}
                onEdit={() => setScreen('contact-edit')}
                onOpenMedia={() => setScreen('media-gallery')}
              />
            )}
            {screen === 'contact-edit' && activeChatId && (
              <ContactEdit chatId={activeChatId} onBack={() => setScreen('contact-profile')} />
            )}
            {screen === 'media-gallery' && activeChatId && (
              <MediaGallery chatId={activeChatId} onBack={() => setScreen('contact-profile')} />
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
              <Search onBack={() => setScreen('chats')} onWriteMessage={handleWriteToName} onOpenChat={handleOpenChat} />
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
                themeMode={themeMode}
                setThemeMode={setThemeMode}
                soundsEnabled={soundsEnabled}
                setSoundsEnabled={setSoundsEnabled}
                hapticsEnabled={hapticsEnabled}
                setHapticsEnabled={setHapticsEnabled}
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
