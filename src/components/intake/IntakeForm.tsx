import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Loader2, Lock } from "lucide-react";
import {
  fillTokens,
  instagramUrl,
  intake,
  mailtoHref,
  type IntakeBlock,
  type IntakeContactField,
} from "@/content/content";
import {
  HONEYPOT_FIELD,
  answerList,
  outcomePath,
  submitIntake,
  trackFunnelEvent,
  validateAll,
  validateContactField,
  visibleBlocks,
  withoutHiddenAnswers,
  type IntakeAnswers,
  type IntakeErrors,
} from "@/lib/intake";
import { buttonClasses } from "@/components/ui/button";
import ChoiceBlock from "./ChoiceBlock";
import ConsentBlock from "./ConsentBlock";
import ContactBlock from "./ContactBlock";
import InlineError from "./InlineError";
import ScaleBlock from "./ScaleBlock";
import TextBlock from "./TextBlock";
import { Reveal, blockDomId, fieldDomId } from "./blockParts";
import { clearProgress, loadProgress, saveProgress } from "./progressStore";

/** One thing that still needs an answer: the error's key and the block it sits in. */
interface InvalidItem {
  key: string;
  blockId: string;
}

/** The errors that belong to blocks on screen, in the order they appear on the page. */
function invalidItems(errors: IntakeErrors, blocks: IntakeBlock[]): InvalidItem[] {
  return blocks.flatMap((block) => {
    const keys = block.type === "contact" ? block.fields.map((field) => field.id) : [block.id];
    return keys.filter((key) => errors[key]).map((key) => ({ key, blockId: block.id }));
  });
}

const prefersReducedMotion = (): boolean =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** How long after the last change the answers are written to storage. */
const SAVE_DELAY_MS = 400;

/**
 * A function whose identity never changes but which always runs the latest
 * version passed in. It lets the memoised blocks keep the same handlers from
 * render to render, so a change in one question re-renders that block only.
 */
function useStable<A extends unknown[], R>(fn: (...args: A) => R): (...args: A) => R {
  const latest = useRef(fn);
  latest.current = fn;
  return useCallback((...args: A) => latest.current(...args), []);
}

/**
 * The whole /apply form on one scrolling page: a short intro, the blocks from
 * src/content/intake.json in order, and one send button.
 *
 *  • Nothing is checked while someone types. The email is checked when they
 *    leave the field; everything else when they press the button.
 *  • The clearance block only exists while a screening box is ticked. Its
 *    answers are dropped the moment it goes away (withoutHiddenAnswers).
 *  • Answers are saved shortly after they change (progressStore.ts), and at
 *    once when the page is hidden or left, so a refresh loses nothing. They
 *    are read back before the first render, so nothing pops in afterwards.
 *  • Each block is memoised (sameBlockProps in blockParts.tsx): typing in one
 *    question does not re-render the others.
 *  • Screen readers get one polite live region for everything that changes
 *    without a page load (cleared ticks, the clearance question coming and
 *    going, an email that needs a look, the count of answers to fix).
 */
export default function IntakeForm() {
  const navigate = useNavigate();
  const { intro, labels, errors: copy } = intake;

  const [answers, setAnswers] = useState<IntakeAnswers>(() => loadProgress() ?? {});
  const [errors, setErrors] = useState<IntakeErrors>({});
  const [attempted, setAttempted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  const started = useRef(false);
  // Set the instant a send starts. `busy` only updates on the next render, so
  // a fast double tap would otherwise send the application twice.
  const sending = useRef(false);
  const announceTimer = useRef<number>();
  const saveTimer = useRef<number>();
  // The answers still waiting to be written (null = storage is up to date).
  const unsaved = useRef<IntakeAnswers | null>(null);

  const blocks = visibleBlocks(answers);
  const invalid = invalidItems(errors, blocks);

  const flushSave = useStable(() => {
    window.clearTimeout(saveTimer.current);
    if (unsaved.current) saveProgress(unsaved.current);
    unsaved.current = null;
  });

  // Not on every keystroke: once typing or tapping pauses.
  useEffect(() => {
    unsaved.current = answers;
    window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(flushSave, SAVE_DELAY_MS);
  }, [answers, flushSave]);

  // A refresh, a closed tab or a link away must not lose the last change.
  useEffect(() => {
    const onPageHide = () => flushSave();
    const onVisibility = () => {
      if (document.visibilityState === "hidden") flushSave();
    };
    window.addEventListener("pagehide", onPageHide);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("pagehide", onPageHide);
      document.removeEventListener("visibilitychange", onVisibility);
      flushSave();
    };
  }, [flushSave]);

  useEffect(() => () => window.clearTimeout(announceTimer.current), []);

  /** Say something to screen readers. Emptied first so a repeat is read again. */
  function announce(message: string) {
    window.clearTimeout(announceTimer.current);
    setAnnouncement("");
    announceTimer.current = window.setTimeout(() => setAnnouncement(message), 60);
  }

  /**
   * Apply a change to the answers. Clears the errors it answers, and the
   * errors of any block the change takes off the page, so a question that
   * comes back later does not arrive already marked wrong.
   */
  function change(mutate: (draft: IntakeAnswers) => void, ...answeredKeys: string[]) {
    if (!started.current) {
      started.current = true;
      trackFunnelEvent("intake_start");
    }
    setAnswers((previous) => {
      const draft = { ...previous };
      mutate(draft);
      return withoutHiddenAnswers(draft);
    });

    const after = { ...answers };
    mutate(after);
    const shown = visibleBlocks(after);
    const hiddenKeys = intake.blocks
      .filter((block) => !shown.includes(block))
      .flatMap((block) => [block.id, ...block.fields.map((field) => field.id)]);
    const settled = [...answeredKeys, ...hiddenKeys].filter((key) => errors[key]);
    if (settled.length > 0) {
      setErrors((previous) => {
        const next = { ...previous };
        for (const key of settled) delete next[key];
        return next;
      });
    }
  }

  function setText(key: string, value: string) {
    change((draft) => {
      if (value === "") delete draft[key];
      else draft[key] = value;
    }, key);
  }

  /** A chip was tapped on a "tick all that apply" or "pick one" block. */
  function selectOption(block: IntakeBlock, value: string) {
    if (block.type === "single") {
      change((draft) => {
        draft[block.id] = value;
      }, block.id);
      return;
    }

    const current = answerList(answers, block.id);
    const { exclusive } = block;
    let picked: string[];
    let message = "";

    if (current.includes(value)) {
      picked = current.filter((item) => item !== value);
    } else if (exclusive !== "" && value === exclusive) {
      // "No medical conditions" stands alone: it replaces whatever was ticked.
      picked = [value];
      if (current.length > 0) message = labels.exclusiveCleared;
    } else {
      picked = [...current.filter((item) => item !== exclusive), value];
      if (exclusive !== "" && current.includes(exclusive)) {
        const option = block.options.find((item) => item.value === exclusive)?.label ?? "";
        message = fillTokens(labels.exclusiveUnticked, { option });
      }
    }

    // Keep the ticks in the order the options are listed, whatever the tap order.
    const ordered = block.options.map((option) => option.value).filter((item) => picked.includes(item));
    const { other } = block;
    const apply = (draft: IntakeAnswers) => {
      if (ordered.length > 0) draft[block.id] = ordered;
      else delete draft[block.id];
      if (other && !ordered.includes(other.optionValue)) delete draft[other.fieldId];
    };

    // A tick can add the clearance question under this one, or take it away.
    // That happens off to the side for a screen reader, so say it.
    const after = { ...answers };
    apply(after);
    const asksClearance = (list: IntakeBlock[]) =>
      list.some((item) => item.id === intake.eligibility.clearanceField);
    const willAsk = asksClearance(visibleBlocks(after));
    if (willAsk !== asksClearance(blocks)) {
      const note = willAsk ? labels.followUpShown : labels.followUpHidden;
      message = [message, note].filter(Boolean).join(" ");
    }

    change(apply, block.id);
    if (message) announce(message);
  }

  /**
   * Leaving the email field checks it, but only once something has been
   * typed: an empty field is left exactly as it was (no new error, and a
   * "please fill this in" from the send button stays put).
   */
  function handleContactBlur(field: IntakeContactField) {
    if (field.type !== "email") return;
    const stored = answers[field.id];
    const value = typeof stored === "string" ? stored : "";
    if (value.trim() === "") return;
    const message = validateContactField(field, value);
    if (message === (errors[field.id] ?? "")) return;
    setErrors((previous) => {
      const next = { ...previous };
      if (message) next[field.id] = message;
      else delete next[field.id];
      return next;
    });
    // The error line itself is silent (see InlineError), so say it here.
    if (message) announce(`${field.label}: ${message}`);
  }

  /** Bring the first unanswered block into view and put the keyboard on it. */
  function goTo(item: InvalidItem) {
    const root = document.getElementById(blockDomId(item.blockId));
    if (!root) return;
    const control =
      document.getElementById(fieldDomId(item.key)) ??
      root.querySelector<HTMLElement>("input, textarea");
    control?.focus({ preventScroll: true });
    // The block's scroll margin keeps the question clear of the sticky header.
    root.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending.current) return;

    const found = validateAll(answers);
    const toFix = invalidItems(found, blocks);
    setErrors(found);
    setAttempted(true);
    setFailed(false);

    if (toFix.length > 0) {
      trackFunnelEvent("intake_error", { kind: "validation", count: toFix.length });
      announce(summaryText(toFix.length));
      goTo(toFix[0]);
      return;
    }

    sending.current = true;
    setBusy(true);
    try {
      const result = await submitIntake(answers);
      // Count real sends only: not a dev preview, and not a bot that was ignored.
      if (result.transport === "sheet" || result.transport === "email") {
        trackFunnelEvent("intake_submit");
      }
      // Drop any save still waiting, or it would bring the answers back.
      window.clearTimeout(saveTimer.current);
      unsaved.current = null;
      clearProgress();
      navigate(outcomePath(result.outcome), { replace: true });
    } catch {
      sending.current = false;
      setBusy(false);
      setFailed(true);
      trackFunnelEvent("intake_error", { kind: "send" });
    }
  }

  const summaryText = (count: number): string =>
    count === 1 ? copy.summaryOne : fillTokens(copy.summaryMany, { count });

  const honeypot = answers[HONEYPOT_FIELD];
  const linkClasses = "inline-flex min-h-11 items-center font-semibold underline underline-offset-4";

  // The handlers the blocks receive. Stable, so memo() on the blocks holds.
  const onSelect = useStable(selectOption);
  const onText = useStable(setText);
  const onContactBlur = useStable(handleContactBlur);
  const onPick = useStable((block: IntakeBlock, value: number) =>
    change((draft) => {
      draft[block.id] = value;
    }, block.id),
  );
  const onToggle = useStable((block: IntakeBlock, ticked: boolean) =>
    change((draft) => {
      if (ticked) draft[block.id] = "yes";
      else delete draft[block.id];
    }, block.id),
  );

  function renderBlock(block: IntakeBlock) {
    const error = errors[block.id] ?? "";
    switch (block.type) {
      case "multi":
      case "single":
        return (
          <ChoiceBlock
            block={block}
            answers={answers}
            error={error}
            onSelect={onSelect}
            onText={onText}
          />
        );
      case "scale":
        return <ScaleBlock block={block} answers={answers} error={error} onPick={onPick} />;
      case "longtext":
        return <TextBlock block={block} answers={answers} error={error} onText={onText} />;
      case "contact":
        return (
          <ContactBlock
            block={block}
            answers={answers}
            errors={errors}
            onText={onText}
            onBlur={onContactBlur}
          />
        );
      case "consent":
        return <ConsentBlock block={block} answers={answers} error={error} onToggle={onToggle} />;
    }
  }

  return (
    <div className="mx-auto w-full max-w-[35rem] px-5 pb-16 pt-6 md:pb-24 md:pt-10">
      <header>
        {(intro.eyebrow || intro.timeEstimate) && (
          <p className="eyebrow mb-3 flex flex-wrap items-center gap-x-3 gap-y-1">
            {intro.eyebrow && <span>{intro.eyebrow}</span>}
            {intro.timeEstimate && (
              <span className="font-medium normal-case tracking-normal text-umber">
                {intro.timeEstimate}
              </span>
            )}
          </p>
        )}
        <h1 className="font-sans text-[1.75rem] font-semibold leading-[1.2] tracking-tight text-ink md:text-4xl">
          {intro.heading}
        </h1>
        {intro.subline && (
          <p className="mt-3 text-base leading-relaxed text-umber">{intro.subline}</p>
        )}
        {intro.points.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-umber">
            {intro.points.map((point) => (
              <li key={point} className="flex items-center gap-1.5">
                <Check aria-hidden="true" className="h-4 w-4 flex-none text-steel" />
                {point}
              </li>
            ))}
          </ul>
        )}
      </header>

      <form noValidate autoComplete="on" onSubmit={handleSubmit} className="mt-8 md:mt-10">
        {/* Spam trap. People never see or reach it; a bot that fills it is ignored.
            The data attributes tell password managers to leave it alone, so
            autofill can never make a real person look like a bot. */}
        <div aria-hidden="true" className="sr-only">
          {/* Named with aria-label, not text, so nothing shows when the page is copied. */}
          <input
            type="text"
            aria-label={labels.honeypotLabel}
            name={HONEYPOT_FIELD}
            tabIndex={-1}
            autoComplete="off"
            data-1p-ignore="true"
            data-lpignore="true"
            data-bwignore="true"
            data-form-type="other"
            value={typeof honeypot === "string" ? honeypot : ""}
            onChange={(event) =>
              setAnswers((previous) => ({ ...previous, [HONEYPOT_FIELD]: event.target.value }))
            }
          />
        </div>

        <div className="space-y-11 md:space-y-12">
          {blocks.map((block, index) => {
            const body = (
              <div key={block.id}>
                {labels.questionCount && (
                  // For the eye only: a quiet "2 of 7" so the end is in sight.
                  <p aria-hidden="true" className="mb-1.5 text-sm font-medium tabular-nums text-steel">
                    {fillTokens(labels.questionCount, {
                      current: index + 1,
                      total: blocks.length,
                    })}
                  </p>
                )}
                {renderBlock(block)}
              </div>
            );
            // The clearance block arrives because of an earlier answer, so it
            // fades in. Not when it is already there as the page loads:
            // `started` is still false then.
            return block.id === intake.eligibility.clearanceField ? (
              <Reveal key={block.id} animate={started.current}>
                {body}
              </Reveal>
            ) : (
              body
            );
          })}
        </div>

        <div className="pt-10">
          {attempted && invalid.length > 0 && (
            <InlineError className="mb-4 mt-0">{summaryText(invalid.length)}</InlineError>
          )}

          {failed && (
            <div
              role="alert"
              className="mb-4 rounded-lg border border-red-800/30 bg-white px-4 py-3 text-sm text-ink"
            >
              <p className="font-semibold text-red-900">{copy.submitFailed}</p>
              <p className="mt-1">{copy.fallbackText}</p>
              <p className="flex flex-wrap gap-x-5">
                {instagramUrl && (
                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={linkClasses}
                  >
                    {copy.fallbackInstagramLabel}
                  </a>
                )}
                <a href={mailtoHref()} className={linkClasses}>
                  {copy.fallbackEmailLabel}
                </a>
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            aria-busy={busy}
            // Keep focus where it is on press: a blur here can add a line
            // above the button and move it out from under the pointer, which
            // loses the click. The send still checks every field.
            onMouseDown={(event) => event.preventDefault()}
            // Stays solid while sending: the spinner and the label say it,
            // and a whole button fading at that moment reads as a flicker.
            className={buttonClasses("primary", "min-h-14 w-full text-base disabled:opacity-100")}
          >
            {busy && <Loader2 aria-hidden="true" className="h-5 w-5 animate-spin" />}
            {busy ? labels.submitting : failed ? copy.retryLabel : labels.submit}
          </button>
          {labels.submitNote && (
            <p className="mt-3 flex items-start justify-center gap-1.5 text-sm leading-relaxed text-umber">
              <Lock aria-hidden="true" className="mt-1 h-3.5 w-3.5 flex-none text-steel" />
              <span>{labels.submitNote}</span>
            </p>
          )}
        </div>

        <p aria-live="polite" className="sr-only">
          {announcement}
        </p>
      </form>
    </div>
  );
}
