import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { QLogo } from '@/components/QLogo';

interface LoginProps {
  onLogin: () => void;
  onRegister: () => void;
}

export function Login({ onLogin, onRegister }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Здесь будет логика входа через Supabase
    onLogin();
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    // Здесь будет логика отправки письма через Supabase
    alert(`Ссылка для сброса пароля отправлена на ${resetEmail}`);
    setShowForgotPassword(false);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden" style={{ background: 'radial-gradient(circle at 50% 50%, #FFF8ED 0%, #FFF0DB 100%)' }}>
      {/* Декоративные фоновые пятна */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#6546C7]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-[#FF9848]/10 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md relative z-10"
      >
        {/* Карточка входа с "пластиковым" эффектом */}
        <div 
          className="bg-white rounded-[32px] p-8 relative overflow-hidden"
          style={{ 
            boxShadow: '0 20px 40px rgba(101, 70, 199, 0.12), 0 1px 3px rgba(0,0,0,0.05)',
            backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 40%)'
          }}
        >
          {/* Логотип */}
          <div className="flex flex-col items-center mb-8">
            <QLogo size={64} />
            <h1 className="font-heading font-extrabold text-2xl text-[#1A1A1A] mt-4 tracking-tight">
              {showForgotPassword ? 'Восстановление' : 'Добро пожаловать'}
            </h1>
            <p className="text-[#6B7280] text-sm mt-1 text-center font-body">
              {showForgotPassword ? 'Введите email, привязанный к аккаунту' : 'Войдите в свой аккаунт SevQ'}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {!showForgotPassword ? (
              <motion.form
                key="login-form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleLogin}
                className="space-y-5"
              >
                {/* Поле Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#6B7280] uppercase tracking-wider ml-1">Email</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280] group-focus-within:text-[#6546C7] transition-colors" size={20} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-[#F9FAFB] border-2 border-transparent focus:border-[#6546C7]/30 focus:bg-white outline-none transition-all font-body text-[#1A1A1A] placeholder:text-[#9CA3AF]"
                    />
                  </div>
                </div>

                {/* Поле Пароль */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#6B7280] uppercase tracking-wider ml-1">Пароль</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280] group-focus-within:text-[#6546C7] transition-colors" size={20} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full pl-12 pr-12 py-3.5 rounded-2xl bg-[#F9FAFB] border-2 border-transparent focus:border-[#6546C7]/30 focus:bg-white outline-none transition-all font-body text-[#1A1A1A] placeholder:text-[#9CA3AF]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6546C7] transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {/* КНОПКА "ЗАБЫЛИ ПАРОЛЬ?" - ИСПРАВЛЕННАЯ */}
                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-sm font-semibold text-[#6546C7] hover:text-[#4a32a0] hover:underline transition-all cursor-pointer bg-transparent border-none p-0 flex items-center gap-1 group"
                    style={{ zIndex: 20 }}
                  >
                    Забыли пароль?
                    <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                  </button>
                </div>

                {/* Кнопка входа */}
                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: '0 8px 20px rgba(101, 70, 199, 0.3)' }}
                  whileTap={{ scale: 0.98, y: 2 }}
                  type="submit"
                  className="w-full py-4 rounded-2xl text-white font-heading font-bold text-lg relative overflow-hidden mt-6"
                  style={{ 
                    background: 'linear-gradient(135deg, #8366D9 0%, #6546C7 100%)',
                    boxShadow: '0 4px 14px rgba(101, 70, 199, 0.25)'
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
                  <span className="relative z-10">Войти в SevQ</span>
                </motion.button>
              </motion.form>
            ) : (
              <motion.form
                key="reset-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleResetPassword}
                className="space-y-5"
              >
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#6B7280] uppercase tracking-wider ml-1">Email для восстановления</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280] group-focus-within:text-[#FF9848] transition-colors" size={20} />
                    <input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-[#F9FAFB] border-2 border-transparent focus:border-[#FF9848]/40 focus:bg-white outline-none transition-all font-body text-[#1A1A1A]"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => setShowForgotPassword(false)}
                    className="flex-1 py-3.5 rounded-2xl bg-[#F3F4F6] text-[#4B5563] font-heading font-bold hover:bg-[#E5E7EB] transition-colors"
                  >
                    Назад
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02, boxShadow: '0 8px 20px rgba(255, 152, 72, 0.3)' }}
                    whileTap={{ scale: 0.98, y: 2 }}
                    type="submit"
                    className="flex-1 py-3.5 rounded-2xl text-white font-heading font-bold relative overflow-hidden"
                    style={{ 
                      background: 'linear-gradient(135deg, #FFB87A 0%, #FF9848 100%)',
                      boxShadow: '0 4px 14px rgba(255, 152, 72, 0.25)'
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
                    <span className="relative z-10">Отправить</span>
                  </motion.button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Переключатель на регистрацию */}
          {!showForgotPassword && (
            <div className="mt-8 pt-6 border-t border-[#E5E7EB]/50 text-center">
              <p className="text-sm text-[#6B7280] font-body">
                Ещё нет аккаунта?{' '}
                <button
                  type="button"
                  onClick={onRegister}
                  className="font-bold text-[#6546C7] hover:text-[#4a32a0] hover:underline transition-all cursor-pointer bg-transparent border-none p-0"
                >
                  Создать SevQ
                </button>
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}