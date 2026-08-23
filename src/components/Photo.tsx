import { useState } from "react";
import { cn } from "@/lib/utils";

type Ratio = "4/5" | "3/2" | "2/3" | "hero" | "1/1" | "natural";

interface PhotoProps {
  src: string;
  alt: string;
  /**
   * Enforced aspect ratio (image system §6):
   *  "4/5"  — cards & portraits
   *  "3/2"  — offer rows
   *  "hero" — 4/5 on mobile, 16/9 on desktop
   */
  ratio?: Ratio;
  /** Above-the-fold images pass priority to skip lazy-loading. */
  priority?: boolean;
  /** Intrinsic pixel size — lets the browser reserve space before the
      image loads (zero layout shift), essential for ratio="natural". */
  width?: number;
  height?: number;
  className?: string;
}

const ratioClasses: Record<Ratio, string> = {
  "4/5": "aspect-[4/5]",
  "3/2": "aspect-[3/2]",
  // Full-body verticals (e.g. the contact page handstand) that a 4:5 crop
  // would decapitate.
  "2/3": "aspect-[2/3]",
  "1/1": "aspect-square",
  hero: "aspect-[4/5] md:aspect-[16/9]",
  // "natural" renders the photo at its own aspect ratio — zero cropping.
  natural: "",
};

/**
 * The one image pattern used for EVERY photo on the site: enforced aspect
 * ratio, object-cover, one shared radius token, lazy loading below the fold,
 * and a quiet plaster background while loading (no layout shift, no broken-
 * image glyphs — on error the frame simply stays plaster).
 */
export default function Photo({
  src,
  alt,
  ratio = "4/5",
  priority = false,
  width,
  height,
  className,
}: PhotoProps) {
  const [failed, setFailed] = useState(false);

  return (
    <div
      className={cn(
        "overflow-hidden rounded-photo bg-plaster",
        ratioClasses[ratio],
        className,
      )}
    >
      {!failed && (
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          onError={() => setFailed(true)}
          className={
            ratio === "natural" ? "block h-auto w-full" : "h-full w-full object-cover object-center"
          }
        />
      )}
      {failed && <span className="sr-only">{alt}</span>}
    </div>
  );
}
