import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { nav, site } from "@/content/content";
import { SHOW_SCHEDULE, SKOOL_COMMUNITY_URL } from "@/lib/config";
import { buttonClasses } from "@/components/ui/button";
import SocialLinks from "@/components/SocialLinks";
import { cn } from "@/lib/utils";

/**
 * Sticky global header: translucent over the hero, solid once scrolled.
 * Mobile: hamburger → full-screen sheet with large tap targets, socials at
 * the bottom, and the book CTA pinned visible. The sheet is a real modal:
 * focus is trapped inside, Escape closes, and focus returns to the hamburger.
 */
export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const sheetRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the sheet on any navigation.
  useEffect(() => {
    setOpen(false);
  }, [location.key]);

  // Sheet open: lock body scroll, move focus in, close on Escape, and close
  // if the viewport crosses into desktop (rotation would otherwise hide the
  // sheet via md:hidden while leaving the scroll lock orphaned). On close,
  // return focus to the hamburger so keyboard users keep their place.
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const mq = window.matchMedia("(min-width: 768px)");
    const onBreakpoint = (e: MediaQueryListEvent) => {
      if (e.matches) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    mq.addEventListener("change", onBreakpoint);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      mq.removeEventListener("change", onBreakpoint);
      triggerRef.current?.focus();
    };
  }, [open]);

  // Focus trap: keep Tab / Shift+Tab cycling inside the modal sheet.
  const onSheetKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Tab" || !sheetRef.current) return;
    const focusables = sheetRef.current.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled])',
    );
    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const isActive = (to: string) => {
    if (to === "/#schedule") return false;
    if (to === "/") return location.pathname === "/";
    return location.pathname.startsWith(to);
  };

  // The Schedule anchor link disappears while the section is archived.
  const navLinks = nav.links.filter((l) => SHOW_SCHEDULE || !l.to.includes("#schedule"));

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        scrolled || open
          ? "border-b border-ink/10 bg-bone/95 backdrop-blur"
          : "bg-bone/40 backdrop-blur-sm",
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 md:px-8">
        {/* Text wordmark — swap for a logo <img> here when one exists. */}
        <Link
          to="/"
          className="font-display text-lg font-semibold tracking-tight"
          aria-label={`${site.name} — home`}
        >
          {site.name}
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-7 md:flex">
          {navLinks.map((link) =>
            link.to.includes("#") ? (
              <Link
                key={link.label}
                to={link.to}
                className="text-sm font-medium text-ink/80 transition-colors hover:text-ink"
              >
                {link.label}
              </Link>
            ) : (
              <NavLink
                key={link.label}
                to={link.to}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-ink",
                  isActive(link.to)
                    ? "text-ink underline decoration-steel decoration-2 underline-offset-8"
                    : "text-ink/80",
                )}
              >
                {link.label}
              </NavLink>
            ),
          )}
          {/* "Get started" → the Skool community while the link is set; falls
              back to the contact form if it's ever cleared in the CMS. */}
          {SKOOL_COMMUNITY_URL ? (
            <a href={SKOOL_COMMUNITY_URL} className={buttonClasses("primary", "px-5 py-2.5")}>
              {nav.bookCta}
            </a>
          ) : (
            <Link to="/contact" className={buttonClasses("primary", "px-5 py-2.5")}>
              {nav.bookCta}
            </Link>
          )}
        </nav>

        <button
          ref={triggerRef}
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          aria-expanded={open}
          className="-mr-2 rounded-md p-2 md:hidden"
        >
          <Menu className="h-6 w-6" aria-hidden />
        </button>
      </div>

      {/* Full-screen mobile sheet — portaled to <body>: the header's
          backdrop-filter creates a containing block that would otherwise trap
          this fixed overlay inside the header's box. */}
      {open &&
        createPortal(
          <div
            ref={sheetRef}
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            onKeyDown={onSheetKeyDown}
            className="fixed inset-0 z-[60] flex flex-col overflow-y-auto bg-bone md:hidden"
          >
            <div className="flex h-16 items-center justify-between px-5">
              <span className="font-display text-lg font-semibold tracking-tight">
                {site.name}
              </span>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="-mr-2 rounded-md p-2"
              >
                <X className="h-6 w-6" aria-hidden />
              </button>
            </div>

            {/* my-auto (not flex-1/justify-center) so the sheet can scroll on
                short landscape phones without clipping either end. */}
            <nav aria-label="Main mobile" className="my-auto flex flex-col gap-1 px-6 py-6">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  onClick={() => setOpen(false)}
                  aria-current={isActive(link.to) ? "page" : undefined}
                  className={cn(
                    "rounded-lg px-2 py-3.5 font-display text-3xl font-medium tracking-tight",
                    isActive(link.to)
                      ? "text-steel underline decoration-steel decoration-2 underline-offset-8"
                      : "text-ink",
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="space-y-6 px-6 pb-10">
              {SKOOL_COMMUNITY_URL ? (
                <a
                  href={SKOOL_COMMUNITY_URL}
                  onClick={() => setOpen(false)}
                  className={buttonClasses("primary", "w-full py-4 text-base")}
                >
                  {nav.bookCta}
                </a>
              ) : (
                <Link
                  to="/contact"
                  onClick={() => setOpen(false)}
                  className={buttonClasses("primary", "w-full py-4 text-base")}
                >
                  {nav.bookCta}
                </Link>
              )}
              <SocialLinks className="justify-center" iconClassName="h-6 w-6" />
            </div>
          </div>,
          document.body,
        )}
    </header>
  );
}
