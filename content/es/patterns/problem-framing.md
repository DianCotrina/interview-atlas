---
id: "problem-framing"
title: "Encuadre — las 4 frases antes de escribir"
section: "Patterns"
tags: ["framing", "encuadre", "entrevista"]
status: "in-progress"
summary: "1. Reformulo: \"El problema me pide ___.\" (preciso, no ambiguo) 2. Aclaro: una pregunta sobre las *reglas* (¿empates? ¿vacío? ¿mayúsculas? ¿formato    de salida?), nunca \"¿cómo lo resuelvo?\". 3. Fuerza bruta: la tonta, con su O(...). Guion para problemas de contar/agrupar:    *\"Sacar los valores distintos y recorrer todos los datos una vez por cada uno → O(n²).\"* 4. Mi enfoque: nombrando la estructura y por qué. \"Un recorrido con un Dictionary... O(n).\" 5. Narro mientras escribo."
interviewLine: "Let me restate the problem... One clarifying question... The brute force would be ___, which is O(n²). A better approach is ___."
drillQuestions:
  - id: "brute-force-counting"
    question: "Dime el guion de la frase 3 para problemas de contar."
    answer: "Sacar los valores distintos y recorrer todos los datos una vez por cada uno → O(n²)."
  - id: "clarifying-rules"
    question: "¿Qué tipo de pregunta va en la frase 2?"
    answer: "Sobre las reglas del problema, no sobre la solución."
---

1. **Reformulo:** "El problema me pide ___." (preciso, no ambiguo)
2. **Aclaro:** una pregunta sobre las *reglas* (¿empates? ¿vacío? ¿mayúsculas? ¿formato
   de salida?), nunca "¿cómo lo resuelvo?".
3. **Fuerza bruta:** la tonta, con su O(...). Guion para problemas de contar/agrupar:
   *"Sacar los valores distintos y recorrer todos los datos una vez por cada uno → O(n²)."*
4. **Mi enfoque:** nombrando la estructura y por qué. "Un recorrido con un Dictionary... O(n)."
5. **Narro mientras escribo.**

Regla de los 30 segundos: no escribes nada hasta decir las frases 1–4 en voz alta.

**Debilidad registrada:** saltar a la solución antes de encuadrar (en todas las rondas
del mock), y describir la solución buena en la frase 3.

**Say it in the interview:** "Let me restate the problem... One clarifying question...
The brute force would be ___, which is O(n²). A better approach is ___."
