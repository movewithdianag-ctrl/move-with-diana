import { memo } from "react";
import type { IntakeBlock } from "@/content/content";
import type { IntakeAnswers } from "@/lib/intake";
import { Textarea } from "@/components/ui/field";
import InlineError from "./InlineError";
import {
  BlockHelp,
  blockClasses,
  blockDomId,
  describedBy,
  errorDomId,
  fieldDomId,
  helpDomId,
  questionClasses,
  sameBlockProps,
} from "./blockParts";

interface TextBlockProps {
  block: IntakeBlock;
  answers: IntakeAnswers;
  error: string;
  onText: (key: string, value: string) => void;
}

/** One open question with a short text box. The question is the box's label. */
function TextBlock({ block, answers, error, onText }: TextBlockProps) {
  const stored = answers[block.id];
  const value = typeof stored === "string" ? stored : "";
  const helpId = helpDomId(block.id);
  const errorId = errorDomId(block.id);

  return (
    <div id={blockDomId(block.id)} className={blockClasses}>
      <label htmlFor={fieldDomId(block.id)} className={questionClasses}>
        {block.question}
      </label>
      <BlockHelp id={helpId}>{block.help}</BlockHelp>
      <Textarea
        id={fieldDomId(block.id)}
        name={block.id}
        rows={2}
        value={value}
        onChange={(event) => onText(block.id, event.target.value)}
        placeholder={block.placeholder}
        maxLength={block.maxLength}
        autoComplete="off"
        autoCapitalize="sentences"
        aria-required={block.required || undefined}
        aria-describedby={describedBy(block.help && helpId, error !== "" && errorId)}
        invalid={error !== ""}
        className="mt-4 min-h-[4.5rem]"
      />
      {value.length >= block.maxLength * 0.8 && (
        <p className="mt-1 text-right text-xs tabular-nums text-umber">
          {value.length} / {block.maxLength}
        </p>
      )}
      <InlineError id={errorId}>{error}</InlineError>
    </div>
  );
}

export default memo(TextBlock, sameBlockProps);
