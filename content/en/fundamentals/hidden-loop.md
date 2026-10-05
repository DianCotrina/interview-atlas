---
id: "hidden-loop"
title: "The hidden loop"
section: "Fundamentals"
tags: ["complexity", "contains", "lookup", "linq"]
status: "in-progress"
summary: "Contains, IndexOf or .Where() on a List or string traverses the whole collection. Put it inside a for loop and it becomes a nested loop, even if it does not look like one → O(n²)."
interviewLine: "Calling Contains on a list inside a loop hides a second loop — it's O(n²). Switching to a HashSet or Dictionary makes each lookup O(1)."
drillQuestions:
  - id: "repeated-contains"
    question: "What is the complexity of `list.Contains(x)` inside a `foreach` over n elements?"
    answer: "O(n²): Contains is O(n) and it is nested."
  - id: "string-lookup"
    question: "For searching, does a string behave like a List or a HashSet?"
    answer: "Like a List: O(n)."
---

`Contains`, `IndexOf` or `.Where()` on a `List` or `string` **traverses the whole
collection**. Put it inside a `for` loop and it becomes a nested loop, even if it does
not look like one → O(n²).

Real example (anagram drill): `foreach (char c in a) if (!b.Contains(c)) ...`
→ for each letter in `a`, traverse all of `b` → O(n²). It was also incorrect:
`Contains` tells you *whether it exists*, not *how many times*, so `"abb"` versus
`"abc"` returned `true`.

**Say it in the interview:** "Calling Contains on a list inside a loop hides a second
loop — it's O(n²). Switching to a HashSet or Dictionary makes each lookup O(1)."
