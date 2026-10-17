import Image from "next/image";
import type { Project } from "@/types/portfolio";

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <article className={`group flex min-w-0 flex-col overflow-hidden rounded-2xl border bg-surface transition duration-200 hover:-translate-y-1 hover:border-accent/50 hover:shadow-xl hover:shadow-black/20 ${project.featured ? "border-accent/35 lg:col-span-2 lg:grid lg:grid-cols-[.85fr_1.15fr]" : "border-line"}`}>
      <div className={`min-h-[190px] bg-[radial-gradient(ellipse_at_50%_40%,rgba(139,92,246,.13),transparent_62%),#111827] p-5 sm:min-h-[210px] ${project.featured ? "lg:min-h-full" : ""}`}>
        {project.image ? (
          <figure className="m-0 flex h-full min-h-[160px] flex-col items-center justify-center gap-3">
            <Image src={project.image} alt={project.imageAlt ?? ""} width={1000} height={600} sizes="(max-width: 767px) 90vw, (max-width: 1279px) 45vw, 40vw" className="h-[150px] max-w-full object-contain sm:h-[170px]" />
            <figcaption className="text-center text-xs text-muted">{project.imageCaption}</figcaption>
          </figure>
        ) : (
          <div aria-hidden="true" className="relative flex min-h-[160px] flex-col items-center justify-center gap-3 overflow-hidden rounded-xl border border-line bg-[linear-gradient(135deg,rgba(139,92,246,.08),transparent_62%)] sm:min-h-[174px] before:absolute before:size-[150px] before:rounded-full before:border before:border-accent/15 after:absolute after:size-[205px] after:rounded-full after:border after:border-cyan/10">
            <span className="z-[1] grid size-14 place-items-center rounded-2xl border border-cyan/30 bg-surface text-2xl text-cyan"><i className={`bx ${project.icon}`} /></span>
            <span className="z-[1] h-px w-10 bg-gradient-to-r from-accent to-cyan" />
            <span className="z-[1] max-w-[80%] text-center text-xs font-medium text-muted">{project.name}</span>
            <span className="absolute right-3 top-3 text-xs tracking-[.12em] text-muted/60">{project.number}</span>
          </div>
        )}
      </div>
      <div className={`flex min-w-0 flex-1 flex-col p-5 sm:p-6 ${project.featured ? "lg:self-center lg:p-8 xl:p-10" : ""}`}>
        <div className="flex items-start justify-between gap-3 text-xs font-medium uppercase tracking-[.12em] text-cyan"><span>{project.category}</span><span className="text-dim">{project.number}</span></div>
        <h3 className="mb-3 mt-3 text-xl font-semibold leading-snug tracking-tight text-cream sm:text-2xl">{project.name}</h3>
        <p className="break-words text-sm leading-7 text-muted">{project.description}</p>
        {project.technologies && <ul aria-label={`${project.name} technology stack`} className="mt-5 flex flex-wrap gap-2">{project.technologies.map((technology) => <li key={technology} className="max-w-full break-words rounded-lg border border-cyan/20 bg-cyan/[.06] px-2.5 py-2 text-xs font-medium leading-tight text-cyan">{technology}</li>)}</ul>}

        <details className="mt-5 border-t border-line pt-4" open={project.showFeaturesByDefault}>
          <summary className="flex min-h-11 w-fit cursor-pointer list-inside items-center gap-2 rounded-lg text-sm font-semibold text-cream marker:text-accent hover:text-cyan focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan">View details <i className="bx bx-chevron-down text-lg text-accent" aria-hidden="true" /></summary>
          {project.features && <ul className="mt-3 grid list-disc gap-2 break-words pl-5 text-sm leading-6 text-muted marker:text-cyan">{project.features.map((feature) => <li key={feature}>{feature}</li>)}</ul>}
          {project.evidence && <p className="mt-3 border-l-2 border-cyan/30 pl-3 text-sm leading-6 text-muted">{project.evidence}</p>}
        </details>
        <p className="mt-auto flex items-start gap-2 pt-5 text-xs leading-5 text-dim"><i className="bx bx-info-circle mt-0.5 text-cyan" aria-hidden="true" />Demo and source links are not available in this workspace.</p>
      </div>
    </article>
  );
}
