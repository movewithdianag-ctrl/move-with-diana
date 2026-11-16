import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { ArrowUpRight, Check } from "lucide-react";
import { fillTokens, funnelMeta, funnelRoutes, program } from "@/content/content";
import { readIntakeSession, trackFunnelEvent } from "@/lib/intake";
import BookingEmbed from "@/components/BookingEmbed";
import Reveal from "@/components/Reveal";
import Seo from "@/components/Seo";
import { buttonClasses } from "@/components/ui/button";
import { useFocusHeading } from "@/components/thankyou/useFocusHeading";

/**
 * /pilates-program/welcome, the page Stripe sends people to after paying.
 *
 * A short "you're in", then the only two things to do, as numbered cards:
 * 1. book the 75 minute online assessment, 2. book a weekly session. Sessions
 * are booked one at a time (Diana's schedule changes every week), so clients
 * come back to this page for the next one.
 * Each card says who it is for, what to do and why, then holds its calendar
 * and an "I can't find a time" email button. Underneath, quietly: what
 * happens next (when Diana is in touch), what to prepare, and the private hub
 * (only while welcome.hubUrl is set).
 *
 * All copy comes from the `welcome` and `booking` blocks of program.json.
 * The page works without an intake session (someone may pay from a direct
 * link); the session is only used to greet the person by first name and, in
 * BookingEmbed, to save them retyping their name and email in the calendar.
 * A session that was not cleared is sent to the not-yet page: no booking there.
 * Kept out of search results through funnelMeta.welcome.noindex.
 */

const BLOCK = "mx-auto w-full max-w-4xl px-5 md:px-8";
const H2 = "font-display text-2xl font-medium leading-tight tracking-tight md:text-3xl";

interface BookingStepProps {
  id: string;
  number: number;
  eyebrow: string;
  heading: string;
  text: string;
  url: string;
  title: string;
  fallbackSubject: string;
  /** The time zone and video link line. Shown on the first card only. */
  showDetailsNote?: boolean;
}

/** One numbered booking card. Rendered inside the <ol> of steps. */
function BookingStep({
  id,
  number,
  eyebrow,
  heading,
  text,
  url,
  title,
  fallbackSubject,
  showDetailsNote = false,
}: BookingStepProps) {
  const { detailsNote, pendingNote } = program.booking;
  const headingId = `${id}-heading`;
  return (
    <li id={id} className="scroll-mt-24">
      <Reveal>
        <section
          aria-labelledby={headingId}
          className="overflow-hidden rounded-photo border border-ink/10 bg-white/70 shadow-sm"
        >
          <div className="flex items-start gap-4 p-5 md:p-7">
            {/* The list already announces the position, so the numeral is decorative. */}
            <span
              aria-hidden="true"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-steel font-display text-lg font-medium text-bone"
            >
              {number}
            </span>
            <div className="min-w-0">
              {eyebrow && <p className="eyebrow mb-1.5">{eyebrow}</p>}
              <h2 id={headingId} className={H2}>
                {heading}
              </h2>
              {text && <p className="mt-2 leading-relaxed text-umber">{text}</p>}
              {/* Only true once there is a calendar to show. */}
              {showDetailsNote && detailsNote && url && (
                <p className="mt-2 text-sm leading-relaxed text-umber">{detailsNote}</p>
              )}
            </div>
          </div>
          <BookingEmbed
            url={url}
            title={title}
            pendingNote={pendingNote}
            fallbackSubject={fallbackSubject}
          />
        </section>
      </Reveal>
    </li>
  );
}

export default function ProgramWelcome() {
  const { welcome, booking } = program;

  // Read once: the name personalises the heading, the outcome guards the page.
  const [session] = useState(() => readIntakeSession());
  const firstName = session?.firstName.trim() ?? "";
  const notCleared = session?.outcome === "not_cleared";
  const heading =
    firstName && welcome.headingWithName
      ? fillTokens(welcome.headingWithName, { firstName })
      : welcome.heading;
  // Arriving from Stripe: start screen readers and keyboards at the heading.
  const headingRef = useFocusHeading();

  useEffect(() => {
    if (notCleared) return;
    trackFunnelEvent("booking_view");
  }, [notCleared]);

  // Not cleared for exercise yet: no calendars. Same rule as the order page.
  if (notCleared) return <Navigate to={funnelRoutes.notYet} replace />;

  return (
    <>
      <Seo {...funnelMeta.welcome} />

      {/* Confirmation */}
      <section className="pb-8 pt-10 md:pb-10 md:pt-16">
        <div className={BLOCK}>
          {welcome.eyebrow && (
            <p className="eyebrow hero-rise flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-steel text-bone">
                <Check className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden="true" />
              </span>
              {welcome.eyebrow}
            </p>
          )}
          <h1
            ref={headingRef}
            tabIndex={-1}
            className="hero-rise mt-3 font-display text-3xl font-medium leading-[1.1] tracking-tight focus:outline-none md:text-5xl"
            style={{ animationDelay: "80ms" }}
          >
            {heading}
          </h1>
          {welcome.intro && (
            <p
              className="hero-rise measure mt-4 text-lg leading-relaxed text-ink/90"
              style={{ animationDelay: "160ms" }}
            >
              {welcome.intro}
            </p>
          )}
          {welcome.receiptNote && (
            <p
              className="hero-rise measure mt-2 text-sm leading-relaxed text-umber"
              style={{ animationDelay: "220ms" }}
            >
              {welcome.receiptNote}
            </p>
          )}
        </div>
      </section>

      {/* The two booking steps */}
      <section className="pb-14 md:pb-20">
        <ol className={`${BLOCK} space-y-6 md:space-y-8`}>
          {/* Event 1: the online assessment */}
          <BookingStep
            id="book-assessment"
            number={1}
            eyebrow={booking.assessmentEyebrow}
            heading={booking.assessmentHeading}
            text={booking.assessmentText}
            url={booking.assessmentUrl}
            title={booking.assessmentTitle}
            fallbackSubject={booking.cantFindAssessmentSubject}
            showDetailsNote
          />
          {/* Event 2: weekly sessions, booked one at a time */}
          <BookingStep
            id="book-sessions"
            number={2}
            eyebrow={booking.sessionEyebrow}
            heading={booking.sessionHeading}
            text={booking.sessionText}
            url={booking.sessionUrl}
            title={booking.sessionTitle}
            fallbackSubject={booking.cantFindSessionSubject}
          />
        </ol>
      </section>

      {/* What happens next, then the private hub (only with a link) + what to prepare */}
      <section className="border-t border-ink/10 bg-plaster/60 py-12 md:py-16">
        {welcome.next.length > 0 && (
          <div className={`${BLOCK} mb-12 border-b border-ink/10 pb-12 md:mb-14 md:pb-14`}>
            <Reveal>
              {welcome.nextHeading && <h2 className={H2}>{welcome.nextHeading}</h2>}
              <ol className="mt-5 grid gap-6 md:grid-cols-3 md:gap-8">
                {welcome.next.map((item) => (
                  <li key={item.title} className="leading-relaxed">
                    <p className="font-semibold">{item.title}</p>
                    {item.detail && <p className="mt-1 text-umber">{item.detail}</p>}
                  </li>
                ))}
              </ol>
            </Reveal>
          </div>
        )}
        <div
          className={
            welcome.hubUrl ? `${BLOCK} grid gap-12 md:grid-cols-2 md:gap-14` : BLOCK
          }
        >
          {welcome.hubUrl && (
            <Reveal>
              <h2 className={H2}>{welcome.hubHeading}</h2>
              {welcome.hubText && (
                <p className="mt-3 leading-relaxed text-umber">{welcome.hubText}</p>
              )}
              <a
                href={welcome.hubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonClasses("ghost", "mt-6 min-h-11 w-full sm:w-auto")}
              >
                {welcome.hubButtonLabel}
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </Reveal>
          )}

          {welcome.prep.length > 0 && (
            <Reveal delay={80}>
              <h2 className={H2}>{welcome.prepHeading}</h2>
              <ul className="mt-5 space-y-3">
                {welcome.prep.map((item) => (
                  <li key={item} className="flex gap-3 leading-relaxed">
                    <Check
                      className="mt-1 h-4 w-4 shrink-0 text-steel"
                      strokeWidth={2.25}
                      aria-hidden="true"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          )}
        </div>
      </section>
    </>
  );
}
