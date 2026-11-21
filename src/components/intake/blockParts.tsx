import { useState, type KeyboardEvent, type ReactNode } from "react";
import { Check } from "lucide-react";
import { intake, type IntakeBlock } from "@/content/content";
import type { IntakeAnswers } from "@/lib/intake";
import { cn } from "@/lib/utils";

/**
 * Small shared pieces of the /apply blocks: the DOM ids that tie a question
 * to its help line and its error, the question heading style, and the
 * tappable chip used for every choice.
 */

/** The outer element of a block. The form scrolls to it when it needs attention. */
export const blockDomId = (blockId: string) => `intake-block-${blockId}`;
/** A text input or textarea, by answers key. */
export const fieldDomId = (key: string) => `intake-field-${key}`;
/** The question text (the legend) of a pick-one block, which names its radio group. */
export const questionDomId = (blockId: string) => `intake-question-${blockId}`;
export const helpDomId = (key: string) => `intake-help-${key}`;
export const errorDomId = (key: string) => `intake-error-${key}`;

/** Space-separated ids for aria-describedby (undefined when there are none). */
export function describedBy(...ids: (string | false | undefined)[]): string | undefined {
  return ids.filter(Boolean).join(" ") || undefined;
}

/**
 * Enter in a one-line box must not send the whole form (the page would jump
 * to the first unanswered question). It moves on to `nextId` when there is
 * one, and otherwise just closes the keyboard.
 */
export function blurOnEnter(event: KeyboardEvent<HTMLInputElement>, nextId?: string) {
  if (event.key !== "Enter") return;
  event.preventDefault();
  const next = nextId ? document.getElementById(nextId) : null;
  if (next) next.focus();
  else event.currentTarget.blur();
}

/**
 * The question itself, in the body face: the display serif is kept for the
 * page heading alone, so the form reads as one heading and a list of
 * questions. Used on a legend or a label.
 */
export const questionClasses =
  "block w-full p-0 font-sans text-lg font-semibold leading-snug text-ink md:text-xl";

/**
 * A block's outer element class. scroll-mt keeps the question clear of the
 * sticky funnel header when the form scrolls to it; min-w-0 stops a fieldset
 * from growing wider than a phone screen.
 */
export const blockClasses = "min-w-0 scroll-mt-28";

export function BlockHelp({ id, children }: { id: string; children: string }) {
  if (!children) return null;
  return (
    <p id={id} className="mt-1.5 text-[0.9375rem] leading-normal text-umber">
      {children}
    </p>
  );
}

/**
 * On a phone: no grey tap flash over the card (the card's own checked state
 * is the feedback), and no double-tap zoom when two choices are tapped fast.
 */
export const choiceTapClasses = "[-webkit-tap-highlight-color:transparent] touch-manipulation";

/**
 * The real checkbox or radio of a choice: invisible, and the same size as the
 * card drawn after it (its "peer").
 */
export const choiceInputClasses = `peer absolute inset-0 m-0 h-full w-full cursor-pointer appearance-none opacity-0 scroll-mb-6 scroll-mt-28 ${choiceTapClasses}`;

/**
 * Focus ring on the card, for keyboards only (peer-focus-visible). A ring on
 * every tap jumped from card to card and read as flicker. When the form moves
 * focus by script after a tap on the send button, the block's error line
 * marks the spot instead.
 */
export const choiceFocusClasses =
  "peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-steel";

/**
 * Do two renders of a block show the same thing? Compares only the answers
 * (and errors) that belong to the block, so typing in one question does not
 * re-render the others. Used as the memo() check of every block component;
 * the handlers the form passes down are stable (see IntakeForm.tsx).
 */
export function sameBlockProps<
  T extends {
    block: IntakeBlock;
    answers: IntakeAnswers;
    error?: string;
    errors?: Record<string, string>;
  },
>(previous: T, next: T): boolean {
  const { block } = next;
  if (previous.block !== block || previous.error !== next.error) return false;
  const answerKeys = [
    block.id,
    block.other?.fieldId,
    block.detail?.fieldId,
    // The detail box's example depends on the health answers.
    block.detail?.examples.length ? intake.eligibility.flagsField : undefined,
    ...block.fields.map((field) => field.id),
  ];
  for (const key of answerKeys) {
    if (key && previous.answers[key] !== next.answers[key]) return false;
  }
  for (const field of block.fields) {
    if (previous.errors?.[field.id] !== next.errors?.[field.id]) return false;
  }
  // Anything else (the handlers) is compared by identity.
  for (const key of Object.keys(next) as (keyof T)[]) {
    if (key === "answers" || key === "errors") continue;
    if (previous[key] !== next[key]) return false;
  }
  return true;
}

/**
 * Wrapper for something that appears because of an earlier answer (the
 * clearance question, the "Something else" box). It fades in once, without
 * animating height (see .intake-reveal in intake.css). `animate` is read only
 * when the wrapper first appears: pass false for anything already on screen
 * when the page loads, so restored answers never replay the fade.
 */
export function Reveal({ animate, children }: { animate: boolean; children: ReactNode }) {
  const [fade] = useState(animate);
  return <div className={fade ? "intake-reveal" : undefined}>{children}</div>;
}

interface ChoiceChipProps {
  type: "checkbox" | "radio";
  name: string;
  value: string;
  label: string;
  checked: boolean;
  /** The block has an error and this chip is not the chosen one. */
  invalid?: boolean;
  /** A lone tick box that must be ticked (the consent). Groups say it on their wrapper. */
  required?: boolean;
  describedBy?: string;
  onChange: () => void;
  className?: string;
}

/**
 * One tappable choice. A real checkbox or radio, fully transparent, is
 * stretched over the whole card, so keyboards and screen readers get native
 * behaviour, the whole card is the tap target (at least 52px tall), and the
 * browser scrolls the full card into view when the keyboard lands on it
 * (the scroll margin keeps it clear of the sticky header).
 */
export function ChoiceChip({
  type,
  name,
  value,
  label,
  checked,
  invalid = false,
  required = false,
  describedBy: describedByIds,
  onChange,
  className,
}: ChoiceChipProps) {
  return (
    <label className={cn("relative block cursor-pointer select-none", choiceTapClasses, className)}>
      <input
        type={type}
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        aria-describedby={describedByIds}
        aria-required={required || undefined}
        // aria-invalid is not allowed on a radio: the group carries it instead.
        aria-invalid={(type === "checkbox" && invalid) || undefined}
        className={choiceInputClasses}
      />
      <span
        className={cn(
          // No transition on purpose: the border, the inner line and the tick
          // change together in one frame. Hover is for real pointers only, so
          // it cannot stick to a card after a tap on a phone.
          "flex h-full min-h-[3.25rem] items-start gap-3 rounded-lg border bg-white px-4 py-3.5 text-left text-base leading-snug text-ink",
          choiceFocusClasses,
          checked
            ? "border-steel shadow-[inset_0_0_0_1px_var(--steel)]"
            : "border-ink/20 [@media(hover:hover)]:peer-hover:border-ink/40",
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            "mt-px flex h-5 w-5 flex-none items-center justify-center border",
            type === "radio" ? "rounded-full" : "rounded",
            checked ? "border-steel bg-steel text-bone" : "border-ink/50 bg-white",
          )}
        >
          {checked && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
        </span>
        <span className="min-w-0 flex-1">{label}</span>
      </span>
    </label>
  );
}
