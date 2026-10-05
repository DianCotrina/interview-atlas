---
id: "ai-code-review"
title: "Reviewing AI-generated code"
section: "AI Engineering"
tags: ["ai", "code-review", "review", "tests"]
status: "pending"
summary: "Treat AI output as a proposed change. You are responsible for checking that it meets the requirement, handles edge cases, and that you can explain its decisions."
interviewLine: "I use AI to propose implementations, then I review correctness, edge cases, complexity, and tests before I take ownership of the change."
drillQuestions:
  - id: "compile-vs-correctness"
    question: "Why is it not enough for AI-generated code to compile?"
    answer: "Compilation checks types and syntax, but does not prove that the code meets the requirement or handles edge cases."
---

Treat AI output as a proposed change. You are responsible for checking that it meets
the requirement, handles edge cases, and that you can explain its decisions.

1. Restate the requirement and check whether the code solves that problem.
2. Look for edge cases: empty input, duplicates, errors, and size limits.
3. Explain time and space; look for hidden loops and unnecessary calls.
4. Review validation, error handling, and sensitive data.
5. Run tests that can detect an incorrect solution.
6. Read the entire diff and check that you can defend it without the AI's help.
