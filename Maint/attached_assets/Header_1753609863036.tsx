
import React, { useState, useEffect, useRef } from 'react';
import { GlobeAltIcon } from './icons';
import { translations } from '../translations';

interface HeaderProps {
    currentPage: string;
    language: 'tr' | 'en';
    setLanguage: (lang: 'tr' | 'en') => void;
}

const Header: React.FC<HeaderProps> = ({ currentPage, language, setLanguage }) => {
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setIsLangMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLangChange = (lang: 'tr' | 'en') => {
    setLanguage(lang);
    setIsLangMenuOpen(false);
  }

  return (
    <header className="flex items-center justify-between h-16 bg-slate-900 border-b border-slate-700/50 px-4 sm:px-6 lg:px-8 flex-shrink-0">
      <h2 className="text-xl font-semibold text-slate-200">{currentPage}</h2>
      <div className="flex items-center space-x-4">
        
        {/* Language Selector */}
        <div className="relative" ref={langMenuRef}>
          <button
            onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
            className="flex items-center text-slate-400 hover:text-white transition-colors p-2 rounded-md hover:bg-slate-700/50"
            aria-label={translations[language].header.selectLanguage}
            aria-haspopup="true"
            aria-expanded={isLangMenuOpen}
          >
            <GlobeAltIcon className="w-6 h-6" />
          </button>
          {isLangMenuOpen && (
            <div 
              className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-20 animate-fade-in"
            >
              <ul className="p-1">
                <li>
                  <button 
                    type="button" 
                    onClick={() => handleLangChange('tr')}
                    className={`w-full text-left flex items-center px-3 py-2 text-sm rounded-md transition-colors ${language === 'tr' ? 'bg-sky-600/20 text-slate-200 font-semibold' : 'text-slate-300 hover:bg-slate-700'}`}
                  >
                    <span className="flex-grow">Türkçe</span>
                    <span className="text-xs text-slate-400">TR</span>
                  </button>
                </li>
                <li className="mt-1">
                  <button 
                    type="button" 
                    onClick={() => handleLangChange('en')}
                    className={`w-full text-left flex items-center px-3 py-2 text-sm rounded-md transition-colors ${language === 'en' ? 'bg-sky-600/20 text-slate-200 font-semibold' : 'text-slate-300 hover:bg-slate-700'}`}
                  >
                    <span className="flex-grow">English</span>
                    <span className="text-xs text-slate-500">EN</span>
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>

        <div className="relative">
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
          </span>
        </div>
        <img
          className="h-10 w-10 rounded-full object-cover"
          src="https://picsum.photos/100/100"
          alt="User Avatar"
        />
      </div>
    </header>
  );
};

export default Header;
