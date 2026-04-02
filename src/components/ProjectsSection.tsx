import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Github, ExternalLink, Code2, ArrowRight, ChevronDown, Star } from "lucide-react";
import { translations } from "../i18n/translations";

interface ProjectProps {
  currentLang: string;
}

type ProjectCategory = "All" | "Website" | "Desktop App";

const INITIAL_VISIBLE = 6;

export const ProjectsSection: React.FC<ProjectProps> = ({ currentLang }) => {
  const [activeFilter, setActiveFilter] = useState<ProjectCategory>("All");
  const [showAll, setShowAll] = useState(false);
  const t = translations[currentLang as keyof typeof translations];

  const projects = [
    {
      title: "Merced Edificio",
      description:
        currentLang === "es"
          ? "Landing page para edificio Merced, desarrollada con Cubiqa. Diseño inmersivo con galería de unidades y contacto integrado."
          : "Landing page for Merced building, built with Cubiqa. Immersive design with unit gallery and integrated contact.",
      image: "/images/projects/merced.png",
      technologies: ["React", "Next.js", "TailwindCSS", "Framer Motion"],
      demoLink: "https://merced-edificio.netlify.app/",
      githubLink: "https://github.com/JoaquimColacilli/merced-landing-by-cubiqa",
      category: "Website" as const,
      featured: true,
    },
    {
      title: "Más Fácil Imposible",
      description:
        currentLang === "es"
          ? "App de finanzas personales para controlar gastos, ingresos, inversiones y ahorros con dashboards y métricas en tiempo real."
          : "Personal finance app to track expenses, income, investments and savings with real-time dashboards and metrics.",
      image: "/images/projects/mfi.png",
      technologies: ["React", "TailwindCSS", "Node.js", "Supabase"],
      demoLink: "https://mas-facil-imposible.netlify.app/dashboard",
      githubLink: "https://github.com/JoaquimColacilli/mas-facil-imposible",
      category: "Website" as const,
      featured: true,
    },
    {
      title: "Cubiqa Survey",
      description:
        currentLang === "es"
          ? "Sistema de encuestas de satisfacción para Cubiqa. Recolección de feedback de clientes con visualización de resultados."
          : "Satisfaction survey system for Cubiqa. Client feedback collection with results visualization.",
      image: "/images/projects/cubiqa-survey.png",
      technologies: ["React", "TailwindCSS", "Supabase"],
      demoLink: "https://cubiqa-survey-satisfaction.netlify.app/",
      githubLink: "https://github.com/JoaquimColacilli/cubiqa-survey-satisfaction",
      category: "Website" as const,
      featured: true,
    },
    {
      title: "Cubiqa Landing",
      description:
        currentLang === "es"
          ? "Landing page template para Cubiqa, empresa de experiencias arquitect\u00f3nicas inmersivas. Dise\u00f1o moderno, elegante y personalizable."
          : "Landing page template for Cubiqa, an immersive architectural experiences company. Modern, elegant, and customizable design.",
      image: "/images/projects/cubiqa.png",
      technologies: ["React", "Next.js", "TailwindCSS", "Framer Motion"],
      demoLink: "https://cubiqa-landing-template.vercel.app/",
      githubLink: "https://github.com/JoaquimColacilli/cubiqa-landing-template",
      category: "Website" as const,
    },
    {
      title: "Cubiqa Backoffice",
      description:
        currentLang === "es"
          ? "Sistema de gesti\u00f3n interno para Cubiqa: proyectos, clientes, finanzas. Dashboard con estad\u00edsticas en tiempo real y gesti\u00f3n de calendario."
          : "Internal management system for Cubiqa: projects, clients, finances. Dashboard with real-time stats and calendar management.",
      image: "/images/projects/cubiqa-bo.png",
      technologies: [
        "React",
        "Next.js",
        "TailwindCSS",
        "Node.js",
        "PostgreSQL",
        "Prisma",
      ],
      demoLink: "https://cubiqa-bo.vercel.app/",
      githubLink: "",
      category: "Website" as const,
    },
    {
      title: "PRIMATECH",
      description:
        currentLang === "es"
          ? "Landing page de PRIMATECH, empresa de soluciones tecnol\u00f3gicas. Dise\u00f1o visual moderno, profesional y din\u00e1mico con animaciones."
          : "Landing page for PRIMATECH, technology solutions company. Modern, professional, and dynamic visual design with animations.",
      image: "/images/projects/primatech.png",
      technologies: [
        "Next.js",
        "TailwindCSS",
        "Framer Motion",
        "i18n",
        "MongoDB",
        "Node.js",
      ],
      demoLink: "https://primatech.com.ar/",
      githubLink: "",
      category: "Website" as const,
    },
    {
      title: "BRAMELEC",
      description:
        currentLang === "es"
          ? "Landing page para empresa de planos de instalaciones el\u00e9ctricas. Interfaz moderna y optimizada."
          : "Landing page for electrical installation plans company. Modern, optimized interface.",
      image: "/images/projects/bramelec.png",
      technologies: ["Next.js", "Vite", "TailwindCSS", "Firebase"],
      demoLink: "https://bramelec.com/",
      githubLink: "https://github.com/JoaquimColacilli/bramelec",
      category: "Website" as const,
    },
    {
      title: "Qiufy",
      description:
        currentLang === "es"
          ? "Plataforma de matchmaking para gamers. Conexi\u00f3n r\u00e1pida entre jugadores."
          : "Matchmaking platform for gamers. Quick player connections.",
      image: "/images/projects/qiufy.jpg",
      technologies: [
        "Angular",
        "Spring Boot",
        "MySQL",
        "WebSocket",
        "ActiveMQ",
        "Microservices",
      ],
      demoLink: "",
      githubLink: "",
      category: "Website" as const,
    },
    {
      title: "Willpower Fit",
      description:
        currentLang === "es"
          ? "Landing page para gimnasio. Dise\u00f1o moderno e interfaz optimizada para rendimiento."
          : "Gym landing page. Modern design and optimized interface for performance.",
      image: "/images/projects/wpf.png",
      technologies: ["Next.js", "Vite", "TailwindCSS"],
      demoLink: "https://joaquimcolacilli.github.io/wpf/",
      githubLink: "https://github.com/JoaquimColacilli/wpf",
      category: "Website" as const,
    },
    {
      title: "Outreal Website",
      description:
        currentLang === "es"
          ? "Sitio web oficial para Outreal ARQ, proyectos arquitect\u00f3nicos innovadores."
          : "Official website for Outreal ARQ, innovative architectural projects.",
      image: "/images/projects/outreal.png",
      technologies: ["HTML", "CSS", "JavaScript"],
      demoLink: "https://outrealstudio.com/",
      githubLink: "https://github.com/JoaquimColacilli/outreal",
      category: "Website" as const,
    },
    {
      title: "Player Timer",
      description:
        currentLang === "es"
          ? "Temporizador interactivo para m\u00faltiples jugadores con personalizaci\u00f3n y animaciones."
          : "Interactive timer for multiple players with customization and animations.",
      image: "/images/projects/player-timer.png",
      technologies: ["React", "TailwindCSS", "Next.js"],
      demoLink: "https://joaquimcolacilli.github.io/playertimer/",
      githubLink: "https://github.com/JoaquimColacilli/playertimer",
      category: "Website" as const,
    },
    {
      title: "Script Validator",
      description:
        currentLang === "es"
          ? "Herramienta para validar scripts SQL con soporte PostgreSQL, MySQL y MongoDB."
          : "Tool to validate SQL scripts with PostgreSQL, MySQL, and MongoDB support.",
      image: "/images/projects/script-validator.png",
      technologies: ["React", "TailwindCSS", "Electron"],
      demoLink: "https://github.com/JoaquimColacilli/script-validator/",
      githubLink: "https://github.com/JoaquimColacilli/script-validator",
      category: "Desktop App" as const,
    },
    {
      title: "Hotfood",
      description:
        currentLang === "es"
          ? "Plataforma de delivery con seguimiento en tiempo real y pagos integrados."
          : "Delivery platform with real-time tracking and integrated payments.",
      image: "/images/projects/hotfood.png",
      technologies: [
        "Next.js",
        "Express",
        "PostgreSQL",
        "Stripe",
        "Socket.io",
      ],
      demoLink: "https://joaquimcolacilli.github.io/hotfood/",
      githubLink: "https://github.com/JoaquimColacilli/hotfood",
      category: "Website" as const,
    },
    {
      title: "JSON Parser EXEC",
      description:
        currentLang === "es"
          ? "Aplicaci\u00f3n ejecutable para formatear y validar archivos JSON."
          : "Executable application for formatting and validating JSON files.",
      image: "/images/projects/json-parser.png",
      technologies: ["React", "JSON", "Electron"],
      demoLink: "https://github.com/JoaquimColacilli/json-parser-exec",
      githubLink: "https://github.com/JoaquimColacilli/json-parser-exec",
      category: "Desktop App" as const,
    },
    {
      title:
        currentLang === "es"
          ? "Estimador de Desarrollos"
          : "Development Estimator",
      description:
        currentLang === "es"
          ? "Aplicaci\u00f3n web para estimar tiempos y costos de desarrollo con IA."
          : "Web app for estimating development time and costs with AI.",
      image: "/images/projects/estimador.png",
      technologies: ["React", "Node.js", "TailwindCSS"],
      demoLink: "https://joaquimcolacilli.github.io/estimador-desarrollo/",
      githubLink:
        "https://github.com/JoaquimColacilli/estimador-desarrollo",
      category: "Website" as const,
    },
    {
      title: "Checklist APP",
      description:
        currentLang === "es"
          ? "Aplicaci\u00f3n de checklist din\u00e1mica para controlar despliegues y tareas."
          : "Dynamic checklist app for controlling deployments and tasks.",
      image: "/images/projects/checklist.png",
      technologies: ["Vue.js", "Firebase", "Vuetify"],
      demoLink: "https://joaquimcolacilli.github.io/checklistwf3/",
      githubLink: "https://github.com/JoaquimColacilli/checklistwf3",
      category: "Website" as const,
    },
  ];

  const filterCategories: { key: ProjectCategory; label: string }[] = [
    { key: "All", label: t.projects.filters.all },
    { key: "Website", label: t.projects.filters.website },
    { key: "Desktop App", label: t.projects.filters.desktopApp },
  ];

  const filteredProjects = useMemo(() => {
    const base = activeFilter === "All" ? projects : projects.filter((p) => p.category === activeFilter);
    return base;
  }, [activeFilter, currentLang]);

  const visibleProjects = showAll ? filteredProjects : filteredProjects.slice(0, INITIAL_VISIBLE);
  const hasMore = filteredProjects.length > INITIAL_VISIBLE;

  return (
    <section className="section-padding relative z-10 overflow-hidden" id="projects">
      <div className="section-container">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 md:mb-14">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 md:mb-0">
            {t.projects.title.split(" ").map((word: string, i: number) => (
              <motion.span
                key={i}
                className="inline-block mr-[0.25em] last:mr-0 gradient-text"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ delay: i * 0.1, duration: 0.5, ease: "easeOut" }}
              >
                {word}
              </motion.span>
            ))}
          </h2>

          <motion.a
            href="https://github.com/JoaquimColacilli/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-2 text-muted hover:text-indigo-300 transition-colors duration-300 group text-sm font-medium"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {t.projects.viewAll}
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </motion.a>
        </div>

        {/* Filter Buttons */}
        <motion.div
          className="flex flex-wrap gap-3 mb-10 md:mb-14"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          {filterCategories.map((filter) => (
            <button
              key={filter.key}
              onClick={() => { setActiveFilter(filter.key); setShowAll(false); }}
              className={`px-5 py-2 rounded-full text-sm font-medium border transition-all duration-300 focus:outline-none ${
                activeFilter === filter.key
                  ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
                  : "bg-surface text-muted border-subtle hover:text-white hover:border-indigo-500/20 hover:bg-indigo-500/5"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </motion.div>

        {/* Projects Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeFilter}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35 }}
          >
            {visibleProjects.map((project, index) => (
              <motion.div
                key={project.title}
                className="group relative bg-surface/60 backdrop-blur-sm border border-subtle/50 rounded-2xl overflow-hidden transition-colors duration-500 hover:border-indigo-500/30"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.08,
                  ease: "easeOut",
                }}
                whileHover={{ y: -4 }}
              >
                {/* Featured badge */}
                {"featured" in project && project.featured && (
                  <div className="absolute top-3 right-3 z-20 flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 backdrop-blur-sm">
                    <Star className="w-3 h-3 text-indigo-400 fill-indigo-400" />
                    <span className="text-[10px] font-medium text-indigo-300 uppercase tracking-wider">Featured</span>
                  </div>
                )}

                {/* Image Area */}
                <div className="relative aspect-video overflow-hidden">
                  <motion.img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                  />

                  {/* Hover Overlay with Buttons */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-end justify-center pb-6 z-10">
                    <div className="flex items-center gap-4">
                      {project.demoLink && (
                        <a
                          href={project.demoLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${project.title} Demo`}
                          className="w-11 h-11 bg-indigo-500 rounded-full flex items-center justify-center text-white hover:bg-indigo-400 transition-all duration-300 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 hover:scale-110"
                          style={{ transitionDelay: "100ms" }}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      {project.githubLink && (
                        <a
                          href={project.githubLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${project.title} GitHub`}
                          className="w-11 h-11 bg-elevated rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 hover:scale-110"
                          style={{ transitionDelay: "200ms" }}
                        >
                          <Github className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Content Area */}
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {project.title}
                  </h3>
                  <p className="text-sm text-muted leading-relaxed mb-4 line-clamp-3">
                    {project.description}
                  </p>

                  {/* Tech Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {project.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="px-2.5 py-1 bg-indigo-500/10 text-indigo-300 rounded-full text-xs font-mono border border-indigo-500/20"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  {/* Bottom Links */}
                  <div className="flex items-center gap-4 pt-3 border-t border-subtle/50">
                    {project.demoLink && (
                      <a
                        href={project.demoLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs text-muted hover:text-cyan-400 transition-colors duration-300"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Demo
                      </a>
                    )}
                    {project.githubLink && (
                      <a
                        href={project.githubLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs text-muted hover:text-cyan-400 transition-colors duration-300"
                      >
                        <Github className="w-3.5 h-3.5" />
                        GitHub
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}

            {/* No results */}
            {filteredProjects.length === 0 && (
              <div className="col-span-full text-center py-16">
                <Code2 className="w-10 h-10 text-muted mx-auto mb-4 opacity-50" />
                <p className="text-muted text-lg">{t.projects.noResults}</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Show more / Show less button */}
        {hasMore && (
          <motion.div
            className="mt-10 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <button
              onClick={() => setShowAll(!showAll)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium border border-subtle text-muted hover:text-white hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all duration-300"
            >
              {showAll
                ? (currentLang === "es" ? "Mostrar menos" : "Show less")
                : (currentLang === "es" ? `Mostrar todos (${filteredProjects.length})` : `Show all (${filteredProjects.length})`)}
              <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showAll ? "rotate-180" : ""}`} />
            </button>
          </motion.div>
        )}

        {/* Mobile "View all on GitHub" */}
        <motion.div
          className="mt-12 text-center md:hidden"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <a
            href="https://github.com/JoaquimColacilli/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors duration-300 font-medium group text-sm"
          >
            {t.projects.viewAll}
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </a>
        </motion.div>
      </div>
    </section>
  );
};
