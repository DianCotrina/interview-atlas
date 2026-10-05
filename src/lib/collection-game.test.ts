import { expect, it } from "vitest";
import { createGameState, gameReducer, missions, type GameState } from "./collection-game";

function solve(state: GameState): GameState {
  const mission = missions.find((m) => m.id === state.missionId)!;
  const value = state.phase === "structure" ? mission.collection
    : state.phase === "trace" ? mission.steps[state.cursor].expected
    : mission.complexity;
  return gameReducer(state, { type: "answer", value });
}

it("wrong answers and premature next cannot advance or award stars", () => {
  let state = gameReducer(createGameState(), { type: "answer", value: "set" });
  expect(state).toMatchObject({ phase: "structure", solved: false, verdict: "wrong" });
  expect(state.earned["dictionary-counting"]).toBe(0);
  state = gameReducer(state, { type: "next" });
  expect(state.phase).toBe("structure");
  const correct = solve(state);
  const trace = gameReducer(correct, { type: "next" });
  expect(trace.feedbackSequence).toBe(0);
  const wrongTrace = gameReducer(trace, { type: "answer", value: "increment" });
  expect(wrongTrace).toMatchObject({ cursor: 0, solved: false });
  expect(wrongTrace.earned["dictionary-counting"]).toBe(1);
});

it("awards exactly three stars after all objectives, and replay cannot farm them", () => {
  let state = createGameState();
  for (let round = 0; round < 2; round++) {
    for (let step = 0; step < 8 && state.phase !== "complete"; step++) {
      state = solve(state);
      const repeated = solve(state);
      expect(repeated.earned).toEqual(state.earned);
      state = gameReducer(state, { type: "next" });
    }
    expect(state.phase).toBe("complete");
    expect(state.earned["dictionary-counting"]).toBe(3);
    state = gameReducer(state, { type: "replay" });
    expect(state).toMatchObject({ phase: "structure", cursor: 0, solved: false });
  }
  expect(Object.values(state.earned).reduce((a, b) => a + b, 0)).toBe(3);
});

it("switches missions with clean board controls while retaining earned rewards", () => {
  const state = gameReducer(solve(createGameState()), { type: "select", missionId: "first-duplicate" });
  expect(state).toMatchObject({ missionId: "first-duplicate", phase: "structure", cursor: 0, verdict: null });
  expect(state.earned["dictionary-counting"]).toBe(1);
});

it("ignores options that do not belong to the current objective", () => {
  const state = createGameState();
  expect(gameReducer(state, { type: "answer", value: "bogus" })).toEqual(state);
  const trace = gameReducer(solve(state), { type: "next" });
  expect(gameReducer(trace, { type: "answer", value: "counts" })).toEqual(trace);
});

it("allows hints without advancing the board or changing rewards", () => {
  const state = gameReducer(createGameState(), { type: "hint" });
  expect(state.hint).toBe(true);
  expect(state.solved).toBe(false);
  expect(state.earned["dictionary-counting"]).toBe(0);
});

it("gives repeated wrong answers a fresh feedback identity", () => {
  const once = gameReducer(createGameState(), { type: "answer", value: "set" });
  const twice = gameReducer(once, { type: "answer", value: "set" });
  expect(once.feedbackSequence).toBe(1);
  expect(twice.feedbackSequence).toBe(2);
  expect(twice.solved).toBe(false);
  expect(twice.earned).toEqual(once.earned);
});
