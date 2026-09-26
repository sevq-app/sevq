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
import { Settings } from '@/screens/Settings';
import { Appearance } from '@/screens/Appearance';
import { Login, Register } from '@/screens/Login';
import type { Screen } from '@/data/mock';
import { supabase } from '@/lib/supabase';
import { displayNameOf, initialsOf, listMyChats } from '@/lib/messagingService';
import { useChatStore } from '@/store/chatStore';
import { useAutoReloadOnNewVersion } from '@/hooks/useAutoReloadOnNewVersion';
import { messageGradientColors, messageThemeColors, setHexBrightness } from '@/lib/color';

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
  const upsertRealChat = useChatStore((s) => s.upsertRealChat);
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
  const [customColor, setCustomColor] = useState(() => localStorage.getItem('sevchik_customColor') || '#7C5CFC');
  const [customGradient, setCustomGradient] = useState(() => localStorage.getItem('sevchik_customGradient') !== 'false');
  const [colorBrightness, setColorBrightness] = useState(() => Number(localStorage.getItem('sevchik_colorBrightness')) || 100);
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

  // Подгружаем уже существующие реальные чаты пользователя при входе — иначе
  // они попадали бы в список только после клика по результату поиска, и
  // при каждой перезагрузке страницы (стор чатов не персистится) пропадали
  // бы из интерфейса, хотя сами данные в Supabase остаются на месте.
  useEffect(() => {
    if (!currentUser?.id) return;
    let cancelled = false;
    listMyChats()
      .then((summaries) => {
        if (cancelled) return;
        for (const summary of summaries) {
          const name = displayNameOf(summary.profile);
          upsertRealChat({
            id: `real-${summary.chatId}`,
            name,
            initials: initialsOf(name),
            lastMessage: summary.lastMessageText ?? '',
            time: summary.lastMessageAt
              ? new Date(summary.lastMessageAt).toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })
              : '',
            unread: 0,
            online: false,
            isReal: true,
            remoteChatId: summary.chatId,
            remoteUserId: summary.profile.id,
            messages: [],
          });
        }
      })
      .catch((error) => console.error('Не удалось загрузить список чатов:', error));
    return () => {
      cancelled = true;
    };
  }, [currentUser, upsertRealChat]);

  // Применение выбранной цветовой темы к <html> (не трогаем class gray-theme).
  // Раньше класс темы выставлялся только один раз при монтировании (из
  // localStorage) и никогда не обновлялся при смене темы в «Оформлении» —
  // setSelectedTheme() исправно менял React state и localStorage, но ни один
  // эффект не реагировал на само изменение selectedTheme, поэтому CSS-класс
  // на <html> оставался прежним и переменные (--theme-primary и т.д., от
  // которых зависит цвет облачек сообщений) не менялись до перезагрузки
  // страницы — да и то не менялись, ведь старый класс от предыдущей темы
  // тоже никогда не удалялся. Теперь эффект зависит от selectedTheme: удаляет
  // все возможные классы тем и добавляет текущую — применяется сразу и при
  // монтировании, и при каждой смене темы.
  useEffect(() => {
    const THEME_CLASSES = ['spring', 'summer', 'autumn', 'winter', 'aurora', 'sea'];
    document.documentElement.classList.remove(...THEME_CLASSES);
    document.documentElement.classList.add(selectedTheme);
  }, [selectedTheme]);

  // Градиент и яркость едины для шести готовых тем и пользовательского цвета.
  // Направление всегда горизонтальное: тёмный оттенок слева, светлый справа.
  useEffect(() => {
    const root = document.documentElement;
    const palette = messageThemeColors[selectedTheme];
    const colors = palette ?? messageGradientColors(customColor);
    const primary = setHexBrightness(colors.primary, colorBrightness);
    const dark = setHexBrightness(colors.dark, colorBrightness);
    const light = setHexBrightness(colors.light, colorBrightness);
    const rgb = [1, 3, 5].map((index) => parseInt(primary.slice(index, index + 2), 16)).join(', ');
    root.style.setProperty('--theme-primary', primary);
    root.style.setProperty('--theme-primary-rgb', rgb);
    root.style.setProperty('--theme-message-gradient', primary);
    root.style.setProperty('--bubble-outgoing-gradient', customGradient
      ? `linear-gradient(90deg, ${dark} 0%, ${primary} 46%, ${light} 100%)`
      : primary);
  }, [selectedTheme, customColor, customGradient, colorBrightness]);

  // Применение тёмного/серого режима при изменении вычисленного значения
  useEffect(() => {
    document.documentElement.classList.toggle('gray-theme', grayMode);
  }, [grayMode]);

  // Цвет статус-бара (Android, и адресной строки в мобильном Safari) должен совпадать
  // с реально активной темой приложения, а не только с системной (prefers-color-scheme) —
  // у приложения свой переключатель темы на экране «Оформление», который может отличаться
  // от настроек устройства. Значения — те же, что у --bg-main в src/index.css.
  useEffect(() => {
    const meta = document.getElementById('theme-color-meta');
    if (meta) {
      meta.setAttribute('content', grayMode ? '#24272b' : '#F4F1FF');
    }
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

  useEffect(() => {
    localStorage.setItem('sevchik_customColor', customColor);
    localStorage.setItem('sevchik_customGradient', String(customGradient));
    localStorage.setItem('sevchik_colorBrightness', String(colorBrightness));
  }, [customColor, customGradient, colorBrightness]);

  // Для авторизованного пользователя эти настройки также являются частью
  // профиля и восстанавливаются на другом устройстве.
  useEffect(() => {
    const appearance = currentUser?.user_metadata?.appearance;
    if (!appearance) return;
    if (typeof appearance.customColor === 'string' && /^#[0-9a-f]{6}$/i.test(appearance.customColor)) {
      setCustomColor(appearance.customColor);
    }
    if (typeof appearance.customGradient === 'boolean') setCustomGradient(appearance.customGradient);
    if (typeof appearance.colorBrightness === 'number') setColorBrightness(appearance.colorBrightness);
    if (typeof appearance.selectedTheme === 'string') setSelectedTheme(appearance.selectedTheme);
  }, [currentUser?.id]);

  useEffect(() => {
    if (!currentUser?.id) return;
    const timeout = window.setTimeout(() => {
      void supabase.auth.updateUser({
        data: { appearance: { selectedTheme, customColor, customGradient, colorBrightness } },
      });
    }, 800);
    return () => window.clearTimeout(timeout);
  }, [currentUser?.id, selectedTheme, customColor, customGradient, colorBrightness]);

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

  const showTabBar = screen !== 'login' && screen !== 'conversation' && screen !== 'settings' && screen !== 'appearance' && screen !== 'about' && screen !== 'photos' && screen !== 'my-groups' && screen !== 'group' && screen !== 'contact-profile' && screen !== 'contact-edit' && screen !== 'media-gallery';

  if (authLoading) {
    return (
      <div className="app-shell w-screen flex items-center justify-center bg-[var(--bg-main)]">
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
    // .app-shell (не Tailwind h-dvh) — если у dvh на конкретной версии iOS в
    // режиме «На экран Домой» есть расхождение с реальной высотой экрана,
    // оно проявится именно на этом уровне и обрежет всё дерево ниже, даже
    // если html/body/#root выше по цепочке уже посчитаны правильно. Три
    // слоя высоты (см. .app-shell в src/index.css) страхуют друг друга.
    <div className={`app-shell w-screen overflow-hidden bg-[var(--bg-main)] ${grayMode ? 'gray-theme' : ''}`}>
      <div className="h-full w-full flex bg-[var(--bg-main)]">
        {showTabBar && <Sidebar current={screen} onNavigate={handleTabNavigate} grayMode={grayMode} />}
        <div className="h-full w-full flex flex-col overflow-hidden" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
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
                customColor={customColor}
                setCustomColor={setCustomColor}
                customGradient={customGradient}
                setCustomGradient={setCustomGradient}
                colorBrightness={colorBrightness}
                setColorBrightness={setColorBrightness}
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
