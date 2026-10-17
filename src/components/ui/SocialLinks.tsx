import { socialLinks } from "@/data/socialLinks";

export default function SocialLinks({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`flex items-center gap-2.5 ${compact ? "mt-7 justify-center" : "mt-7"}`}>
      {socialLinks.map(({ label, href, icon }) => (
        <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={`${label} (opens in a new tab)`} title={label} className="grid size-11 place-items-center rounded-xl border border-line bg-surface text-muted transition-[color,border-color,background] hover:border-cyan/40 hover:bg-hover-surface hover:text-cyan focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan">
          <i className={`bx ${icon}`} aria-hidden="true" />
        </a>
      ))}
    </div>
  );
}
