import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  ChevronLeft,
  CheckCircle2,
  Lock,
  Play,
  Trophy,
  Clock,
} from "lucide-react";
import { BottomNavigation } from "@/components/BottomNavigation";
import { PortoSeguroButton } from "@/components/PortoSeguroButton";
import { AIChatPanel } from "@/components/chat/AIChatPanel";

interface JourneyStep {
  id: string;
  step_number: number;
  title: string;
  description: string;
  duration_minutes: number;
}
interface TrailProgress {
  step_id: string;
  is_completed: boolean;
}

export default function JourneysHome() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [steps, setSteps] = useState<JourneyStep[]>([]);
  const [progress, setProgress] = useState<TrailProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: s }, { data: p }] = await Promise.all([
        supabase.from("journey_steps").select("*").eq("is_published", true).order("step_number"),
        supabase.from("trail_progress").select("step_id, is_completed").eq("user_id", user.id),
      ]);
      if (s) setSteps(s);
      if (p) setProgress(p);
      setIsLoading(false);
    })();
  }, [user]);

  const getStatus = (step: JourneyStep) => {
    if (progress.find((p) => p.step_id === step.id && p.is_completed)) return "completed";
    const prev = steps.filter((s) => s.step_number < step.step_number);
    const allDone = prev.every((ps) => progress.some((p) => p.step_id === ps.id && p.is_completed));
    return allDone || step.step_number === 1 ? "available" : "locked";
  };

  const completedCount = progress.filter((p) => p.is_completed).length;
  const pct = steps.length > 0 ? Math.round((completedCount / steps.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-background safe-top pb-28">

      {/* ── Header ──────────────────────────────── */}
      <header className="bg-card border-b border-border/60 px-5 pt-8 pb-5">
        <div className="max-w-lg mx-auto">
          <button
            onClick={() => navigate("/app")}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors mb-5 text-sm"
          >
            <ChevronLeft className="h-4 w-4" />
            Home
          </button>
          <h1 className="text-2xl font-bold text-foreground">A Jornada</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Trilha de 12 passos</p>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-5 pt-6 space-y-6">

        {/* ── Progress card ─────────────────────── */}
        <div className="card-premium p-5">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center shrink-0">
              <Trophy className="h-6 w-6 text-foreground" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground">{completedCount} / {steps.length || 12} passos concluídos</p>
              <p className="text-xs text-muted-foreground mt-0.5">Trilha dos 12 Passos</p>
            </div>
            <span className="text-2xl font-bold text-foreground">{pct}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>

        {/* ── Steps list ────────────────────────── */}
        <section>
          <p className="section-title">Seus passos</p>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-20 rounded-2xl" />)}
            </div>
          ) : steps.length === 0 ? (
            <div className="card-premium p-10 text-center">
              <p className="text-muted-foreground text-sm">
                Nenhum passo disponível. O administrador ainda não publicou o conteúdo.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {steps.map((step) => {
                const status = getStatus(step);
                const isLocked = status === "locked";
                const isDone = status === "completed";
                return (
                  <button
                    key={step.id}
                    disabled={isLocked}
                    onClick={() => !isLocked && navigate(`/app/jornada/${step.step_number}`)}
                    className={`w-full card-premium p-4 flex items-center gap-4 text-left transition-all ${
                      isLocked ? "opacity-50 cursor-not-allowed" : "hover:scale-[1.01] active:scale-[0.99]"
                    }`}
                  >
                    {/* Step indicator */}
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                      isDone
                        ? "bg-primary text-primary-foreground"
                        : isLocked
                        ? "bg-secondary text-muted-foreground"
                        : "bg-secondary text-foreground"
                    }`}>
                      {isDone
                        ? <CheckCircle2 className="h-5 w-5" />
                        : isLocked
                        ? <Lock className="h-4 w-4" />
                        : <span className="text-sm font-bold">{step.step_number}</span>
                      }
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                          Passo {step.step_number}
                        </span>
                        {status === "available" && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-accent text-accent-foreground uppercase tracking-wide">
                            Disponível
                          </span>
                        )}
                        {isDone && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary uppercase tracking-wide">
                            Concluído
                          </span>
                        )}
                      </div>
                      <p className="font-semibold text-foreground text-sm truncate">{step.title}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{step.duration_minutes} min</span>
                      </div>
                    </div>

                    {!isLocked && (
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isDone ? "bg-primary/10 text-primary" : "bg-secondary text-foreground"
                      }`}>
                        <Play className="h-4 w-4" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </section>

      </main>

      <BottomNavigation />
      <PortoSeguroButton />
      <AIChatPanel />
    </div>
  );
}
