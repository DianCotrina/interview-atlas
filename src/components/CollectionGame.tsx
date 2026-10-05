"use client";

import Link from "next/link";
import { useEffect, useId, useRef } from "react";
import { complexityOptions, missions, type Collection } from "../lib/collection-game";
import { gameCopy } from "../lib/game-copy";
import { localeHref, type Locale } from "../lib/locale";
import { CollectionBoard } from "./CollectionBoard";
import { useCollectionGame } from "./CollectionGameSession";

const collections: Collection[] = ["list", "set", "counts", "groups"];

export function CollectionGame({ locale }: { locale: Locale }) {
  const { state, dispatch } = useCollectionGame();
  const text = gameCopy[locale];
  const mission = missions.find((m) => m.id === state.missionId)!;
  const copy = text.missions[mission.id];
  const step = mission.steps[state.cursor];
  const stars = Object.values(state.earned).reduce((sum, count) => sum + count, 0);
  const currentIndex = missions.findIndex((m) => m.id === mission.id);
  const nextMission = missions[(currentIndex + 1) % missions.length];
  const heading = useRef<HTMLHeadingElement>(null);
  const continueButton = useRef<HTMLButtonElement>(null);
  const location = `${state.missionId}/${state.phase}/${state.cursor}`;
  const previousLocation = useRef(location);
  const hintId = useId();
  useEffect(() => {
    if (previousLocation.current !== location) {
      heading.current?.focus();
      previousLocation.current = location;
    } else if (state.solved) continueButton.current?.focus();
  }, [location, state.solved]);

  const feedback = state.phase === "structure" ? copy.structure
    : state.phase === "trace" ? text.reasons[step.reason] : copy.complexity;
  const wrongFeedback = state.phase === "structure" ? text.wrongStructure
    : state.phase === "trace" ? text.wrongReasons[step.reason] : text.wrongComplexity;
  const rows = state.phase === "structure" ? []
    : state.phase === "trace" ? (state.solved ? step.after : step.before)
    : mission.steps.at(-1)!.after;

  return (
    <div className="collection-game">
      <header className="game-intro">
        <div>
          <p>{text.campaign}</p>
          <h1>{text.title}</h1>
          <p>{text.intro}</p>
        </div>
        <div className="game-score">
          <span aria-hidden="true">★</span>
          <strong>{stars}<small> / 12</small></strong>
          <span>{text.stars}</span>
        </div>
      </header>

      <section className="mission-map" aria-label={text.map}>
        {missions.map((item, index) => (
          <button key={item.id} className={`mission-node ${item.id === mission.id ? "is-current" : ""} ${state.earned[item.id] === 3 ? "is-complete" : ""}`}
            aria-pressed={item.id === mission.id}
            onClick={() => dispatch({ type: "select", missionId: item.id })}>
            <span className="mission-node-icon" aria-hidden="true">{state.earned[item.id] === 3 ? "✓" : index + 1}</span>
            <span><strong>{text.missions[item.id].title}</strong><span className="mission-node-stars">
              <span aria-hidden="true">{"★".repeat(state.earned[item.id])}{"☆".repeat(3 - state.earned[item.id])}</span>
              <span className="sr-only">{state.earned[item.id]} / 3 {text.stars}</span>
            </span></span>
          </button>
        ))}
      </section>

      <div className="mission-workspace">
        <section className="mission-challenge" aria-labelledby="mission-heading">
          <ol className="mission-objectives">
            {(["structure", "trace", "complexity"] as const).map((phase, index) => (
              <li key={phase} className={state.phase === phase ? "objective-current" : ""}
                aria-current={state.phase === phase ? "step" : undefined}>
                <span aria-hidden="true">{index < ["structure", "trace", "complexity", "complete"].indexOf(state.phase)
                  || (state.phase === phase && state.solved && (phase !== "trace" || state.cursor === mission.steps.length - 1)) ? "✓" : index + 1}</span>{text.phases[phase]}
              </li>
            ))}
          </ol>

          {state.phase === "complete" ? (
            <div className="mission-victory">
              <div className="mission-medal" aria-hidden="true">★</div>
              <h2 id="mission-heading" ref={heading} tabIndex={-1}>{text.complete}</h2>
              <p>{text.completed}</p><strong>{copy.badge}</strong>
              <p>{text.rewardNote}</p>
              {stars === 12 && <p className="campaign-complete">{text.allDone}</p>}
              <div className="mission-actions">
                <button className="game-primary" onClick={() => dispatch({ type: "select", missionId: nextMission.id })}>{text.nextMission}</button>
                <button className="game-secondary" onClick={() => dispatch({ type: "replay" })}>{text.replay}</button>
              </div>
            </div>
          ) : (
            <>
              <h2 id="mission-heading" ref={heading} tabIndex={-1}>{copy.title}</h2>
              <p className="mission-goal">{copy.goal}</p>
              {state.phase === "trace" && <div className="current-item">
                <div><span>{text.current}</span><code>{step.item}</code></div>
                <span>{text.step} {state.cursor + 1} / {mission.steps.length}</span>
              </div>}
              <fieldset className="mission-choices" disabled={state.solved}>
                <legend>{state.phase === "structure" ? text.structurePrompt : state.phase === "trace" ? text.tracePrompt : text.complexityPrompt}</legend>
                {state.phase === "complexity" && <p className="complexity-definitions">{copy.definitions}</p>}
                <div className="answer-tiles">
                  {state.phase === "structure" ? collections.map((value) => (
                    <button key={value} onClick={() => dispatch({ type: "answer", value })}>{text.collectionNames[value]}</button>
                  )) : state.phase === "trace" ? step.choices.map((value) => (
                    <button key={value} onClick={() => dispatch({ type: "answer", value })}>{text.decisions[value]}</button>
                  )) : complexityOptions(mission.id).map((value) => (
                    <button key={value} onClick={() => dispatch({ type: "answer", value })}>{text.complexityNames[value]}</button>
                  ))}
                </div>
              </fieldset>
              <div className={`mission-feedback ${state.verdict ?? ""}`} aria-live="polite" aria-atomic="true">
                {state.verdict && <p><strong>{state.verdict === "correct" ? text.correct : text.wrong}</strong> {text.attempt} {state.feedbackSequence}. {state.verdict === "correct" ? feedback : wrongFeedback}</p>}
              </div>
              <div className="mission-actions">
                {state.solved && <button ref={continueButton} className="game-primary" onClick={() => dispatch({ type: "next" })}>{text.next}</button>}
                <button className="game-secondary" aria-expanded={state.hint} aria-controls={hintId} onClick={() => dispatch({ type: "hint" })}>
                  {state.hint ? text.hideHint : text.showHint}
                </button>
              </div>
              <p id={hintId} hidden={!state.hint} className="mission-hint">{state.phase === "complexity" ? copy.complexity : copy.hint}</p>
            </>
          )}
          <Link className="mission-study-link" href={localeHref(locale, `/concepts/${mission.id}/`)}>{text.read}</Link>
        </section>

        <aside className="mission-inventory">
          <div className="mission-input"><h3>{text.input}</h3>
            <div>{mission.input.map((item, index) => <code key={index}
              className={mission.id !== "anagrams" && state.phase === "trace" && state.cursor === index ? "input-current" : ""}>{item}</code>)}</div>
          </div>
          <CollectionBoard rows={rows} before={state.phase === "trace" && state.solved ? step.before : rows} empty={text.empty} label={text.collection} />
        </aside>
      </div>
      <p className="game-session-note">{text.session}</p>
      <noscript><p>{text.noScript} {text.read}: {missions.map((m) => <a key={m.id} href={localeHref(locale, `/concepts/${m.id}/`)}> {text.missions[m.id].title} </a>)}</p></noscript>
    </div>
  );
}
