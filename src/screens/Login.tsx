import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, User, AtSign } from 'lucide-react';
import { QLogo } from '@/components/QLogo';

interface LoginProps {
  onLogin: () => void;
  onRegister: () => void;
}

export function Login({ onLogin, onRegister }: LoginProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm"
      >
        <div className="flex flex-col items-center mb-8">
          <QLogo size={80} animate />
          <h1 className="font-heading font-extrabold text-3xl mt-4">SevQ</h1>
          <p className="text-sevq-textSecondary text-sm mt-1 font-body">Твой маленький большой мир</p>
        </div>

        <div className="bg-white rounded-card p-6 sm:p-8 plastic-card" style={{ boxShadow: '0 12px 40px rgba(101,70,199,0.1)' }}>
          <div className="space-y-4 relative z-10">
            <div>
              <label className="block text-sm font-heading font-bold text-sevq-text mb-1.5">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sevq-textSecondary/50" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full bg-sevq-cream/50 rounded-btn border-0 py-3 pl-11 pr-4 text-sevq-text placeholder:text-sevq-textSecondary/50 focus:outline-none focus:ring-2 focus:ring-sevq-purple/30 font-body text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-heading font-bold text-sevq-text mb-1.5">Пароль</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sevq-textSecondary/50" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full bg-sevq-cream/50 rounded-btn border-0 py-3 pl-11 pr-11 text-sevq-text placeholder:text-sevq-textSecondary/50 focus:outline-none focus:ring-2 focus:ring-sevq-purple/30 font-body text-sm"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sevq-textSecondary/50 hover:text-sevq-text"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex justify-end relative z-20">
              <button
                type="button"
                onClick={() => alert('Функция восстановления пароля')}
                className="text-sevq-purple text-sm font-body font-medium bg-transparent hover:underline cursor-pointer"
              >
                Забыли пароль?
              </button>
            </div>

            <motion.button
              whileTap={{ scale: 0.98, y: 2 }}
              onClick={onLogin}
              className="w-full text-white font-heading font-extrabold text-base py-3.5 rounded-btn btn-3d relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #FFB87A, #FF9848)', boxShadow: '0 6px 20px rgba(255,152,72,0.35)' }}
            >
              <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.2) 0%, transparent 50%)' }} />
              <span className="relative z-10">Войти</span>
            </motion.button>
          </div>
        </div>

        <p className="text-center mt-6 text-sevq-textSecondary text-sm font-body">
          Нет аккаунта?{' '}
          <button onClick={onRegister} className="text-sevq-purple font-heading font-bold hover:underline">
            Зарегистрироваться
          </button>
        </p>
      </motion.div>
    </div>
  );
}

interface RegisterProps {
  onRegister: () => void;
  onLogin: () => void;
}

export function Register({ onRegister, onLogin }: RegisterProps) {
  const [showPassword, setShowPassword] = useState(false);

  const fields = [
    { label: 'Имя', icon: User, placeholder: 'Александр', type: 'text' },
    { label: 'Ник', icon: AtSign, placeholder: 'alex_v', type: 'text' },
    { label: 'Email', icon: Mail, placeholder: 'you@example.com', type: 'email' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm"
      >
        <div className="flex flex-col items-center mb-6">
          <QLogo size={72} animate />
          <h1 className="font-heading font-extrabold text-2xl mt-3">Создать аккаунт</h1>
        </div>

        <div className="bg-white rounded-card p-6 sm:p-8 plastic-card" style={{ boxShadow: '0 12px 40px rgba(101,70,199,0.1)' }}>
          <div className="space-y-3.5 relative z-10">
            {fields.map(({ label, icon: Icon, placeholder, type }) => (
              <div key={label}>
                <label className="block text-sm font-heading font-bold text-sevq-text mb-1.5">{label}</label>
                <div className="relative">
                  <Icon size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sevq-textSecondary/50" />
                  <input
                    type={type}
                    placeholder={placeholder}
                    className="w-full bg-sevq-cream/50 rounded-btn border-0 py-3 pl-11 pr-4 text-sevq-text placeholder:text-sevq-textSecondary/50 focus:outline-none focus:ring-2 focus:ring-sevq-purple/30 font-body text-sm"
                  />
                </div>
              </div>
            ))}

            <div>
              <label className="block text-sm font-heading font-bold text-sevq-text mb-1.5">Пароль</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sevq-textSecondary/50" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full bg-sevq-cream/50 rounded-btn border-0 py-3 pl-11 pr-11 text-sevq-text placeholder:text-sevq-textSecondary/50 focus:outline-none focus:ring-2 focus:ring-sevq-purple/30 font-body text-sm"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sevq-textSecondary/50 hover:text-sevq-text"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-heading font-bold text-sevq-text mb-1.5">Повторить пароль</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sevq-textSecondary/50" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full bg-sevq-cream/50 rounded-btn border-0 py-3 pl-11 pr-4 text-sevq-text placeholder:text-sevq-textSecondary/50 focus:outline-none focus:ring-2 focus:ring-sevq-purple/30 font-body text-sm"
                />
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.98, y: 2 }}
              onClick={onRegister}
              className="w-full text-white font-heading font-extrabold text-base py-3.5 rounded-btn btn-3d relative overflow-hidden mt-2"
              style={{ background: 'linear-gradient(135deg, #FFB87A, #FF9848)', boxShadow: '0 6px 20px rgba(255,152,72,0.35)' }}
            >
              <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.2) 0%, transparent 50%)' }} />
              <span className="relative z-10">Зарегистрироваться</span>
            </motion.button>
          </div>
        </div>

        <p className="text-center mt-5 text-sevq-textSecondary text-sm font-body">
          Уже есть аккаунт?{' '}
          <button onClick={onLogin} className="text-sevq-purple font-heading font-bold hover:underline">
            Войти
          </button>
        </p>
      </motion.div>
    </div>
  );
}
