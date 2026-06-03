import { Github, Linkedin, Mail, MessageCircle } from "lucide-react";
import dashboardImg from "@/assets/project-dashboard.jpg";
import ecommerceImg from "@/assets/project-ecommerce.jpg";
import saasImg from "@/assets/project-saas.jpg";
import cryptoImg from "@/assets/project-crypto.jpg";

export type Personal = {
  name: string;
  fullName: string;
  title: string;
  tagline: string;
  location: string;
  email: string;
  whatsapp: string;
  github: string;
  linkedin: string;
  cvUrl: string;
  yearsExperience: number;
  projectsShipped: number;
  happyClients: number;
};

export type About = {
  summary: string;
  highlights: string[];
};

export type Skill = { name: string; level: number; category: string };

export type Project = {
  title: string;
  description: string;
  image: string;
  tech: string[];
  demo: string;
  github: string;
  featured?: boolean;
};

export type Service = { icon: string; title: string; description: string };

export type ExperienceItem = {
  role: string;
  company: string;
  period: string;
  description: string;
};

export type Testimonial = { quote: string; name: string; role: string };

export type PortfolioData = {
  personal: Personal;
  about: About;
  skills: Skill[];
  projects: Project[];
  services: Service[];
  experience: ExperienceItem[];
  testimonials: Testimonial[];
};

export const defaultPortfolio: PortfolioData = {
  personal: {
    name: "Kingsley",
    fullName: "Kingsley Okafor",
    title: "Frontend Developer",
    tagline: "I craft pixel-perfect, blazing-fast web experiences for ambitious brands.",
    location: "Lagos, Nigeria",
    email: "hello@kingsley.dev",
    whatsapp: "https://wa.me/2348000000000",
    github: "https://github.com/kingsley",
    linkedin: "https://linkedin.com/in/kingsley",
    cvUrl: "/cv-kingsley.pdf",
    yearsExperience: 5,
    projectsShipped: 40,
    happyClients: 25,
  },
  about: {
    summary:
      "I'm a frontend developer with 5+ years of experience turning complex ideas into elegant, accessible products. I partner with founders, designers, and product teams across the globe to ship interfaces that feel as good as they look — fast, responsive, and built to scale.",
    highlights: [
      "5+ years building production React apps",
      "Worked with startups across 4 continents",
      "Focus on performance, accessibility & DX",
      "Design-system fluent — Figma to code",
    ],
  },
  skills: [
    { name: "React", level: 95, category: "Framework" },
    { name: "Next.js", level: 92, category: "Framework" },
    { name: "TypeScript", level: 90, category: "Language" },
    { name: "JavaScript", level: 95, category: "Language" },
    { name: "Tailwind CSS", level: 96, category: "Styling" },
    { name: "HTML5 & CSS3", level: 98, category: "Core" },
    { name: "Git & GitHub", level: 90, category: "Tooling" },
    { name: "UI / UX Implementation", level: 88, category: "Design" },
    { name: "Responsive Design", level: 97, category: "Core" },
  ],
  projects: [
    {
      title: "Nova Analytics Dashboard",
      description: "Real-time analytics platform with 30+ chart types, dark mode, and millisecond filtering across 10M+ events.",
      image: dashboardImg,
      tech: ["React", "TypeScript", "Tailwind CSS", "Recharts"],
      demo: "#",
      github: "#",
      featured: true,
    },
    {
      title: "Lumen Commerce",
      description: "Headless storefront with sub-second navigation, Stripe checkout, and a fully editable design system.",
      image: ecommerceImg,
      tech: ["Next.js", "TypeScript", "Tailwind CSS"],
      demo: "#",
      github: "#",
    },
    {
      title: "Glassflow SaaS",
      description: "Marketing site + product onboarding for a B2B SaaS, scoring 100/100 on Lighthouse across the board.",
      image: saasImg,
      tech: ["Next.js", "Framer Motion", "Tailwind CSS"],
      demo: "#",
      github: "#",
    },
    {
      title: "Pulse Crypto Terminal",
      description: "Trading terminal with live charts, watchlists, and a customizable workspace for power users.",
      image: cryptoImg,
      tech: ["React", "TypeScript", "WebSockets"],
      demo: "#",
      github: "#",
    },
  ],
  services: [
    { icon: "Code2", title: "Frontend Development", description: "Production-ready React, Next.js & TypeScript apps engineered for scale and maintainability." },
    { icon: "Rocket", title: "Landing Pages", description: "Conversion-optimized landing pages that load fast, look stunning, and tell your story." },
    { icon: "LayoutDashboard", title: "Dashboard Development", description: "Complex data dashboards with charts, tables, and real-time updates — built for clarity." },
    { icon: "Gauge", title: "Website Optimization", description: "Core Web Vitals, accessibility, and SEO audits with concrete fixes that move metrics." },
    { icon: "Plug", title: "API Integration", description: "REST, GraphQL, and third-party integrations done right — typed, tested, and documented." },
    { icon: "Paintbrush", title: "Design Systems", description: "Reusable component libraries with tokens, variants, and a11y baked in from day one." },
  ],
  experience: [
    { role: "Senior Frontend Developer", company: "Stellar Labs (Remote)", period: "2023 — Present", description: "Leading the frontend for a B2B analytics platform serving 50k+ users. Architected the design system and mentored 4 engineers." },
    { role: "Frontend Developer", company: "Orbit Studio", period: "2021 — 2023", description: "Shipped 20+ client projects across fintech, e-commerce, and SaaS. Reduced average page load by 60%." },
    { role: "Freelance Developer", company: "Self-employed", period: "2020 — 2021", description: "Partnered with founders to build MVPs and marketing sites. First taste of the remote-first life." },
    { role: "Junior Web Developer", company: "Lagos Web Co.", period: "2019 — 2020", description: "Built responsive websites for local SMBs and learned the craft from senior engineers." },
  ],
  testimonials: [
    { quote: "Kingsley delivered our dashboard ahead of schedule and the quality blew us away. The animations alone made our investors lean in.", name: "Amara Chen", role: "CTO, Stellar Labs" },
    { quote: "Easily the best frontend engineer we've worked with. Clean code, great taste, and zero hand-holding required.", name: "Marcus Bauer", role: "Founder, Glassflow" },
    { quote: "We hired Kingsley for a 2-week sprint and ended up keeping him for 6 months. He just gets product.", name: "Sofia Almeida", role: "Head of Design, Lumen" },
    { quote: "He took a messy Figma file and turned it into the cleanest React codebase I've ever inherited.", name: "Daniel Park", role: "Engineering Lead, Pulse" },
  ],
};

// Static (icons can't be serialized to localStorage)
export const socialLinksFor = (p: Personal) => [
  { icon: Github, href: p.github, label: "GitHub" },
  { icon: Linkedin, href: p.linkedin, label: "LinkedIn" },
  { icon: Mail, href: `mailto:${p.email}`, label: "Email" },
  { icon: MessageCircle, href: p.whatsapp, label: "WhatsApp" },
];

export const navLinks = [
  { label: "About", href: "#about" },
  { label: "Skills", href: "#skills" },
  { label: "Projects", href: "#projects" },
  { label: "Services", href: "#services" },
  { label: "Experience", href: "#experience" },
  { label: "Contact", href: "#contact" },
];
