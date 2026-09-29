import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getGenAIClient() {
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

const TUTOR_SYSTEM_INSTRUCTION = `Eres un Tutor Interactivo de Inteligencia Artificial experto en Ingeniería de Prompts (Prompt Engineering) e Instrucción Pedagógica.
Tu objetivo es enseñar a los alumnos, de forma práctica, dinámica e interactiva, a redactar prompts profesionales y efectivos basándote en metodologías estructuradas.

### 1. LOS 6 PILARES CLAVE QUE DEBES ENSEÑAR Y EVALUAR:
1. "rol" — Rol / Persona: Asignar un rol o perfil experto específico a la IA (ej. "Actúa como un diseñador de UX senior", "Actúa como un tutor de biología").
2. "objetivo" — Objetivo claro e instrucción directa: Decir exactamente qué tarea o resultado concreto debe realizar la IA con verbos de acción claros.
3. "contexto" — Contexto adecuado: Proporcionar antecedentes, situación del proyecto y definición clara del público objetivo.
4. "formato" — Formato de salida y restricciones: Especificar cómo debe presentarse la respuesta (tabla, lista con viñetas, extensión máxima, tono, estilo) y límites claros.
5. "ejemplos" — Ejemplos (Few-shot prompting): Incluir modelos, referencias, estructura de ejemplo o casos previos para guiar el patrón de respuesta.
6. "enfoque" — Enfoque positivo y desglose (Encadenamiento): Indicar a la IA qué SÍ debe hacer paso a paso en secuencia lógica (en lugar de solo prohibiciones ambiguas).

### 2. SECUENCIA PEDAGÓGICA PASO A PASO (ESTRICTA):
- Etapa 1 (Bienvenida e Introducción):
  Conoces el nombre del alumno y qué tarea o proyecto real desea resolver hoy con IA. Si el alumno solo dijo su nombre pero no la tarea, pregúntale con entusiasmo qué tarea quiere resolver hoy. Si ya tienes su nombre y su tarea (o si dio su tarea directamente), pasa a la Etapa 2 ("nextStage": 2) y pídele que escriba su primer intento de prompt para esa tarea "tal como se le ocurra", sin preocuparse por hacerlo perfecto aún.
- Etapa 2 (Diagnóstico del Prompt Inicial):
  Cuando el alumno envía su primer intento de prompt, analízalo con rigor constructivo frente a los 6 pilares.
  Pasa a la Etapa 3/4 ("nextStage": 4 para iniciar el ejercicio guiado mostrando el diagnóstico).
  En "tutorReply":
  1) Felicita al alumno por su primer intento y menciona su calificación inicial (1 a 10) de forma alentadora.
  2) Resume brevemente qué hizo bien y qué pilares faltan.
  3) Hazle UNA SOLA pregunta guiada concreta para mejorar el primer pilar faltante (por ejemplo, empezar por el Rol, el Contexto/Público o el Formato). ¡Nunca hagas múltiples preguntas a la vez para no abrumar al estudiante!
- Etapa 4 (Ejercicio Guiado e Interactivo Paso a Paso):
  El alumno responde a tu pregunta guiada.
  Actualiza "updatedWorkingPrompt" integrando su respuesta de forma natural.
  Marca el pilar trabajado como "included": true en el arreglo "pillars" y sube la puntuación ("score").
  Si aún faltan pilares importantes (y llevamos menos de 3-4 rondas de mejora), mantén "nextStage": 4 y haz UNA SOLA pregunta guiada sobre el siguiente pilar faltante ("currentGuidedPillarId"). Si el alumno comete un error o da una respuesta muy vaga, guíalo amablemente con pistas concretas.
  Cuando ya se hayan trabajado los pilares principales (o al completar 3-4 mejoras clave, o si el alumno pide ver el resultado final), pasa a la Etapa 5 ("nextStage": 5).
- Etapa 5 (Revelación y Comparación del Resultado Final):
  Presenta el "Prompt Optimizado/Profesional" final completo en "updatedWorkingPrompt" y en "comparisonAnalysis.optimizedPrompt", integrando los 6 pilares de manera impecable.
  En "tutorReply", celebra el logro del alumno, destaca brevemente el salto de calidad del "Antes vs. Después" e invítalo a probar ambos prompts en el Simulador en Vivo o a iniciar un nuevo reto.

### 3. REGLAS DE COMPORTAMIENTO Y TONO:
- Tono: Educativo, alentador, claro, estructurado y adaptable a principiantes.
- Brevedad: Mantén "tutorReply" conciso (máximo 2 a 3 párrafos cortos). Promueve el aprendizaje mediante el diálogo práctico.
- Siempre devuelve los 6 pilares en el orden exacto: "rol", "objetivo", "contexto", "formato", "ejemplos", "enfoque".`;

const TURN_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    tutorReply: {
      type: Type.STRING,
      description:
        "Respuesta concisa, cálida y pedagógica del tutor para el alumno. En Etapa 4 debe terminar con UNA SOLA pregunta guiada clara.",
    },
    studentName: {
      type: Type.STRING,
      description: "Nombre del alumno identificado en la conversación (o cadena vacía si aún no lo dice).",
    },
    selectedTask: {
      type: Type.STRING,
      description: "Tarea o proyecto que el alumno quiere resolver con IA (o cadena vacía si aún no la define).",
    },
    nextStage: {
      type: Type.INTEGER,
      description:
        "Etapa actual del flujo pedagógico: 1 (Bienvenida/Nombre/Tarea), 2 (Esperando primer prompt), 4 (Diagnóstico + Ejercicio Guiado Paso a Paso), 5 (Revelación Final Antes vs Después).",
    },
    initialPrompt: {
      type: Type.STRING,
      description: "El primer prompt original escrito por el alumno en la Etapa 2 (conservar intacto una vez capturado).",
    },
    updatedWorkingPrompt: {
      type: Type.STRING,
      description:
        "El prompt en construcción o mejorado hasta el momento. En Etapa 5 debe ser el Prompt Profesional Optimizado completo con los 6 pilares.",
    },
    score: {
      type: Type.INTEGER,
      description: "Calificación actual del prompt del 1 al 10 (0 si aún no ha escrito su primer prompt).",
    },
    scoreJustification: {
      type: Type.STRING,
      description: "Breve justificación constructiva de la calificación actual (1-2 oraciones).",
    },
    currentGuidedPillarId: {
      type: Type.STRING,
      description:
        "ID del pilar sobre el que el tutor está preguntando actualmente en la Etapa 4: 'rol', 'objetivo', 'contexto', 'formato', 'ejemplos' o 'enfoque'.",
    },
    guidedQuestionSummary: {
      type: Type.STRING,
      description: "La pregunta guiada actual resumida en una sola frase clara para mostrar en el panel activo.",
    },
    suggestedQuickReplies: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description:
        "3 opciones o ideas breves y prácticas que el alumno puede usar o adaptar para responder al paso actual.",
    },
    pillars: {
      type: Type.ARRAY,
      description: "Evaluación detallada de los 6 pilares clave.",
      items: {
        type: Type.OBJECT,
        properties: {
          id: {
            type: Type.STRING,
            description: "Uno de: 'rol', 'objetivo', 'contexto', 'formato', 'ejemplos', 'enfoque'.",
          },
          name: {
            type: Type.STRING,
            description: "Nombre legible del pilar.",
          },
          included: {
            type: Type.BOOLEAN,
            description: "true si el prompt actual ya cumple este pilar, false si falta o es insuficiente.",
          },
          feedback: {
            type: Type.STRING,
            description: "Explicación breve y constructiva de por qué cumple o qué le falta a este pilar.",
          },
          excerpt: {
            type: Type.STRING,
            description: "Fragmento del prompt que aplica a este pilar, o sugerencia breve si aún falta.",
          },
        },
        required: ["id", "name", "included", "feedback", "excerpt"],
      },
    },
    comparisonAnalysis: {
      type: Type.OBJECT,
      properties: {
        optimizedPrompt: {
          type: Type.STRING,
          description: "Versión final optimizada y estructurada del prompt lista para copiar y usar.",
        },
        keyImprovements: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description:
            "3 a 4 puntos concretos que explican por qué el Prompt Optimizado (Después) supera al Prompt Inicial (Antes).",
        },
      },
      required: ["optimizedPrompt", "keyImprovements"],
    },
  },
  required: [
    "tutorReply",
    "studentName",
    "selectedTask",
    "nextStage",
    "initialPrompt",
    "updatedWorkingPrompt",
    "score",
    "scoreJustification",
    "currentGuidedPillarId",
    "guidedQuestionSummary",
    "suggestedQuickReplies",
    "pillars",
    "comparisonAnalysis",
  ],
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "2mb" }));

  // 1. Interactive Tutor Turn Endpoint
  app.post("/api/tutor/turn", async (req, res) => {
    try {
      const {
        studentName = "",
        selectedTask = "",
        currentStage = 1,
        initialPrompt = "",
        workingPrompt = "",
        pillars = [],
        messages = [],
        userMessage = "",
        forceFinalize = false,
      } = req.body;

      if (!userMessage || typeof userMessage !== "string") {
        res.status(400).json({ error: "El mensaje del alumno es obligatorio." });
        return;
      }

      const ai = getGenAIClient();

      const stateContext = `
ESTADO ACTUAL DE LA SESIÓN DEL ALUMNO:
- Nombre del alumno conocido hasta ahora: "${studentName || "No especificado aún"}"
- Tarea o proyecto elegido: "${selectedTask || "No especificado aún"}"
- Etapa actual (1 a 5): ${currentStage}
- Prompt Inicial ("Antes"): "${initialPrompt || "Aún no enviado"}"
- Prompt en Construcción actual: "${workingPrompt || "Aún no iniciado"}"
- ¿El alumno solicitó finalizar y ver el Prompt Optimizado ahora mismo?: ${forceFinalize ? "SÍ (Avanza directamente a nextStage: 5 y entrega el Prompt Optimizado completo)" : "NO"}
- Estado previo de los 6 pilares: ${JSON.stringify(pillars)}

HISTORIAL RECIENTE DE LA CONVERSACIÓN:
${messages
  .slice(-8)
  .map((m: { role: string; content: string }) => `${m.role === "user" ? "ALUMNO" : "TUTOR"}: ${m.content}`)
  .join("\n")}

NUEVO MENSAJE DEL ALUMNO:
"${userMessage}"

INSTRUCCIONES DE RESPUESTA PARA ESTE TURNO:
1. Si estamos en Etapa 1:
   - Extrae el nombre del alumno y la tarea que desea realizar si los mencionó en su mensaje.
   - Si dio su nombre y la tarea (o si eligió una tarea directamente), configura "nextStage": 2 y pídele amablemente que escriba su primer prompt para esa tarea tal como se le ocurra hoy. En "suggestedQuickReplies", dale 3 ejemplos realistas de "primeros prompts típicos de principiante" (cortos e imperfectos) para esa tarea por si quiere usar uno de punto de partida.
   - Si solo dio su nombre pero NO dijo qué tarea o proyecto quiere resolver, mantén "nextStage": 1, salúdalo por su nombre y pregúntale qué tarea real le gustaría resolver hoy con IA (dando 3 ideas en "suggestedQuickReplies").
2. Si estamos en Etapa 2 (el alumno acaba de enviar su primer intento de prompt):
   - Guarda su mensaje como "initialPrompt" y también como base de "updatedWorkingPrompt".
   - Evalúa los 6 pilares con honestidad pedagógica (un prompt básico suele tener entre 2/10 y 5/10 y cumplir solo 1 o 2 pilares).
   - Avanza a "nextStage": 4 (Diagnóstico + Ejercicio Guiado Paso a Paso).
   - En "tutorReply", dale su calificación inicial con entusiasmo constructivo, menciona brevemente qué incluyó y qué le faltó, y hazle UNA SOLA pregunta guiada para completar el primer pilar faltante ("currentGuidedPillarId").
   - En "suggestedQuickReplies", ofrece 3 respuestas concretas que el alumno podría elegir o adaptar para responder tu pregunta guiada.
3. Si estamos en Etapa 4 (Ejercicio Guiado Paso a Paso) y forceFinalize es false:
   - Integra la respuesta del alumno en "updatedWorkingPrompt", mejorando la redacción profesionalmente sin perder su intención.
   - Marca como "included": true el pilar o pilares que el alumno acaba de responder, y aumenta "score".
   - Verifica cuántos pilares están ya incluidos. Si ya se cubrieron al menos 5 de los 6 pilares (o si ya hicimos 3 preguntas guiadas), avanza a "nextStage": 5 y genera el Prompt Optimizado final completo integrando los 6 pilares.
   - Si aún faltan pilares clave por definir, mantén "nextStage": 4, felicita brevemente el avance y formula UNA SOLA pregunta guiada para el siguiente pilar faltante ("currentGuidedPillarId"), ofreciendo 3 "suggestedQuickReplies" útiles.
4. Si estamos en Etapa 5 o forceFinalize es true:
   - Configura "nextStage": 5.
   - Redacta un "updatedWorkingPrompt" y "comparisonAnalysis.optimizedPrompt" extraordinario, claro y estructurado que incorpore los 6 pilares (Rol, Objetivo, Contexto, Formato y Restricciones, Ejemplo de referencia Few-shot, y Enfoque positivo paso a paso).
   - Marca los 6 pilares como "included": true con el extracto correspondiente de este prompt final, y otorga un "score" de 10.
   - En "comparisonAnalysis.keyImprovements", detalla 4 razones concretas de por qué el Después supera al Antes.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: stateContext,
        config: {
          systemInstruction: TUTOR_SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          responseSchema: TURN_RESPONSE_SCHEMA,
          temperature: 0.5,
        },
      });

      const rawText = response.text || "{}";
      const parsed = JSON.parse(rawText);
      res.json(parsed);
    } catch (error: any) {
      console.error("Error in /api/tutor/turn:", error);
      res.status(500).json({
        error:
          error?.message ||
          "No se pudo procesar la respuesta del tutor en este momento. Intenta nuevamente.",
      });
    }
  });

  // 2. Live Simulator Endpoint: Executes "Before" vs "After" prompts side-by-side
  app.post("/api/tutor/simulate-comparison", async (req, res) => {
    try {
      const { initialPrompt, optimizedPrompt } = req.body;
      if (!initialPrompt || !optimizedPrompt) {
        res.status(400).json({
          error: "Se requieren tanto el prompt inicial como el prompt optimizado para la simulación.",
        });
        return;
      }

      const ai = getGenAIClient();

      const simulationSchema = {
        type: Type.OBJECT,
        properties: {
          beforeOutput: {
            type: Type.STRING,
            description:
              "Respuesta realista que daría una IA al recibir únicamente el Prompt Inicial (Antes), reflejando su falta de contexto, formato o especificidad (máximo 160 palabras).",
          },
          afterOutput: {
            type: Type.STRING,
            description:
              "Respuesta de alta calidad, estructurada y accionable que genera la IA al ejecutar el Prompt Profesional Optimizado (Después) (máximo 260 palabras).",
          },
          pedagogicalConclusion: {
            type: Type.STRING,
            description:
              "Breve conclusión pedagógica (2-3 oraciones) explicando al alumno la diferencia tangible entre ambos resultados generados.",
          },
        },
        required: ["beforeOutput", "afterOutput", "pedagogicalConclusion"],
      };

      const prompt = `Compara de forma práctica y demostrativa el resultado real que produce cada uno de estos dos prompts:

PROMPT INICIAL DEL ALUMNO (ANTES):
"""
${initialPrompt}
"""

PROMPT PROFESIONAL OPTIMIZADO (DESPUÉS):
"""
${optimizedPrompt}
"""

Genera:
1. "beforeOutput": La respuesta que produce el Prompt Inicial (mostrar cómo al ser genérico o incompleto, el resultado es superficial o genérico).
2. "afterOutput": La respuesta que produce el Prompt Optimizado (siguiendo el rol, contexto, formato y pasos indicados).
3. "pedagogicalConclusion": Una explicación breve para el estudiante destacando por qué el cambio de estructura transformó la respuesta.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: simulationSchema,
          temperature: 0.6,
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      res.json(parsed);
    } catch (error: any) {
      console.error("Error in /api/tutor/simulate-comparison:", error);
      res.status(500).json({
        error:
          error?.message ||
          "Error al simular la comparación en vivo de los prompts.",
      });
    }
  });

  // 3. Instant Prompt Auditor & Optimizer Endpoint (for the "Comparador en Vivo" tool)
  app.post("/api/tutor/instant-audit", async (req, res) => {
    try {
      const { draftPrompt, targetGoal = "" } = req.body;
      if (!draftPrompt || typeof draftPrompt !== "string") {
        res.status(400).json({ error: "Escribe un prompt para analizar." });
        return;
      }

      const ai = getGenAIClient();

      const auditSchema = {
        type: Type.OBJECT,
        properties: {
          initialScore: {
            type: Type.INTEGER,
            description: "Puntuación del 1 al 10 del borrador enviado.",
          },
          scoreJustification: {
            type: Type.STRING,
            description: "Justificación formativa y constructiva de la calificación.",
          },
          pillars: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                name: { type: Type.STRING },
                included: { type: Type.BOOLEAN },
                feedback: { type: Type.STRING },
                excerpt: { type: Type.STRING },
              },
              required: ["id", "name", "included", "feedback", "excerpt"],
            },
          },
          optimizedPrompt: {
            type: Type.STRING,
            description: "El prompt reescrito de forma profesional aplicando los 6 pilares.",
          },
          keyImprovements: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "4 mejoras clave aplicadas en la versión optimizada.",
          },
        },
        required: [
          "initialScore",
          "scoreJustification",
          "pillars",
          "optimizedPrompt",
          "keyImprovements",
        ],
      };

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: `Evalúa pedagógicamente el siguiente prompt escrito por un estudiante y genera tanto el diagnóstico de los 6 pilares ('rol', 'objetivo', 'contexto', 'formato', 'ejemplos', 'enfoque') como su versión profesional optimizada:

PROMPT DEL ALUMNO:
"""
${draftPrompt}
"""
${targetGoal ? `OBJETIVO ADICIONAL: ${targetGoal}` : ""}`,
        config: {
          systemInstruction: TUTOR_SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          responseSchema: auditSchema,
          temperature: 0.4,
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      res.json(parsed);
    } catch (error: any) {
      console.error("Error in /api/tutor/instant-audit:", error);
      res.status(500).json({
        error:
          error?.message || "Error al auditar el prompt.",
      });
    }
  });

  // Vite middleware in dev, static serving in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
