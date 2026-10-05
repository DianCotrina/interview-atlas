---
id: "problem-framing"
title: "Framing — the 4 sentences before coding"
section: "Patterns"
tags: ["framing", "interview"]
status: "in-progress"
summary: "1. Restate: \"The problem asks me to ___.\" (precise, unambiguous) 2. Clarify: a question about the *rules* (ties? empty input? case sensitivity? output format?), never \"How do I solve it?\". 3. Brute force: the naive approach, with its O(...). Script for counting/grouping problems: *\"Get the distinct values and traverse all the data once for each one → O(n²).\"* 4. My approach: name the structure and explain why. \"A single pass with a Dictionary... O(n).\" 5. Narrate while coding."
interviewLine: "Let me restate the problem... One clarifying question... The brute force would be ___, which is O(n²). A better approach is ___."
drillQuestions:
  - id: "brute-force-counting"
    question: "Give me the script for sentence 3 in counting problems."
    answer: "Get the distinct values and traverse all the data once for each one → O(n²)."
  - id: "clarifying-rules"
    question: "What kind of question belongs in sentence 2?"
    answer: "A question about the problem's rules, not its solution."
---

1. **Restate:** "The problem asks me to ___." (precise, unambiguous)
2. **Clarify:** a question about the *rules* (ties? empty input? case sensitivity?
   output format?), never "How do I solve it?".
3. **Brute force:** the naive approach, with its O(...). Script for counting/grouping
   problems: *"Get the distinct values and traverse all the data once for each one → O(n²)."*
4. **My approach:** name the structure and explain why. "A single pass with a Dictionary... O(n)."
5. **Narrate while coding.**

The 30-second rule: do not write anything until you have said sentences 1–4 out loud.

**Recorded weakness:** jumping to the solution before framing (in every mock round),
and describing the good solution in sentence 3.

**Say it in the interview:** "Let me restate the problem... One clarifying question...
The brute force would be ___, which is O(n²). A better approach is ___."
