import { motion } from 'framer-motion';
import { MessageCircle, Users, Phone, User } from 'lucide-react';
// Иконки только для нижней (мобильной) навигации — финальный смешанный стиль:
// там, где иконка = человечек (голова + тело), голова залита сплошным цветом,
// тело/линии — тонким контуром (Контакты, Севчик — кастомные компоненты из
// TabBarIcons.tsx: контур weight="regular" + голова из weight="duotone", оба —
// точные path из библиотеки, см. файл). Там, где иконка = один символ без
// отдельной "головы" (трубка, облачко) — залита целиком, чтобы по плотности
// не выбивалась из общего ряда.
// PhoneCall (Phosphor, weight="fill") — тот же силуэт трубки, что и Phone, но
// с волнами сбоку (эффект "звонок идёт") — часть самого SVG-глифа иконки, не
// отдельный элемент; на weight="fill" волны заливаются тем же цветом, что и
// трубка.
// Чаты — ChatBubbleOvalLeft из Heroicons (solid), не Phosphor: после
// нескольких раундов (ChatCircle/ChatCircleDots — слишком толстый хвост,
// ChatTeardrop — бесформенная капля) у Phosphor не нашлось варианта с
// аккуратным тонким хвостиком слева-снизу, а у Heroicons он ровно такой.
// ChatsHeroIcon в TabBarIcons.tsx — тонкая обёртка под тот же вызов
// (size/weight), что у остальных трёх иконок.
// Остальные иконки в приложении (сайдбар, карточки, кнопки) специально не
// трогали — задача касалась только нижней панели.
import { PhoneCall, type Icon as PhosphorIcon } from '@phosphor-icons/react';
import { ContactsHybridIcon, SevchikHybridIcon, ChatsHeroIcon } from './TabBarIcons';
import { QLogo } from './QLogo';
import { useChatStore } from '@/store/chatStore';
import type { Screen } from '@/data/mock';

interface SidebarProps {
  current: Screen;
  onNavigate: (s: Screen) => void;
  grayMode?: boolean;
}

// НОВЫЙ ПОРЯДОК: Контакты → Звонки → Чаты → Мой Севчик
const navItems: { key: Screen; label: string; icon: React.ElementType }[] = [
  { key: 'contacts', label: 'Контакты', icon: Users },
  { key: 'calls', label: 'Звонки', icon: Phone },
  { key: 'chats', label: 'Чаты', icon: MessageCircle },
  { key: 'profile', label: 'Мой Севчик', icon: User },
];

export function Sidebar({ current, onNavigate, grayMode = false }: SidebarProps) {
  return (
    <div className="hidden md:flex flex-col w-20 lg:w-64 py-6 px-3 shrink-0 h-screen sticky top-0 z-30">
      <div className="mb-8 flex items-center gap-3 px-2">
        <QLogo size={44} animate theme={grayMode ? 'dark' : 'light'} />
        <span className="hidden lg:block font-heading font-extrabold text-2xl text-sevchik-text">Севчик</span>
      </div>
      <nav className="flex flex-col gap-2.5 flex-1">
        {navItems.map(({ key, label, icon: Icon }) => {
          const active = current === key;
          return (
            <motion.button
              key={key}
              whileTap={{ scale: 0.97, y: 2 }}
              whileHover={{ y: -2 }}
              onClick={() => onNavigate(key)}
              className={`flex items-center gap-4 px-5 py-3.5 rounded-btn transition-all relative overflow-hidden ${
                active ? 'text-white' : 'text-sevchik-textSecondary'
              }`}
              style={
                active
                  ? { background: '#6546C7', boxShadow: '0 6px 16px rgba(101,70,199,0.2)' }
                  : {
                      background: 'rgba(255,255,255,0.65)',
                      backdropFilter: 'blur(16px)',
                      WebkitBackdropFilter: 'blur(16px)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    }
              }
            >
              <Icon size={26} className="shrink-0 relative z-10" />
              <span className={`hidden lg:block font-heading font-bold text-lg relative z-10 ${active ? 'text-white' : ''}`}>{label}</span>
            </motion.button>
          );
        })}
      </nav>
    </div>
  );
}

interface TabBarProps {
  current: Screen;
  onNavigate: (s: Screen) => void;
}

export function TabBar({ current, onNavigate }: TabBarProps) {
  // НОВЫЙ ПОРЯДОК для мобильной версии. Иконки — гибридный стиль (см. импорты выше).
  const items: { key: Screen; label: string; icon: PhosphorIcon }[] = [
    { key: 'contacts', label: 'Контакты', icon: ContactsHybridIcon as unknown as PhosphorIcon },
    { key: 'calls', label: 'Звонки', icon: PhoneCall },
    { key: 'chats', label: 'Чаты', icon: ChatsHeroIcon as unknown as PhosphorIcon },
    { key: 'profile', label: 'Севчик', icon: SevchikHybridIcon as unknown as PhosphorIcon },
  ];

  // Суммарный бейдж непрочитанных на вкладке «Чаты» — то же число и тот же
  // стиль (сплошной кружок с цифрой), что и на бейджах отдельных чатов на
  // экране «Чаты» (см. Chats.tsx), только по всем чатам сразу.
  const totalUnread = useChatStore((s) => s.chats.reduce((sum, c) => sum + Math.max(c.unread, 0), 0));

  // Короткая тактильная вибрация на само нажатие (не только на смену вкладки) —
  // navigator.vibrate не поддерживается в PWA на iOS, поэтому вызов должен
  // молча ничего не делать там, где его нет, без ошибок в консоли.
  const handleTabTap = (key: Screen) => {
    try {
      navigator.vibrate?.(10);
    } catch {
      // на iOS/некоторых браузерах вызов может кидать исключение — игнорируем
    }
    onNavigate(key);
  };

  return (
    // Не position: fixed — намеренно: на iOS в режиме PWA «На экран Домой» «fixed» с
    // bottom: 0 привязывается к «безопасной» области экрана и НЕ дотягивается до
    // истинного нижнего края под домашней полоской жестов, даже с viewport-fit=cover и
    // 100dvh на предках — снизу оставалась чёрная полоса. Обычный поток (shrink-0
    // последний элемент в flex-col родителе из App.tsx) кладёт панель ровно там, где
    // реально заканчивается размеченный (100dvh) контейнер — без этой неоднозначности.
    //
    // Панель — «плавающая таблетка»: отступы слева/справа/снизу здесь, на прозрачной
    // обёртке — поэтому в них виден фон приложения (тот самый, который в предыдущих
    // правках уже доходит до истинного низа экрана), а не обрезанный угол панели.
    <div
      // Без бокового padding — ширину и центрирование капсулы целиком
      // задаёт сама капсула через max-width + margin: auto (см. ниже), а
      // не отступ обёртки.
      className="md:hidden shrink-0"
      // Капсула "парит" над нижним краем: сверх safe-area (полоска жестов
      // iOS) добавлен фиксированный зазор в 24px, чтобы под капсулой был
      // заметный воздух с фоном темы, а не панель впритык к краю экрана.
      style={{ paddingBottom: 'calc(max(0.75rem, env(safe-area-inset-bottom)) + 24px)' }}
    >
      <div
        className="relative flex items-stretch justify-around overflow-hidden rounded-full"
        style={{
          height: '76px',
          // Раньше ширину капсулы регулировали только боковым padding
          // обёртки (px-7) — на широких экранах эффект был почти незаметен
          // (padding маленький относительно ширины экрана). Теперь у
          // капсулы явный max-width + margin: auto — она превращается в
          // компактную центрированную "таблетку" независимо от ширины
          // экрана. min(320px, calc(100% - 32px)) — на обычных iPhone
          // упирается в 320px (заметные поля по бокам), а на совсем
          // маленьких экранах (iPhone SE и старее) гарантирует минимум 16px
          // отступа с каждой стороны вместо того, чтобы сжиматься дальше
          // вместе с шириной экрана (обычный процент от ширины делал бы
          // именно это).
          maxWidth: 'min(320px, calc(100% - 32px))',
          margin: '0 auto',
          background: 'var(--tabbar-surface-bg)',
          boxShadow: 'var(--tabbar-shadow)',
        }}
      >
        {items.map(({ key, label, icon: Icon }) => {
          const active = current === key;
          const badge = key === 'chats' ? totalUnread : 0;
          return (
            <motion.button
              key={key}
              whileTap={{ scale: 0.93 }}
              transition={{ type: 'spring', stiffness: 700, damping: 22, mass: 0.5 }}
              onClick={() => handleTabTap(key)}
              className="relative flex-1 flex flex-col items-center justify-center"
            >
              {active && (
                // Стеклянная "капля" ЛЕЖИТ ПОД иконкой и подписью (z-0, у них
                // z-10) — задача пилюли чисто декоративная: полупрозрачный
                // фон + backdrop-filter blur размывают то, что позади НЕЁ
                // САМОЙ (поверхность капсулы), а не иконку — иконка рисуется
                // отдельным непрозрачным слоем ПОВЕРХ и никогда не попадает
                // под blur/градиент пилюли. (Раньше пилюля лежала НАД
                // иконкой как "линза" — из-за этого сама иконка размывалась
                // и "засвечивалась" белым градиентом; так делать нельзя.)
                // layoutId — плавный перелёт между вкладками (не
                // исчезновение/появление). Двойная анимация: layout —
                // перелёт позиции (пружина с лёгким overshoot), scaleX/scaleY
                // — "поверхностное натяжение": капля растягивается по
                // горизонтали в полёте и сжимается обратно на месте
                // прибытия.
                <motion.div
                  layoutId="tabbar-active-pill"
                  className="absolute inset-1 rounded-full z-0 pointer-events-none"
                  style={{
                    background: 'var(--tabbar-active-bg)',
                    boxShadow: 'var(--tabbar-active-shadow)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                  }}
                  initial={false}
                  animate={{ scaleX: [1, 1.22, 1], scaleY: [1, 0.9, 1] }}
                  transition={{
                    layout: { type: 'spring', stiffness: 300, damping: 30, mass: 0.7 },
                    scaleX: { duration: 0.36, times: [0, 0.45, 1], ease: 'easeOut' },
                    scaleY: { duration: 0.36, times: [0, 0.45, 1], ease: 'easeOut' },
                  }}
                />
              )}
              <span className="relative z-10">
                <motion.span
                  className="inline-block"
                  animate={{ scale: active ? 1.07 : 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30, mass: 0.7 }}
                  style={{ display: 'inline-block' }}
                >
                  <Icon
                    size={28}
                    weight="fill"
                    className="transition-colors duration-200"
                    style={{ color: active ? 'var(--theme-primary)' : 'var(--text-secondary)' }}
                  />
                </motion.span>
                {badge > 0 && (
                  <span
                    className="absolute -top-1.5 -right-2 min-w-[18px] h-[18px] px-1 rounded-pill flex items-center justify-center text-white text-[10px] font-heading font-bold z-10"
                    style={{ background: '#6546C7', boxShadow: '0 3px 10px rgba(101,70,199,0.18)' }}
                  >
                    {badge > 99 ? '99+' : badge}
                  </span>
                )}
              </span>
              <span
                className="relative z-10 text-[14px] font-heading font-bold transition-colors duration-200 -mt-0.5"
                style={{ color: active ? 'var(--theme-primary)' : 'var(--text-secondary)' }}
              >
                {label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
