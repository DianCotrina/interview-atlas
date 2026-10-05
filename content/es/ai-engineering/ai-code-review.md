---
id: "ai-code-review"
title: "Revisar código generado por IA"
section: "AI Engineering"
tags: ["ai", "code-review", "revision", "tests"]
status: "pending"
summary: "Trata la salida de la IA como una propuesta de cambio. Tu responsabilidad es comprobar que cumple el requisito, que maneja los casos límite y que puedes explicar sus decisiones."
interviewLine: "I use AI to propose implementations, then I review correctness, edge cases, complexity, and tests before I take ownership of the change."
drillQuestions:
  - id: "compile-vs-correctness"
    question: "¿Por qué no basta con que el código generado por IA compile?"
    answer: "Compilar verifica tipos y sintaxis, pero no demuestra que el código cumpla el requisito ni que maneje los casos límite."
---

Trata la salida de la IA como una propuesta de cambio. Tu responsabilidad es comprobar que cumple el requisito, que maneja los casos límite y que puedes explicar sus decisiones.

1. Reformula el requisito y revisa si el código resuelve ese problema.
2. Busca casos límite: entrada vacía, duplicados, errores y límites de tamaño.
3. Explica tiempo y espacio; busca bucles escondidos y llamadas innecesarias.
4. Revisa validación, manejo de errores y datos sensibles.
5. Ejecuta pruebas que puedan detectar una solución incorrecta.
6. Lee el diff completo y comprueba que puedes defenderlo sin ayuda de la IA.
