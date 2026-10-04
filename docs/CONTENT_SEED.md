# Content Seed

Source material for `content/`. Each `## PAGE:` block becomes one Markdown page.
Explanations are in Spanish (study language); every page ends with an English
"Say it in the interview" line. `drill:` lists questions for spaced repetition — answers
follow `→`.

**Agents: never fill `[COMPLETAR: ...]` with invented data.** Render them as visible
"needs your real number" badges.

`status:` reflects where Diego actually is — `learned` (passes drills from memory),
`in-progress` (seen, not yet stable), `pending` (not studied yet).

---

# SECTION: Fundamentals

## PAGE: Complejidad — Big O en una frase
status: learned

**Qué pregunta:** si la entrada crece, ¿cuánto trabajo más hace mi código? (tiempo) y
¿cuánta memoria extra uso que crezca con la entrada? (espacio).

**La regla:** *anidado multiplica, secuencial suma.*
- Bucle dentro de bucle → n × n → **O(n²)**.
- Un bucle termina y arranca otro → n + n = 2n → **O(n)**. Las constantes se descartan.

**Simplificar:** te quedas solo con el término que más crece.
`O(n + k)` → `O(n)` (si k ≤ n) · `O(n + 100)` → `O(n)` · `O(n² + n)` → `O(n²)`.

**Referencia rápida:** un bucle → O(n) · anidado → O(n²) · ordenar → O(n log n) ·
lookup en Dictionary/HashSet → O(1) · sin estructura extra → O(1) espacio ·
diccionario que crece con la entrada → O(n) o O(k) espacio.

**Siempre di las dos:** tiempo *y* espacio. (Hábito pendiente: Diego suele olvidar el espacio.)

**Say it in the interview:** "This is O(n) time because it's a single pass, and O(k)
space for the dictionary, where k is the number of distinct keys."

drill:
- ¿Cuál es la regla de bucles anidados vs secuenciales? → Anidado multiplica (n²), secuencial suma (n).
- Simplifica O(n + k) donde k ≤ n. → O(n).
- ¿Qué dos complejidades debes decir siempre? → Tiempo y espacio.

## PAGE: El bucle escondido
status: in-progress

Un `Contains`, `IndexOf` o `.Where()` sobre un `List` o un `string` **recorre toda la
colección**. Si lo pones dentro de un `for`, es un bucle anidado aunque no lo parezca → O(n²).

Ejemplo real (drill de anagramas): `foreach (char c in a) if (!b.Contains(c)) ...`
→ por cada letra de `a` se recorre todo `b` → O(n²). Además era incorrecto:
`Contains` dice *si existe*, no *cuántas veces*, así que `"abb"` vs `"abc"` daba `true`.

**Say it in the interview:** "Calling Contains on a list inside a loop hides a second
loop — it's O(n²). Switching to a HashSet or Dictionary makes each lookup O(1)."

drill:
- ¿Qué complejidad tiene `list.Contains(x)` dentro de un `foreach` sobre n elementos? → O(n²): Contains es O(n) y está anidado.
- ¿Un string se comporta como List o como HashSet para buscar? → Como List: O(n).

## PAGE: List vs HashSet vs Dictionary
status: learned

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

drill:
- ¿Qué pregunta decide entre HashSet y Dictionary? → ¿Solo necesito saber si existe (HashSet) o guardar un dato junto a la clave (Dictionary)?
- Necesitas guardar el historial de acciones por clínico, con repetidos. ¿Tipo? → `Dictionary<string, List<string>>`.
- ¿Por qué no usar Hashtable? → Es legacy no genérica; Dictionary<K,V> es tipada y la reemplaza.

## PAGE: LINQ y lambdas — sintaxis, no algoritmo
status: learned

- Una **lambda** es una función corta sin nombre (`v => v`). LINQ son métodos
  (`Where`, `Select`, `GroupBy`) que reciben lambdas. No son alternativas distintas.
- `Select` **transforma** cada elemento. No tiene relación con **regex**, que busca
  patrones dentro de texto (`System.Text.RegularExpressions`).
- LINQ es ideal para "transformar o agrupar toda la colección" (`GroupBy` para contar).
  Es mala opción cuando necesitas **recorrer en orden y salir temprano** — `GroupBy`
  procesa todo y pierde la posición.
- Describe primero el mecanismo, después la herramienta: "un recorrido con diccionario,
  O(n); en C# lo escribiría con GroupBy."

**Say it in the interview:** "LINQ works, but here I need to exit early on the first
match, and GroupBy forces a full pass — the explicit loop is O(n) and clearer."

drill:
- ¿Qué tiene que ver `Select` con regex? → Nada: Select transforma elementos; regex busca patrones en texto.
- ¿Cuándo NO conviene LINQ? → Cuando necesitas salir temprano recorriendo en orden.

## PAGE: Tropiezos de sintaxis en C#
status: in-progress

| Mal | Bien | Por qué |
|---|---|---|
| `a.toarray()` | `a.ToCharArray()` | PascalCase; y casi nunca hace falta: `foreach (char c in miString)` |
| `arr.Count` en arreglo | `arr.Length` | Arreglos usan Length; List usa Count |
| `conteo = conteo + 1` | `conteo[c]++` | Sin la clave sería un contador global |
| función `string` sin `return` | `return resultado;` | No compila — repasa de arriba a abajo antes de decir "listo" |
| `HashSet<lista>` | `List<string>` | Dentro de `<>` va un tipo real |

drill:
- ¿Length o Count para un `int[]`? → Length.

---

# SECTION: Patterns

## PAGE: Encuadre — las 4 frases antes de escribir
status: in-progress

1. **Reformulo:** "El problema me pide ___." (preciso, no ambiguo)
2. **Aclaro:** una pregunta sobre las *reglas* (¿empates? ¿vacío? ¿mayúsculas? ¿formato
   de salida?), nunca "¿cómo lo resuelvo?".
3. **Fuerza bruta:** la tonta, con su O(...). Guion para problemas de contar/agrupar:
   *"Sacar los valores distintos y recorrer todos los datos una vez por cada uno → O(n²)."*
4. **Mi enfoque:** nombrando la estructura y por qué. "Un recorrido con un Dictionary... O(n)."
5. **Narro mientras escribo.**

Regla de los 30 segundos: no escribes nada hasta decir las frases 1–4 en voz alta.

**Debilidad registrada:** saltar a la solución antes de encuadrar (en todas las rondas
del mock), y describir la solución buena en la frase 3.

**Say it in the interview:** "Let me restate the problem... One clarifying question...
The brute force would be ___, which is O(n²). A better approach is ___."

drill:
- Dime el guion de la frase 3 para problemas de contar. → Sacar los valores distintos y recorrer todos los datos una vez por cada uno → O(n²).
- ¿Qué tipo de pregunta va en la frase 2? → Sobre las reglas del problema, no sobre la solución.

## PAGE: Conteo con diccionario
status: learned

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

**Say it in the interview:** "Single pass with a dictionary: if the key exists I
increment, otherwise I start it at one. O(n) time, O(k) space."

drill:
- Las dos ramas del patrón de conteo. → Si existe: conteo[c]++. Si no: conteo[c] = 1.
- ¿Cómo sacas la clave más frecuente? → Segundo bucle secuencial con mejorClave y mejorConteo, actualizando ambos.

## PAGE: Agrupar con lista como valor
status: learned

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

drill:
- ¿Por qué el espacio es O(n) y no O(k) aquí? → Se guardan todas las acciones, no solo un número por clave.

## PAGE: Primer repetido — HashSet y corte temprano
status: learned

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

drill:
- ¿Qué garantiza que el primer repetido encontrado es el correcto? → Recorrer en orden; lo que queda a la derecha siempre es más tarde.

## PAGE: Anagramas
status: learned

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

drill:
- ¿Por qué el chequeo de largos es necesario y no solo rápido? → Garantiza que b no tenga letras de sobra.

## PAGE: Two pointers — extremos que convergen
status: in-progress

Un dedo al inicio, otro al final, se mueven **hacia el centro**. Condición: `while (izq < der)`.

| Problema | Movimiento | ¿Necesita orden? |
|---|---|---|
| Two-sum | **Un** dedo según si la suma quedó alta (der--) o baja (izq++) | **Sí** |
| Palíndromo | **Los dos** si las letras son iguales; si no, `return false` | **No** |
| Invertir en el sitio | **Los dos**, intercambiando | No |

**La regla del orden:** hace falta cuando la decisión de qué dedo mover depende del
**valor**, o cuando el orden es lo que garantiza que los candidatos estén **juntos**. Si
solo comparas igualdad entre posiciones fijas, el orden da igual.

**Error a evitar:** cuando las letras no coinciden, los dedos no "se quedan quietos" —
sales con `false` (el bucle se colgaría).

```csharp
(int, int)? DosSuman(int[] arr, int objetivo)
{
    int izq = 0, der = arr.Length - 1;
    while (izq < der)
    {
        int suma = arr[izq] + arr[der];
        if (suma == objetivo) return (izq, der);
        if (suma > objetivo) der--; else izq++;
    }
    return null;
}
// O(n) tiempo · O(1) espacio
```

**Debilidad registrada:** en un drill se cruzaron las dos filas de la tabla.

**Say it in the interview:** "Because the array is sorted, moving the right pointer left
always decreases the sum, so each step safely discards a candidate — O(n) instead of O(n²)."

drill:
- Two-sum: ¿cuántos dedos mueves por paso y necesita orden? → Uno; sí necesita orden.
- Palíndromo: ¿cuántos dedos y necesita orden? → Los dos; no necesita orden.
- Suma mayor que el objetivo en arreglo ascendente: ¿qué mueves? → El derecho hacia la izquierda.

## PAGE: Two pointers — lento y rápido
status: in-progress

Los dos arrancan a la izquierda y avanzan en el mismo sentido. **El rápido explora, el
lento escribe.** El lento marca dónde va el próximo elemento bueno; solo avanza cuando
encuentra uno. Sirve para modificar un arreglo **en el sitio**, O(1) espacio.

```csharp
int QuitarDuplicados(int[] arr)   // arr ordenado
{
    if (arr.Length == 0) return 0;
    int lento = 0;
    for (int rapido = 1; rapido < arr.Length; rapido++)
    {
        if (arr[rapido] != arr[lento])
        {
            lento++;
            arr[lento] = arr[rapido];
        }
    }
    return lento + 1;
}
```

Necesita orden porque el orden pone los duplicados **pegados**: basta mirar al vecino.

drill:
- ¿Qué hace cada puntero en lento/rápido? → El rápido explora; el lento marca dónde escribir y escribe.
- ¿Por qué quitar duplicados con vecinos necesita arreglo ordenado? → El orden junta los duplicados.

## PAGE: Intervalos que se solapan
status: in-progress

Dos intervalos A y B se solapan si **`A.start < B.end && B.start < A.end`**.
(No se solapan si uno termina antes de que empiece el otro.)

- Fuerza bruta: comparar cada par (`j = i + 1` para no repetir pares) → O(n²), O(1) espacio.
- Mejor: **ordenar por inicio** y comparar solo vecinos → O(n log n).

drill:
- Condición de solapamiento. → A.start < B.end y B.start < A.end.
- ¿Dónde arranca j para no repetir pares? → En i + 1.

## PAGE: Sliding window
status: pending

Pendiente de estudiar. Problema de entrada: suma máxima de cualquier bloque contiguo de
`k` elementos. Idea: en vez de recalcular cada ventana, sumas el que entra y restas el
que sale.

## PAGE: Árboles — lo básico (BFS / DFS)
status: pending

Pendiente. Alcance mínimo para tests cronometrados: recorrido en profundidad (recursivo)
y en anchura (con `Queue<T>`), altura de un árbol.

---

# SECTION: .NET & APIs

## PAGE: Pipeline de una request en ASP.NET Core
status: in-progress

Kestrel → middleware en el orden registrado (excepciones, HTTPS, routing, autenticación,
autorización, custom) → model binding y validación → acción del controller → la
respuesta vuelve por el pipeline en orden inverso. Ahí viven los aspectos transversales
(auth, logging, formato de errores), no repetidos en cada controller.

**Say it in the interview:** "Cross-cutting concerns belong in middleware, so every
endpoint gets consistent auth, logging, and error formatting without duplicated code."

## PAGE: Idempotencia
status: in-progress

Llamar una operación varias veces tiene el mismo efecto que una vez. GET, PUT y DELETE
lo son por semántica HTTP; POST no. Para POST: **idempotency key** enviada por el
cliente y guardada en el servidor; un reintento con la misma clave devuelve el resultado
original. Indispensable con reintentos y entrega "at-least-once" (colas, serverless).

drill:
- ¿Cómo haces idempotente un POST? → Idempotency key del cliente, guardada en servidor; reintento devuelve el resultado original.

## PAGE: Diagnosticar una query lenta en SQL Server
status: in-progress

Plan de ejecución **real** → scans en vez de seeks → índice faltante o predicado no
sargable (función sobre una columna indexada), conversiones implícitas, estadísticas
viejas, orden de joins. Arreglos: índice covering, reescribir el predicado, partir la
query. Validar con volumen parecido a producción.

## PAGE: Async no te protege de todo
status: in-progress

`async/await` libera el **hilo** mientras esperas. Pero cada request colgada sigue
reteniendo una **conexión** al servicio de abajo. Si 200 requests esperan a un servicio
caído, se agota el pool y las nuevas no consiguen conexión: cae toda la API. Lo que
protege es timeout + circuit breaker.

**Say it in the interview:** "Async prevents thread starvation, not resource exhaustion
on the downstream dependency — for that you need timeouts and a circuit breaker."

drill:
- ¿Async evita que un servicio caído tumbe tu API? → No: libera hilos, pero las conexiones se agotan. Hace falta timeout + circuit breaker.

---

# SECTION: System Design

## PAGE: Framework de 5 pasos
status: in-progress

Requisitos → diseño de alto nivel → deep dive → trade-offs → fallas y observabilidad.
Los primeros 60 segundos: reformular y declarar supuestos en voz alta, antes de dibujar.

## PAGE: Capa anticorrupción / bridge sobre legacy
status: learned

REST controller (contrato limpio, validación) → capa de mapeo (DTOs REST ↔ contratos
WCF; lo feo no se filtra hacia afuera) → cliente proxy WCF → servicio legacy. Los
clientes viejos siguen llamando a WCF directo.

**Dirección de dependencias (Clean Architecture):** la lógica depende de una interfaz
(`ILegacyPatientService`); el proxy WCF es una implementación en Infrastructure. Gana:
tests con fakes, y el día que matas el legacy cambias una implementación y el core no se toca.

Es la historia más fuerte de Diego — es su proyecto real.

## PAGE: Resiliencia ante una dependencia lenta o caída
status: in-progress

- **Timeout** propio y configurable (no hardcodeado): no heredas los 30 s del legacy.
- **Circuit breaker:** tras N fallas seguidas deja de llamar durante X segundos y falla
  rápido; luego deja pasar una request de prueba. En .NET: Polly (en .NET 8, también vía
  `Microsoft.Extensions.Http.Resilience`).
- **Retry con backoff** para fallas transitorias — solo en operaciones idempotentes.
- **Fallback según tipo:**
  - **Escrituras:** encolar, responder `202 Accepted`, procesar al recuperarse (requiere idempotencia).
  - **Lecturas:** devolver caché si hay (viejo pero disponible), o fallar rápido con error claro.
- **Observabilidad:** logs, health checks, alerta cuando el circuito se abre.

**Error registrado en el mock:** proponer "volver al legacy" cuando el que falla es el
legacy. Pregúntate siempre *qué* está caído antes de elegir el fallback.

drill:
- Writes vs reads cuando la dependencia cae. → Writes: encolar + 202 + idempotencia. Reads: caché o fail-fast.
- ¿Qué hace un circuit breaker? → Tras N fallas deja de llamar un tiempo y falla rápido; después prueba una request.

## PAGE: Prompts de práctica
status: pending

1. REST moderno delante de un backend SOAP/WCF legacy.
2. Sistema de alertas y escalamiento sin fatiga de alertas (dedup, supresión).
3. Almacenamiento multi-tenant con datos sensibles (aislamiento a nivel de datos, no solo de app).
4. Pipeline event-driven de archivos con at-least-once y DLQ.
5. Audit log append-only que no frena la transacción principal.

---

# SECTION: Behavioral

Stories are in English because they'll be told in English. Coaching notes in Spanish.
Delivery rules: STAR beats with a breath between each; **lead with impact**; always land
the result; one closing sentence connecting to the role.

## PAGE: STAR — Legacy WCF to REST + .NET 8
status: in-progress

**S:** The client's core services ran on WCF on .NET Framework 4.8 — hard to maintain
and awkward to integrate with. **T:** Modernize without breaking any existing consumer.
**A:** Designed REST APIs with Clean Architecture as a bridge in front of the existing WCF
calls, so consumers could migrate at their own pace; documented every endpoint in
Swagger; migrated the stack from .NET Framework 4.8 to .NET 8.
**R:** [COMPLETAR: cuántos servicios/endpoints cubrió] — [COMPLETAR: qué mejoró después:
defectos de integración, tiempo de onboarding de nuevos consumidores, mantenimiento].

Nota: abrir con esta historia cuando pidan "tu proyecto más importante".

## PAGE: STAR — Job orchestrator to Airflow (MWAA)
status: in-progress

**S:** Automated jobs ran on a deprecated .NET orchestration framework with no UI;
diagnosing a failure meant digging through raw logs. **T:** Move them to a maintainable
platform without disrupting production. **A:** Led the migration to Apache Airflow on
Amazon MWAA; designed inbound file processors (S3 → parse → insert into DB) and outbound
ones (DB → generate file → S3 for a downstream team), as Python DAG tasks.
**R:** Support now opens the Airflow UI, sees exactly which task failed and its logs, and
retries a single failed task instead of rerunning the whole pipeline — diagnosis went
from a manual log hunt to a few clicks. [COMPLETAR: número de jobs migrados]
[COMPLETAR: tiempo aproximado de diagnóstico antes, ej. "30–60 min"].

Nota: hablar de impacto para el equipo de soporte, no de features.

## PAGE: STAR — LLM-powered internal wiki (Claude + MCP)
status: in-progress

**S:** Years of undocumented tribal knowledge on a legacy system slowed everyone down.
**T:** Capture and surface it without depending on a few people's memory.
**A:** Built an internal wiki using Claude with MCP integrations into Atlassian tools
(Jira, Confluence) so it pulls real project context and generates organized documentation.
**R:** Investigating a bug in the legacy project used to take 3–5 days; with the wiki plus
the modernization work (automated jobs, clean REST layer), it now takes hours, sometimes
minutes. [COMPLETAR: un caso concreto de alguien que se apoyó en la wiki].

Nota: variante "elevar al equipo" — misma historia, enfocada en que otros ramp-upean sin
interrumpir a los seniors. Diferenciador fuerte para roles que piden AI-assisted workflows.

## PAGE: STAR — Production incident: tax discrepancy
status: learned

**S:** An order's tax didn't match the expected value for the customer's state.
**T:** Find the root cause. **A:** First suspected our own tax-calculation service; pulled
requests/responses from our service and from the external tax validator and compared at
each boundary. **Twist:** the bad value came from a *different* upstream external service
feeding a wrong input. **R:** Reported it to that service's owners with the exact request
and expected value, and documented it in the wiki so the pattern is findable next time.
[COMPLETAR: tiempo de resolución] [COMPLETAR: ¿se agregó validación del input en nuestro
borde para que no vuelva a pasar en silencio?]

Nota: contarla con pausas entre los beats; fue un run-on en el mock.

## PAGE: STAR — Disagreement: versioned packages instead of raw DAG files
status: learned

**S:** The agreed design shipped all DAG code to the client as a single `.py` file per
release. **T:** Deadline was close. **A:** Delivered as agreed to meet the deadline, then
packaged the code as a versioned wheel with Semantic Versioning, and presented a demo to
the architect showing how it protects our IP, controls what runs in production, and
prevents untracked edits by production support. **R:** [COMPLETAR: ¿el arquitecto aceptó?
¿quedó como formato estándar de release?]

Nota: decir "protect our IP and release integrity", nunca "so they don't steal our code".
Aterrizar el resultado — no dejar que el entrevistador lo asuma.

## PAGE: STAR — Freelance alongside full-time
status: in-progress

**S:** Aug 2022–Apr 2023, freelance mobile work (React Native + native iOS) for a Bolivian
delivery marketplace, while full-time at Tranzact. **T:** Deliver on scope and timeline
without affecting the day job. **A:** Scoped realistically up front, time-boxed around
the main schedule, ramped up quickly on a stack outside the daily one.
**R:** [COMPLETAR: ¿entregaste a tiempo? ¿trabajo repetido? ¿qué reusaste después?]

## PAGE: STAR — Stakeholder negotiation
status: pending

[COMPLETAR: elegir un caso real de planning/estimación con stakeholders del cliente —
deadline irreal o scope agregado a mitad de sprint, qué propusiste, cómo terminó.]

---

# SECTION: Job Search

## PAGE: Remoto para EE.UU. desde LATAM
status: in-progress

- **Dos puertas:** postular directo a empresas de EE.UU. que contratan en LATAM, y
  plataformas de talento / staff augmentation. Las plataformas suelen filtrar con un test
  de código cronometrado antes de la primera llamada — sin entrevistador que dé pistas.
- **Ventajas a decir en voz alta:** años en producción para un cliente de EE.UU.,
  coordinación con QA y stakeholders de allá, y zona horaria alineada con la costa este.
- **El CV necesita cifras.** Un recruiter lo mira segundos. Rellenar los `[COMPLETAR]`.
- **Mocks en inglés** desde ahora; drills pueden seguir en español.

## PAGE: Preguntas para el entrevistador
status: learned

Nunca terminar con "no tengo preguntas". Tener tres listas:
1. How is on-call and incident response structured on the team?
2. What does your data-access layer look like today, and is anything changing?
3. How is the team using AI tools in the engineering workflow itself?

## PAGE: Debilidades registradas (orden de prioridad)
status: in-progress

1. Salta a la solución antes de encuadrar (todas las rondas del mock).
2. Frase 3: describe su solución buena en vez de la fuerza bruta.
3. Olvida decir la complejidad de espacio.
4. Bajo presión, deja caer la clave en `conteo[c]`.
5. Cruza qué variante de two pointers necesita orden.

Drill de 5 minutos para la #1: en cada problema, prohibido escribir los primeros 30
segundos; decir las frases 1–4 en voz alta.
