import Image from "next/image";
import SectionHeading from "@/components/ui/SectionHeading";

const strengths = ["Responsive, reusable UI", "Full-stack web development", "APIs and relational data"];

export default function AboutSection() {
  return (
    <section id="About" aria-labelledby="about-title" className="scroll-mt-24 px-5 py-20 sm:px-8 sm:py-24 lg:px-[8vw] lg:py-28">
      <SectionHeading eyebrow="A LITTLE ABOUT ME" title="About" accent="me" />
      <div className="mt-9 grid items-center gap-9 sm:mt-14 md:grid-cols-[minmax(240px,.76fr)_minmax(0,1.24fr)] md:gap-12 lg:gap-20">
        <div className="relative mx-auto w-[82%] max-w-[390px] rounded-2xl border border-line bg-surface p-2.5 sm:mx-0">
          <Image src="/img.jpg" alt="Abhishek Tiwari" width={492} height={492} sizes="(max-width: 760px) 80vw, 34vw" className="block h-auto w-full rounded-xl" />
          <span className="absolute bottom-6 right-[-12px] rounded-lg border border-line bg-hover-surface px-4 py-3 text-xs font-medium text-cyan">Abhishek Tiwari</span>
        </div>
        <div className="max-w-[680px] text-sm leading-7 text-muted">
          <p className="mb-4 text-base leading-7 text-cream">I&apos;m a Full Stack Developer with 2.5+ years of professional experience building scalable SaaS, fintech, and business management applications. I specialize in React.js, Next.js, TypeScript, JavaScript, Python, Django REST Framework, and PostgreSQL, with a strong focus on creating responsive user interfaces and reliable backend systems.</p>
          <p className="mb-4">My experience includes developing reusable UI components, designing secure REST APIs, implementing JWT authentication and role-based access control, optimizing database queries, and integrating AI-powered document processing workflows. I&apos;ve worked on enterprise applications, fintech and KYC platforms, business management systems, and reporting dashboards.</p>
          <p>I enjoy solving complex engineering problems, improving application performance, and translating business requirements into reliable software solutions. I&apos;m passionate about clean code, scalable architecture, and continuously learning modern technologies to build efficient, secure, and maintainable applications.</p>
          <div className="mt-6 flex flex-wrap gap-2" aria-label="Core technology highlights">{["React.js", "Next.js", "TypeScript", "Python", "Django REST Framework", "FastAPI", "PostgreSQL", "GenAI"].map((tech) => <span key={tech} className="rounded-full border border-line bg-surface px-3 py-1.5 text-xs text-cyan">{tech}</span>)}</div>
          <div className="my-7 grid gap-0 sm:grid-cols-3 sm:gap-3">{strengths.map((item, index) => <div key={item} className="flex gap-3 border-t border-line py-3 sm:block sm:px-3"><span className="text-xs font-semibold text-cyan">0{index + 1}</span><p className="text-xs leading-snug text-cream sm:mt-2">{item}</p></div>)}</div>
          <a href="https://drive.google.com/file/d/1ff0iQOH0BQU3K1KrsZahw7qNPOR-sQiB/view?usp=sharing" target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-semibold text-cyan transition-colors hover:text-cream focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan">View résumé <i className="bx bx-arrow-up-right" aria-hidden="true" /></a>
        </div>
      </div>
    </section>
  );
}
