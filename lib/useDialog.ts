import { useEffect, useRef } from "react";

/**
 * Accessible modal-dialog behaviour for overlay panels (mobile nav + filter
 * drawer). While `open`:
 *  - moves focus into the panel,
 *  - traps Tab / Shift+Tab within it,
 *  - closes on Escape,
 *  - locks body scroll,
 *  - restores focus to the previously-focused element on close.
 *
 * Returns a ref to attach to the panel container. Pair with role="dialog"
 * aria-modal="true" and an accessible name on that container.
 */
export function useDialog<T extends HTMLElement>(
  open: boolean,
  onClose: () => void,
) {
  const ref = useRef<T>(null);
  // Keep the latest onClose without re-running the trap setup each render.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return;
    const node = ref.current;
    const previouslyFocused = document.activeElement as HTMLElement | null;

    const SELECTOR =
      'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
    const focusables = () =>
      node
        ? Array.from(node.querySelectorAll<HTMLElement>(SELECTOR)).filter(
            (el) => el.offsetParent !== null,
          )
        : [];

    // Move focus into the panel (first focusable, usually the close button).
    focusables()[0]?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCloseRef.current();
        return;
      }
      if (e.key !== "Tab") return;
      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      // Restore focus to whatever opened the dialog.
      previouslyFocused?.focus?.();
    };
  }, [open]);

  return ref;
}
