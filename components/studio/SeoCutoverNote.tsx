export function SeoCutoverNote() {
  return (
    <aside className="studio-note rounded-2xl border border-black/10 bg-white/70 p-5 text-sm leading-relaxed text-black/78">
      <p className="font-semibold text-black">Public identity</p>
      <p className="mt-2">
        Canonical site is <strong>https://edrisastudio.com</strong> (apex). Keep Site URL on that host. www redirects to
        apex.
      </p>
      <ol className="mt-3 list-decimal space-y-2 pl-5">
        <li>Buy the domain, attach it on Vercel (apex + www), then set Site URL here to https://edrisastudio.com.</li>
        <li>
          Search Console: URL-prefix property https://edrisastudio.com/, verify, submit /sitemap.xml. Optional env{" "}
          <code>GOOGLE_SITE_VERIFICATION</code>. Request indexing for /, /about, /services, /portfolio.
        </li>
        <li>
          Wikidata item Kasibante Edrisa, official website edrisastudio.com. Then set env{" "}
          <code>WIKIDATA_ENTITY_URL</code> to the item URL so it is added to sameAs. Do not write a Wikipedia
          autobiography.
        </li>
        <li>
          LinkedIn: display name Kasibante Edrisa, headline Designer &amp; Developer, featured link edrisastudio.com,
          CTA Start a project → /contact.
        </li>
        <li>
          Behance: display name Kasibante Edrisa. End project descriptions with edrisastudio.com/contact. Same portrait
          as the site.
        </li>
        <li>
          Add Instagram, X, or GitHub URLs only after those profiles exist under the same name. Empty socials stay out
          of schema.
        </li>
        <li>
          Knowledge Panel cannot be purchased. When Google shows one, claim it with the account that owns Search Console.
        </li>
        <li>Optional analytics: env NEXT_PUBLIC_GA_MEASUREMENT_ID.</li>
      </ol>
    </aside>
  );
}
