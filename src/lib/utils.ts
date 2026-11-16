import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * An AbortSignal that fires after `ms`, so a request on a stalled connection
 * fails (and the caller can retry or fall back) instead of hanging for
 * minutes. Uses AbortSignal.timeout where the browser has it, otherwise an
 * AbortController and a timer. undefined when neither exists.
 */
export function timeoutSignal(ms: number): AbortSignal | undefined {
  try {
    const native = (AbortSignal as unknown as { timeout?: (ms: number) => AbortSignal }).timeout;
    if (typeof native === "function") return native.call(AbortSignal, ms);
    const controller = new AbortController();
    setTimeout(() => controller.abort(), ms);
    return controller.signal;
  } catch {
    return undefined;
  }
}
