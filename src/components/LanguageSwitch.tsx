import React from "react";

interface LanguageSwitchProps {
  currentLang: string;
  onLanguageChange: (lang: string) => void;
}

export const LanguageSwitch: React.FC<LanguageSwitchProps> = ({
  currentLang,
  onLanguageChange,
}) => {
  return (
    <div className="fixed top-6 right-6 z-60">
      <div className="flex items-center bg-surface/80 backdrop-blur-md border border-subtle/50 rounded-full px-1 py-1">
        <button
          onClick={() => onLanguageChange("en")}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
            currentLang === "en"
              ? "bg-indigo-500/20 text-white"
              : "text-muted hover:text-white"
          }`}
        >
          EN
        </button>
        <button
          onClick={() => onLanguageChange("es")}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
            currentLang === "es"
              ? "bg-indigo-500/20 text-white"
              : "text-muted hover:text-white"
          }`}
        >
          ES
        </button>
      </div>
    </div>
  );
};
