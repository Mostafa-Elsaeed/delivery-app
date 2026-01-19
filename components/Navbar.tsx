
import React, { useState } from 'react';
import { UserRole, Wallet } from '../types';

interface NavbarProps {
  role: UserRole;
  wallet: Wallet;
  onLogout: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  t: any;
  onToggleLanguage: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ role, wallet, onLogout, isDarkMode, onToggleTheme, t, onToggleLanguage }) => {
  const [showHistory, setShowHistory] = useState(false);

  return (
    <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-[60] transition-colors">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-600 p-2 rounded-2xl shadow-lg shadow-indigo-100 dark:shadow-indigo-900/20 rotate-12 group hover:rotate-0 transition-transform duration-300">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </div>
          <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{t.appName}</span>
          <span className={`ml-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-colors ${
            role === UserRole.STORE 
              ? 'bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800' 
              : 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800'
          }`}>
            {role === UserRole.STORE ? t.storePartner : t.riderHero}
          </span>
        </div>

        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          <button
            onClick={onToggleLanguage}
            className="px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all shadow-sm text-xs font-bold"
          >
            {t.switchLanguage}
          </button>
          <button
            onClick={onToggleTheme}
            className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all shadow-sm"
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

          <div className="relative">
            <button 
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center space-x-5 rtl:space-x-reverse bg-indigo-50/50 dark:bg-indigo-900/10 px-5 py-2 rounded-2xl border border-indigo-100 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors group shadow-sm"
            >
              <div className="text-right rtl:text-left">
                <p className="text-[9px] uppercase font-black text-indigo-400 leading-none mb-1">{t.available}</p>
                <p className="text-lg font-black text-indigo-700 dark:text-indigo-400 leading-none" dir="ltr">${wallet.balance.toFixed(2)}</p>
              </div>
              {wallet.escrowHeld > 0 && (
                <div className="border-l border-indigo-200 dark:border-indigo-800 pl-5 rtl:pl-0 rtl:pr-5 text-right rtl:text-left">
                  <p className="text-[9px] uppercase font-black text-amber-500 leading-none mb-1">{t.inEscrow}</p>
                  <p className="text-lg font-black text-amber-600 leading-none" dir="ltr">${wallet.escrowHeld.toFixed(2)}</p>
                </div>
              )}
              <svg className={`w-4 h-4 text-indigo-400 transition-transform ${showHistory ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
            </button>

            {showHistory && (
              <div className="absolute right-0 rtl:right-auto rtl:left-0 mt-3 w-72 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-4 animate-in fade-in slide-in-from-top-2 transition-colors">
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4">{t.recentActivity}</p>
                <div className="space-y-4 max-h-60 overflow-y-auto custom-scrollbar">
                  {wallet.transactions.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-4 text-center">{t.noTransactions}</p>
                  ) : (
                    wallet.transactions.map(t => (
                      <div key={t.id} className="flex justify-between items-start text-xs border-b border-slate-50 dark:border-slate-800 pb-3 last:border-none">
                        <div className="pr-2 rtl:pr-0 rtl:pl-2 text-left rtl:text-right">
                          <p className="font-bold text-slate-800 dark:text-slate-200">{t.description}</p>
                          <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-1">{new Date(t.timestamp).toLocaleDateString()}</p>
                        </div>
                        <span className={`font-black whitespace-nowrap ${t.type === 'IN' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`} dir="ltr">
                          {t.type === 'IN' ? '+' : '-'}${t.amount.toFixed(2)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={onLogout}
            className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 rounded-2xl hover:text-rose-500 dark:hover:text-rose-400 hover:border-rose-100 dark:hover:border-rose-900 hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-all shadow-sm flex items-center space-x-2"
            title="Switch Profile"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="text-xs font-black uppercase tracking-widest hidden md:inline">{t.logout}</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
