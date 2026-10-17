import SectionHeading from "@/components/ui/SectionHeading";

export default function EducationSection() {
  return (
    <section id="Education" aria-labelledby="education-title" className="scroll-mt-24 px-5 py-20 sm:px-8 sm:py-24 lg:px-[8vw] lg:py-28">
      <SectionHeading eyebrow="ACADEMIC BACKGROUND" title="Education" />
      <article className="mt-8 flex max-w-[920px] flex-wrap items-center gap-4 rounded-2xl border border-line bg-surface p-5 sm:mt-10 sm:p-7">
        <span className="grid size-12 shrink-0 place-items-center rounded-xl border border-cyan/25 bg-cyan/[.06] text-cyan"><i className="bx bx-graduation text-2xl" aria-hidden="true" /></span>
        <div className="min-w-[180px] flex-1"><p className="mb-1.5 text-xs font-semibold tracking-[.08em] text-cyan">2019 — 2023</p><h3 className="text-base font-semibold leading-snug text-cream sm:text-lg">B.E. in Computer Science &amp; Engineering</h3><p className="mt-1.5 text-sm text-muted">Savitribai Phule Pune University</p></div>
        <span className="ml-[64px] text-xs tracking-[.08em] text-muted sm:ml-0 sm:border-l sm:border-line sm:pl-5">CGPA <strong className="ml-1.5 text-lg text-cream">7.29</strong><small className="text-xs text-dim"> / 10</small></span>
      </article>
    </section>
  );
}
