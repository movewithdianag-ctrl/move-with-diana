import { Link } from "react-router-dom";
import { about, aboutCommunity, meta } from "@/content/content";
import { SKOOL_COMMUNITY_URL } from "@/lib/config";
import Seo from "@/components/Seo";
import Photo from "@/components/Photo";
import Section from "@/components/Section";
import { buttonClasses } from "@/components/ui/button";

/**
 * About: portrait-led intro (photo takes the larger column) + community
 * section. Sections removed per the owner (credentials, "How I work", CTA
 * band) keep their copy in src/content/content.ts marked NOT RENDERED.
 */
export default function About() {
  return (
    <>
      <Seo title={meta.about.title} description={meta.about.description} path="/about" />

      {/* Portrait-led hero + full bio in editorial measure */}
      <section className="pt-24 md:pt-28">
        <div className="mx-auto w-full max-w-6xl px-5 md:px-8">
          <div className="grid gap-10 md:grid-cols-[11fr_9fr] md:gap-14">
            <div className="hero-rise" style={{ animationDelay: "0.05s" }}>
              <Photo src={about.portrait.src} alt={about.portrait.alt} ratio="4/5" priority />
            </div>
            <div className="hero-rise md:pt-6" style={{ animationDelay: "0.2s" }}>
              <p className="eyebrow mb-3">{about.eyebrow}</p>
              <h1 className="font-display text-4xl font-medium leading-tight tracking-tight md:text-5xl">
                {about.heading}
              </h1>
              <div className="measure mt-6 space-y-5 leading-relaxed text-ink/85">
                {about.bio.map((paragraph) => (
                  <p key={paragraph.slice(0, 32)}>{paragraph}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Community — links straight to Skool once SKOOL_COMMUNITY_URL is set
          in src/lib/config.ts; falls back to the contact form until then. */}
      <Section eyebrow={aboutCommunity.eyebrow} heading={aboutCommunity.heading}>
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <p className="measure max-w-xl leading-relaxed text-ink/85">{aboutCommunity.body}</p>
          {SKOOL_COMMUNITY_URL ? (
            <a
              href={SKOOL_COMMUNITY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClasses("primary", "shrink-0 self-start md:self-auto")}
            >
              {aboutCommunity.cta}
            </a>
          ) : (
            <Link
              to="/contact?interest=community"
              className={buttonClasses("primary", "shrink-0 self-start md:self-auto")}
            >
              {aboutCommunity.cta}
            </Link>
          )}
        </div>
      </Section>
    </>
  );
}
