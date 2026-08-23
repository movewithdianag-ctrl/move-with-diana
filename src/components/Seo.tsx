import { useEffect } from "react";

interface SeoProps {
  title: string;
  description: string;
  /** Route path, used to build the canonical/OG URL. */
  path: string;
}

// Update this to the production domain once DNS is pointed at the new site.
const SITE_ORIGIN = "https://movewithdianag.com";

/**
 * Per-page <title>, meta description, and OpenGraph/Twitter tags.
 *
 * Implemented as a small head-manager hook rather than react-helmet-async:
 * this site is a client-only SPA (no SSR), where helmet's only job is the
 * same DOM manipulation done here — minus a dependency that has proven
 * flaky under React 18 StrictMode.
 */
function upsertMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

export default function Seo({ title, description, path }: SeoProps) {
  useEffect(() => {
    const url = `${SITE_ORIGIN}${path === "/" ? "" : path}`;

    document.title = title;
    upsertMeta("name", "description", description);
    upsertMeta("property", "og:type", "website");
    upsertMeta("property", "og:site_name", "Move with Diana");
    upsertMeta("property", "og:title", title);
    upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:url", url);
    upsertMeta("property", "og:image", `${SITE_ORIGIN}/images/hero-home.jpg`);
    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", title);
    upsertMeta("name", "twitter:description", description);

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", url);
  }, [title, description, path]);

  return null;
}
