import React from 'react';
import { Globe, ChevronDown } from 'lucide-react';

interface LanguageSwitchProps {
  currentLang: string;
  onLanguageChange: (lang: string) => void;
}

export const LanguageSwitch: React.FC<LanguageSwitchProps> = ({
  currentLang,
  onLanguageChange,
}) => {
  return (
    <div className="fixed top-6 right-6 flex items-center gap-2 z-50">
      <Globe className="w-5 h-5 text-gray-200" />
      <div className="relative">
        <select
          value={currentLang}
          onChange={(e) => onLanguageChange(e.target.value)}
          className="bg-gray-800 text-gray-200 border border-gray-700 rounded-md pl-3 pr-8 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 appearance-none cursor-pointer"
        >
          <option value="en" className="bg-gray-800">EN</option>
          <option value="es" className="bg-gray-800">ES</option>
        </select>
        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>
    </div>
  );
};