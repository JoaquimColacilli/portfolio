import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { translations } from '../i18n/translations';

interface NavbarProps {
  currentLang: string;
}

export const Navbar: React.FC<NavbarProps> = ({ currentLang }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const t = translations[currentLang as keyof typeof translations];

  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleItemClick = () => {
    setIsOpen(false);
  };

  return (
    <nav
      className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        hasScrolled || isOpen
          ? 'bg-gray-900/95 backdrop-blur-md shadow-lg'
          : 'bg-gray-900/50 backdrop-blur-sm'
      }`}
    >
      <div className="container mx-auto px-6">
        <div className="relative flex items-center justify-between h-20">
          {/* Botón del menú móvil */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-emerald-500 transition-colors"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>

          {/* Menú de escritorio */}
          <div className="hidden lg:flex lg:items-center lg:justify-center lg:flex-1">
            <div className="flex space-x-8">
              {Object.entries(t.nav).map(([key, value]) => (
                <a
                  key={key}
                  href={`#${key}`}
                  className="text-gray-400 hover:text-white transition-colors duration-200 text-sm tracking-wider"
                >
                  {value}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Menú móvil */}
        <div
          className={`lg:hidden transition-all duration-300 ease-in-out ${
            isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
          }`}
        >
          <div className="px-2 pt-2 pb-3 space-y-1 border-t border-gray-800">
            {Object.entries(t.nav).map(([key, value]) => (
              <a
                key={key}
                href={`#${key}`}
                onClick={handleItemClick}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-colors duration-200"
              >
                {value}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Overlay para el menú móvil */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
          style={{ zIndex: 40 }}
        />
      )}
    </nav>
  );
};
