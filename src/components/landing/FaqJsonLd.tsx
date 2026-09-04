// FAQPage structured data, rendered server-side from the SAME array the page
// walks. That is the whole point of the component: a hand-maintained JSON-LD
// block drifts from the visible FAQ, and Google treats a rich result that does
// not match the page as a violation rather than a mistake.
//
// Organization schema is untouched - this only adds FAQPage.

export function FaqJsonLd({ entries }: { entries: [string, string][] }) {
  if (entries.length === 0) return null;
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: entries.map(([q, a]) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };
  return (
    <script
      type="application/ld+json"
      // The content is our own copy, not user input, and JSON.stringify escapes
      // the quotes. The `<` guard is the one real hazard: a literal "</script>"
      // inside a string would close the tag early.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
