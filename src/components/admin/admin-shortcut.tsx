"use client";
import * as React from "react";
import { useRouter } from "next/navigation";

/**
 * Secret entry to the admin panel.
 *
 * Type the SECRET sequence anywhere on the site (outside a text field) and
 * you're navigated to /admin. There is no visible link.
 *
 * This is obscurity, NOT security — the real gate is the server-side
 * `requireAdmin()` guard, which bounces non-admins to /dashboard. So it's
 * safe to mount globally for everyone; a non-admin who discovers the knock
 * just gets redirected away.
 *
 * To change the trigger:
 *   • Different word  → edit SECRET below (lowercase letters).
 *   • Modifier combo  → swap the handler for an `e.ctrlKey && e.shiftKey &&
 *     e.key === "a"` style check. (Avoid plain Ctrl+A — it's Select-All.)
 */
const SECRET = "admin";
const RESET_MS = 1200; // sequence resets if you pause this long between keys

export function AdminShortcut() {
  const router = useRouter();
  const buffer = React.useRef("");
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      // Don't capture keystrokes while the user is typing in a field.
      const el = document.activeElement as HTMLElement | null;
      if (
        el &&
        (el.tagName === "INPUT" ||
          el.tagName === "TEXTAREA" ||
          el.isContentEditable)
      ) {
        return;
      }

      // Only track single printable characters (ignore Shift, Arrow, etc.).
      if (e.key.length !== 1 || e.ctrlKey || e.metaKey || e.altKey) return;

      buffer.current = (buffer.current + e.key.toLowerCase()).slice(-SECRET.length);

      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        buffer.current = "";
      }, RESET_MS);

      if (buffer.current === SECRET) {
        buffer.current = "";
        router.push("/admin");
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      if (timer.current) clearTimeout(timer.current);
    };
  }, [router]);

  return null;
}
