import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "motion/react";
import { Globe } from "lucide-react";
import { translations } from "../i18n/translations";

interface ExperienceProps {
  currentLang: string;
}

interface ExperienceItem {
  title: string;
  company: string;
  period: string;
  logo?: string;
  responsibilities: string[];
  skills: string[];
}

export const ExperienceSection: React.FC<ExperienceProps> = ({ currentLang }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const timelineRef = useRef<HTMLDivElement>(null);

  const experiences: ExperienceItem[] = [
    {
      title: "Software Developer",
      company: "Despegar",
      period: currentLang === "es" ? "Feb. 2026 — Actualidad" : "Feb. 2026 — Present",
      logo: "/images/despegar-logo.jpeg",
      responsibilities: [
        currentLang === "es"
          ? "Desarrollo y mantenimiento frontend para Cross Selling, con foco en UX y conversión."
          : "Frontend development and maintenance for Cross Selling, focused on UX and conversion.",
        currentLang === "es"
          ? "Componentes reutilizables e integración con APIs, cuidando performance y calidad."
          : "Reusable components and API integrations, ensuring performance and quality.",
        currentLang === "es"
          ? "Trabajo colaborativo con Producto, Diseño y Backend, aplicando reviews y estándares."
          : "Cross-team collaboration with Product, Design, and Backend, applying reviews and standards.",
      ],
      skills: ["React", "TypeScript", "TailwindCSS", "API Integration", "Performance Optimization"],
    },
    {
      title: "Software Developer",
      company: "Almundo",
      period: currentLang === "es" ? "Jun. 2025 — Feb. 2026" : "Jun. 2025 — Feb. 2026",
      logo: "/images/almundo-logo.png",
      responsibilities: [
        currentLang === "es"
          ? "Verticales de Autos y Circuitos: Angular (17/18) + Java/Spring Boot 3."
          : "Cars and Tours verticals: Angular (17/18) + Java/Spring Boot 3.",
        currentLang === "es"
          ? "Micrositios white-label para partners: parametrización, SEO y performance."
          : "White-label microsites for partners: parameterization, SEO and performance.",
        currentLang === "es"
          ? "BackOffice: feature flags, permisos, reportes y herramientas de soporte."
          : "BackOffice: feature flags, permissions, reports and support tools.",
        currentLang === "es"
          ? "Integración de proveedor de Autos (CNET) con retries, validaciones y resiliencia."
          : "Car provider integration (CNET) with retries, validations and resilience.",
        currentLang === "es"
          ? "Arquitectura hexagonal, pipelines idempotentes, MongoDB, Cassandra, OpenSearch."
          : "Hexagonal architecture, idempotent pipelines, MongoDB, Cassandra, OpenSearch.",
      ],
      skills: ["Angular", "Spring Boot", "Java", "MongoDB", "Cassandra", "OpenSearch", "Docker", "Microservices"],
    },
    {
      title: "Software Developer",
      company: "NTT Data",
      period: currentLang === "es" ? "Sep. 2022 — Jun. 2025" : "Sep. 2022 — Jun. 2025",
      logo: "/images/nttdata-logo.png",
      responsibilities: [
        currentLang === "es"
          ? "Diseño de sistemas distribuidos escalables con Spring Boot y Spring Cloud."
          : "Design of scalable distributed systems with Spring Boot and Spring Cloud.",
        currentLang === "es"
          ? "APIs RESTful con WebFlux, Circuit Breaker y Retry (Resilience4j)."
          : "RESTful APIs with WebFlux, Circuit Breaker and Retry (Resilience4j).",
        currentLang === "es"
          ? "Optimización de PostgreSQL y Oracle: índices, query tuning, Hibernate tuning."
          : "PostgreSQL and Oracle optimization: indexes, query tuning, Hibernate tuning.",
        currentLang === "es"
          ? "Procesamiento asíncrono con RabbitMQ y ActiveMQ."
          : "Async processing with RabbitMQ and ActiveMQ.",
        currentLang === "es"
          ? "CI/CD con GitLab y Jenkins, deploy en OpenShift."
          : "CI/CD with GitLab and Jenkins, deploy on OpenShift.",
      ],
      skills: ["Spring Boot", "Spring Cloud", "WebFlux", "PostgreSQL", "RabbitMQ", "Docker", "OpenShift", "Jenkins"],
    },
    {
      title: currentLang === "es" ? "Desarrollador Full Stack" : "Full Stack Developer",
      company: "Freelance",
      period: currentLang === "es" ? "Ene. 2021 — Actualidad" : "Jan. 2021 — Present",
      logo: undefined,
      responsibilities: [
        currentLang === "es"
          ? "Landing pages modernas y responsivas con React y Next.js."
          : "Modern, responsive landing pages with React and Next.js.",
        currentLang === "es"
          ? "APIs RESTful con Node.js y Express."
          : "RESTful APIs with Node.js and Express.",
        currentLang === "es"
          ? "Dashboards administrativos personalizados y optimización SEO."
          : "Custom admin dashboards and SEO optimization.",
      ],
      skills: ["React", "Next.js", "Node.js", "MongoDB", "PostgreSQL", "TailwindCSS", "AWS"],
    },
  ];

  const handleScroll = useCallback(() => {
    let closestIndex = 0;
    let minDistance = Infinity;

    cardRefs.current.forEach((ref, index) => {
      if (ref) {
        const { top, height } = ref.getBoundingClientRect();
        const elementCenter = top + height / 2;
        const distanceToCenter = Math.abs(elementCenter - window.innerHeight / 2);

        if (distanceToCenter < minDistance) {
          minDistance = distanceToCenter;
          closestIndex = index;
        }
      }
    });

    setActiveIndex(closestIndex);
  }, []);

  useEffect(() => {
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const timelineProgress = ((activeIndex + 0.5) / experiences.length) * 100;

  return (
    <section className="section-padding relative z-10 overflow-hidden" id="experience">
      <div className="section-container">
        {/* Section title */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-16 md:mb-20">
          {((translations as Record<string, any>)[currentLang].experience.title as string)
            .split(" ")
            .map((word: string, i: number) => (
              <motion.span
                key={i}
                className="inline-block mr-[0.25em] last:mr-0 gradient-text"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: i * 0.1, duration: 0.5, ease: "easeOut" }}
              >
                {word}
              </motion.span>
            ))}
        </h2>

        {/* Timeline container */}
        <div className="relative max-w-4xl mx-auto">
          {/* Timeline line */}
          <div
            ref={timelineRef}
            className="absolute top-0 bottom-0 left-[5px] md:left-[9px] w-[2px] bg-[#2A2A3C]/60"
          >
            {/* Animated gradient fill */}
            <motion.div
              className="absolute top-0 left-0 w-full rounded-full"
              style={{
                background: "linear-gradient(to bottom, #6366f1, #22d3ee)",
              }}
              initial={{ height: "0%" }}
              animate={{ height: `${timelineProgress}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>

          {/* Experience cards */}
          <div className="space-y-10 md:space-y-14">
            {experiences.map((exp, index) => (
              <motion.div
                key={index}
                ref={(el) => {
                  cardRefs.current[index] = el;
                }}
                className="relative pl-10 md:pl-16"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                  ease: "easeOut",
                }}
              >
                {/* Timeline dot */}
                <div
                  className={`
                    absolute top-8 left-0 md:left-[4px]
                    w-3 h-3 rounded-full border-2 transition-all duration-300
                    ${
                      activeIndex === index
                        ? "bg-indigo-500 border-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.6)]"
                        : "bg-[#1C1C2A] border-[#2A2A3C]"
                    }
                  `}
                />

                {/* Card */}
                <div
                  className={`
                    bg-[#12121A]/60 backdrop-blur-sm border rounded-xl p-6 md:p-8
                    transition-all duration-300
                    ${
                      activeIndex === index
                        ? "border-indigo-500/40 shadow-lg shadow-indigo-500/5"
                        : "border-[#2A2A3C]/50 hover:border-[#2A2A3C]"
                    }
                  `}
                >
                  {/* Header: logo/icon + title + period */}
                  <div className="flex items-start gap-4 mb-5">
                    {/* Logo or fallback icon */}
                    {exp.logo ? (
                      <div className="flex-shrink-0">
                        <img
                          src={exp.logo}
                          alt={`${exp.company} logo`}
                          className="w-12 h-12 object-contain rounded-lg bg-white/90 p-1.5"
                        />
                      </div>
                    ) : (
                      <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-[#1C1C2A] border border-[#2A2A3C] flex items-center justify-center">
                        <Globe className="w-5 h-5 text-indigo-400" />
                      </div>
                    )}

                    <div className="flex-grow min-w-0">
                      <h3 className="text-lg md:text-xl font-bold text-white leading-tight">
                        {exp.title}
                      </h3>
                      <p className="text-base font-semibold text-white/80 mt-0.5">
                        {exp.company}
                      </p>
                      <p className="text-sm text-[#8888A0] font-mono mt-1">
                        {exp.period}
                      </p>
                    </div>
                  </div>

                  {/* Responsibilities */}
                  <ul className="space-y-2 mb-6">
                    {exp.responsibilities.map((resp, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2" />
                        <span className="text-sm text-gray-300 leading-relaxed">
                          {resp}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* Skills pills */}
                  <div className="border-t border-[#2A2A3C]/50 pt-5 flex flex-wrap gap-2">
                    {exp.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-full text-xs font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 transition-colors duration-200 hover:bg-indigo-500/20 hover:text-indigo-200"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
