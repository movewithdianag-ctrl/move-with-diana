/**
 * Where an unfinished application lives between page loads.
 *
 * Two copies, on purpose:
 *  • sessionStorage (this tab): what makes a refresh, or coming back with the
 *    browser Back button, show every answer intact. It works even if the
 *    longer-lived draft is switched off (draftMaxAgeDays: 0). It is gone when
 *    the tab closes.
 *  • localStorage (the draft in src/lib/intake.ts): lets someone who closed
 *    the tab come back within settings.draftMaxAgeDays. It holds the contact
 *    fields ONLY (name, email, phone). Health and screening answers are never
 *    written to this long-lived copy, so the next person on a shared device
 *    cannot read them.
 *
 * Both are cleared the moment the application is sent. The honeypot value is
 * never stored.
 */
import {
  clearIntakeDraft,
  readIntakeDraft,
  saveIntakeDraft,
  withoutHiddenAnswers,
  type IntakeAnswers,
} from "@/lib/intake";
import { intake } from "@/content/content";

const PROGRESS_KEY = "mwd-intake-progress";

/** Answer keys that may go in the long-lived draft: the contact block's fields. */
const CONTACT_FIELD_IDS: ReadonlySet<string> = new Set(
  intake.blocks.flatMap((block) => block.fields.map((field) => field.id)),
);

function contactOnly(answers: IntakeAnswers): IntakeAnswers {
  const kept: IntakeAnswers = {};
  for (const [key, value] of Object.entries(answers)) {
    if (CONTACT_FIELD_IDS.has(key)) kept[key] = value;
  }
  return kept;
}

const hasAny = (answers: IntakeAnswers): boolean => Object.keys(answers).length > 0;

/**
 * Keep only what today's form can show: answers to questions that exist, in
 * the right shape, and (for a choice) options that exist. Anything else, such
 * as a copy saved by an older version of the form, is dropped, and so are the
 * honeypot and the answers of a block that is hidden.
 */
function cleanAnswers(raw: unknown): IntakeAnswers {
  const answers: IntakeAnswers = {};
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) return answers;
  const stored = raw as Record<string, unknown>;

  for (const block of intake.blocks) {
    const known = block.options.map((option) => option.value);
    const value = stored[block.id];

    if (block.type === "multi") {
      const picked = Array.isArray(value) ? known.filter((option) => value.includes(option)) : [];
      if (picked.length > 0) answers[block.id] = picked;
    } else if (block.type === "single") {
      if (typeof value === "string" && known.includes(value)) answers[block.id] = value;
    } else if (block.type === "scale") {
      if (typeof value === "number" && Number.isFinite(value)) answers[block.id] = value;
    } else if (block.type === "longtext" || block.type === "consent") {
      if (typeof value === "string" && value !== "") answers[block.id] = value;
    }

    const textKeys = [
      block.other?.fieldId,
      block.detail?.fieldId,
      ...block.fields.map((field) => field.id),
    ];
    for (const key of textKeys) {
      const text = key ? stored[key] : undefined;
      if (key && typeof text === "string" && text !== "") answers[key] = text;
    }
  }

  return withoutHiddenAnswers(answers);
}

function readSession(): IntakeAnswers | null {
  try {
    const raw = window.sessionStorage.getItem(PROGRESS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { answers?: unknown } | null;
    if (!parsed || typeof parsed !== "object") return null;
    const answers = cleanAnswers(parsed.answers);
    return hasAny(answers) ? answers : null;
  } catch {
    return null;
  }
}

/** Saved answers for this visitor, or null when there is nothing to restore. */
export function loadProgress(): IntakeAnswers | null {
  if (typeof window === "undefined") return null;
  const draft = readIntakeDraft();
  // contactOnly() again on the way in: a draft saved by an older build may
  // still hold health answers, and those are not restored.
  const draftAnswers = draft ? contactOnly(cleanAnswers(draft.answers)) : {};
  // Such a legacy draft is also rewritten on the spot (contact fields only),
  // so the health answers do not sit on the device until it expires.
  if (draft && Object.keys(draft.answers).some((key) => !CONTACT_FIELD_IDS.has(key))) {
    if (hasAny(draftAnswers)) saveIntakeDraft(draftAnswers);
    else clearIntakeDraft();
  }
  const session = readSession();
  if (session) return session;
  return hasAny(draftAnswers) ? draftAnswers : null;
}

/** Call on every change. Never throws (storage can be blocked or full). */
export function saveProgress(answers: IntakeAnswers): void {
  const clean = cleanAnswers(answers);
  if (!hasAny(clean)) {
    clearProgress();
    return;
  }
  try {
    window.sessionStorage.setItem(PROGRESS_KEY, JSON.stringify({ answers: clean }));
  } catch {
    /* ignore */
  }
  // Long-lived copy: contact fields only.
  saveIntakeDraft(contactOnly(clean));
}

export function clearProgress(): void {
  try {
    window.sessionStorage.removeItem(PROGRESS_KEY);
  } catch {
    /* ignore */
  }
  clearIntakeDraft();
}
