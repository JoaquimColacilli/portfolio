import React, { useState, useMemo } from "react"; // Import useState and useMemo
import { useInView } from "../hooks/useInView";
import { Github, ExternalLink, Code2, ArrowRight } from "lucide-react";

interface ProjectProps {
  currentLang: string;
}

type ProjectCategory = "All" | "Website" | "Desktop App" | "Tool";

const filterLabels: Record<ProjectCategory, { es: string; en: string }> = {
  All: { es: "Todos", en: "All" },
  Website: { es: "Sitios Web", en: "Websites" },
  "Desktop App": { es: "Apps de Escritorio", en: "Desktop Apps" },
  Tool: { es: "Herramientas", en: "Tools" },
};

export const ProjectsSection: React.FC<ProjectProps> = ({ currentLang }) => {
  const [sectionRef, inView] = useInView({ threshold: 0.05 });
  const [activeFilter, setActiveFilter] = useState<ProjectCategory>("All");

  const projects = [
    {
      title: "PRIMATECH",
      description:
        currentLang === "es"
          ? "Landing page de PRIMATECH, empresa de soluciones tecnológicas. Desarrollada para comunicar con claridad nuestros servicios de software a medida, con un enfoque visual moderno, profesional y dinámico. Incluye animaciones, secciones interactivas y una estructura escalable."
          : "Landing page for PRIMATECH, technology solutions company. Built to clearly communicate our custom software services, featuring a modern, professional, and dynamic visual approach. Includes animations, interactive sections, and a scalable structure.",
      image: "/images/projects/primatech.png",
      technologies: ["Next.js", "TailwindCSS", "Framer Motion", "i18n", "mongoDB", "Node.js"],
      demoLink: "https://primatech.com.ar/",
      category: "Website" as ProjectCategory,
    },
    {
      title: "BRAMELEC",
      description:
        currentLang === "es"
          ? "Landing page para una empresa especializada en planos de instalaciones eléctricas para edificios. Diseñada para resaltar su experiencia y precisión en proyectos eléctricos, con una interfaz moderna y optimizada para una navegación intuitiva."
          : "Landing page for a company specializing in electrical installation plans for buildings. Designed to highlight their expertise and precision in electrical projects, with a modern interface optimized for intuitive navigation.",
      image: "/images/projects/bramelec.png",
      technologies: ["Next.js", "Vite", "TailwindCSS", "Firebase"],
      demoLink: "https://bramelec.com/",
      githubLink: "https://github.com/JoaquimColacilli/bramelec",
      category: "Website" as ProjectCategory,
    },
    {
      title: "Qiufy",
      description:
        currentLang === "es"
          ? "Plataforma de matchmaking para gamers que conecta jugadores de forma rápida y sin complicaciones."
          : "Matchmaking platform for gamers that connects players quickly and effortlessly.",
      image: "/images/projects/qiufy.jpg",
      technologies: ["Angular", "Java SpringBoot", "MySQL", "Oracle", "WebSocket", "ActiveMQ", "Microservicios"],
      demoLink: "",
      githubLink: "",
      category: "Website" as ProjectCategory,
    },
    {
      title: "Willpower Fit",
      description:
        currentLang === "es"
          ? "Landing page para un gimnasio, diseñada para motivar y atraer nuevos clientes. Incluye un diseño moderno, imágenes dinámicas y una interfaz optimizada para rendimiento y accesibilidad."
          : "Gym landing page designed to motivate and attract new clients. Features a modern design, dynamic visuals, and an optimized interface for performance and accessibility.",
      image: "/images/projects/wpf.png",
      technologies: ["Next.js", "Vite", "TailwindCSS"],
      demoLink: "https://joaquimcolacilli.github.io/wpf/",
      githubLink: "https://github.com/JoaquimColacilli/wpf",
      category: "Website" as ProjectCategory,
    },
    {
      title: "Outreal Website",
      description:
        currentLang === "es"
          ? "Sitio web oficial para Outreal ARQ, mostrando proyectos arquitectónicos innovadores."
          : "Official website for Outreal ARQ, showcasing innovative architectural projects.",
      image: "/images/projects/outreal.png",
      technologies: ["HTML", "CSS", "JavaScript"],
      demoLink: "https://outrealstudio.com/",
      githubLink: "https://github.com/JoaquimColacilli/outreal",
      category: "Website" as ProjectCategory,
    },
    {
      title: "Player Timer",
      description:
        currentLang === "es"
          ? "Temporizador interactivo para múltiples jugadores, con personalización de nombres, colores y seguimiento preciso de tiempos. Incluye una interfaz moderna, animaciones dinámicas y soporte responsivo para mejorar la experiencia de usuario."
          : "Interactive timer for multiple players, featuring customizable names, colors, and precise time tracking. Includes a modern interface, dynamic animations, and responsive support to enhance the user experience.",
      image: "/images/projects/player-timer.png",
      technologies: ["React", "TailwindCSS", "Next"],
      demoLink: "https://joaquimcolacilli.github.io/playertimer/",
      githubLink: "https://github.com/JoaquimColacilli/playertimer",
      category: "Website" as ProjectCategory,
    },
    {
      title: "Script Validator",
      description:
        currentLang === "es"
          ? "Herramienta para validar scripts SQL con soporte para PostgreSQL, MySQL y MongoDB, garantizando consultas sin errores y optimizadas."
          : "Tool to validate SQL scripts with support for PostgreSQL, MySQL, and MongoDB, ensuring error-free and optimized queries.",
      image: "/images/projects/script-validator.png",
      technologies: ["React", "TailwindCSS", "Electron"],
      demoLink: "https://github.com/JoaquimColacilli/script-validator/",
      githubLink: "https://github.com/JoaquimColacilli/script-validator",
      category: "Desktop App" as ProjectCategory,
    },
    {
      title: "Hotfood",
      description:
        currentLang === "es"
          ? "Plataforma de delivery de comida que conecta restaurantes locales con clientes. Sistema completo con seguimiento en tiempo real y pagos integrados."
          : "Food delivery platform connecting local restaurants with customers. Complete system with real-time tracking and integrated payments.",
      image: "/images/projects/hotfood.png",
      technologies: ["Next.js", "Express", "PostgreSQL", "Stripe", "Socket.io"],
      demoLink: "https://joaquimcolacilli.github.io/hotfood/",
      githubLink: "https://github.com/JoaquimColacilli/hotfood",
      category: "Website" as ProjectCategory,
    },
    {
      title: "JSON Parser EXEC",
      description:
        currentLang === "es"
          ? "Aplicación ejecutable para formatear y validar archivos JSON de manera eficiente."
          : "Executable application for formatting and validating JSON files efficiently.",
      image: "/images/projects/json-parser.png",
      technologies: ["React", "JSON", "Electron"],
      demoLink: "https://github.com/JoaquimColacilli/json-parser-exec",
      githubLink: "https://github.com/JoaquimColacilli/json-parser-exec",
      category: "Desktop App" as ProjectCategory,
    },
    {
      title:
        currentLang === "es"
          ? "Estimador de Desarrollos"
          : "Development Estimator",
      description:
        currentLang === "es"
          ? "Aplicación web para estimar tiempos y costos de desarrollo de software. Utiliza IA para proporcionar estimaciones precisas basadas en proyectos anteriores."
          : "Web application for estimating software development time and costs. Uses AI to provide accurate estimates based on previous projects.",
      image: "/images/projects/estimador.png",
      technologies: ["React", "Node.js", "TailwindCSS"],
      demoLink: "https://joaquimcolacilli.github.io/estimador-desarrollo/",
      githubLink: "https://github.com/JoaquimColacilli/estimador-desarrollo",
      category: "Website" as ProjectCategory,
    },
    {
      title: "Checklist APP",
      description:
        currentLang === "es"
          ? "Aplicación de checklist dinámica para controlar despliegues y tareas pendientes."
          : "Dynamic checklist application for controlling deployments and pending tasks.",
      image: "/images/projects/checklist.png",
      technologies: ["Vue.js", "Firebase", "Vuetify"],
      demoLink: "https://joaquimcolacilli.github.io/checklistwf3/",
      githubLink: "https://github.com/JoaquimColacilli/checklistwf3",
      category: "Website" as ProjectCategory,
    },
  ];

  const filterCategories: ProjectCategory[] = [
    "All",
    "Website",
    "Desktop App",
  ];

  const filteredProjects = useMemo(() => {
    if (activeFilter === "All") {
      return projects;
    }
    return projects.filter((project) => project.category === activeFilter);
  }, [activeFilter, projects, currentLang]);

  return (
    <section
      className="relative py-20 overflow-hidden bg-gray-900"
      id="projects"
    >
      <div className="container mx-auto px-6">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 md:mb-12">
            <h2
              className={`text-4xl font-bold text-white mb-4 md:mb-0 transition-all duration-1000 transform ${inView
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
                }`}
            >
              {currentLang === "es" ? "Proyectos" : "Projects"}
            </h2>
            <div
              className={`hidden md:flex items-center gap-2 text-gray-400 hover:text-white transition-all duration-500 cursor-pointer group transform ${inView
                ? "opacity-100 translate-x-0"
                : "opacity-0 translate-x-10"
                }`}
            >
              <a
                href="https://github.com/JoaquimColacilli/"
                className="text-sm font-medium"
                target="_blank"
                rel="noopener noreferrer"
              >
                {currentLang === "es"
                  ? "Ver todos en GitHub"
                  : "View all on GitHub"}
              </a>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" />
            </div>
          </div>

          {/* Filter Buttons */}
          <div
            className={`flex flex-wrap justify-center gap-3 mb-12 md:mb-16 transition-all duration-1000 transform ${inView ? "opacity-100 scale-100" : "opacity-0 scale-90"
              }`}
            style={{ transitionDelay: "150ms" }} // Add slight delay
          >
            {filterCategories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveFilter(category)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 ${activeFilter === category
                  ? "bg-gradient-to-r from-blue-500 to-emerald-500 text-white shadow-md ring-2 ring-emerald-400"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
                  }`}
              >
                {
                  filterLabels[category][
                  currentLang as keyof (typeof filterLabels)[typeof category]
                  ]
                }
              </button>
            ))}
          </div>

          {/* Projects Grid */}
          <div
            ref={sectionRef as React.RefObject<HTMLDivElement>}
            className="grid gap-16 md:gap-24" // Increased gap slightly
          >
            {filteredProjects.map((project, index) => (
              <div
                key={`${activeFilter}-${project.title}`} // Use filter in key to help React differentiate when list changes
                className={`group relative transition-all duration-700 ease-out transform ${inView
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-20"
                  }`}
                // Adjust delay based on index within the *filtered* list
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                {/* Project Card - Structure remains similar */}
                <div className="relative grid lg:grid-cols-2 gap-8 items-stretch">
                  {/* Image Container (Left Side) */}
                  <div className="relative overflow-hidden rounded-lg border border-gray-800 group-hover:border-gray-700 transition-colors duration-500 aspect-video lg:aspect-auto h-full shadow-lg group-hover:shadow-emerald-500/20">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-transparent to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
                    <div className="relative h-full">
                      <img
                        src={project.image}
                        alt={project.title}
                        className="w-full h-full object-cover transition-transform duration-700 ease-out transform group-hover:scale-105"
                        loading="lazy" // Add lazy loading
                      />
                      {/* Overlay on hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-end justify-center pb-8 z-20">
                        <div className="flex items-center justify-center gap-4">
                          <a
                            href={project.demoLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`${project.title} Demo`} // Accessibility
                            className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white hover:bg-emerald-600 transition-all duration-300 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                            style={{ transitionDelay: "100ms" }}
                          >
                            <ExternalLink className="w-5 h-5" />
                          </a>
                          <a
                            href={project.githubLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`${project.title} Github Repository`} // Accessibility
                            className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center text-white hover:bg-gray-600 transition-all duration-300 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-gray-500"
                            style={{ transitionDelay: "200ms" }}
                          >
                            <Github className="w-5 h-5" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Content Container (Right Side) */}
                  <div className="relative h-full flex">
                    {/* Optional Subtle Glow on Hover */}
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600/30 to-emerald-600/30 rounded-lg blur-lg opacity-0 group-hover:opacity-60 transition-opacity duration-700 pointer-events-none" />

                    <div className="relative bg-gray-800/70 backdrop-blur-sm rounded-lg border border-gray-700 p-6 md:p-8 flex flex-col justify-between w-full shadow-md">
                      <div>
                        <div className="flex items-center gap-4 mb-4">
                          <div className="p-2 bg-gray-700/60 rounded-lg ring-1 ring-gray-600">
                            <Code2 className="w-6 h-6 text-emerald-400" />
                          </div>
                          <h3 className="text-xl md:text-2xl font-bold text-white">
                            {project.title}
                          </h3>
                        </div>

                        <p className="text-gray-300 mb-6 text-sm md:text-base leading-relaxed">
                          {project.description}
                        </p>

                        <div className="flex flex-wrap gap-2 mb-6">
                          {project.technologies.map((tech) => (
                            <span
                              key={tech}
                              className="px-3 py-1 bg-gray-700/50 text-emerald-300 rounded-full text-xs md:text-sm font-mono ring-1 ring-gray-600/50"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3 mt-auto pt-4 border-t border-gray-700/50">
                        <a
                          href={project.demoLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-5 py-2 text-sm bg-gradient-to-r from-blue-500 to-emerald-500 text-white rounded-md font-medium hover:opacity-90 transition-opacity duration-300 flex items-center gap-2 shadow-sm hover:shadow-lg transform hover:-translate-y-0.5"
                        >
                          <span>Demo</span>
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <a
                          href={project.githubLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-5 py-2 text-sm border border-gray-600 bg-gray-700/50 text-gray-300 rounded-md font-medium hover:bg-gray-700 hover:text-white hover:border-gray-500 transition-all duration-300 flex items-center gap-2 shadow-sm hover:shadow-lg transform hover:-translate-y-0.5"
                        >
                          <span>GitHub</span>
                          <Github className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Message if no projects match filter */}
            {filteredProjects.length === 0 && activeFilter !== "All" && (
              <div
                className={`text-center text-gray-400 py-10 transition-opacity duration-500 ${inView ? "opacity-100" : "opacity-0"
                  }`}
              >
                <p className="text-lg">
                  {currentLang === "es"
                    ? `No se encontraron proyectos en la categoría "${filterLabels[activeFilter].es}".`
                    : `No projects found in the "${filterLabels[activeFilter].en}" category.`}
                </p>
              </div>
            )}
          </div>

          {/* Mobile "View All on GitHub" Link */}
          <div className="mt-16 text-center md:hidden">
            <a
              href="https://github.com/JoaquimColacilli/"
              className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors duration-300 font-medium group"
              target="_blank"
              rel="noopener noreferrer"
            >
              {currentLang === "es"
                ? "Ver todos en GitHub"
                : "View all on GitHub"}
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
