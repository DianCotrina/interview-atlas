"use client";

import { useId, useReducer, useRef, useState } from "react";
import type { DrillQuestion } from "@/lib/content";
import { assessmentReducer } from "@/lib/assessment-session";
import {
  gradeLabels,
  ProgressAPIError,
  recordAttempt,
  type AttemptInput,
  type Grade,
} from "@/lib/progress-api";
import { ConceptMarkdown } from "./ConceptMarkdown";
import { ProgressSummary } from "./ProgressSummary";

function Question({
  conceptId,
  question,
  index,
  onSaved,
}: {
  conceptId: string;
  question: DrillQuestion;
  index: number;
  onSaved: () => void;
}) {
  const answerId = useId();
  const [revealed, setRevealed] = useState(false);
  const [state, dispatch] = useReducer(assessmentReducer, { status: "idle" });
  const inFlight = useRef(false);

  async function send(input: AttemptInput) {
    try {
      const attempt = await recordAttempt(input);
      dispatch({ type: "saved", attempt });
      onSaved();
    } catch (error) {
      const message =
        error instanceof ProgressAPIError && error.status === 409
          ? "Este intento tiene un conflicto. El servidor no confirmó tu valoración."
          : "No se pudo confirmar el guardado. Mantén esta página abierta para reintentar el mismo repaso.";
      dispatch({ type: "fail", message });
    } finally {
      inFlight.current = false;
    }
  }

  function grade(grade: Grade) {
    if (!revealed || state.status !== "idle" || inFlight.current) return;
    const input: AttemptInput = {
      attemptId: crypto.randomUUID(),
      conceptId,
      questionId: question.id,
      grade,
    };
    inFlight.current = true;
    dispatch({ type: "start", input });
    void send(input);
  }

  function retry() {
    if (state.status !== "failed" || inFlight.current) return;
    inFlight.current = true;
    dispatch({ type: "retry" });
    void send(state.input);
  }

  return (
    <article className="question-card">
      <div className="question-heading">
        <span className="question-number">
          {String(index + 1).padStart(2, "0")}
        </span>
        <h3>{question.question}</h3>
      </div>
      <button
        className="reveal-button"
        aria-expanded={revealed}
        aria-controls={answerId}
        onClick={() => setRevealed((value) => !value)}
      >
        {revealed ? "Ocultar respuesta" : "Revelar respuesta"}{" "}
        <span aria-hidden="true">{revealed ? "−" : "+"}</span>
      </button>
      <div id={answerId} hidden={!revealed} className="question-answer">
        <ConceptMarkdown body={question.answer} />
      </div>
      {revealed && (
        <div className="assessment-controls">
          <p>¿Cómo te fue antes de ver la respuesta?</p>
          <div className="grade-buttons">
            {(Object.keys(gradeLabels) as Grade[]).map((value) => (
              <button
                key={value}
                className={`grade-button ${value}`}
                disabled={state.status !== "idle"}
                onClick={() => grade(value)}
              >
                {gradeLabels[value]}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="save-state" aria-live="polite" aria-atomic="true">
        {state.status === "saving" && <p>Guardando repaso…</p>}
        {state.status === "failed" && (
          <div className="save-error">
            <p>{state.message}</p>
            <button className="secondary-button" onClick={retry}>
              Reintentar guardado
            </button>
          </div>
        )}
        {state.status === "saved" && (
          <p className="save-success">
            ✓ Guardado: {gradeLabels[state.attempt.grade]}.
          </p>
        )}
      </div>
      {state.status === "saved" && (
        <button
          className="new-review"
          onClick={() => {
            dispatch({ type: "reset" });
            setRevealed(false);
          }}
        >
          Repasar esta pregunta otra vez ↗
        </button>
      )}
    </article>
  );
}

export function QuestionPractice({
  conceptId,
  questions,
}: {
  conceptId: string;
  questions: DrillQuestion[];
}) {
  const [refreshVersion, setRefreshVersion] = useState(0);
  if (questions.length === 0) return null;
  return (
    <section className="question-practice" aria-labelledby="practice-heading">
      <div className="practice-heading">
        <div>
          <p className="eyebrow">De recordar a explicar</p>
          <h2 id="practice-heading">Práctica en voz alta</h2>
        </div>
        <span>{questions.length} preguntas</span>
      </div>
      <p className="practice-intro">
        Responde primero. Después revela la respuesta y registra cómo te fue.
      </p>
      <ProgressSummary
        conceptId={conceptId}
        questions={questions}
        refreshVersion={refreshVersion}
      />
      <div className="question-list">
        {questions.map((question, index) => (
          <Question
            key={question.id}
            conceptId={conceptId}
            question={question}
            index={index}
            onSaved={() => setRefreshVersion((value) => value + 1)}
          />
        ))}
      </div>
    </section>
  );
}
