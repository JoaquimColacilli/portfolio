import React from 'react';
import { translations } from '../i18n/translations';

interface NavbarProps {
  currentLang: string;
}

export const Navbar: React.FC<NavbarProps> = ({ currentLang }) => {
  const t = translations[currentLang as keyof typeof translations];

  return (
    <nav className="fixed w-full top-0 bg-gray-900/50 backdrop-blur-sm border-b border-gray-800/50 z-10">
      <div className="container mx-auto px-6 py-6">
        <ul className="flex justify-center space-x-8">
          {Object.entries(t.nav).map(([key, value]) => (
            <li key={key}>
              <a
                href={`#${key}`}
                className="text-gray-400 hover:text-white transition-colors duration-200 text-sm tracking-wider"
              >
                {value}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};