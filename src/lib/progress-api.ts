export type Grade = "knew-it" | "hesitated" | "did-not-know";
export type AttemptInput = {
  attemptId: string;
  conceptId: string;
  questionId: string;
  grade: Grade;
};
export type Attempt = AttemptInput & { createdAt: string };
export type QuestionProgress = {
  conceptId: string;
  questionId: string;
  attemptCount: number;
  latestGrade: Grade;
  lastReviewedAt: string;
};

export class ProgressAPIError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "ProgressAPIError";
  }
}

const baseURL = (
  process.env.NEXT_PUBLIC_PROGRESS_API_URL || "http://127.0.0.1:8088"
).replace(/\/+$/, "");
const slug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const isID = (value: unknown): value is string =>
  typeof value === "string" && value.length <= 128 && slug.test(value);
const isGrade = (value: unknown): value is Grade =>
  value === "knew-it" || value === "hesitated" || value === "did-not-know";
const isTimestamp = (value: unknown): value is string =>
  typeof value === "string" &&
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/.test(value) &&
  Number.isFinite(Date.parse(value));

function isAttempt(value: unknown): value is Attempt {
  return (
    isRecord(value) &&
    typeof value.attemptId === "string" &&
    uuid.test(value.attemptId) &&
    isID(value.conceptId) &&
    isID(value.questionId) &&
    isGrade(value.grade) &&
    isTimestamp(value.createdAt)
  );
}

function isProgress(value: unknown): value is QuestionProgress {
  return (
    isRecord(value) &&
    isID(value.conceptId) &&
    isID(value.questionId) &&
    typeof value.attemptCount === "number" &&
    Number.isSafeInteger(value.attemptCount) &&
    value.attemptCount > 0 &&
    isGrade(value.latestGrade) &&
    isTimestamp(value.lastReviewedAt)
  );
}

async function request(
  path: string,
  init: RequestInit,
  fetcher: typeof fetch,
): Promise<{ status: number; value: unknown }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  try {
    const response = await fetcher(`${baseURL}${path}`, {
      ...init,
      signal: controller.signal,
      cache: "no-store",
    });
    let value: unknown;
    try {
      value = await response.json();
    } catch {
      if (controller.signal.aborted)
        throw new ProgressAPIError(
          0,
          "unreachable",
          "Progress request timed out",
        );
      throw new ProgressAPIError(
        response.status,
        "invalid_response",
        "Invalid progress response",
      );
    }
    if (!response.ok) {
      if (
        isRecord(value) &&
        isRecord(value.error) &&
        typeof value.error.code === "string" &&
        typeof value.error.message === "string"
      ) {
        throw new ProgressAPIError(
          response.status,
          value.error.code,
          value.error.message,
        );
      }
      throw new ProgressAPIError(
        response.status,
        "invalid_response",
        "Invalid progress error response",
      );
    }
    return { status: response.status, value };
  } catch (error) {
    if (error instanceof ProgressAPIError) throw error;
    throw new ProgressAPIError(
      0,
      "unreachable",
      "Could not reach study progress",
    );
  } finally {
    clearTimeout(timer);
  }
}

export async function recordAttempt(
  input: AttemptInput,
  fetcher: typeof fetch = fetch,
): Promise<Attempt> {
  const { status, value } = await request(
    "/api/attempts",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
    fetcher,
  );
  if (
    (status !== 200 && status !== 201) ||
    !isAttempt(value) ||
    value.attemptId !== input.attemptId ||
    value.conceptId !== input.conceptId ||
    value.questionId !== input.questionId ||
    value.grade !== input.grade
  ) {
    throw new ProgressAPIError(
      status,
      "invalid_response",
      "Server did not confirm this review attempt",
    );
  }
  return value;
}

export async function getProgress(
  fetcher: typeof fetch = fetch,
): Promise<QuestionProgress[]> {
  const { status, value } = await request(
    "/api/progress",
    { method: "GET" },
    fetcher,
  );
  if (status !== 200 || !Array.isArray(value) || !value.every(isProgress)) {
    throw new ProgressAPIError(
      status,
      "invalid_response",
      "Invalid study progress",
    );
  }
  const identities = new Set(
    value.map((row) => `${row.conceptId}/${row.questionId}`),
  );
  if (identities.size !== value.length)
    throw new ProgressAPIError(
      status,
      "invalid_response",
      "Duplicate progress identities",
    );
  return value;
}
