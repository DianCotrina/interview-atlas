"use client";
import { useEffect } from "react";
import { getPreferredLocale, localeHref, preferenceKey } from "@/lib/locale";

export function LocaleEntry({ pathname = "/" }: { pathname?: string }) {
  useEffect(() => {
    const locale = getPreferredLocale(
      () => window.localStorage.getItem(preferenceKey),
      [...navigator.languages, navigator.language],
    );
    window.location.replace(
      localeHref(locale, pathname) +
        window.location.search +
        window.location.hash,
    );
  }, [pathname]);
  return (
    <main className="locale-entry">
      <p className="entry-brand">Interview Atlas</p>
      <h1 lang="es">Elige tu idioma</h1>
      <p lang="en">Choose your language</p>
      <nav aria-label="Idioma / Language">
        <a href={localeHref("es", pathname)} lang="es">
          Español
        </a>
        <a href={localeHref("en", pathname)} lang="en">
          English
        </a>
      </nav>
    </main>
  );
}
