import { Link } from "react-router-dom";
import { finalCta } from "@/content/content";
import { buttonClasses } from "@/components/ui/button";
import Reveal from "@/components/Reveal";

/**
 * Full-width contrasting CTA band — the closing move on Home, About, and
 * Offers. Everything routes to /contact (conversion goal #1).
 */
export default function CtaBand() {
  return (
    <section className="bg-char py-16 text-center md:py-24">
      <Reveal className="mx-auto max-w-2xl px-5">
        <h2 className="font-display text-3xl font-medium leading-tight tracking-tight text-bone md:text-4xl">
          {finalCta.heading}
        </h2>
        <p className="mt-4 text-bone/70">{finalCta.reassurance}</p>
        <Link to="/contact" className={buttonClasses("light", "mt-8 px-8 py-4 text-base")}>
          {finalCta.cta}
        </Link>
      </Reveal>
    </section>
  );
}
