import { Github, Mail, MessageCircle } from "lucide-react";

export type Personal = {
  name: string;
  fullName: string;
  title: string;
  tagline: string;
  location: string;
  email: string;
  whatsapp: string;
  github: string;
  avatar: string;
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

export type Service = {
  icon: string;
  title: string;
  description: string;
  price?: string;
  deliveryTime?: string;
  features?: string[];
};

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
    fullName: "Kingsley",
    title: "Frontend Developer",
    tagline: "",
    location: "Nigeria",
    email: "",
    whatsapp: "",
    github: "",
    avatar: "",
    cvUrl: "",
    yearsExperience: 0,
    projectsShipped: 0,
    happyClients: 0,
  },
  about: {
    summary: "",
    highlights: [],
  },
  skills: [],
  projects: [],
  services: [],
  experience: [],
  testimonials: [],
};

// Static (icons can't be serialized)
export const socialLinksFor = (p: Personal) =>
  [
    { icon: Github, href: p.github, label: "GitHub" },
    { icon: Mail, href: p.email ? `mailto:${p.email}` : "", label: "Email" },
    { icon: MessageCircle, href: p.whatsapp, label: "WhatsApp" },
  ].filter((s) => !!s.href);

export const navLinks = [
  { label: "About", href: "#about" },
  { label: "Skills", href: "#skills" },
  { label: "Projects", href: "#projects" },
  { label: "Services", href: "#services" },
  { label: "Experience", href: "#experience" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "#contact" },

];
