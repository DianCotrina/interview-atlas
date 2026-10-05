import { expect, it } from "vitest";
import {
  getPreferredLocale,
  localeHref,
  rememberLocale,
  resolveLocale,
} from "./locale";

it.each([
  [["es-PE"], null, "es"],
  [["en-US"], null, "en"],
  [["EN-gb"], null, "en"],
  [["en-US-u-ca-gregory"], null, "en"],
  [["es_invalid", "en-US"], null, "en"],
  [["fr-FR", "en-CA", "es"], null, "en"],
  [["de", "es-MX"], null, "es"],
  [["fr-FR"], null, "es"],
  [[], null, "es"],
  [["en-US"], "es", "es"],
  [["es-PE"], "en", "en"],
  [["en-US"], "fr", "en"],
  [["en-US"], "<script>", "en"],
  [["es_invalid", "english"], null, "es"],
])(
  "resolves browser preferences %j and saved value %s to %s",
  (languages, saved, expected) => {
    expect(resolveLocale(languages as string[], saved)).toBe(expected);
  },
);

it("uses browser preferences when preference storage is blocked", () => {
  expect(
    getPreferredLocale(() => {
      throw new Error("storage blocked");
    }, ["en-US"]),
  ).toBe("en");
});

it("remembers a manual choice under the app's own key", () => {
  const values = new Map<string, string>();
  expect(rememberLocale((key, value) => values.set(key, value), "en")).toBe(
    true,
  );
  expect(values.get("interview-atlas.locale")).toBe("en");
  expect(
    getPreferredLocale(
      () => values.get("interview-atlas.locale") ?? null,
      ["es-PE"],
    ),
  ).toBe("en");
});

it("does not make blocked preference writes prevent language switching", () => {
  expect(
    rememberLocale(() => {
      throw new Error("storage blocked");
    }, "en"),
  ).toBe(false);
  expect(localeHref("en", "/es/concepts/big-o/")).toBe("/en/concepts/big-o/");
});

it.each([
  ["en", "/", "/en/"],
  ["es", "/en/", "/es/"],
  ["en", "/es/concepts/big-o/", "/en/concepts/big-o/"],
  ["es", "/en/concepts/ai-code-review", "/es/concepts/ai-code-review/"],
  ["en", "/concepts/hidden-loop/", "/en/concepts/hidden-loop/"],
  ["en", "/en/concepts/big-o/", "/en/concepts/big-o/"],
])(
  "keeps the current page when choosing %s from %s",
  (locale, path, expected) => {
    expect(localeHref(locale as "es" | "en", path)).toBe(expected);
  },
);

it.each(["https://example.com", "//example.com", "javascript:alert(1)"])(
  "rejects non-local navigation %s",
  (path) => {
    expect(() => localeHref("en", path)).toThrow(/local path/i);
  },
);
