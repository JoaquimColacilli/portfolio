import React, { useEffect, useRef, useState } from "react";
import { useInView } from "../hooks/useInView";
import { BriefcaseIcon, CheckCircle2, Globe } from "lucide-react";

interface ExperienceProps {
  currentLang: string;
}

export const ExperienceSection: React.FC<ExperienceProps> = ({
  currentLang,
}) => {
  const [sectionRef, inView] = useInView({ threshold: 0.1 });
  const [activeIndex, setActiveIndex] = useState(0); // Mantenemos el estado para resaltar la experiencia activa
  const experienceRefs = useRef<(HTMLDivElement | null)[]>([]);
  const timelineRef = useRef<HTMLDivElement>(null);

  // --- Datos de Experiencia (sin cambios en la estructura, solo como referencia) ---
  const experiences = [
    {
      title:
        currentLang === "es"
          ? "Full Stack Software Developer - NTT Data"
          : "Full Stack Software Developer - NTT Data",
      period:
        currentLang === "es"
          ? "Sept. 2022 - Actualidad"
          : "Sept. 2022 - Present",
      icon: <BriefcaseIcon className="w-6 h-6 text-emerald-400" />,
      responsibilities: [
        currentLang === "es"
          ? "Creación de microservicios desde cero con Java Spring Boot."
          : "Creation of microservices from scratch with Java Spring Boot.",
        currentLang === "es"
          ? "Implementación de sistemas de mensajería en cola para comunicación asincrónica"
          : "Implementation of queue messaging systems for asynchronous communication",
        currentLang === "es"
          ? "Desarrollo de operaciones CRUD para gestión eficiente de datos."
          : "Development of CRUD operations for efficient data management.",
        currentLang === "es"
          ? "Mantenimiento y mejora continua de microservicios existentes."
          : "Maintenance and continuous improvement of existing microservices.",
        currentLang === "es"
          ? "Uso de Postman para pruebas y documentación exhaustiva de APIs."
          : "Use of Postman for testing and comprehensive API documentation.",
        currentLang === "es"
          ? "Optimización de código antiguo mediante refactorización y adopción de buenas prácticas de programación."
          : "Optimization of legacy code through refactoring and adoption of good programming practices.",
        currentLang === "es"
          ? "Integración al Front-End con Angular y TypeScript para interfaces dinámicas."
          : "Front-End integration with Angular and TypeScript for dynamic interfaces.",
        currentLang === "es"
          ? "Ejecución y control de versiones de scripts de base de datos con Liquibase."
          : "Execution and version control of database scripts with Liquibase.",
      ],
      skills: [
        "Microservicios",
        "Java",
        "Spring Cloud",
        "Spring Boot",
        "TypeScript",
        "Angular",
        "Postman",
        "Liquibase",
        "Scrum",
        "Git",
      ],
    },
    {
      title:
        currentLang === "es"
          ? "Desarrollador Full Stack Freelance"
          : "Full Stack Developer Freelance",
      period:
        currentLang === "es" ? "Ene. 2021 - Acualidad" : "Jan. 2021 - Present",
      icon: <Globe className="w-6 h-6 text-emerald-400" />,
      responsibilities: [
        currentLang === "es"
          ? "Desarrollo de landing pages modernas y responsivas utilizando React y Next.js."
          : "Development of modern and responsive landing pages using React and Next.js.",
        currentLang === "es"
          ? "Implementación de APIs RESTful con Node.js y Express para gestión de datos."
          : "Implementation of RESTful APIs with Node.js and Express for data management.",
        currentLang === "es"
          ? "Diseño y desarrollo de bases de datos SQL y NoSQL según requerimientos del proyecto."
          : "Design and development of SQL and NoSQL databases according to project requirements.",
        currentLang === "es"
          ? "Integración de pasarelas de pago y sistemas de autenticación seguros."
          : "Integration of payment gateways and secure authentication systems.",
        currentLang === "es"
          ? "Optimización SEO y mejora de rendimiento en aplicaciones web."
          : "SEO optimization and performance improvement in web applications.",
        currentLang === "es"
          ? "Desarrollo de dashboards administrativos personalizados."
          : "Development of custom administrative dashboards.",
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
  // --- Fin Datos de Experiencia ---

  // --- Hook para detectar la experiencia activa al hacer scroll (sin cambios) ---
  useEffect(() => {
    const handleScroll = () => {
      if (!timelineRef.current) return; // Salir si la referencia no está lista

      // Encuentra la experiencia más cercana al centro de la ventana
      let closestIndex = 0;
      let minDistance = Infinity;

      experienceRefs.current.forEach((ref, index) => {
        if (ref) {
          const { top, height } = ref.getBoundingClientRect();
          // Calculamos el centro del elemento de experiencia
          const elementCenter = top + height / 2;
          // Distancia del centro del elemento al centro de la ventana
          const distanceToCenter = Math.abs(
            elementCenter - window.innerHeight / 2
          );

          // Si este elemento está más cerca que el mínimo encontrado hasta ahora
          if (distanceToCenter < minDistance) {
            minDistance = distanceToCenter;
            closestIndex = index;
          }
        }
      });

      // Actualiza el índice activo solo si ha cambiado
      setActiveIndex((prevIndex) => {
        if (prevIndex !== closestIndex) {
          return closestIndex;
        }
        return prevIndex;
      });
    };

    // Ejecutar una vez al montar para establecer el estado inicial
    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true }); // Usar passive: true para mejor rendimiento
    return () => window.removeEventListener("scroll", handleScroll);
  }, [experiences.length]); // Dependencia: longitud de experiencias por si cambia dinámicamente

  return (
    <section
      className="relative py-20 md:py-28 overflow-hidden bg-gray-800/30"
      id="experience"
    >
      {" "}
      {/* Ajuste padding y bg */}
      <div className="container mx-auto px-4 sm:px-6">
        {" "}
        {/* Ajuste padding horizontal */}
        <div className="max-w-7xl mx-auto">
          {/* Título de la Sección */}
          <h2
            className={`text-3xl sm:text-4xl font-bold text-white mb-12 md:mb-16 text-center transition-all duration-1000 transform ${
              inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            {currentLang === "es"
              ? "Experiencia Profesional"
              : "Professional Experience"}
          </h2>
          {/* Contenedor del Timeline */}
          <div
            ref={sectionRef as React.RefObject<HTMLDivElement>}
            className="relative"
          >
            {/* Línea del Timeline (Ajustada para Responsividad) */}
            <div
              ref={timelineRef}
              className={`
                absolute top-0 bottom-0 w-1 bg-gray-700/50 rounded-full
                transform transition-transform duration-700 ease-out origin-top
                ml-4 md:ml-0 md:left-[6.1rem]  /* Margen izquierdo en móvil, posición 'left' en desktop */
                ${inView ? "scale-y-100" : "scale-y-0"}
              `}
            >
              {/* Segmento activo de la línea */}
              <div
                className="absolute w-full bg-gradient-to-b from-emerald-500 to-blue-500 transition-all duration-300 ease-in-out rounded-full"
                style={{
                  top: `${activeIndex * (100 / experiences.length)}%`,
                  height: `${100 / experiences.length}%`,
                }}
              />
            </div>
            {/* Mapeo de Experiencias */}
            {experiences.map((exp, index) => (
              <div
                key={index}
                ref={(el) => (experienceRefs.current[index] = el)}
                // **Ajuste Responsivo de Padding Izquierdo:**
                // pl-12 en móvil (espacio para línea y punto), md:pl-40 en desktop
                className={`relative pl-12 md:pl-40 mb-12 md:mb-16 transition-all duration-700 ease-out transform ${
                  inView
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 -translate-x-10"
                }`}
                style={{ transitionDelay: `${index * 150}ms` }} // Reducido delay
              >
                {/* Punto del Timeline (Ajustado para Responsividad) */}
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
                    ${
                      activeIndex === index
                        ? "bg-emerald-400 ring-emerald-500/30"
                        : "bg-gray-600 ring-gray-700/30"
                    }
                    `}
                  />
                </div>
                {/* Contenedor del Contenido de la Experiencia */}
                <div className="relative group">
                  {/* Sombra/Borde sutil en hover */}
                  <div className="absolute -inset-x-4 -inset-y-2 md:-inset-x-6 md:-inset-y-4to-transparent rounded-lg opacity-0 group-hover:opacity-50 transition-opacity duration-300 pointer-events-none" />
                  {/* Tarjeta de Contenido */}
                  <div
                    className={`
                      relative bg-gray-800/60 backdrop-blur-sm rounded-lg border transition-all duration-300 ease-out shadow-md
                      ${
                        activeIndex === index
                          ? "border-emerald-500/40 shadow-emerald-500/10"
                          : "border-gray-700/50"
                      }
                       p-6 md:p-8 group-hover:border-gray-600/80
                    `}
                  >
                    {/* Encabezado (Icono, Título, Período) */}
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

                    {/* Lista de Responsabilidades */}
                    <div className="space-y-3 mt-5">
                      {exp.responsibilities.map((resp, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />{" "}
                          {/* Ajuste vertical */}
                          <p className="text-sm text-gray-300 leading-relaxed">
                            {resp}
                          </p>{" "}
                          {/* Ajuste tamaño/leading */}
                        </div>
                      ))}
                    </div>

                    {/* Lista de Habilidades/Tecnologías */}
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
                  {/* Fin Tarjeta de Contenido */}
                </div>{" "}
                {/* Fin Contenedor group */}
              </div> // Fin Contenedor de Experiencia Individual
            ))}{" "}
            {/* Fin map */}
          </div>{" "}
          {/* Fin Contenedor del Timeline */}
        </div>{" "}
        {/* Fin max-w-7xl */}
      </div>{" "}
      {/* Fin container */}
    </section> // Fin section
  );
};
