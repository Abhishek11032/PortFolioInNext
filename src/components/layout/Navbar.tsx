"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const navigation = [
  { id: "About", label: "About" },
  { id: "Skills", label: "Skills" },
  { id: "Experience", label: "Experience" },
  { id: "Projects", label: "Projects" },
  { id: "Education", label: "Education" },
  { id: "Contact", label: "Contact" },
  { id: "job-fit-analyzer", label: "Job Fit Analyzer" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("Home");
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const sections = ["Home", ...navigation.map(({ id }) => id)]
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => section !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        const current = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (current) setActiveSection(current.target.id);
      },
      { rootMargin: "-96px 0px -58% 0px", threshold: 0 },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface/95 px-4 backdrop-blur-sm sm:px-6 lg:px-[7vw]">
      <div className="mx-auto flex min-h-[72px] max-w-[1440px] items-center justify-between gap-2 sm:gap-4">
        <Link href="#Home" className="inline-flex min-w-0 shrink-0 items-center gap-2.5 text-sm font-semibold tracking-tight text-cream sm:gap-3 sm:text-[15px]" aria-label="Abhishek Tiwari, home" onClick={() => setMenuOpen(false)}>
          <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-accent/50 bg-surface text-base">A<span className="text-accent">.</span></span>
          <span className="max-[440px]:hidden">Abhishek Tiwari</span>
        </Link>

        <nav
          id="portfolio-navigation"
          aria-label="Main navigation"
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setMenuOpen(false);
              menuButtonRef.current?.focus();
            }
          }}
          className={`${menuOpen ? "grid" : "hidden"} absolute left-0 right-0 top-full gap-1 border-b border-line bg-surface px-4 py-3 shadow-xl shadow-black/20 lg:static lg:flex lg:items-center lg:gap-1 lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none`}
        >
          {navigation.map(({ id, label }) => {
            const active = activeSection === id;
            const href = id === "job-fit-analyzer" ? "/#job-fit-analyzer" : `#${id}`;
            return (
              <Link
                key={id}
                href={href}
                aria-current={active ? "location" : undefined}
                onClick={() => setMenuOpen(false)}
                className={`min-h-11 rounded-lg px-3 py-3 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan lg:min-h-0 lg:px-2.5 lg:py-2 lg:text-xs xl:px-3 ${active ? "border-l-2 border-accent bg-hover-surface font-medium text-cyan lg:border-l-0 lg:bg-transparent lg:underline lg:decoration-accent lg:decoration-2 lg:underline-offset-8" : "text-muted hover:bg-hover-surface hover:text-cream lg:hover:bg-transparent lg:hover:text-cyan"}`}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <Link
          href="/#job-fit-analyzer"
          onClick={() => setMenuOpen(false)}
          className="inline-flex min-h-11 shrink-0 items-center rounded-lg border border-accent/40 bg-accent/10 px-2.5 text-[11px] font-semibold text-cream transition-colors hover:border-cyan/50 hover:bg-hover-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan sm:px-3 sm:text-xs lg:hidden"
        >
          Job Fit Analyzer
        </Link>

        <button
          ref={menuButtonRef}
          type="button"
          className="grid size-11 shrink-0 place-items-center rounded-lg border border-line text-xl text-cream transition-colors hover:bg-hover-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan lg:hidden"
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
          aria-controls="portfolio-navigation"
          onClick={() => setMenuOpen((open) => !open)}
          onKeyDown={(event) => {
            if (event.key === "Escape") setMenuOpen(false);
          }}
        >
          <i className={`bx ${menuOpen ? "bx-x" : "bx-menu"}`} aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}
