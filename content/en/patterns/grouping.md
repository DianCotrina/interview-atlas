---
id: "grouping"
title: "Grouping with a list as the value"
section: "Patterns"
tags: ["hashmap", "grouping", "lists"]
status: "learned"
summary: "Store one list per key and add each action to its group. All records are retained."
interviewLine: "I use a dictionary of lists to group records in one pass. O(n) time and O(n) space because I retain every record."
drillQuestions: [{"id": "grouping-space", "question": "Why is space O(n), rather than O(k), here?", "answer": "All actions are stored, not just one number per key."}]
---

```csharp
Dictionary<string, List<string>> AccionesPorClinico(
    List<(string clinico, string accion)> registros)
{
    var resultado = new Dictionary<string, List<string>>();
    foreach (var (clinico, accion) in registros)
    {
        if (resultado.ContainsKey(clinico))
            resultado[clinico].Add(accion);
        else
            resultado[clinico] = new List<string> { accion };
    }
    return resultado;
}
// O(n) tiempo · O(n) espacio (guardas todos los registros)
```
