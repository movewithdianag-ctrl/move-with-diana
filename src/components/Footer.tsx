import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Mail } from "lucide-react";
import { footer, nav, site } from "@/content/content";
import { SHOW_SCHEDULE, SKOOL_COMMUNITY_URL } from "@/lib/config";
import { submitNewsletter } from "@/lib/contact";
import SocialLinks from "@/components/SocialLinks";
import { cn } from "@/lib/utils";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type NewsletterState = "idle" | "sending" | "success" | "error";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<NewsletterState>("idle");
  const [errorText, setErrorText] = useState("");

  async function onSubscribe(e: FormEvent) {
    e.preventDefault();
    if (state === "sending") return;
    // Native type=email validation accepts dot-less domains ("jane@gmail"),
    // which our stricter check rejects — surface that instead of no-opping.
    if (!EMAIL_RE.test(email.trim())) {
      setErrorText(footer.newsletter.invalidEmailText);
      setState("error");
      return;
    }
    setState("sending");
    try {
      await submitNewsletter(email.trim());
      setState("success");
      setEmail("");
    } catch {
      setErrorText(footer.newsletter.errorText);
      setState("error");
    }
  }

  return (
    <footer className="bg-char text-bone/90">
      <div className="mx-auto w-full max-w-6xl px-5 py-14 md:px-8 md:py-20">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1.4fr]">
          {/* Wordmark + one-liner */}
          <div>
            <p className="font-display text-xl font-semibold tracking-tight text-bone">
              {site.name}
            </p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-bone/70">
              {footer.oneLiner}
            </p>
          </div>

          {/* Page links */}
          <nav aria-label="Footer">
            <p className="eyebrow mb-4 !text-bone/50">{footer.linksHeading}</p>
            <ul className="space-y-2.5">
              {nav.links
                .filter((l) => SHOW_SCHEDULE || !l.to.includes("#schedule"))
                .map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-bone/80 transition-colors hover:text-bone"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Connect + newsletter */}
          <div>
            <p className="eyebrow mb-4 !text-bone/50">{footer.connectHeading}</p>
            <SocialLinks className="mb-4" iconClassName="text-bone/80" />
            <a
              href={`mailto:${site.email}`}
              className="inline-flex items-center gap-2 text-sm text-bone/80 transition-colors hover:text-bone"
            >
              <Mail className="h-4 w-4" aria-hidden />
              {site.email}
            </a>
            {/* Appears automatically once SKOOL_COMMUNITY_URL is set in config.ts */}
            {SKOOL_COMMUNITY_URL && (
              <a
                href={SKOOL_COMMUNITY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 block text-sm text-bone/80 transition-colors hover:text-bone"
              >
                {footer.communityLinkLabel}
              </a>
            )}

            <div className="mt-8">
              <p className="font-display text-lg font-medium text-bone">
                {footer.newsletter.heading}
              </p>
              <p className="mt-1.5 text-sm text-bone/70">{footer.newsletter.text}</p>

              {state === "success" ? (
                <p role="status" className="mt-4 rounded-lg bg-bone/10 px-4 py-3 text-sm text-bone">
                  {footer.newsletter.successToast}
                </p>
              ) : (
                <form onSubmit={onSubscribe} className="mt-4">
                  <div className="flex gap-2">
                    <label htmlFor="newsletter-email" className="sr-only">
                      Email for {footer.newsletter.heading}
                    </label>
                    <input
                      id="newsletter-email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (state === "error") setState("idle");
                      }}
                      placeholder={footer.newsletter.placeholder}
                      className="min-w-0 flex-1 rounded-full border border-bone/25 bg-transparent px-4 py-2 text-base text-bone placeholder:text-bone/50 focus:border-bone/60 focus:outline-none focus:ring-2 focus:ring-bone/30"
                    />
                    <button
                      type="submit"
                      disabled={state === "sending"}
                      className={cn(
                        "shrink-0 rounded-full bg-bone px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-plaster",
                        state === "sending" && "opacity-60",
                      )}
                    >
                      {state === "sending" ? "…" : footer.newsletter.button}
                    </button>
                  </div>
                  {state === "error" && (
                    <p role="alert" className="mt-2 text-sm text-red-300">
                      {errorText}
                    </p>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>

        <p className="mt-14 border-t border-bone/10 pt-6 text-xs text-bone/50">
          {footer.smallPrint}
        </p>
      </div>
    </footer>
  );
}
