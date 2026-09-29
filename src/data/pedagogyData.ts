export interface PillarStatus {
  id: "rol" | "objetivo" | "contexto" | "formato" | "ejemplos" | "enfoque";
  name: string;
  included: boolean;
  feedback: string;
  excerpt: string;
}

export interface PillarCatalogItem {
  id: "rol" | "objetivo" | "contexto" | "formato" | "ejemplos" | "enfoque";
  index: string;
  name: string;
  shortName: string;
  principle: string;
  guidingQuestion: string;
  weakExample: string;
  strongExample: string;
  keyTip: string;
}

export interface ClassroomChallenge {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  taskDescription: string;
  sampleBeginnerPrompt: string;
  learningFocus: string;
}

export interface CompletedChallengeRecord {
  id: string;
  studentName: string;
  task: string;
  initialPrompt: string;
  optimizedPrompt: string;
  initialScore: number;
  finalScore: number;
  completedAt: string;
}

export const SIX_PILLARS_CATALOG: PillarCatalogItem[] = [
  {
    id: "rol",
    index: "01",
    name: "Rol / Persona",
    shortName: "Rol / Persona",
    principle:
      "Asignar un perfil experto específico a la IA activa el vocabulario técnico, el criterio profesional y el enfoque adecuado para tu problema.",
    guidingQuestion: "¿Qué especialista o perfil profesional debería asumir la IA?",
    weakExample: "Escribe consejos para mejorar una página web.",
    strongExample:
      "Actúa como un Diseñador de Experiencia de Usuario (UX) Senior especializado en conversión de comercio electrónico.",
    keyTip:
      "Incluye el nivel de experiencia y la especialidad (ej. 'Profesor de historia para secundaria', 'Analista financiero senior').",
  },
  {
    id: "objetivo",
    index: "02",
    name: "Objetivo claro e instrucción directa",
    shortName: "Objetivo Claro",
    principle:
      "Indicar exactamente qué tarea debe realizar la IA mediante verbos de acción directos elimina la ambigüedad desde la primera línea.",
    guidingQuestion: "¿Cuál es la acción exacta y el entregable concreto que necesitas?",
    weakExample: "Háblame sobre el cambio climático.",
    strongExample:
      "Diseña un guion educativo de 5 minutos que explique las causas del efecto invernadero y 3 acciones cotidianas para reducir la huella de carbono.",
    keyTip:
      "Usa verbos precisos: 'Redacta', 'Resume', 'Compara en una matriz', 'Diseña un plan de 4 semanas', 'Audita'.",
  },
  {
    id: "contexto",
    index: "03",
    name: "Contexto adecuado y público objetivo",
    shortName: "Contexto y Público",
    principle:
      "Proporcionar antecedentes del proyecto, la situación actual y quién leerá el resultado permite que la IA adapte la profundidad y el enfoque.",
    guidingQuestion: "¿Cuál es el trasfondo del proyecto y a qué público va dirigido?",
    weakExample: "Crea un plan de estudio de matemáticas.",
    strongExample:
      "El plan es para un estudiante de 16 años que tiene examen de álgebra en 2 semanas, estudia 45 minutos al día y suele confundirse con ecuaciones cuadráticas.",
    keyTip:
      "Responde siempre: ¿Para quién es?, ¿qué nivel de conocimiento tienen? y ¿en qué situación se usará?",
  },
  {
    id: "formato",
    index: "04",
    name: "Formato de salida y restricciones",
    shortName: "Formato y Límites",
    principle:
      "Especificar cómo debe estructurarse la respuesta (tablas, viñetas, extensión, tono) y establecer límites claros ahorra tiempo de edición.",
    guidingQuestion: "¿Cómo deseas visualizar la respuesta (tabla, lista, extensión, tono)?",
    weakExample: "Dame ideas de publicaciones para Instagram.",
    strongExample:
      "Presenta la respuesta en una tabla con 4 columnas (Día, Gancho inicial, Cuerpo del post en máx. 80 palabras, Llamado a la acción). Usa un tono cercano y profesional.",
    keyTip:
      "Define estructura visual (tabla, pasos numerados), longitud máxima (ej. 200 palabras) y tono (formal, didáctico, persuasivo).",
  },
  {
    id: "ejemplos",
    index: "05",
    name: "Ejemplos de referencia (Few-shot prompting)",
    shortName: "Ejemplos (Few-shot)",
    principle:
      "Mostrar a la IA uno o dos ejemplos breves del estilo, estructura o patrón esperado es la forma más rápida de alinear la calidad del resultado.",
    guidingQuestion: "¿Qué ejemplo o modelo de referencia puede imitar la IA?",
    weakExample: "Escribe títulos atractivos para mi blog.",
    strongExample:
      "Sigue este patrón de ejemplo: '[Número] errores al [Acción] que te cuestan [Resultado] — y cómo evitarlos en [Tiempo]'. Ejemplo: '3 errores al ahorrar que reducen tu capital — y cómo evitarlos en 30 días'.",
    keyTip:
      "Incluso una sola plantilla o ejemplo corto ('Sigue este formato: Concepto -> Analogía -> Ejemplo real') multiplica la precisión.",
  },
  {
    id: "enfoque",
    index: "06",
    name: "Enfoque positivo y desglose paso a paso",
    shortName: "Enfoque y Desglose",
    principle:
      "Indicar qué SÍ debe hacer la IA (en lugar de solo listar prohibiciones) y dividir tareas complejas en pasos secuenciales garantiza razonamiento ordenado.",
    guidingQuestion: "¿En qué secuencia de pasos debe resolver la tarea y qué priorizar?",
    weakExample: "No hagas un resumen aburrido ni uses palabras difíciles ni texto largo.",
    strongExample:
      "Realiza la tarea en 3 pasos secuenciales: Paso 1: Extrae las 3 tesis centrales usando lenguaje sencillo. Paso 2: Ilustra cada tesis con una analogía cotidiana. Paso 3: Concluye con 2 preguntas de repaso.",
    keyTip:
      "Sustituye 'No seas genérico' por 'Incluye datos concretos y divide el proceso en Paso 1, Paso 2 y Paso 3'.",
  },
];

export const DEFAULT_INITIAL_PILLARS: PillarStatus[] = SIX_PILLARS_CATALOG.map((p) => ({
  id: p.id,
  name: p.name,
  included: false,
  feedback: "Pendiente de diagnóstico inicial.",
  excerpt: "",
}));

export const INITIAL_WELCOME_MESSAGE = `¡Hola! Qué gusto darte la bienvenida a nuestro laboratorio interactivo de **Ingeniería de Prompts**.

Antes de empezar, recuerda una idea clave: un **prompt** es la instrucción que le das a la Inteligencia Artificial. Cuando pasas de una petición vaga a un prompt con **claridad, contexto y estructura** (nuestros 6 Pilares), la IA deja de dar respuestas genéricas y empieza a entregarte resultados de nivel profesional.

Para comenzar nuestra práctica paso a paso:
**¿Cuál es tu nombre y qué tarea o proyecto real te gustaría resolver hoy con IA?** *(Por ejemplo: crear un plan de estudio, redactar un post para redes, resumir un tema difícil o generar ideas para un proyecto).*`;

export const CLASSROOM_CHALLENGES: ClassroomChallenge[] = [
  {
    id: "plan-estudio",
    title: "Plan de Estudio Personalizado",
    category: "Educación y Aprendizaje",
    difficulty: "Nivel Inicial",
    taskDescription: "Crear un plan de estudio efectivo para preparar un examen importante en poco tiempo.",
    sampleBeginnerPrompt: "Hazme un plan de estudio para aprobar mi examen de biología celular.",
    learningFocus: "Ideal para practicar Contexto (tiempo disponible, nivel) y Formato (tabla por días).",
  },
  {
    id: "post-redes",
    title: "Campaña de Contenidos Educativos",
    category: "Comunicación Digital",
    difficulty: "Nivel Inicial",
    taskDescription: "Escribir una publicación atractiva en redes sociales para explicar un tema técnico a principiantes.",
    sampleBeginnerPrompt: "Escribe un post para LinkedIn sobre qué es la ciberseguridad.",
    learningFocus: "Ideal para practicar Rol experto, Público objetivo y Ejemplos (Few-shot) de ganchos.",
  },
  {
    id: "resumen-ejecutivo",
    title: "Explicación y Síntesis de Textos Complejos",
    category: "Investigación y Síntesis",
    difficulty: "Nivel Intermedio",
    taskDescription: "Transformar un tema científico o académico denso en una guía clara con analogías prácticas.",
    sampleBeginnerPrompt: "Explícame cómo funciona la fotosíntesis y por qué es importante.",
    learningFocus: "Ideal para practicar Enfoque positivo y desglose en pasos secuenciales.",
  },
  {
    id: "ideas-proyecto",
    title: "Lluvia de Ideas para Proyecto Escolar o Emprendimiento",
    category: "Creatividad Aplicada",
    difficulty: "Nivel Intermedio",
    taskDescription: "Generar propuestas viables de proyectos con impacto comunitario o tecnológico.",
    sampleBeginnerPrompt: "Dame ideas para hacer un proyecto de reciclaje en mi escuela.",
    learningFocus: "Ideal para practicar Restricciones claras (presupuesto, tiempo) y Estructura de salida.",
  },
];
