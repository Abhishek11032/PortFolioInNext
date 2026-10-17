import Image from "next/image";
import SocialLinks from "@/components/ui/SocialLinks";

const heroSkills = ["React.js", "Next.js", "TypeScript", "Python", "Django REST Framework", "FastAPI", "GenAI"];

export default function HeroSection() {
  return (
    <section id="Home" aria-labelledby="hero-title" className="relative isolate overflow-hidden bg-[radial-gradient(ellipse_at_76%_30%,rgba(139,92,246,.18),transparent_38%),radial-gradient(ellipse_at_82%_68%,rgba(34,211,238,.08),transparent_32%),#0b1020]">
      <div className="mx-auto grid min-h-[calc(100svh-72px)] max-w-[1440px] items-center gap-12 px-5 pb-24 pt-14 sm:px-8 sm:pt-16 lg:grid-cols-[1.15fr_.85fr] lg:gap-16 lg:px-[8vw] lg:py-20">
        <div className="relative z-10 max-w-[720px]">
          <p className="mb-5 flex items-center gap-2.5 text-xs font-medium uppercase tracking-[.18em] text-cyan"><span className="size-2 rounded-full bg-cyan shadow-[0_0_16px_rgba(34,211,238,.45)]" />Full Stack Developer</p>
          <h1 id="hero-title" className="max-w-[720px] text-[clamp(2.55rem,8vw,5.25rem)] font-bold leading-[1.02] tracking-[-.06em] text-cream">Abhishek Tiwari<span className="bg-gradient-to-r from-accent to-cyan bg-clip-text text-transparent">.</span></h1>
          <h2 className="mt-5 max-w-[620px] text-[clamp(1.3rem,3vw,2rem)] font-semibold leading-tight tracking-[-.035em] text-cream">Building reliable products across the stack.</h2>
          <p className="mt-5 max-w-[610px] text-[15px] leading-7 text-muted sm:text-base">I develop responsive web applications and backend services for SaaS, fintech, and business platforms, with a focus on maintainable interfaces, secure APIs, and dependable data systems.</p>

          <ul aria-label="Core technologies" className="mt-6 flex max-w-[640px] flex-wrap gap-2">
            {heroSkills.map((skill) => <li key={skill} className="rounded-full border border-cyan/20 bg-cyan/[.06] px-3 py-1.5 text-xs font-medium text-cyan">{skill}</li>)}
          </ul>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a href="#Projects" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-accent px-5 text-sm font-semibold text-black shadow-lg shadow-accent/20 transition duration-200 hover:-translate-y-0.5 hover:bg-violet-500 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan">View Projects <i className="bx bx-arrow-down-right" aria-hidden="true" /></a>
            <a href="#Contact" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-line bg-surface/70 px-5 text-sm font-semibold text-cream transition duration-200 hover:border-cyan/50 hover:bg-hover-surface focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan">Contact Me <i className="bx bx-envelope" aria-hidden="true" /></a>
            <a href="https://drive.google.com/file/d/1ff0iQOH0BQU3K1KrsZahw7qNPOR-sQiB/view?usp=sharing" target="_blank" rel="noreferrer" className="inline-flex min-h-12 items-center gap-2 px-2 text-sm font-medium text-muted transition-colors hover:text-cyan focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan">Résumé <i className="bx bx-arrow-up-right" aria-hidden="true" /></a>
          </div>

          <SocialLinks />
        </div>

        <div className="relative mx-auto w-[min(76%,360px)] lg:w-full lg:max-w-[390px] lg:justify-self-end">
          <div aria-hidden="true" className="absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-accent/20 via-transparent to-cyan/10 blur-2xl" />
          <div className="relative overflow-hidden rounded-[2rem] border border-line bg-surface p-2 shadow-2xl shadow-black/30">
            <div className="overflow-hidden rounded-[1.5rem] bg-hover-surface">
              <Image src="/image.jpg.png" alt="Portrait of Abhishek Tiwari" width={600} height={800} priority sizes="(max-width: 1023px) 76vw, 34vw" className="aspect-[.83] w-full object-cover object-[center_28%]" />
            </div>
            <div className="absolute bottom-6 left-0 flex items-center gap-2 rounded-r-xl border border-line bg-ink/95 px-4 py-3 text-xs font-medium text-cream shadow-lg">
              <span className="size-2 rounded-full bg-cyan" />Full Stack Developer
            </div>
          </div>
          <span aria-hidden="true" className="absolute -right-3 -top-3 -z-10 size-24 rounded-full border border-accent/20" />
        </div>
      </div>
      <a href="#About" aria-label="Scroll to About" className="absolute bottom-5 left-5 hidden items-center gap-3 text-xs text-muted transition-colors hover:text-cyan sm:flex lg:left-[8vw]"><span className="h-px w-8 bg-cyan" />Scroll to explore</a>
    </section>
  );
}
