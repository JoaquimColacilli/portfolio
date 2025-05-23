import React from "react";
import { Code2, Database, Globe, Server } from "lucide-react";
import { useInView } from "../hooks/useInView";
import { StatCard } from "./StatCard";
import { SkillCard } from "./SkillCard";

interface SkillCategory {
  name: string;
  icon: React.ReactNode;
  skills: string[];
}

export const AboutSection = ({ currentLang }: { currentLang: string }) => {
  const [titleRef, titleInView] = useInView({ threshold: 0.3 });
  const [aboutRef, aboutInView] = useInView({ threshold: 0.3 });
  const [skillsRef, skillsInView] = useInView({ threshold: 0.2 });
  const [statsRef, statsInView] = useInView({ threshold: 0.5 });
  const [profileRef, profileInView] = useInView({ threshold: 0.3 });

  const skillCategories: SkillCategory[] = [
    {
      name: "Frontend",
      icon: <Globe className="w-6 h-6" />,
      skills: [
        "JavaScript",
        "TypeScript",
        "React",
        "Next.js",
        "Angular",
        "TailwindCSS",
        "Material UI",
        "GraphQL",
      ],
    },
    {
      name: "Backend",
      icon: <Server className="w-6 h-6" />,
      skills: [
        "Java",
        "Spring Boot",
        "Node.js",
        "Express",
        "NestJS",
        "Laravel",
      ],
    },
    {
      name: "Database",
      icon: <Database className="w-6 h-6" />,
      skills: ["PostgreSQL", "MongoDB", "Redis", "MySQL", "Oracle", "DynamoDB"],
    },
    {
      name: "Tools & DevOps",
      icon: <Code2 className="w-6 h-6" />,
      skills: ["Git", "Docker", "Kubernetes", "AWS", "Jenkins"],
    },
  ];

  const stats = [
    {
      value: 3,
      label:
        currentLang === "es" ? "Años de experiencia" : "Years of experience",
    },
    {
      value: 50,
      label:
        currentLang === "es" ? "Proyectos completados" : "Completed projects",
    },
    {
      value: 20,
      label:
        currentLang === "es"
          ? "Tecnologías dominadas"
          : "Technologies mastered",
    },
    {
      value: 100,
      label:
        currentLang === "es"
          ? "Satisfacción del cliente"
          : "Client satisfaction",
    },
  ];

  return (
    <section className="relative py-20 overflow-hidden" id="about">
      <div className="container mx-auto px-6">
        {/* Profile Section */}
        <div
          ref={profileRef as React.RefObject<HTMLDivElement>}
          className={`flex flex-col md:flex-row items-center mb-20 transition-all duration-1000 transform ${profileInView
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-10"
            }`}
        ></div>

        {/* About Me */}
        <div className="max-w-7xl mx-auto mb-20">
          <div className="mb-20">
            <h2
              ref={titleRef as React.RefObject<HTMLHeadingElement>}
              className={`text-4xl font-bold text-white mb-8 transition-all duration-1000 transform ${titleInView
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
                }`}
            >
              {currentLang === "es" ? "Sobre mí" : "About Me"}
            </h2>
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div
                ref={aboutRef as React.RefObject<HTMLDivElement>}
                className={`space-y-6 transition-all duration-1000 transform ${aboutInView
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-10"
                  }`}
                style={{ transitionDelay: "200ms" }}
              >
                <p className="text-xl text-gray-300 leading-relaxed">
                  {currentLang === "es"
                    ? "Soy un desarrollador Full Stack apasionado por crear soluciones web innovadoras y escalables. Con experiencia en el desarrollo de aplicaciones web modernas, me especializo en construir experiencias digitales excepcionales."
                    : "I'm a Full Stack Developer passionate about creating innovative and scalable web solutions. With experience in modern web application development, I specialize in building exceptional digital experiences."}
                </p>
                <p className="text-xl text-gray-300 leading-relaxed">
                  {currentLang === "es"
                    ? "Mi enfoque se centra en escribir código limpio y mantenible, siempre buscando las mejores prácticas y nuevas tecnologías para fortalecer mis habilidades."
                    : "My approach focuses on writing clean and maintainable code, always seeking best practices and new technologies to enhance my skills."}
                </p>
              </div>
              <div
                ref={statsRef as React.RefObject<HTMLDivElement>}
                className={`relative group transition-all duration-1000 transform ${statsInView
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-10"
                  }`}
                style={{ transitionDelay: "400ms" }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-lg blur-xl opacity-25 group-hover:opacity-40 transition-opacity duration-500" />
                <div className="relative p-6 bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700">
                  <div className="grid grid-cols-2 gap-4">
                    {stats.map((stat, index) => (
                      <StatCard
                        key={index}
                        value={stat.value}
                        label={stat.label}
                        inView={statsInView}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div>
            <h2
              className={`text-4xl font-bold text-white mb-12 transition-all duration-1000 transform ${skillsInView
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
                }`}
            >
              {currentLang === "es" ? "Habilidades" : "Skills"}
            </h2>
            <div
              ref={skillsRef as React.RefObject<HTMLDivElement>}
              className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
            >
              {skillCategories.map((category, index) => (
                <SkillCard
                  key={category.name}
                  name={category.name}
                  icon={category.icon}
                  skills={category.skills}
                  delay={index * 100}
                  inView={skillsInView}
                  currentLang={currentLang}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
