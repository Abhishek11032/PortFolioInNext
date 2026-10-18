export default function SectionHeading({ eyebrow, title, accent, id }: { eyebrow: string; title: string; accent?: string; id?: string }) {
  return (
    <div className="max-w-[780px]">
      <p className="mb-3 text-xs font-semibold leading-relaxed tracking-[.16em] text-cyan">{eyebrow}</p>
      <h2 id={id} className="text-[clamp(2rem,5vw,3.5rem)] font-bold leading-[1.08] tracking-[-.045em] text-cream">
        {title}{accent && <> <span className="text-accent">{accent}</span></>}
      </h2>
    </div>
  );
}
