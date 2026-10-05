"use client";

import { useEffect, useId, useReducer, useRef, useState } from "react";
import type { DrillQuestion } from "@/lib/content";
import {
  assessmentReducer,
  blocksLanguageSwitch,
} from "@/lib/assessment-session";
import {
  ProgressAPIError,
  recordAttempt,
  type AttemptInput,
  type Grade,
} from "@/lib/progress-api";
import { ConceptMarkdown } from "./ConceptMarkdown";
import { ProgressSummary } from "./ProgressSummary";
import type { Locale } from "@/lib/locale";
import { messages } from "@/lib/messages";
import { useReviewNavigation } from "./ReviewNavigation";

function Question({
  conceptId,
  question,
  index,
  onSaved,
  locale,
}: {
  conceptId: string;
  question: DrillQuestion;
  index: number;
  onSaved: () => void;
  locale: Locale;
}) {
  const answerId = useId();
  const [revealed, setRevealed] = useState(false);
  const [state, dispatch] = useReducer(assessmentReducer, { status: "idle" });
  const inFlight = useRef(false);
  const text = messages[locale].practice;
  const gradeLabels = messages[locale].grades;
  const { setPending } = useReviewNavigation();
  const pending = blocksLanguageSwitch(state);
  useEffect(() => {
    setPending(answerId, pending);
    return () => setPending(answerId, false);
  }, [answerId, pending, setPending]);

  async function send(input: AttemptInput) {
    try {
      const attempt = await recordAttempt(input);
      dispatch({ type: "saved", attempt });
      onSaved();
    } catch (error) {
      const conflict =
        error instanceof ProgressAPIError && error.status === 409;
      const message = conflict ? text.conflict : text.failed;
      dispatch({ type: "fail", message, retryable: !conflict });
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
    if (state.status !== "failed" || !state.retryable || inFlight.current)
      return;
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
        {revealed ? text.hide : text.reveal}{" "}
        <span aria-hidden="true">{revealed ? "−" : "+"}</span>
      </button>
      <div id={answerId} hidden={!revealed} className="question-answer">
        <ConceptMarkdown body={question.answer} locale={locale} />
      </div>
      {revealed && (
        <div className="assessment-controls">
          <p>{text.assessment}</p>
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
        {state.status === "saving" && <p>{text.saving}</p>}
        {state.status === "failed" && (
          <div className="save-error">
            <p>{state.message}</p>
            {state.retryable && (
              <button className="secondary-button" onClick={retry}>
                {text.retry}
              </button>
            )}
          </div>
        )}
        {state.status === "saved" && (
          <p className="save-success">
            ✓ {text.saved}: {gradeLabels[state.attempt.grade]}.
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
          {text.again} ↗
        </button>
      )}
    </article>
  );
}

export function QuestionPractice({
  conceptId,
  questions,
  locale,
}: {
  conceptId: string;
  questions: DrillQuestion[];
  locale: Locale;
}) {
  const [refreshVersion, setRefreshVersion] = useState(0);
  const text = messages[locale].practice;
  if (questions.length === 0) return null;
  return (
    <section className="question-practice" aria-labelledby="practice-heading">
      <div className="practice-heading">
        <div>
          <p className="eyebrow">{text.eyebrow}</p>
          <h2 id="practice-heading">{text.heading}</h2>
        </div>
        <span>
          {questions.length}{" "}
          {questions.length === 1 ? text.singular : text.plural}
        </span>
      </div>
      <p className="practice-intro">{text.intro}</p>
      <ProgressSummary
        conceptId={conceptId}
        questions={questions}
        refreshVersion={refreshVersion}
        locale={locale}
      />
      <div className="question-list">
        {questions.map((question, index) => (
          <Question
            key={question.id}
            conceptId={conceptId}
            question={question}
            index={index}
            locale={locale}
            onSaved={() => setRefreshVersion((value) => value + 1)}
          />
        ))}
      </div>
    </section>
  );
}
