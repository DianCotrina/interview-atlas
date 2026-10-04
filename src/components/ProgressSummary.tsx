"use client";

import { useEffect, useState } from "react";
import type { DrillQuestion } from "@/lib/content";
import {
  getProgress,
  gradeLabels,
  type QuestionProgress,
} from "@/lib/progress-api";

type HistoryState =
  | { status: "loading" }
  | { status: "ready"; rows: QuestionProgress[]; version: string }
  | { status: "unavailable"; version: string };

export function ProgressSummary({
  conceptId,
  questions,
  refreshVersion,
}: {
  conceptId: string;
  questions: DrillQuestion[];
  refreshVersion: number;
}) {
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
    <aside className="progress-summary" aria-label="Historial de repasos">
      <div className="progress-title">
        <span aria-hidden="true">↻</span>
        <h3>Tu historial de repasos</h3>
      </div>
      <div aria-live="polite">
        {refreshing ? (
          <p>Consultando historial…</p>
        ) : history.status === "unavailable" ? (
          <p>
            Historial no disponible. Puedes seguir leyendo y revelar respuestas.
          </p>
        ) : rows.length === 0 ? (
          <p>Aún no hay repasos guardados para este concepto.</p>
        ) : (
          <>
            <p>
              <strong>
                {attemptCount} {attemptCount === 1 ? "repaso guardado" : "repasos guardados"}
              </strong>{" "}
              · {rows.length} de {questions.length} preguntas repasadas
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
                    {row.attemptCount === 1 ? "repaso" : "repasos"}
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
          Volver a consultar
        </button>
      )}
    </aside>
  );
}
