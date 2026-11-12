import type { Text } from './content';

export type ProjectKind = 'client' | 'website' | 'desktop';

export interface Project {
  /** also the image file name: public/images/projects/<slug>-640.webp and -1280.webp */
  slug: string;
  title: string;
  kind: ProjectKind;
  description: Text;
  stack: string[];
  live?: string;
  /** only repositories that are public */
  source?: string;
  /** shown large at the top of the Work sheet */
  featured?: boolean;
}

const gh = (repo: string) => `https://github.com/JoaquimColacilli/${repo}`;

export const projects: Project[] = [
  {
    slug: 'merced',
    title: 'Merced Edificio',
    kind: 'client',
    featured: true,
    description: {
      en: 'Landing page for the Merced building, made with Cubiqa. Immersive design with a gallery of units and built-in contact.',
      es: 'Landing page para el edificio Merced, desarrollada con Cubiqa. Diseño inmersivo con galería de unidades y contacto integrado.',
    },
    stack: ['Next.js', 'React', 'Tailwind CSS', 'Framer Motion'],
    live: 'https://merced-edificio.netlify.app/',
  },
  {
    slug: 'primatech',
    title: 'Primatech',
    kind: 'client',
    featured: true,
    description: {
      en: 'Corporate site for a technology solutions company covering web, mobile and cloud services.',
      es: 'Sitio corporativo para una empresa de soluciones tecnológicas: desarrollo web, mobile y servicios cloud.',
    },
    stack: ['Next.js', 'Tailwind CSS', 'Framer Motion', 'MongoDB', 'Node.js'],
    live: 'https://primatech.com.ar/',
  },
  {
    slug: 'mas-facil-imposible',
    title: 'Más Fácil Imposible',
    kind: 'website',
    featured: true,
    description: {
      en: 'Personal finance app to track expenses, income, investments and savings, with dashboards and live metrics.',
      es: 'App de finanzas personales para controlar gastos, ingresos, inversiones y ahorros, con dashboards y métricas en tiempo real.',
    },
    stack: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Supabase'],
    live: 'https://mas-facil-imposible.netlify.app/dashboard',
    source: gh('mas-facil-imposible'),
  },
  {
    slug: 'bramelec',
    title: 'Bramelec',
    kind: 'client',
    featured: true,
    description: {
      en: 'Site for an electrical installations studio specializing in building electrical plans.',
      es: 'Sitio para un estudio de instalaciones eléctricas especializado en planos para edificios.',
    },
    stack: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Framer Motion'],
    live: 'https://bramelec.com/',
    source: gh('bramelec'),
  },
  {
    slug: 'cubiqa-landing',
    title: 'Cubiqa Landing',
    kind: 'website',
    description: {
      en: 'Landing page template for Cubiqa, a studio for immersive architectural experiences.',
      es: 'Template de landing page para Cubiqa, estudio de experiencias arquitectónicas inmersivas.',
    },
    stack: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS'],
    live: 'https://cubiqa-landing-template.vercel.app/',
    source: gh('cubiqa-landing-template'),
  },
  {
    slug: 'cubiqa-backoffice',
    title: 'Cubiqa Backoffice',
    kind: 'website',
    description: {
      en: 'Internal management system for Cubiqa: projects, clients and finances, with live statistics and a calendar.',
      es: 'Sistema de gestión interno para Cubiqa: proyectos, clientes y finanzas, con estadísticas en tiempo real y calendario.',
    },
    stack: ['Next.js', 'React', 'Tailwind CSS', 'Node.js', 'PostgreSQL', 'Prisma'],
    live: 'https://cubiqa-bo.vercel.app/',
  },
  {
    slug: 'cubiqa-survey',
    title: 'Cubiqa Survey',
    kind: 'website',
    description: {
      en: 'Satisfaction survey system for Cubiqa: collects client feedback and charts the results.',
      es: 'Sistema de encuestas de satisfacción para Cubiqa: recolecta feedback de clientes y grafica los resultados.',
    },
    stack: ['React', 'Tailwind CSS', 'Supabase'],
    live: 'https://cubiqa-survey-satisfaction.netlify.app/',
  },
  {
    slug: 'outreal',
    title: 'Outreal',
    kind: 'client',
    description: {
      en: 'Official website for Outreal ARQ and its architectural projects.',
      es: 'Sitio web oficial de Outreal ARQ y sus proyectos de arquitectura.',
    },
    stack: ['HTML', 'CSS', 'JavaScript'],
    live: 'https://outrealstudio.com/',
  },
  {
    slug: 'willpower-fit',
    title: 'Willpower Fit',
    kind: 'website',
    description: {
      en: 'Landing page for a gym brand, focused on fitness motivation and mental strength.',
      es: 'Landing page para una marca de gimnasio, con foco en motivación y fortaleza mental.',
    },
    stack: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS'],
    live: 'https://joaquimcolacilli.github.io/wpf/',
    source: gh('wpf'),
  },
  {
    slug: 'el-calculetas',
    title: 'El Calculetas',
    kind: 'website',
    description: {
      en: 'Personal finance manager for tracking income, expenses and balances.',
      es: 'Gestor de finanzas personales para registrar ingresos, gastos y saldos.',
    },
    stack: ['Angular', 'TypeScript', 'Tailwind CSS', 'PrimeNG', 'Chart.js'],
    live: 'https://el-calculetas.netlify.app',
    source: gh('el-calculetas'),
  },
  {
    slug: 'development-estimator',
    title: 'Development Estimator',
    kind: 'website',
    description: {
      en: 'Estimation tool that calculates development effort from configurable project parameters.',
      es: 'Herramienta que estima el esfuerzo de un desarrollo a partir de parámetros configurables del proyecto.',
    },
    stack: ['Angular', 'TypeScript', 'Tailwind CSS', 'Chart.js'],
    live: 'https://joaquimcolacilli.github.io/estimador-desarrollo/',
    source: gh('estimador-desarrollo'),
  },
  {
    slug: 'deployment-checklist',
    title: 'Deployment Checklist',
    kind: 'website',
    description: {
      en: 'Checklist application for controlling and validating deployment procedures.',
      es: 'Aplicación de checklist para controlar y validar procedimientos de despliegue.',
    },
    stack: ['Angular', 'TypeScript', 'Tailwind CSS', 'Firebase'],
    live: 'https://joaquimcolacilli.github.io/checklistwf3/',
    source: gh('checklistwf3'),
  },
  {
    slug: 'player-timer',
    title: 'Player Timer',
    kind: 'website',
    description: {
      en: 'Multi-player timer with custom names, colors and per-player time tracking.',
      es: 'Temporizador para varios jugadores, con nombres, colores y tiempo por jugador.',
    },
    stack: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS'],
    live: 'https://joaquimcolacilli.github.io/playertimer/',
    source: gh('playertimer'),
  },
  {
    slug: 'hotfood',
    title: 'Hotfood',
    kind: 'website',
    description: {
      en: 'Site for an American-style food brand, with menu, news and location.',
      es: 'Sitio para una marca de comida estilo americano, con menú, novedades y ubicación.',
    },
    stack: ['Angular', 'TypeScript'],
    live: 'https://joaquimcolacilli.github.io/hotfood/',
    source: gh('hotfood'),
  },
  {
    slug: 'qiufy',
    title: 'Qiufy',
    kind: 'website',
    description: {
      en: 'Matchmaking platform for gamers, built to connect players quickly.',
      es: 'Plataforma de matchmaking para gamers, pensada para conectar jugadores rápido.',
    },
    stack: ['Angular', 'Spring Boot', 'MySQL', 'WebSocket', 'ActiveMQ'],
  },
  {
    slug: 'script-validator',
    title: 'Script Validator',
    kind: 'desktop',
    description: {
      en: 'Tool that validates SQL scripts, with support for PostgreSQL, MySQL and MongoDB.',
      es: 'Herramienta para validar scripts SQL, con soporte para PostgreSQL, MySQL y MongoDB.',
    },
    stack: ['React', 'Tailwind CSS', 'Electron'],
  },
  {
    slug: 'json-formatter',
    title: 'JSON Formatter',
    kind: 'desktop',
    description: {
      en: 'Desktop utility for parsing, formatting and validating JSON.',
      es: 'Utilidad de escritorio para parsear, formatear y validar JSON.',
    },
    stack: ['React', 'Vite', 'Tailwind CSS', 'Electron'],
    source: gh('json-parser-exec'),
  },
];
