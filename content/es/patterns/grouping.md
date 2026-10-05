---
id: "grouping"
title: "Agrupar con lista como valor"
section: "Patterns"
tags: ["hashmap", "grouping", "lists"]
status: "learned"
summary: "Guarda una lista por clave y agrega cada acción a su grupo. Se conservan todos los registros."
interviewLine: "I use a dictionary of lists to group records in one pass. O(n) time and O(n) space because I retain every record."
drillQuestions: [{"id": "grouping-space", "question": "¿Por qué el espacio es O(n) y no O(k) aquí?", "answer": "Se guardan todas las acciones, no solo un número por clave."}]
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
