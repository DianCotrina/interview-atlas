import type { Locale } from "./locale";

const english = {
  site: {
    title: "Your interview library",
    description:
      "Concepts, patterns and practice to explain your decisions clearly in a technical interview.",
    skip: "Skip to content",
  },
  sidebar: {
    home: "Interview Atlas, home",
    caption: "Your library for thinking and answering clearly.",
    navigation: "Study navigation",
    all: "All concepts",
    note: "Explain the approach first. Then write the code.",
  },
  language: {
    label: "Language",
    pending: "Confirm this review before changing language.",
  },
  sections: {
    Fundamentals: "Fundamentals",
    Patterns: "Patterns",
    Behavioral: "STAR stories",
    "AI Engineering": "AI code review",
  },
  statuses: {
    learned: "Learned",
    "in-progress": "Practicing",
    pending: "To study",
  },
  home: {
    context: "Your preparation space",
    title: "Concepts for the interview.",
    intro: "Find an idea, revisit the reasoning and practice it out loud.",
    principle: "Explaining it matters as much as solving it.",
    advice:
      "Restate, clarify the rules, compare approaches, and state time and space.",
    footer: "Short reviews. Clearer answers.",
  },
  catalog: {
    searchLabel: "Search concepts by title or tag",
    placeholder: "Search: hashmap, complexity, AI…",
    filter: "Filter by section",
    all: "All",
    heading: "Your study material",
    singular: "concept",
    plural: "concepts",
    emptyTitle: "No concepts match this search.",
    emptyAdvice: "Try another word or change the section.",
    reset: "View all concepts",
  },
  concept: {
    back: "All concepts",
    summary: "The idea in one minute",
    interview: "How to say it in the interview",
    details: "Full explanation",
    related: "Connect this idea",
    footer: "Explain the reasoning, not just the code.",
    library: "Back to the library",
    notFound: "Concept not found",
    placeholder: "Needs your real information",
  },
  grades: {
    "knew-it": "Knew it",
    hesitated: "Hesitated",
    "did-not-know": "Did not know",
  },
  practice: {
    eyebrow: "From recall to explanation",
    heading: "Practice out loud",
    singular: "question",
    plural: "questions",
    intro: "Answer first. Then reveal the answer and record how you did.",
    reveal: "Reveal answer",
    hide: "Hide answer",
    assessment: "How did you do before seeing the answer?",
    saving: "Saving review…",
    retry: "Retry save",
    saved: "Saved",
    again: "Review this question again",
    conflict:
      "This attempt has a conflict. Reload the page and check your history before recording another review.",
    failed:
      "Could not confirm the save. Keep this page open to retry the same review.",
  },
  history: {
    label: "Review history",
    heading: "Your review history",
    loading: "Loading history…",
    unavailable:
      "History is unavailable. You can keep reading and revealing answers.",
    empty: "No reviews have been saved for this concept yet.",
    savedSingular: "saved review",
    savedPlural: "saved reviews",
    of: "of",
    questionsReviewed: "questions reviewed",
    reviewSingular: "review",
    reviewPlural: "reviews",
    retry: "Check again",
  },
};

const spanish: typeof english = {
  site: {
    title: "Tu biblioteca de entrevistas",
    description:
      "Conceptos, patrones y práctica para explicar tus decisiones con claridad en una entrevista técnica.",
    skip: "Saltar al contenido",
  },
  sidebar: {
    home: "Interview Atlas, inicio",
    caption: "Tu biblioteca para pensar y responder con claridad.",
    navigation: "Navegación de estudio",
    all: "Todos los conceptos",
    note: "Primero explica el enfoque. Después escribe el código.",
  },
  language: {
    label: "Idioma",
    pending: "Confirma este repaso antes de cambiar de idioma.",
  },
  sections: {
    Fundamentals: "Fundamentos",
    Patterns: "Patrones",
    Behavioral: "Historias STAR",
    "AI Engineering": "AI code review",
  },
  statuses: {
    learned: "Aprendido",
    "in-progress": "En práctica",
    pending: "Por estudiar",
  },
  home: {
    context: "Tu espacio de preparación",
    title: "Conceptos para la entrevista.",
    intro: "Busca una idea, repasa el porqué y practícala en voz alta.",
    principle: "Que puedas explicarlo importa tanto como resolverlo.",
    advice:
      "Reformula, aclara las reglas, compara enfoques y di tiempo y espacio.",
    footer: "Pequeños repasos. Respuestas más claras.",
  },
  catalog: {
    searchLabel: "Buscar conceptos por título o etiqueta",
    placeholder: "Buscar: hashmap, complejidad, AI…",
    filter: "Filtrar por sección",
    all: "Todos",
    heading: "Tu material de estudio",
    singular: "concepto",
    plural: "conceptos",
    emptyTitle: "No hay conceptos con esa búsqueda.",
    emptyAdvice: "Prueba otra palabra o cambia la sección.",
    reset: "Ver todos los conceptos",
  },
  concept: {
    back: "Todos los conceptos",
    summary: "La idea en un minuto",
    interview: "How to say it in the interview",
    details: "Explicación completa",
    related: "Conecta esta idea",
    footer: "Explica el porqué, no solo el código.",
    library: "Volver a la biblioteca",
    notFound: "Concepto no encontrado",
    placeholder: "Necesita tu dato real",
  },
  grades: {
    "knew-it": "Lo sabía",
    hesitated: "Dudé",
    "did-not-know": "No lo sabía",
  },
  practice: {
    eyebrow: "De recordar a explicar",
    heading: "Práctica en voz alta",
    singular: "pregunta",
    plural: "preguntas",
    intro:
      "Responde primero. Después revela la respuesta y registra cómo te fue.",
    reveal: "Revelar respuesta",
    hide: "Ocultar respuesta",
    assessment: "¿Cómo te fue antes de ver la respuesta?",
    saving: "Guardando repaso…",
    retry: "Reintentar guardado",
    saved: "Guardado",
    again: "Repasar esta pregunta otra vez",
    conflict:
      "Este intento tiene un conflicto. Vuelve a cargar la página y consulta tu historial antes de registrar otro repaso.",
    failed:
      "No se pudo confirmar el guardado. Mantén esta página abierta para reintentar el mismo repaso.",
  },
  history: {
    label: "Historial de repasos",
    heading: "Tu historial de repasos",
    loading: "Consultando historial…",
    unavailable:
      "Historial no disponible. Puedes seguir leyendo y revelar respuestas.",
    empty: "Aún no hay repasos guardados para este concepto.",
    savedSingular: "repaso guardado",
    savedPlural: "repasos guardados",
    of: "de",
    questionsReviewed: "preguntas repasadas",
    reviewSingular: "repaso",
    reviewPlural: "repasos",
    retry: "Volver a consultar",
  },
};

export const messages: Record<Locale, typeof english> = {
  es: spanish,
  en: english,
};
