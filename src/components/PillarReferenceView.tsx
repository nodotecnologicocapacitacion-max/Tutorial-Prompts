import React, { useState } from "react";
import { ArrowRight, Check, Copy } from "lucide-react";
import { SIX_PILLARS_CATALOG } from "../data/pedagogyData";

interface PillarReferenceViewProps {
  onReturnToTutor: () => void;
}

const INTERACTIVE_SPECIMEN_BLOCKS: Record<
  string,
  { label: string; snippet: string; impactScore: number }
> = {
  rol: {
    label: "01. Rol / Persona",
    snippet:
      "Actúa como un Tutor Universitario de Ciencias de la Computación especializado en explicar algoritmos complejos a estudiantes de primer año.",
    impactScore: 2,
  },
  objetivo: {
    label: "02. Objetivo Claro",
    snippet:
      "Diseña una guía de estudio práctica para comprender cómo funciona la recursividad en programación.",
    impactScore: 2,
  },
  contexto: {
    label: "03. Contexto y Público",
    snippet:
      "El material está dirigido a alumnos que ya conocen bucles básicos (for/while) pero suelen confundirse con el caso base de una función recursiva.",
    impactScore: 2,
  },
  formato: {
    label: "04. Formato y Restricciones",
    snippet:
      "Presenta la respuesta estructurada en 3 secciones con subtítulos claros, una tabla comparativa (Iteración vs. Recursividad) y una extensión máxima de 300 palabras en tono cercano.",
    impactScore: 2,
  },
  ejemplos: {
    label: "05. Ejemplos (Few-shot)",
    snippet:
      "Incluye un ejemplo cotidiano siguiendo este modelo: 'Situación cotidiana -> Cómo se divide el problema -> Cuál es el punto de parada (caso base)'.",
    impactScore: 1,
  },
  enfoque: {
    label: "06. Enfoque Positivo y Desglose",
    snippet:
      "Resuelve la explicación en orden secuencial: Paso 1: Define el concepto positivamente. Paso 2: Muestra la analogía y la tabla. Paso 3: Cierra con un mini-ejercicio autoevaluable.",
    impactScore: 1,
  },
};

export const PillarReferenceView: React.FC<PillarReferenceViewProps> = ({
  onReturnToTutor,
}) => {
  const [activePillars, setActivePillars] = useState<Record<string, boolean>>({
    rol: true,
    objetivo: true,
    contexto: true,
    formato: true,
    ejemplos: true,
    enfoque: true,
  });
  const [copiedSpecimen, setCopiedSpecimen] = useState(false);

  const togglePillar = (id: string) => {
    setActivePillars((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const activeCount = Object.values(activePillars).filter(Boolean).length;
  const simulatedScore = Math.max(
    1,
    Object.entries(activePillars).reduce(
      (acc, [id, isOn]) =>
        acc + (isOn ? INTERACTIVE_SPECIMEN_BLOCKS[id]?.impactScore || 0 : 0),
      0
    )
  );

  const assembledPrompt =
    activeCount === 0
      ? "Explícame qué es la recursividad."
      : SIX_PILLARS_CATALOG.filter((p) => activePillars[p.id])
          .map((p) => INTERACTIVE_SPECIMEN_BLOCKS[p.id].snippet)
          .join("\n\n");

  const handleCopySpecimen = () => {
    navigator.clipboard.writeText(assembledPrompt);
    setCopiedSpecimen(true);
    setTimeout(() => setCopiedSpecimen(false), 2000);
  };

  return (
    <div className="space-y-10">
      {/* Header & Interactive Anatomy Simulation */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <span>Simulador Conceptual Interactivo</span>
              <span aria-hidden="true">·</span>
              <span>Metodología Estructurada</span>
            </div>
            <h1 className="font-display text-2xl font-semibold text-slate-900 mt-1">
              Los 6 Pilares de un Prompt Profesional
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl">
              Activa o desactiva cada pilar en el simulador inferior para observar cómo cambia la estructura, la precisión y la calificación de un prompt en tiempo real.
            </p>
          </div>

          <button
            type="button"
            onClick={onReturnToTutor}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-sky-600 rounded-lg hover:bg-sky-700 transition-colors cursor-pointer whitespace-nowrap self-start lg:self-auto"
          >
            <span>Practicar con el Tutor Guiado</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Two-Zone Interactive Anatomy Explorer */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6">
          {/* Left: Toggles for the 6 Pillars */}
          <div className="lg:col-span-5 space-y-2.5">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span className="font-semibold text-slate-800">
                Interruptores de Estructura (Haz clic para probar)
              </span>
              <span className="font-mono tabular-nums">
                {activeCount}/6 activos
              </span>
            </div>

            {SIX_PILLARS_CATALOG.map((pillar) => {
              const isOn = Boolean(activePillars[pillar.id]);
              return (
                <button
                  key={pillar.id}
                  type="button"
                  onClick={() => togglePillar(pillar.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg border transition-colors flex items-center justify-between gap-3 cursor-pointer ${
                    isOn
                      ? "bg-sky-50/50 border-sky-300 text-slate-900"
                      : "bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="font-mono text-xs font-semibold text-slate-400 tabular-nums">
                      {pillar.index}.
                    </span>
                    <span className="text-xs font-semibold truncate">
                      {pillar.name}
                    </span>
                  </div>
                  <span
                    className={`font-mono text-xs whitespace-nowrap shrink-0 ${
                      isOn ? "text-emerald-700 font-semibold" : "text-amber-700"
                    }`}
                  >
                    {isOn ? "✅ Activo" : "❌ Omitido"}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right: Live Assembled Prompt & Impact Meter */}
          <div className="lg:col-span-7 flex flex-col justify-between bg-slate-50 border border-slate-200 rounded-xl p-5">
            <div>
              <div className="flex items-center justify-between gap-4 pb-3 mb-4 border-b border-slate-200">
                <div>
                  <span className="text-xs font-semibold text-slate-800 block">
                    Resultado del Prompt Ensamblado
                  </span>
                  <span className="text-xs text-slate-500">
                    {activeCount === 6
                      ? "Estructura profesional completa"
                      : activeCount === 0
                      ? "Petición mínima sin ningún pilar activo"
                      : `Faltan ${6 - activeCount} pilares por incorporar`}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="font-mono tabular-nums text-right">
                    <span className="text-xs text-slate-500 mr-1">Nivel:</span>
                    <span
                      className={`text-base font-semibold ${
                        simulatedScore >= 8
                          ? "text-emerald-700"
                          : simulatedScore >= 5
                          ? "text-sky-700"
                          : "text-amber-700"
                      }`}
                    >
                      {simulatedScore}/10
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopySpecimen}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-100 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    {copiedSpecimen ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar ejemplo</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="font-mono text-xs text-slate-800 whitespace-pre-wrap leading-relaxed bg-white border border-slate-200 rounded-lg p-4 min-h-[210px]">
                {assembledPrompt}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
              <span>
                Observa cómo cada pilar elimina suposiciones y dirige a la IA hacia un resultado exacto.
              </span>
              <button
                type="button"
                onClick={() =>
                  setActivePillars({
                    rol: true,
                    objetivo: true,
                    contexto: true,
                    formato: true,
                    ejemplos: true,
                    enfoque: true,
                  })
                }
                className="font-medium text-sky-700 hover:text-sky-900 whitespace-nowrap ml-3 cursor-pointer"
              >
                Activar los 6 pilares
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Editorial Breakdown of the 6 Pillars */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-slate-900">
            Manual de Referencia Rápida para Alumnos
          </h2>
          <span className="text-xs text-slate-500">
            Comparativa de redacción débil vs. redacción profesional
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {SIX_PILLARS_CATALOG.map((pillar) => (
            <article
              key={pillar.id}
              className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="text-xs text-slate-500 font-mono tabular-nums">
                  Pilar {pillar.index} · {pillar.shortName}
                </div>
                <h3 className="font-display text-lg font-semibold text-slate-900 mt-1">
                  {pillar.index}. {pillar.name}
                </h3>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                  {pillar.principle}
                </p>
              </div>

              <div className="space-y-2.5 pt-3 border-t border-slate-100 text-xs">
                <div className="p-3 bg-amber-50/50 border border-amber-200/80 rounded-lg">
                  <span className="font-semibold text-amber-900 block mb-0.5">
                    ❌ Ejemplo sin estructura:
                  </span>
                  <p className="text-slate-700 italic">"{pillar.weakExample}"</p>
                </div>

                <div className="p-3 bg-emerald-50/50 border border-emerald-200/80 rounded-lg">
                  <span className="font-semibold text-emerald-900 block mb-0.5">
                    ✅ Ejemplo aplicando este pilar:
                  </span>
                  <p className="text-slate-800">"{pillar.strongExample}"</p>
                </div>

                <p className="text-slate-500 pt-1">
                  <span className="font-semibold text-slate-700">
                    Consejo práctico:{" "}
                  </span>
                  {pillar.keyTip}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};
