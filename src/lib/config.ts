/**
 * Site configuration constants.
 *
 * The values below now come from the CMS-editable settings file
 * (src/content/settings.json → "Site settings" in the /admin panel), so
 * Diana can change the calendar, the community link, and the schedule
 * section's visibility without a developer:
 *
 *  • calendarUrl  — Google Calendar embed URL (full setup steps live in the
 *    comment at the top of src/components/ScheduleEmbed.tsx).
 *  • communityUrl — the Skool community link; while empty, every "Join the
 *    community" button falls back to the contact form.
 *  • showSchedule — turns the weekly-schedule section (and its nav links)
 *    on/off site-wide.
 */
import { cmsSettings } from "@/content/content";

export const GOOGLE_CALENDAR_EMBED_URL = cmsSettings.calendarUrl;
export const SKOOL_COMMUNITY_URL = cmsSettings.communityUrl;
export const SHOW_SCHEDULE = cmsSettings.showSchedule;

/**
 * Web3Forms access key, injected at build time from the environment.
 * Set VITE_WEB3FORMS_KEY in `.env` locally and in the deploy host's
 * environment settings (see .env.example).
 *
 * When the key is missing (e.g. preview deployments), the forms still
 * validate, log their payload to the console, and show the success state —
 * see src/lib/contact.ts.
 */
export const WEB3FORMS_KEY: string =
  (import.meta.env.VITE_WEB3FORMS_KEY as string | undefined) ?? "";

export const WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit";
