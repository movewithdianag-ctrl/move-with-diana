import { useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { Loader2, Mail, MapPin } from "lucide-react";
import { contactPage, meta, site } from "@/content/content";
import { submitContact } from "@/lib/contact";
import Seo from "@/components/Seo";
import Photo from "@/components/Photo";
import PhotoStrip from "@/components/PhotoStrip";
import Section from "@/components/Section";
import SocialLinks from "@/components/SocialLinks";
import Button from "@/components/ui/button";
import { FieldError, Input, Label, Select, Textarea } from "@/components/ui/field";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface FormErrors {
  name?: string;
  email?: string;
  interest?: string;
  message?: string;
}

export default function Contact() {
  const [searchParams] = useSearchParams();
  // Prefill "I'm interested in" from /contact?interest=<slug> (offer CTAs).
  const prefill = searchParams.get("interest") ?? "";
  const validPrefill = contactPage.interests.some((i) => i.slug === prefill) ? prefill : "";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [interest, setInterest] = useState(validPrefill);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  function validate(): FormErrors {
    const next: FormErrors = {};
    if (!name.trim()) next.name = contactPage.errors.nameRequired;
    if (!email.trim()) next.email = contactPage.errors.emailRequired;
    else if (!EMAIL_RE.test(email.trim())) next.email = contactPage.errors.emailInvalid;
    if (!interest) next.interest = contactPage.errors.interestRequired;
    if (!message.trim()) next.message = contactPage.errors.messageRequired;
    return next;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0 || status === "sending") return;

    setStatus("sending");
    try {
      const interestLabel =
        contactPage.interests.find((i) => i.slug === interest)?.label ?? interest;
      await submitContact({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        interest: interestLabel,
        message: message.trim(),
      });
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  return (
    <>
      <Seo title={meta.contact.title} description={meta.contact.description} path="/contact" />

      <Section
        eyebrow={contactPage.eyebrow}
        heading={contactPage.heading}
        headingLevel="h1"
        subline={contactPage.opening}
        className="pt-24 md:pt-32"
      >
        <div className="grid gap-12 md:grid-cols-[1fr_0.85fr] md:gap-16">
          <div className="max-w-xl">
          {status === "success" ? (
            <div
              role="status"
              className="rounded-photo border border-steel/25 bg-white/70 p-8 text-center shadow-sm"
            >
              <h2 className="font-display text-2xl font-medium tracking-tight">
                {contactPage.success.heading}
              </h2>
              <p className="mt-3 text-umber">{contactPage.success.body}</p>
              <SocialLinks className="mt-8 justify-center" />
            </div>
          ) : (
            <form onSubmit={onSubmit} noValidate>
              <div className="space-y-5">
                <div>
                  <Label htmlFor="contact-name">{contactPage.labels.name}</Label>
                  <Input
                    id="contact-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    invalid={!!errors.name}
                    aria-describedby={errors.name ? "err-name" : undefined}
                  />
                  <FieldError id="err-name">{errors.name}</FieldError>
                </div>

                <div>
                  <Label htmlFor="contact-email">{contactPage.labels.email}</Label>
                  <Input
                    id="contact-email"
                    name="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    invalid={!!errors.email}
                    aria-describedby={errors.email ? "err-email" : undefined}
                  />
                  <FieldError id="err-email">{errors.email}</FieldError>
                </div>

                <div>
                  <Label htmlFor="contact-phone">{contactPage.labels.phone}</Label>
                  <Input
                    id="contact-phone"
                    name="phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="contact-interest">{contactPage.labels.interest}</Label>
                  <Select
                    id="contact-interest"
                    name="interest"
                    required
                    value={interest}
                    onChange={(e) => setInterest(e.target.value)}
                    invalid={!!errors.interest}
                    aria-describedby={errors.interest ? "err-interest" : undefined}
                  >
                    <option value="" disabled>
                      {contactPage.labels.interestPlaceholder}
                    </option>
                    {contactPage.interests.map((option) => (
                      <option key={option.slug} value={option.slug}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                  <FieldError id="err-interest">{errors.interest}</FieldError>
                </div>

                <div>
                  <Label htmlFor="contact-message">{contactPage.labels.message}</Label>
                  <Textarea
                    id="contact-message"
                    name="message"
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={contactPage.labels.messagePlaceholder}
                    invalid={!!errors.message}
                    aria-describedby={errors.message ? "err-message" : undefined}
                  />
                  <FieldError id="err-message">{errors.message}</FieldError>
                </div>
              </div>

              {status === "error" && (
                <div role="alert" className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-sm">
                  <p className="text-red-900">{contactPage.failure.text}</p>
                  {/* Mailto fallback so no lead is ever lost */}
                  <a
                    href={`mailto:${site.email}?subject=${encodeURIComponent("New enquiry — Move with Diana")}`}
                    className="mt-1 inline-block font-semibold text-red-900 underline"
                  >
                    {contactPage.failure.mailtoLabel}
                  </a>
                </div>
              )}

              <Button
                type="submit"
                disabled={status === "sending"}
                className="mt-7 w-full py-4 text-base"
              >
                {status === "sending" ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                    {contactPage.labels.submitting}
                  </>
                ) : (
                  contactPage.labels.submit
                )}
              </Button>
            </form>
          )}

          {/* Direct contact + location line */}
          <div className="mt-12 space-y-4 border-t border-ink/10 pt-8 text-sm text-umber">
            <a
              href={`mailto:${site.email}`}
              className="inline-flex items-center gap-2 font-medium text-ink/80 transition-colors hover:text-ink"
            >
              <Mail className="h-4 w-4" aria-hidden />
              {site.email}
            </a>
            <SocialLinks />
            <p className="inline-flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              {site.basedInLine}
            </p>
          </div>
          </div>

          {/* Portrait beside the form (desktop only — on phones the form
              stays front and center). Sticky so it rides along the long form. */}
          <div className="hidden md:block">
            <div className="md:sticky md:top-24">
              <Photo src={contactPage.photo.src} alt={contactPage.photo.alt} ratio="2/3" />
            </div>
          </div>
        </div>
      </Section>

      {/* Photo strip above the footer (Paradigm-style band) */}
      <PhotoStrip images={contactPage.gallery} />
    </>
  );
}
