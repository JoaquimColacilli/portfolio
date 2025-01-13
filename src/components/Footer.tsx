import React, { useState } from "react";
import {
  Mail,
  Github,
  Linkedin,
  Copy,
  Check,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import { translations } from "../i18n/translations";

interface FooterProps {
  currentLang: string;
}

export const Footer: React.FC<FooterProps> = ({ currentLang }) => {
  const [isCardOpen, setIsCardOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const t = translations[currentLang as keyof typeof translations];

  const email = "joaquimcolacilli9@gmail.com";
  const socialLinks = {
    github: "https://github.com/joaquimcolacilli",
    linkedin: "https://linkedin.com/in/joaquim-colacilli",
  };

  const handleCopyEmail = async () => {
    await navigator.clipboard.writeText(email);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleEmailClick = () => {
    window.location.href = `mailto:${email}`;
  };

  return (
    <footer className="relative py-20 overflow-hidden " id="contact">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[400px] bg-gradient-to-b from-emerald-500/10 to-blue-500/10 blur-3xl rounded-full opacity-30" />
      </div>

      <div className="container mx-auto px-6">
        <div className="max-w-7xl mx-auto">
          {/* Contact Section */}
          <div className="relative">
            <div className="text-center mb-12">
              <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
                {t.footer.title}
              </h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                {t.footer.subtitle}
              </p>
            </div>

            {/* Contact Card */}
            <div className="relative max-w-lg mx-auto">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-2xl blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-gradient" />
              <div className="relative bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-8">
                <div
                  className={`flex flex-col items-center text-center transition-all duration-500 ${
                    isCardOpen ? "-translate-y-4" : "translate-y-0"
                  }`}
                >
                  {/* Contact Button */}
                  <button
                    onClick={() => setIsCardOpen(!isCardOpen)}
                    className={`relative group transition-all duration-500 ${
                      isCardOpen ? "mb-8 scale-90" : "scale-100"
                    }`}
                  >
                    <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full blur opacity-30 group-hover:opacity-100 transition duration-500" />
                    <div className="relative px-8 py-4 bg-gray-900 rounded-full border border-gray-700 group-hover:border-gray-600 transition duration-500">
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-emerald-400" />
                        <span className="text-white font-medium">
                          {t.footer.contactButton}
                        </span>
                        <ArrowUpRight
                          className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${
                            isCardOpen ? "rotate-180" : ""
                          }`}
                        />
                      </div>
                    </div>
                  </button>

                  {/* Expanded Contact Options */}
                  <div
                    className={`w-full space-y-4 transition-all duration-500 ${
                      isCardOpen
                        ? "opacity-100 translate-y-0 h-auto"
                        : "opacity-0 -translate-y-4 h-0 overflow-hidden pointer-events-none"
                    }`}
                  >
                    <div className="relative group">
                      <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/50 to-blue-500/50 rounded-lg blur opacity-0 group-hover:opacity-30 transition duration-500" />
                      <div className="relative w-full p-4 bg-gray-900/50 rounded-lg border border-gray-700 group-hover:border-gray-600 transition duration-500 flex items-center justify-between">
                        <div
                          onClick={handleEmailClick}
                          className="flex items-center gap-3 cursor-pointer"
                        >
                          <Mail className="w-5 h-5 text-emerald-400" />
                          <span className="text-gray-300">{email}</span>
                        </div>
                        <div
                          onClick={handleCopyEmail}
                          className="p-2 hover:bg-gray-800 rounded-md transition-colors cursor-pointer"
                        >
                          {isCopied ? (
                            <Check className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Copy className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-center gap-4">
                      <a
                        href={socialLinks.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative"
                      >
                        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-500" />
                        <div className="relative p-3 bg-gray-900 rounded-lg border border-gray-700 group-hover:border-gray-600 transition duration-500">
                          <Github className="w-6 h-6 text-gray-400 group-hover:text-white transition-colors" />
                        </div>
                      </a>
                      <a
                        href={socialLinks.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative"
                      >
                        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-500" />
                        <div className="relative p-3 bg-gray-900 rounded-lg border border-gray-700 group-hover:border-gray-600 transition duration-500">
                          <Linkedin className="w-6 h-6 text-gray-400 group-hover:text-white transition-colors" />
                        </div>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Content */}
            <div className="mt-20 text-center">
              <div className="flex items-center justify-center gap-2 mb-6">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <p className="text-gray-400">{t.footer.available}</p>
              </div>
              <p className="text-sm text-gray-500">
                © {new Date().getFullYear()} Joaquim Colacilli.{" "}
                {t.footer.rights}
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
