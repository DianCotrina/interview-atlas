---
id: "big-o"
title: "Complexity — Big O in one sentence"
section: "Fundamentals"
tags: ["complexity", "big-o", "time", "space"]
status: "learned"
summary: "The question: as the input grows, how much more work does my code do (time), and how much extra memory do I use that grows with the input (space)?"
interviewLine: "This is O(n) time because it's a single pass, and O(k) space for the dictionary, where k is the number of distinct keys."
drillQuestions:
  - id: "nested-loops"
    question: "What is the rule for nested versus sequential loops?"
    answer: "Nested loops multiply (n²); sequential loops add (n)."
  - id: "simplify-n-plus-k"
    question: "Simplify O(n + k), where k ≤ n."
    answer: "O(n)."
  - id: "time-and-space"
    question: "Which two complexities should you always state?"
    answer: "Time and space."
---

**The question:** as the input grows, how much more work does my code do (time), and
how much extra memory do I use that grows with the input (space)?

**The rule:** *nested loops multiply; sequential loops add.*
- A loop inside a loop → n × n → **O(n²)**.
- One loop ends and another starts → n + n = 2n → **O(n)**. Drop constants.

**Simplify:** keep only the term that grows the fastest.
`O(n + k)` → `O(n)` (if k ≤ n) · `O(n + 100)` → `O(n)` · `O(n² + n)` → `O(n²)`.

**Quick reference:** one loop → O(n) · nested loops → O(n²) · sorting → O(n log n) ·
Dictionary/HashSet lookup → O(1) · no extra structure → O(1) space ·
a dictionary that grows with the input → O(n) or O(k) space.

**Always state both:** time *and* space. (Habit to build: Diego tends to forget space.)

**Say it in the interview:** "This is O(n) time because it's a single pass, and O(k)
space for the dictionary, where k is the number of distinct keys."
