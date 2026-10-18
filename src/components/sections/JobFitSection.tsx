import JobFitAnalyzer from "@/components/job-fit/JobFitAnalyzer";
import SectionHeading from "@/components/ui/SectionHeading";

export default function JobFitSection() {
  return (
    <section id="job-fit-analyzer" aria-labelledby="job-fit-title" className="scroll-mt-24 px-5 py-20 sm:px-8 sm:py-24 lg:px-[8vw] lg:py-28">
      <div className="mx-auto max-w-[1000px]">
        <SectionHeading id="job-fit-title" eyebrow="FOR RECRUITERS" title="AI Job Fit Analyzer" />
        <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">Compare a job description with Abhishek&apos;s verified skills, professional experience, and portfolio projects.</p>
        <div className="mt-8"><JobFitAnalyzer /></div>
      </div>
    </section>
  );
}
