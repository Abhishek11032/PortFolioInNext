import { projects } from "@/data/projects";
import { skillGroups } from "@/data/skills";

const portfolioFacts = {
  name: "Abhishek Tiwari",
  title: "Full Stack Developer",
  about:
    "I'm a Full Stack Developer with 2.5+ years of professional experience building scalable SaaS, fintech, and business management applications. I specialize in React.js, Next.js, TypeScript, JavaScript, Python, Django REST Framework, and PostgreSQL, with a strong focus on creating responsive user interfaces and reliable backend systems. My experience includes developing reusable UI components, designing secure REST APIs, implementing JWT authentication and role-based access control, optimizing database queries, and integrating AI-powered document processing workflows. I've worked on enterprise applications, fintech and KYC platforms, business management systems, and reporting dashboards. I enjoy solving complex engineering problems, improving application performance, and translating business requirements into reliable software solutions.",
  experience: {
    role: "Software Developer — Full Stack",
    company: "Gowdanar Technosoft Pvt. Ltd.",
    duration: "April 2024 – Present",
    location: "Bengaluru, India",
    description:
      "Developing scalable web applications and backend services for fintech, KYC, and enterprise business platforms. Building responsive frontend interfaces with React.js, Next.js, and TypeScript, and developing secure REST APIs using Django and Django REST Framework. Working on authentication, role-based permissions, database optimization, reporting systems, and AI-assisted document processing. Contributing to performance optimization, asynchronous task processing, application testing, and reliable production deployments.",
  },
  skills: skillGroups.map(({ title, skills }) => ({ category: title, skills })),
  projects: projects.map(({ name, category, description, technologies, features }) => ({
    name,
    category,
    description,
    technologies,
    features,
  })),
  education: {
    degree: "B.E. in Computer Science & Engineering",
    institution: "Savitribai Phule Pune University",
    years: "2019–2023",
    cgpa: "7.29/10",
  },
  contact: {
    email: "abhishekt1132000@gmail.com",
    phone: "+91 70542 52971",
    linkedin: "https://www.linkedin.com/in/abhishek-tiwari1132",
  },
} as const;

export const portfolioContext = JSON.stringify(portfolioFacts, null, 2);
