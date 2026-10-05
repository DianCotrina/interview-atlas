"use client";

import { useEffect, useState } from "react";
import type { DrillQuestion } from "@/lib/content";
import { getProgress, type QuestionProgress } from "@/lib/progress-api";
import type { Locale } from "@/lib/locale";
import { messages } from "@/lib/messages";

type HistoryState =
  | { status: "loading" }
  | { status: "ready"; rows: QuestionProgress[]; version: string }
  | { status: "unavailable"; version: string };

export function ProgressSummary({
  conceptId,
  questions,
  refreshVersion,
  locale,
}: {
  conceptId: string;
  questions: DrillQuestion[];
  refreshVersion: number;
  locale: Locale;
}) {
  const text = messages[locale].history;
  const gradeLabels = messages[locale].grades;
  const [retry, setRetry] = useState(0);
  const [history, setHistory] = useState<HistoryState>({ status: "loading" });
  const version = `${conceptId}/${refreshVersion}/${retry}`;
  useEffect(() => {
    let active = true;
    getProgress()
      .then((rows) => {
        if (active) setHistory({ status: "ready", rows, version });
      })
      .catch(() => {
        if (active) setHistory({ status: "unavailable", version });
      });
    return () => {
      active = false;
    };
  }, [version]);

  const refreshing =
    history.status === "loading" || history.version !== version;
  const rows =
    history.status === "ready"
      ? history.rows.filter(
          (row) =>
            row.conceptId === conceptId &&
            questions.some((q) => q.id === row.questionId),
        )
      : [];
  const attemptCount = rows.reduce((sum, row) => sum + row.attemptCount, 0);
  return (
    <aside className="progress-summary" aria-label={text.label}>
      <div className="progress-title">
        <span aria-hidden="true">↻</span>
        <h3>{text.heading}</h3>
      </div>
      <div aria-live="polite">
        {refreshing ? (
          <p>{text.loading}</p>
        ) : history.status === "unavailable" ? (
          <p>{text.unavailable}</p>
        ) : rows.length === 0 ? (
          <p>{text.empty}</p>
        ) : (
          <>
            <p>
              <strong>
                {attemptCount}{" "}
                {attemptCount === 1 ? text.savedSingular : text.savedPlural}
              </strong>{" "}
              · {rows.length} {text.of} {questions.length}{" "}
              {text.questionsReviewed}
            </p>
            <ul className="history-list">
              {rows.map((row) => (
                <li key={row.questionId}>
                  <span>
                    {questions.find((q) => q.id === row.questionId)?.question}
                  </span>
                  <span>
                    <strong>{gradeLabels[row.latestGrade]}</strong> ·{" "}
                    {row.attemptCount}{" "}
                    {row.attemptCount === 1
                      ? text.reviewSingular
                      : text.reviewPlural}
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
      {!refreshing && history.status === "unavailable" && (
        <button
          className="secondary-button"
          onClick={() => setRetry((value) => value + 1)}
        >
          {text.retry}
        </button>
      )}
    </aside>
  );
}
