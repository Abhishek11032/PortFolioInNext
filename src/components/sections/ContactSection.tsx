import SocialLinks from "@/components/ui/SocialLinks";

export default function ContactSection() {
  return (
    <section id="Contact" aria-labelledby="contact-title" className="scroll-mt-24 border-t border-line bg-[radial-gradient(ellipse_at_50%_100%,rgba(139,92,246,.12),transparent_55%),#0b1020] px-5 py-20 text-center sm:px-8 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-[760px]"><p className="mb-3 text-xs font-semibold tracking-[.16em] text-cyan">LET&apos;S CONNECT</p>
        <h2 id="contact-title" className="mx-auto max-w-[700px] text-[clamp(2rem,5vw,3.5rem)] font-bold leading-tight tracking-[-.045em] text-cream">Have a product to build? <span className="bg-gradient-to-r from-accent to-cyan bg-clip-text text-transparent">Let&apos;s talk.</span></h2>
        <p className="mx-auto mt-4 max-w-[560px] text-sm leading-7 text-muted">For opportunities and professional inquiries, reach out by email or connect with me on LinkedIn.</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3"><a href="mailto:abhishekt1132000@gmail.com" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-accent px-5 text-sm font-semibold text-black transition duration-200 hover:-translate-y-0.5 hover:bg-violet-500 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan"><i className="bx bx-envelope" aria-hidden="true" />Email me</a><a href="tel:+917054252971" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-line bg-surface px-5 text-sm font-semibold text-cream transition-colors hover:border-cyan/40 hover:bg-hover-surface focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan"><i className="bx bx-phone" aria-hidden="true" />+91 70542 52971</a></div>
        <SocialLinks compact />
      </div>
    </section>
  );
}
