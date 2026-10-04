# Empieza aquí

Este paquete es el punto de partida del repo **Interview Atlas**. No es código todavía:
son las instrucciones para que Claude Code y Codex construyan contigo la página, y para
que tú aprendas system design tomando las decisiones.

## Qué hay en el paquete

| Archivo | Para qué sirve | Quién lo lee |
|---|---|---|
| `AGENTS.md` | Las reglas de trabajo: tú decides la arquitectura, ellos proponen opciones y te cuestionan | Codex (directo) y Claude Code (vía `CLAUDE.md`) |
| `CLAUDE.md` | Importa `AGENTS.md` + 3 reglas propias de Claude Code | Claude Code |
| `docs/SPEC.md` | Qué se construye, en 4 fases, con tareas `[DIEGO]` y `[AGENT]` | Tú y los agentes |
| `docs/CONTENT_SEED.md` | Todo lo que estudiamos, listo para convertirse en páginas | Los agentes al cargar contenido; tú para repasar |
| `docs/SYSTEM_DESIGN_TRACK.md` | Cómo cada fase te enseña system design, y las preguntas antes de cada ADR | Tú |
| `docs/adr/0000-template.md` | Plantilla para documentar cada decisión | Tú |

## Setup (10 minutos)

1. Crea un repo nuevo (sugerencia de nombre: `interview-atlas`). Decide si público desde
   el día uno o privado hasta pulir la Fase 1 — es una pregunta abierta en el spec.
2. Copia **todo este paquete** a la raíz del repo, respetando la carpeta `docs/`.
3. Primer commit: `docs: project spec and agent instructions`.
4. Abre Claude Code o Codex en esa carpeta y pega el prompt de arranque de abajo.

La primera vez que Claude Code vea el `@AGENTS.md` dentro de `CLAUDE.md` te pedirá
aprobar la importación. Acéptala. Para confirmar que lo cargó, corre `/context` y busca
`CLAUDE.md` en los archivos de memoria.

## Prompt de arranque — primera sesión

```
Read AGENTS.md, docs/SPEC.md, and docs/CONTENT_SEED.md.

Then give me, in Spanish:
1. A 5-line summary of what we're building and how we'll work together.
2. The Phase 1 task list in the order you'd do it, marking which ones are [DIEGO].
3. Anything in the spec that's ambiguous or that you'd push back on.

Don't write code yet. Wait for me to pick the first task.
```

## Prompt para cada sesión siguiente

```
Check docs/SPEC.md for the first unchecked task in the current phase.
Tell me which one it is and whether it's [DIEGO] or [AGENT]. Wait for my go-ahead.
```

## Prompt para una decisión de arquitectura (ADR)

```
I need to make ADR-00X: <tema>. Act as a senior system design interviewer.
First ask me to state the requirements out loud. Then give me 2–3 options with
trade-offs, no recommendation. After I choose, push back on the weakest part of my
choice. Then help me write the ADR using docs/adr/0000-template.md.
I'll answer in English.
```

## Cómo repartir entre Claude Code y Codex

No hace falta usar los dos para todo. Una forma que funciona:

- **Uno construye, el otro revisa.** Uno implementa una tarea `[AGENT]`; abres el otro
  y le pides revisar el diff contra `AGENTS.md` y el spec. Dos opiniones baratas sobre el
  mismo cambio.
- **Una tarea por sesión.** No los pongas a trabajar en paralelo sobre los mismos archivos.
- **Tú eres el arquitecto.** Ninguno de los dos decide las ADRs. Si alguno te da una
  recomendación sin opciones, recuérdale la regla.

## Lo que esto te da para las entrevistas

Cuando te pregunten "cuéntame de un proyecto donde tomaste decisiones de arquitectura" o
"¿cómo usas IA en tu flujo de trabajo?", tendrás un repo público con ADRs escritos por ti,
un despliegue real en Lambda + API Gateway + DynamoDB (los gaps de tu CV, cerrados), y una
historia concreta de desarrollo asistido por agentes donde tú dirigiste el diseño.

## Antes de la Fase 1, una tarea para ti

Rellena al menos dos `[COMPLETAR]` en `docs/CONTENT_SEED.md`: el número de jobs migrados a
Airflow y el tiempo aproximado de diagnóstico antes. Son las dos cifras que más mueven tu
CV, y el sitio te las va a mostrar resaltadas en ámbar hasta que lo hagas.
