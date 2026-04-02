import React from "react";
import { motion } from "motion/react";
import {
  Globe,
  Server,
  Database,
  Code2,
  MapPin,
  GraduationCap,
} from "lucide-react";
import { useInView } from "../hooks/useInView";
import { useCounter } from "../hooks/useCounter";
import { translations } from "../i18n/translations";

interface SkillCategory {
  name: string;
  icon: React.ReactNode;
  skills: string[];
}

const skillCategories: SkillCategory[] = [
  {
    name: "Frontend",
    icon: <Globe className="w-4 h-4 text-indigo-400" />,
    skills: [
      "JavaScript",
      "TypeScript",
      "React",
      "Next.js",
      "Angular",
      "TailwindCSS",
    ],
  },
  {
    name: "Backend",
    icon: <Server className="w-4 h-4 text-cyan-400" />,
    skills: ["Java", "Spring Boot", "Node.js", "NestJS", "Express"],
  },
  {
    name: "Database",
    icon: <Database className="w-4 h-4 text-indigo-400" />,
    skills: ["PostgreSQL", "MongoDB", "Redis", "MySQL", "Oracle", "Cassandra"],
  },
  {
    name: "Tools & DevOps",
    icon: <Code2 className="w-4 h-4 text-cyan-400" />,
    skills: ["Git", "Docker", "Kubernetes", "AWS", "Jenkins", "OpenShift"],
  },
];

const StatItem = ({
  end,
  suffix,
  label,
  inView,
}: {
  end: number;
  suffix: string;
  label: string;
  inView: boolean;
}) => {
  const count = useCounter(inView ? end : 0, 2000, 0);

  return (
    <div className="text-center">
      <span className="text-3xl font-bold text-white">
        {count}
        {suffix}
      </span>
      <p className="text-sm text-muted mt-1">{label}</p>
    </div>
  );
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: "easeOut" as const },
  }),
};

export const AboutSection = ({ currentLang }: { currentLang: string }) => {
  const t = translations[currentLang as keyof typeof translations];
  const [sectionRef] = useInView({ threshold: 0.1 });
  const [statsRef, statsInView] = useInView({ threshold: 0.3 });

  const yearsOfExperience = new Date().getFullYear() - 2022;

  const stats = [
    { end: yearsOfExperience, suffix: "+", label: t.about.stats.experience },
    { end: 50, suffix: "+", label: t.about.stats.projects },
    { end: 20, suffix: "+", label: t.about.stats.technologies },
    { end: 100, suffix: "%", label: t.about.stats.satisfaction },
  ];

  return (
    <section className="section-padding relative z-10 overflow-hidden" id="about">
      <div
        className="section-container"
        ref={sectionRef as React.RefObject<HTMLDivElement>}
      >
        {/* Section Title */}
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          {t.about.title.split(" ").map((word: string, i: number) => (
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

        {/* Intro Paragraphs */}
        <div className="max-w-3xl mb-12 space-y-4">
          <motion.p
            className="text-lg text-muted leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            {t.about.description}
          </motion.p>
          <motion.p
            className="text-lg text-muted leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {t.about.descriptionTwo}
          </motion.p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Row 1: Stats (2 cols) + Location (1 col) + Education (1 col) */}
          <motion.div
            className="md:col-span-2 bg-surface/60 backdrop-blur-xl border border-subtle/50 rounded-2xl p-6"
            ref={statsRef as React.RefObject<HTMLDivElement>}
            variants={cardVariants}
            custom={0}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            whileHover={{ y: -4, borderColor: "rgba(99,102,241,0.4)" }}
            transition={{ duration: 0.25 }}
          >
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat) => (
                <StatItem
                  key={stat.label}
                  end={stat.end}
                  suffix={stat.suffix}
                  label={stat.label}
                  inView={statsInView}
                />
              ))}
            </div>
          </motion.div>

          <motion.div
            className="bg-surface/60 backdrop-blur-xl border border-subtle/50 rounded-2xl p-6 flex flex-col items-start justify-center gap-3"
            variants={cardVariants}
            custom={1}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            whileHover={{ y: -4, borderColor: "rgba(99,102,241,0.4)" }}
            transition={{ duration: 0.25 }}
          >
            <MapPin className="w-5 h-5 text-indigo-500" />
            <div>
              <p className="text-xs text-muted mb-0.5 uppercase tracking-wider">
                {currentLang === "es" ? "Ubicación" : "Location"}
              </p>
              <p className="text-white font-medium text-sm">Buenos Aires, Argentina</p>
            </div>
          </motion.div>

          <motion.div
            className="bg-surface/60 backdrop-blur-xl border border-subtle/50 rounded-2xl p-6 flex flex-col items-start justify-center gap-3"
            variants={cardVariants}
            custom={2}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            whileHover={{ y: -4, borderColor: "rgba(99,102,241,0.4)" }}
            transition={{ duration: 0.25 }}
          >
            <GraduationCap className="w-5 h-5 text-cyan-400" />
            <div>
              <p className="text-xs text-muted mb-0.5 uppercase tracking-wider">
                {currentLang === "es" ? "Educación" : "Education"}
              </p>
              <p className="text-white font-medium text-sm">
                {currentLang === "es"
                  ? "Analista de Sistemas — UBA"
                  : "B.Sc. Systems Analysis — UBA"}
              </p>
            </div>
          </motion.div>

          {/* Row 2: Tech Stack — full width */}
          <motion.div
            className="md:col-span-2 lg:col-span-4 bg-surface/60 backdrop-blur-xl border border-subtle/50 rounded-2xl p-6"
            variants={cardVariants}
            custom={3}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            whileHover={{ y: -4, borderColor: "rgba(99,102,241,0.4)" }}
            transition={{ duration: 0.25 }}
          >
            <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-5">
              {currentLang === "es" ? "Stack Tecnológico" : "Tech Stack"}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {skillCategories.map((category) => (
                <div key={category.name}>
                  <div className="flex items-center gap-2 mb-2.5">
                    {category.icon}
                    <span className="text-sm font-medium text-white">
                      {category.name}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {category.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2.5 py-1 rounded-full text-xs font-mono bg-elevated text-indigo-300 border border-subtle/50 hover:bg-indigo-500/20 hover:text-indigo-200 hover:border-indigo-500/30 transition"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
