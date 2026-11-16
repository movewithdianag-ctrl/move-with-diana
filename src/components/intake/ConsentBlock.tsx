import { memo } from "react";
import type { IntakeBlock } from "@/content/content";
import { answerText, type IntakeAnswers } from "@/lib/intake";
import InlineError from "./InlineError";
import {
  ChoiceChip,
  blockClasses,
  blockDomId,
  describedBy,
  errorDomId,
  helpDomId,
  questionClasses,
  sameBlockProps,
} from "./blockParts";

interface ConsentBlockProps {
  block: IntakeBlock;
  answers: IntakeAnswers;
  error: string;
  onToggle: (block: IntakeBlock, ticked: boolean) => void;
}

/**
 * The one tick box before sending: "exercise, not medical care" and the OK
 * to be contacted, in a single sentence. The policy line and the privacy
 * note under it are read, never ticked.
 */
function ConsentBlock({ block, answers, error, onToggle }: ConsentBlockProps) {
  const ticked = answerText(answers, block.id) === "yes";
  const policyId = helpDomId(block.id);
  const errorId = errorDomId(block.id);

  return (
    <fieldset id={blockDomId(block.id)} className={blockClasses}>
      <legend className={questionClasses}>{block.question}</legend>

      <ChoiceChip
        type="checkbox"
        name={block.id}
        value="yes"
        label={block.consentLabel}
        checked={ticked}
        invalid={error !== ""}
        required={block.required}
        describedBy={describedBy(block.policyText && policyId, error !== "" && errorId)}
        onChange={() => onToggle(block, !ticked)}
        className="mt-4"
      />
      {/* Under the choices, not above them: an error that clears on a tap
          must not move the choice under the finger. */}
      <InlineError id={errorId} className="mt-3">
        {error}
      </InlineError>

      {block.policyText && (
        <p id={policyId} className="mt-3 text-sm leading-relaxed text-umber">
          {block.policyText}
        </p>
      )}
      {block.note && <p className="mt-2 text-sm leading-relaxed text-umber">{block.note}</p>}
    </fieldset>
  );
}

export default memo(ConsentBlock, sameBlockProps);
