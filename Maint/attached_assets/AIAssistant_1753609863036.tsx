import React, { useState, useEffect, useRef } from 'react';
import { Page, ChatMessage } from '../types';
import { getPageContext } from '../utils/pageContext';
import { generateChatResponse } from '../services/geminiService';
import { XMarkIcon, PaperAirplaneIcon, LightBulbIcon } from './icons';
import { translations } from '../translations';

const AIAssistant: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  activePage: Page;
  language: 'tr' | 'en';
}> = ({ isOpen, onClose, activePage, language }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const t = translations[language].pageContent.aiAssistant;
  const t_pages = translations[language].pages;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);
  
  useEffect(() => {
    if (isOpen) {
        setMessages([
          {
            role: 'model',
            content: `${t.greeting} **${t_pages[activePage] || activePage}** ${t.greeting_cont}`,
          },
        ]);
    }
  }, [isOpen, activePage, language]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const context = getPageContext(activePage);
      const responseText = await generateChatResponse(input, context, language);
      const modelMessage: ChatMessage = { role: 'model', content: responseText };
      setMessages((prev) => [...prev, modelMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        role: 'model',
        content: t.error,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!isOpen) {
    return null;
  }

  return (
    <div 
        className="fixed bottom-24 right-6 z-50 w-[90vw] max-w-md h-[70vh] max-h-[600px] flex flex-col bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700 animate-fade-in"
        aria-modal="true"
        role="dialog"
    >
        <header className="flex items-center justify-between p-4 border-b border-slate-700 flex-shrink-0">
            <div className="flex items-center gap-3">
                <div className="relative">
                    <LightBulbIcon className="w-8 h-8 text-sky-400" />
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
                    </span>
                </div>
                <h2 className="text-lg font-bold text-white">{t.title}</h2>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                <XMarkIcon className="w-7 h-7" />
                <span className="sr-only">{t.close}</span>
            </button>
        </header>

        <div className="flex-grow p-4 overflow-y-auto space-y-4">
            {messages.map((msg, index) => (
                <div key={index} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'model' && <div className="w-8 h-8 rounded-full bg-sky-500 flex items-center justify-center flex-shrink-0"><LightBulbIcon className="w-5 h-5 text-white"/></div>}
                    <div className={`max-w-[85%] p-3 rounded-xl shadow-md ${msg.role === 'user' ? 'bg-sky-600 text-white rounded-br-none' : 'bg-slate-700 text-slate-200 rounded-bl-none'}`}>
                        <p className="text-sm selection:bg-sky-200 selection:text-sky-900" dangerouslySetInnerHTML={{ __html: msg.content.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-100">$1</strong>') }}></p>
                    </div>
                </div>
            ))}
            {isLoading && (
                 <div className="flex gap-3 justify-start">
                    <div className="w-8 h-8 rounded-full bg-sky-500 flex items-center justify-center flex-shrink-0"><LightBulbIcon className="w-5 h-5 text-white"/></div>
                    <div className="max-w-[80%] p-3 rounded-xl bg-slate-700 text-slate-200 rounded-bl-none flex items-center gap-2">
                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse [animation-delay:0s]"></span>
                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse [animation-delay:0.15s]"></span>
                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse [animation-delay:0.3s]"></span>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>

        <footer className="p-4 border-t border-slate-700 flex-shrink-0">
            <form onSubmit={handleSend} className="flex items-center gap-3">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={t.placeholder}
                    className="flex-grow bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-sky-500 transition-shadow"
                    disabled={isLoading}
                />
                <button type="submit" disabled={isLoading || !input.trim()} className="bg-sky-600 text-white p-3 rounded-full hover:bg-sky-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-transform active:scale-95">
                    <PaperAirplaneIcon className="w-6 h-6" />
                </button>
            </form>
        </footer>
    </div>
  );
};

export default AIAssistant;