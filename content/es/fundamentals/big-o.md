---
id: "big-o"
title: "Complejidad — Big O en una frase"
section: "Fundamentals"
tags: ["complexity", "big-o", "tiempo", "espacio"]
status: "learned"
summary: "Qué pregunta: si la entrada crece, ¿cuánto trabajo más hace mi código? (tiempo) y ¿cuánta memoria extra uso que crezca con la entrada? (espacio)."
interviewLine: "This is O(n) time because it's a single pass, and O(k) space for the dictionary, where k is the number of distinct keys."
drillQuestions:
  - id: "nested-loops"
    question: "¿Cuál es la regla de bucles anidados vs secuenciales?"
    answer: "Anidado multiplica (n²), secuencial suma (n)."
  - id: "simplify-n-plus-k"
    question: "Simplifica O(n + k) donde k ≤ n."
    answer: "O(n)."
  - id: "time-and-space"
    question: "¿Qué dos complejidades debes decir siempre?"
    answer: "Tiempo y espacio."
---

**Qué pregunta:** si la entrada crece, ¿cuánto trabajo más hace mi código? (tiempo) y
¿cuánta memoria extra uso que crezca con la entrada? (espacio).

**La regla:** *anidado multiplica, secuencial suma.*
- Bucle dentro de bucle → n × n → **O(n²)**.
- Un bucle termina y arranca otro → n + n = 2n → **O(n)**. Las constantes se descartan.

**Simplificar:** te quedas solo con el término que más crece.
`O(n + k)` → `O(n)` (si k ≤ n) · `O(n + 100)` → `O(n)` · `O(n² + n)` → `O(n²)`.

**Referencia rápida:** un bucle → O(n) · anidado → O(n²) · ordenar → O(n log n) ·
lookup en Dictionary/HashSet → O(1) · sin estructura extra → O(1) espacio ·
diccionario que crece con la entrada → O(n) o O(k) espacio.

**Siempre di las dos:** tiempo *y* espacio. (Hábito pendiente: Diego suele olvidar el espacio.)

**Say it in the interview:** "This is O(n) time because it's a single pass, and O(k)
space for the dictionary, where k is the number of distinct keys."
