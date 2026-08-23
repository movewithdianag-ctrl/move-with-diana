import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Scroll handling for a hash-aware SPA:
 *  • plain route change → scroll to top
 *  • route change with a hash (e.g. /#schedule from any page) → scroll to
 *    that element once it's rendered; scroll-margin-top in index.css keeps
 *    it clear of the sticky header.
 */
export default function ScrollManager() {
  const { hash, key } = useLocation();

  // Keyed on location.key (not pathname/hash): every navigation gets a fresh
  // key, so clicking the same link again still re-scrolls.
  useEffect(() => {
    if (hash) {
      // By effect time the new page is committed, so the target usually
      // exists; the setTimeout covers anything mounted late. Deliberately not
      // requestAnimationFrame — rAF never fires in background tabs.
      const id = hash.slice(1);
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView();
      } else {
        setTimeout(() => document.getElementById(id)?.scrollIntoView(), 0);
      }
    } else {
      window.scrollTo(0, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return null;
}
