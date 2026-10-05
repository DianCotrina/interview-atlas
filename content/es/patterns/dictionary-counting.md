---
id: "dictionary-counting"
title: "Conteo con diccionario"
section: "Patterns"
tags: ["hashmap", "counting", "frequencies"]
status: "learned"
summary: "Por qué es O(n): el diccionario **tiene memoria** — guarda los conteos mientras avanzas, así que no vuelves atrás."
interviewLine: "Single pass with a dictionary: if the key exists I increment, otherwise I start it at one. O(n) time, O(k) space."
drillQuestions: [{"id": "counting-branches", "question": "Las dos ramas del patrón de conteo.", "answer": "Si existe: conteo[c]++. Si no: conteo[c] = 1."}, {"id": "most-frequent", "question": "¿Cómo sacas la clave más frecuente?", "answer": "Segundo bucle secuencial con mejorClave y mejorConteo, actualizando ambos."}]
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

Por qué es O(n): el diccionario **tiene memoria** — guarda los conteos mientras avanzas,
así que no vuelves atrás. Para obtener el máximo: un segundo bucle **secuencial**
llevando dos variables (mejor clave y mejor conteo) y actualizando ambas juntas.

Atajo moderno (después de dominar el explícito): `conteo[c] = conteo.GetValueOrDefault(c) + 1;`
