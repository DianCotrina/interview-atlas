---
id: "hidden-loop"
title: "El bucle escondido"
section: "Fundamentals"
tags: ["complexity", "contains", "lookup", "linq"]
status: "in-progress"
summary: "Un Contains, IndexOf o .Where() sobre un List o un string recorre toda la colección. Si lo pones dentro de un for, es un bucle anidado aunque no lo parezca → O(n²)."
interviewLine: "Calling Contains on a list inside a loop hides a second loop — it's O(n²). Switching to a HashSet or Dictionary makes each lookup O(1)."
drillQuestions:
  - id: "repeated-contains"
    question: "¿Qué complejidad tiene `list.Contains(x)` dentro de un `foreach` sobre n elementos?"
    answer: "O(n²): Contains es O(n) y está anidado."
  - id: "string-lookup"
    question: "¿Un string se comporta como List o como HashSet para buscar?"
    answer: "Como List: O(n)."
---

Un `Contains`, `IndexOf` o `.Where()` sobre un `List` o un `string` **recorre toda la
colección**. Si lo pones dentro de un `for`, es un bucle anidado aunque no lo parezca → O(n²).

Ejemplo real (drill de anagramas): `foreach (char c in a) if (!b.Contains(c)) ...`
→ por cada letra de `a` se recorre todo `b` → O(n²). Además era incorrecto:
`Contains` dice *si existe*, no *cuántas veces*, así que `"abb"` vs `"abc"` daba `true`.

**Say it in the interview:** "Calling Contains on a list inside a loop hides a second
loop — it's O(n²). Switching to a HashSet or Dictionary makes each lookup O(1)."

drill:
- ¿Qué complejidad tiene `list.Contains(x)` dentro de un `foreach` sobre n elementos? → O(n²): Contains es O(n) y está anidado.
- ¿Un string se comporta como List o como HashSet para buscar? → Como List: O(n).
