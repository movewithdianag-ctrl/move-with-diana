import { memo, useEffect, useRef } from "react";
import { intake, type IntakeBlock } from "@/content/content";
import { answerList, answerText, type IntakeAnswers } from "@/lib/intake";
import { Input, Label, Textarea } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import InlineError from "./InlineError";
import {
  BlockHelp,
  ChoiceChip,
  Reveal,
  blockClasses,
  blockDomId,
  blurOnEnter,
  describedBy,
  errorDomId,
  fieldDomId,
  helpDomId,
  questionClasses,
  questionDomId,
  sameBlockProps,
} from "./blockParts";

interface ChoiceBlockProps {
  block: IntakeBlock;
  answers: IntakeAnswers;
  error: string;
  /** A chip was tapped. The form decides what that means (toggle, exclusive, pick). */
  onSelect: (block: IntakeBlock, value: string) => void;
  /** A text box on this block changed ("Something else", or the optional detail). */
  onText: (key: string, value: string) => void;
}

/**
 * "Tick all that apply" (multi) and "pick one" (single), as a fieldset of
 * native checkboxes or radios. A multi block can carry a "Something else"
 * text box; a single block can carry one optional text box under the choices.
 */
function ChoiceBlock({ block, answers, error, onSelect, onText }: ChoiceBlockProps) {
  const multi = block.type === "multi";
  const picked = multi ? answerList(answers, block.id) : [answerText(answers, block.id)];
  const helpId = helpDomId(block.id);
  const errorId = errorDomId(block.id);
  const { other, detail } = block;
  const detailValue = detail ? rawText(answers, detail.fieldId) : "";
  // False during the first render only: a "Something else" box that is
  // already open when the page loads must not fade in.
  const settled = useRef(false);
  useEffect(() => {
    settled.current = true;
  }, []);

  return (
    <fieldset
      id={blockDomId(block.id)}
      // A pick-one block is a radio group, which can say "required" and
      // "invalid" for all its radios at once. Tick boxes say it one by one.
      role={multi ? undefined : "radiogroup"}
      aria-labelledby={multi ? undefined : questionDomId(block.id)}
      aria-describedby={describedBy(block.help && helpId)}
      aria-required={(!multi && block.required) || undefined}
      aria-invalid={(!multi && error !== "") || undefined}
      className={blockClasses}
    >
      <legend id={questionDomId(block.id)} className={questionClasses}>
        {block.question}
      </legend>
      <BlockHelp id={helpId}>{block.help}</BlockHelp>

      <div className={cn("mt-4 grid gap-2", block.layout === "grid" && "min-[420px]:grid-cols-2")}>
        {block.options.map((option) => (
          <ChoiceChip
            key={option.value}
            type={multi ? "checkbox" : "radio"}
            name={block.id}
            value={option.value}
            label={option.label}
            checked={picked.includes(option.value)}
            invalid={error !== ""}
            describedBy={describedBy(error !== "" && errorId)}
            onChange={() => onSelect(block, option.value)}
            // An odd one out at the end of a two-column grid takes the full row.
            className={block.layout === "grid" ? "min-[420px]:last:odd:col-span-2" : undefined}
          />
        ))}
      </div>
      {/* Under the choices, not above them: an error that clears on a tap
          must not move the choice under the finger. */}
      <InlineError id={errorId} className="mt-3">
        {error}
      </InlineError>

      {other && picked.includes(other.optionValue) && (
        <Reveal animate={settled.current}>
          <div className="pb-1 pt-4">
            <Label htmlFor={fieldDomId(other.fieldId)}>{other.label}</Label>
            <Input
              id={fieldDomId(other.fieldId)}
              name={other.fieldId}
              type="text"
              value={rawText(answers, other.fieldId)}
              onChange={(event) => onText(other.fieldId, event.target.value)}
              placeholder={other.placeholder}
              maxLength={120}
              autoComplete="off"
              autoCapitalize="sentences"
              enterKeyHint="done"
              onKeyDown={blurOnEnter}
            />
          </div>
        </Reveal>
      )}

      {detail && (
        <div className="mt-6">
          <Label htmlFor={fieldDomId(detail.fieldId)}>
            {detail.label}
            <span className="ml-1.5 font-normal text-umber">{intake.labels.optional}</span>
          </Label>
          {detail.help && (
            <p id={helpDomId(detail.fieldId)} className="mb-2 text-sm leading-relaxed text-umber">
              {detail.help}
            </p>
          )}
          <Textarea
            id={fieldDomId(detail.fieldId)}
            name={detail.fieldId}
            rows={2}
            value={detailValue}
            onChange={(event) => onText(detail.fieldId, event.target.value)}
            placeholder={detail.placeholder}
            maxLength={detail.maxLength}
            autoComplete="off"
            autoCapitalize="sentences"
            aria-describedby={describedBy(detail.help && helpDomId(detail.fieldId))}
            className="min-h-[4.5rem]"
          />
          {detailValue.length >= detail.maxLength * 0.8 && (
            <p className="mt-1 text-right text-xs tabular-nums text-umber">
              {detailValue.length} / {detail.maxLength}
            </p>
          )}
        </div>
      )}
    </fieldset>
  );
}

export default memo(ChoiceBlock, sameBlockProps);

/** The text exactly as typed (answerText() trims, which would eat a space mid-sentence). */
function rawText(answers: IntakeAnswers, key: string): string {
  const value = answers[key];
  return typeof value === "string" ? value : "";
}
