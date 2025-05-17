import React, { useEffect, useRef, useState } from "react";
import { useInView } from "../hooks/useInView";
import { BriefcaseIcon, CheckCircle2, Globe } from "lucide-react";

interface ExperienceProps {
  currentLang: string;
}

export const ExperienceSection: React.FC<ExperienceProps> = ({ currentLang }) => {
  const [sectionRef, inView] = useInView({ threshold: 0.1 });
  const [activeIndex, setActiveIndex] = useState(0);
  const experienceRefs = useRef<(HTMLDivElement | null)[]>([]);
  const timelineRef = useRef<HTMLDivElement>(null);

  const experiences = [
    {
      title: "Full Stack Software Developer - NTT Data",
      period:
        currentLang === "es"
          ? "Abr. 2024 - Actualidad"
          : "Apr. 2024 - Present",
      icon: <BriefcaseIcon className="w-6 h-6 text-emerald-400" />,
      responsibilities: [
        currentLang === "es"
          ? "Desarrollo backend robusto con Spring Boot y Spring Cloud, implementando servicios resilientes y escalables en arquitectura distribuida."
          : "Backend development using Spring Boot and Spring Cloud, building scalable and resilient services within a distributed architecture.",
        currentLang === "es"
          ? "Pruebas unitarias y de integración automatizadas con JUnit y Mockito, garantizando calidad y cobertura en los desarrollos."
          : "Automated unit and integration testing with JUnit and Mockito, ensuring high code quality and coverage.",
        currentLang === "es"
          ? "Optimización de performance mediante uso de índices, cachés locales y consultas SQL ajustadas."
          : "Performance optimization through indexes, local caching, and fine-tuned SQL queries.",
        currentLang === "es"
          ? "Despliegue continuo en contenedores Docker sobre entornos OpenShift con pipelines CI/CD."
          : "Continuous integration and deployment with Docker on OpenShift environments using CI/CD pipelines.",
        currentLang === "es"
          ? "Automatización y control de versiones de scripts de base de datos con Liquibase."
          : "Automation and version control of database scripts using Liquibase.",
        currentLang === "es"
          ? "Comunicación asincrónica entre servicios usando ActiveMQ y patrones de resiliencia (Retry, DLQ)."
          : "Asynchronous communication using ActiveMQ with resilience patterns like Retry and DLQ.",
        currentLang === "es"
          ? "Integración con Angular y TypeScript para interfaces reactivas en proyectos full stack."
          : "Frontend integration with Angular and TypeScript for reactive interfaces in full-stack projects.",
        currentLang === "es"
          ? "Participación activa en code reviews, refinamientos técnicos y decisiones de diseño orientadas a buenas prácticas."
          : "Active involvement in code reviews, technical refinements, and design decisions following best practices.",
        currentLang === "es"
          ? "Monitoreo de servicios con Spring Boot Actuator y documentación de APIs con Swagger."
          : "Service monitoring with Spring Boot Actuator and API documentation using Swagger.",
        currentLang === "es"
          ? "Gestión de versiones y trabajo colaborativo con Git y GitHub, siguiendo flujos de trabajo como GitFlow."
          : "Version control and collaborative work using Git and GitHub, following GitFlow workflows.",
        currentLang === "es"
          ? "Participación en equipos ágiles aplicando Scrum y Kanban, con entregas iterativas y planificación técnica."
          : "Participation in agile teams applying Scrum and Kanban, with iterative delivery and technical planning.",
      ],
      skills: [
        "Spring Boot",
        "Spring Cloud",
        "Java",
        "JUnit",
        "Mockito",
        "Liquibase",
        "ActiveMQ",
        "Angular",
        "TypeScript",
        "Git",
        "OpenShift",
        "Docker",
        "Swagger",
        "Scrum",
        "Kanban",
      ],
    },
    {
      title:
        currentLang === "es"
          ? "Desarrollador Full Stack Freelance"
          : "Full Stack Developer Freelance",
      period:
        currentLang === "es" ? "Ene. 2021 - Actualidad" : "Jan. 2021 - Present",
      icon: <Globe className="w-6 h-6 text-emerald-400" />,
      responsibilities: [
        currentLang === "es"
          ? "Desarrollo de landing pages modernas y responsivas utilizando React y Next.js."
          : "Development of modern and responsive landing pages using React and Next.js.",
        currentLang === "es"
          ? "Implementación de APIs RESTful con Node.js y Express para gestión de datos."
          : "Implementation of RESTful APIs with Node.js and Express for data handling.",
        currentLang === "es"
          ? "Diseño y desarrollo de bases de datos SQL y NoSQL según requerimientos del proyecto."
          : "Design and development of SQL and NoSQL databases based on project needs.",
        currentLang === "es"
          ? "Integración de pasarelas de pago y sistemas de autenticación seguros."
          : "Integration of payment gateways and secure authentication systems.",
        currentLang === "es"
          ? "Optimización SEO y mejora de rendimiento en aplicaciones web."
          : "SEO optimization and performance enhancement in web applications.",
        currentLang === "es"
          ? "Desarrollo de dashboards administrativos personalizados."
          : "Development of customized admin dashboards.",
      ],
      skills: [
        "React",
        "Next.js",
        "Node.js",
        "MongoDB",
        "PostgreSQL",
        "AWS",
        "TailwindCSS",
        "Material UI",
        "Figma",
        "Astro",
        "Angular",
        "Go",
      ],
    },
  ];

  useEffect(() => {
    const handleScroll = () => {
      if (!timelineRef.current) return;

      let closestIndex = 0;
      let minDistance = Infinity;

      experienceRefs.current.forEach((ref, index) => {
        if (ref) {
          const { top, height } = ref.getBoundingClientRect();
          const elementCenter = top + height / 2;
          const distanceToCenter = Math.abs(
            elementCenter - window.innerHeight / 2
          );

          if (distanceToCenter < minDistance) {
            minDistance = distanceToCenter;
            closestIndex = index;
          }
        }
      });

      setActiveIndex((prevIndex) => {
        if (prevIndex !== closestIndex) {
          return closestIndex;
        }
        return prevIndex;
      });
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [experiences.length]);

  return (
    <section
      className="relative py-20 md:py-28 overflow-hidden bg-gray-800/30"
      id="experience"
    >
      {" "}
      <div className="container mx-auto px-4 sm:px-6">
        {" "}
        <div className="max-w-7xl mx-auto">
          <h2
            className={`text-3xl sm:text-4xl font-bold text-white mb-12 md:mb-16 text-center transition-all duration-1000 transform ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}
          >
            {currentLang === "es"
              ? "Experiencia Profesional"
              : "Professional Experience"}
          </h2>
          <div
            ref={sectionRef as React.RefObject<HTMLDivElement>}
            className="relative"
          >
            <div
              ref={timelineRef}
              className={`
                absolute top-0 bottom-0 w-1 bg-gray-700/50 rounded-full
                transform transition-transform duration-700 ease-out origin-top
                ml-4 md:ml-0 md:left-[6.1rem]  /* Margen izquierdo en móvil, posición 'left' en desktop */
                ${inView ? "scale-y-100" : "scale-y-0"}
              `}
            >
              <div
                className="absolute w-full bg-gradient-to-b from-emerald-500 to-blue-500 transition-all duration-300 ease-in-out rounded-full"
                style={{
                  top: `${activeIndex * (100 / experiences.length)}%`,
                  height: `${100 / experiences.length}%`,
                }}
              />
            </div>
            {experiences.map((exp, index) => (
              <div
                key={index}
                ref={(el) => (experienceRefs.current[index] = el)}

                className={`relative pl-12 md:pl-40 mb-12 md:mb-16 transition-all duration-700 ease-out transform ${inView
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 -translate-x-10"
                  }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <div
                  className={`
                    absolute top-1 w-8 h-8 rounded-full flex items-center justify-center
                    transform transition-all duration-300 ease-out
                    left-0 md:left-[6.19rem] md:-translate-x-1/2
                    ${activeIndex === index ? "scale-110" : "scale-100"}
                  `}
                >
                  <div
                    className={`
                    w-4 h-4 rounded-full transition-colors duration-300
                    ring-4 ring-opacity-50
                    ${activeIndex === index
                        ? "bg-emerald-400 ring-emerald-500/30"
                        : "bg-gray-600 ring-gray-700/30"
                      }
                    `}
                  />
                </div>
                <div className="relative group">
                  <div className="absolute -inset-x-4 -inset-y-2 md:-inset-x-6 md:-inset-y-4to-transparent rounded-lg opacity-0 group-hover:opacity-50 transition-opacity duration-300 pointer-events-none" />
                  <div
                    className={`
                      relative bg-gray-800/60 backdrop-blur-sm rounded-lg border transition-all duration-300 ease-out shadow-md
                      ${activeIndex === index
                        ? "border-emerald-500/40 shadow-emerald-500/10"
                        : "border-gray-700/50"
                      }
                       p-6 md:p-8 group-hover:border-gray-600/80
                    `}
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
                      <div className="p-2 bg-gray-700/50 rounded-lg ring-1 ring-gray-600/50 flex-shrink-0">
                        {exp.icon}
                      </div>
                      <div className="flex-grow">
                        <h3 className="text-lg sm:text-xl font-semibold text-white">
                          {exp.title}
                        </h3>
                        <p className="text-sm text-gray-400 mt-1">
                          {exp.period}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3 mt-5">
                      {exp.responsibilities.map((resp, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />{" "}
                          <p className="text-sm text-gray-300 leading-relaxed">
                            {resp}
                          </p>{" "}
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 border-t border-gray-700/50 pt-5 flex flex-wrap gap-2">
                      {exp.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className={`
                            px-3 py-1 bg-gray-700/60 text-emerald-300 rounded-full text-xs sm:text-sm font-mono
                            cursor-default
                            transition-all duration-200 ease-out
                            hover:bg-emerald-600/70 hover:text-white hover:-translate-y-px hover:shadow-md hover:shadow-emerald-500/20
                          `}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>{" "}
                </div>{" "}

              </div>
            ))}{" "}
          </div>{" "}

        </div>{" "}
      </div>{" "}
    </section>
  );
};
