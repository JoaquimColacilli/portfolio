import React from "react";
import { useInView } from "../hooks/useInView";
import { Github, ExternalLink, Code2, ArrowRight } from "lucide-react";

interface ProjectProps {
  currentLang: string;
}

export const ProjectsSection: React.FC<ProjectProps> = ({ currentLang }) => {
  const [sectionRef, inView] = useInView({ threshold: 0.1 });

  const projects = [
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
    },
    {
      title: "El Calculetas",
      description:
        currentLang === "es"
          ? "Administrador financiero que ayuda a organizar tus gastos e ingresos de forma sencilla."
          : "Finance manager that helps you organize your expenses and income easily.",
      image: "/images/projects/el-calculetas.png",
      technologies: ["React", "Firebase", "TailwindCSS"],
      demoLink: "https://el-calculetas.netlify.app/",
      githubLink: "https://github.com/JoaquimColacilli/el-calculetas",
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
      technologies: [
        "React",
        "Node.js",
        "MongoDB",
        "TailwindCSS",
        "OpenAI API",
      ],
      demoLink: "https://joaquimcolacilli.github.io/estimador-desarrollo/",
      githubLink: "https://github.com/JoaquimColacilli/estimador-desarrollo",
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
    },
  ];

  return (
    <section className="relative py-20 overflow-hidden" id="projects">
      <div className="container mx-auto px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-16">
            <h2
              className={`text-4xl font-bold text-white transition-all duration-1000 transform ${
                inView
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
            >
              {currentLang === "es" ? "Proyectos" : "Projects"}
            </h2>
            <div
              className={`hidden md:flex items-center gap-2 text-gray-400 hover:text-white transition-all duration-500 cursor-pointer group transform ${
                inView
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
                  ? "Ver todos los proyectos"
                  : "View all projects"}
              </a>

              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" />
            </div>
          </div>

          <div
            ref={sectionRef as React.RefObject<HTMLDivElement>}
            className="grid gap-24"
          >
            {projects.map((project, index) => (
              <div
                key={project.title}
                className={`group relative transition-all duration-1000 transform ${
                  inView
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-20"
                }`}
                style={{ transitionDelay: `${index * 200}ms` }}
              >
                {/* Project Card */}
                <div className="relative grid lg:grid-cols-2 gap-8 items-stretch">
                  {/* Image Container */}
                  <div className="relative overflow-hidden rounded-lg border border-gray-800 group-hover:border-gray-700 transition-colors duration-500 aspect-video lg:aspect-auto h-full">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-emerald-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative h-full">
                      <img
                        src={project.image}
                        alt={project.title}
                        className="w-full h-full object-cover transition-transform duration-700 ease-out transform group-hover:scale-105"
                      />
                      {/* Overlay on hover */}
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-900/70 to-gray-900 opacity-0 group-hover:opacity-100 transition-all duration-500">
                        <div className="absolute inset-0 flex items-center justify-center gap-6">
                          <a
                            href={project.demoLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white hover:bg-emerald-600 transition-all duration-300 transform translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 hover:scale-110"
                            style={{ transitionDelay: "100ms" }}
                          >
                            <ExternalLink className="w-5 h-5" />
                          </a>
                          <a
                            href={project.githubLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center text-white hover:bg-gray-700 transition-all duration-300 transform translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 hover:scale-110"
                            style={{ transitionDelay: "200ms" }}
                          >
                            <Github className="w-5 h-5" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Content Container */}
                  <div className="relative h-full flex">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-emerald-500/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-8 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-4 mb-6">
                          <div className="p-2 bg-gray-700/50 rounded-lg">
                            <Code2 className="w-6 h-6 text-emerald-400" />
                          </div>
                          <h3 className="text-2xl font-bold text-white">
                            {project.title}
                          </h3>
                        </div>

                        <p className="text-gray-300 mb-8 leading-relaxed">
                          {project.description}
                        </p>

                        <div className="flex flex-wrap gap-2 mb-8">
                          {project.technologies.map((tech) => (
                            <span
                              key={tech}
                              className="px-3 py-1 bg-gray-700/50 text-emerald-400 rounded-full text-sm"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <a
                          href={project.demoLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-6 py-2 bg-gradient-to-r from-blue-500 to-emerald-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
                        >
                          <span>Demo</span>
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <a
                          href={project.githubLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-6 py-2 border border-gray-700 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center gap-2"
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
          </div>
        </div>
      </div>
    </section>
  );
};
