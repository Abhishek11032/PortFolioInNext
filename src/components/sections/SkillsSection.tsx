import { skillGroups } from "@/data/skills";
import SectionHeading from "@/components/ui/SectionHeading";

export default function SkillsSection() {
  return (
    <section id="Skills" aria-labelledby="skills-title" className="scroll-mt-24 bg-surface/55 px-5 py-20 sm:px-8 sm:py-24 lg:px-[8vw] lg:py-28">
      <SectionHeading eyebrow="TOOLS I WORK WITH" title="Technical" accent="skills" />
      <p className="mt-4 max-w-[560px] text-sm leading-7 text-muted">A practical toolkit for building responsive products, reliable APIs, and data-driven features.</p>
      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        {skillGroups.map(({ title, icon, skills }, index) => <article key={title} className={`rounded-2xl border border-line bg-surface p-5 transition duration-200 hover:-translate-y-1 hover:border-accent/50 hover:bg-hover-surface ${index < 3 ? "lg:col-span-2" : "lg:col-span-3"}`}>
          <div className="flex items-center justify-between"><span className="grid size-10 place-items-center rounded-xl border border-cyan/25 bg-cyan/[.06] text-cyan"><i className={`bx ${icon} text-xl`} aria-hidden="true" /></span><span className="text-xs font-medium tracking-[.12em] text-dim">0{index + 1}</span></div>
          <h3 className="mb-4 mt-5 text-base font-semibold tracking-tight text-cream">{title}</h3>
          <ul className="flex flex-wrap gap-2">{skills.map((skill) => <li key={skill} className="rounded-lg border border-line bg-ink px-2.5 py-2 text-xs leading-tight text-muted">{skill}</li>)}</ul>
        </article>)}
      </div>
    </section>
  );
}
