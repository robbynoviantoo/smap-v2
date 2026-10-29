"use client";
import { useEffect } from "react";

let locks = 0;
let restore: (() => void) | undefined;

// Reference counting keeps nested dialogs from unlocking a still-open drawer/modal.
export function useBodyScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    if (locks++ === 0) {
      const body = document.body;
      const html = document.documentElement;
      const bodyOverflow = body.style.overflow;
      const htmlOverflow = html.style.overflow;
      body.style.overflow = "hidden";
      html.style.overflow = "hidden";
      restore = () => {
        body.style.overflow = bodyOverflow;
        html.style.overflow = htmlOverflow;
      };
    }
    return () => {
      if (--locks === 0) {
        restore?.();
        restore = undefined;
      }
    };
  }, [active]);
}
