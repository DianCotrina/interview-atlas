import { anagramTrace, countingTrace, duplicateTrace, groupingTrace, type TraceStep } from "./collection-traces";

export const missionIds = ["dictionary-counting", "grouping", "first-duplicate", "anagrams"] as const;
export type MissionId = (typeof missionIds)[number];
export type Collection = "list" | "set" | "counts" | "groups";
export type Complexity = "linear-distinct" | "linear-all" | "quadratic" | "constant";
export function complexityOptions(id: MissionId): Complexity[] {
  return id === "grouping" ? ["linear-all", "linear-distinct", "quadratic", "constant"]
    : id === "first-duplicate" ? ["quadratic", "linear-all", "constant"]
    : ["quadratic", "constant", "linear-distinct"];
}
export type Mission = { id: MissionId; collection: Collection; complexity: Complexity; input: string[]; steps: TraceStep[] };
export const missions: Mission[] = [
  { id: "dictionary-counting", collection: "counts", complexity: "linear-distinct", input: ["OK", "WAIT", "OK", "FAIL", "OK"], steps: countingTrace(["OK", "WAIT", "OK", "FAIL", "OK"]) },
  { id: "grouping", collection: "groups", complexity: "linear-all", input: ["Ada: scan", "Lin: check", "Ada: review", "Lin: scan"], steps: groupingTrace([["Ada", "scan"], ["Lin", "check"], ["Ada", "review"], ["Lin", "scan"]]) },
  { id: "first-duplicate", collection: "set", complexity: "linear-all", input: ["A", "B", "B", "A"], steps: duplicateTrace(["A", "B", "B", "A"]) },
  { id: "anagrams", collection: "counts", complexity: "linear-distinct", input: ['a = "aab"', 'b = "abb"'], steps: anagramTrace("aab", "abb") },
];
export type Phase = "structure" | "trace" | "complexity" | "complete";
export type GameState = {
  missionId: MissionId;
  phase: Phase;
  cursor: number;
  solved: boolean;
  verdict: "correct" | "wrong" | null;
  hint: boolean;
  earned: Record<MissionId, number>;
};
export type GameAction = { type: "answer"; value: string } | { type: "next" } | { type: "hint" } | { type: "replay" } | { type: "select"; missionId: MissionId };
export function createGameState(): GameState {
  return { missionId: "dictionary-counting", phase: "structure", cursor: 0, solved: false, verdict: null, hint: false,
    earned: { "dictionary-counting": 0, grouping: 0, "first-duplicate": 0, anagrams: 0 } };
}
export function gameReducer(state: GameState, action: GameAction): GameState {
  const mission = missions.find((m) => m.id === state.missionId)!;
  if (action.type === "select" || action.type === "replay") {
    return { ...createGameState(), earned: state.earned,
      missionId: action.type === "select" ? action.missionId : state.missionId };
  }
  if (action.type === "hint") return { ...state, hint: !state.hint };
  if (action.type === "next") {
    if (!state.solved || state.phase === "complete") return state;
    const next = { ...state, solved: false, verdict: null, hint: false };
    if (state.phase === "structure") return { ...next, phase: "trace" };
    if (state.phase === "trace") return state.cursor + 1 < mission.steps.length
      ? { ...next, cursor: state.cursor + 1 }
      : { ...next, phase: "complexity" };
    return { ...next, phase: "complete" };
  }
  if (state.solved || state.phase === "complete") return state;
  const choices: readonly string[] = state.phase === "structure" ? ["list", "set", "counts", "groups"]
    : state.phase === "trace" ? mission.steps[state.cursor].choices
    : complexityOptions(state.missionId);
  if (!choices.includes(action.value)) return state;
  const expected = state.phase === "structure" ? mission.collection
    : state.phase === "trace" ? mission.steps[state.cursor].expected : mission.complexity;
  if (action.value !== expected) return { ...state, verdict: "wrong" };
  const stars = state.phase === "structure" ? 1 : state.phase === "complexity" ? 3
    : state.cursor === mission.steps.length - 1 ? 2 : 1;
  return { ...state, solved: true, verdict: "correct",
    earned: { ...state.earned, [state.missionId]: Math.max(state.earned[state.missionId], stars) } };
}
