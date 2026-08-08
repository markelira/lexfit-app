import "server-only";
import fs from "node:fs";
import path from "node:path";
import { marked } from "marked";

// Renders a canonical legal document from docs/legal/*.md at build time.
// The markdown files are the single source of truth (owner + lawyer review
// happens there); the web pages are a projection of them.
//
// Stripped before rendering:
//  - the internal "[KITÖLTENDŐ]" checklist section (owner-facing, not public)
//  - HTML comments (lawyer-review notes)
export function LegalDoc({ file }: { file: "aszf.md" | "adatkezelesi-tajekoztato.md" | "impresszum.md" }) {
  const raw = fs.readFileSync(path.join(process.cwd(), "docs", "legal", file), "utf8");
  const cleaned = raw
    .replace(/^## \*\*\[KITÖLTENDŐ\]\*\*[\s\S]*?\n---\n/m, "")
    .replace(/<!--[\s\S]*?-->/g, "");
  const html = marked.parse(cleaned, { async: false });
  return <article className="legal-doc" dangerouslySetInnerHTML={{ __html: html }} />;
}
