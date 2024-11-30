import React, { useState } from "react";
import { LanguageSwitch } from "./components/LanguageSwitch";
import { Navbar } from "./components/Navbar";
import { translations } from "./i18n/translations";
import { ChevronDown } from "lucide-react";
import { TypedText } from "./components/TypedText";
import { AboutSection } from "./components/AboutSection";
import { ExperienceSection } from "./components/ExperienceSection";
import { ProjectsSection } from "./components/ProjectsSection";
import { Footer } from "./components/Footer";

function App() {
  const [currentLang, setCurrentLang] = useState("es");
  const t = translations[currentLang as keyof typeof translations];

  return (
    <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(17,24,39,0.7),rgba(17,24,39,0.9))]" />

      <LanguageSwitch
        currentLang={currentLang}
        onLanguageChange={setCurrentLang}
      />
      <Navbar currentLang={currentLang} />

      {/* Agregamos id="home" */}
      <main id="home" className="relative min-h-screen flex items-center">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12 max-w-7xl mx-auto pt-20">
            <div className="flex-1 text-center md:text-left">
              <div className="space-y-8">
                <h1 className="text-6xl lg:text-8xl font-bold text-white tracking-tight animate-fade-in">
                  JOAQUIM COLACILLI
                </h1>
                <h2 className="text-4xl lg:text-5xl font-semibold text-gray-300">
                  <TypedText text="Full Stack Software Developer" />
                </h2>
                <p className="text-2xl text-gray-400 leading-relaxed animate-slide-up max-w-2xl mx-auto md:mx-0">
                  {t.hero.description}
                </p>
                <div className="flex gap-4 justify-center md:justify-start animate-fade-in">
                  <a
                    href={`#contact`}
                    className="px-8 py-4 bg-gradient-to-r from-blue-500 to-emerald-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity text-lg"
                  >
                    {t.nav.contact}
                  </a>
                  <a
                    className="px-8 py-4 border border-gray-700 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors text-lg"
                    href={`#projects`}
                  >
                    {t.nav.projects}
                  </a>
                </div>
              </div>
            </div>

            {/* Ocultar imagen en pantallas menores a 768px */}
            <div className="hidden md:block relative w-80 h-80 lg:w-96 lg:h-96 flex-shrink-0">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full blur-2xl opacity-20 animate-pulse" />
              <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-gray-700 shadow-2xl">
                <img
                  src="/images/foto_portfolio.jpeg"
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
            <ChevronDown className="w-6 h-6 text-gray-400 animate-bounce" />
          </div>
        </div>
      </main>

      <AboutSection currentLang={currentLang} />
      <ExperienceSection currentLang={currentLang} />
      <ProjectsSection currentLang={currentLang} />
      <Footer currentLang={currentLang} />
    </div>
  );
}

export default App;
