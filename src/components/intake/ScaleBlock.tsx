import { memo, type CSSProperties } from "react";
import type { IntakeBlock } from "@/content/content";
import type { IntakeAnswers } from "@/lib/intake";
import { cn } from "@/lib/utils";
import InlineError from "./InlineError";
import {
  BlockHelp,
  blockClasses,
  blockDomId,
  choiceFocusClasses,
  choiceInputClasses,
  choiceTapClasses,
  describedBy,
  errorDomId,
  helpDomId,
  questionClasses,
  questionDomId,
  sameBlockProps,
} from "./blockParts";

interface ScaleBlockProps {
  block: IntakeBlock;
  answers: IntakeAnswers;
  error: string;
  onPick: (block: IntakeBlock, value: number) => void;
}

/**
 * A number scale (0 to 10 by default) as a fieldset of native radios, drawn
 * as a row of large number cells. On a phone the cells sit in two rows so
 * each one is an easy tap (see .intake-scale in intake.css).
 */
function ScaleBlock({ block, answers, error, onPick }: ScaleBlockProps) {
  const current = answers[block.id];
  const numbers = Array.from({ length: block.max - block.min + 1 }, (_, i) => block.min + i);
  const count = numbers.length;
  const rows = Math.max(1, Math.ceil(count / 6));
  const cols = Math.ceil(count / rows);
  const helpId = helpDomId(block.id);
  const errorId = errorDomId(block.id);

  const gridStyle = {
    "--scale-count": count,
    "--scale-cols": cols,
    "--scale-last-span": cols * rows - count + 1,
  } as CSSProperties;

  return (
    <fieldset
      id={blockDomId(block.id)}
      role="radiogroup"
      aria-labelledby={questionDomId(block.id)}
      aria-describedby={describedBy(block.help && helpId)}
      aria-required={block.required || undefined}
      aria-invalid={error !== "" || undefined}
      className={blockClasses}
    >
      <legend id={questionDomId(block.id)} className={questionClasses}>
        {block.question}
      </legend>
      <BlockHelp id={helpId}>{block.help}</BlockHelp>

      <div className="intake-scale mt-4" style={gridStyle}>
        {numbers.map((n) => {
          const checked = current === n;
          const endLabel = n === block.min ? block.minLabel : n === block.max ? block.maxLabel : "";
          return (
            <label
              key={n}
              className={cn("relative block cursor-pointer select-none", choiceTapClasses)}
            >
              <input
                type="radio"
                name={block.id}
                value={n}
                checked={checked}
                onChange={() => onPick(block, n)}
                aria-label={endLabel ? `${n}, ${endLabel}` : String(n)}
                aria-describedby={describedBy(error !== "" && errorId)}
                className={choiceInputClasses}
              />
              <span
                aria-hidden="true"
                className={cn(
                  // No transition, and hover for real pointers only (see ChoiceChip).
                  "flex h-12 items-center justify-center rounded-lg border text-base font-medium tabular-nums",
                  choiceFocusClasses,
                  checked
                    ? // The picked number is shown by colour alone, so keep a
                      // system highlight when the browser forces its own colours.
                      "border-steel bg-steel text-bone forced-colors:[forced-color-adjust:none] forced-colors:border-[Highlight] forced-colors:bg-[Highlight] forced-colors:text-[HighlightText]"
                    : "border-ink/20 bg-white text-ink [@media(hover:hover)]:peer-hover:border-steel/70",
                )}
              >
                {n}
              </span>
            </label>
          );
        })}
      </div>

      {(block.minLabel || block.maxLabel) && (
        <div
          aria-hidden="true"
          className="mt-2 flex items-start justify-between gap-4 text-sm text-umber"
        >
          <span>
            {block.min} {block.minLabel}
          </span>
          <span className="text-right">
            {block.max} {block.maxLabel}
          </span>
        </div>
      )}
      {/* Under the choices, not above them: an error that clears on a tap
          must not move the choice under the finger. */}
      <InlineError id={errorId} className="mt-3">
        {error}
      </InlineError>
    </fieldset>
  );
}

export default memo(ScaleBlock, sameBlockProps);
