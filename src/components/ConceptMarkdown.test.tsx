import { expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { ConceptMarkdown } from "./ConceptMarkdown";
it("explains unchanged real-data placeholders in the selected language", () => {
  const html = renderToStaticMarkup(
    <ConceptMarkdown locale="en" body="[COMPLETAR: número de jobs migrados]" />,
  );
  expect(html).toContain('title="Needs your real information"');
  expect(html).toContain("[COMPLETAR: número de jobs migrados]");
});
it("renders collection comparisons as tables and highlights real-data placeholders", () => {
  const html = renderToStaticMarkup(
    <ConceptMarkdown
      body={
        "| Structure | Cost |\n| --- | --- |\n| List | O(n) |\n\n[COMPLETAR: jobs\n migrated]"
      }
    />,
  );
  expect(html).toContain("<table>");
  expect(html).toContain('class="needs-input"');
  expect(html).toMatch(/jobs\s+migrated/);
});
it("does not render source HTML as active elements", () => {
  const html = renderToStaticMarkup(
    <ConceptMarkdown
      body={
        "<script>alert(1)</script>\n\n<img src=x onerror=alert(1)>\n\nSafe text."
      }
    />,
  );
  expect(html).not.toContain("<script");
  expect(html).not.toContain("<img");
  expect(html).toContain("Safe text.");
});
