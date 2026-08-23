import { Link } from "react-router-dom";
import { ArrowUpRight, Check } from "lucide-react";
import { meta, offers, offersPage } from "@/content/content";
import { SKOOL_COMMUNITY_URL } from "@/lib/config";
import Seo from "@/components/Seo";
import Photo from "@/components/Photo";
import Reveal from "@/components/Reveal";
import { buttonClasses } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Offers() {
  return (
    <>
      <Seo title={meta.offers.title} description={meta.offers.description} path="/offers" />

      <section className="pt-24 md:pt-28">
        <div className="mx-auto w-full max-w-6xl px-5 md:px-8">
          <div className="max-w-2xl">
            {offersPage.eyebrow && (
              <p className="eyebrow hero-rise mb-3" style={{ animationDelay: "0.05s" }}>
                {offersPage.eyebrow}
              </p>
            )}
            {/* No prices anywhere by design — pricing is discussed personally. */}
            <h1
              className="hero-rise font-display text-4xl font-medium leading-tight tracking-tight md:text-5xl"
              style={{ animationDelay: "0.15s" }}
            >
              {offersPage.heading}
            </h1>
          </div>

          <div className="mt-14 space-y-16 pb-16 md:mt-20 md:space-y-24 md:pb-24">
            {offers.map((offer, i) => (
              <Reveal key={offer.id}>
                <article className="grid items-center gap-8 md:grid-cols-2 md:gap-14">
                  {/* Alternating image/text rows */}
                  <div className={cn(i % 2 === 1 && "md:order-2")}>
                    {/* Tall photos render uncropped at natural proportions,
                        width-capped so the row doesn't tower; wide photos
                        keep the standard 3:2 crop. */}
                    <Photo
                      src={(offer.pageImage ?? offer.image).src}
                      alt={(offer.pageImage ?? offer.image).alt}
                      ratio={offer.pageImage?.tall ? "natural" : "3/2"}
                      width={(offer.pageImage ?? offer.image).w}
                      height={(offer.pageImage ?? offer.image).h}
                      className={cn(offer.pageImage?.tall && "mx-auto max-w-md")}
                    />
                  </div>
                  <div className={cn(i % 2 === 1 && "md:order-1")}>
                    <h2 className="font-display text-2xl font-medium leading-snug tracking-tight md:text-3xl">
                      {offer.title}
                    </h2>
                    <p className="mt-4 leading-relaxed text-ink/85">{offer.whatItIs}</p>
                    <p className="mt-3 text-sm leading-relaxed text-umber">
                      <span className="font-semibold text-ink/70">{offersPage.whoItsForLabel} </span>
                      {offer.whoItsFor}
                    </p>
                    <ul className="mt-5 space-y-2.5">
                      {offer.included.map((line) => (
                        <li key={line} className="flex items-start gap-2.5 text-sm leading-relaxed">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-steel" aria-hidden />
                          {line}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-7 flex flex-wrap gap-3">
                      {offer.ctas.map((cta, ctaIndex) =>
                        // The community CTA links straight to Skool once the
                        // URL is configured; until then it falls back to the
                        // contact form like every other offer.
                        cta.slug === "community" && SKOOL_COMMUNITY_URL ? (
                          <a
                            key={cta.slug}
                            href={SKOOL_COMMUNITY_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={buttonClasses("primary")}
                          >
                            {cta.label}
                            <ArrowUpRight className="h-4 w-4" aria-hidden />
                          </a>
                        ) : (
                          <Link
                            key={cta.slug}
                            to={`/contact?interest=${cta.slug}`}
                            className={buttonClasses(ctaIndex === 0 ? "primary" : "ghost")}
                          >
                            {cta.label}
                          </Link>
                        ),
                      )}
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
