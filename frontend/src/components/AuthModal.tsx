import React, { useState } from 'react';
import { UserProfile } from '../types';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../api/client';
import { User, Lock, Eye, EyeOff, ArrowRight, X, CheckCircle, Loader2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onLogout: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, user, onLogout }) => {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setError(null);
    setIsSubmitting(true);
    try {
      if (isRegister) {
        await register(name, email, password);
      } else {
        await login(email, password);
      }
      setNotification(isRegister ? "Muvaffaqiyatli ro'yxatdan o'tdingiz!" : "Tizimga muvaffaqiyatli kirdingiz!");
      setTimeout(() => {
        setNotification(null);
        onClose();
      }, 1200);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Noma'lum xatolik yuz berdi");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md p-8 rounded-2xl glass-panel border border-[#4cd7f6]/30 hud-corner shadow-[0_0_40px_rgba(8,20,37,0.9)] text-[#d8e3fb]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* LOGGED IN USER VIEW */}
        {user.isLoggedIn ? (
          <div className="text-center space-y-6 py-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#4cd7f6]/20 border-2 border-[#4cd7f6] flex items-center justify-center text-[#4cd7f6] text-2xl font-bold">
              {user.name.charAt(0)}
            </div>
            <div>
              <h3 className="font-display text-2xl font-bold text-white">{user.name}</h3>
              <p className="text-sm text-slate-400 font-mono mt-1">{user.email}</p>
            </div>

            <div className="p-4 rounded-xl bg-[#111c2d] border border-white/10 text-left text-xs space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Status:</span>
                <span className="text-[#4cd7f6] font-bold">Faol O'quvchi</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Tarif:</span>
                <span className="text-emerald-400 font-bold">PRO Akkaunt</span>
              </div>
            </div>

            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="w-full py-3 rounded-xl bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30 font-bold transition-all"
            >
              Tizimdan chiqish (Logout)
            </button>
          </div>
        ) : (
          /* LOGIN / REGISTER FORM */
          <div>
            <div className="text-center mb-6">
              <h2 className="font-display text-3xl font-extrabold text-white tracking-tight">
                AVTO
              </h2>
              <p className="text-sm text-slate-300 mt-1 font-medium">
                {isRegister ? "Ro'yxatdan o'tish" : "Tizimga kirish"}
              </p>
            </div>

            {notification && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>{notification}</span>
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegister && (
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-300">
                    Ismingiz
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ismingizni kiriting"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white text-slate-900 font-medium placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#4cd7f6]"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-300">
                  Elektron pochta
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white text-slate-900 font-medium placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#4cd7f6]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-semibold text-slate-300">Parol</label>
                  {!isRegister && (
                    <button
                      type="button"
                      onClick={() => alert("Parolni tiklash havolasi pochtangizga yuborildi.")}
                      className="text-[#4cd7f6] hover:underline font-bold"
                    >
                      Parolni unutdingizmi?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white text-slate-900 font-medium placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#4cd7f6]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-800"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 mt-2 rounded-xl bg-gradient-to-r from-[#8cc3ff] to-[#4cd7f6] text-[#001a42] font-bold text-base hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cyan-glow disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>{isRegister ? "Ro'yxatdan o'tish" : "Kirish"}</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            <div className="text-center mt-6 text-xs text-slate-400">
              {isRegister ? (
                <p>
                  Sizda allaqachon hisob bormi?{' '}
                  <button
                    onClick={() => {
                      setIsRegister(false);
                      setError(null);
                    }}
                    className="text-[#4cd7f6] font-bold hover:underline"
                  >
                    Kirish
                  </button>
                </p>
              ) : (
                <p>
                  Hisobingiz yo'qmi?{' '}
                  <button
                    onClick={() => {
                      setIsRegister(true);
                      setError(null);
                    }}
                    className="text-[#4cd7f6] font-bold hover:underline"
                  >
                    Ro'yxatdan o'tish
                  </button>
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
