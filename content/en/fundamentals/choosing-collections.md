---
id: "choosing-collections"
title: "List vs HashSet vs Dictionary"
section: "Fundamentals"
tags: ["hashmap", "hashset", "dictionary", "collections"]
status: "learned"
summary: "Choose by the question you repeat inside the loop:"
interviewLine: "I pick the structure by the question I ask inside the loop: HashSet for 'have I seen this', Dictionary when I need a value attached to the key, and never a List for lookups inside a loop."
drillQuestions:
  - id: "membership-or-value"
    question: "Which question determines whether to use a HashSet or a Dictionary?"
    answer: "Do I only need to know whether it exists (HashSet), or store a value alongside the key (Dictionary)?"
  - id: "ordered-history"
    question: "You need to store each clinician's action history, including repeated actions. Which type?"
    answer: "`Dictionary<string, List<string>>`."
  - id: "hashtable-legacy"
    question: "Why should you avoid Hashtable?"
    answer: "It is a legacy, non-generic collection; Dictionary<K,V> is typed and replaces it."
---

**Choose by the question you repeat inside the loop:**

| Question | Structure | Cost |
|---|---|---|
| "Give me the element at position 3" | `List<T>` / array | O(1) by index |
| "Have I seen this value?" (yes/no) | `HashSet<T>` | O(1) |
| "How many times?" or any value alongside the key | `Dictionary<K,V>` | O(1) |
| "Is this value in the list?" | `List<T>` ⚠️ | O(n) |
| "Give me the first item that came in" | `Queue<T>` | O(1) |
| "Give me the last item that came in" | `Stack<T>` | O(1) |

**HashSet vs Dictionary:** the same mechanism (they calculate a position from the key).
The difference: HashSet stores only keys; Dictionary stores a key plus an associated
value (a count, an object, a list...).

**Watch out:** HashSet does not allow duplicates. If you need an ordered history with
repeated entries (`C1 → ["ver","firmar","ver"]`), use `List<T>` as the value.

**Hashtable:** the old non-generic version from .NET 1.x. It stores `object` (no types,
boxing). It is not used; `Dictionary<K,V>` replaced it.

**Say it in the interview:** "I pick the structure by the question I ask inside the loop:
HashSet for 'have I seen this', Dictionary when I need a value attached to the key,
and never a List for lookups inside a loop."
