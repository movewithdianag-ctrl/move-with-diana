import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import { hero, homeV2, HOME_V2_PATH, type TitledItem } from "@/content/content";
import Seo from "@/components/Seo";
import Section from "@/components/Section";
import Photo from "@/components/Photo";
import OffersCarousel from "@/components/OffersCarousel";
import Faq from "@/components/Faq";
import { TestimonialCard } from "@/components/Testimonials";
import { buttonClasses } from "@/components/ui/button";

/**
 * Home page v2, the unlisted test page at /v2. Same hero photo, offers
 * carousel and FAQ look as the live home page (src/pages/Home.tsx), with
 * clearer copy and one call to action: the contact form. Every word comes
 * from src/content/homeV2.json. Kept out of search results and not linked
 * from the menu or footer. See docs/HOME-V2-NOTES.md.
 */

const { cta } = homeV2;

/** The one primary action, repeated down the page. */
function PrimaryCta({ className }: { className?: string }) {
  return (
    <Link to={cta.primaryTo} className={buttonClasses("primary", className ?? "px-8 py-4 text-base")}>
      {cta.primaryLabel}
    </Link>
  );
}

/** Lead paragraph under a section heading. */
function Lead({ children }: { children: string }) {
  if (!children) return null;
  return <p className="measure -mt-4 mb-10 text-lg leading-relaxed text-ink/80 md:-mt-6 md:mb-12">{children}</p>;
}

/** Plain cards: a short bold title and one or two sentences. */
function TitledCards({ items }: { items: TitledItem[] }) {
  return (
    <ul className="grid gap-4 md:grid-cols-3 md:gap-6">
      {items.map((item, i) => (
        <li key={`${i}-${item.title}`} className="rounded-photo border border-ink/10 bg-white/70 p-6">
          <h3 className="font-display text-xl font-medium leading-snug tracking-tight">
            {item.title}
          </h3>
          <p className="mt-2 leading-relaxed text-ink/80">{item.detail}</p>
        </li>
      ))}
    </ul>
  );
}

/** Numbered steps. The number comes from the order in the CMS list. */
function Steps({ items, columns }: { items: TitledItem[]; columns: 2 | 3 }) {
  return (
    <ol className={columns === 3 ? "grid gap-8 md:grid-cols-3" : "grid gap-8 md:grid-cols-2 md:gap-x-12"}>
      {items.map((item, i) => (
        <li key={`${i}-${item.title}`} className="flex gap-4">
          <span
            aria-hidden
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-steel font-display text-lg font-medium text-bone"
          >
            {i + 1}
          </span>
          <div>
            <h3 className="font-display text-xl font-medium leading-snug tracking-tight">
              {item.title}
            </h3>
            <p className="mt-2 leading-relaxed text-ink/80">{item.detail}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export default function HomeV2() {
  const { callout, whatChanges, method, different, offers, proof, howToStart, closing } = homeV2;

  return (
    <>
      <Seo
        title={homeV2.meta.title}
        description={homeV2.meta.description}
        path={HOME_V2_PATH}
        noindex
      />

      {/* Hero: the same photo, gradient and layout as the live home page. */}
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
        <div className="relative w-full px-5 pb-16 pt-32 md:px-12 md:pb-0 md:pt-32">
          <div className="max-w-2xl">
            {homeV2.hero.eyebrow && (
              <p className="hero-rise eyebrow mb-4" style={{ animationDelay: "0.05s" }}>
                {homeV2.hero.eyebrow}
              </p>
            )}
            <h1
              className="hero-rise font-display text-4xl font-medium leading-[1.08] tracking-tight sm:text-5xl md:text-6xl"
              style={{ animationDelay: "0.05s" }}
            >
              {homeV2.hero.headline}
            </h1>
            <p
              className="hero-rise mt-5 max-w-xl text-lg leading-relaxed text-ink"
              style={{ animationDelay: "0.2s" }}
            >
              {homeV2.hero.subhead}
            </p>
            <div
              className="hero-rise mt-8 flex flex-col gap-3 sm:flex-row"
              style={{ animationDelay: "0.35s" }}
            >
              <PrimaryCta />
              <Link to={cta.secondaryTo} className={buttonClasses("ghost", "px-8 py-4 text-base")}>
                {cta.secondaryLabel}
              </Link>
            </div>
            {cta.replyNote && (
              <p
                className="hero-rise mt-4 text-sm font-medium text-ink"
                style={{ animationDelay: "0.35s" }}
              >
                {cta.replyNote}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Who it is for */}
      <Section id="who-its-for" tone="plaster" eyebrow={callout.eyebrow} heading={callout.heading}>
        <div className="grid items-start gap-10 md:grid-cols-[1.2fr_1fr] md:gap-14">
          <div>
            <ul className="space-y-4">
              {callout.items.map((item, i) => (
                <li key={`${i}-${item}`} className="flex gap-3 text-lg leading-relaxed">
                  <Check className="mt-1.5 h-5 w-5 shrink-0 text-steel" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-col sm:flex-row">
              <PrimaryCta />
            </div>
          </div>
          {callout.photo.src && (
            <Photo
              src={callout.photo.src}
              alt={callout.photo.alt}
              ratio="4/5"
              className="mx-auto w-full max-w-sm md:max-w-none"
            />
          )}
        </div>
      </Section>

      {/* What we work on */}
      <Section id="what-we-work-on" eyebrow={whatChanges.eyebrow} heading={whatChanges.heading}>
        <Lead>{whatChanges.body}</Lead>
        <TitledCards items={whatChanges.items} />
      </Section>

      {/* Reviews: real quotes from testimonials.json, word for word. */}
      {proof.reviews.length > 0 && (
        <Section id="reviews" tone="plaster" eyebrow={proof.eyebrow} heading={proof.heading}>
          <Lead>{proof.body}</Lead>
          <ul className="grid items-start gap-4 md:grid-cols-3 md:gap-6">
            {proof.reviews.map((t, i) => (
              <li key={`${i}-${t.name}`}>
                <TestimonialCard t={t} roomyToggle />
              </li>
            ))}
          </ul>
          {proof.linkLabel && (
            <Link
              to={proof.linkTo}
              className="mt-6 inline-flex min-h-11 items-center gap-1.5 font-semibold text-steel underline decoration-steel/40 underline-offset-4 hover:decoration-steel"
            >
              {proof.linkLabel}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          )}
        </Section>
      )}

      {/* The method */}
      <Section id="method" eyebrow={method.eyebrow} heading={method.heading}>
        <Lead>{method.body}</Lead>
        <Steps items={method.steps} columns={2} />
      </Section>

      {/* What makes this different */}
      <Section id="different" tone="plaster" eyebrow={different.eyebrow} heading={different.heading}>
        <div className="grid items-start gap-10 md:grid-cols-[1fr_1.2fr] md:gap-14">
          {different.photo.src && (
            <Photo
              src={different.photo.src}
              alt={different.photo.alt}
              ratio="4/5"
              className="order-last mx-auto w-full max-w-sm md:order-first md:max-w-none"
            />
          )}
          <div>
            <ul className="space-y-7">
              {different.items.map((item, i) => (
                <li key={`${i}-${item.title}`}>
                  <h3 className="font-display text-xl font-medium leading-snug tracking-tight">
                    {item.title}
                  </h3>
                  <p className="mt-2 leading-relaxed text-ink/80">{item.detail}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* Ways to work with me: short intro, the same offers carousel, then the button. */}
      <Section
        id="offers"
        eyebrow={offers.eyebrow}
        heading={offers.heading}
        className="pb-0 md:pb-0"
      >
        {offers.body && (
          <p className="measure -mt-4 text-lg leading-relaxed text-ink/80 md:-mt-6">{offers.body}</p>
        )}
      </Section>
      <OffersCarousel className="pt-10 pb-0 md:pt-8 md:pb-0" />
      <div className="mx-auto w-full max-w-6xl px-5 pb-16 pt-8 md:px-8 md:pb-24">
        <div className="flex flex-col sm:flex-row">
          <PrimaryCta />
        </div>
      </div>

      {/* How to start */}
      <Section id="how-to-start" tone="plaster" eyebrow={howToStart.eyebrow} heading={howToStart.heading}>
        <Steps items={howToStart.steps} columns={3} />
        <div className="mt-10 flex flex-col sm:flex-row">
          <PrimaryCta />
        </div>
      </Section>

      {/* FAQ: same component as the live home page, with the v2 list. */}
      <Section id="faq" heading={homeV2.faqHeading}>
        <div className="mx-auto max-w-3xl">
          <Faq items={homeV2.faqs} />
        </div>
      </Section>

      {/* Closing call to action, last on the page: same dark band look as CtaBand. */}
      <section className="bg-char py-16 text-center md:py-24">
        <div className="mx-auto max-w-2xl px-5">
          <h2 className="font-display text-3xl font-medium leading-tight tracking-tight text-bone md:text-4xl">
            {closing.heading}
          </h2>
          {closing.body && <p className="mt-4 text-bone/70">{closing.body}</p>}
          <div className="mt-8 flex flex-col items-center gap-2">
            <Link
              to={cta.primaryTo}
              className={buttonClasses("light", "w-full px-8 py-4 text-base sm:w-auto")}
            >
              {cta.primaryLabel}
            </Link>
            <Link
              to={cta.secondaryTo}
              className="inline-flex min-h-11 items-center px-2 text-sm font-semibold text-bone underline decoration-bone/40 underline-offset-4 hover:decoration-bone"
            >
              {cta.secondaryLabel}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
