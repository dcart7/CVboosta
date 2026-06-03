"use client";

import Link from "next/link";
import type { ReactNode } from "react";

type InlineToken =
  | { type: "text"; value: string }
  | { type: "bold"; value: string }
  | { type: "italic"; value: string }
  | { type: "code"; value: string }
  | { type: "link"; label: string; href: string };

function tokenizeInline(markdown: string): InlineToken[] {
  const tokens: InlineToken[] = [];
  let i = 0;

  const pushText = (value: string) => {
    if (!value) return;
    const prev = tokens[tokens.length - 1];
    if (prev?.type === "text") {
      prev.value += value;
    } else {
      tokens.push({ type: "text", value });
    }
  };

  while (i < markdown.length) {
    // Links: [label](href)
    if (markdown[i] === "[") {
      const close = markdown.indexOf("]", i + 1);
      const openParen = close >= 0 ? markdown.indexOf("(", close + 1) : -1;
      const closeParen = openParen >= 0 ? markdown.indexOf(")", openParen + 1) : -1;
      if (close > i && openParen === close + 1 && closeParen > openParen) {
        const label = markdown.slice(i + 1, close);
        const href = markdown.slice(openParen + 1, closeParen);
        if (href.startsWith("/") || href.startsWith("http://") || href.startsWith("https://")) {
          tokens.push({ type: "link", label, href });
          i = closeParen + 1;
          continue;
        }
      }
    }

    // Inline code: `code`
    if (markdown[i] === "`") {
      const end = markdown.indexOf("`", i + 1);
      if (end > i + 1) {
        tokens.push({ type: "code", value: markdown.slice(i + 1, end) });
        i = end + 1;
        continue;
      }
    }

    // Bold: **text**
    if (markdown.startsWith("**", i)) {
      const end = markdown.indexOf("**", i + 2);
      if (end > i + 2) {
        tokens.push({ type: "bold", value: markdown.slice(i + 2, end) });
        i = end + 2;
        continue;
      }
    }

    // Italic: *text*
    if (markdown[i] === "*") {
      const end = markdown.indexOf("*", i + 1);
      if (end > i + 1) {
        tokens.push({ type: "italic", value: markdown.slice(i + 1, end) });
        i = end + 1;
        continue;
      }
    }

    pushText(markdown[i]);
    i += 1;
  }

  return tokens;
}

function renderInline(markdown: string): ReactNode[] {
  const tokens = tokenizeInline(markdown);
  return tokens.map((token, index) => {
    if (token.type === "text") return token.value;
    if (token.type === "bold") return <strong key={`b-${index}`}>{token.value}</strong>;
    if (token.type === "italic") return <em key={`i-${index}`}>{token.value}</em>;
    if (token.type === "code") return <code key={`c-${index}`}>{token.value}</code>;
    if (token.type === "link") {
      if (token.href.startsWith("/")) {
        return (
          <Link key={`l-${index}`} href={token.href}>
            {token.label}
          </Link>
        );
      }
      return (
        <a key={`l-${index}`} href={token.href} target="_blank" rel="noopener noreferrer">
          {token.label}
        </a>
      );
    }
    return null;
  });
}

function isTableSeparator(line: string): boolean {
  // Markdown table separator row: | --- | :---: | ---: |
  const trimmed = line.trim();
  if (!trimmed.includes("|")) return false;
  const parts = trimmed.split("|").map((p) => p.trim()).filter(Boolean);
  if (parts.length < 2) return false;
  return parts.every((cell) => /^:?-{3,}:?$/.test(cell));
}

function parseTableRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function renderMarkdownLite(markdown: string): ReactNode {
  const lines = (markdown || "").replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];

  let i = 0;
  while (i < lines.length) {
    const raw = lines[i];
    const line = raw.trimEnd();

    if (!line.trim()) {
      i += 1;
      continue;
    }

    // Code fence
    if (line.trim().startsWith("```")) {
      const fence = line.trim();
      const language = fence.slice(3).trim();
      const codeLines: string[] = [];
      i += 1;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i += 1;
      }
      // Consume closing fence if present
      if (i < lines.length && lines[i].trim().startsWith("```")) i += 1;
      blocks.push(
        <pre key={`code-${i}`} data-lang={language || undefined}>
          <code>{codeLines.join("\n")}</code>
        </pre>,
      );
      continue;
    }

    // Headings
    if (line.startsWith("## ")) {
      blocks.push(<h2 key={`h2-${i}`}>{renderInline(line.slice(3).trim())}</h2>);
      i += 1;
      continue;
    }
    if (line.startsWith("### ")) {
      blocks.push(<h3 key={`h3-${i}`}>{renderInline(line.slice(4).trim())}</h3>);
      i += 1;
      continue;
    }
    if (line.startsWith("#### ")) {
      blocks.push(<h4 key={`h4-${i}`}>{renderInline(line.slice(5).trim())}</h4>);
      i += 1;
      continue;
    }

    // Table (header + separator + rows)
    if (line.includes("|") && i + 1 < lines.length && isTableSeparator(lines[i + 1])) {
      const header = parseTableRow(line);
      i += 2; // skip separator
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim() && lines[i].includes("|")) {
        rows.push(parseTableRow(lines[i]));
        i += 1;
      }
      blocks.push(
        <div key={`tbl-wrap-${i}`} style={{ overflowX: "auto" }}>
          <table>
            <thead>
              <tr>
                {header.map((cell) => (
                  <th key={cell}>{renderInline(cell)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ridx) => (
                <tr key={`r-${ridx}`}>
                  {row.map((cell, cidx) => (
                    <td key={`c-${ridx}-${cidx}`}>{renderInline(cell)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }

    // Before/After pairs: "- **Before:** ..." + "- **After:** ..."
    const beforeMatch = raw.match(/^\s*-\s+(?:\*\*)?Before:(?:\*\*)?\s*(.+)$/i);
    if (beforeMatch) {
      const beforeText = beforeMatch[1].trim();
      let j = i + 1;
      while (j < lines.length && !lines[j].trim()) j += 1;
      const afterMatch =
        j < lines.length
          ? lines[j].match(/^\s*-\s+(?:\*\*)?After:(?:\*\*)?\s*(.+)$/i)
          : null;
      if (afterMatch) {
        const afterText = afterMatch[1].trim();
        blocks.push(
          <div className="before-after" key={`ba-${i}`}>
            <div className="before-after-card is-before">
              <div className="before-after-label">Before</div>
              <div className="before-after-text">{renderInline(beforeText)}</div>
            </div>
            <div className="before-after-card is-after">
              <div className="before-after-label">After</div>
              <div className="before-after-text">{renderInline(afterText)}</div>
            </div>
          </div>,
        );
        i = j + 1;
        continue;
      }
    }

    // Unordered list
    if (/^\s*-\s+/.test(raw)) {
      const items: ReactNode[] = [];
      while (i < lines.length && /^\s*-\s+/.test(lines[i])) {
        const itemText = lines[i].replace(/^\s*-\s+/, "").trim();
        items.push(<li key={`ul-${i}`}>{renderInline(itemText)}</li>);
        i += 1;
      }
      blocks.push(<ul key={`ul-block-${i}`}>{items}</ul>);
      continue;
    }

    // Ordered list
    if (/^\s*\d+\.\s+/.test(raw)) {
      const items: ReactNode[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        const itemText = lines[i].replace(/^\s*\d+\.\s+/, "").trim();
        items.push(<li key={`ol-${i}`}>{renderInline(itemText)}</li>);
        i += 1;
      }
      blocks.push(<ol key={`ol-block-${i}`}>{items}</ol>);
      continue;
    }

    // Paragraph (consume until blank line or new block)
    const paragraphLines: string[] = [];
    while (i < lines.length && lines[i].trim()) {
      const peek = lines[i];
      if (
        peek.startsWith("## ") ||
        peek.startsWith("### ") ||
        peek.startsWith("#### ") ||
        peek.trim().startsWith("```") ||
        /^\s*-\s+/.test(peek) ||
        /^\s*\d+\.\s+/.test(peek) ||
        (peek.includes("|") && i + 1 < lines.length && isTableSeparator(lines[i + 1]))
      ) {
        break;
      }
      paragraphLines.push(peek.trim());
      i += 1;
    }
    const paragraph = paragraphLines.join(" ");
    blocks.push(<p key={`p-${i}`}>{renderInline(paragraph)}</p>);
  }

  return <>{blocks}</>;
}

export default function MarkdownLite({ markdown }: { markdown: string }) {
  return renderMarkdownLite(markdown);
}
