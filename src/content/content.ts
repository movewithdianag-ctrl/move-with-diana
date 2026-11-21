/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  MOVE WITH DIANA — CONTENT LAYER
 *
 *  ✏️  TO EDIT THE SITE'S WORDS OR PHOTOS: use the admin panel at /admin —
 *      it edits the .json files in this folder through friendly forms.
 *      (settings.json, home.json, about.json, offers.json, reviews.json,
 *      contact.json, footer.json, testimonials.json, program.json,
 *      intake.json)
 *
 *  This file is the typed adapter between those JSON files and the React
 *  components: it maps plain-English CMS fields onto the exact shapes the
 *  components consume, and holds the few structural bits that are
 *  deliberately NOT editable (route paths, the sample-week fallback grid,
 *  and copy for sections that are currently not rendered).
 * ─────────────────────────────────────────────────────────────────────────────
 */
import settingsJson from "./settings.json";
import homeJson from "./home.json";
import aboutJson from "./about.json";
import offersJsonRaw from "./offers.json";
import contactJsonRaw from "./contact.json";
import footerJson from "./footer.json";
import testimonialsJson from "./testimonials.json";
import reviewsJsonRaw from "./reviews.json";
import programJsonRaw from "./program.json";
import intakeJsonRaw from "./intake.json";

/**
 * The CMS may omit or null image-dimension fields when Diana saves (they are
 * hidden helper fields, not something she edits). These loose interfaces keep
 * the build green no matter what the admin panel writes.
 */
interface CmsOffer {
  title: string;
  oneLiner: string;
  description: string;
  whoItsFor: string;
  included: string[];
  buttonLabel: string;
  contactOption: string;
  cardPhoto: string;
  cardPhotoAlt: string;
  cardPhotoW?: number | null;
  cardPhotoH?: number | null;
  pagePhoto?: string | null;
  pagePhotoAlt?: string | null;
  pagePhotoTall?: boolean | null;
  pagePhotoW?: number | null;
  pagePhotoH?: number | null;
}

interface CmsGalleryItem {
  photo: string;
  alt: string;
  w?: number | null;
  h?: number | null;
}

/** Reviews-page JSON, null-tolerant for the same reason as the above. */
interface CmsReviews {
  meta?: { title?: string | null; description?: string | null } | null;
  eyebrow?: string | null;
  heading?: string | null;
  intro?: string | null;
  comingSoon?: string | null;
  trustpilot?: {
    businessUnitId?: string | null;
    templateId?: string | null;
    locale?: string | null;
    theme?: string | null;
    heightPx?: number | string | null;
    profileUrl?: string | null;
    reviewUrl?: string | null;
    reviewButtonLabel?: string | null;
  } | null;
  showSavedTestimonials?: boolean | null;
}

const offersJson = offersJsonRaw as unknown as typeof offersJsonRaw & { offers: CmsOffer[] };
const contactJson = contactJsonRaw as unknown as typeof contactJsonRaw & {
  gallery: CmsGalleryItem[];
};
const reviewsJson = reviewsJsonRaw as CmsReviews;

/* ─────────────────────────── Site-wide settings ─────────────────────────── */

export const site = {
  name: settingsJson.siteName,
  email: settingsJson.email,
  basedInLine: settingsJson.basedInLine,
  socials: settingsJson.socials as { label: string; url: string }[],
};

/** CMS-controlled feature settings (imported by src/lib/config.ts). */
export const cmsSettings = {
  calendarUrl: settingsJson.calendarUrl ?? "",
  communityUrl: settingsJson.communityUrl ?? "",
  showSchedule: settingsJson.showSchedule ?? false,
};

export const nav = {
  // Labels come from the CMS; the route paths are fixed in code so an edit
  // can never break navigation.
  links: [
    { label: settingsJson.nav.home, to: "/" },
    { label: settingsJson.nav.about, to: "/about" },
    { label: settingsJson.nav.offers, to: "/offers" },
    { label: settingsJson.nav.reviews ?? "Reviews", to: "/reviews" },
    { label: settingsJson.nav.schedule, to: "/#schedule" },
    { label: settingsJson.nav.contact, to: "/contact" },
  ],
  bookCta: settingsJson.nav.button,
};

/* ──────────────────────────── Per-page SEO meta ─────────────────────────── */

export const meta = {
  home: homeJson.meta,
  about: aboutJson.meta,
  offers: offersJson.meta,
  reviews: {
    title: reviewsJson.meta?.title ?? "Reviews | Move with Diana",
    description: reviewsJson.meta?.description ?? "",
  },
  contact: contactJson.meta,
  notFound: {
    title: footerJson.notFound.metaTitle,
    description: footerJson.notFound.metaDescription,
  },
};

/* ─────────────────────────────── Home page ──────────────────────────────── */

export const hero = {
  headline: homeJson.hero.headline,
  subhead: homeJson.hero.subhead,
  primaryCta: homeJson.hero.primaryButton,
  secondaryCta: homeJson.hero.scheduleButton,
  secondaryCtaAlt: homeJson.hero.offersButton,
  image: {
    src: homeJson.hero.photo,
    mobileSrc: homeJson.hero.photoMobile,
    alt: homeJson.hero.photoAlt,
  },
};

export const schedule = {
  eyebrow: homeJson.schedule.eyebrow,
  heading: homeJson.schedule.heading,
  subline: homeJson.schedule.subline,
  // The legend and sample week are structural fallback data (shown only when
  // the schedule section is on AND no calendar URL is set) — kept in code.
  legend: [
    { label: "In-Person", type: "in-person" },
    { label: "Online", type: "online" },
  ] as { label: string; type: "in-person" | "online" }[],
  fallback: {
    note: homeJson.schedule.sampleNote,
    cta: homeJson.schedule.sampleCta,
    emptyDayLabel: homeJson.schedule.restDayLabel,
    days: [
      { day: "Mon", slots: [{ time: "07:30", name: "Classical Mat", type: "online" }, { time: "18:00", name: "Classical Pilates Mat", type: "in-person" }] },
      { day: "Tue", slots: [{ time: "12:15", name: "Private session slots", type: "in-person" }] },
      { day: "Wed", slots: [{ time: "07:30", name: "Classical Pilates Mat", type: "online" }, { time: "18:00", name: "Classical Mat", type: "in-person" }] },
      { day: "Thu", slots: [{ time: "12:15", name: "Private session slots", type: "online" }] },
      { day: "Fri", slots: [{ time: "07:30", name: "Classical Mat", type: "online" }, { time: "17:30", name: "Classical Pilates Mat", type: "in-person" }] },
      { day: "Sat", slots: [{ time: "09:30", name: "Semi-private slots", type: "in-person" }] },
      { day: "Sun", slots: [] },
    ] as { day: string; slots: { time: string; name: string; type: "in-person" | "online" }[] }[],
  },
};

export const faqSection = {
  eyebrow: "",
  heading: homeJson.faqHeading,
  subline: "",
};

export interface Faq {
  question: string;
  answer: string;
}

export const faqs: Faq[] = homeJson.faqs;

/* ─────────────────────────────── Offers ─────────────────────────────────── */

export interface OfferCta {
  label: string;
  /** Slug appended as /contact?interest=<slug> to preselect the form. */
  slug: string;
}

export interface Offer {
  id: string;
  title: string;
  oneLiner: string;
  whatItIs: string;
  whoItsFor: string;
  included: string[];
  ctas: OfferCta[];
  image: { src: string; alt: string; w?: number; h?: number };
  pageImage?: { src: string; alt: string; tall?: boolean; w?: number; h?: number };
}

export const offers: Offer[] = offersJson.offers.map((o, i) => ({
  id: o.contactOption || `offer-${i}`,
  title: o.title,
  oneLiner: o.oneLiner,
  whatItIs: o.description,
  whoItsFor: o.whoItsFor,
  included: o.included,
  ctas: [{ label: o.buttonLabel, slug: o.contactOption }],
  image: {
    src: o.cardPhoto,
    alt: o.cardPhotoAlt,
    w: o.cardPhotoW ?? undefined,
    h: o.cardPhotoH ?? undefined,
  },
  pageImage: o.pagePhoto
    ? {
        src: o.pagePhoto,
        alt: o.pagePhotoAlt || o.cardPhotoAlt,
        tall: o.pagePhotoTall ?? false,
        w: o.pagePhotoW ?? undefined,
        h: o.pagePhotoH ?? undefined,
      }
    : undefined,
}));

export const offersPage = {
  eyebrow: "",
  heading: offersJson.heading,
  whoItsForLabel: offersJson.whoLabel,
};

/* ─────────────────────────────── About page ─────────────────────────────── */

export const about = {
  eyebrow: aboutJson.pageLabel,
  heading: aboutJson.heading,
  portrait: { src: aboutJson.photo, alt: aboutJson.photoAlt },
  bio: aboutJson.bio,
};

export const aboutCommunity = {
  eyebrow: aboutJson.community.eyebrow,
  heading: aboutJson.community.heading,
  body: aboutJson.community.body,
  cta: aboutJson.community.button,
};

/* ────────────────────────────── Contact page ────────────────────────────── */

export const contactPage = {
  eyebrow: contactJson.pageLabel,
  heading: contactJson.heading,
  opening: contactJson.opening,
  photo: { src: contactJson.photo, alt: contactJson.photoAlt },
  interests: contactJson.options.map((o) => ({ slug: o.value, label: o.label })),
  labels: contactJson.labels,
  errors: contactJson.errors,
  success: contactJson.success,
  failure: contactJson.failure,
  gallery: contactJson.gallery.map((g) => ({
    src: g.photo,
    alt: g.alt,
    w: g.w ?? undefined,
    h: g.h ?? undefined,
  })),
};

/* ─────────────────────────────── Footer ─────────────────────────────────── */

export const footer = {
  oneLiner: footerJson.oneLiner,
  linksHeading: footerJson.pagesHeading,
  connectHeading: footerJson.connectHeading,
  communityLinkLabel: footerJson.communityLinkLabel,
  newsletter: footerJson.newsletter,
  smallPrint: `© ${new Date().getFullYear()} ${settingsJson.siteName}`,
};

/* ─────────────────────────────── 404 page ───────────────────────────────── */

export const notFound = {
  heading: footerJson.notFound.heading,
  text: footerJson.notFound.text,
  cta: footerJson.notFound.button,
};

/* ───────────────────────────── Testimonials ─────────────────────────────── */

/**
 * NOT RENDERED — the testimonials section was removed from the home page per
 * the owner (2026-08), but the quotes stay CMS-managed (testimonials.json)
 * so they're ready the moment a testimonials section returns.
 */
export interface Testimonial {
  name: string;
  quote: string;
}

export const testimonialsSection = {
  eyebrow: testimonialsJson.eyebrow,
  heading: testimonialsJson.heading,
  readMore: testimonialsJson.readMore,
  readLess: testimonialsJson.readLess,
};

export const testimonials: Testimonial[] = testimonialsJson.items;

/**
 * The reviews at the end of the home page (home.json, reviews). The first
 * name is the large quote; the next two sit beside it. Quotes are looked up
 * by name in testimonials.json; a name that doesn't match is skipped.
 */
export const homeReviews = {
  heading: homeJson.reviews?.heading ?? "",
  items: (homeJson.reviews?.names ?? [])
    .map((name) => testimonials.find((t) => t.name.trim() === name.trim()))
    .filter((t): t is Testimonial => Boolean(t))
    // A name typed twice shows once.
    .filter((t, i, all) => all.indexOf(t) === i)
    .slice(0, 3),
  countLine: homeJson.reviews?.countLine ?? "",
  linkLabel: homeJson.reviews?.linkLabel ?? "",
};

/* ────────────────────────────── Reviews page ────────────────────────────── */

export const reviewsPage = {
  eyebrow: reviewsJson.eyebrow ?? "",
  heading: reviewsJson.heading ?? "Reviews",
  intro: reviewsJson.intro ?? "",
  comingSoon: reviewsJson.comingSoon ?? "",
  showSavedTestimonials: reviewsJson.showSavedTestimonials ?? false,
  trustpilot: {
    businessUnitId: (reviewsJson.trustpilot?.businessUnitId ?? "").trim(),
    templateId: (reviewsJson.trustpilot?.templateId ?? "").trim(),
    // `.trim() || default` (not ??): the CMS writes cleared fields as "",
    // which is not nullish and would otherwise reach the widget unguarded.
    locale: (reviewsJson.trustpilot?.locale ?? "").trim() || "en-US",
    theme: (reviewsJson.trustpilot?.theme ?? "").trim() || "light",
    // Decap's number widget can save "" (cleared) or a numeric string.
    heightPx: Number(reviewsJson.trustpilot?.heightPx) || 700,
    profileUrl: (reviewsJson.trustpilot?.profileUrl ?? "").trim(),
    reviewUrl: (reviewsJson.trustpilot?.reviewUrl ?? "").trim(),
    reviewButtonLabel:
      (reviewsJson.trustpilot?.reviewButtonLabel ?? "").trim() || "Write a review on Trustpilot",
  },
};

/* ────────────── NOT-RENDERED copy retained from earlier drafts ──────────── */
/* These sections were removed from the layout by the owner but their copy is
   kept here (code-side, not CMS) in case any of them return. */

export const intro = {
  eyebrow: "Who I am",
  heading: "Hi, I'm Diana",
  text: "I'm a Classical Pilates Instructor dedicated to helping people move better, build control, and maintain long-term body health. I work with complete beginners, advanced practitioners, and athletes — anyone who wants thoughtful, precise training that creates real, lasting change. Every session is designed to leave you feeling strong, confident, and connected to your body.",
  linkLabel: "More about me",
  image: { src: "/images/intro-portrait.jpg", alt: "Diana Gonçalves smiling, arms resting on the ladder barrel", w: 736, h: 920 },
};

export const offersPreview = {
  eyebrow: "What I offer",
  heading: "Pilates built around you",
  cardLinkLabel: "See details",
  cta: "Not sure where to start? Send me a message",
};

export const finalCta = {
  heading: "Ready to feel strong in your own body?",
  reassurance: "Tell me your goals and I'll recommend the right format. I reply personally within 24–48 hours.",
  cta: "Book a private session",
};

export const aboutExtras = {
  credentialsHeading: "Credentials",
  credentials: [
    { title: "Classical Pilates Instructor", detail: "Completed Romana's Pilates International Certification (900 hours)." },
    { title: "Continuing education", detail: "Regular mentored private sessions with senior classical teachers." },
    { title: "Mat & apparatus", detail: "Reformer, Cadillac, Chair and Barrel work alongside classical mat." },
    { title: "All levels, all bodies", detail: "Beginners, advanced practitioners, and athletes welcome." },
  ],
  howIWorkHeading: "How I work",
  howIWork: [
    { title: "Intentional movement", text: "Nothing is filler. Every exercise in your session is there for a reason you'll understand." },
    { title: "Precise alignment", text: "Form comes first. I coach position and control in real time so your body learns the right pattern." },
    { title: "Sustainable results", text: "We build control you keep — progressive, realistic, and designed around your life." },
  ],
};

/**
 * NOT RENDERED YET — copy for a possible "movements" gallery section.
 * Regenerate movement images from the shoot originals if this gets built.
 */
export const movements = [
  { src: "/images/movement-1.jpg", alt: "Classical Pilates teaser on the mat", title: "Mat flow", description: "The original method, floor-based — breath, articulation, and control." },
  { src: "/images/movement-2.jpg", alt: "Classical Pilates barrel handstand", title: "Barrel control", description: "Deep opening and support for the spine and hips." },
  { src: "/images/movement-4.jpg", alt: "Classical Pilates scorpion over the barrel", title: "Barrel extension", description: "Spring-loaded resistance that builds length, strength, and precision." },
  { src: "/images/movement-5.jpg", alt: "Classical Pilates shoulder stand", title: "Powerhouse work", description: "The center of the method — core stability that carries into everything." },
];

/* ═════════════════════════════════════════════════════════════════════════
   8-WEEK PILATES PROGRAM FUNNEL  (program.json + intake.json)

   Flow: /apply (intake form) → /pilates-program (order page → Stripe) →
   /pilates-program/welcome (book the assessment and sessions).
   Someone who is not cleared for exercise goes to /apply/not-yet instead.

   Everything below is null-tolerant: the admin panel may save a cleared
   field as "" or null, or drop it entirely, and the build must stay green.
   ═════════════════════════════════════════════════════════════════════════ */

/** Recursively optional + nullable view of a JSON file's inferred type. */
type Loose<T> = T extends (infer U)[]
  ? Loose<U>[] | null | undefined
  : T extends object
    ? { [K in keyof T]?: Loose<T[K]> | null } | null | undefined
    : T | null | undefined;

const str = (v: unknown, fallback = ""): string =>
  typeof v === "string" ? v : typeof v === "number" ? String(v) : fallback;
const url = (v: unknown): string => str(v).trim();
const num = (v: unknown, fallback: number): number => {
  if (v === "" || v === null || v === undefined) return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};
const bool = (v: unknown, fallback: boolean): boolean =>
  typeof v === "boolean" ? v : fallback;
const list = <T,>(v: readonly T[] | null | undefined): NonNullable<T>[] =>
  Array.isArray(v) ? (v.filter((x) => x !== null && x !== undefined) as NonNullable<T>[]) : [];
const strList = (v: readonly unknown[] | null | undefined): string[] =>
  list(v)
    .map((x) => str(x))
    .filter((x) => x.trim() !== "");

export interface TitledItem {
  title: string;
  detail: string;
}
const titled = (
  v: readonly ({ title?: unknown; detail?: unknown } | null | undefined)[] | null | undefined,
): TitledItem[] =>
  list(v)
    .map((x) => ({ title: str(x.title), detail: str(x.detail) }))
    .filter((x) => x.title !== "" || x.detail !== "");

export interface PageMeta {
  title: string;
  description: string;
}
const pageMeta = (
  v: { title?: string | null; description?: string | null } | null | undefined,
  fallbackTitle: string,
): PageMeta => ({
  title: str(v?.title).trim() || fallbackTitle,
  description: str(v?.description),
});

/** Replace {token} placeholders, e.g. fillTokens("Hi {firstName}", { firstName: "Ana" }). */
export function fillTokens(template: string, tokens: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in tokens ? String(tokens[key]) : match,
  );
}

/** mailto: link to Diana, with an optional subject line. */
export function mailtoHref(subject = ""): string {
  const base = `mailto:${site.email}`;
  return subject.trim() ? `${base}?subject=${encodeURIComponent(subject.trim())}` : base;
}

/** Diana's Instagram profile URL ("" if the social link is ever removed). */
export const instagramUrl: string =
  site.socials.find((s) => /instagram/i.test(s.label))?.url ?? "";

/* ───────────────────────────── Funnel routes ────────────────────────────── */

/** Route paths are fixed in code so a CMS edit can never break the funnel. */
export const funnelRoutes = {
  apply: "/apply",
  notYet: "/apply/not-yet",
  checkout: "/pilates-program",
  welcome: "/pilates-program/welcome",
} as const;

export type FunnelRouteKey = keyof typeof funnelRoutes;

/** Which funnel route (if any) a pathname is. Tolerates a trailing slash. */
export function funnelRouteKey(pathname: string): FunnelRouteKey | null {
  const clean = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  const hit = (Object.keys(funnelRoutes) as FunnelRouteKey[]).find(
    (k) => funnelRoutes[k] === clean,
  );
  return hit ?? null;
}

/** True on the four distraction-free funnel routes (no site nav / big footer). */
export function isFunnelPath(pathname: string): boolean {
  return funnelRouteKey(pathname) !== null;
}

/* ───────────────────────── Standalone booking routes ────────────────────── */

/**
 * One page per calendar, for a link Diana sends to an existing client.
 * Not part of the application flow. Paths are fixed in code, like the funnel.
 */
export const bookingRoutes = {
  introCall: "/book/intro-call",
  assessment: "/book/assessment",
  session: "/book/session",
} as const;

export type BookingPageKey = keyof typeof bookingRoutes;

/** True on the three standalone booking pages. Tolerates a trailing slash. */
export function isBookingPath(pathname: string): boolean {
  const clean = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  return (Object.values(bookingRoutes) as string[]).includes(clean);
}

/**
 * True where the slim funnel header and one-line footer replace the site nav
 * and big footer: the four funnel routes and the three booking pages.
 */
export function isSlimChromePath(pathname: string): boolean {
  return isFunnelPath(pathname) || isBookingPath(pathname);
}

/* ────────────────────── Program (order + welcome pages) ─────────────────── */

/** One standalone booking page. The calendar link itself lives in `booking`. */
export interface BookingPageCopy {
  metaTitle: string;
  metaDescription: string;
  /** Small line above the heading. "" hides it. */
  eyebrow: string;
  heading: string;
  text: string;
  /** iframe title / accessible name for the calendar. */
  calendarTitle: string;
  /** Subject of the "I can't find a time" email. "" hides the button. */
  cantFindSubject: string;
}

export interface CheckoutOption {
  /** Short name of the option, e.g. "Pay in full". */
  label: string;
  /** Amount charged, in whole dollars (897). */
  price: number;
  /** e.g. "$897". */
  priceDisplay: string;
  /** Small line beside the price, e.g. "One payment today." */
  sublabel: string;
  /** Stripe Payment Link. "" until Diana pastes it → show pendingStripeNote. */
  stripeUrl: string;
  /** Pay button text, e.g. "Start Program". */
  buttonLabel: string;
}

export interface ProgramFaq {
  q: string;
  a: string;
}

/** Copy that only the order page uses (program.json, checkout.orderPage). */
export interface OrderPageCopy {
  /** Label on the disabled pay button while the Stripe link is not pasted in yet. */
  pendingButtonLabel: string;
  /** Text of the fallback link to /contact shown in that same state. */
  pendingContactLabel: string;
  /** Accessible name of the sticky mobile pay bar. */
  stickyBarLabel: string;
  /** Pay button text while the Stripe page is opening. */
  payBusyLabel: string;
  /** The short check mark lines in the buy box, above the pay button. Facts only. */
  highlights: string[];
  /** Stars shown with the reviews, 0 to 5. 0 hides them. Set by the owner from Trustpilot. */
  starRating: number;
  /** Text alternative for the stars. Token: {rating}. */
  starsLabel: string;
  /** Under the program name; jumps to the review wall. Token: {count}. */
  reviewsLine: string;
  /** Link to the Trustpilot profile under the review wall. Token: {count}. */
  reviewsLinkLabel: string;
  /** Button that reveals the rest of the review wall. */
  showMoreReviewsLabel: string;
  /** Program photo: beside the buy box on desktop, above it on phones. */
  photo: { src: string; alt: string; w?: number; h?: number };
}

export interface Program {
  name: string;
  shortName: string;
  includedHeading: string;
  included: TitledItem[];
  howItWorksHeading: string;
  howItWorks: TitledItem[];
  testimonialsHeading: string;
  /** Names to feature; resolved quotes are exported as `programTestimonials`. */
  testimonialNames: string[];
  faqHeading: string;
  faq: ProgramFaq[];
  disclaimer: string;
  /** Copy for FunnelHeader / FunnelFooter. */
  chrome: {
    homeLabel: string;
    questionsSubject: string;
    /** Accessible name of the FunnelSteps trail (Apply, Reserve, Book). */
    stepsLabel: string;
    stepApply: string;
    stepReserve: string;
    stepBook: string;
    footerDisclaimer: string;
  };
  checkout: {
    /** The one price: a single payment through one Stripe Payment Link. */
    payInFull: CheckoutOption;
    /** The slim bar at the top of the order page, only for someone who just qualified on /apply. */
    qualified: {
      /** Contains {firstName}. Use headingNoName when there is no name. */
      heading: string;
      headingNoName: string;
      /** Under the pay button, only when the session says needsReview. */
      reviewNote: string;
    };
    /** "What happens next" on the order page. Hidden when `steps` is empty. */
    next: { heading: string; steps: TitledItem[] };
    /** The "talk first" row at the end of the order page questions. "" hides the row. */
    notReadyQuestion: string;
    /** Link + sentence used while booking.callUrl is "" (the link opens an email). */
    notReadyLabel: string;
    notReadyText: string;
    /** Used instead when booking.callUrl is set (the link opens the call calendar). */
    notReadyCallLabel: string;
    notReadyCallText: string;
    /** Shown instead of the pay button while stripeUrl is "". */
    pendingStripeNote: string;
    pendingStripeButtonLabel: string;
    orderPage: OrderPageCopy;
  };
  welcome: {
    eyebrow: string;
    heading: string;
    /** Contains a {firstName} token; use when the intake session has a name. */
    headingWithName: string;
    intro: string;
    receiptNote: string;
    prepHeading: string;
    prep: string[];
    /** "What happens next": when Diana is in touch, reminders, what to have ready. */
    nextHeading: string;
    next: TitledItem[];
    hubHeading: string;
    hubText: string;
    hubButtonLabel: string;
    /** Private Skool hub link. "" hides the whole hub block on the welcome page. */
    hubUrl: string;
  };
  booking: {
    /** Cal.com link for Event 1 (75 min assessment). "" → show pendingNote. */
    assessmentUrl: string;
    /** Cal.com link for Event 2 (60 min session). "" → show pendingNote. */
    sessionUrl: string;
    /** Optional "quick call" link. "" → fall back to email. */
    callUrl: string;
    /** Small call-out above the heading that says who the card is for. "" hides it. */
    assessmentEyebrow: string;
    assessmentHeading: string;
    assessmentText: string;
    /** iframe title / accessible name for the assessment calendar. */
    assessmentTitle: string;
    /** Quiet line under each card's text (time zone, confirmation email). "" hides it. */
    detailsNote: string;
    pendingNote: string;
    openLinkLabel: string;
    loadingLabel: string;
    /** "I can't find a time" button under each calendar. Opens a prefilled email. */
    cantFindLabel: string;
    cantFindAssessmentSubject: string;
    /** Prefilled email body. Line breaks are kept. */
    cantFindBody: string;
  };
  /** Copy for the standalone booking pages (/book/...), one block per calendar. */
  bookingPages: Record<BookingPageKey, BookingPageCopy>;
}

const programJson = programJsonRaw as unknown as NonNullable<Loose<typeof programJsonRaw>>;

function checkoutOption(
  v: NonNullable<NonNullable<typeof programJson.checkout>["payInFull"]> | null | undefined,
  defaults: { label: string; price: number },
): CheckoutOption {
  const price = num(v?.price, defaults.price);
  const priceDisplay = str(v?.priceDisplay).trim() || `$${price}`;
  return {
    label: str(v?.label).trim() || defaults.label,
    price,
    priceDisplay,
    sublabel: str(v?.sublabel),
    stripeUrl: url(v?.stripeUrl),
    buttonLabel: str(v?.buttonLabel).trim() || defaults.label,
  };
}

const pj = programJson;

const bookingPageCopy = (
  v: NonNullable<NonNullable<typeof programJson.bookingPages>["introCall"]> | null | undefined,
  fallbackHeading: string,
): BookingPageCopy => {
  const heading = str(v?.heading).trim() || fallbackHeading;
  return {
    metaTitle: str(v?.metaTitle).trim() || `${heading} | ${site.name}`,
    // Never empty: these links are shared by text and email, and the preview shows it.
    metaDescription: str(v?.metaDescription).trim() || str(v?.text).trim() || heading,
    eyebrow: str(v?.eyebrow),
    heading,
    text: str(v?.text),
    calendarTitle: str(v?.calendarTitle).trim() || heading,
    cantFindSubject: str(v?.cantFindSubject),
  };
};
const pjOrder = pj.checkout?.orderPage;

export const program: Program = {
  name: str(pj.name, "8-Week Pilates Program"),
  shortName: str(pj.shortName, "8-Week Pilates Program"),
  includedHeading: str(pj.includedHeading),
  included: titled(pj.included),
  howItWorksHeading: str(pj.howItWorksHeading),
  howItWorks: titled(pj.howItWorks),
  testimonialsHeading: str(pj.testimonialsHeading),
  testimonialNames: strList(pj.testimonialNames),
  faqHeading: str(pj.faqHeading),
  faq: list(pj.faq)
    .map((f) => ({ q: str(f.q), a: str(f.a) }))
    .filter((f) => f.q !== "" && f.a !== ""),
  disclaimer: str(pj.disclaimer),
  chrome: {
    homeLabel: str(pj.chrome?.homeLabel).trim() || `${site.name}, home`,
    questionsSubject: str(pj.chrome?.questionsSubject),
    stepsLabel: str(pj.chrome?.stepsLabel).trim() || "Your progress",
    stepApply: str(pj.chrome?.stepApply).trim() || "Apply",
    stepReserve: str(pj.chrome?.stepReserve).trim() || "Reserve",
    stepBook: str(pj.chrome?.stepBook).trim() || "Book",
    footerDisclaimer: str(pj.chrome?.footerDisclaimer),
  },
  checkout: {
    payInFull: checkoutOption(pj.checkout?.payInFull, { label: "Pay in full", price: 897 }),
    qualified: {
      heading: str(pj.checkout?.qualified?.heading),
      headingNoName:
        str(pj.checkout?.qualified?.headingNoName).trim() || "You qualify for the 8-Week Pilates Program",
      reviewNote: str(pj.checkout?.qualified?.reviewNote),
    },
    next: {
      heading: str(pj.checkout?.next?.heading).trim() || "What happens next",
      steps: titled(pj.checkout?.next?.steps),
    },
    notReadyQuestion: str(pj.checkout?.notReadyQuestion),
    notReadyLabel: str(pj.checkout?.notReadyLabel),
    notReadyText: str(pj.checkout?.notReadyText),
    notReadyCallLabel: str(pj.checkout?.notReadyCallLabel),
    notReadyCallText: str(pj.checkout?.notReadyCallText),
    pendingStripeNote: str(pj.checkout?.pendingStripeNote),
    pendingStripeButtonLabel: str(pj.checkout?.pendingStripeButtonLabel),
    orderPage: {
      pendingButtonLabel: str(pjOrder?.pendingButtonLabel).trim() || "Payment link coming soon",
      pendingContactLabel:
        str(pjOrder?.pendingContactLabel).trim() || "Or send me a message on the contact page",
      stickyBarLabel: str(pjOrder?.stickyBarLabel).trim() || "Reserve your place",
      payBusyLabel: str(pjOrder?.payBusyLabel).trim() || "Opening checkout",
      highlights: strList(pjOrder?.highlights),
      starRating: Math.min(5, Math.max(0, Math.round(num(pjOrder?.starRating, 0)))),
      starsLabel: str(pjOrder?.starsLabel).trim() || "Rated {rating} out of 5",
      reviewsLine: str(pjOrder?.reviewsLine),
      reviewsLinkLabel: str(pjOrder?.reviewsLinkLabel),
      showMoreReviewsLabel: str(pjOrder?.showMoreReviewsLabel).trim() || "Show more reviews",
      photo: {
        src: url(pjOrder?.photo),
        alt: str(pjOrder?.photoAlt),
        w: pjOrder?.photoW ? num(pjOrder.photoW, 0) || undefined : undefined,
        h: pjOrder?.photoH ? num(pjOrder.photoH, 0) || undefined : undefined,
      },
    },
  },
  welcome: {
    eyebrow: str(pj.welcome?.eyebrow),
    heading: str(pj.welcome?.heading, "Welcome"),
    headingWithName: str(pj.welcome?.headingWithName),
    intro: str(pj.welcome?.intro),
    receiptNote: str(pj.welcome?.receiptNote),
    prepHeading: str(pj.welcome?.prepHeading),
    prep: strList(pj.welcome?.prep),
    nextHeading: str(pj.welcome?.nextHeading),
    next: titled(pj.welcome?.next),
    hubHeading: str(pj.welcome?.hubHeading),
    hubText: str(pj.welcome?.hubText),
    hubButtonLabel: str(pj.welcome?.hubButtonLabel),
    hubUrl: url(pj.welcome?.hubUrl),
  },
  booking: {
    assessmentUrl: url(pj.booking?.assessmentUrl),
    sessionUrl: url(pj.booking?.sessionUrl),
    callUrl: url(pj.booking?.callUrl),
    assessmentEyebrow: str(pj.booking?.assessmentEyebrow),
    assessmentHeading: str(pj.booking?.assessmentHeading),
    assessmentText: str(pj.booking?.assessmentText),
    assessmentTitle: str(pj.booking?.assessmentTitle).trim() || "Book your online assessment",
    detailsNote: str(pj.booking?.detailsNote),
    pendingNote: str(pj.booking?.pendingNote),
    openLinkLabel: str(pj.booking?.openLinkLabel).trim() || "Open the booking page in a new tab",
    loadingLabel: str(pj.booking?.loadingLabel).trim() || "Loading the calendar",
    cantFindLabel: str(pj.booking?.cantFindLabel).trim() || "I can't find a time that works",
    cantFindAssessmentSubject: str(pj.booking?.cantFindAssessmentSubject),
    cantFindBody: str(pj.booking?.cantFindBody),
  },
  bookingPages: {
    introCall: bookingPageCopy(pj.bookingPages?.introCall, "Book a call"),
    assessment: bookingPageCopy(pj.bookingPages?.assessment, "Book your online assessment"),
    session: bookingPageCopy(pj.bookingPages?.session, "Book your private session"),
  },
};

/**
 * The real client quotes named in program.json → testimonialNames, in that
 * order. Quotes are never copied into program.json: they stay in
 * testimonials.json so there is one source of truth.
 */
export const programTestimonials: Testimonial[] = program.testimonialNames
  .map((name) => testimonials.find((t) => t.name.trim() === name.trim()))
  .filter((t): t is Testimonial => Boolean(t));

/* ───────────────────────── Intake form (/apply) ─────────────────────────── */

/*
 * ONE PAGE, SEVEN SHORT BLOCKS. The order of "blocks" in intake.json IS the
 * order on screen:
 *
 *   1. healthFlags  tick-all-that-apply screening, with "No medical conditions"
 *   2. cleared      only shown when a flag is ticked (+ conditionDetails,
 *                   one optional text box on the same block)
 *   3. areas        where the body needs care (+ areasOther)
 *   4. painToday    0 to 10
 *   5. contact      name, email, phone
 *   6. anythingElse optional free text, then the send button
 *
 * The "consent" block type (one tick box) still exists but intake.json no
 * longer uses it.
 *
 * Why it is ordered this way:
 *  • Safety first, PAR-Q style, but in a single tap for most people ("None of
 *    these"). The clearance question only appears for someone who ticked a
 *    flag, so nobody is asked something that does not apply to them.
 *  • Screening never ends the form early: both outcomes finish, both are
 *    captured, and routing happens only on send (see "eligibility").
 *  • Contact details sit near the end, not first. Traffic is cold-ish phone
 *    traffic from Instagram DMs, and opening with name and email is the
 *    single biggest cause of people never starting.
 *
 * Field ids are a contract with src/lib/intake.ts and the Google Sheet:
 * healthFlags (option values surgery6mo, seriousDiagnosis, pregnant,
 * postpartum, currentInjury, none), cleared (yes, no, not_sure),
 * conditionDetails, areas, areasOther, painToday, firstName, lastName, email, phone,
 * consent. Reword freely, but do not rename ids or option values.
 */

export type IntakeBlockType = "multi" | "single" | "scale" | "longtext" | "contact" | "consent";

export interface IntakeOption {
  /** Stored value, e.g. "not_sure". Eligibility rules match on this. */
  value: string;
  /** What the person sees on the chip. */
  label: string;
}

export interface IntakeContactField {
  /** Field id = answers key: firstName | lastName | email | phone. */
  id: string;
  label: string;
  type: "text" | "email" | "tel";
  required: boolean;
  autoComplete: string;
  autoCapitalize: "none" | "words";
  /** One line under the field, e.g. why the phone number helps ("" = none). */
  help: string;
  /** "" → use intake.errors.required. */
  requiredMessage: string;
  /** "" → use intake.errors.emailInvalid / phoneInvalid. */
  invalidMessage: string;
}

/** "Something else" on a multi block: selecting `optionValue` reveals a short text input. */
export interface IntakeOtherField {
  optionValue: string;
  /** Answers key for the typed text, e.g. "areasOther". */
  fieldId: string;
  label: string;
  placeholder: string;
}

/** An optional text box under a single-choice block, e.g. "conditionDetails". */
export interface IntakeDetailField {
  /** Answers key for the typed text. */
  fieldId: string;
  label: string;
  /** One line under the label ("" = none). */
  help: string;
  /** The example shown when none of `examples` applies. */
  placeholder: string;
  /**
   * A different example for a health answer ticked earlier in the form
   * (eligibility.flagsField). The first entry whose answer is ticked wins.
   */
  examples: { when: string; placeholder: string }[];
  maxLength: number;
}

/**
 * One block of the form. Every property is always present (normalised), so
 * components never need undefined checks; properties that do not apply to a
 * block's type are "" / [] / null / false.
 */
export interface IntakeBlock {
  /** Block id. For every type except "contact" this is also the answers key. */
  id: string;
  type: IntakeBlockType;
  question: string;
  /** Helper / "why I ask" line under the question ("" = none). */
  help: string;
  required: boolean;
  /** Custom "you skipped this" message ("" → the default for the type). */
  requiredMessage: string;
  /** single + multi. */
  options: IntakeOption[];
  /** single + multi: "stack" = full-width chips, "grid" = 2 columns. */
  layout: "stack" | "grid";
  /**
   * multi only: the option value that stands alone ("No medical conditions").
   * Ticking it clears the others; ticking another clears it. "" = none.
   */
  exclusive: string;
  /** multi only. */
  other: IntakeOtherField | null;
  /** single only: an optional text box under the choices (null = none). */
  detail: IntakeDetailField | null;
  /** contact only. */
  fields: IntakeContactField[];
  /** scale only. */
  min: number;
  max: number;
  minLabel: string;
  maxLabel: string;
  /** longtext only. */
  placeholder: string;
  maxLength: number;
  /** consent only: the tick box label. */
  consentLabel: string;
  /** consent only: a short policy line under the box, read, never ticked ("" = none). */
  policyText: string;
  /** consent only: privacy small print ("" = none). */
  note: string;
}

/**
 * How an application is routed. Read by evaluateEligibility() in
 * src/lib/intake.ts, which fails closed: anything here that no longer matches
 * a real question or option sends the applicant to /apply/not-yet.
 */
export interface IntakeEligibilityRules {
  /** id of the tick-all-that-apply screening block. Its "exclusive" option means no flags. */
  flagsField: string;
  /** id of the clearance block. It is shown only when a flag is ticked. */
  clearanceField: string;
  /** The one clearance answer that qualifies. Any other answer → /apply/not-yet. */
  clearedValue: string;
  /** Flags that still qualify once cleared, but are marked "needs review" for Diana. */
  reviewFlags: string[];
}

export interface Intake {
  settings: {
    /** Saved contact details older than this are discarded (0 = keep nothing). */
    draftMaxAgeDays: number;
    /**
     * Only matters while the Google Sheet is NOT connected and applications
     * arrive by email (Web3Forms). false = the email carries name, contact
     * and attribution only (health answers and the screening result stay out
     * of email). true = the email also carries every answer and the result.
     */
    emailFallbackIncludesAnswers: boolean;
  };
  intro: {
    eyebrow: string;
    /** Shown beside the eyebrow, e.g. "Under 2 minutes" ("" = hidden). */
    timeEstimate: string;
    heading: string;
    /** Why the questions are asked, in one sentence ("" = hidden). */
    subline: string;
    /** Short reassurances listed under the subline (empty = hidden). */
    points: string[];
  };
  blocks: IntakeBlock[];
  labels: {
    submit: string;
    /** Small line under the send button: no payment, what comes next ("" = hidden). */
    submitNote: string;
    /** Above each question, for sighted people. Tokens: {current}, {total} ("" = hidden). */
    questionCount: string;
    submitting: string;
    optional: string;
    /** Token: {suggestion}. */
    emailSuggestion: string;
    emailSuggestionAccept: string;
    /** Read out when "No medical conditions" clears the other ticks. */
    exclusiveCleared: string;
    /** Read out when another tick clears "No medical conditions". Token: {option}. */
    exclusiveUnticked: string;
    /** Read out when a tick adds the clearance question under the tick boxes. */
    followUpShown: string;
    /** Read out when the clearance question goes away again. */
    followUpHidden: string;
    honeypotLabel: string;
  };
  errors: {
    required: string;
    chooseOne: string;
    chooseAtLeastOne: string;
    scaleRequired: string;
    emailInvalid: string;
    phoneInvalid: string;
    consentRequired: string;
    /** Shown above the send button when exactly one block needs attention. */
    summaryOne: string;
    /** The same for two or more. Token: {count}. */
    summaryMany: string;
    submitFailed: string;
    /** The send button's label after a failed send. */
    retryLabel: string;
    fallbackText: string;
    fallbackInstagramLabel: string;
    fallbackEmailLabel: string;
  };
  eligibility: IntakeEligibilityRules;
  notYet: {
    eyebrow: string;
    /** Contains {firstName}. Use headingNoName when there is no name. */
    heading: string;
    headingNoName: string;
    body: string[];
    nextHeading: string;
    next: TitledItem[];
    /** "What to ask your doctor or PT" panel. Hidden when `ask` is empty. */
    askHeading: string;
    askIntro: string;
    ask: string[];
    contactHeading: string;
    emailLabel: string;
    messageLabel: string;
    communityHeading: string;
    communityText: string;
    communityLabel: string;
    newsletter: {
      heading: string;
      text: string;
      buttonLabel: string;
      successText: string;
      errorText: string;
    };
    disclaimer: string;
  };
}

/** Loose block shape: blocks differ by type, so this is hand-written, not inferred. */
interface CmsIntakeBlock {
  id?: string | null;
  type?: string | null;
  question?: string | null;
  help?: string | null;
  required?: boolean | null;
  requiredMessage?: string | null;
  options?: ({ value?: string | null; label?: string | null } | null)[] | null;
  layout?: string | null;
  exclusive?: string | null;
  other?: {
    optionValue?: string | null;
    fieldId?: string | null;
    label?: string | null;
    placeholder?: string | null;
  } | null;
  detail?: {
    fieldId?: string | null;
    label?: string | null;
    help?: string | null;
    placeholder?: string | null;
    examples?: ({ when?: string | null; placeholder?: string | null } | null)[] | null;
    maxLength?: number | string | null;
  } | null;
  fields?: ({
    id?: string | null;
    label?: string | null;
    type?: string | null;
    required?: boolean | null;
    autoComplete?: string | null;
    autoCapitalize?: string | null;
    help?: string | null;
    requiredMessage?: string | null;
    invalidMessage?: string | null;
  } | null)[] | null;
  min?: number | string | null;
  max?: number | string | null;
  minLabel?: string | null;
  maxLabel?: string | null;
  placeholder?: string | null;
  maxLength?: number | string | null;
  consentLabel?: string | null;
  policyText?: string | null;
  note?: string | null;
}

type CmsIntake = NonNullable<Loose<Omit<typeof intakeJsonRaw, "blocks">>> & {
  blocks?: (CmsIntakeBlock | null)[] | null;
};

const intakeJson = intakeJsonRaw as unknown as CmsIntake;
const ij = intakeJson;

const BLOCK_TYPES: IntakeBlockType[] = ["multi", "single", "scale", "longtext", "contact", "consent"];

function normaliseBlock(raw: CmsIntakeBlock): IntakeBlock | null {
  const id = str(raw.id).trim();
  const type = str(raw.type).trim() as IntakeBlockType;
  if (!id || !BLOCK_TYPES.includes(type)) return null;

  const options = list(raw.options)
    .map((o) => ({ value: str(o.value).trim(), label: str(o.label) }))
    .filter((o) => o.value !== "" && o.label !== "");
  const min = num(raw.min, 0);
  const max = Math.max(min + 1, num(raw.max, 10));
  const exclusive = str(raw.exclusive).trim();
  const otherFieldId = str(raw.other?.fieldId).trim();
  const otherValue = str(raw.other?.optionValue).trim();
  const detailFieldId = str(raw.detail?.fieldId).trim();

  return {
    id,
    type,
    question: str(raw.question),
    help: str(raw.help),
    required: bool(raw.required, false),
    requiredMessage: str(raw.requiredMessage),
    options,
    layout: raw.layout === "grid" ? "grid" : "stack",
    exclusive: type === "multi" && options.some((o) => o.value === exclusive) ? exclusive : "",
    other:
      type === "multi" && otherFieldId && otherValue
        ? {
            optionValue: otherValue,
            fieldId: otherFieldId,
            label: str(raw.other?.label),
            placeholder: str(raw.other?.placeholder),
          }
        : null,
    detail:
      type === "single" && detailFieldId
        ? {
            fieldId: detailFieldId,
            label: str(raw.detail?.label),
            help: str(raw.detail?.help),
            placeholder: str(raw.detail?.placeholder),
            examples: list(raw.detail?.examples)
              .map((x) => ({ when: str(x.when).trim(), placeholder: str(x.placeholder) }))
              .filter((x) => x.when !== "" && x.placeholder !== ""),
            maxLength: Math.max(1, num(raw.detail?.maxLength, 600)),
          }
        : null,
    fields:
      type === "contact"
        ? list(raw.fields)
            .map((f): IntakeContactField => ({
              id: str(f.id).trim(),
              label: str(f.label),
              type: f.type === "email" || f.type === "tel" ? f.type : "text",
              required: bool(f.required, false),
              autoComplete: str(f.autoComplete, "off"),
              autoCapitalize: f.autoCapitalize === "words" ? "words" : "none",
              help: str(f.help),
              requiredMessage: str(f.requiredMessage),
              invalidMessage: str(f.invalidMessage),
            }))
            .filter((f) => f.id !== "")
        : [],
    min,
    max,
    minLabel: str(raw.minLabel),
    maxLabel: str(raw.maxLabel),
    placeholder: str(raw.placeholder),
    maxLength: Math.max(1, num(raw.maxLength, 600)),
    consentLabel: str(raw.consentLabel),
    policyText: str(raw.policyText),
    note: str(raw.note),
  };
}

export const intake: Intake = {
  settings: {
    draftMaxAgeDays: num(ij.settings?.draftMaxAgeDays, 7),
    emailFallbackIncludesAnswers: bool(ij.settings?.emailFallbackIncludesAnswers, false),
  },
  intro: {
    eyebrow: str(ij.intro?.eyebrow),
    timeEstimate: str(ij.intro?.timeEstimate),
    heading: str(ij.intro?.heading),
    subline: str(ij.intro?.subline),
    points: strList(ij.intro?.points).filter((point) => point.trim() !== ""),
  },
  blocks: list(ij.blocks)
    .map(normaliseBlock)
    .filter((b): b is IntakeBlock => b !== null),
  labels: {
    submit: str(ij.labels?.submit).trim() || "See if it's a fit for me",
    submitNote: str(ij.labels?.submitNote).trim(),
    questionCount: str(ij.labels?.questionCount).trim(),
    submitting: str(ij.labels?.submitting).trim() || "Sending",
    optional: str(ij.labels?.optional).trim() || "Optional",
    emailSuggestion: str(ij.labels?.emailSuggestion).trim() || "Did you mean {suggestion}?",
    emailSuggestionAccept: str(ij.labels?.emailSuggestionAccept).trim() || "Yes, fix it",
    exclusiveCleared: str(ij.labels?.exclusiveCleared),
    exclusiveUnticked: str(ij.labels?.exclusiveUnticked),
    followUpShown: str(ij.labels?.followUpShown),
    followUpHidden: str(ij.labels?.followUpHidden),
    honeypotLabel: str(ij.labels?.honeypotLabel).trim() || "Leave this field empty",
  },
  errors: {
    required: str(ij.errors?.required).trim() || "Please fill this in.",
    chooseOne: str(ij.errors?.chooseOne).trim() || "Please pick one.",
    chooseAtLeastOne: str(ij.errors?.chooseAtLeastOne).trim() || "Please pick at least one.",
    scaleRequired: str(ij.errors?.scaleRequired).trim() || "Please tap a number.",
    emailInvalid: str(ij.errors?.emailInvalid).trim() || "That email looks incomplete.",
    phoneInvalid: str(ij.errors?.phoneInvalid).trim() || "That number looks too short.",
    consentRequired: str(ij.errors?.consentRequired).trim() || "Please tick the box.",
    summaryOne: str(ij.errors?.summaryOne).trim() || "One answer above still needs a look.",
    summaryMany:
      str(ij.errors?.summaryMany).trim() || "{count} answers above still need a look.",
    submitFailed:
      str(ij.errors?.submitFailed).trim() || "Something went wrong. Please try again.",
    retryLabel: str(ij.errors?.retryLabel).trim() || "Try again",
    fallbackText: str(ij.errors?.fallbackText),
    fallbackInstagramLabel: str(ij.errors?.fallbackInstagramLabel).trim() || "Message me on Instagram",
    fallbackEmailLabel: str(ij.errors?.fallbackEmailLabel).trim() || "Email me",
  },
  eligibility: {
    flagsField: str(ij.eligibility?.flagsField).trim(),
    clearanceField: str(ij.eligibility?.clearanceField).trim(),
    clearedValue: str(ij.eligibility?.clearedValue).trim(),
    reviewFlags: strList(ij.eligibility?.reviewFlags).map((flag) => flag.trim()),
  },
  notYet: {
    eyebrow: str(ij.notYet?.eyebrow),
    heading: str(ij.notYet?.heading),
    headingNoName: str(ij.notYet?.headingNoName),
    body: strList(ij.notYet?.body),
    nextHeading: str(ij.notYet?.nextHeading),
    next: titled(ij.notYet?.next),
    askHeading: str(ij.notYet?.askHeading),
    askIntro: str(ij.notYet?.askIntro),
    ask: strList(ij.notYet?.ask),
    contactHeading: str(ij.notYet?.contactHeading),
    emailLabel: str(ij.notYet?.emailLabel).trim() || "Email me",
    messageLabel: str(ij.notYet?.messageLabel).trim() || "Message me on Instagram",
    communityHeading: str(ij.notYet?.communityHeading),
    communityText: str(ij.notYet?.communityText),
    communityLabel: str(ij.notYet?.communityLabel).trim() || "Visit the free community",
    newsletter: {
      heading: str(ij.notYet?.newsletter?.heading),
      text: str(ij.notYet?.newsletter?.text),
      buttonLabel: str(ij.notYet?.newsletter?.buttonLabel).trim() || "Sign up",
      successText: str(ij.notYet?.newsletter?.successText),
      errorText: str(ij.notYet?.newsletter?.errorText),
    },
    disclaimer: str(ij.notYet?.disclaimer),
  },
};

/* ─────────────────────── Funnel per-page SEO meta ───────────────────────── */

export interface FunnelPageMeta extends PageMeta {
  /** Route path, for <Seo path>. */
  path: string;
  /** Keep the page out of search results (everything except /apply). */
  noindex: boolean;
}

/** Spread straight into Seo: <Seo {...funnelMeta.checkout} /> */
export const funnelMeta: Record<FunnelRouteKey, FunnelPageMeta> = {
  apply: {
    ...pageMeta(ij.meta?.apply, `Apply for the ${program.shortName} | ${site.name}`),
    path: funnelRoutes.apply,
    noindex: false,
  },
  notYet: {
    ...pageMeta(ij.meta?.notYet, `Thank you | ${site.name}`),
    path: funnelRoutes.notYet,
    noindex: true,
  },
  checkout: {
    ...pageMeta(pj.meta?.checkout, `${program.name} | ${site.name}`),
    path: funnelRoutes.checkout,
    noindex: true,
  },
  welcome: {
    ...pageMeta(pj.meta?.welcome, `Welcome | ${site.name}`),
    path: funnelRoutes.welcome,
    noindex: true,
  },
};
