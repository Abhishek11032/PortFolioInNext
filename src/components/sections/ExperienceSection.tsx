import SectionHeading from "@/components/ui/SectionHeading";

export default function ExperienceSection() {
  return (
    <section id="Experience" aria-labelledby="experience-title" className="scroll-mt-24 bg-surface/55 px-5 py-20 sm:px-8 sm:py-24 lg:px-[8vw] lg:py-28">
      <SectionHeading eyebrow="CAREER" title="Professional" accent="experience" />
      <article className="mt-8 grid max-w-[920px] grid-cols-[20px_minmax(0,1fr)] gap-4 rounded-2xl border border-line bg-surface p-5 sm:mt-10 sm:grid-cols-[24px_minmax(0,1fr)] sm:gap-6 sm:p-7">
        <div aria-hidden="true" className="relative flex justify-center after:absolute after:bottom-[-40px] after:top-3 after:w-px after:bg-accent/35 after:content-['']"><span className="z-[1] mt-1 size-2.5 rounded-full border-2 border-cyan bg-surface" /></div>
        <div className="min-w-0">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><p className="mb-1.5 text-xs font-semibold uppercase tracking-[.12em] text-cyan">Gowdanar Technosoft Pvt. Ltd.</p><h3 className="text-lg font-semibold tracking-tight text-cream sm:text-xl">Software Developer — Full Stack</h3></div><span className="w-fit rounded-lg border border-line bg-ink px-3 py-2 text-xs text-muted">April 2024 – Present</span></div>
          <p className="mt-3 text-sm font-medium text-cyan">Bengaluru, India</p>
          <p className="mt-4 max-w-[780px] text-sm leading-7 text-muted">Developing scalable web applications and backend services for fintech, KYC, and enterprise business platforms. Building responsive frontend interfaces with React.js, Next.js, and TypeScript, and developing secure REST APIs using Django and Django REST Framework. Working on authentication, role-based permissions, database optimization, reporting systems, and AI-assisted document processing. Contributing to performance optimization, asynchronous task processing, application testing, and reliable production deployments.</p>
        </div>
      </article>
    </section>
  );
}
