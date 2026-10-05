import { expect, it } from "vitest";
import { plainSummary } from "./summary";

it("keeps study words and unknown placeholders while removing inline formatting from plain summaries", () => {
  expect(plainSummary("El **diccionario** tiene *memoria*. Usa `HashSet<T>`. [COMPLETAR: __]"))
    .toBe("El diccionario tiene memoria. Usa HashSet<T>. [COMPLETAR: __]");
});
