/**
 * 8-Week Pilates Program intake: pure logic + transport. No React in this file.
 *
 * The form UI (src/pages/Apply.tsx and src/components/intake/*) only calls
 * the functions exported here, so the questions can change in
 * src/content/intake.json and the transport can change here without touching
 * any component.
 *
 * Privacy rules this file enforces:
 *  • Answers, names, emails and health details never go in a URL or in an
 *    analytics event, with two narrow exceptions, both of them the tool the
 *    person is about to give those same details to:
 *      1. the email Stripe prefills on its own checkout page, sent with an
 *         opaque lead id (withPrefill);
 *      2. the first name and email handed to the Cal.com inline booking
 *         embed on the welcome page, which the embed script passes to
 *         Cal.com's own booking frame (components/BookingEmbed.tsx). Not the
 *         "open in a new tab" link, not the plain iframe fallback.
 *    Health answers and the screening result are never part of either.
 *  • The lead id is random. It never contains a name, an email or an answer.
 *  • By default the email fallback carries contact details only, never health
 *    answers or the screening result.
 *  • On the dev server nothing is sent anywhere (see submitIntake).
 */
import {
  funnelRoutes,
  intake,
  type IntakeBlock,
  type IntakeContactField,
} from "@/content/content";
import { INTAKE_ENDPOINT, WEB3FORMS_KEY } from "./config";
import { postToWeb3Forms } from "./contact";
import { timeoutSignal } from "./utils";

/* ───────────────────────────────── Types ────────────────────────────────── */

/** One answer: text / single choice (string), multi choice (string[]), scale (number). */
export type IntakeAnswerValue = string | string[] | number;

/**
 * Answers keyed by field id.
 *  • single: answers[block.id] = string
 *    (+ answers[block.detail.fieldId] = string, the optional text box)
 *  • multi: answers[block.id] = string[] (+ answers[block.other.fieldId] = string)
 *  • scale: answers[block.id] = number (0 is a real answer, "not answered" = key absent)
 *  • longtext: answers[block.id] = string
 *  • contact: answers[field.id] = string for each field (name, email, phone)
 *  • consent: answers[block.id] = "yes" when ticked, absent when not
 *  • honeypot: answers[HONEYPOT_FIELD] = string (must stay empty)
 */
export type IntakeAnswers = Record<string, IntakeAnswerValue>;

export type IntakeOutcome = "qualified" | "not_cleared";

export interface EligibilityResult {
  outcome: IntakeOutcome;
  /** Qualified, but Diana should read the notes first (e.g. recent surgery). */
  needsReview: boolean;
  /** What decided it, e.g. ["healthFlags=pregnant", "cleared=not_sure"]. Never shown to the visitor. */
  reasons: string[];
}

/**
 * Validation errors. Keyed by block.id, except on the contact block where each
 * key is a contact field id (name, email, phone). Empty object = valid.
 */
export type IntakeErrors = Record<string, string>;

export interface IntakeAttribution {
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string;
  /** ?src= shorthand, e.g. the name of a DM keyword or link in bio. */
  src: string;
  /** ?ref= shorthand, e.g. who referred them. */
  ref: string;
  /** document.referrer on the first page of the visit. */
  referrer: string;
  /** Path of the first page of the visit (no query string). */
  page: string;
}

type YesNo = "Y" | "N";

/** The flat JSON object posted to the Google Sheet (one key per column, one fact per key). */
export interface IntakePayload {
  leadId: string;
  /** "QUALIFIED" | "NOT CLEARED" (what the alerts show). */
  status: string;
  name: string;
  /** First word of the name, for greetings. */
  firstName: string;
  email: string;
  phone: string;
  /** One Y/N per screening flag that has its own column in the sheet. */
  surgery6mo: YesNo;
  seriousDiagnosis: YesNo;
  pregnant: YesNo;
  postpartum: YesNo;
  currentInjury: YesNo;
  /**
   * Any other ticked screening option, comma separated: one added in the
   * editor later has no column of its own, and must still reach the sheet.
   */
  otherFlags: string;
  /**
   * "yes" | "no" | "not_sure", "not asked" when no flag was ticked, or
   * "config error" when the screening rules could not be checked.
   */
  cleared: string;
  conditionDetails: string;
  /** Comma separated, e.g. "back, hips, other: wrists". */
  areas: string;
  painToday: number | "";
  goal: string;
  consent: string;
  outcome: IntakeOutcome;
  needsReview: boolean;
  /** Best single label for where the lead came from. */
  source: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string;
  ref: string;
  referrer: string;
  page: string;
  /** Honeypot. Real people leave it empty; the Apps Script drops rows where it is not. */
  website: string;
}

/** What the "not yet", order and welcome pages can read back (sessionStorage). */
export interface IntakeSession {
  firstName: string;
  email: string;
  outcome: IntakeOutcome;
  needsReview: boolean;
  leadId: string;
}

export type IntakeTransport = "sheet" | "email" | "preview" | "skipped";

export interface IntakeSubmitResult extends EligibilityResult {
  leadId: string;
  /** How it was delivered. "preview" = dev server: logged to the console, nothing sent. */
  transport: IntakeTransport;
}

export interface IntakeDraft {
  answers: IntakeAnswers;
  /** ms since epoch. */
  savedAt: number;
}

/* ─────────────────────────────── Constants ──────────────────────────────── */

/** sessionStorage: result of a sent application. */
const INTAKE_SESSION_KEY = "mwd-intake";
/** localStorage: contact details of an unfinished application, for a returning visitor. */
const INTAKE_DRAFT_KEY = "mwd-intake-draft";
/** sessionStorage: first-touch attribution for this visit. */
const ATTRIBUTION_KEY = "mwd-attribution";
/** sessionStorage: this visit's opaque lead id. */
const LEAD_ID_KEY = "mwd-lead-id";
/**
 * Answers key (and input name) of the hidden honeypot field. Deliberately not
 * "website", "url", "company" or anything else a browser or a password
 * manager fills in by itself: that would make a real applicant look like a bot.
 */
export const HONEYPOT_FIELD = "extraNote";
/** The screening options that have their own Y/N column in the sheet. */
const FLAG_COLUMNS = ["surgery6mo", "seriousDiagnosis", "pregnant", "postpartum", "currentInjury"];

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/* ──────────────────────────── Storage helpers ───────────────────────────── */

// Storage can throw (private mode, blocked cookies, quota). Nothing here may
// ever break the form, so every access is wrapped.
function storageGet(kind: "session" | "local", key: string): string | null {
  try {
    const store = kind === "session" ? window.sessionStorage : window.localStorage;
    return store.getItem(key);
  } catch {
    return null;
  }
}

function storageSet(kind: "session" | "local", key: string, value: string): void {
  try {
    const store = kind === "session" ? window.sessionStorage : window.localStorage;
    store.setItem(key, value);
  } catch {
    /* ignore */
  }
}

function storageRemove(kind: "session" | "local", key: string): void {
  try {
    const store = kind === "session" ? window.sessionStorage : window.localStorage;
    store.removeItem(key);
  } catch {
    /* ignore */
  }
}

function parseJson(raw: string | null): unknown {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

/* ───────────────────────────── Answer helpers ───────────────────────────── */

/** A text answer, trimmed ("" when absent or not text). */
export function answerText(answers: IntakeAnswers, id: string): string {
  const v = answers[id];
  if (typeof v === "string") return v.trim();
  if (typeof v === "number") return String(v);
  return "";
}

/** A multi-choice answer as an array ([] when absent). */
export function answerList(answers: IntakeAnswers, id: string): string[] {
  const v = answers[id];
  if (Array.isArray(v)) return v.filter((x) => typeof x === "string" && x !== "");
  if (typeof v === "string" && v !== "") return [v];
  return [];
}

/* ─────────────────────────── Visibility + rules ─────────────────────────── */

const blockById = (id: string): IntakeBlock | undefined =>
  intake.blocks.find((block) => block.id === id);

/**
 * The screening flags that are ticked, without the "No medical conditions" value.
 * If the flags question has lost its "exclusive" setting, "none" counts as a
 * flag, which asks for clearance: the safe side.
 */
function tickedFlags(answers: IntakeAnswers): string[] {
  const { flagsField } = intake.eligibility;
  const exclusive = blockById(flagsField)?.exclusive ?? "";
  return answerList(answers, flagsField).filter((value) => value !== exclusive);
}

/**
 * Should this block be on screen? Everything always is, except the clearance
 * question, which only appears once a screening flag is ticked.
 */
function isBlockVisible(block: IntakeBlock, answers: IntakeAnswers): boolean {
  return block.id !== intake.eligibility.clearanceField || tickedFlags(answers).length > 0;
}

/** The blocks to show, in order, for the current answers. */
export function visibleBlocks(answers: IntakeAnswers): IntakeBlock[] {
  return intake.blocks.filter((block) => isBlockVisible(block, answers));
}

/**
 * Answers with anything belonging to a hidden block removed, so a clearance
 * answer or a detail typed before the person changed their ticks is never
 * kept, saved or sent. Returns the same object when nothing had to go.
 */
export function withoutHiddenAnswers(answers: IntakeAnswers): IntakeAnswers {
  const hiddenKeys = intake.blocks
    .filter((block) => !isBlockVisible(block, answers))
    .flatMap((block) => [
      block.id,
      block.other?.fieldId ?? "",
      block.detail?.fieldId ?? "",
      ...block.fields.map((field) => field.id),
    ])
    .filter((key) => key !== "" && key in answers);
  if (hiddenKeys.length === 0) return answers;

  const clean: IntakeAnswers = { ...answers };
  for (const key of hiddenKeys) delete clean[key];
  return clean;
}

/**
 * Route the applicant. Driven entirely by intake.eligibility in intake.json:
 *  • no flag ticked ("No medical conditions") → "qualified", clearance never asked
 *  • a flag ticked and the clearance answer is anything but clearedValue
 *    → "not_cleared" (the /apply/not-yet page)
 *  • a flag ticked and cleared → "qualified"; needsReview is true when one of
 *    the ticked flags is in reviewFlags.
 *
 * The gate fails closed. If the rules or the questions they read have been
 * edited so that an answer can no longer be checked (a renamed id, a renamed
 * option value, an emptied list), the applicant is routed to "not_cleared"
 * rather than to the pay buttons, and a review list that no longer matches
 * the options marks every flagged applicant for review.
 */
export function evaluateEligibility(answers: IntakeAnswers): EligibilityResult {
  const rules = intake.eligibility;
  const notCleared = (...reasons: string[]): EligibilityResult => ({
    outcome: "not_cleared",
    needsReview: false,
    reasons,
  });

  const flags = blockById(rules.flagsField);
  if (!flags || flags.type !== "multi") {
    return notCleared(`${rules.flagsField || "flagsField"}=unknown_question`);
  }
  const clearance = blockById(rules.clearanceField);
  if (
    !clearance ||
    clearance.type !== "single" ||
    !clearance.options.some((option) => option.value === rules.clearedValue)
  ) {
    return notCleared(`${rules.clearanceField || "clearanceField"}=unknown_question`);
  }

  const known = flags.options.map((option) => option.value);
  const ticked = answerList(answers, flags.id);
  if (ticked.length === 0 || ticked.some((value) => !known.includes(value))) {
    return notCleared(`${flags.id}=unverified`);
  }

  // A real flag wins over "No medical conditions" if both ever arrive together.
  const real = tickedFlags(answers);
  if (real.length === 0) return { outcome: "qualified", needsReview: false, reasons: [] };

  const reasons = real.map((value) => `${flags.id}=${value}`);
  const cleared = answerText(answers, clearance.id);
  if (cleared !== rules.clearedValue) {
    return notCleared(...reasons, `${clearance.id}=${cleared || "unanswered"}`);
  }

  const reviewListUsable =
    rules.reviewFlags.length > 0 &&
    rules.reviewFlags.every((flag) => flag !== flags.exclusive && known.includes(flag));
  if (!reviewListUsable) {
    return { outcome: "qualified", needsReview: true, reasons: [...reasons, "reviewFlags=unverified"] };
  }
  return {
    outcome: "qualified",
    needsReview: real.some((value) => rules.reviewFlags.includes(value)),
    reasons,
  };
}

/** Where to send the applicant after a successful submit. */
export function outcomePath(outcome: IntakeOutcome): string {
  return outcome === "qualified" ? funnelRoutes.checkout : funnelRoutes.notYet;
}

/* ─────────────────────────────── Validation ─────────────────────────────── */

function digitCount(value: string): number {
  return value.replace(/\D/g, "").length;
}

/** Validate one contact field. Returns "" when it is fine. */
export function validateContactField(field: IntakeContactField, value: string): string {
  const text = value.trim();
  if (text === "") {
    return field.required ? field.requiredMessage || intake.errors.required : "";
  }
  if (field.type === "email" && !EMAIL_RE.test(text)) {
    return field.invalidMessage || intake.errors.emailInvalid;
  }
  if (field.type === "tel") {
    const digits = digitCount(text);
    if (digits < 7 || digits > 15) return field.invalidMessage || intake.errors.phoneInvalid;
  }
  return "";
}

/**
 * Validate one block. Returns {} when it is fine.
 * Keys: block.id, or the contact field ids on the contact block.
 */
function validateBlock(block: IntakeBlock, answers: IntakeAnswers): IntakeErrors {
  const errors: IntakeErrors = {};
  const { errors: copy } = intake;

  switch (block.type) {
    case "contact": {
      for (const field of block.fields) {
        const message = validateContactField(field, answerText(answers, field.id));
        if (message) errors[field.id] = message;
      }
      break;
    }
    case "single": {
      const value = answerText(answers, block.id);
      const known = block.options.some((option) => option.value === value);
      if (block.required && !known) errors[block.id] = block.requiredMessage || copy.chooseOne;
      break;
    }
    case "multi": {
      if (block.required && answerList(answers, block.id).length === 0) {
        errors[block.id] = block.requiredMessage || copy.chooseAtLeastOne;
      }
      break;
    }
    case "scale": {
      const value = answers[block.id];
      const answered =
        typeof value === "number" && Number.isFinite(value) && value >= block.min && value <= block.max;
      if (block.required && !answered) errors[block.id] = block.requiredMessage || copy.scaleRequired;
      break;
    }
    case "longtext": {
      if (block.required && answerText(answers, block.id) === "") {
        errors[block.id] = block.requiredMessage || copy.required;
      }
      break;
    }
    case "consent": {
      if (block.required && answerText(answers, block.id) !== "yes") {
        errors[block.id] = block.requiredMessage || copy.consentRequired;
      }
      break;
    }
  }

  return errors;
}

/** Validate every block that is on screen. {} = ready to send. */
export function validateAll(answers: IntakeAnswers): IntakeErrors {
  const errors: IntakeErrors = {};
  for (const block of visibleBlocks(answers)) Object.assign(errors, validateBlock(block, answers));
  return errors;
}

const EMAIL_DOMAIN_FIXES: Record<string, string> = {
  "gmial.com": "gmail.com",
  "gmai.com": "gmail.com",
  "gmal.com": "gmail.com",
  "gmail.co": "gmail.com",
  "gmail.con": "gmail.com",
  "gmail.cm": "gmail.com",
  "gnail.com": "gmail.com",
  "gamil.com": "gmail.com",
  "gmaill.com": "gmail.com",
  "hotmial.com": "hotmail.com",
  "hotmai.com": "hotmail.com",
  "hotmal.com": "hotmail.com",
  "hotmail.con": "hotmail.com",
  "hotmail.co": "hotmail.com",
  "yaho.com": "yahoo.com",
  "yahooo.com": "yahoo.com",
  "yahoo.con": "yahoo.com",
  "yahoo.co": "yahoo.com",
  "outlok.com": "outlook.com",
  "outlook.con": "outlook.com",
  "outlook.co": "outlook.com",
  "iclod.com": "icloud.com",
  "icloud.con": "icloud.com",
  "icloud.co": "icloud.com",
  "aol.con": "aol.com",
};

/**
 * Spot a common email typo. Returns the corrected address ("" = looks fine).
 * Show it as a suggestion (intake.labels.emailSuggestion), never auto-apply.
 */
export function suggestEmailFix(email: string): string {
  const clean = email.trim().toLowerCase();
  const at = clean.lastIndexOf("@");
  if (at < 1) return "";
  const local = clean.slice(0, at);
  const domain = clean.slice(at + 1);
  const fixed = EMAIL_DOMAIN_FIXES[domain];
  return fixed ? `${local}@${fixed}` : "";
}

/* ─────────────────────────────── Attribution ────────────────────────────── */

const EMPTY_ATTRIBUTION: IntakeAttribution = {
  utm_source: "",
  utm_medium: "",
  utm_campaign: "",
  utm_content: "",
  src: "",
  ref: "",
  referrer: "",
  page: "",
};

const CAMPAIGN_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "src",
  "ref",
] as const;

function readStoredAttribution(): IntakeAttribution | null {
  const parsed = parseJson(storageGet("session", ATTRIBUTION_KEY));
  if (!isRecord(parsed)) return null;
  const out: IntakeAttribution = { ...EMPTY_ATTRIBUTION };
  for (const key of Object.keys(EMPTY_ATTRIBUTION) as (keyof IntakeAttribution)[]) {
    const v = parsed[key];
    if (typeof v === "string") out[key] = v.slice(0, 300);
  }
  return out;
}

/**
 * Where did this visitor come from? Reads utm_source / utm_medium /
 * utm_campaign / utm_content / src / ref from the URL plus document.referrer,
 * and keeps the FIRST touch of the visit in sessionStorage, so the tags
 * survive navigating from the landing page to /apply. Safe to call anywhere,
 * any number of times (App.tsx calls it once on load).
 */
export function captureAttribution(): IntakeAttribution {
  if (typeof window === "undefined") return { ...EMPTY_ATTRIBUTION };

  const stored = readStoredAttribution();
  const current: IntakeAttribution = { ...EMPTY_ATTRIBUTION };
  try {
    const params = new URLSearchParams(window.location.search);
    for (const key of CAMPAIGN_KEYS) {
      current[key] = (params.get(key) ?? "").trim().slice(0, 150);
    }
    current.referrer = (document.referrer || "").slice(0, 300);
    current.page = window.location.pathname;
  } catch {
    /* ignore */
  }

  const hasCampaign = (a: IntakeAttribution) => CAMPAIGN_KEYS.some((k) => a[k] !== "");

  // First touch wins. The one exception: the visit started untagged and a
  // tagged link was opened later in the same tab.
  let result = stored ?? current;
  if (stored && !hasCampaign(stored) && hasCampaign(current)) {
    result = { ...current, referrer: stored.referrer || current.referrer, page: stored.page };
  }

  storageSet("session", ATTRIBUTION_KEY, JSON.stringify(result));
  return result;
}

function sourceLabel(a: IntakeAttribution): string {
  if (a.src) return a.src;
  if (a.utm_source) return a.utm_source;
  if (a.ref) return `ref:${a.ref}`;
  if (a.referrer) {
    try {
      return new URL(a.referrer).hostname.replace(/^www\./, "");
    } catch {
      return "referral";
    }
  }
  return "direct";
}

/* ───────────────────────────────── Lead id ──────────────────────────────── */

const LEAD_ID_RE = /^[A-Za-z0-9_-]{1,200}$/;

function randomToken(length: number): string {
  const alphabet = "abcdefghijkmnpqrstuvwxyz23456789";
  let out = "";
  try {
    const bytes = new Uint8Array(length);
    window.crypto.getRandomValues(bytes);
    for (const b of bytes) out += alphabet[b % alphabet.length];
  } catch {
    for (let i = 0; i < length; i += 1) {
      out += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
  }
  return out;
}

/**
 * This visit's opaque lead id, e.g. "lead_2026-11-14_ab12cd". The same id is
 * sent with the application and (as client_reference_id) to Stripe, so the sheet row and the payment can be matched. It never
 * contains a name, an email or an answer.
 */
function getLeadId(): string {
  const existing = storageGet("session", LEAD_ID_KEY);
  if (existing && LEAD_ID_RE.test(existing)) return existing;
  const id = `lead_${new Date().toISOString().slice(0, 10)}_${randomToken(6)}`;
  storageSet("session", LEAD_ID_KEY, id);
  return id;
}

/* ───────────────────────────────── Payload ──────────────────────────────── */

function areasText(answers: IntakeAnswers): string {
  const block = blockById("areas");
  const picked = answerList(answers, "areas");
  const otherText = block?.other ? answerText(answers, block.other.fieldId) : "";
  return picked
    .map((value) =>
      block?.other && value === block.other.optionValue && otherText ? `${value}: ${otherText}` : value,
    )
    .join(", ");
}

/** Longest "Other health boxes" value the sheet keeps (LIMITS.tag in Code.gs). */
const OTHER_FLAGS_MAX = 150;

/**
 * Ticked screening options that have no column of their own. The "Other"
 * option is sent as what the person typed, or as its value when they typed
 * nothing.
 */
function otherFlagsText(answers: IntakeAnswers, flags: string[]): string {
  const other = blockById(intake.eligibility.flagsField)?.other;
  const typed = other ? answerText(answers, other.fieldId).replace(/\s+/g, " ") : "";
  return flags
    .filter((value) => !FLAG_COLUMNS.includes(value))
    .map((value) => (other && value === other.optionValue && typed ? typed : value))
    .join(", ")
    .slice(0, OTHER_FLAGS_MAX);
}

/**
 * True when the gate failed closed because the screening rules or the
 * questions they read no longer match (see evaluateEligibility).
 */
const isConfigReason = (reason: string): boolean => /=(unknown_question|unverified)$/.test(reason);

/** The flat object that is posted to the sheet. */
function buildPayload(answers: IntakeAnswers, eligibility: EligibilityResult): IntakePayload {
  const clean = withoutHiddenAnswers(answers);
  const attribution = captureAttribution();
  // A broken rule sends the person to "not yet". Say so in the row, so it is
  // not read as a real "not cleared" answer.
  const configError = eligibility.reasons.some(isConfigReason);
  const gateBroken = configError && eligibility.outcome === "not_cleared";

  const flags = tickedFlags(clean);
  const flag = (value: string): YesNo => (flags.includes(value) ? "Y" : "N");
  // First and last name are asked separately and sent as one full name.
  const firstName = answerText(clean, "firstName").replace(/\s+/g, " ");
  const name = [firstName, answerText(clean, "lastName")].filter(Boolean).join(" ").replace(/\s+/g, " ");
  const pain = clean.painToday;

  let cleared = "not asked";
  if (gateBroken) cleared = "config error";
  else if (flags.length > 0) cleared = answerText(clean, intake.eligibility.clearanceField);

  return {
    leadId: getLeadId(),
    status: eligibility.outcome === "qualified" ? "QUALIFIED" : "NOT CLEARED",
    name,
    firstName,
    email: answerText(clean, "email").toLowerCase(),
    phone: answerText(clean, "phone"),
    surgery6mo: flag("surgery6mo"),
    seriousDiagnosis: flag("seriousDiagnosis"),
    pregnant: flag("pregnant"),
    postpartum: flag("postpartum"),
    currentInjury: flag("currentInjury"),
    otherFlags: otherFlagsText(clean, flags),
    cleared,
    conditionDetails: answerText(clean, "conditionDetails"),
    areas: areasText(clean),
    painToday: typeof pain === "number" && Number.isFinite(pain) ? pain : "",
    goal: answerText(clean, "goal"),
    consent: answerText(clean, "consent"),
    outcome: eligibility.outcome,
    needsReview: eligibility.needsReview || configError,
    source: sourceLabel(attribution),
    utm_source: attribution.utm_source,
    utm_medium: attribution.utm_medium,
    utm_campaign: attribution.utm_campaign,
    utm_content: attribution.utm_content,
    ref: attribution.ref,
    referrer: attribution.referrer,
    page: attribution.page,
    website: answerText(answers, HONEYPOT_FIELD),
  };
}

/* ──────────────────────────────── Transport ─────────────────────────────── */

/** Health and screening answers. Kept out of email unless the setting says otherwise. */
const HEALTH_KEYS: (keyof IntakePayload)[] = [
  "surgery6mo",
  "seriousDiagnosis",
  "pregnant",
  "postpartum",
  "currentInjury",
  "otherFlags",
  "cleared",
  "conditionDetails",
  "areas",
  "painToday",
  "goal",
];

/**
 * The result of the screening. It is worked out from the health answers
 * ("not cleared", "needs review"), so it stays out of email with them.
 */
const RESULT_KEYS: (keyof IntakePayload)[] = ["status", "outcome", "needsReview"];

/**
 * Longest wait for the sheet. The script waits up to 10 seconds for its lock
 * and stops sending alerts about 15 seconds in (LOCK_WAIT_MS and
 * ALERT_DEADLINE_MS in integrations/google-sheet/Code.gs), so this leaves
 * room for the slowest normal reply. A timeout throws, which leads to the
 * email fallback or the "try again" message.
 */
const SHEET_TIMEOUT_MS = 25000;

/** Added to the fallback email when the sheet could not be reached. Read by Diana only. */
const RESCUE_NOTE_WITH_ANSWERS =
  "The Google Sheet did not confirm this application, so it may be missing there. Everything the person answered is in this email. Please add it to the sheet by hand.";
const RESCUE_NOTE_NO_ANSWERS =
  "The Google Sheet did not confirm this application, so it may be missing there. The health answers were NOT included in this email and may not have been saved. Check the sheet, and if they are not there, ask this person again before the first session.";

async function postToSheet(payload: IntakePayload): Promise<void> {
  // text/plain keeps this a "simple" request, so the browser sends no CORS
  // preflight (Apps Script web apps cannot answer one). Apps Script replies
  // with a 302 to googleusercontent.com, hence redirect: "follow".
  const res = await fetch(INTAKE_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload),
    redirect: "follow",
    signal: timeoutSignal(SHEET_TIMEOUT_MS),
  });
  const data = (await res.json().catch(() => null)) as { ok?: boolean } | null;
  if (!res.ok || data?.ok !== true) {
    throw new Error("Intake endpoint did not confirm the submission");
  }
}

/**
 * Email the application through Web3Forms. `rescue` = the sheet was tried
 * first and did not confirm: the email then says so in plain words, so a lost
 * row is never silent.
 *
 * With intake.settings.emailFallbackIncludesAnswers off, the email is a plain
 * "someone applied" notice: contact details, where they came from and the
 * lead id. No health answer, no screening result, and a subject line that
 * gives nothing away in a notification preview (first name only).
 */
async function postByEmail(payload: IntakePayload, rescue = false): Promise<void> {
  const includeAnswers = intake.settings.emailFallbackIncludesAnswers;
  const fields: Record<string, string> = {
    subject: includeAnswers
      ? `New intake: ${payload.name || payload.email} (${payload.status})`
      : `New 8-Week Pilates Program application${payload.firstName ? `: ${payload.firstName}` : ""}`,
    from_name: payload.name || "8-Week Pilates Program application",
  };
  if (rescue) fields.note = includeAnswers ? RESCUE_NOTE_WITH_ANSWERS : RESCUE_NOTE_NO_ANSWERS;
  for (const key of Object.keys(payload) as (keyof IntakePayload)[]) {
    if (key === "website" || key === "firstName") continue;
    if (!includeAnswers && (HEALTH_KEYS.includes(key) || RESULT_KEYS.includes(key))) continue;
    const value = payload[key];
    if (value === "" || value === false) continue;
    fields[key] = String(value);
  }
  await postToWeb3Forms(fields);
}

/**
 * Send the finished application.
 *
 *  0. On the dev server (npm run dev) NOTHING is sent, neither to the sheet
 *     nor by email: the payload is logged to the console as a preview and the
 *     call resolves, so the whole funnel can be clicked through without
 *     emailing Diana or adding test rows. Set VITE_INTAKE_SEND_IN_DEV=1 to
 *     send for real from the dev server. Built sites never take this branch.
 *  1. INTAKE_ENDPOINT set → POST to the Google Apps Script web app (the sheet).
 *     If that fails and a Web3Forms key exists, fall back to email so the
 *     lead is not lost.
 *  2. No endpoint, Web3Forms key set → email Diana (contact details only;
 *     the answers and the screening result only if
 *     intake.settings.emailFallbackIncludesAnswers).
 *  3. Neither → throw: a real applicant must never be told "sent" when
 *     nothing was, and health answers must never be printed to a visitor's
 *     console.
 *
 * On success the result is saved for the pages that follow (readIntakeSession)
 * and the draft is cleared; navigate to outcomePath(result.outcome). Throws on failure: show
 * intake.errors.submitFailed and keep the answers on screen.
 */
export async function submitIntake(answers: IntakeAnswers): Promise<IntakeSubmitResult> {
  const eligibility = evaluateEligibility(withoutHiddenAnswers(answers));
  const payload = buildPayload(answers, eligibility);
  const devPreview = import.meta.env.DEV && import.meta.env.VITE_INTAKE_SEND_IN_DEV !== "1";
  let transport: IntakeTransport;

  if (eligibility.reasons.some(isConfigReason)) {
    // No answer is printed here, only which rule is broken.
    console.error(
      "[Move with Diana] The screening rules in src/content/intake.json no longer match the questions, so the form is failing safe. Check the eligibility section:",
      eligibility.reasons.filter(isConfigReason).join(", "),
    );
  }

  if (payload.website !== "") {
    // Honeypot filled: a bot. Act normal, send nothing.
    transport = "skipped";
  } else if (devPreview) {
    console.info(
      "[Move with Diana] Dev preview. Nothing was sent (set VITE_INTAKE_SEND_IN_DEV=1 to send). Payload:",
      payload,
      "Routing:",
      eligibility,
    );
    transport = "preview";
  } else if (INTAKE_ENDPOINT) {
    try {
      await postToSheet(payload);
      transport = "sheet";
    } catch (error) {
      if (!WEB3FORMS_KEY) throw error;
      await postByEmail(payload, true);
      transport = "email";
    }
  } else if (WEB3FORMS_KEY) {
    await postByEmail(payload);
    transport = "email";
  } else {
    console.error(
      "[Move with Diana] The application form is not connected: set VITE_INTAKE_ENDPOINT or VITE_WEB3FORMS_KEY.",
    );
    throw new Error("Intake is not connected");
  }

  saveIntakeSession({
    firstName: payload.firstName,
    email: payload.email,
    outcome: eligibility.outcome,
    needsReview: eligibility.needsReview,
    leadId: payload.leadId,
  });
  clearIntakeDraft();
  // This application is done. Anything sent later from this tab (the same
  // person applying again, or someone else on the same phone) gets a fresh
  // id, so it lands as its own row. Stripe reads the id from the saved
  // session above, not from here.
  storageRemove("session", LEAD_ID_KEY);

  return { ...eligibility, leadId: payload.leadId, transport };
}

/* ─────────────────────────── Session (after send) ───────────────────────── */

/** Remember the outcome for the "not yet", order and welcome pages (this tab only). */
function saveIntakeSession(result: IntakeSession): void {
  storageSet("session", INTAKE_SESSION_KEY, JSON.stringify(result));
}

/** null when no application has been sent in this tab. */
export function readIntakeSession(): IntakeSession | null {
  if (typeof window === "undefined") return null;
  const parsed = parseJson(storageGet("session", INTAKE_SESSION_KEY));
  if (!isRecord(parsed)) return null;
  const outcome = parsed.outcome;
  if (outcome !== "qualified" && outcome !== "not_cleared") return null;
  return {
    firstName: typeof parsed.firstName === "string" ? parsed.firstName : "",
    email: typeof parsed.email === "string" ? parsed.email : "",
    outcome,
    needsReview: parsed.needsReview === true,
    leadId: typeof parsed.leadId === "string" ? parsed.leadId : "",
  };
}

/** How a visitor reached the order page. Decides the "you qualify" bar and the steps trail. */
export interface OrderArrival {
  /** True for someone who just qualified on /apply. False for a direct visitor. */
  fromForm: boolean;
  /** "" when unknown: the bar then shows its no-name line. */
  firstName: string;
  /** True when the reviewNote belongs under the pay button. */
  needsReview: boolean;
}

/**
 * Reads the arrival from the saved intake result, or from the preview links
 * Diana uses to check the page without filling in the form:
 *   ?preview=qualified            the "you qualify" bar, no name
 *   ?preview=qualified&review=1   the bar plus the "needs review" note
 *   ?preview=1                    the page as a direct visitor sees it
 * A preview never carries a name, so no personal data goes in the URL.
 */
export function readOrderArrival(session: IntakeSession | null, search: string): OrderArrival {
  const params = new URLSearchParams(search);
  const preview = params.get("preview");
  if (preview === "qualified") {
    return { fromForm: true, firstName: "", needsReview: params.get("review") === "1" };
  }
  if (preview !== null || session?.outcome !== "qualified") {
    return { fromForm: false, firstName: "", needsReview: false };
  }
  return { fromForm: true, firstName: session.firstName.trim(), needsReview: session.needsReview };
}

/* ───────────────────────────── Draft (returning) ────────────────────────── */

/**
 * Remember an unfinished application on this device so a returning visitor
 * does not retype their details. This copy lasts for days, so callers pass
 * the contact fields only (see progressStore.ts): health answers never go in
 * it. With settings.draftMaxAgeDays at 0 nothing is kept, and a copy left by
 * an earlier visit is removed.
 */
export function saveIntakeDraft(answers: IntakeAnswers): void {
  if (intake.settings.draftMaxAgeDays <= 0) {
    clearIntakeDraft();
    return;
  }
  // Unchanged details keep their first date. Otherwise just opening the page
  // again would make an old draft look new, and it would never expire.
  const stored = parseJson(storageGet("local", INTAKE_DRAFT_KEY));
  if (
    isRecord(stored) &&
    typeof stored.savedAt === "number" &&
    JSON.stringify(stored.answers) === JSON.stringify(answers)
  ) {
    return;
  }
  const draft: IntakeDraft = { answers, savedAt: Date.now() };
  storageSet("local", INTAKE_DRAFT_KEY, JSON.stringify(draft));
}

/** null when there is no draft, it is empty, or it is older than settings.draftMaxAgeDays. */
export function readIntakeDraft(): IntakeDraft | null {
  if (typeof window === "undefined") return null;
  const parsed = parseJson(storageGet("local", INTAKE_DRAFT_KEY));
  if (!isRecord(parsed) || !isRecord(parsed.answers)) return null;

  const savedAt = typeof parsed.savedAt === "number" ? parsed.savedAt : 0;
  const maxAgeMs = Math.max(0, intake.settings.draftMaxAgeDays) * 24 * 60 * 60 * 1000;
  if (!savedAt || Date.now() - savedAt > maxAgeMs) {
    clearIntakeDraft();
    return null;
  }

  const answers: IntakeAnswers = {};
  for (const [key, value] of Object.entries(parsed.answers)) {
    if (typeof value === "string" || (typeof value === "number" && Number.isFinite(value))) {
      answers[key] = value;
    } else if (Array.isArray(value)) {
      answers[key] = value.filter((x): x is string => typeof x === "string");
    }
  }
  delete answers[HONEYPOT_FIELD];
  if (Object.keys(answers).length === 0) return null;

  return { answers, savedAt };
}

export function clearIntakeDraft(): void {
  storageRemove("local", INTAKE_DRAFT_KEY);
}

/* ─────────────────────────── Stripe Payment Links ───────────────────────── */

function stripeSafe(value: string, max: number): string {
  return value
    .trim()
    .replace(/[^A-Za-z0-9_-]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, max);
}

/**
 * Add the documented Stripe Payment Link URL parameters:
 *  • prefilled_email      the applicant's email (they can still change it)
 *  • client_reference_id  the opaque lead id (letters, digits, - and _ only)
 *  • utm_source / utm_medium / utm_campaign / utm_content
 *
 * Returns "" for an empty link, and for anything that is not a usable https
 * address, so callers can do
 *   const href = withPrefill(option.stripeUrl);  if (!href) show pendingStripeNote
 * A link pasted without "https://" in front is repaired.
 * `session` defaults to readIntakeSession(); pass null to add nothing personal.
 * Nothing else about the person is ever added to the URL.
 */
export function withPrefill(
  stripeUrl: string,
  session: IntakeSession | null = readIntakeSession(),
): string {
  const base = (stripeUrl ?? "").trim();
  if (!base) return "";

  try {
    // "buy.stripe.com/abc" (no scheme) would otherwise be treated as a page on this site.
    const candidate = /^[a-z][a-z0-9+.-]*:/i.test(base) ? base : `https://${base}`;
    const url = new URL(candidate);
    if (url.protocol !== "https:") return "";

    if (session?.email && EMAIL_RE.test(session.email)) {
      url.searchParams.set("prefilled_email", session.email);
    }
    if (session?.leadId && LEAD_ID_RE.test(session.leadId)) {
      url.searchParams.set("client_reference_id", session.leadId);
    }

    const attribution = readStoredAttribution();
    if (attribution) {
      for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_content"] as const) {
        const value = stripeSafe(attribution[key], 150);
        if (value) url.searchParams.set(key, value);
      }
    }
    return url.toString();
  } catch {
    return "";
  }
}

/* ──────────────────────────────── Analytics ─────────────────────────────── */

export type FunnelEventName =
  | "intake_start"
  | "intake_submit"
  | "intake_error"
  | "checkout_view"
  | "checkout_click"
  | "booking_view";

/**
 * Optional funnel analytics hook. The site ships no analytics today, so this
 * is a no-op unless a tag manager has defined window.dataLayer.
 *
 * Only pass structural values: a count, a transport name, a button placement.
 * NEVER pass an answer, a name, an email, a phone number, or the outcome
 * (the outcome is derived from health answers).
 */
export function trackFunnelEvent(
  name: FunnelEventName,
  params: Record<string, string | number | boolean> = {},
): void {
  try {
    const layer = (window as unknown as { dataLayer?: unknown[] }).dataLayer;
    if (Array.isArray(layer)) layer.push({ event: name, ...params });
  } catch {
    /* ignore */
  }
}
