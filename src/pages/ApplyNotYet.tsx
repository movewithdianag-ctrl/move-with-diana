import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import {
  fillTokens,
  footer,
  funnelMeta,
  instagramUrl,
  intake,
  mailtoHref,
  program,
} from "@/content/content";
import { SKOOL_COMMUNITY_URL } from "@/lib/config";
import { submitNewsletter } from "@/lib/contact";
import { EMAIL_RE, readIntakeSession } from "@/lib/intake";
import Seo from "@/components/Seo";
import Button from "@/components/ui/button";
import { FieldError, Input } from "@/components/ui/field";
import { useFocusHeading } from "@/components/thankyou/useFocusHeading";

type NewsletterState = "idle" | "sending" | "success" | "error";

const h2Classes =
  "font-display text-2xl font-medium leading-snug tracking-tight";
const textLinkClasses =
  "inline-flex min-h-[44px] items-center text-sm font-medium text-steel underline decoration-steel/40 underline-offset-4 transition-colors hover:text-steel-deep hover:decoration-steel-deep";

/**
 * The "not yet" page (/apply/not-yet): not cleared for exercise yet.
 *
 * Kind and practical. No payment, no booking and no link back to the form, on
 * purpose. Works on a direct visit too, in which case the heading has no name.
 */
export default function ApplyNotYet() {
  const copy = intake.notYet;
  const [firstName] = useState(
    () => readIntakeSession()?.firstName.trim() ?? "",
  );
  const headingRef = useFocusHeading();

  // Start with the email they just gave on the form. Nothing is sent until they press the button.
  const [email, setEmail] = useState(
    () => readIntakeSession()?.email.trim() ?? "",
  );
  const [state, setState] = useState<NewsletterState>("idle");
  const [errorText, setErrorText] = useState("");

  async function onSubscribe(e: FormEvent) {
    e.preventDefault();
    if (state === "sending") return;
    if (!EMAIL_RE.test(email.trim())) {
      setErrorText(footer.newsletter.invalidEmailText);
      setState("error");
      return;
    }
    setState("sending");
    try {
      await submitNewsletter(email.trim());
      setState("success");
      setEmail("");
    } catch {
      setErrorText(copy.newsletter.errorText);
      setState("error");
    }
  }

  const heading = firstName
    ? fillTokens(copy.heading, { firstName })
    : copy.headingNoName;
  // The community block and the contact section are hidden by emptying their text.
  const communityUrl = copy.communityText.trim()
    ? SKOOL_COMMUNITY_URL.trim()
    : "";
  const NewsletterHeading = copy.communityHeading ? "h3" : "h2";
  const showNewsletter = copy.newsletter.heading.trim() !== "";

  return (
    <>
      <Seo {...funnelMeta.notYet} noindex />

      <div className="mx-auto w-full max-w-2xl px-5 pb-16 pt-10 md:px-8 md:pb-24 md:pt-16">
        {/* The message */}
        <header>
          {copy.eyebrow && <p className="eyebrow mb-3">{copy.eyebrow}</p>}
          <h1
            ref={headingRef}
            tabIndex={-1}
            className="font-display text-3xl font-medium leading-tight tracking-tight focus:outline-none md:text-4xl"
          >
            {heading}
          </h1>
          <div className="mt-5 space-y-4 text-lg leading-relaxed text-umber">
            {copy.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </header>

        {/* What to do next */}
        {copy.next.length > 0 && (
          <section aria-labelledby="notyet-next" className="mt-12 md:mt-14">
            <h2 id="notyet-next" className={h2Classes}>
              {copy.nextHeading}
            </h2>
            <ol className="mt-6 space-y-6">
              {copy.next.map((step, i) => (
                <li key={step.title} className="flex gap-4">
                  <span
                    aria-hidden="true"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-steel/40 font-display text-base text-steel"
                  >
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="font-semibold text-ink">{step.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-umber">
                      {step.detail}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* Questions for the doctor or PT */}
        {intake.notYet.ask.length > 0 && (
          <section
            aria-labelledby="notyet-ask"
            className="mt-12 rounded-photo bg-plaster/60 p-6 md:mt-14 md:p-8"
          >
            <h2 id="notyet-ask" className={h2Classes}>
              {intake.notYet.askHeading}
            </h2>
            {intake.notYet.askIntro && (
              <p className="mt-3 text-sm leading-relaxed text-umber">
                {intake.notYet.askIntro}
              </p>
            )}
            <ul className="mt-5 space-y-3">
              {intake.notYet.ask.map((question) => (
                <li
                  key={question}
                  className="flex gap-3 leading-relaxed text-ink"
                >
                  <span
                    aria-hidden="true"
                    className="mt-[0.7em] h-px w-4 shrink-0 bg-steel/60"
                  />
                  <span>{question}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Soft, optional next steps */}
        {(communityUrl || showNewsletter) && (
          <section className="mt-12 border-t border-ink/10 pt-10 md:mt-14">
            {copy.communityHeading && (
              <h2 className={h2Classes}>{copy.communityHeading}</h2>
            )}

            {communityUrl && (
              <>
                <p className="mt-3 leading-relaxed text-umber">
                  {copy.communityText}
                </p>
                <a
                  href={communityUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={textLinkClasses}
                >
                  {copy.communityLabel}
                </a>
              </>
            )}

            {showNewsletter && (
              <div
                className={
                  copy.communityHeading || communityUrl ? "mt-6" : undefined
                }
              >
                <NewsletterHeading
                  className={
                    copy.communityHeading ? "font-semibold text-ink" : h2Classes
                  }
                >
                  {copy.newsletter.heading}
                </NewsletterHeading>
                <p className="mt-1 text-sm leading-relaxed text-umber">
                  {copy.newsletter.text}
                </p>
                {state === "success" ? (
                  <p
                    role="status"
                    className="mt-4 text-sm font-medium text-steel"
                  >
                    {copy.newsletter.successText}
                  </p>
                ) : (
                  <form onSubmit={onSubscribe} noValidate className="mt-4">
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <label
                        htmlFor="notyet-newsletter-email"
                        className="sr-only"
                      >
                        {footer.newsletter.placeholder}
                      </label>
                      <Input
                        id="notyet-newsletter-email"
                        name="email"
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        autoCapitalize="none"
                        enterKeyHint="send"
                        placeholder={footer.newsletter.placeholder}
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (state === "error") setState("idle");
                        }}
                        invalid={state === "error"}
                        aria-describedby={
                          state === "error"
                            ? "notyet-newsletter-error"
                            : undefined
                        }
                        className="sm:flex-1"
                      />
                      <Button
                        type="submit"
                        variant="ghost"
                        disabled={state === "sending"}
                        className="min-h-[3rem] shrink-0"
                      >
                        {state === "sending" && (
                          <Loader2
                            aria-hidden="true"
                            className="h-4 w-4 animate-spin motion-reduce:animate-none"
                          />
                        )}
                        {copy.newsletter.buttonLabel}
                      </Button>
                    </div>
                    <FieldError id="notyet-newsletter-error">
                      {state === "error" ? errorText : undefined}
                    </FieldError>
                  </form>
                )}
              </div>
            )}
          </section>
        )}

        {/* Questions: last thing on the page */}
        {copy.contactHeading && (
          <section className="mt-12 border-t border-ink/10 pt-10 md:mt-14">
            <h2 className={h2Classes}>{copy.contactHeading}</h2>
            <div className="mt-2 flex flex-wrap gap-x-6">
              {instagramUrl && (
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={textLinkClasses}
                >
                  {copy.messageLabel}
                </a>
              )}
              <a
                href={mailtoHref(program.chrome.questionsSubject)}
                className={textLinkClasses}
              >
                {copy.emailLabel}
              </a>
            </div>
          </section>
        )}

        {copy.disclaimer && (
          <p className="mt-12 border-t border-ink/10 pt-6 text-xs leading-relaxed text-umber">
            {copy.disclaimer}
          </p>
        )}
      </div>
    </>
  );
}
