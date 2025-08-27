import React from 'react';
import { Button } from './ui/button';
import { Globe } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

export const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();

  const languages = [
    { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900 border border-gray-200 hover:border-gray-300">
          <Globe className="w-4 h-4 mr-2" />
          {languages.find(lang => lang.code === language)?.flag}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-white border-gray-200">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code as 'tr' | 'en')}
            className={`text-gray-700 hover:bg-gray-100 cursor-pointer ${
              language === lang.code ? 'bg-gray-100 text-gray-900' : ''
            }`}
          >
            <span className="mr-2">{lang.flag}</span>
            {lang.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};