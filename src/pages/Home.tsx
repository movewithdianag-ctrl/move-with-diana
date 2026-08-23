import { Link } from "react-router-dom";
import { faqSection, hero, meta, schedule } from "@/content/content";
import Seo from "@/components/Seo";
import Section from "@/components/Section";
import ScheduleEmbed from "@/components/ScheduleEmbed";
import OffersCarousel from "@/components/OffersCarousel";
import Faq from "@/components/Faq";
import { buttonClasses } from "@/components/ui/button";
import { SHOW_SCHEDULE } from "@/lib/config";

/**
 * Home, matching the owner's reference build: hero → heading-less offers
 * carousel → FAQ. Removed sections (pillars, intro, offers grid,
 * testimonials, CTA band) keep their copy in src/content/content.ts marked
 * NOT RENDERED.
 */
export default function Home() {
  return (
    <>
      <Seo title={meta.home.title} description={meta.home.description} path="/" />

      {/* ── Hero — full-bleed image with overlaid copy (per the owner's
             Paradigm Studio reference): edge-to-edge, fills most of the
             viewport, the fixed header floats translucently on top. A soft
             bone gradient guarantees text contrast over the photo. ────────── */}
      <section className="relative flex min-h-[88svh] items-end md:items-start">
        <picture>
          <source media="(max-width: 767px)" srcSet={hero.image.mobileSrc} />
          <img
            src={hero.image.src}
            alt={hero.image.alt}
            width={2000}
            height={1301}
            fetchPriority="high"
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
        </picture>
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-bone via-bone/75 to-transparent md:bg-gradient-to-r md:from-bone/90 md:via-bone/30 md:to-transparent"
        />
        {/* Copy sits high and left, in the empty wall area, clear of the
            subject at center-right. Mobile gets a stronger gradient veil so
            the subhead holds WCAG AA contrast where it crosses the photo. */}
        <div className="relative w-full px-5 pb-16 pt-32 md:px-12 md:pb-0 md:pt-32">
          <div className="max-w-2xl">
            <h1
              className="hero-rise font-display text-4xl font-medium leading-[1.08] tracking-tight sm:text-5xl md:text-6xl"
              style={{ animationDelay: "0.05s" }}
            >
              {hero.headline}
            </h1>
            <p
              className="hero-rise mt-5 max-w-xl text-lg leading-relaxed text-ink"
              style={{ animationDelay: "0.2s" }}
            >
              {hero.subhead}
            </p>
            <div
              className="hero-rise mt-8 flex flex-col gap-3 sm:flex-row"
              style={{ animationDelay: "0.35s" }}
            >
              <Link to="/contact" className={buttonClasses("primary", "px-8 py-4 text-base")}>
                {hero.primaryCta}
              </Link>
              {SHOW_SCHEDULE ? (
                <Link to="/#schedule" className={buttonClasses("ghost", "px-8 py-4 text-base")}>
                  {hero.secondaryCta}
                </Link>
              ) : (
                <Link to="/offers" className={buttonClasses("ghost", "px-8 py-4 text-base")}>
                  {hero.secondaryCtaAlt}
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Offers carousel (no heading, per reference build) ────────────── */}
      <OffersCarousel />

      {/* ── Schedule — archived behind SHOW_SCHEDULE (src/lib/config.ts) ─── */}
      {SHOW_SCHEDULE && (
        <Section
          id="schedule"
          eyebrow={schedule.eyebrow}
          heading={schedule.heading}
          subline={schedule.subline}
        >
          <ScheduleEmbed />
        </Section>
      )}

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <Section
        id="faq"
        eyebrow={faqSection.eyebrow}
        heading={faqSection.heading}
        subline={faqSection.subline}
      >
        <div className="mx-auto max-w-3xl">
          <Faq />
        </div>
      </Section>
    </>
  );
}
