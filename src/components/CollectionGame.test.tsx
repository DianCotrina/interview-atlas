import { expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { CollectionGame } from "./CollectionGame";
import { gameCopy } from "../lib/game-copy";
import { CollectionGameProvider } from "./CollectionGameSession";

it.each(["es", "en"] as const)("renders playable controls and reading fallback in %s", (locale) => {
  const html = renderToStaticMarkup(<CollectionGameProvider><CollectionGame locale={locale} /></CollectionGameProvider>);
  expect(html).toContain(gameCopy[locale].title);
  expect(html).toContain(gameCopy[locale].session);
  expect(html).toContain('<fieldset class="mission-choices">');
  expect(html).toContain('aria-live="polite"');
  expect(html).toContain(`href="/${locale}/concepts/dictionary-counting/"`);
  expect(html).toContain(`<noscript>`);
});
