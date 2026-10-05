---
id: "first-duplicate"
title: "Primer repetido — HashSet y corte temprano"
section: "Patterns"
tags: ["hashset", "duplicate", "early-exit"]
status: "learned"
summary: "El orden del recorrido da la garantía; el HashSet solo da la velocidad."
interviewLine: "Scanning left to right finds the earliest second occurrence. A HashSet makes membership checks fast, with O(n) average time and O(n) space in the worst case."
drillQuestions: [{"id": "duplicate-order", "question": "¿Qué garantiza que el primer repetido encontrado es el correcto?", "answer": "Recorrer en orden; lo que queda a la derecha siempre es más tarde."}]
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

**Por qué puedes parar en el primero:** recorres de izquierda a derecha, en orden. El
primer repetido que encuentras tiene la segunda aparición más temprana; nada a la
derecha puede ser más temprano. **El orden del recorrido da la garantía; el HashSet solo
da la velocidad.**
