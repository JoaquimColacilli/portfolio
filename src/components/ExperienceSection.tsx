import React, { useEffect, useRef, useState } from 'react';
import { useInView } from '../hooks/useInView';
import { BriefcaseIcon, CheckCircle2, Globe, Code2 } from 'lucide-react';

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
      title: currentLang === 'es' ? 'Full Stack Software Developer - NTT Data' : 'Full Stack Software Developer - NTT Data',
      period: currentLang === 'es' ? 'Sept. 2022 - Actualidad' : 'Sept. 2022 - Present',
      icon: <BriefcaseIcon className="w-6 h-6 text-emerald-400" />,
      responsibilities: [
        currentLang === 'es' ? 'Creación de microservicios desde cero con Java Spring Boot.' : 'Creation of microservices from scratch with Java Spring Boot.',
        currentLang === 'es' ? 'Implementación de sistemas de mensajería en cola para comunicación asincrónica' : 'Implementation of queue messaging systems for asynchronous communication',
        currentLang === 'es' ? 'Desarrollo de operaciones CRUD para gestión eficiente de datos.' : 'Development of CRUD operations for efficient data management.',
        currentLang === 'es' ? 'Mantenimiento y mejora continua de microservicios existentes.' : 'Maintenance and continuous improvement of existing microservices.',
        currentLang === 'es' ? 'Uso de Postman para pruebas y documentación exhaustiva de APIs.' : 'Use of Postman for testing and comprehensive API documentation.',
        currentLang === 'es' ? 'Optimización de código antiguo mediante refactorización y adopción de buenas prácticas de programación.' : 'Optimization of legacy code through refactoring and adoption of good programming practices.',
        currentLang === 'es' ? 'Integración al Front-End con Angular y TypeScript para interfaces dinámicas.' : 'Front-End integration with Angular and TypeScript for dynamic interfaces.',
        currentLang === 'es' ? 'Ejecución y control de versiones de scripts de base de datos con Liquibase.' : 'Execution and version control of database scripts with Liquibase.',
      ],
      skills: ['TypeScript', 'Scrum', 'Microservicios', 'Spring Cloud', 'Spring Boot']
    },
    {
      title: currentLang === 'es' ? 'Desarrollador Full Stack Freelance' : 'Full Stack Developer Freelance',
      period: currentLang === 'es' ? 'Ene. 2021 - Actualidad' : 'Jan. 2021 - Present',
      icon: <Globe className="w-6 h-6 text-emerald-400" />,
      responsibilities: [
        currentLang === 'es' ? "Desarrollo de landing pages modernas y responsivas utilizando frameworks y tecnologías de frontend como React, Next.js, entre otras."
: "Development of modern and responsive landing pages using frontend frameworks and technologies such as React, Next.js, among others.",
        currentLang === 'es' ? 'Implementación de APIs RESTful con Node.js y Express para gestión de datos.' : 'Implementation of RESTful APIs with Node.js and Express for data management.',
        currentLang === 'es' ? 'Diseño y desarrollo de bases de datos SQL y NoSQL según requerimientos del proyecto.' : 'Design and development of SQL and NoSQL databases according to project requirements.',
        currentLang === 'es' ? 'Integración de pasarelas de pago y sistemas de autenticación seguros.' : 'Integration of payment gateways and secure authentication systems.',
        currentLang === 'es' ? 'Optimización SEO y mejora de rendimiento en aplicaciones web.' : 'SEO optimization and performance improvement in web applications.',
        currentLang === 'es' ? 'Desarrollo de dashboards administrativos personalizados.' : 'Development of custom administrative dashboards.',
      ],
      skills: ['React', 'Next.js', 'Node.js', 'MongoDB', 'PostgreSQL', 'AWS']
    }
  ];

  useEffect(() => {
    const handleScroll = () => {
      if (!timelineRef.current) return;
      
      const timelineRect = timelineRef.current.getBoundingClientRect();
      const timelineCenter = timelineRect.top + timelineRect.height / 2;
      
      experienceRefs.current.forEach((ref, index) => {
        if (ref) {
          const { top, height } = ref.getBoundingClientRect();
          const elementCenter = top + height / 2;
          
          // Calculamos la distancia al centro de la pantalla
          const distanceToCenter = Math.abs(elementCenter - window.innerHeight / 2);
          
          // Si está más cerca del centro que el actual activo, lo activamos
          if (distanceToCenter < window.innerHeight / 3) {
            setActiveIndex(index);
          }
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className="relative py-20 overflow-hidden" id="experience">
      <div className="container mx-auto px-6">
        <div className="max-w-7xl mx-auto">
          <h2 
            className={`text-4xl font-bold text-white mb-16 transition-all duration-1000 transform ${
              inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            {currentLang === 'es' ? 'Experiencia' : 'Experience'}
          </h2>

          <div 
            ref={sectionRef as React.RefObject<HTMLDivElement>}
            className="relative"
          >
            {/* Timeline line */}
            <div 
              ref={timelineRef}
              className="absolute left-24 top-0 bottom-0 w-1 bg-gray-700"
            >
              <div 
                className="absolute w-1 bg-gradient-to-b from-emerald-500 to-blue-500 transition-all duration-500 ease-in-out"
                style={{
                  top: `${(activeIndex * (100 / experiences.length))}%`,
                  height: `${100 / experiences.length}%`
                }}
              />
            </div>

            {experiences.map((exp, index) => (
              <div
                key={index}
                ref={el => experienceRefs.current[index] = el}
                className={`relative pl-40 mb-16 transition-all duration-1000 transform ${
                  inView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
                }`}
                style={{ transitionDelay: `${index * 200}ms` }}
              >
                {/* Timeline dot */}
                <div 
  style={{
    left: '6.125rem' // Ajusta este valor según el desplazamiento exacto que necesitas
  }}
  className={`absolute top-8 transform -translate-x-1/2 transition-all duration-300 ${
    activeIndex === index ? 'scale-125' : 'scale-100'
  }`}
>
                  <div className={`w-4 h-4 rounded-full ${
                    activeIndex === index ? 'bg-emerald-500' : 'bg-gray-600'
                  } ring-4 ring-gray-800 ring-opacity-30 transition-colors duration-300`} />
                </div>

                <div className="relative group">
                  {/* Background Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-emerald-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Content Container */}
                  <div className={`relative bg-gray-800/50 backdrop-blur-sm rounded-lg border transition-all duration-300 ${
                    activeIndex === index ? 'border-emerald-500/50' : 'border-gray-700'
                  } p-8 group-hover:border-gray-600`}>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="p-2 bg-gray-700/50 rounded-lg">
                        {exp.icon}
                      </div>
                      <div>
                        <h3 className="text-2xl font-semibold text-white">{exp.title}</h3>
                        <p className="text-gray-400 mt-1">{exp.period}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {exp.responsibilities.map((resp, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-1" />
                          <p className="text-gray-300">{resp}</p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-8 flex flex-wrap gap-2">
                      {exp.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-gray-700/50 text-emerald-400 rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      ))}
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