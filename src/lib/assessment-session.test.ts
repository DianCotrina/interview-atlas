import { describe, expect, it } from "vitest";
import { assessmentReducer } from "./assessment-session";
import type { AttemptInput } from "./progress-api";

const input: AttemptInput = {
  attemptId: "11111111-1111-4111-8111-111111111111",
  conceptId: "big-o",
  questionId: "time-and-space",
  grade: "hesitated",
};
const attempt = { ...input, createdAt: "2026-10-04T12:00:00Z" };

describe("assessment session", () => {
  it("does not retry a permanent attempt conflict", () => {
    const saving = assessmentReducer(
      { status: "idle" },
      { type: "start", input },
    );
    const failed = assessmentReducer(saving, {
      type: "fail",
      message: "Conflict",
      retryable: false,
    });
    expect(assessmentReducer(failed, { type: "retry" })).toEqual(failed);
    expect(assessmentReducer(failed, { type: "start", input })).toEqual(failed);
  });
  it("retains the same ID and grade after an uncertain write", () => {
    const saving = assessmentReducer(
      { status: "idle" },
      { type: "start", input },
    );
    const failed = assessmentReducer(saving, {
      type: "fail",
      message: "Unavailable",
    });
    expect(assessmentReducer(failed, { type: "retry" })).toEqual({
      status: "saving",
      input,
    });
    expect(
      assessmentReducer(failed, {
        type: "start",
        input: { ...input, grade: "knew-it" },
      }),
    ).toEqual(failed);
    expect(assessmentReducer(failed, { type: "reset" })).toEqual(failed);
    expect(failed.status).toBe("failed");
  });
  it("ignores duplicate starts and resets while a write is pending", () => {
    const state = assessmentReducer(
      { status: "idle" },
      { type: "start", input },
    );
    expect(assessmentReducer(state, { type: "start", input })).toEqual(state);
    expect(assessmentReducer(state, { type: "reset" })).toEqual(state);
  });
  it("only confirms the exact pending payload", () => {
    const state = assessmentReducer(
      { status: "idle" },
      { type: "start", input },
    );
    expect(
      assessmentReducer(state, {
        type: "saved",
        attempt: { ...attempt, grade: "knew-it" },
      }),
    ).toEqual(state);
    expect(
      assessmentReducer(state, {
        type: "saved",
        attempt: {
          ...attempt,
          attemptId: "22222222-2222-4222-8222-222222222222",
        },
      }),
    ).toEqual(state);
    expect(assessmentReducer(state, { type: "saved", attempt })).toEqual({
      status: "saved",
      attempt,
    });
  });
  it("needs a confirmed save before starting another assessment", () => {
    const state = assessmentReducer(
      { status: "saving", input },
      { type: "saved", attempt },
    );
    expect(assessmentReducer(state, { type: "reset" })).toEqual({
      status: "idle",
    });
    expect(
      assessmentReducer({ status: "idle" }, { type: "saved", attempt }),
    ).toEqual({ status: "idle" });
  });
});
