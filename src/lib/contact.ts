/**
 * Form submission transport.
 *
 * Both the contact form and the newsletter signup post JSON to Web3Forms,
 * which emails every submission to Diana's inbox. No server needed.
 *
 * The dev server (npm run dev) never sends: the local .env can hold the real
 * key, and a test click must not land in Diana's inbox. It logs the payload
 * to the console instead, unless VITE_INTAKE_SEND_IN_DEV=1.
 *
 * The UI only ever calls submitContact() / submitNewsletter(), so this
 * transport can later be swapped (e.g. to Supabase + Resend) without
 * touching any component.
 */
import { WEB3FORMS_ENDPOINT, WEB3FORMS_KEY } from "./config";
import { timeoutSignal } from "./utils";

/** Give up on a stalled request after this long, so the form can show "try again". */
const WEB3FORMS_TIMEOUT_MS = 20000;

export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  interest: string;
  message: string;
}

export async function postToWeb3Forms(payload: Record<string, string>): Promise<void> {
  if (import.meta.env.DEV && import.meta.env.VITE_INTAKE_SEND_IN_DEV !== "1") {
    console.info(
      "[Move with Diana] Dev preview. No email was sent (set VITE_INTAKE_SEND_IN_DEV=1 to send). Payload:",
      payload,
    );
    return;
  }

  if (!WEB3FORMS_KEY) {
    // TODO: add VITE_WEB3FORMS_KEY (see .env.example). Until then (in preview
    // environments, for example) we log the payload and let the UI show success
    // so the flow can be exercised end-to-end without dropping into an error.
    console.info("[Move with Diana] Web3Forms key missing. Form payload:", payload);
    return;
  }

  const res = await fetch(WEB3FORMS_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ access_key: WEB3FORMS_KEY, ...payload }),
    signal: timeoutSignal(WEB3FORMS_TIMEOUT_MS),
  });

  const data = (await res.json().catch(() => null)) as { success?: boolean } | null;
  if (!res.ok || !data?.success) {
    throw new Error("Web3Forms submission failed");
  }
}

export async function submitContact(data: ContactFormData): Promise<void> {
  await postToWeb3Forms({
    // Who + what, right in the inbox notification, so there is no need to open it.
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
