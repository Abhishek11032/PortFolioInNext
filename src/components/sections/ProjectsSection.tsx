import { projects } from "@/data/projects";
import ProjectCard from "@/components/projects/ProjectCard";
import SectionHeading from "@/components/ui/SectionHeading";

export default function ProjectsSection() {
  return (
    <section id="Projects" aria-labelledby="projects-title" className="scroll-mt-24 px-5 py-20 sm:px-8 sm:py-24 lg:px-[8vw] lg:py-28">
      <div className="mx-auto max-w-[1440px]">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end sm:gap-8"><SectionHeading eyebrow="SELECTED WORK" title="Featured" accent="projects" /><p className="mt-2 max-w-[320px] text-sm leading-6 text-muted sm:mb-1 sm:mt-0">Four college, personal, and professional projects, with details and verified technologies.</p></div>
        <div className="mt-8 grid grid-cols-1 gap-5 sm:mt-10 md:grid-cols-2 md:gap-6">{projects.map((project) => <ProjectCard key={project.name} project={project} />)}</div>
      </div>
    </section>
  );
}
