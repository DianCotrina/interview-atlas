---
id: "anagrams"
title: "Anagrams"
section: "Patterns"
tags: ["hashmap", "anagrams", "frequency"]
status: "learned"
summary: "Compare frequencies and check lengths first so no extra letters are left over."
interviewLine: "I check the lengths, count each character, and compare frequencies. O(n) average time and O(k) space, or O(1) space with a fixed alphabet."
drillQuestions: [{"id": "anagram-length", "question": "Why is the length check necessary, not just fast?", "answer": "It ensures b has no extra letters."}]
---

```csharp
bool SonAnagramas(string a, string b)
{
    if (a.Length != b.Length) return false;   // necesario para la corrección

    var conteoA = new Dictionary<char, int>();
    foreach (char c in a)
        conteoA[c] = conteoA.GetValueOrDefault(c) + 1;

    var conteoB = new Dictionary<char, int>();
    foreach (char c in b)
        conteoB[c] = conteoB.GetValueOrDefault(c) + 1;

    foreach (var kvp in conteoA)
        if (!conteoB.TryGetValue(kvp.Key, out int v) || v != kvp.Value)
            return false;

    return true;
}
// O(n) tiempo · O(k) espacio, efectivamente O(1) si el alfabeto es fijo (a–z)
```

The length check is not just an optimization: without it, `"abc"` versus `"abcd"` would pass.
