---
id: "anagrams"
title: "Anagramas"
section: "Patterns"
tags: ["hashmap", "anagrams", "frequency"]
status: "learned"
summary: "Compara frecuencias y verifica primero los largos para que no queden letras de sobra."
interviewLine: "I check the lengths, count each character, and compare frequencies. O(n) average time and O(k) space, or O(1) space with a fixed alphabet."
drillQuestions: [{"id": "anagram-length", "question": "¿Por qué el chequeo de largos es necesario y no solo rápido?", "answer": "Garantiza que b no tenga letras de sobra."}]
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

El chequeo de largos no es solo optimización: sin él, `"abc"` vs `"abcd"` pasaría.
