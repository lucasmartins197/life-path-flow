import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Compass,
  Stethoscope,
  Calendar,
  Scale,
  Wallet,
  ChevronRight,
  MessageCircle,
  CheckCircle2,
  Circle,
  ArrowRight,
} from "lucide-react";
import { BottomNavigation } from "@/components/BottomNavigation";
import { PortoSeguroButton } from "@/components/PortoSeguroButton";
import { AIChatPanel } from "@/components/chat/AIChatPanel";

// Simulated weekly data — will be replaced with real DB hook
const weekDays = ["S", "T", "Q", "Q", "S", "S", "D"];
const weekCompleted = [true, true, true, true, true, false, false]; // Mon-Sun

export default function AppHome() {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const today = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  // TODO: replace with real routine hook
  const routineFilledToday = false;
  const completedDays = weekCompleted.filter(Boolean).length;
  const consistencyPct = Math.round((completedDays / 7) * 100);

  return (
    <div className="min-h-screen bg-background safe-top pb-28">
      {/* ── Header ─────────────────────────────────── */}
      <header className="bg-card border-b border-border/60 px-5 pt-8 pb-6">
        <div className="max-w-lg mx-auto">
          {/* Logo + name */}
          <button
            onClick={() => navigate("/app")}
            className="flex items-center gap-2.5 mb-6 group"
          >
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground text-xs font-bold tracking-tight">AV</span>
            </div>
            <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
              Apostando na Vida
            </span>
          </button>

          <p className="text-xs text-muted-foreground capitalize mb-0.5">{today}</p>
          <h1 className="text-2xl font-bold text-foreground">
            Olá, {profile?.full_name?.split(" ")[0] || "bem-vindo"}
          </h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-5 pt-6 space-y-8">

        {/* ── Status do dia ───────────────────────── */}
        <section>
          <p className="section-title">Status do dia</p>
          <div className="card-premium p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {routineFilledToday ? (
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground shrink-0" />
              )}
              <div>
                <p className="font-semibold text-sm text-foreground">
                  {routineFilledToday ? "Rotina preenchida" : "Rotina de hoje: não preenchida"}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {routineFilledToday
                    ? "Ótimo trabalho. Continue assim."
                    : "Preencha agora para manter seu progresso."}
                </p>
              </div>
            </div>
            {!routineFilledToday && (
              <button
                onClick={() => navigate("/app/rotina")}
                className="shrink-0 ml-3 text-primary"
              >
                <ArrowRight className="h-5 w-5" />
              </button>
            )}
          </div>
        </section>

        {/* ── Consistência semanal ─────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <p className="section-title mb-0">Consistência semanal</p>
            <span className="text-xs font-semibold text-primary">{consistencyPct}%</span>
          </div>
          <div className="card-premium p-4">
            <div className="flex gap-2 mb-3">
              {weekDays.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] text-muted-foreground font-medium">{d}</span>
                  <div
                    className={`w-full aspect-square rounded-md flex items-center justify-center transition-colors ${
                      weekCompleted[i]
                        ? "bg-primary"
                        : i === new Date().getDay() - 1
                        ? "bg-secondary border-2 border-primary"
                        : "bg-secondary"
                    }`}
                  >
                    {weekCompleted[i] && (
                      <CheckCircle2 className="h-3 w-3 text-primary-foreground" />
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${consistencyPct}%` }} />
            </div>
          </div>
        </section>

        {/* ── CTAs fixos ──────────────────────────── */}
        <section className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate("/app/rotina")}
            className="btn-cta col-span-2 py-4 text-base"
          >
            <Calendar className="h-5 w-5" />
            Preencher Rotina
          </button>
          <button
            onClick={() => {/* AI chat opens via FAB */}}
            className="btn-secondary py-3 text-sm"
          >
            <MessageCircle className="h-4 w-4" />
            Falar com a IA
          </button>
          <button
            onClick={() => navigate("/app/jornada")}
            className="btn-secondary py-3 text-sm"
          >
            <Compass className="h-4 w-4" />
            Minha Jornada
          </button>
        </section>

        {/* ── Módulos principais ─── 3 grandes ────── */}
        <section className="space-y-3">
          <p className="section-title">Módulos principais</p>

          {/* Rotina — maior destaque */}
          <button
            onClick={() => navigate("/app/rotina")}
            className="w-full module-card module-card-routine text-left"
          >
            <div className="absolute inset-0 opacity-[0.04]" style={{
              backgroundImage: "repeating-linear-gradient(45deg, currentColor 0, currentColor 1px, transparent 0, transparent 50%)",
              backgroundSize: "18px 18px"
            }} />
            <div className="relative z-10 flex items-start justify-between mb-6">
              <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-white/50">
                Destaque
              </span>
            </div>
            <div className="relative z-10">
              <h2 className="text-2xl font-bold text-white mb-1">Rotina</h2>
              <p className="text-white/60 text-sm mb-4">Painel de controle do seu dia</p>
              <div className="flex items-center gap-2 text-white/80">
                <ChevronRight className="h-4 w-4" />
                <span className="text-sm font-medium">Abrir painel</span>
              </div>
            </div>
          </button>

          {/* Jornada + Terapia lado a lado */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate("/app/jornada")}
              className="module-card module-card-journey text-left"
              style={{ minHeight: 160 }}
            >
              <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center mb-auto">
                <Compass className="h-5 w-5 text-white" />
              </div>
              <div className="mt-6">
                <h3 className="text-base font-bold text-white mb-0.5">A Jornada</h3>
                <p className="text-white/55 text-xs">12 passos</p>
              </div>
            </button>

            <button
              onClick={() => navigate("/app/terapia")}
              className="module-card module-card-health text-left"
              style={{ minHeight: 160 }}
            >
              <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center mb-auto">
                <Stethoscope className="h-5 w-5 text-white" />
              </div>
              <div className="mt-6">
                <h3 className="text-base font-bold text-white mb-0.5">Terapia</h3>
                <p className="text-white/55 text-xs">Profissionais</p>
              </div>
            </button>
          </div>
        </section>

        {/* ── Cards menores ────────────────────────── */}
        <section className="space-y-3">
          <p className="section-title">Apoio especializado</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate("/app/juridico")}
              className="card-premium p-4 text-left flex flex-col gap-3 hover:scale-[1.01] active:scale-[0.99] transition-transform"
            >
              <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center">
                <Scale className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-sm">Apoio Jurídico</h3>
                <p className="text-muted-foreground text-xs mt-0.5">Advogados especializados</p>
              </div>
            </button>

            <button
              onClick={() => navigate("/app/financas")}
              className="card-premium p-4 text-left flex flex-col gap-3 hover:scale-[1.01] active:scale-[0.99] transition-transform"
            >
              <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center">
                <Wallet className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-sm">Controle de Caixa</h3>
                <p className="text-muted-foreground text-xs mt-0.5">Finanças pessoais</p>
              </div>
            </button>
          </div>
        </section>

      </main>

      <BottomNavigation />
      <PortoSeguroButton />
      <AIChatPanel />
    </div>
  );
}
