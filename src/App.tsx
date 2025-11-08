import React, { useState } from "react";
import { LanguageSwitch } from "./components/LanguageSwitch";
import { Navbar } from "./components/Navbar";
import { translations } from "./i18n/translations";
// Importa el ícono Download
import { ChevronDown, Download } from "lucide-react";
import { TypedText } from "./components/TypedText";
import { AboutSection } from "./components/AboutSection";
import { ExperienceSection } from "./components/ExperienceSection";
import { ProjectsSection } from "./components/ProjectsSection";
import { Footer } from "./components/Footer";

function App() {
  const [currentLang, setCurrentLang] = useState("es");
  const t = translations[currentLang as keyof typeof translations];

  const cvFileName =
    currentLang === "es"
      ? "CV_JOAQUIM_COLACILLI_ESPAÑOL.pdf"
      : "CV_JOAQUIM_COLACILLI_ENGLISH.pdf";
  const cvPath = `/${cvFileName}`;

  return (
    <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-300">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(31,41,55,0.5),rgba(17,24,39,0.9))]" />

      <LanguageSwitch
        currentLang={currentLang}
        onLanguageChange={setCurrentLang}
      />
      <Navbar currentLang={currentLang} />

      <main
        id="home"
        className="relative min-h-screen flex items-center overflow-hidden"
      >
        <div className="container mx-auto px-6 z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12 max-w-7xl mx-auto pt-24 pb-16 md:pt-32 md:pb-24">
            <div className="flex-1 text-center md:text-left">
              <div className="space-y-6 md:space-y-8">
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white tracking-tight animate-fade-in drop-shadow-lg">
                  JOAQUIM COLACILLI
                </h1>
                <div className="text-2xl lg:text-3xl font-semibold text-emerald-400 h-10">
                  <TypedText text="Software Engineer" />
                </div>
                <p
                  className="text-lg md:text-xl text-gray-400 leading-relaxed animate-slide-up max-w-2xl mx-auto md:mx-0"
                  style={{ animationDelay: "200ms" }}
                >
                  {t.hero.description}
                </p>
                <div
                  className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start animate-fade-in pt-4"
                  style={{ animationDelay: "400ms" }}
                >
                  <a
                    href={`#contact`}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-emerald-500 text-white rounded-lg font-medium hover:opacity-90 transition-all duration-300 ease-out shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center gap-2 text-base" // Ajustado padding/text size, añadido flex items
                  >
                    {t.nav.contact}
                  </a>
                  <a
                    href={`#projects`}
                    className="px-6 py-3 border border-gray-600 bg-gray-800/50 text-gray-300 rounded-lg font-medium hover:bg-gray-700/70 hover:text-white hover:border-gray-500 transition-all duration-300 ease-out shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center gap-2 text-base" // Estilo similar, bg semi-transparente
                  >
                    {t.nav.projects}
                  </a>

                  <a
                    href={cvPath}
                    download
                    className="px-6 py-3 border border-gray-600 bg-gray-800/50 text-gray-300 rounded-lg font-medium hover:bg-gray-700/70 hover:text-white hover:border-gray-500 transition-all duration-300 ease-out shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center gap-2 text-base" // Estilo y flex items
                  >
                    <Download className="w-4 h-4" />
                    {t.hero.downloadCV}
                  </a>
                </div>
              </div>
            </div>

            {/* Imagen de perfil */}
            <div className="hidden md:block relative w-72 h-72 lg:w-80 lg:h-80 flex-shrink-0 mt-12 md:mt-0">
              {" "}
              {/* Ajustado tamaño y margen */}
              {/* Glow effect */}
              <div className="absolute inset-[-10px] bg-gradient-to-br from-blue-600/40 via-emerald-500/30 to-transparent rounded-full blur-xl animate-pulse opacity-70" />
              <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-gray-700/50 shadow-2xl z-10">
                <img
                  src="/images/foto_portfolio.jpg"
                  alt="Profile"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>
          </div>

          {/* Scroll down indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 hidden sm:block">
            {" "}
            {/* Oculto en xs */}
            <a href="#about" aria-label="Scroll down">
              <ChevronDown className="w-7 h-7 text-gray-500 hover:text-emerald-400 transition-colors animate-bounce" />
            </a>
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
