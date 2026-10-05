---
id: "dictionary-counting"
title: "Dictionary counting"
section: "Patterns"
tags: ["hashmap", "counting", "frequencies"]
status: "learned"
summary: "The dictionary remembers counts as you move forward, so you do not go back."
interviewLine: "Single pass with a dictionary: if the key exists I increment, otherwise I start it at one. O(n) time, O(k) space."
drillQuestions: [{"id": "counting-branches", "question": "The two branches of the counting pattern.", "answer": "If it exists: conteo[c]++. Otherwise: conteo[c] = 1."}, {"id": "most-frequent", "question": "How do you find the most frequent key?", "answer": "A second sequential loop with mejorClave and mejorConteo, updating both together."}]
---

```csharp
Dictionary<string, int> ContarEstados(List<string> estados)
{
    var conteo = new Dictionary<string, int>();
    foreach (string estado in estados)
    {
        if (conteo.ContainsKey(estado))
            conteo[estado]++;      // ya existe → suma uno
        else
            conteo[estado] = 1;    // primera vez → arranca en uno
    }
    return conteo;
}
// O(n) tiempo · O(k) espacio
```

Why it is O(n): the dictionary **remembers** — it stores counts as you move forward,
so you do not go back. To find the maximum: a second **sequential** loop
maintaining two variables (best key and best count) and updating both together.

Modern shortcut (after mastering the explicit version): `conteo[c] = conteo.GetValueOrDefault(c) + 1;`
