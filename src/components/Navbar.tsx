import { useState, useEffect, useCallback } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { translations } from "../i18n/translations";

interface NavbarProps {
  currentLang: string;
  onLanguageChange: (lang: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentLang, onLanguageChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const t = translations[currentLang as keyof typeof translations];

  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const sectionIds = ["home", "about", "experience", "projects", "contact"];
    const observers: IntersectionObserver[] = [];

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveSection(id);
            }
          });
        },
        { rootMargin: "-40% 0px -40% 0px", threshold: 0 }
      );

      observer.observe(el);
      observers.push(observer);
    });

    return () => {
      observers.forEach((obs) => obs.disconnect());
    };
  }, []);

  const handleItemClick = useCallback(() => {
    setIsOpen(false);
  }, []);

  const navEntries = Object.entries(t.nav) as [string, string][];

  return (
    <nav
      className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        hasScrolled || isOpen
          ? "glass border-b border-white/5"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a
            href="#home"
            className="font-mono font-bold text-white text-lg tracking-tight hover:text-indigo-400 transition-colors"
          >
            JC
          </a>

          {/* Desktop nav links */}
          <div className="hidden lg:flex items-center gap-8">
            {navEntries.map(([key, value]) => (
              <a
                key={key}
                href={`#${key}`}
                className={`relative text-sm tracking-widest uppercase transition-colors duration-200 ${
                  activeSection === key
                    ? "text-white"
                    : "text-muted hover:text-white"
                }`}
              >
                {value}
                {activeSection === key && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-indigo-500 rounded-full"
                    transition={{
                      type: "spring",
                      stiffness: 380,
                      damping: 30,
                    }}
                  />
                )}
              </a>
            ))}
          </div>

          {/* Right side: Language switch + Mobile hamburger */}
          <div className="flex items-center gap-3">
            {/* Language Switch — always visible, vertically centered */}
            <div className="flex items-center bg-surface/80 backdrop-blur-md border border-subtle/50 rounded-full px-1 py-1">
              <button
                onClick={() => onLanguageChange("en")}
                className={`px-2.5 py-0.5 rounded-full text-xs font-medium transition-all duration-200 ${
                  currentLang === "en"
                    ? "bg-indigo-500/20 text-white"
                    : "text-muted hover:text-white"
                }`}
              >
                EN
              </button>
              <button
                onClick={() => onLanguageChange("es")}
                className={`px-2.5 py-0.5 rounded-full text-xs font-medium transition-all duration-200 ${
                  currentLang === "es"
                    ? "bg-indigo-500/20 text-white"
                    : "text-muted hover:text-white"
                }`}
              >
                ES
              </button>
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden inline-flex items-center justify-center p-2 rounded-md text-muted hover:text-white transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="lg:hidden overflow-hidden glass border-t border-white/5"
          >
            <div className="px-6 py-4 space-y-1">
              {navEntries.map(([key, value]) => (
                <a
                  key={key}
                  href={`#${key}`}
                  onClick={handleItemClick}
                  className={`block px-3 py-2.5 rounded-lg text-base font-medium transition-colors duration-200 ${
                    activeSection === key
                      ? "text-white bg-white/5"
                      : "text-muted hover:text-white hover:bg-white/5"
                  }`}
                >
                  {value}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
