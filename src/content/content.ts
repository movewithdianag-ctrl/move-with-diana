/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  MOVE WITH DIANA — CONTENT LAYER
 *
 *  ✏️  TO EDIT THE SITE'S WORDS OR PHOTOS: use the admin panel at /admin —
 *      it edits the .json files in this folder through friendly forms.
 *      (settings.json, home.json, about.json, offers.json, contact.json,
 *      footer.json, testimonials.json)
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

const offersJson = offersJsonRaw as unknown as typeof offersJsonRaw & { offers: CmsOffer[] };
const contactJson = contactJsonRaw as unknown as typeof contactJsonRaw & {
  gallery: CmsGalleryItem[];
};

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
