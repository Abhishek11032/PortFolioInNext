import { Fragment, type ReactNode } from "react";

type AssistantMessageProps = {
  content: string;
};

const inlinePattern = /(\*\*[^*]+\*\*|__[^_]+__|\*[^*\n]+\*|_[^_\n]+_|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;

function safeLink(rawHref: string): { href: string; external: boolean } | null {
  try {
    const url = new URL(rawHref);
    if (url.protocol === "https:" || url.protocol === "http:") {
      return { href: url.toString(), external: true };
    }
    if (url.protocol === "mailto:") return { href: url.toString(), external: false };
  } catch {
    return null;
  }
  return null;
}

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  return text.split(inlinePattern).filter(Boolean).map((part, index) => {
    const key = `${keyPrefix}-${index}`;
    if ((part.startsWith("**") && part.endsWith("**")) || (part.startsWith("__") && part.endsWith("__"))) {
      return <strong key={key} className="font-semibold text-cream">{part.slice(2, -2)}</strong>;
    }
    if ((part.startsWith("*") && part.endsWith("*")) || (part.startsWith("_") && part.endsWith("_"))) {
      return <em key={key} className="italic">{part.slice(1, -1)}</em>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={key} className="rounded bg-hover-surface px-1.5 py-0.5 font-mono text-[0.9em] text-cyan [overflow-wrap:anywhere]">{part.slice(1, -1)}</code>;
    }
    if (part.startsWith("[")) {
      const match = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (match) {
        const link = safeLink(match[2]);
        if (link) {
          return (
            <a key={key} href={link.href} className="break-all text-cyan underline decoration-cyan/40 underline-offset-2 hover:decoration-cyan focus-visible:outline-2 focus-visible:outline-cyan" {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
              {match[1]}
            </a>
          );
        }
        return <Fragment key={key}>{match[1]}</Fragment>;
      }
    }
    return <Fragment key={key}>{part}</Fragment>;
  });
}

function isBlockStart(line: string) {
  return /^(#{1,3}\s|```|\s*[-*+]\s+|\s*\d+[.)]\s+|>\s?|\s*([-*_]\s*){3,}$)/.test(line);
}

export default function AssistantMessage({ content }: AssistantMessageProps) {
  const lines = content.replace(/\r\n?/g, "\n").split("\n");
  const blocks: ReactNode[] = [];

  for (let index = 0; index < lines.length;) {
    const line = lines[index];
    if (!line.trim()) {
      index += 1;
      continue;
    }

    if (line.startsWith("```")) {
      const codeLines: string[] = [];
      index += 1;
      while (index < lines.length && !lines[index].startsWith("```")) codeLines.push(lines[index++]);
      if (index < lines.length) index += 1;
      blocks.push(<pre key={`code-${index}`} className="mb-3 max-w-full overflow-x-auto rounded-lg border border-line bg-ink p-3 text-xs leading-5 last:mb-0"><code className="[overflow-wrap:anywhere]">{codeLines.join("\n")}</code></pre>);
      continue;
    }

    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      const Heading = heading[1].length === 1 ? "h3" : "h4";
      blocks.push(<Heading key={`heading-${index}`} className="mb-2 mt-4 text-base font-semibold leading-6 text-cream first:mt-0">{renderInline(heading[2], `heading-${index}`)}</Heading>);
      index += 1;
      continue;
    }

    if (/^\s*([-*_]\s*){3,}$/.test(line)) {
      blocks.push(<hr key={`rule-${index}`} className="my-3 border-line" />);
      index += 1;
      continue;
    }

    const unordered = line.match(/^\s*[-*+]\s+(.+)$/);
    const ordered = line.match(/^\s*\d+[.)]\s+(.+)$/);
    if (unordered || ordered) {
      const isOrdered = Boolean(ordered);
      const items: ReactNode[] = [];
      while (index < lines.length) {
        const item = lines[index].match(isOrdered ? /^\s*\d+[.)]\s+(.+)$/ : /^\s*[-*+]\s+(.+)$/);
        if (!item) break;
        items.push(<li key={index} className="ps-0.5">{renderInline(item[1], `list-item-${index}`)}</li>);
        index += 1;
      }
      const List = isOrdered ? "ol" : "ul";
      blocks.push(<List key={`list-${index}`} className={`mb-3 space-y-1 pl-5 last:mb-0 ${isOrdered ? "list-decimal" : "list-disc"}`}>{items}</List>);
      continue;
    }

    if (line.startsWith(">")) {
      const quoteLines: string[] = [];
      while (index < lines.length && lines[index].startsWith(">")) quoteLines.push(lines[index++].replace(/^>\s?/, ""));
      blocks.push(<blockquote key={`quote-${index}`} className="mb-3 border-l-2 border-cyan/50 pl-3 text-muted last:mb-0">{renderInline(quoteLines.join(" "), `quote-${index}`)}</blockquote>);
      continue;
    }

    const paragraph = [line];
    const paragraphKey = index;
    index += 1;
    while (index < lines.length && lines[index].trim() && !isBlockStart(lines[index])) paragraph.push(lines[index++]);
    blocks.push(<p key={`paragraph-${paragraphKey}`} className="mb-3 last:mb-0">{paragraph.flatMap((paragraphLine, lineIndex) => lineIndex === 0 ? renderInline(paragraphLine, `paragraph-${paragraphKey}-line-${lineIndex}`) : [<br key={`br-${lineIndex}`} />, ...renderInline(paragraphLine, `paragraph-${paragraphKey}-line-${lineIndex}`)])}</p>);
  }

  return <div className="min-w-0 break-words text-sm leading-6 text-cream [overflow-wrap:anywhere]">{blocks}</div>;
}
