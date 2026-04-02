import { useState, useCallback } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { Navbar } from "./components/Navbar";
import { translations } from "./i18n/translations";
import { ChevronDown, Download } from "lucide-react";
import { TypedText } from "./components/TypedText";
import { FloatingPaths } from "./components/FloatingPaths";
import { AboutSection } from "./components/AboutSection";
import { ExperienceSection } from "./components/ExperienceSection";
import { ProjectsSection } from "./components/ProjectsSection";
import { Footer } from "./components/Footer";
import { SnakePath } from "./components/SnakePath";

function AnimatedLetters({
  text,
  className,
  wordDelay = 0.08,
  letterDelay = 0.03,
  baseDelay = 0,
}: {
  text: string;
  className?: string;
  wordDelay?: number;
  letterDelay?: number;
  baseDelay?: number;
}) {
  const words = text.split(" ");
  return (
    <span className={className}>
      {words.map((word, wordIndex) => (
        <span key={wordIndex} className="inline-block mr-[0.25em] last:mr-0">
          {word.split("").map((letter, letterIndex) => (
            <motion.span
              key={`${wordIndex}-${letterIndex}`}
              initial={{ y: 80, opacity: 0, rotateX: 40 }}
              animate={{ y: 0, opacity: 1, rotateX: 0 }}
              transition={{
                delay: baseDelay + wordIndex * wordDelay + letterIndex * letterDelay,
                type: "spring",
                stiffness: 150,
                damping: 25,
              }}
              className="inline-block"
            >
              {letter}
            </motion.span>
          ))}
        </span>
      ))}
    </span>
  );
}

function App() {
  const [currentLang, setCurrentLang] = useState("es");
  const t = translations[currentLang as keyof typeof translations];

  const { scrollYProgress } = useScroll();
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    },
    []
  );

  const cvFileName =
    currentLang === "es"
      ? "CV_JOAQUIM_COLACILLI_ESPAÑOL.pdf"
      : "CV_JOAQUIM_COLACILLI_ENGLISH.pdf";
  const cvPath = `/${cvFileName}`;

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.6,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
    },
  };

  return (
    <div className="relative bg-base text-gray-300 noise">
      <SnakePath />

      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[2px] bg-indigo-500 origin-left z-[60]"
        style={{ scaleX }}
      />

      <Navbar currentLang={currentLang} onLanguageChange={setCurrentLang} />

      {/* Hero Section */}
      <section
        id="home"
        className="relative z-10 min-h-screen flex items-center overflow-hidden"
        onMouseMove={handleMouseMove}
      >
        {/* Floating SVG paths background */}
        <div className="absolute inset-0">
          <FloatingPaths position={1} />
          <FloatingPaths position={-1} />
        </div>

        {/* Dot grid background */}
        <div className="absolute inset-0 dot-grid opacity-30" />

        {/* Radial gradient blobs */}
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-indigo-500/[0.07] rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-cyan-400/[0.05] rounded-full blur-[120px] pointer-events-none" />

        {/* Cursor glow - desktop only */}
        <div
          className="hidden md:block absolute pointer-events-none z-[1]"
          style={{
            left: mousePos.x - 200,
            top: mousePos.y - 200,
            width: 400,
            height: 400,
            background:
              "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)",
            borderRadius: "50%",
          }}
        />

        <div className="container mx-auto px-6 z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12 max-w-7xl mx-auto pt-24 pb-16 md:pt-32 md:pb-24">
            {/* Text content */}
            <div className="flex-1 text-center md:text-left">
              <div className="space-y-6 md:space-y-8">
                {/* Greeting */}
                <motion.p
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-sm tracking-widest uppercase text-muted font-mono"
                >
                  {t.hero.greeting}
                </motion.p>

                {/* Name - letter by letter spring animation */}
                <h1
                  className="gradient-text font-bold tracking-tight leading-[1.1]"
                  style={{ fontSize: "clamp(3rem, 5vw + 1rem, 5.5rem)" }}
                >
                  <AnimatedLetters
                    text={t.hero.name}
                    baseDelay={0.4}
                    wordDelay={0.12}
                    letterDelay={0.035}
                  />
                </h1>

                {/* Role typed text */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2, duration: 0.4 }}
                  className="text-2xl lg:text-3xl font-semibold text-cyan-400 h-10"
                >
                  <TypedText text={t.hero.role} />
                </motion.div>

                {/* Description */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.5, duration: 0.6, ease: "easeOut" }}
                  className="text-lg md:text-xl text-muted leading-relaxed max-w-2xl mx-auto md:mx-0"
                >
                  {t.hero.description}
                </motion.p>

                {/* CTA buttons */}
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start pt-4"
                >
                  <motion.a
                    variants={itemVariants}
                    href="#contact"
                    className="px-7 py-3.5 bg-gradient-to-r from-indigo-500 to-cyan-500 text-white rounded-lg font-medium hover:opacity-90 transition-all duration-300 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transform hover:-translate-y-0.5 flex items-center justify-center gap-2 text-base"
                  >
                    {t.hero.contact}
                  </motion.a>

                  <motion.a
                    variants={itemVariants}
                    href={cvPath}
                    download
                    className="px-7 py-3.5 glass border border-subtle text-gray-300 rounded-lg font-medium hover:text-white hover:border-white/20 transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center gap-2 text-base"
                  >
                    <Download className="w-4 h-4" />
                    {t.hero.downloadCV}
                  </motion.a>
                </motion.div>
              </div>
            </div>

            {/* Profile image - desktop only */}
            <motion.div
              className="hidden md:block relative w-72 h-72 lg:w-80 lg:h-80 flex-shrink-0"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
            >
              {/* Animated glow ring */}
              <motion.div
                className="absolute inset-[-12px] rounded-full bg-gradient-to-br from-indigo-500/40 via-cyan-400/30 to-indigo-500/40 blur-xl"
                animate={{
                  opacity: [0.5, 0.8, 0.5],
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-white/10 shadow-2xl z-10">
                <img
                  src="/images/foto_portfolio.png"
                  alt="Joaquim Colacilli"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            </motion.div>
          </div>

          {/* Scroll indicator */}
          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 hidden sm:block"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.2 }}
          >
            <a href="#about" aria-label="Scroll down">
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <ChevronDown className="w-7 h-7 text-muted hover:text-indigo-400 transition-colors" />
              </motion.div>
            </a>
          </motion.div>
        </div>
      </section>

      <AboutSection currentLang={currentLang} />
      <ExperienceSection currentLang={currentLang} />
      <ProjectsSection currentLang={currentLang} />
      <Footer currentLang={currentLang} />
    </div>
  );
}

export default App;
