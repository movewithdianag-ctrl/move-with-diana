import { useEffect, useRef } from "react";

/**
 * Move keyboard and screen-reader focus to the page's h1 on mount, so people
 * arriving from the intake form hear the result straight away. The heading
 * needs tabIndex={-1}. preventScroll leaves scroll position to ScrollManager.
 */
export function useFocusHeading<T extends HTMLElement = HTMLHeadingElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    ref.current?.focus({ preventScroll: true });
  }, []);
  return ref;
}
