import React, { useState } from "react";
import { Mail, Github, Linkedin, Copy, Check, ExternalLink } from "lucide-react";
import { motion } from "motion/react";
import { translations } from "../i18n/translations";

interface FooterProps {
  currentLang: string;
}

export const Footer: React.FC<FooterProps> = ({ currentLang }) => {
  const [isCopied, setIsCopied] = useState(false);
  const t = translations[currentLang as keyof typeof translations];

  const email = "joaquimcolacilli9@gmail.com";
  const socialLinks = {
    github: "https://github.com/joaquimcolacilli",
    linkedin: "https://linkedin.com/in/joaquim-colacilli",
  };

  const handleCopyEmail = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(email);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleEmailClick = () => {
    window.location.href = `mailto:${email}`;
  };

  return (
    <footer className="relative z-10 py-24 overflow-hidden" id="contact">
      {/* Background gradient glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-br from-indigo-500/15 to-cyan-400/10 blur-[120px] rounded-full" />
      </div>

      <div className="section-padding">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="max-w-3xl mx-auto text-center"
          >
            {/* Title */}
            <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-4">
              {t.footer.title.split(" ").map((word: string, i: number) => (
                <motion.span
                  key={i}
                  className="inline-block mr-[0.25em] last:mr-0"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5, ease: "easeOut" }}
                >
                  {word}
                </motion.span>
              ))}
            </h2>
            <motion.p
              className="text-lg text-muted mb-12"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              {t.footer.subtitle}
            </motion.p>

            {/* Contact Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-surface/80 backdrop-blur-xl border border-subtle/60 rounded-2xl p-8 max-w-lg mx-auto"
            >
              {/* Email row */}
              <div
                onClick={handleEmailClick}
                className="group flex items-center justify-between gap-4 p-4 rounded-xl border border-subtle hover:border-indigo-500/40 transition-colors cursor-pointer mb-6"
                style={{ backgroundColor: "#1e1e2e" }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Mail className="w-5 h-5 text-indigo-400 shrink-0" />
                  <span className="font-mono text-sm md:text-base truncate" style={{ color: "#f0f0f5" }}>
                    {email}
                  </span>
                </div>
                <button
                  onClick={handleCopyEmail}
                  className="p-2 rounded-lg hover:bg-elevated transition-colors shrink-0"
                  aria-label="Copy email"
                >
                  {isCopied ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-muted hover:text-white transition-colors" />
                  )}
                </button>
              </div>

              {/* Social links */}
              <div className="flex justify-center gap-3">
                <a
                  href={socialLinks.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2 px-5 py-3 rounded-xl bg-surface/60 border border-subtle/40 hover:border-indigo-500/40 transition-colors"
                >
                  <Github className="w-5 h-5 text-muted group-hover:text-white transition-colors" />
                  <span className="text-sm text-muted group-hover:text-white transition-colors">
                    GitHub
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-muted/50 group-hover:text-white/50 transition-colors" />
                </a>
                <a
                  href={socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2 px-5 py-3 rounded-xl bg-surface/60 border border-subtle/40 hover:border-indigo-500/40 transition-colors"
                >
                  <Linkedin className="w-5 h-5 text-muted group-hover:text-white transition-colors" />
                  <span className="text-sm text-muted group-hover:text-white transition-colors">
                    LinkedIn
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-muted/50 group-hover:text-white/50 transition-colors" />
                </a>
              </div>
            </motion.div>

            {/* Available badge */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-12 flex items-center justify-center gap-2"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
              </span>
              <p className="text-sm text-muted">{t.footer.available}</p>
            </motion.div>

            {/* Copyright */}
            <p className="mt-8 text-xs text-muted/60">
              &copy; {new Date().getFullYear()} Joaquim Colacilli. {t.footer.rights}
            </p>
          </motion.div>
        </div>
      </div>
    </footer>
  );
};
