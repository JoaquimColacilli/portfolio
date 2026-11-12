/**
 * Everything the site says, in English and Spanish.
 * Edit the text here; the layout and the 3D scenes do not need to change.
 */
export type Lang = 'en' | 'es';
export type Text = Record<Lang, string>;

export interface Chapter {
  /** anchor id in the URL */
  id: string;
  /** label on the ruler and in the title block */
  short: Text;
  /** heading, one entry per line */
  title: string[];
  role: Text;
  /** YYYY-MM; `end: null` means it is still going */
  start: string;
  end: string | null;
  intro?: Text;
  points: Text[];
  /** technologies, in the order they should be listed */
  stack: string[];
  /** a second, smaller entry that belongs to the same year */
  also?: { title: Text; text: Text };
}

export const person = {
  name: 'Joaquim Colacilli',
  firstName: 'Joaquim',
  lastName: 'Colacilli',
  email: 'joaquimcolacilli9@gmail.com',
  github: 'https://github.com/JoaquimColacilli',
  linkedin: 'https://www.linkedin.com/in/joaquim-colacilli/',
  site: 'https://joaquimcolacilli-portfolio.netlify.app/',
  cv: { en: 'CV_JOAQUIM_COLACILLI_ENGLISH.pdf', es: 'CV_JOAQUIM_COLACILLI_ESPAÑOL.pdf' } as Text,
  location: { en: 'Buenos Aires, Argentina (UTC−3)', es: 'Buenos Aires, Argentina (UTC−3)' } as Text,
};

export const cover = {
  lede: {
    en: 'Frontend-focused full-stack developer in Buenos Aires. I build product-facing web applications with React, Next.js and Angular, backed by Java/Spring Boot and Node.js services.',
    es: 'Desarrollador full stack con foco en frontend, en Buenos Aires. Construyo aplicaciones web de producto con React, Next.js y Angular, sobre servicios en Java/Spring Boot y Node.js.',
  } as Text,
  now: {
    en: 'Now: Cross Selling frontend at Despegar.',
    es: 'Hoy: frontend de Cross Selling en Despegar.',
  } as Text,
  hint: {
    en: 'Eleven years, drawn as one line. Scroll to follow it.',
    es: 'Once años, dibujados con una sola línea. Scrolleá para seguirla.',
  } as Text,
};

export const chapters: Chapter[] = [
  {
    id: 'escuela-tecnica',
    short: { en: '2015', es: '2015' },
    title: ['Escuela Técnica', 'N.º 36'],
    role: { en: 'Technical Diploma in Information Technology', es: 'Técnico en Informática' },
    start: '2015-03',
    end: '2020-12',
    intro: {
      en: 'Six years at the Escuela Técnica N.º 36 “Almirante Guillermo Brown”, in Buenos Aires. This is where the line starts.',
      es: 'Seis años en la Escuela Técnica N.º 36 “Almirante Guillermo Brown”, en Buenos Aires. Acá empieza la línea.',
    },
    points: [],
    stack: [],
  },
  {
    id: 'freelance',
    short: { en: '2021', es: '2021' },
    title: ['Freelance'],
    role: { en: 'Full Stack Developer', es: 'Desarrollador Full Stack' },
    start: '2021-01',
    end: null,
    points: [
      {
        en: 'Modern, responsive landing pages built with React and Next.js.',
        es: 'Landing pages modernas y responsivas con React y Next.js.',
      },
      { en: 'RESTful APIs with Node.js and Express.', es: 'APIs RESTful con Node.js y Express.' },
      {
        en: 'Custom administrative dashboards and SEO optimization.',
        es: 'Dashboards administrativos a medida y optimización SEO.',
      },
      {
        en: 'Web development for Cubiqa Studio, delivering premium real-estate project sites.',
        es: 'Desarrollo web para Cubiqa Studio: sitios premium para proyectos inmobiliarios.',
      },
    ],
    stack: ['React', 'Next.js', 'Node.js', 'Express', 'MongoDB', 'PostgreSQL', 'Tailwind CSS', 'AWS'],
    also: {
      title: { en: 'Also since 2021', es: 'También desde 2021' },
      text: {
        en: 'Systems Analysis at the University of Buenos Aires, School of Engineering (FIUBA), in progress.',
        es: 'Análisis de Sistemas en la Facultad de Ingeniería de la Universidad de Buenos Aires (FIUBA), en curso.',
      },
    },
  },
  {
    id: 'ntt-data',
    short: { en: '2022', es: '2022' },
    title: ['NTT Data'],
    role: { en: 'Software Developer', es: 'Software Developer' },
    start: '2022-09',
    end: '2025-06',
    points: [
      {
        en: 'Design of scalable distributed systems with Spring Boot and Spring Cloud.',
        es: 'Diseño de sistemas distribuidos escalables con Spring Boot y Spring Cloud.',
      },
      {
        en: 'RESTful APIs using WebFlux, with Circuit Breaker and Retry patterns via Resilience4j.',
        es: 'APIs RESTful con WebFlux, Circuit Breaker y Retry (Resilience4j).',
      },
      {
        en: 'PostgreSQL and Oracle optimization: indexing, query tuning and Hibernate tuning.',
        es: 'Optimización de PostgreSQL y Oracle: índices, query tuning y Hibernate tuning.',
      },
      { en: 'Asynchronous processing with RabbitMQ and ActiveMQ.', es: 'Procesamiento asíncrono con RabbitMQ y ActiveMQ.' },
      { en: 'CI/CD with GitLab and Jenkins, deploying to OpenShift.', es: 'CI/CD con GitLab y Jenkins, deploy en OpenShift.' },
    ],
    stack: ['Java', 'Spring Boot', 'Spring Cloud', 'WebFlux', 'Resilience4j', 'PostgreSQL', 'Oracle', 'RabbitMQ', 'ActiveMQ', 'Docker', 'Jenkins', 'OpenShift'],
  },
  {
    id: 'almundo',
    short: { en: '2025', es: '2025' },
    title: ['Almundo'],
    role: { en: 'Software Developer', es: 'Software Developer' },
    start: '2025-06',
    end: '2026-02',
    points: [
      {
        en: 'Cars and Tours verticals, built with Angular 17/18 and Java / Spring Boot 3.',
        es: 'Verticales de Autos y Circuitos, con Angular 17/18 y Java / Spring Boot 3.',
      },
      {
        en: 'White-label microsites for partners: parameterization, SEO and performance.',
        es: 'Micrositios white-label para partners: parametrización, SEO y performance.',
      },
      {
        en: 'BackOffice platform: feature flags, permissions, reporting and support tooling.',
        es: 'BackOffice: feature flags, permisos, reportes y herramientas de soporte.',
      },
      {
        en: 'Cars supplier integration (CNET) with retries, validation and resilience handling.',
        es: 'Integración del proveedor de Autos (CNET) con retries, validaciones y resiliencia.',
      },
      {
        en: 'Hexagonal architecture and idempotent pipelines over MongoDB, Cassandra and OpenSearch.',
        es: 'Arquitectura hexagonal y pipelines idempotentes sobre MongoDB, Cassandra y OpenSearch.',
      },
    ],
    stack: ['Angular', 'Java', 'Spring Boot', 'MongoDB', 'Cassandra', 'OpenSearch', 'Docker'],
  },
  {
    id: 'despegar',
    short: { en: '2026', es: '2026' },
    title: ['Despegar'],
    role: { en: 'Software Developer', es: 'Software Developer' },
    start: '2026-02',
    end: null,
    points: [
      {
        en: 'Frontend development and maintenance for Cross Selling, focused on user experience and conversion.',
        es: 'Desarrollo y mantenimiento frontend para Cross Selling, con foco en experiencia de usuario y conversión.',
      },
      {
        en: 'Reusable component design and API integration, with close attention to performance and code quality.',
        es: 'Diseño de componentes reutilizables e integración con APIs, cuidando performance y calidad de código.',
      },
      {
        en: 'Collaboration with Product, Design and Backend teams, applying code reviews and shared engineering standards.',
        es: 'Trabajo con los equipos de Producto, Diseño y Backend, con code reviews y estándares compartidos.',
      },
    ],
    stack: ['React', 'TypeScript', 'Tailwind CSS'],
  },
];

/** Sheets after the chapters. Their order here is their order on the page. */
export const closing = {
  work: { id: 'work', short: { en: 'Work', es: 'Trabajos' } as Text },
  toolkit: { id: 'toolkit', short: { en: 'Toolkit', es: 'Stack' } as Text },
  contact: { id: 'contact', short: { en: 'Contact', es: 'Contacto' } as Text },
};

export interface Part {
  name: string;
  /** chapters where it was used, by short company name */
  usedAt: string[];
}

export const toolkit: { group: Text; parts: Part[] }[] = [
  {
    group: { en: 'Frontend', es: 'Frontend' },
    parts: [
      { name: 'TypeScript', usedAt: ['Despegar'] },
      { name: 'JavaScript', usedAt: ['Freelance'] },
      { name: 'React', usedAt: ['Despegar', 'Freelance'] },
      { name: 'Next.js', usedAt: ['Freelance'] },
      { name: 'Angular', usedAt: ['Almundo'] },
      { name: 'Tailwind CSS', usedAt: ['Despegar', 'Freelance'] },
    ],
  },
  {
    group: { en: 'Backend', es: 'Backend' },
    parts: [
      { name: 'Java', usedAt: ['NTT Data', 'Almundo'] },
      { name: 'Spring Boot', usedAt: ['NTT Data', 'Almundo'] },
      { name: 'Node.js', usedAt: ['Freelance'] },
      { name: 'NestJS', usedAt: [] },
      { name: 'Express', usedAt: ['Freelance'] },
    ],
  },
  {
    group: { en: 'Data', es: 'Datos' },
    parts: [
      { name: 'PostgreSQL', usedAt: ['NTT Data', 'Freelance'] },
      { name: 'Oracle', usedAt: ['NTT Data'] },
      { name: 'MongoDB', usedAt: ['Almundo', 'Freelance'] },
      { name: 'Cassandra', usedAt: ['Almundo'] },
      { name: 'OpenSearch', usedAt: ['Almundo'] },
      { name: 'MySQL', usedAt: [] },
      { name: 'Redis', usedAt: [] },
    ],
  },
  {
    group: { en: 'Infrastructure and tooling', es: 'Infraestructura y herramientas' },
    parts: [
      { name: 'Docker', usedAt: ['NTT Data', 'Almundo'] },
      { name: 'Kubernetes', usedAt: [] },
      { name: 'OpenShift', usedAt: ['NTT Data'] },
      { name: 'AWS', usedAt: ['Freelance'] },
      { name: 'Jenkins', usedAt: ['NTT Data'] },
      { name: 'RabbitMQ', usedAt: ['NTT Data'] },
      { name: 'ActiveMQ', usedAt: ['NTT Data'] },
      { name: 'Resilience4j', usedAt: ['NTT Data'] },
      { name: 'Liquibase', usedAt: [] },
      { name: 'Git', usedAt: [] },
      { name: 'Postman', usedAt: [] },
    ],
  },
];

export const practices: Text[] = [
  { en: 'Hexagonal architecture.', es: 'Arquitectura hexagonal.' },
  { en: 'SOLID and clean code.', es: 'SOLID y clean code.' },
  { en: 'Resilience patterns: retry, circuit breaker, dead-letter queues.', es: 'Patrones de resiliencia: retry, circuit breaker, dead-letter queues.' },
  { en: 'Automated testing with JUnit and Mockito.', es: 'Testing automatizado con JUnit y Mockito.' },
  { en: 'GitFlow and code review.', es: 'GitFlow y code review.' },
  { en: 'CI/CD pipelines.', es: 'Pipelines de CI/CD.' },
  { en: 'Scrum and Kanban.', es: 'Scrum y Kanban.' },
];

export const training: { when: string; what: Text }[] = [
  {
    when: '2015–2020',
    what: {
      en: 'Technical Diploma in Information Technology, Escuela Técnica N.º 36.',
      es: 'Técnico en Informática, Escuela Técnica N.º 36.',
    },
  },
  {
    when: '2021–',
    what: {
      en: 'Systems Analysis, University of Buenos Aires, School of Engineering (FIUBA). In progress.',
      es: 'Análisis de Sistemas, Facultad de Ingeniería, Universidad de Buenos Aires (FIUBA). En curso.',
    },
  },
  { when: '2021', what: { en: 'IBM Startup Challenge.', es: 'IBM Startup Challenge.' } },
  {
    when: '2022',
    what: { en: 'CoderHouse: JavaScript, React, Web Development.', es: 'CoderHouse: JavaScript, React, Desarrollo Web.' },
  },
  {
    when: '2023–2024',
    what: {
      en: 'Udemy: Node.js with MongoDB, Angular + OpenAI, React Hooks & Redux, React Native with Expo.',
      es: 'Udemy: Node.js con MongoDB, Angular + OpenAI, React Hooks y Redux, React Native con Expo.',
    },
  },
];

export const languages: { name: Text; level: Text }[] = [
  { name: { en: 'Spanish', es: 'Español' }, level: { en: 'Native', es: 'Nativo' } },
  { name: { en: 'English', es: 'Inglés' }, level: { en: 'Professional working proficiency', es: 'Nivel profesional' } },
];

/** Interface copy. */
export const ui = {
  skip: { en: 'Skip to content', es: 'Saltar al contenido' },
  nav: {
    experience: { en: 'Experience', es: 'Experiencia' },
    work: { en: 'Work', es: 'Trabajos' },
    toolkit: { en: 'Toolkit', es: 'Stack' },
    contact: { en: 'Contact', es: 'Contacto' },
  },
  language: { en: 'Language', es: 'Idioma' },
  downloadCv: { en: 'Download CV', es: 'Descargar CV' },
  getInTouch: { en: 'Get in touch', es: 'Escribime' },
  cover: { en: 'Cover', es: 'Carátula' },
  sheet: { en: 'Sheet', es: 'Lámina' },
  title: { en: 'Title', es: 'Título' },
  period: { en: 'Period', es: 'Período' },
  present: { en: 'Present', es: 'Actualidad' },
  /** what the dotted line under a chapter's duration stands for */
  rule: { en: 'rule: 6 years', es: 'regla: 6 años' },
  builtWith: { en: 'Built with', es: 'Construido con' },
  sheets: { en: 'Sheets', es: 'Láminas' },
  work: {
    heading: { en: 'Selected work', es: 'Trabajos seleccionados' },
    intro: {
      en: 'Client sites, products for Cubiqa Studio and tools I built for myself.',
      es: 'Sitios para clientes, productos para Cubiqa Studio y herramientas que hice para mí.',
    },
    figure: { en: 'Fig.', es: 'Fig.' },
    index: { en: 'Full index', es: 'Índice completo' },
    project: { en: 'Project', es: 'Proyecto' },
    kind: { en: 'Kind', es: 'Tipo' },
    stack: { en: 'Stack', es: 'Stack' },
    links: { en: 'Links', es: 'Enlaces' },
    live: { en: 'Live site', es: 'Sitio' },
    source: { en: 'Source', es: 'Código' },
    noLinks: { en: 'Not public', es: 'No público' },
    kinds: {
      client: { en: 'Client site', es: 'Sitio para cliente' },
      website: { en: 'Website', es: 'Sitio web' },
      desktop: { en: 'Desktop app', es: 'App de escritorio' },
    },
  },
  toolkit: {
    heading: { en: 'Bill of materials', es: 'Lista de materiales' },
    intro: {
      en: 'What the work above is made of, and where each part was used.',
      es: 'De qué está hecho el trabajo de arriba, y dónde usé cada pieza.',
    },
    part: { en: 'Part', es: 'Pieza' },
    usedAt: { en: 'Used at', es: 'Usado en' },
    filter: { en: 'Show parts used at', es: 'Mostrar piezas usadas en' },
    all: { en: 'Everywhere', es: 'Todos lados' },
    practices: { en: 'Practices', es: 'Prácticas' },
    education: { en: 'Education and training', es: 'Formación' },
    languages: { en: 'Languages', es: 'Idiomas' },
  },
  contact: {
    heading: { en: 'Your turn', es: 'Tu turno' },
    intro: {
      en: 'The line stops here for now. If you have a role or a project in mind, write to me.',
      es: 'La línea llega hasta acá, por ahora. Si tenés un puesto o un proyecto en mente, escribime.',
    },
    drawnBy: { en: 'Drawn by', es: 'Dibujó' },
    email: { en: 'Email', es: 'Email' },
    copy: { en: 'Copy address', es: 'Copiar dirección' },
    copied: { en: 'Address copied', es: 'Dirección copiada' },
    location: { en: 'Location', es: 'Ubicación' },
    profiles: { en: 'Profiles', es: 'Perfiles' },
    cv: { en: 'CV', es: 'CV' },
    /** `{backend}` becomes WebGPU or WebGL 2, whichever is drawing */
    drawnWith: { en: 'Drawn in real time with three.js on {backend}.', es: 'Dibujado en tiempo real con three.js sobre {backend}.' },
    typeface: { en: 'Set in Archivo, by Omnibus-Type, Buenos Aires.', es: 'Compuesto en Archivo, de Omnibus-Type, Buenos Aires.' },
    portraitAlt: { en: 'Portrait of Joaquim Colacilli', es: 'Retrato de Joaquim Colacilli' },
  },
} as const;
