
import React, { useState, useRef, useEffect } from 'react';
import { Order } from '../types';

interface ChatModalProps {
  order: Order;
  currentUserId: string;
  onClose: () => void;
  onSend: (text: string) => void;
  t: any;
}

const ChatModal: React.FC<ChatModalProps> = ({ order, currentUserId, onClose, onSend, t }) => {
  const [text, setText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [order.messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSend(text);
      setText('');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md h-[600px] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 transition-colors">
        <div className="p-4 bg-indigo-600 dark:bg-indigo-700 text-white flex justify-between items-center transition-colors">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-black">
              {order.productName.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-black">{order.productName}</p>
              <p className="text-[10px] text-indigo-100 font-bold uppercase tracking-wider">{t.secureChannel}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-grow p-4 overflow-y-auto space-y-4 custom-scrollbar bg-slate-50 dark:bg-slate-950 transition-colors">
          <div className="flex justify-center mb-6">
            <span className="px-3 py-1 bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors">{t.chatStarted}</span>
          </div>
          
          {order.messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-3 rounded-2xl text-sm transition-all ${
                msg.senderId === currentUserId 
                  ? 'bg-indigo-600 dark:bg-indigo-600 text-white rounded-br-none shadow-md shadow-indigo-100 dark:shadow-indigo-900/20' 
                  : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-bl-none shadow-sm'
              }`}>
                <p className="font-medium">{msg.text}</p>
                <p className={`text-[9px] mt-1 font-bold ${msg.senderId === currentUserId ? 'text-indigo-200 dark:text-indigo-300/50' : 'text-slate-400 dark:text-slate-500'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          {order.messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-600 space-y-2 opacity-50 transition-colors">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
              <p className="text-xs font-bold uppercase tracking-widest">{t.noMessages}</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSend} className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex space-x-2 rtl:space-x-reverse transition-colors">
          <input
            autoFocus
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t.typeMessage}
            className="flex-grow px-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white transition-all"
          />
          <button 
            type="submit"
            className="p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 dark:hover:bg-indigo-500 active:scale-95 transition-all shadow-lg shadow-indigo-100 dark:shadow-indigo-900/40"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatModal;
