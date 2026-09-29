import React, { useState } from "react";
import { Check, Copy, ChevronDown, ChevronUp, ArrowUpRight } from "lucide-react";
import {
  PillarStatus,
  SIX_PILLARS_CATALOG,
} from "../data/pedagogyData";

interface RubricDeckProps {
  studentName: string;
  selectedTask: string;
  currentStage: number;
  score: number;
  scoreJustification: string;
  pillars: PillarStatus[];
  currentGuidedPillarId: string;
  initialPrompt: string;
  workingPrompt: string;
  onUsePillarHint: (hintText: string) => void;
}

export const RubricDeck: React.FC<RubricDeckProps> = ({
  studentName,
  selectedTask,
  currentStage,
  score,
  scoreJustification,
  pillars,
  currentGuidedPillarId,
  initialPrompt,
  workingPrompt,
  onUsePillarHint,
}) => {
  const [expandedPillarId, setExpandedPillarId] = useState<string | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  const includedCount = pillars.filter((p) => p.included).length;
  const hasDiagnosed = currentStage >= 3 && initialPrompt.trim().length > 0;

  const handleCopyWorkingPrompt = () => {
    if (!workingPrompt) return;
    navigator.clipboard.writeText(workingPrompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const togglePillar = (id: string) => {
    setExpandedPillarId((prev) => (prev === id ? null : id));
  };

  return (
    <aside
      aria-label="Panel de Diagnóstico y Rúbrica de los 6 Pilares"
      className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col"
    >
      {/* Top Section: Student Profile & Rubric Score */}
      <div className="p-6 border-b border-slate-200 bg-slate-50/60">
        <div className="flex items-center justify-between gap-4 mb-2">
          <div className="text-xs text-slate-500 flex items-center gap-1.5 flex-wrap">
            <span className="font-medium text-slate-700">
              {studentName ? `Alumno: ${studentName}` : "Alumno: En espera"}
            </span>
            <span aria-hidden="true">·</span>
            <span>
              {hasDiagnosed
                ? `${includedCount} de 6 pilares activos`
                : "Diagnóstico pendiente"}
            </span>
          </div>
          <div className="font-mono tabular-nums text-right shrink-0">
            <span className="text-xs text-slate-500 mr-1.5">Calificación:</span>
            <span
              className={`text-lg font-semibold ${
                !hasDiagnosed
                  ? "text-slate-400"
                  : score >= 8
                  ? "text-emerald-700"
                  : score >= 5
                  ? "text-sky-700"
                  : "text-amber-700"
              }`}
            >
              {hasDiagnosed ? `${score}/10` : "—/10"}
            </span>
          </div>
        </div>

        <h2 className="font-display text-lg font-semibold text-slate-900">
          Matriz de Evaluación: Los 6 Pilares
        </h2>

        {selectedTask && (
          <p className="mt-1 text-xs text-slate-600 line-clamp-2">
            Proyecto actual: <span className="font-medium text-slate-800">{selectedTask}</span>
          </p>
        )}

        {/* Score Visual Bar */}
        <div className="mt-4">
          <div
            className="w-full h-2 bg-slate-200 rounded-full overflow-hidden"
            role="progressbar"
            aria-valuenow={hasDiagnosed ? score : 0}
            aria-valuemin={0}
            aria-valuemax={10}
          >
            <div
              className={`h-full transition-transform duration-200 origin-left ${
                !hasDiagnosed
                  ? "bg-slate-300"
                  : score >= 8
                  ? "bg-emerald-600"
                  : score >= 5
                  ? "bg-sky-600"
                  : "bg-amber-600"
              }`}
              style={{
                transform: `scaleX(${hasDiagnosed ? Math.max(0.05, score / 10) : 0})`,
              }}
            />
          </div>

          <p className="mt-2.5 text-xs text-slate-600 leading-relaxed">
            {hasDiagnosed && scoreJustification
              ? scoreJustification
              : "Cuando escribas tu primer intento de prompt en la Etapa 2, aquí verás tu puntuación del 1 al 10 y qué pilares ya incluiste (✅) o cuáles mejoraremos paso a paso (❌)."}
          </p>
        </div>
      </div>

      {/* Live Working Prompt Blueprint (shown once student writes initial prompt) */}
      {workingPrompt && (
        <div className="p-5 border-b border-slate-200 bg-white">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-semibold text-slate-800">
              {currentStage === 5
                ? "Prompt Profesional Final"
                : "Evolución de tu Prompt en Vivo"}
            </span>
            <button
              type="button"
              onClick={handleCopyWorkingPrompt}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-sky-700 hover:text-sky-900 transition-colors cursor-pointer whitespace-nowrap"
            >
              {copiedPrompt ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Copiado</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar prompt</span>
                </>
              )}
            </button>
          </div>
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs text-slate-800 whitespace-pre-wrap leading-relaxed max-h-44 overflow-y-auto">
            {workingPrompt}
          </div>
        </div>
      )}

      {/* 6 Pillars Checklist List (Hairline Divided) */}
      <div className="divide-y divide-slate-200">
        {SIX_PILLARS_CATALOG.map((catalogItem) => {
          const status = pillars.find((p) => p.id === catalogItem.id);
          const isIncluded = Boolean(status?.included);
          const isGuidedFocus =
            currentStage === 4 && currentGuidedPillarId === catalogItem.id;
          const isExpanded =
            expandedPillarId === catalogItem.id || isGuidedFocus;

          return (
            <div
              key={catalogItem.id}
              className={`transition-colors ${
                isGuidedFocus ? "bg-sky-50/50" : "bg-white"
              }`}
            >
              <button
                type="button"
                onClick={() => togglePillar(catalogItem.id)}
                className="w-full text-left px-5 py-3.5 flex items-start justify-between gap-3 hover:bg-slate-50/80 transition-colors cursor-pointer"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-semibold text-slate-400 tabular-nums">
                      {catalogItem.index}.
                    </span>
                    <span className="text-sm font-semibold text-slate-900">
                      {catalogItem.name}
                    </span>
                  </div>

                  {/* Feedback preview */}
                  <p className="mt-1 text-xs text-slate-600 line-clamp-2">
                    {hasDiagnosed && status?.feedback
                      ? status.feedback
                      : catalogItem.principle}
                  </p>
                </div>

                {/* Explicit State Label (Never Hue Alone) */}
                <div className="flex items-center gap-2 shrink-0 pt-0.5">
                  {!hasDiagnosed ? (
                    <span className="text-xs font-mono text-slate-400 whitespace-nowrap">
                      ○ Por evaluar
                    </span>
                  ) : isIncluded ? (
                    <span className="text-xs font-mono font-medium text-emerald-700 whitespace-nowrap">
                      ✅ Incluido
                    </span>
                  ) : isGuidedFocus ? (
                    <span className="text-xs font-mono font-semibold text-sky-700 whitespace-nowrap">
                      ● En progreso
                    </span>
                  ) : (
                    <span className="text-xs font-mono font-medium text-amber-700 whitespace-nowrap">
                      ❌ Faltante
                    </span>
                  )}

                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </button>

              {/* Expanded Pedagogical Detail */}
              {isExpanded && (
                <div className="px-5 pb-4 pt-1 text-xs space-y-3 border-t border-slate-100 bg-slate-50/40">
                  {hasDiagnosed && status?.excerpt && (
                    <div className="p-2.5 bg-white border border-slate-200 rounded-md">
                      <span className="font-semibold text-slate-700 block mb-1">
                        {isIncluded
                          ? "Detectado en tu prompt:"
                          : "Sugerencia para este pilar:"}
                      </span>
                      <p className="font-mono text-slate-700 leading-relaxed">
                        {status.excerpt}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-2">
                    <div className="text-slate-600">
                      <span className="font-semibold text-slate-800">
                        Pregunta clave:{" "}
                      </span>
                      {catalogItem.guidingQuestion}
                    </div>
                    <div className="p-2.5 bg-white border border-slate-200 rounded-md space-y-1.5">
                      <div className="text-amber-800">
                        <span className="font-semibold">❌ Débil: </span>
                        <span className="italic">"{catalogItem.weakExample}"</span>
                      </div>
                      <div className="text-emerald-800">
                        <span className="font-semibold">✅ Profesional: </span>
                        <span>"{catalogItem.strongExample}"</span>
                      </div>
                    </div>
                  </div>

                  {currentStage >= 2 && currentStage <= 4 && (
                    <button
                      type="button"
                      onClick={() => onUsePillarHint(catalogItem.strongExample)}
                      className="inline-flex items-center gap-1 text-xs font-medium text-sky-700 hover:text-sky-900 transition-colors cursor-pointer"
                    >
                      <span>Usar como inspiración en mi respuesta</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
};
