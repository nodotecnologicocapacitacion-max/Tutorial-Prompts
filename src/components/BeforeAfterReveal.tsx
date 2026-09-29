import React, { useState } from "react";
import { Check, Copy, Play, RotateCcw, ArrowRight } from "lucide-react";

interface BeforeAfterRevealProps {
  studentName: string;
  selectedTask: string;
  initialPrompt: string;
  optimizedPrompt: string;
  keyImprovements: string[];
  onStartNewChallenge: () => void;
  onExploreChallenges: () => void;
}

interface SimulationResult {
  beforeOutput: string;
  afterOutput: string;
  pedagogicalConclusion: string;
}

export const BeforeAfterReveal: React.FC<BeforeAfterRevealProps> = ({
  studentName,
  selectedTask,
  initialPrompt,
  optimizedPrompt,
  keyImprovements,
  onStartNewChallenge,
  onExploreChallenges,
}) => {
  const [copiedAfter, setCopiedAfter] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [simError, setSimError] = useState<string | null>(null);
  const [simulation, setSimulation] = useState<SimulationResult | null>(null);

  const handleCopyOptimized = () => {
    if (!optimizedPrompt) return;
    navigator.clipboard.writeText(optimizedPrompt);
    setCopiedAfter(true);
    setTimeout(() => setCopiedAfter(false), 2000);
  };

  const handleRunLiveComparison = async () => {
    if (!initialPrompt || !optimizedPrompt || simulating) return;
    setSimulating(true);
    setSimError(null);

    try {
      const response = await fetch("/api/tutor/simulate-comparison", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          initialPrompt,
          optimizedPrompt,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Error al ejecutar la simulación en vivo.");
      }
      setSimulation(data);
    } catch (err: any) {
      setSimError(
        err?.message || "No se pudo completar la simulación en este momento."
      );
    } finally {
      setSimulating(false);
    }
  };

  return (
    <section
      aria-label="Revelación y Comparación Antes vs. Después"
      className="bg-white border border-slate-200 rounded-xl p-6 space-y-6"
    >
      <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <span>Etapa 5 Completada</span>
            <span aria-hidden="true">·</span>
            <span>6 de 6 Pilares Integrados</span>
            {studentName && (
              <>
                <span aria-hidden="true">·</span>
                <span>Logro de {studentName}</span>
              </>
            )}
          </div>
          <h3 className="font-display text-xl font-semibold text-slate-900 mt-1">
            Revelación Final: Tu Prompt Antes vs. Después
          </h3>
        </div>

        <button
          type="button"
          onClick={handleCopyOptimized}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-sky-600 rounded-lg hover:bg-sky-700 transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          {copiedAfter ? (
            <>
              <Check className="w-4 h-4" />
              <span>Prompt Optimizado Copiado</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Copiar Prompt Profesional</span>
            </>
          )}
        </button>
      </div>

      {/* Side-by-Side Comparison: Antes vs. Después */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Antes (Initial Prompt) */}
        <div className="flex flex-col border border-slate-200 rounded-lg bg-slate-50/70 p-5">
          <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-200">
            <span className="text-xs font-semibold text-slate-700">
              ANTES · Primer Intento del Alumno
            </span>
            <span className="text-xs font-mono text-amber-700">
              ▲ Sin estructura completa
            </span>
          </div>
          <p className="font-mono text-xs text-slate-700 whitespace-pre-wrap leading-relaxed flex-1">
            {initialPrompt || "Prompt inicial breve."}
          </p>
          <p className="mt-4 pt-3 border-t border-slate-200 text-xs text-slate-500">
            Al carecer de rol, restricciones y formato explícito, obliga a la IA a adivinar el nivel de profundidad y el público objetivo.
          </p>
        </div>

        {/* Después (Optimized Professional Prompt) */}
        <div className="flex flex-col border border-emerald-300 rounded-lg bg-emerald-50/20 p-5">
          <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-emerald-200">
            <span className="text-xs font-semibold text-slate-900">
              DESPUÉS · Prompt Optimizado / Profesional
            </span>
            <span className="text-xs font-mono font-semibold text-emerald-700">
              ✅ 6 Pilares Activos
            </span>
          </div>
          <p className="font-mono text-xs text-slate-900 whitespace-pre-wrap leading-relaxed flex-1">
            {optimizedPrompt}
          </p>
          <p className="mt-4 pt-3 border-t border-emerald-200 text-xs text-emerald-800">
            Integra Rol experto, Objetivo directo, Contexto de audiencia, Formato estructurado, Referencia Few-shot y Desglose paso a paso.
          </p>
        </div>
      </div>

      {/* Why the Optimized Version is Superior */}
      {keyImprovements && keyImprovements.length > 0 && (
        <div className="pt-2 border-t border-slate-200">
          <h4 className="text-sm font-semibold text-slate-900 mb-3">
            ¿Por qué esta versión optimizada generará una respuesta superior?
          </h4>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {keyImprovements.map((item, idx) => (
              <li
                key={idx}
                className="text-xs text-slate-700 leading-relaxed flex items-start gap-2.5 bg-slate-50 p-3 rounded-lg border border-slate-200/80"
              >
                <span className="font-mono font-semibold text-sky-700 shrink-0 tabular-nums">
                  0{idx + 1}.
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Live Execution Sandbox: Test Optimized Prompt vs Initial Prompt */}
      <div className="pt-4 border-t border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h4 className="text-sm font-semibold text-slate-900">
              Laboratorio de Prueba en Vivo: Ejecuta ambos prompts con IA
            </h4>
            <p className="text-xs text-slate-600 mt-0.5">
              Comprueba empíricamente cómo responde la Inteligencia Artificial a tu primer prompt frente a tu nuevo prompt profesional.
            </p>
          </div>

          <button
            type="button"
            onClick={handleRunLiveComparison}
            disabled={simulating}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-slate-900 bg-slate-100 border border-slate-300 rounded-lg hover:bg-slate-200 disabled:opacity-60 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <Play className="w-3.5 h-3.5 text-sky-700" />
            <span>
              {simulating
                ? "Generando respuestas comparativas..."
                : simulation
                ? "Volver a Probar Prompts en Vivo"
                : "Probar Prompt Optimizado en Vivo"}
            </span>
          </button>
        </div>

        {simError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
            {simError}
          </div>
        )}

        {simulation && (
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="text-xs font-semibold text-slate-600 mb-2 pb-2 border-b border-slate-200">
                  Respuesta de la IA al Prompt Inicial (Antes)
                </div>
                <div className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto">
                  {simulation.beforeOutput}
                </div>
              </div>

              <div className="p-4 bg-sky-50/30 border border-sky-200 rounded-lg">
                <div className="text-xs font-semibold text-sky-900 mb-2 pb-2 border-b border-sky-200">
                  Respuesta de la IA al Prompt Profesional (Después)
                </div>
                <div className="text-xs text-slate-800 whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto">
                  {simulation.afterOutput}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-900 text-slate-100 rounded-lg text-xs leading-relaxed">
              <span className="font-semibold text-sky-300 mr-1.5">
                Conclusión Pedagógica:
              </span>
              {simulation.pedagogicalConclusion}
            </div>
          </div>
        )}
      </div>

      {/* Next Step CTAs */}
      <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-slate-600">
          ¿Listo para consolidar lo aprendido con otro caso práctico{selectedTask ? ` distinto a "${selectedTask}"` : ""}?
        </p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onExploreChallenges}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer whitespace-nowrap"
          >
            <span>Explorar Retos de Práctica</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onStartNewChallenge}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Pasar al Siguiente Reto</span>
          </button>
        </div>
      </div>
    </section>
  );
};
