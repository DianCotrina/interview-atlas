import type { Attempt, AttemptInput } from "./progress-api";

export type AssessmentState =
  | { status: "idle" }
  | { status: "saving"; input: AttemptInput }
  | { status: "failed"; input: AttemptInput; message: string }
  | { status: "saved"; attempt: Attempt };
export type AssessmentAction =
  | { type: "start"; input: AttemptInput }
  | { type: "fail"; message: string }
  | { type: "retry" }
  | { type: "saved"; attempt: Attempt }
  | { type: "reset" };

export function assessmentReducer(
  state: AssessmentState,
  action: AssessmentAction,
): AssessmentState {
  switch (action.type) {
    case "start":
      return state.status === "idle"
        ? { status: "saving", input: action.input }
        : state;
    case "fail":
      return state.status === "saving"
        ? { status: "failed", input: state.input, message: action.message }
        : state;
    case "retry":
      return state.status === "failed"
        ? { status: "saving", input: state.input }
        : state;
    case "saved": {
      if (state.status !== "saving") return state;
      const { input } = state;
      const { attempt } = action;
      return attempt.attemptId === input.attemptId &&
        attempt.conceptId === input.conceptId &&
        attempt.questionId === input.questionId &&
        attempt.grade === input.grade
        ? { status: "saved", attempt }
        : state;
    }
    case "reset":
      return state.status === "saved" ? { status: "idle" } : state;
  }
}
