/**
 * Form submission transport.
 *
 * Both the contact form and the newsletter signup post JSON to Web3Forms,
 * which emails every submission to Diana's inbox — no server needed.
 *
 * The UI only ever calls submitContact() / submitNewsletter(), so this
 * transport can later be swapped (e.g. to Supabase + Resend) without
 * touching any component.
 */
import { WEB3FORMS_ENDPOINT, WEB3FORMS_KEY } from "./config";

export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  interest: string;
  message: string;
}

async function postToWeb3Forms(payload: Record<string, string>): Promise<void> {
  if (!WEB3FORMS_KEY) {
    // TODO: add VITE_WEB3FORMS_KEY (see .env.example). Until then — e.g. in
    // preview environments — we log the payload and let the UI show success
    // so the flow can be exercised end-to-end without dropping into an error.
    console.info("[Move with Diana] Web3Forms key missing — form payload:", payload);
    return;
  }

  const res = await fetch(WEB3FORMS_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ access_key: WEB3FORMS_KEY, ...payload }),
  });

  const data = (await res.json().catch(() => null)) as { success?: boolean } | null;
  if (!res.ok || !data?.success) {
    throw new Error("Web3Forms submission failed");
  }
}

export async function submitContact(data: ContactFormData): Promise<void> {
  await postToWeb3Forms({
    // Who + what, right in the inbox notification — no need to open it.
    subject: `New enquiry — ${data.name} · ${data.interest}`,
    from_name: data.name,
    name: data.name,
    email: data.email,
    phone: data.phone,
    interest: data.interest,
    message: data.message,
  });
}

export async function submitNewsletter(email: string): Promise<void> {
  await postToWeb3Forms({
    subject: `The Weekly Cue signup — ${email}`,
    from_name: "The Weekly Cue",
    email,
  });
}
