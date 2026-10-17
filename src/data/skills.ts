import type { SkillGroup } from "@/types/portfolio";

export const skillGroups = [
  { title: "Frontend Development", icon: "bx-devices", skills: ["React.js", "Next.js", "TypeScript", "JavaScript", "Tailwind CSS"] },
  { title: "Backend Development", icon: "bx-server", skills: ["Python", "Django REST Framework", "FastAPI", "Node.js"] },
  { title: "Databases", icon: "bx-data", skills: ["PostgreSQL", "CockroachDB"] },
  { title: "Architecture and DevOps", icon: "bx-git-branch", skills: ["REST APIs", "JWT", "Redis", "Celery", "Kafka", "Docker", "GCP"] },
  { title: "Generative AI", icon: "bx-brain", skills: ["LangChain", "RAG", "OpenAI API", "Gemini API"] },
] satisfies readonly SkillGroup[];
