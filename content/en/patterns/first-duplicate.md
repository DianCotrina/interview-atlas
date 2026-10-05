---
id: "first-duplicate"
title: "First duplicate — HashSet and early exit"
section: "Patterns"
tags: ["hashset", "duplicate", "early-exit"]
status: "learned"
summary: "Traversal order provides the guarantee; the HashSet provides the speed."
interviewLine: "Scanning left to right finds the earliest second occurrence. A HashSet makes membership checks fast, with O(n) average time and O(n) space in the worst case."
drillQuestions: [{"id": "duplicate-order", "question": "What guarantees that the first duplicate found is correct?", "answer": "Traversing in order; everything to the right always comes later."}]
---

```csharp
string? PrimeroRepetido(List<string> valores)
{
    var vistos = new HashSet<string>();
    foreach (var valor in valores)
    {
        if (vistos.Contains(valor)) return valor;  // Contains ANTES de Add
        vistos.Add(valor);
    }
    return null;
}
// O(n) tiempo · O(n) espacio
```

**Why you can stop at the first one:** you traverse from left to right, in order. The
first duplicate you find has the earliest second occurrence; nothing to its
right can be earlier. **Traversal order provides the guarantee; the HashSet only
provides the speed.**
