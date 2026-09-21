import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, User, Loader2 } from 'lucide-react';
import { QLogo } from '@/components/QLogo';
import { supabase } from '@/lib/supabase';

interface AuthProps {
  onLogin: () => void;
  onRegister: () => void;
}

export function Login({ onLogin, onRegister }: AuthProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setError(error.message === 'Invalid login credentials' 
        ? 'Неверный email или пароль' 
        : error.message);
      setLoading(false);
    } else {
      onLogin();
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: window.location.origin,
    });
    if (error) {
      setError(error.message);
    } else {
      setSuccessMessage('Ссылка для сброса пароля отправлена на ваш email!');
    }
    setLoading(false);
  };

  return (
    <AuthLayout 
      title={showForgotPassword ? 'Восстановление' : 'Добро пожаловать'} 
      subtitle={showForgotPassword ? 'Введите email, привязанный к аккаунту' : 'Войдите в свой аккаунт Севчик'}
    >
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
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-body">
                {error}
              </div>
            )}
            <InputField icon={Mail} label="Email" type="email" value={email} onChange={setEmail} placeholder="your@email.com" />
            
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
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6546C7] transition-colors cursor-pointer">
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            <div className="flex justify-end pt-1">
              <button type="button" onClick={() => setShowForgotPassword(true)} className="text-sm font-semibold text-[#6546C7] hover:text-[#4a32a0] hover:underline transition-all cursor-pointer bg-transparent border-none p-0 flex items-center gap-1 group" style={{ zIndex: 20 }}>
                Забыли пароль? <span className="group-hover:translate-x-0.5 transition-transform">→</span>
              </button>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98, y: 2 }}
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl text-white font-heading font-bold text-lg relative overflow-hidden mt-6 disabled:opacity-70 disabled:cursor-not-allowed"
              style={{ 
                background: 'linear-gradient(135deg, #8366D9 0%, #6546C7 100%)',
                boxShadow: '0 4px 14px rgba(101, 70, 199, 0.25)'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading && <Loader2 className="animate-spin" size={20} />}
                {loading ? 'Вход...' : 'Войти в Севчик'}
              </span>
            </motion.button>
            <div className="mt-6 pt-6 border-t border-[#E5E7EB]/50 text-center">
              <p className="text-sm text-[#6B7280] font-body">
                Ещё нет аккаунта?{' '}
                <button type="button" onClick={onRegister} className="font-bold text-[#6546C7] hover:text-[#4a32a0] hover:underline transition-all cursor-pointer bg-transparent border-none p-0">
                  Создать Севчик
                </button>
              </p>
            </div>
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
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-body">
                {error}
              </div>
            )}
            {successMessage && (
              <div className="p-3 rounded-xl bg-green-50 border border-green-200 text-green-600 text-sm font-body">
                {successMessage}
              </div>
            )}
            <InputField icon={Mail} label="Email для восстановления" type="email" value={resetEmail} onChange={setResetEmail} placeholder="your@email.com" accentColor="#FF9848" />
            <div className="flex gap-3 pt-2">
              <SecondaryButton text="Назад" onClick={() => { setShowForgotPassword(false); setError(''); setSuccessMessage(''); }} />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98, y: 2 }}
                type="submit"
                disabled={loading}
                className="flex-1 py-3.5 rounded-2xl text-white font-heading font-bold relative overflow-hidden disabled:opacity-70"
                style={{ 
                  background: 'linear-gradient(135deg, #FFB87A 0%, #FF9848 100%)',
                  boxShadow: '0 4px 14px rgba(255, 152, 72, 0.25)'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading && <Loader2 className="animate-spin" size={18} />}
                  {loading ? 'Отправка...' : 'Отправить'}
                </span>
              </motion.button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </AuthLayout>
  );
}

export function Register({ onRegister, onLogin }: AuthProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
      },
    });
    if (error) {
      setError(error.message === 'User already registered' 
        ? 'Пользователь с таким email уже существует' 
        : error.message);
      setLoading(false);
    } else {
      onRegister();
    }
  };

  return (
    <AuthLayout title="Создать аккаунт" subtitle="Присоединяйтесь к уютному миру Севчик">
      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        onSubmit={handleRegister}
        className="space-y-5"
      >
        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-body">
            {error}
          </div>
        )}
        <InputField icon={User} label="Имя" type="text" value={name} onChange={setName} placeholder="Как вас зовут?" />
        <InputField icon={Mail} label="Email" type="email" value={email} onChange={setEmail} placeholder="your@email.com" />
        <InputField icon={Lock} label="Пароль" type="password" value={password} onChange={setPassword} placeholder="Минимум 6 символов" />
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98, y: 2 }}
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-2xl text-white font-heading font-bold text-lg relative overflow-hidden mt-6 disabled:opacity-70"
          style={{ 
            background: 'linear-gradient(135deg, #8366D9 0%, #6546C7 100%)',
            boxShadow: '0 4px 14px rgba(101, 70, 199, 0.25)'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
          <span className="relative z-10 flex items-center justify-center gap-2">
            {loading && <Loader2 className="animate-spin" size={20} />}
            {loading ? 'Создание...' : 'Зарегистрироваться'}
          </span>
        </motion.button>
        <div className="mt-6 pt-6 border-t border-[#E5E7EB]/50 text-center">
          <p className="text-sm text-[#6B7280] font-body">
            Уже есть аккаунт?{' '}
            <button type="button" onClick={onLogin} className="font-bold text-[#6546C7] hover:text-[#4a32a0] hover:underline transition-all cursor-pointer bg-transparent border-none p-0">
              Войти
            </button>
          </p>
        </div>
      </motion.form>
    </AuthLayout>
  );
}

// --- Вспомогательные компоненты ---
function AuthLayout({ children, title, subtitle }: { children: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden" style={{ background: 'radial-gradient(circle at 50% 50%, #FFF8ED 0%, #FFF0DB 100%)' }}>
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#6546C7]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-[#FF9848]/10 rounded-full blur-3xl" />
      <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="w-full max-w-md relative z-10">
        <div className="bg-white rounded-[32px] p-8 relative overflow-hidden" style={{ boxShadow: '0 20px 40px rgba(15,23,42,0.1), 0 1px 3px rgba(0,0,0,0.05)' }}>
          <div className="flex flex-col items-center mb-8">
            <QLogo size={64} />
            <h1 className="font-heading font-extrabold text-2xl text-[#1A1A1A] mt-4 tracking-tight">{title}</h1>
            <p className="text-[#6B7280] text-sm mt-1 text-center font-body">{subtitle}</p>
          </div>
          {children}
        </div>
      </motion.div>
    </div>
  );
}

function InputField({ icon: Icon, label, type, value, onChange, placeholder, accentColor = '#6546C7' }: any) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-[#6B7280] uppercase tracking-wider ml-1">{label}</label>
      <div className="relative group">
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280] group-focus-within:text-[#6546C7] transition-colors" size={20} />
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required
          className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-[#F9FAFB] border-2 border-transparent focus:border-[#6546C7]/30 focus:bg-white outline-none transition-all font-body text-[#1A1A1A] placeholder:text-[#9CA3AF]"
        />
      </div>
    </div>
  );
}

function SecondaryButton({ text, onClick }: any) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      type="button"
      onClick={onClick}
      className="flex-1 py-3.5 rounded-2xl bg-[#F3F4F6] text-[#4B5563] font-heading font-bold hover:bg-[#E5E7EB] transition-colors"
    >
      {text}
    </motion.button>
  );
}