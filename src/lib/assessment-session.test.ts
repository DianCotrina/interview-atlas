import { describe, expect, it } from "vitest";
import { assessmentReducer, blocksLanguageSwitch } from "./assessment-session";
import type { AttemptInput } from "./progress-api";

const input: AttemptInput = {
  attemptId: "11111111-1111-4111-8111-111111111111",
  conceptId: "big-o",
  questionId: "time-and-space",
  grade: "hesitated",
};
const attempt = { ...input, createdAt: "2026-10-04T12:00:00Z" };

describe("assessment session", () => {
  it("blocks language changes while saving and releases after confirmation", () => {
    const saving = assessmentReducer(
      { status: "idle" },
      { type: "start", input },
    );
    expect(blocksLanguageSwitch({ status: "idle" })).toBe(false);
    expect(blocksLanguageSwitch(saving)).toBe(true);
    expect(
      blocksLanguageSwitch(
        assessmentReducer(saving, { type: "saved", attempt }),
      ),
    ).toBe(false);
  });
  it("protects the retry identity after a retryable failure", () => {
    const failed = assessmentReducer(
      { status: "saving", input },
      { type: "fail", message: "Unavailable" },
    );
    expect(blocksLanguageSwitch(failed)).toBe(true);
  });
  it("allows language changes after a definitive conflict rejection", () => {
    const failed = assessmentReducer(
      { status: "saving", input },
      { type: "fail", message: "Conflict", retryable: false },
    );
    expect(blocksLanguageSwitch(failed)).toBe(false);
    expect(assessmentReducer(failed, { type: "retry" })).toEqual(failed);
  });
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
