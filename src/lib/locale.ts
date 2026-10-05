export const locales = ["es", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "es";
export const preferenceKey = "interview-atlas.locale";

export function isLocale(value: unknown): value is Locale {
  return value === "es" || value === "en";
}

export function resolveLocale(
  languages: readonly string[],
  saved?: unknown,
): Locale {
  if (isLocale(saved)) return saved;
  for (const language of languages) {
    if (!/^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$/i.test(language)) continue;
    const base = language.toLowerCase().split("-")[0];
    if (isLocale(base)) return base;
  }
  return defaultLocale;
}

export function getPreferredLocale(
  read: () => string | null,
  languages: readonly string[],
): Locale {
  try {
    return resolveLocale(languages, read());
  } catch {
    return resolveLocale(languages);
  }
}

export function rememberLocale(
  write: (key: string, value: string) => void,
  locale: Locale,
): boolean {
  try {
    write(preferenceKey, locale);
    return true;
  } catch {
    return false;
  }
}

export function localeHref(locale: Locale, pathname = "/"): string {
  if (!pathname.startsWith("/") || pathname.startsWith("//"))
    throw new Error("Expected a local path");
  const segments = pathname.split("/").filter(Boolean);
  if (isLocale(segments[0])) segments.shift();
  return `/${locale}/${segments.length ? `${segments.join("/")}/` : ""}`;
}
