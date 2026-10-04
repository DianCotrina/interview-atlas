import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getProgress,
  ProgressAPIError,
  recordAttempt,
  type AttemptInput,
} from "./progress-api";

const input: AttemptInput = {
  attemptId: "11111111-1111-4111-8111-111111111111",
  conceptId: "big-o",
  questionId: "time-and-space",
  grade: "hesitated",
};
const attempt = { ...input, createdAt: "2026-10-04T12:00:00Z" };
const response = (value: unknown, status = 200) =>
  new Response(JSON.stringify(value), {
    status,
    headers: { "Content-Type": "application/json" },
  });
afterEach(() => vi.useRealTimers());

describe("progress API client", () => {
  it.each([201, 200])(
    "accepts a confirmed attempt with HTTP %d",
    async (status) => {
      const fetcher = vi.fn<typeof fetch>(async () =>
        response(attempt, status),
      );
      expect(await recordAttempt(input, fetcher)).toEqual(attempt);
      expect(fetcher.mock.calls[0]?.[1]?.body).toBe(JSON.stringify(input));
      expect(fetcher.mock.calls[0]?.[1]?.signal).toBeInstanceOf(AbortSignal);
    },
  );
  it("serializes an explicit retry identically", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockRejectedValueOnce(new TypeError("network"))
      .mockResolvedValueOnce(response(attempt));
    await expect(recordAttempt(input, fetcher)).rejects.toBeInstanceOf(
      ProgressAPIError,
    );
    await recordAttempt(input, fetcher);
    expect(fetcher.mock.calls[0]?.[1]?.body).toBe(
      fetcher.mock.calls[1]?.[1]?.body,
    );
  });
  it.each([409, 503])(
    "preserves the public error status %d",
    async (status) => {
      const fetcher: typeof fetch = async () =>
        response(
          { error: { code: "attempt_conflict", message: "Cannot save" } },
          status,
        );
      await expect(recordAttempt(input, fetcher)).rejects.toMatchObject({
        status,
        code: "attempt_conflict",
      });
    },
  );
  it("rejects malformed JSON, incomplete records and mismatched confirmations", async () => {
    const malformed: typeof fetch = async () => new Response("{invalid");
    await expect(recordAttempt(input, malformed)).rejects.toMatchObject({
      code: "invalid_response",
    });
    for (const value of [
      { ...input },
      { ...attempt, grade: "excellent" },
      { ...attempt, questionId: "nested-loops" },
      { ...attempt, createdAt: "yesterday" },
    ]) {
      await expect(
        recordAttempt(input, async () => response(value)),
      ).rejects.toMatchObject({ code: "invalid_response" });
    }
  });
  it("validates progress rather than trusting an HTTP success", async () => {
    const row = {
      conceptId: "big-o",
      questionId: "time-and-space",
      attemptCount: 2,
      latestGrade: "hesitated",
      lastReviewedAt: attempt.createdAt,
    };
    expect(await getProgress(async () => response([row]))).toEqual([row]);
    expect(await getProgress(async () => response([]))).toEqual([]);
    for (const value of [
      null,
      {},
      [{ ...row, attemptCount: -1 }],
      [{ ...row, latestGrade: "perfect" }],
    ]) {
      await expect(
        getProgress(async () => response(value)),
      ).rejects.toMatchObject({ code: "invalid_response" });
    }
  });
  it("aborts an unresponsive request with a finite timeout", async () => {
    vi.useFakeTimers();
    const fetcher: typeof fetch = async (_url, init) =>
      new Promise((_resolve, reject) => {
        init?.signal?.addEventListener(
          "abort",
          () => reject(new DOMException("Timeout", "AbortError")),
          { once: true },
        );
      });
    const pending = expect(recordAttempt(input, fetcher)).rejects.toMatchObject(
      { code: "unreachable" },
    );
    await vi.advanceTimersByTimeAsync(5000);
    await pending;
  });
});
