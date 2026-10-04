---
id: "choosing-collections"
title: "List vs HashSet vs Dictionary"
section: "Fundamentals"
tags: ["hashmap", "hashset", "diccionario", "colecciones"]
status: "learned"
summary: "Elige por la pregunta que repites dentro del bucle:"
interviewLine: "I pick the structure by the question I ask inside the loop: HashSet for 'have I seen this', Dictionary when I need a value attached to the key, and never a List for lookups inside a loop."
drillQuestions:
  - id: "membership-or-value"
    question: "¿Qué pregunta decide entre HashSet y Dictionary?"
    answer: "¿Solo necesito saber si existe (HashSet) o guardar un dato junto a la clave (Dictionary)?"
  - id: "ordered-history"
    question: "Necesitas guardar el historial de acciones por clínico, con repetidos. ¿Tipo?"
    answer: "`Dictionary<string, List<string>>`."
  - id: "hashtable-legacy"
    question: "¿Por qué no usar Hashtable?"
    answer: "Es legacy no genérica; Dictionary<K,V> es tipada y la reemplaza."
---

**Elige por la pregunta que repites dentro del bucle:**

| Pregunta | Estructura | Costo |
|---|---|---|
| "Dame el elemento en la posición 3" | `List<T>` / arreglo | O(1) por índice |
| "¿Ya vi este valor?" (sí/no) | `HashSet<T>` | O(1) |
| "¿Cuántas veces?" o cualquier dato junto a la clave | `Dictionary<K,V>` | O(1) |
| "¿Este valor está en la lista?" | `List<T>` ⚠️ | O(n) |
| "Dame el primero que entró" | `Queue<T>` | O(1) |
| "Dame el último que entró" | `Stack<T>` | O(1) |

**HashSet vs Dictionary:** la misma máquina (calculan la posición a partir de la clave).
La diferencia: HashSet guarda solo claves; Dictionary guarda clave + un valor asociado
(un conteo, un objeto, una lista...).

**Cuidado:** HashSet no admite duplicados. Si necesitas un historial con repetidos y en
orden (`C1 → ["ver","firmar","ver"]`), usa `List<T>` como valor.

**Hashtable:** versión vieja no genérica de .NET 1.x. Guarda `object` (sin tipos, boxing).
No se usa; `Dictionary<K,V>` la reemplazó.

**Say it in the interview:** "I pick the structure by the question I ask inside the loop:
HashSet for 'have I seen this', Dictionary when I need a value attached to the key,
and never a List for lookups inside a loop."
