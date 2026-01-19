
import React, { useState } from 'react';
import { UserRole, User } from '../types';
import { supabase } from '../supabaseClient';

interface AuthPortalProps {
  onAuth: (user: User) => void;
  existingUsers: User[];
  onSignup: (user: User) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  t: any;
  onToggleLanguage: () => void;
}

const AuthPortal: React.FC<AuthPortalProps> = ({ onAuth, existingUsers, onSignup, isDarkMode, onToggleTheme, t, onToggleLanguage }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.STORE);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name, role }
          }
        });
        if (error) throw error;
        if (data.user && !data.session) {
          setError(t.checkEmail);
        }
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const fillDemo = (type: 'store' | 'rider') => {
    if (type === 'store') {
      setEmail('store@demo.com');
      setPassword('password');
    } else {
      setEmail('rider@demo.com');
      setPassword('password');
    }
    setIsLogin(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden transition-colors duration-300">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-100 dark:bg-indigo-900/20 rounded-full blur-[120px] opacity-50"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-100 dark:bg-emerald-900/20 rounded-full blur-[120px] opacity-50"></div>

      <div className="absolute top-8 right-8 flex space-x-2 rtl:space-x-reverse">
        <button
          onClick={onToggleLanguage}
          className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shadow-sm text-xs font-bold"
        >
          {t.switchLanguage}
        </button>
        <button
          onClick={onToggleTheme}
          className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shadow-sm"
          title="Toggle Theme"
        >
          {isDarkMode ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 5a7 7 0 100 14 7 7 0 000-14z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>
      </div>

      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 p-8 relative z-10 animate-in fade-in zoom-in-95 duration-300 transition-colors">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">{t.appName}</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">{t.secureDeliveryMarketplace}</p>
        </div>

        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl mb-8 transition-colors">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${isLogin ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-400'}`}
          >
            {t.login}
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${!isLogin ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-400'}`}
          >
            {t.signup}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <label className="block text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 px-1">{t.fullName}</label>
                <input
                  required
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                  placeholder="e.g. Gourmet Bakery"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 px-1">{t.iAmA}</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole(UserRole.STORE)}
                    className={`py-3 rounded-xl text-xs font-bold border transition-all ${role === UserRole.STORE ? 'bg-indigo-600 border-indigo-600 text-white shadow-indigo-900/20' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'}`}
                  >
                    {t.store}
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole(UserRole.DELIVERY)}
                    className={`py-3 rounded-xl text-xs font-bold border transition-all ${role === UserRole.DELIVERY ? 'bg-emerald-600 border-emerald-600 text-white shadow-emerald-900/20' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'}`}
                  >
                    {t.rider}
                  </button>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 px-1">{t.email}</label>
            <input
              required
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
              placeholder="name@company.com"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 px-1">{t.password}</label>
            <input
              required
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-rose-500 text-xs font-bold text-center px-1">{error}</p>}

          <button
            type="submit"
            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-100 dark:shadow-indigo-900/40 hover:bg-indigo-700 active:scale-[0.98] transition-all"
          >
            {isLogin ? t.signIn : t.createAccount}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 transition-colors">
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center mb-4">{t.demoAccess}</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => fillDemo('store')}
              className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors"
            >
              {t.demoStore}
            </button>
            <button
              onClick={() => fillDemo('rider')}
              className="px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
            >
              {t.demoRider}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPortal;
