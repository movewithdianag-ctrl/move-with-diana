import { Instagram, Youtube } from "lucide-react";
import { site } from "@/content/content";
import { cn } from "@/lib/utils";

/** lucide-react has no TikTok glyph, so it ships as a small inline SVG. */
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
  );
}

const icons: Record<string, (props: { className?: string }) => JSX.Element> = {
  Instagram: ({ className }) => <Instagram className={className} aria-hidden />,
  YouTube: ({ className }) => <Youtube className={className} aria-hidden />,
  TikTok: TikTokIcon,
};

interface SocialLinksProps {
  className?: string;
  iconClassName?: string;
}

/** Icon links to Diana's socials — used in the menu sheet, contact page, and footer. */
export default function SocialLinks({ className, iconClassName }: SocialLinksProps) {
  return (
    <ul className={cn("flex items-center gap-5", className)}>
      {site.socials.map((social) => {
        const Icon = icons[social.label];
        return (
          <li key={social.label}>
            <a
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={social.label}
              className="inline-flex rounded-full p-1 transition-opacity hover:opacity-70"
            >
              {Icon ? <Icon className={cn("h-5 w-5", iconClassName)} /> : social.label}
            </a>
          </li>
        );
      })}
    </ul>
  );
}
