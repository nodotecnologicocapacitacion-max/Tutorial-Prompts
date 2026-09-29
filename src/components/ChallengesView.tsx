import React from "react";
import { ArrowRight, Check, Copy } from "lucide-react";
import {
  CLASSROOM_CHALLENGES,
  ClassroomChallenge,
  CompletedChallengeRecord,
} from "../data/pedagogyData";

interface ChallengesViewProps {
  completedHistory: CompletedChallengeRecord[];
  onSelectChallenge: (challenge: ClassroomChallenge) => void;
}

export const ChallengesView: React.FC<ChallengesViewProps> = ({
  completedHistory,
  onSelectChallenge,
}) => {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const handleCopyPrompt = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-10">
      {/* Practice Challenges Section */}
      <section className="space-y-5">
        <div className="border-b border-slate-200 pb-4">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <span>Casos Reales de Aula</span>
            <span aria-hidden="true">·</span>
            <span>Aprendizaje Basado en Proyectos</span>
          </div>
          <h1 className="font-display text-2xl font-semibold text-slate-900 mt-1">
            Retos Prácticos para Alumnos
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            Selecciona cualquiera de estos retos prácticos para cargarlo en el Tutor Interactivo y practicar la transformación de un prompt básico en un prompt profesional de 6 pilares.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {CLASSROOM_CHALLENGES.map((challenge, index) => (
            <article
              key={challenge.id}
              className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between space-y-5"
            >
              <div className="space-y-3">
                <div className="text-xs text-slate-500 flex items-center gap-1.5">
                  <span className="font-mono tabular-nums font-semibold text-slate-700">
                    Reto 0{index + 1}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{challenge.category}</span>
                  <span aria-hidden="true">·</span>
                  <span>{challenge.difficulty}</span>
                </div>

                <h2 className="font-display text-lg font-semibold text-slate-900">
                  {challenge.title}
                </h2>

                <p className="text-sm text-slate-600 leading-relaxed">
                  {challenge.taskDescription}
                </p>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                  <span className="text-xs font-semibold text-slate-700 block">
                    Punto de partida típico (Prompt inicial a mejorar):
                  </span>
                  <p className="font-mono text-xs text-slate-600 italic">
                    "{challenge.sampleBeginnerPrompt}"
                  </p>
                </div>

                <p className="text-xs text-slate-500">
                  <span className="font-semibold text-slate-700">
                    Foco pedagógico:{" "}
                  </span>
                  {challenge.learningFocus}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => onSelectChallenge(challenge)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <span>Practicar este Reto con el Tutor</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Student's Completed Challenges History */}
      <section className="space-y-4">
        <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-semibold text-slate-900">
              Portafolio de Prompts Optimizados en esta Sesión
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Registro de los ejercicios completados paso a paso con el Tutor Interactivo
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500 tabular-nums">
            {completedHistory.length} completados
          </span>
        </div>

        {completedHistory.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center space-y-2">
            <p className="text-sm font-medium text-slate-800">
              Aún no has finalizado ningún reto en esta sesión.
            </p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Completa los 5 pasos con el Tutor Guiado o elige uno de los retos superiores para guardar aquí tu comparativa "Antes vs. Después".
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {completedHistory.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-slate-200 rounded-xl p-6 space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200">
                  <div className="text-xs text-slate-500 flex items-center gap-2">
                    <span className="font-semibold text-slate-900">
                      Alumno: {item.studentName || "Estudiante"}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>Tarea: {item.task}</span>
                    <span aria-hidden="true">·</span>
                    <span>{item.completedAt}</span>
                  </div>
                  <div className="font-mono text-xs tabular-nums">
                    <span className="text-amber-700">
                      Inicial: {item.initialScore}/10
                    </span>
                    <span className="mx-2 text-slate-400">→</span>
                    <span className="text-emerald-700 font-semibold">
                      Final: {item.finalScore}/10
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
                    <span className="text-xs font-semibold text-slate-600 block mb-1.5">
                      Antes (Prompt Inicial):
                    </span>
                    <p className="font-mono text-xs text-slate-700 whitespace-pre-wrap">
                      {item.initialPrompt}
                    </p>
                  </div>
                  <div className="p-3.5 bg-emerald-50/20 border border-emerald-200 rounded-lg">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-emerald-900">
                        Después (Prompt Optimizado):
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          handleCopyPrompt(item.id, item.optimizedPrompt)
                        }
                        className="inline-flex items-center gap-1 text-xs font-medium text-sky-700 hover:text-sky-900 cursor-pointer"
                      >
                        {copiedId === item.id ? (
                          <>
                            <Check className="w-3 h-3" />
                            <span>Copiado</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copiar</span>
                          </>
                        )}
                      </button>
                    </div>
                    <p className="font-mono text-xs text-slate-900 whitespace-pre-wrap">
                      {item.optimizedPrompt}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
