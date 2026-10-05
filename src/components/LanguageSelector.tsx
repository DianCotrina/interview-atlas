"use client";
import { useId } from "react";
import { usePathname } from "next/navigation";
import {
  isLocale,
  localeHref,
  rememberLocale,
  type Locale,
} from "@/lib/locale";
import { messages } from "@/lib/messages";
import { useReviewNavigation } from "./ReviewNavigation";

export function LanguageSelector({ locale }: { locale: Locale }) {
  const id = useId();
  const pathname = usePathname();
  const { pending } = useReviewNavigation();
  const text = messages[locale].language;
  return (
    <div className="language-picker">
      <label htmlFor={id}>{text.label}</label>
      <select
        id={id}
        value={locale}
        disabled={pending}
        aria-describedby={pending ? `${id}-reason` : undefined}
        onChange={(event) => {
          const selected = event.target.value;
          if (!isLocale(selected) || pending) return;
          rememberLocale(
            (key, value) => window.localStorage.setItem(key, value),
            selected,
          );
          window.location.assign(
            localeHref(selected, pathname) +
              window.location.search +
              window.location.hash,
          );
        }}
      >
        <option value="es" lang="es">
          Español
        </option>
        <option value="en" lang="en">
          English
        </option>
      </select>
      {pending && (
        <p id={`${id}-reason`} role="status">
          {text.pending}
        </p>
      )}
    </div>
  );
}
