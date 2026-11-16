import { memo, useState } from "react";
import { fillTokens, intake, type IntakeBlock, type IntakeContactField } from "@/content/content";
import { suggestEmailFix, type IntakeAnswers, type IntakeErrors } from "@/lib/intake";
import { Input, Label } from "@/components/ui/field";
import InlineError from "./InlineError";
import { formatPhone } from "./phone";
import {
  BlockHelp,
  blockClasses,
  blockDomId,
  blurOnEnter,
  describedBy,
  errorDomId,
  fieldDomId,
  helpDomId,
  questionClasses,
  sameBlockProps,
} from "./blockParts";

interface ContactBlockProps {
  block: IntakeBlock;
  answers: IntakeAnswers;
  /** Keyed by contact field id (firstName, lastName, email, phone). */
  errors: IntakeErrors;
  onText: (key: string, value: string) => void;
  /** The person left a field. The form checks the email here, nothing else. */
  onBlur: (field: IntakeContactField) => void;
}

const INPUT_MODE = { text: "text", email: "email", tel: "tel" } as const;

/** Field ids that sit side by side on one line. Every other field takes the full width. */
const HALF_WIDTH_FIELDS = ["firstName", "lastName"];

/**
 * First and last name, email and phone. Each field has its own label, help line and error.
 * The email gets a gentle "Did you mean ...?" for common typos once the
 * person leaves the field; it is offered, never applied for them.
 */
function ContactBlock({ block, answers, errors, onText, onBlur }: ContactBlockProps) {
  const { labels } = intake;
  const helpId = helpDomId(block.id);
  // Email typo suggestion per field id ("" = none). Set on blur, cleared on typing.
  const [suggestions, setSuggestions] = useState<Record<string, string>>({});

  const valueOf = (field: IntakeContactField): string => {
    const stored = answers[field.id];
    return typeof stored === "string" ? stored : "";
  };

  function handleChange(field: IntakeContactField, typed: string) {
    const previous = valueOf(field);
    // Tidy a phone number only while digits are being added at the end, so
    // editing in the middle or deleting never fights the person.
    const addingAtEnd = typed.length > previous.length && typed.startsWith(previous);
    onText(field.id, field.type === "tel" && addingAtEnd ? formatPhone(typed) : typed);
    if (suggestions[field.id]) setSuggestions((prev) => ({ ...prev, [field.id]: "" }));
  }

  function handleBlur(field: IntakeContactField) {
    const value = valueOf(field);
    if (field.type === "tel" && value !== "") {
      const tidy = formatPhone(value);
      if (tidy !== value) onText(field.id, tidy);
    }
    if (field.type === "email") {
      setSuggestions((prev) => ({ ...prev, [field.id]: suggestEmailFix(value) }));
    }
    onBlur(field);
  }

  function acceptSuggestion(field: IntakeContactField) {
    onText(field.id, suggestions[field.id] ?? "");
    setSuggestions((prev) => ({ ...prev, [field.id]: "" }));
    // The button is about to disappear: hand the keyboard back to the field.
    document.getElementById(fieldDomId(field.id))?.focus();
  }

  return (
    <fieldset
      id={blockDomId(block.id)}
      aria-describedby={describedBy(block.help && helpId)}
      className={blockClasses}
    >
      <legend className={questionClasses}>{block.question}</legend>
      <BlockHelp id={helpId}>{block.help}</BlockHelp>

      <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-5">
        {block.fields.map((field, index) => {
          const nextField = block.fields[index + 1];
          const inputId = fieldDomId(field.id);
          const fieldHelpId = helpDomId(field.id);
          const errorId = errorDomId(field.id);
          const error = errors[field.id] ?? "";
          const suggestion = suggestions[field.id] ?? "";

          return (
            <div key={field.id} className={HALF_WIDTH_FIELDS.includes(field.id) ? "" : "col-span-2"}>
              <Label htmlFor={inputId}>
                {field.label}
                {!field.required && (
                  <span className="ml-1.5 font-normal text-umber">{labels.optional}</span>
                )}
              </Label>
              <Input
                id={inputId}
                name={field.id}
                type={field.type}
                inputMode={INPUT_MODE[field.type]}
                value={valueOf(field)}
                onChange={(event) => handleChange(field, event.target.value)}
                onBlur={() => handleBlur(field)}
                onKeyDown={(event) => blurOnEnter(event, nextField && fieldDomId(nextField.id))}
                enterKeyHint={nextField ? "next" : "done"}
                autoComplete={field.autoComplete}
                autoCapitalize={field.autoCapitalize}
                autoCorrect="off"
                spellCheck={false}
                maxLength={field.type === "tel" ? 32 : 120}
                aria-required={field.required || undefined}
                aria-describedby={describedBy(field.help && fieldHelpId, error !== "" && errorId)}
                invalid={error !== ""}
              />
              {field.help && (
                <p id={fieldHelpId} className="mt-1.5 text-sm text-umber">
                  {field.help}
                </p>
              )}
              {field.type === "email" && (
                // Always mounted, so the suggestion is read out when it appears.
                <div role="status">
                  {suggestion && (
                    <p className="mt-1 flex flex-wrap items-center gap-x-2 text-sm text-ink">
                      <span>{fillTokens(labels.emailSuggestion, { suggestion })}</span>
                      <button
                        type="button"
                        onClick={() => acceptSuggestion(field)}
                        className="inline-flex min-h-11 items-center font-semibold text-steel underline underline-offset-4 hover:text-steel-deep"
                      >
                        {labels.emailSuggestionAccept}
                      </button>
                    </p>
                  )}
                </div>
              )}
              <InlineError id={errorId}>{error}</InlineError>
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}

export default memo(ContactBlock, sameBlockProps);
