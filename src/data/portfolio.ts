/**
 * Single source of truth for all portfolio content.
 * Everything here is carried over from the original components — edit this
 * file to update copy without touching any animation code.
 */

export const profile = {
  firstName: "Abhilash",
  lastName: "Neelam",
  role: "Full Stack Developer",
  company: "Tectoro Consulting Private Limited",
  city: "Hyderabad",
  email: "neelamabhilash18@gmail.com",
  greeting: "Hello! I Am",
  headlinePrefix: "How I build",
  headline: ["Pragmatic engineering,", "interfaces people", "trust"],
  headlineSub:
    "Performance, accessibility, and maintainable React—balanced for users, teams, and the long run.",
  about:
    "A passionate Full Stack Developer with 3+ years of experience. I build meaningful, dependable digital products that balance user needs with business goals.",
};

export const socials = [
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/abhilash-neelam-a30349281",
    path: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/abhirat_v18?igsh=emsyeDhucm1vNXM1",
    path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z",
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/share/1J4TGhavS6/",
    path: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
  },
  {
    label: "Email",
    href: "mailto:neelamabhilash18@gmail.com",
    path: "M20 4H4c-1.103 0-2 .897-2 2v12c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V6c0-1.103-.897-2-2-2zm0 2v.511l-8 6.223-8-6.222V6h16zM4 18V9.044l7.386 5.745a.994.994 0 001.228 0L20 9.044 20.002 18H4z",
  },
];

export type Stat = { value?: number; suffix?: string; text?: string; label: string; sub: string };

export const stats: Stat[] = [
  { value: 3, suffix: "+", label: "Years of experience", sub: "Full Stack Developer" },
  { value: 5, label: "Platforms managed (UEM)", sub: "Android · iOS · macOS · Linux · ChromeOS" },
  { text: "Full-Stack", label: "Growth direction", sub: "Mobile & Backend" },
];

export const experience = {
  role: "Full Stack Developer",
  duration: "3 yrs",
  company: "Tectoro Consulting Pvt. Ltd.",
  location: "Hyderabad",
  paragraphs: [
    "Built and maintained a Unified Endpoint Management (UEM) platform, delivering scalable device management across Android, iOS, macOS, Linux, and ChromeOS.",
    "Led features including device enrollment, policy management, and role-based access control. Integrated REST APIs, managed state with Redux / Context API, and implemented RSA-based encryption for secure data flows.",
    "Focused on clean, maintainable code, performance improvements, and effective collaboration with cross-functional teams. Currently expanding expertise in full-stack and mobile application development.",
  ],
  highlights: [
    { label: "Full Stack Developer", sub: "3 Years Experience" },
    { label: "UEM Platform", sub: "Android · iOS · macOS · Linux · ChromeOS" },
    { label: "Full-Stack Growth", sub: "Mobile & Backend" },
  ],
  coreSkills: [
    "Javascript",
    "Typescript",
    "React",
    "Redux / Context API",
    "REST API Integration",
    "RSA Encryption",
    "Performance Optimisation",
  ],
};

export type Project = {
  id: "uem" | "portfolio";
  index: string;
  title: string;
  context: string;
  summary: string;
  points: string[];
  stack: string[];
  link?: { label: string; href: string };
};

/** Projects drawn from the work described in the experience section and from this site itself. */
export const projects: Project[] = [
  {
    id: "uem",
    index: "01",
    title: "Unified Endpoint Management Platform",
    context: "Tectoro Consulting · Production",
    summary:
      "Scalable device management across Android, iOS, macOS, Linux, and ChromeOS — one console to enroll, govern, and secure a fleet.",
    points: [
      "Device enrollment flows",
      "Policy management",
      "Role-based access control",
      "RSA-based encryption for secure data flows",
    ],
    stack: ["React", "TypeScript", "Redux / Context API", "REST APIs"],
  },
  {
    id: "portfolio",
    index: "02",
    title: "Portfolio & Feedback Platform",
    context: "Personal · Full-stack",
    summary:
      "This site: a React + TypeScript front end backed by a Node/Express API and MongoDB, with validated submissions and a password-protected admin view.",
    points: [
      "Validated contact & feedback pipeline",
      "Rate limiting and hardened headers",
      "Duplicate-contact detection",
      "Password-protected admin dashboard",
    ],
    stack: ["React", "TypeScript", "Vite", "Node.js", "Express", "MongoDB"],
    link: { label: "Try the form", href: "#contact" },
  },
];

export type Tech = { label: string; slug: string; group: SkillGroupId };
export type SkillGroupId = "frontend" | "backend" | "mobile";

export const skillGroups: { id: SkillGroupId; title: string; blurb: string }[] = [
  { id: "frontend", title: "Frontend", blurb: "Interfaces, state, and the web platform." },
  { id: "backend", title: "Backend & Data", blurb: "Services, languages, and storage." },
  { id: "mobile", title: "Mobile", blurb: "Cross-platform apps — currently expanding." },
];

export const tech: Tech[] = [
  { label: "HTML5", slug: "html5", group: "frontend" },
  { label: "CSS3", slug: "css3", group: "frontend" },
  { label: "Bootstrap", slug: "bootstrap", group: "frontend" },
  { label: "JavaScript", slug: "javascript", group: "frontend" },
  { label: "TypeScript", slug: "typescript", group: "frontend" },
  { label: "React", slug: "react", group: "frontend" },
  { label: "Node.js", slug: "nodedotjs", group: "backend" },
  { label: "Express", slug: "express", group: "backend" },
  { label: "SQL", slug: "mysql", group: "backend" },
  { label: "Flutter", slug: "flutter", group: "mobile" },
  { label: "Dart", slug: "dart", group: "mobile" },
];

export const practices = [
  "Redux / Context API",
  "REST API Integration",
  "RSA Encryption",
  "Performance Optimisation",
];

const DEVICON: Record<string, string> = {
  css3: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg",
  html5: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg",
  mysql: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg",
  flutter: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/flutter/flutter-original.svg",
  dart: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/dart/dart-original.svg",
};
const SIMPLEICON_COLORS: Record<string, string> = { bootstrap: "7952B3", nodedotjs: "5FA04E", express: "FFFFFF" };

export function iconSrc(slug: string): string {
  if (DEVICON[slug]) return DEVICON[slug];
  const color = SIMPLEICON_COLORS[slug];
  return color ? `https://cdn.simpleicons.org/${slug}/${color}` : `https://cdn.simpleicons.org/${slug}`;
}

export const education = [
  {
    degree: "Master of Computer Applications (MCA)",
    institution: "Aurora P.G. College",
    location: "Uppal, Hyderabad",
    initials: "AP",
    level: "Postgraduate",
    description:
      "Postgraduate study in computer applications, covering software engineering, data structures, databases, and application development.",
  },
  {
    degree: "Bachelor's Degree (MPCS)",
    institution: "Masterji Degree & P.G. College",
    location: "Hanamkonda, Warangal",
    initials: "MD",
    level: "Undergraduate",
    description:
      "Undergraduate study with a Mathematics, Physics, and Chemistry combination, building a strong analytical and problem-solving foundation.",
  },
];

/** Navigation + the order the 3D scene morphs through (must match section ids in the DOM). */
export const sections = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "skills", label: "Skills" },
  { id: "education", label: "Education" },
  { id: "contact", label: "Connect" },
] as const;
