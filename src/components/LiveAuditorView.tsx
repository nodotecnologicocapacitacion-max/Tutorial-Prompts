import React, { useState } from "react";
import { Check, Copy, Play, Sparkles } from "lucide-react";
import { PillarStatus, SIX_PILLARS_CATALOG } from "../data/pedagogyData";

interface AuditResult {
  initialScore: number;
  scoreJustification: string;
  pillars: PillarStatus[];
  optimizedPrompt: string;
  keyImprovements: string[];
}

interface SimulationComparison {
  beforeOutput: string;
  afterOutput: string;
  pedagogicalConclusion: string;
}

const SAMPLE_DRAFTS = [
  {
    label: "Plan de clase",
    draft: "Hazme una clase sobre la Revolución Francesa para mis alumnos.",
  },
  {
    label: "Correo profesional",
    draft: "Escribe un correo pidiendo una reunión a un cliente para mostrarle nuestro software.",
  },
  {
    label: "Resumen de libro",
    draft: "Resume las ideas más importantes de Cien años de soledad.",
  },
];

export const LiveAuditorView: React.FC = () => {
  const [draftPrompt, setDraftPrompt] = useState("");
  const [loadingAudit, setLoadingAudit] = useState(false);
  const [auditError, setAuditError] = useState<string | null>(null);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [copiedOptimized, setCopiedOptimized] = useState(false);

  const [simulating, setSimulating] = useState(false);
  const [simResult, setSimResult] = useState<SimulationComparison | null>(null);

  const handleRunAudit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!draftPrompt.trim() || loadingAudit) return;

    setLoadingAudit(true);
    setAuditError(null);
    setSimResult(null);

    try {
      const response = await fetch("/api/tutor/instant-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draftPrompt: draftPrompt.trim() }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Error al analizar el prompt.");
      }

      setAuditResult(data);
    } catch (err: any) {
      setAuditError(
        err?.message || "No se pudo completar el diagnóstico en este momento."
      );
    } finally {
      setLoadingAudit(false);
    }
  };

  const handleSimulateBoth = async () => {
    if (!auditResult || !draftPrompt.trim() || simulating) return;
    setSimulating(true);
    try {
      const response = await fetch("/api/tutor/simulate-comparison", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          initialPrompt: draftPrompt.trim(),
          optimizedPrompt: auditResult.optimizedPrompt,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Error al simular respuestas.");
      }
      setSimResult(data);
    } catch (err: any) {
      setAuditError(err?.message || "Error al ejecutar la simulación en vivo.");
    } finally {
      setSimulating(false);
    }
  };

  const handleCopyOptimized = () => {
    if (!auditResult?.optimizedPrompt) return;
    navigator.clipboard.writeText(auditResult.optimizedPrompt);
    setCopiedOptimized(true);
    setTimeout(() => setCopiedOptimized(false), 2000);
  };

  return (
    <div className="space-y-8">
      <section className="bg-white border border-slate-200 rounded-xl p-6 lg:p-8">
        <div className="border-b border-slate-200 pb-5 mb-6">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <span>Herramienta de Diagnóstico Directo</span>
            <span aria-hidden="true">·</span>
            <span>Evaluación de 6 Pilares + Antes vs. Después</span>
          </div>
          <h1 className="font-display text-2xl font-semibold text-slate-900 mt-1">
            Comparador y Auditor de Prompts en Vivo
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            Escribe o pega cualquier borrador de prompt para obtener al instante su calificación del 1 al 10, la verificación de los 6 pilares (✅ / ❌) y su versión profesional optimizada.
          </p>
        </div>

        <form onSubmit={handleRunAudit} className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label
              htmlFor="auditor-textarea"
              className="text-xs font-semibold text-slate-800"
            >
              Tu borrador de prompt (Antes)
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-slate-500">Ejemplos rápidos:</span>
              {SAMPLE_DRAFTS.map((sample) => (
                <button
                  key={sample.label}
                  type="button"
                  onClick={() => setDraftPrompt(sample.draft)}
                  className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200 transition-colors cursor-pointer whitespace-nowrap"
                >
                  {sample.label}
                </button>
              ))}
            </div>
          </div>

          <textarea
            id="auditor-textarea"
            rows={4}
            value={draftPrompt}
            onChange={(e) => setDraftPrompt(e.target.value)}
            placeholder="Ejemplo: Hazme un plan de estudio para aprobar mi examen de historia..."
            className="w-full p-4 text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-600 transition-colors"
          />

          <div className="flex items-center justify-between gap-4">
            <span className="text-xs text-slate-500">
              Se evaluarán: Rol · Objetivo · Contexto · Formato · Ejemplos · Enfoque positivo
            </span>
            <button
              type="submit"
              disabled={!draftPrompt.trim() || loadingAudit}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-sky-600 rounded-lg hover:bg-sky-700 disabled:opacity-50 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Sparkles className="w-4 h-4" />
              <span>
                {loadingAudit
                  ? "Analizando los 6 Pilares..."
                  : "Diagnosticar y Optimizar Prompt"}
              </span>
            </button>
          </div>
        </form>

        {auditError && (
          <div className="mt-4 p-3.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
            {auditError}
          </div>
        )}
      </section>

      {auditResult && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left 5 cols: Diagnostic Score & 6 Pillars */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <span className="text-xs text-slate-500 block">
                  Diagnóstico del Borrador
                </span>
                <h2 className="font-display text-lg font-semibold text-slate-900">
                  Evaluación de Pilares
                </h2>
              </div>
              <div className="font-mono tabular-nums text-right">
                <span className="text-xs text-slate-500 block">
                  Calificación inicial
                </span>
                <span className="text-xl font-semibold text-amber-700">
                  {auditResult.initialScore}/10
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {auditResult.scoreJustification}
            </p>

            <div className="divide-y divide-slate-200 border-t border-slate-200">
              {SIX_PILLARS_CATALOG.map((cat) => {
                const match = auditResult.pillars.find((p) => p.id === cat.id);
                const included = Boolean(match?.included);
                return (
                  <div key={cat.id} className="py-3 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-slate-900">
                        {cat.index}. {cat.name}
                      </span>
                      <span
                        className={`text-xs font-mono whitespace-nowrap ${
                          included
                            ? "text-emerald-700 font-semibold"
                            : "text-amber-700"
                        }`}
                      >
                        {included ? "✅ Incluido" : "❌ Faltante"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">
                      {match?.feedback || cat.principle}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right 7 cols: Optimized Prompt & Live Simulator */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 space-y-6">
            <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-200">
              <div>
                <span className="text-xs text-emerald-700 font-mono font-semibold block">
                  ✅ VERSIÓN OPTIMIZADA (10/10)
                </span>
                <h2 className="font-display text-lg font-semibold text-slate-900">
                  Prompt Profesional Listo para Usar
                </h2>
              </div>

              <button
                type="button"
                onClick={handleCopyOptimized}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer whitespace-nowrap"
              >
                {copiedOptimized ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copiado</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Prompt</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-4 bg-emerald-50/20 border border-emerald-300 rounded-lg font-mono text-xs text-slate-900 whitespace-pre-wrap leading-relaxed">
              {auditResult.optimizedPrompt}
            </div>

            {auditResult.keyImprovements?.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-slate-900 mb-2.5">
                  Mejoras clave incorporadas (Antes vs. Después):
                </h3>
                <ul className="space-y-2">
                  {auditResult.keyImprovements.map((imp, index) => (
                    <li
                      key={index}
                      className="text-xs text-slate-700 flex items-start gap-2"
                    >
                      <span className="font-mono font-semibold text-sky-700 tabular-nums">
                        0{index + 1}.
                      </span>
                      <span>{imp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="pt-4 border-t border-slate-200 space-y-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <span className="text-xs font-semibold text-slate-800">
                  ¿Quieres ver la diferencia real en la respuesta de la IA?
                </span>
                <button
                  type="button"
                  onClick={handleSimulateBoth}
                  disabled={simulating}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-sky-800 bg-sky-50 border border-sky-200 rounded-lg hover:bg-sky-100 disabled:opacity-50 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>
                    {simulating
                      ? "Ejecutando ambos prompts..."
                      : "Ejecutar Ambos Prompts en Vivo"}
                  </span>
                </button>
              </div>

              {simResult && (
                <div className="space-y-4 pt-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
                      <div className="text-xs font-semibold text-slate-600 mb-2 pb-1.5 border-b border-slate-200">
                        Respuesta con tu Borrador (Antes)
                      </div>
                      <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                        {simResult.beforeOutput}
                      </p>
                    </div>
                    <div className="p-3.5 bg-sky-50/30 border border-sky-200 rounded-lg">
                      <div className="text-xs font-semibold text-sky-900 mb-2 pb-1.5 border-b border-sky-200">
                        Respuesta con el Prompt Profesional (Después)
                      </div>
                      <p className="text-xs text-slate-800 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                        {simResult.afterOutput}
                      </p>
                    </div>
                  </div>
                  <div className="p-3.5 bg-slate-900 text-slate-100 rounded-lg text-xs">
                    <span className="font-semibold text-sky-300 mr-1.5">
                      Análisis del Tutor:
                    </span>
                    {simResult.pedagogicalConclusion}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
