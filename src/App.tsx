import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import {
  DEFAULT_INITIAL_PILLARS,
  INITIAL_WELCOME_MESSAGE,
  PillarStatus,
  ClassroomChallenge,
  CompletedChallengeRecord,
  SIX_PILLARS_CATALOG,
} from "./data/pedagogyData";
import { RubricDeck } from "./components/RubricDeck";
import { BeforeAfterReveal } from "./components/BeforeAfterReveal";
import { PillarReferenceView } from "./components/PillarReferenceView";
import { LiveAuditorView } from "./components/LiveAuditorView";
import { ChallengesView } from "./components/ChallengesView";
import { InstitutionalHeader } from "./components/InstitutionalHeader";

interface ChatMessage {
  id: string;
  role: "tutor" | "user";
  content: string;
  stageAtMessage?: number;
  diagnosticSnapshot?: {
    score: number;
    justification: string;
    pillars: PillarStatus[];
  };
}

type ActiveTab = "tutor" | "pilares" | "comparador" | "retos";

const STAGE_STEPS = [
  { num: 1, title: "01. Bienvenida y Meta" },
  { num: 2, title: "02. Prompt Inicial" },
  { num: 3, title: "03. Diagnóstico (1-10)" },
  { num: 4, title: "04. Mejora Guiada" },
  { num: 5, title: "05. Antes vs. Después" },
];

const QUICK_TASKS = [
  "Crear un plan de estudio personalizado",
  "Escribir un post educativo para redes sociales",
  "Resumir y explicar un texto complejo",
  "Generar ideas para un proyecto escolar",
];

function renderFormattedText(text: string) {
  const paragraphs = text.split("\n\n");
  return paragraphs.map((para, pIdx) => {
    const lines = para.split("\n");
    return (
      <p key={pIdx} className={pIdx > 0 ? "mt-2.5" : ""}>
        {lines.map((line, lIdx) => {
          const parts = line.split(/(\*\*.*?\*\*)/g);
          return (
            <React.Fragment key={lIdx}>
              {lIdx > 0 && <br />}
              {parts.map((part, partIdx) => {
                if (part.startsWith("**") && part.endsWith("**")) {
                  return (
                    <strong key={partIdx} className="font-semibold text-slate-900">
                      {part.slice(2, -2)}
                    </strong>
                  );
                }
                return <span key={partIdx}>{part}</span>;
              })}
            </React.Fragment>
          );
        })}
      </p>
    );
  });
}

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("tutor");

  // Pedagogical State
  const [studentName, setStudentName] = useState<string>("");
  const [quickNameInput, setQuickNameInput] = useState<string>("");
  const [quickTaskInput, setQuickTaskInput] = useState<string>("");

  const [selectedTask, setSelectedTask] = useState<string>("");
  const [currentStage, setCurrentStage] = useState<number>(1);
  const [initialPrompt, setInitialPrompt] = useState<string>("");
  const [initialScoreRecord, setInitialScoreRecord] = useState<number>(0);
  const [workingPrompt, setWorkingPrompt] = useState<string>("");
  const [score, setScore] = useState<number>(0);
  const [scoreJustification, setScoreJustification] = useState<string>("");
  const [pillars, setPillars] = useState<PillarStatus[]>(DEFAULT_INITIAL_PILLARS);
  const [currentGuidedPillarId, setCurrentGuidedPillarId] =
    useState<string>("rol");
  const [guidedQuestionSummary, setGuidedQuestionSummary] =
    useState<string>("");
  const [suggestedQuickReplies, setSuggestedQuickReplies] = useState<string[]>(
    []
  );
  const [comparisonAnalysis, setComparisonAnalysis] = useState<{
    optimizedPrompt: string;
    keyImprovements: string[];
  }>({
    optimizedPrompt: "",
    keyImprovements: [],
  });

  // Conversation State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-1",
      role: "tutor",
      content: INITIAL_WELCOME_MESSAGE,
      stageAtMessage: 1,
    },
  ]);
  const [inputMessage, setInputMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  // Completed Challenges History (persisted in localStorage)
  const [completedHistory, setCompletedHistory] = useState<
    CompletedChallengeRecord[]
  >(() => {
    try {
      const saved = localStorage.getItem("aulaprompt_history_v1");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(
        "aulaprompt_history_v1",
        JSON.stringify(completedHistory)
      );
    } catch {
      // ignore storage errors
    }
  }, [completedHistory]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleResetSession = () => {
    setStudentName("");
    setQuickNameInput("");
    setQuickTaskInput("");
    setSelectedTask("");
    setCurrentStage(1);
    setInitialPrompt("");
    setInitialScoreRecord(0);
    setWorkingPrompt("");
    setScore(0);
    setScoreJustification("");
    setPillars(DEFAULT_INITIAL_PILLARS);
    setCurrentGuidedPillarId("rol");
    setGuidedQuestionSummary("");
    setSuggestedQuickReplies([]);
    setComparisonAnalysis({ optimizedPrompt: "", keyImprovements: [] });
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: "tutor",
        content: INITIAL_WELCOME_MESSAGE,
        stageAtMessage: 1,
      },
    ]);
    setInputMessage("");
    setErrorBanner(null);
    setActiveTab("tutor");
  };

  const sendMessageToTutor = async (
    textToSend: string,
    forceFinalize = false
  ) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmed,
      stageAtMessage: currentStage,
    };

    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);
    setInputMessage("");
    setIsLoading(true);
    setErrorBanner(null);

    const wasStage2 = currentStage === 2;

    try {
      const response = await fetch("/api/tutor/turn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName,
          selectedTask,
          currentStage,
          initialPrompt,
          workingPrompt,
          pillars,
          messages: updatedHistory.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          userMessage: trimmed,
          forceFinalize,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          data.error || "Error al comunicarse con el Tutor Interactivo."
        );
      }

      if (data.studentName) setStudentName(data.studentName);
      if (data.selectedTask) setSelectedTask(data.selectedTask);

      const resolvedInitialPrompt =
        data.initialPrompt || (wasStage2 ? trimmed : initialPrompt);
      if (resolvedInitialPrompt) {
        setInitialPrompt(resolvedInitialPrompt);
      }

      if (data.updatedWorkingPrompt) {
        setWorkingPrompt(data.updatedWorkingPrompt);
      }

      const newScore = typeof data.score === "number" ? data.score : score;
      setScore(newScore);

      if (wasStage2 && newScore > 0) {
        setInitialScoreRecord(newScore);
      }

      if (data.scoreJustification) {
        setScoreJustification(data.scoreJustification);
      }

      let normalizedPillars = pillars;
      if (Array.isArray(data.pillars) && data.pillars.length > 0) {
        normalizedPillars = SIX_PILLARS_CATALOG.map((cat) => {
          const found = data.pillars.find((p: any) => p.id === cat.id);
          return {
            id: cat.id,
            name: cat.name,
            included: Boolean(found?.included),
            feedback: found?.feedback || "",
            excerpt: found?.excerpt || "",
          };
        });
        setPillars(normalizedPillars);
      }

      if (data.currentGuidedPillarId) {
        setCurrentGuidedPillarId(data.currentGuidedPillarId);
      }
      setGuidedQuestionSummary(data.guidedQuestionSummary || "");
      setSuggestedQuickReplies(
        Array.isArray(data.suggestedQuickReplies)
          ? data.suggestedQuickReplies
          : []
      );

      const nextStageNum =
        typeof data.nextStage === "number" ? data.nextStage : currentStage;
      setCurrentStage(nextStageNum);

      if (data.comparisonAnalysis) {
        setComparisonAnalysis({
          optimizedPrompt:
            data.comparisonAnalysis.optimizedPrompt ||
            data.updatedWorkingPrompt ||
            workingPrompt,
          keyImprovements: Array.isArray(
            data.comparisonAnalysis.keyImprovements
          )
            ? data.comparisonAnalysis.keyImprovements
            : [],
        });
      }

      const tutorMsg: ChatMessage = {
        id: `tutor-${Date.now()}`,
        role: "tutor",
        content: data.tutorReply,
        stageAtMessage: nextStageNum,
        // Attach the visual rubric card right inside the conversation when Stage 2 diagnostic finishes!
        diagnosticSnapshot: wasStage2
          ? {
              score: newScore,
              justification: data.scoreJustification || "",
              pillars: normalizedPillars,
            }
          : undefined,
      };

      setMessages((prev) => [...prev, tutorMsg]);

      // Record in portfolio history when Stage 5 is reached
      if (nextStageNum === 5) {
        const finalOpt =
          data.comparisonAnalysis?.optimizedPrompt ||
          data.updatedWorkingPrompt ||
          workingPrompt;
        if (finalOpt && resolvedInitialPrompt) {
          const newRecord: CompletedChallengeRecord = {
            id: `rec-${Date.now()}`,
            studentName: data.studentName || studentName || "Alumno",
            task: data.selectedTask || selectedTask || "Proyecto con IA",
            initialPrompt: resolvedInitialPrompt,
            optimizedPrompt: finalOpt,
            initialScore: initialScoreRecord || 3,
            finalScore: newScore || 10,
            completedAt: new Date().toLocaleTimeString("es-ES", {
              hour: "2-digit",
              minute: "2-digit",
            }),
          };
          setCompletedHistory((prev) => [newRecord, ...prev]);
        }
      }
    } catch (err: any) {
      setErrorBanner(
        err?.message ||
          "Hubo un inconveniente al procesar tu mensaje. Por favor, intenta enviarlo nuevamente."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleStage1QuickStart = (e: React.FormEvent) => {
    e.preventDefault();
    const namePart = quickNameInput.trim() || "Alumno";
    const taskPart =
      quickTaskInput.trim() || "Crear un plan de estudio personalizado";
    setStudentName(namePart);
    setSelectedTask(taskPart);
    sendMessageToTutor(
      `Hola, mi nombre es ${namePart} y hoy me gustaría resolver esta tarea con IA: ${taskPart}.`
    );
  };

  const handleLoadChallenge = (challenge: ClassroomChallenge) => {
    const activeName = studentName || "Estudiante";
    setStudentName(activeName);
    setSelectedTask(challenge.taskDescription);
    setCurrentStage(2);
    setInitialPrompt("");
    setWorkingPrompt("");
    setScore(0);
    setScoreJustification("");
    setPillars(DEFAULT_INITIAL_PILLARS);
    setSuggestedQuickReplies([challenge.sampleBeginnerPrompt]);
    setMessages([
      {
        id: `welcome-challenge-${Date.now()}`,
        role: "tutor",
        content: `¡Excelente elección, **${activeName}**! Vamos a trabajar en el reto: **${challenge.title}** (${challenge.taskDescription}).\n\n**Paso 2 — Diagnóstico de tu Prompt Inicial:**\nEscribe a continuación tu primer prompt para resolver esta tarea tal como se te ocurra, o haz clic en el ejemplo de principiante sugerido debajo para que lo analicemos juntos con los 6 Pilares.`,
        stageAtMessage: 2,
      },
    ]);
    setInputMessage(challenge.sampleBeginnerPrompt);
    setActiveTab("tutor");
  };

  const handleUsePillarHint = (hintText: string) => {
    setInputMessage((prev) =>
      prev ? `${prev.trim()} ${hintText}` : hintText
    );
    inputTextareaRef.current?.focus();
  };

  const activeGuidedPillarCatalog = SIX_PILLARS_CATALOG.find(
    (p) => p.id === currentGuidedPillarId
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Encabezado Institucional en todas las páginas */}
      <InstitutionalHeader />

      {/* Mandatory 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 px-6 py-3.5 flex items-center justify-between gap-4">
        {/* Zone 1: Brand Title (Single text element wordmark) */}
        <a
          href="#tutor"
          onClick={(e) => {
            e.preventDefault();
            setActiveTab("tutor");
          }}
          className="font-display text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
        >
          AulaPrompt
        </a>

        {/* Zone 2: 4 Clean Text Navigation Links */}
        <nav
          aria-label="Navegación Principal"
          className="flex items-center gap-5 sm:gap-7 text-xs sm:text-sm font-medium text-slate-600 overflow-x-auto"
        >
          <button
            type="button"
            onClick={() => setActiveTab("tutor")}
            className={`py-1 whitespace-nowrap shrink-0 transition-colors cursor-pointer border-b-2 ${
              activeTab === "tutor"
                ? "text-slate-900 border-sky-600 font-semibold"
                : "border-transparent hover:text-slate-900"
            }`}
          >
            Tutor Guiado
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("pilares")}
            className={`py-1 whitespace-nowrap shrink-0 transition-colors cursor-pointer border-b-2 ${
              activeTab === "pilares"
                ? "text-slate-900 border-sky-600 font-semibold"
                : "border-transparent hover:text-slate-900"
            }`}
          >
            Guía de 6 Pilares
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("comparador")}
            className={`py-1 whitespace-nowrap shrink-0 transition-colors cursor-pointer border-b-2 ${
              activeTab === "comparador"
                ? "text-slate-900 border-sky-600 font-semibold"
                : "border-transparent hover:text-slate-900"
            }`}
          >
            Comparador en Vivo
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("retos")}
            className={`py-1 whitespace-nowrap shrink-0 transition-colors cursor-pointer border-b-2 ${
              activeTab === "retos"
                ? "text-slate-900 border-sky-600 font-semibold"
                : "border-transparent hover:text-slate-900"
            }`}
          >
            Retos Prácticos
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleResetSession}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-800 bg-slate-100 border border-slate-200 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Nuevo Alumno</span>
          </button>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 w-full max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === "pilares" && (
          <PillarReferenceView onReturnToTutor={() => setActiveTab("tutor")} />
        )}

        {activeTab === "comparador" && <LiveAuditorView />}

        {activeTab === "retos" && (
          <ChallengesView
            completedHistory={completedHistory}
            onSelectChallenge={handleLoadChallenge}
          />
        )}

        {activeTab === "tutor" && (
          <div className="space-y-6">
            {/* Progressive 5-Stage Learning Stepper */}
            <section
              aria-label="Progreso Pedagógico en 5 Etapas"
              className="bg-white border border-slate-200 rounded-xl px-5 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
            >
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="font-semibold text-slate-900">
                  Secuencia Pedagógica
                </span>
                <span aria-hidden="true">·</span>
                <span>
                  {currentStage === 1 && "Paso 1: Bienvenida y elección de tarea"}
                  {currentStage === 2 && "Paso 2: Escribe tu primer intento de prompt"}
                  {(currentStage === 3 || currentStage === 4) &&
                    "Pasos 3 y 4: Diagnóstico formativo y mejora guiada paso a paso"}
                  {currentStage === 5 &&
                    "Paso 5: Revelación final Antes vs. Después"}
                </span>
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
                {STAGE_STEPS.map((step, idx) => {
                  const isCompleted =
                    currentStage > step.num ||
                    (currentStage === 4 && step.num === 3);
                  const isActive =
                    currentStage === step.num ||
                    (currentStage === 4 && step.num === 3);

                  return (
                    <React.Fragment key={step.num}>
                      <div
                        className={`px-2.5 py-1 rounded-md text-xs font-mono whitespace-nowrap transition-colors ${
                          isActive
                            ? "bg-sky-600 text-white font-semibold"
                            : isCompleted
                            ? "bg-emerald-50 text-emerald-800 font-medium"
                            : "text-slate-400"
                        }`}
                      >
                        {isCompleted && !isActive ? `✓ ${step.title}` : step.title}
                      </div>
                      {idx < STAGE_STEPS.length - 1 && (
                        <span className="text-slate-300 text-xs" aria-hidden="true">
                          /
                        </span>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </section>

            {/* Two-Zone Sandbox Layout: Left Interactive Stage (7 cols) + Right Rubric Deck (5 cols) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* LEFT ZONE: Interactive Tutor Stage */}
              <div className="lg:col-span-7 space-y-6">
                <section
                  aria-label="Diálogo con el Tutor Interactivo"
                  className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col"
                >
                  {/* Stage Header */}
                  <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-xs text-slate-500 flex items-center gap-1.5">
                        <span>Tutor Interactivo de IA</span>
                        <span aria-hidden="true">·</span>
                        <span>Ingeniería de Prompts Estructurada</span>
                      </div>
                      <h1 className="font-display text-lg font-semibold text-slate-900">
                        {studentName
                          ? `Sesión de Práctica con ${studentName}`
                          : "Laboratorio de Redacción de Prompts"}
                      </h1>
                    </div>

                    {currentStage === 4 && initialPrompt && (
                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={() =>
                          sendMessageToTutor(
                            "Por favor, integra todo lo trabajado hasta ahora y muéstrame mi Prompt Optimizado Final con la comparativa Antes vs. Después.",
                            true
                          )
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-sky-800 bg-sky-50 border border-sky-200 rounded-lg hover:bg-sky-100 disabled:opacity-50 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Ver Resultado Final Ahora</span>
                      </button>
                    )}
                  </div>

                  {/* Conversation Stream */}
                  <div className="p-6 space-y-5 max-h-[540px] overflow-y-auto">
                    {messages.map((msg) => (
                      <div key={msg.id} className="space-y-3">
                        <div
                          className={`flex flex-col ${
                            msg.role === "user" ? "items-end" : "items-start"
                          }`}
                        >
                          <div className="text-xs text-slate-400 mb-1 px-1">
                            {msg.role === "user"
                              ? studentName || "Alumno"
                              : "Tutor de Ingeniería de Prompts"}
                          </div>
                          <div
                            className={`max-w-[92%] sm:max-w-[85%] rounded-xl px-5 py-4 text-sm leading-relaxed ${
                              msg.role === "user"
                                ? "bg-slate-900 text-white"
                                : "bg-slate-50 border border-slate-200 text-slate-800"
                            }`}
                          >
                            {msg.role === "user" ? (
                              <p className="whitespace-pre-wrap">{msg.content}</p>
                            ) : (
                              renderFormattedText(msg.content)
                            )}
                          </div>
                        </div>

                        {/* Inline Visual Diagnostic Card when Stage 2 prompt is evaluated */}
                        {msg.diagnosticSnapshot && (
                          <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 space-y-3">
                            <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-200">
                              <span className="text-xs font-semibold text-slate-900">
                                Diagnóstico Visual de tu Primer Prompt
                              </span>
                              <span className="font-mono text-sm font-semibold text-sky-700 tabular-nums">
                                Calificación Inicial: {msg.diagnosticSnapshot.score}/10
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {msg.diagnosticSnapshot.pillars.map((pil) => (
                                <div
                                  key={pil.id}
                                  className="px-3 py-2 rounded-lg border border-slate-200 bg-slate-50/70 flex items-center justify-between gap-2 text-xs"
                                >
                                  <span className="font-medium text-slate-800 truncate">
                                    {pil.name}
                                  </span>
                                  <span
                                    className={`font-mono whitespace-nowrap shrink-0 ${
                                      pil.included
                                        ? "text-emerald-700 font-semibold"
                                        : "text-amber-700"
                                    }`}
                                  >
                                    {pil.included ? "✅ Incluido" : "❌ Faltante"}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Stage 1 Interactive Quick-Start Helper */}
                    {currentStage === 1 && messages.length === 1 && !isLoading && (
                      <form
                        onSubmit={handleStage1QuickStart}
                        className="p-5 bg-sky-50/40 border border-sky-200/80 rounded-xl space-y-4"
                      >
                        <div className="text-xs font-semibold text-slate-900">
                          Inicio Rápido para el Alumno (Opcional: completa aquí o escribe directamente abajo)
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label
                              htmlFor="quick-student-name"
                              className="block text-xs font-medium text-slate-700 mb-1"
                            >
                              1. Tu nombre
                            </label>
                            <input
                              id="quick-student-name"
                              type="text"
                              value={quickNameInput}
                              onChange={(e) => setQuickNameInput(e.target.value)}
                              placeholder="Ej. Ana, Mateo, Lucía..."
                              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-600"
                            />
                          </div>

                          <div>
                            <label
                              htmlFor="quick-student-task"
                              className="block text-xs font-medium text-slate-700 mb-1"
                            >
                              2. ¿Qué tarea quieres resolver hoy con IA?
                            </label>
                            <input
                              id="quick-student-task"
                              type="text"
                              value={quickTaskInput}
                              onChange={(e) => setQuickTaskInput(e.target.value)}
                              placeholder="Ej. Crear un plan de estudio..."
                              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-600"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <span className="text-xs text-slate-500 block">
                            O elige una tarea frecuente de práctica:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {QUICK_TASKS.map((t) => (
                              <button
                                key={t}
                                type="button"
                                onClick={() => setQuickTaskInput(t)}
                                className={`px-2.5 py-1 text-xs rounded-md border transition-colors cursor-pointer ${
                                  quickTaskInput === t
                                    ? "bg-sky-600 text-white border-sky-600 font-medium"
                                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                                }`}
                              >
                                {t}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <button
                            type="submit"
                            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-sky-600 rounded-lg hover:bg-sky-700 transition-colors cursor-pointer whitespace-nowrap"
                          >
                            <span>Presentarme e Iniciar Paso 2</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </form>
                    )}

                    {isLoading && (
                      <div className="flex items-center gap-2.5 text-xs text-slate-500 px-2 py-2">
                        <div className="w-2 h-2 rounded-full bg-sky-600 animate-ping" />
                        <span>
                          El Tutor está analizando tu respuesta y actualizando la matriz de los 6 pilares...
                        </span>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>

                  {/* Active Guided Pillar Callout Banner (Stage 4) */}
                  {currentStage === 4 && activeGuidedPillarCatalog && !isLoading && (
                    <div className="px-6 py-3 bg-sky-50/70 border-t border-sky-200/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="text-xs text-slate-800">
                        <span className="font-mono font-semibold text-sky-800 mr-1.5">
                          ● Paso Guiado Actual ({activeGuidedPillarCatalog.index}. {activeGuidedPillarCatalog.shortName}):
                        </span>
                        <span>
                          {guidedQuestionSummary ||
                            activeGuidedPillarCatalog.guidingQuestion}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Quick Suggestions / Reply Chips (Stages 2 and 4) */}
                  {suggestedQuickReplies.length > 0 &&
                    currentStage < 5 &&
                    !isLoading && (
                      <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 space-y-1.5">
                        <span className="text-xs font-medium text-slate-600 block">
                          {currentStage === 2
                            ? "Ejemplos de primer intento (haz clic para usar o escribe el tuyo):"
                            : "Ideas rápidas para responder este paso (haz clic para usar o adaptar):"}
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {suggestedQuickReplies.map((suggestion, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setInputMessage(suggestion)}
                              className="text-left px-3 py-1.5 text-xs text-slate-700 bg-white border border-slate-200 rounded-lg hover:border-sky-400 hover:text-slate-900 transition-colors cursor-pointer"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Error Banner */}
                  {errorBanner && (
                    <div className="px-6 py-3 bg-red-50 border-t border-red-200 text-xs text-red-700">
                      {errorBanner}
                    </div>
                  )}

                  {/* Input Form */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      sendMessageToTutor(inputMessage, false);
                    }}
                    className="p-4 bg-white border-t border-slate-200 flex flex-col gap-3"
                  >
                    <textarea
                      ref={inputTextareaRef}
                      rows={3}
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          sendMessageToTutor(inputMessage, false);
                        }
                      }}
                      placeholder={
                        currentStage === 1
                          ? "Escribe tu nombre y qué tarea te gustaría resolver hoy con IA..."
                          : currentStage === 2
                          ? "Escribe aquí tu primer prompt tal como se te ocurra..."
                          : currentStage === 4
                          ? "Responde a la pregunta del tutor para mejorar tu prompt..."
                          : "Escribe cualquier duda adicional o prueba una variante..."
                      }
                      disabled={isLoading}
                      className="w-full p-3 text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-600 transition-colors resize-none"
                    />

                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs text-slate-400">
                        Presiona Enter para enviar · Shift + Enter para salto de línea
                      </span>

                      <button
                        type="submit"
                        disabled={!inputMessage.trim() || isLoading}
                        className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-sky-600 rounded-lg hover:bg-sky-700 disabled:opacity-50 transition-colors cursor-pointer whitespace-nowrap"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>
                          {currentStage === 2
                            ? "Evaluar mi Primer Prompt"
                            : "Enviar Respuesta al Tutor"}
                        </span>
                      </button>
                    </div>
                  </form>
                </section>

                {/* Stage 5: Final Reveal & Before vs After Comparison */}
                {currentStage === 5 && (
                  <BeforeAfterReveal
                    studentName={studentName}
                    selectedTask={selectedTask}
                    initialPrompt={initialPrompt}
                    optimizedPrompt={
                      comparisonAnalysis.optimizedPrompt || workingPrompt
                    }
                    keyImprovements={comparisonAnalysis.keyImprovements}
                    onStartNewChallenge={handleResetSession}
                    onExploreChallenges={() => setActiveTab("retos")}
                  />
                )}
              </div>

              {/* RIGHT ZONE: Control & Concept Deck (Rubric & Live Prompt Blueprint) */}
              <div className="lg:col-span-5 lg:sticky lg:top-20">
                <RubricDeck
                  studentName={studentName}
                  selectedTask={selectedTask}
                  currentStage={currentStage}
                  score={score}
                  scoreJustification={scoreJustification}
                  pillars={pillars}
                  currentGuidedPillarId={currentGuidedPillarId}
                  initialPrompt={initialPrompt}
                  workingPrompt={workingPrompt}
                  onUsePillarHint={handleUsePillarHint}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Quiet Pedagogical Footer */}
      <footer className="mt-12 border-t border-slate-200 bg-white px-6 py-5">
        <div className="max-w-[1380px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-sky-600" />
            <span className="font-medium text-slate-700">
              AulaPrompt — Metodología de los 6 Pilares para Ingeniería de Prompts
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setActiveTab("pilares")}
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              Consultar los 6 Pilares
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => setActiveTab("comparador")}
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              Auditor Rápido
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => setActiveTab("retos")}
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              Retos de Aula
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
