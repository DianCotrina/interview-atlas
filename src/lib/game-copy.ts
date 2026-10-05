import type { Locale } from "./locale";
import type { Collection, Complexity, MissionId, Phase } from "./collection-game";
import type { Decision, Reason } from "./collection-traces";

type MissionCopy = { title: string; goal: string; hint: string; structure: string; complexity: string; definitions: string; badge: string };
type GameCopy = {
  title: string; intro: string; enter: string; campaign: string; map: string; stars: string;
  session: string; phases: Record<Exclude<Phase, "complete">, string>;
  structurePrompt: string; tracePrompt: string; complexityPrompt: string;
  collection: string; input: string; current: string; empty: string; choose: string;
  correct: string; wrong: string; wrongTrace: string; wrongStructure: string; wrongComplexity: string;
  next: string; step: string; showHint: string; hideHint: string; read: string; replay: string;
  complete: string; completed: string; rewardNote: string; nextMission: string; allDone: string;
  collectionNames: Record<Collection, string>; complexityNames: Record<Complexity, string>;
  decisions: Record<Decision, string>; reasons: Record<Reason, string>;
  missions: Record<MissionId, MissionCopy>;
};

const english: GameCopy = {
  title: "The collection quest", intro: "Choose your tool. Make each move. Explain why it works.",
  enter: "Start playing", campaign: "Four missions. No clock. Think it through.",
  map: "Choose a mission", stars: "objective stars", session: "Stars and badges last for this session. Reloading or changing language starts a new game; saved study reviews stay in your history.",
  phases: { structure: "Choose your tool", trace: "Make your moves", complexity: "Explain the cost" },
  structurePrompt: "Which collection fits the job with the least unnecessary state?",
  tracePrompt: "What should happen to this item?", complexityPrompt: "For an arbitrary input, what are the time and space costs?",
  collection: "Your collection", input: "Input", current: "Current item", empty: "Empty collection. Your first move will build it.", choose: "Choose a move", correct: "Good move.", wrong: "Try another approach.",
  wrongTrace: "Look at the collection before this move. Is the key new, already present, or ready to compare?",
  wrongStructure: "Think about what must be remembered: presence, a count, or all items in each group. More state can work, but this mission asks for the smallest suitable tool.",
  wrongComplexity: "Count the passes and what stays in memory. Sequential loops add their costs; storing every item takes more than one number per key.",
  next: "Continue", step: "Move", showHint: "Show a hint", hideHint: "Hide hint", read: "Read the concept", replay: "Replay mission",
  complete: "Mission complete", completed: "Badge earned", rewardNote: "You completed the three objectives. Keep practicing to build recall; this badge is not a mastery assessment.", nextMission: "Play the next mission", allDone: "Collection campaign complete. All four badges earned.",
  collectionNames: { list: "List<T> · keep a sequence", set: "HashSet<T> · remember presence", counts: "Dictionary<T, int> · keep counts", groups: "Dictionary<T, List<T>> · keep groups" },
  complexityNames: { "linear-distinct": "O(n) time / O(k) space", "linear-all": "O(n) time / O(n) space", quadratic: "O(n²) time / O(n) space", constant: "O(1) time / O(1) space" },
  decisions: { create: "Create an entry", increment: "Increase the count", append: "Append to the existing list", add: "Add it to the set", stop: "Return this value and stop", continue: "Continue to counting", reject: "Return false now", match: "Frequencies match", mismatch: "Frequencies differ" },
  reasons: {
    "new-key": "This key is new. Start its count at one.", "known-key": "The key is already present. Increment its count rather than replacing it.",
    "new-group": "This group is new. Create a list containing the first action.", "known-group": "This group exists. Append the action and preserve the earlier actions.",
    unseen: "This value has not appeared. Remember it and keep scanning.", repeated: "This is the earliest second occurrence. Stop here; the traversal order provides the guarantee.",
    "equal-length": "Equal lengths allow counting. They do not prove that the strings are anagrams.", "unequal-length": "Different lengths cannot be anagrams. Reject before counting.",
    "same-frequency": "This character has the same frequency in both maps. Continue checking the remaining keys.",
    "different-frequency": "A character frequency differs. Equal length alone is not enough: return false.", "empty-anagrams": "Both strings are empty, so their lengths and frequencies match.",
  },
  missions: {
    "dictionary-counting": { title: "Count the signals", goal: "Count how many times each status arrives: OK, WAIT and FAIL.", hint: "For every status, ask: have I already stored a count for this key?", structure: "A dictionary stores one running count per distinct status.", complexity: "One pass, with average constant-time hash operations. Keep one count per distinct key.", definitions: "n = number of items; k = distinct status keys. Hash-operation costs are average-case.", badge: "Signal counter" },
    grouping: { title: "Assemble the crews", goal: "Group each person's actions. Keep repeated actions and their input order.", hint: "The value needs to hold every action, not just the number of actions.", structure: "A dictionary of lists keeps every action under its person's key.", complexity: "One pass with average hash costs and amortized list appends. All n actions stay in memory.", definitions: "n = number of records; k = number of groups. Measure all stored actions, not only the keys.", badge: "Crew organizer" },
    "first-duplicate": { title: "Spot the echo", goal: "Scan A, B, B, A. Return the value with the earliest second appearance.", hint: "Check membership BEFORE adding the current value. The first original value does not necessarily repeat first.", structure: "A HashSet remembers presence. Counts and lists per key would add unnecessary state.", complexity: "In the worst traversal, scan n items and retain up to n distinct values. Hash operations have average constant cost.", definitions: "n = number of items. Consider the worst traversal, including inputs with no duplicate; hash-operation costs are average-case.", badge: "Echo finder" },
    anagrams: { title: "Decode the pair", goal: "Are aab and abb anagrams? Compare lengths, then exact character frequencies. Case matters; do not normalize.", hint: "Equal lengths are necessary. After counting, every character must have the same frequency in both strings.", structure: "Two dictionaries record character frequencies for comparison.", complexity: "Sequential counting passes and a key comparison give O(n) average time. Store up to k distinct character counts; a fixed alphabet bounds space.", definitions: "n = combined character count; k = distinct characters. Use O(k) for a variable alphabet. Hash-operation costs are average-case; the C# sample counts UTF-16 char units.", badge: "Frequency decoder" },
  },
};

const spanish: GameCopy = {
  title: "La misión de las colecciones", intro: "Elige tu herramienta. Decide cada movimiento. Explica por qué funciona.",
  enter: "Empezar a jugar", campaign: "Cuatro misiones. Sin reloj. Piensa cada decisión.",
  map: "Elige una misión", stars: "estrellas de objetivos", session: "Las estrellas e insignias duran esta partida. Recargar o cambiar de idioma inicia otra; tus autoevaluaciones guardadas siguen en el historial.",
  phases: { structure: "Elige tu herramienta", trace: "Haz tus movimientos", complexity: "Explica el costo" },
  structurePrompt: "¿Qué colección resuelve el trabajo sin guardar información innecesaria?",
  tracePrompt: "¿Qué debe pasar con este elemento?", complexityPrompt: "Para una entrada cualquiera, ¿cuál es el costo en tiempo y espacio?",
  collection: "Tu colección", input: "Entrada", current: "Elemento actual", empty: "Colección vacía. Tu primer movimiento la construirá.", choose: "Elige un movimiento", correct: "Buen movimiento.", wrong: "Prueba otro enfoque.",
  wrongTrace: "Mira la colección antes de este movimiento. ¿La clave es nueva, ya existe o toca comparar?",
  wrongStructure: "Piensa qué necesitas recordar: presencia, un conteo o todos los elementos de cada grupo. Guardar más información puede funcionar, pero aquí buscamos la herramienta más simple que cumple el objetivo.",
  wrongComplexity: "Cuenta los recorridos y lo que queda en memoria. Los bucles secuenciales suman sus costos; guardar todos los elementos ocupa más que un número por clave.",
  next: "Continuar", step: "Movimiento", showHint: "Ver una pista", hideHint: "Ocultar pista", read: "Leer el concepto", replay: "Repetir misión",
  complete: "Misión completada", completed: "Insignia obtenida", rewardNote: "Completaste los tres objetivos. Sigue practicando para recordar el patrón; esta insignia no es una evaluación de dominio.", nextMission: "Jugar la siguiente misión", allDone: "Campaña de colecciones completada. Conseguiste las cuatro insignias.",
  collectionNames: { list: "List<T> · guardar una secuencia", set: "HashSet<T> · recordar presencia", counts: "Dictionary<T, int> · contar", groups: "Dictionary<T, List<T>> · agrupar" },
  complexityNames: { "linear-distinct": "O(n) tiempo / O(k) espacio", "linear-all": "O(n) tiempo / O(n) espacio", quadratic: "O(n²) tiempo / O(n) espacio", constant: "O(1) tiempo / O(1) espacio" },
  decisions: { create: "Crear una entrada", increment: "Aumentar el conteo", append: "Agregar a la lista existente", add: "Agregar al conjunto", stop: "Devolver este valor y detenerse", continue: "Continuar con el conteo", reject: "Devolver false ahora", match: "Las frecuencias coinciden", mismatch: "Las frecuencias difieren" },
  reasons: {
    "new-key": "La clave es nueva. Inicia su conteo en uno.", "known-key": "La clave ya existe. Incrementa su conteo en lugar de reemplazarlo.",
    "new-group": "El grupo es nuevo. Crea una lista con la primera acción.", "known-group": "El grupo ya existe. Agrega la acción y conserva las anteriores.",
    unseen: "Este valor todavía no apareció. Recuérdalo y continúa el recorrido.", repeated: "Esta es la segunda aparición más temprana. Detente aquí; el orden del recorrido da la garantía.",
    "equal-length": "Los largos iguales permiten contar. Todavía no prueban que sean anagramas.", "unequal-length": "Con largos diferentes no pueden ser anagramas. Descarta antes de contar.",
    "same-frequency": "Este carácter aparece la misma cantidad de veces en ambos mapas. Continúa revisando las claves restantes.",
    "different-frequency": "Una frecuencia es diferente. Los largos iguales no bastan: devuelve false.", "empty-anagrams": "Ambas cadenas están vacías, así que sus largos y frecuencias coinciden.",
  },
  missions: {
    "dictionary-counting": { title: "Cuenta las señales", goal: "Cuenta cuántas veces llega cada estado: OK, WAIT y FAIL.", hint: "Para cada estado, pregúntate: ¿ya guardé un conteo para esta clave?", structure: "Un diccionario guarda un conteo acumulado por cada estado distinto.", complexity: "Un recorrido, con operaciones hash de costo constante promedio. Guarda un conteo por clave distinta.", definitions: "n = cantidad de elementos; k = claves de estado distintas. El costo de las operaciones hash es promedio.", badge: "Contador de señales" },
    grouping: { title: "Reúne a los equipos", goal: "Agrupa las acciones de cada persona. Conserva las repetidas y su orden de entrada.", hint: "El valor necesita guardar todas las acciones, no solo cuántas hay.", structure: "Un diccionario de listas guarda todas las acciones bajo la clave de su persona.", complexity: "Un recorrido con operaciones hash de costo promedio y adiciones a listas amortizadas. Las n acciones quedan en memoria.", definitions: "n = cantidad de registros; k = cantidad de grupos. Cuenta todas las acciones guardadas, no solo las claves.", badge: "Organizador de equipos" },
    "first-duplicate": { title: "Encuentra el eco", goal: "Recorre A, B, B, A. Devuelve el valor con la segunda aparición más temprana.", hint: "Comprueba si existe ANTES de agregar el valor. El primer valor original no necesariamente se repite primero.", structure: "Un HashSet recuerda presencia. Los conteos y listas por clave guardarían información innecesaria.", complexity: "En el peor recorrido, revisas n elementos y guardas hasta n valores distintos. Las operaciones hash tienen costo constante promedio.", definitions: "n = cantidad de elementos. Considera el peor recorrido, incluso sin repetidos; el costo de las operaciones hash es promedio.", badge: "Detector de ecos" },
    anagrams: { title: "Descifra el par", goal: "¿aab y abb son anagramas? Compara largos y frecuencias exactas. Distingue mayúsculas; no normalices.", hint: "Los largos iguales son necesarios. Después de contar, cada carácter debe aparecer la misma cantidad de veces en ambas cadenas.", structure: "Dos diccionarios guardan las frecuencias de caracteres para compararlas.", complexity: "Los conteos secuenciales y la comparación de claves dan O(n) promedio. Guarda hasta k conteos distintos; un alfabeto fijo acota el espacio.", definitions: "n = cantidad combinada de caracteres; k = caracteres distintos. Usa O(k) para un alfabeto variable. El costo hash es promedio; el ejemplo C# cuenta unidades char UTF-16.", badge: "Descifrador de frecuencias" },
  },
};
export const gameCopy: Record<Locale, GameCopy> = { es: spanish, en: english };
