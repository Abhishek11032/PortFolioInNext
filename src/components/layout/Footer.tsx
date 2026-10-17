import Link from "next/link";

export default function Footer() {
  return (
    <footer className="flex min-h-20 flex-wrap items-center justify-center gap-4 border-t border-line bg-ink px-5 py-6 text-center sm:justify-between sm:px-[7vw] sm:text-left">
      <Link href="#Home" className="flex-1 text-sm font-semibold text-cream sm:flex-none">Abhishek Tiwari<span className="text-accent">.</span></Link>
      <p className="order-3 basis-full text-xs text-dim sm:order-none sm:basis-auto">Designed and developed by Abhishek · {new Date().getFullYear()}</p>
      <a href="#Home" className="flex-1 text-right text-xs text-muted transition-colors hover:text-cyan sm:flex-none">Back to top <i className="bx bx-up-arrow-alt" aria-hidden="true" /></a>
    </footer>
  );
}
