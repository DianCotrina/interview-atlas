import { expect, it } from "vitest";
import { reviewNavigationReducer } from "./review-navigation";

it("keeps language switching blocked until every unconfirmed question is resolved", () => {
  let state = reviewNavigationReducer(new Set<string>(), {
    id: "question-a",
    pending: true,
  });
  state = reviewNavigationReducer(state, { id: "question-b", pending: true });
  state = reviewNavigationReducer(state, { id: "question-a", pending: false });
  expect([...state]).toEqual(["question-b"]);
  state = reviewNavigationReducer(state, { id: "question-b", pending: false });
  expect(state.size).toBe(0);
});

it("does not count repeated registration as multiple unconfirmed reviews", () => {
  let state = reviewNavigationReducer(new Set<string>(), {
    id: "question-a",
    pending: true,
  });
  state = reviewNavigationReducer(state, { id: "question-a", pending: true });
  expect(state.size).toBe(1);
  expect(
    reviewNavigationReducer(state, { id: "question-a", pending: false }).size,
  ).toBe(0);
});
