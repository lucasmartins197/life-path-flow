import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Moon,
  Dumbbell,
  Utensils,
  Users,
  Sparkles,
  BookOpen,
  CheckCircle,
  Circle,
  ChevronLeft,
  AlertCircle,
  Plus,
  X,
  Coffee,
  Sun,
  Sunset,
  Star,
} from "lucide-react";
import { BottomNavigation } from "@/components/BottomNavigation";
import { PortoSeguroButton } from "@/components/PortoSeguroButton";
import { AIChatPanel } from "@/components/chat/AIChatPanel";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

// ── Types ─────────────────────────────────────
interface ChecklistItem {
  id: string;
  label: string;
  icon: React.ElementType;
  description: string;
}

interface Meal {
  id: string;
  label: string;
  icon: React.ElementType;
  time: string;
  fixed: true;
}

// ── Data ──────────────────────────────────────
const checklist: ChecklistItem[] = [
  { id: "sono",         label: "Sono adequado",      icon: Moon,      description: "Dormi 7–8h" },
  { id: "exercicio",    label: "Exercício físico",    icon: Dumbbell,  description: "Atividade realizada" },
  { id: "alimentacao",  label: "Alimentação",         icon: Utensils,  description: "Refeições equilibradas" },
  { id: "familia",      label: "Família / vínculos",  icon: Users,     description: "Tempo com pessoas queridas" },
  { id: "espiritualidade", label: "Espiritualidade",  icon: Sparkles,  description: "Meditação ou reflexão" },
  { id: "estudo",       label: "Estudo / leitura",    icon: BookOpen,  description: "Aprendizado do dia" },
];

const fixedMeals: Meal[] = [
  { id: "cafe",    label: "Café da manhã",  icon: Coffee, time: "07:00–09:00", fixed: true },
  { id: "almoco",  label: "Almoço",         icon: Sun,    time: "12:00–14:00", fixed: true },
  { id: "lanche",  label: "Café da tarde",  icon: Sunset, time: "15:00–17:00", fixed: true },
  { id: "jantar",  label: "Jantar",         icon: Moon,   time: "19:00–21:00", fixed: true },
];

// ── Component ─────────────────────────────────
export default function RoutineHome() {
  const navigate = useNavigate();
  const [showAIModal, setShowAIModal] = useState(false);
  const [modalConfirmed, setModalConfirmed] = useState(false);
  const [checkedItems, setCheckedItems] = useState<string[]>([]);
  const [humor, setHumor] = useState([5]);
  const [desejo, setDesejo] = useState([3]);
  const [customActivities, setCustomActivities] = useState<string[]>([]);
  const [newActivity, setNewActivity] = useState("");

  const today = new Date().toLocaleDateString("pt-BR", {
    weekday: "long", day: "numeric", month: "long",
  });

  // Show modal on first open of the day
  useEffect(() => {
    const lastSeen = localStorage.getItem("routine_modal_date");
    const todayKey = new Date().toDateString();
    if (lastSeen !== todayKey) {
      setShowAIModal(true);
    } else {
      setModalConfirmed(true);
    }
  }, []);

  const handleModalConfirm = () => {
    localStorage.setItem("routine_modal_date", new Date().toDateString());
    setShowAIModal(false);
    setModalConfirmed(true);
  };

  const toggle = (id: string) =>
    setCheckedItems((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const addActivity = () => {
    if (newActivity.trim()) {
      setCustomActivities((prev) => [...prev, newActivity.trim()]);
      setNewActivity("");
    }
  };

  const removeActivity = (idx: number) =>
    setCustomActivities((prev) => prev.filter((_, i) => i !== idx));

  const completedCount = checkedItems.length;
  const progressPct = Math.round((completedCount / checklist.length) * 100);

  return (
    <>
      {/* ── AI Modal ──────────────────────────────── */}
      <Dialog open={showAIModal} onOpenChange={() => {}}>
        <DialogContent
          className="max-w-sm mx-auto rounded-2xl p-0 overflow-hidden border-0"
          style={{ boxShadow: "var(--shadow-lg)" }}
        >
          <div className="bg-foreground text-background p-8 text-center">
            <DialogTitle className="sr-only">Aviso da IA</DialogTitle>
            <AlertCircle className="h-10 w-10 mx-auto mb-5 opacity-80" />
            <blockquote className="text-base font-medium leading-relaxed mb-2">
              "Se você mentir aqui, não estará mentindo para mim —{" "}
              <span className="underline underline-offset-4">estará mentindo para você mesmo.</span>"
            </blockquote>
            <p className="text-sm opacity-60 mb-8">Rotina diária · IA terapêutica</p>
            <button
              onClick={handleModalConfirm}
              className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors"
            >
              Entendo e quero continuar
            </button>
          </div>
        </DialogContent>
      </Dialog>

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
            <p className="text-xs text-muted-foreground capitalize mb-0.5">{today}</p>
            <h1 className="text-2xl font-bold text-foreground">Painel de Rotina</h1>
          </div>
        </header>

        <main className="max-w-lg mx-auto px-5 pt-6 space-y-8">

          {/* ── Progress ──────────────────────────── */}
          <section className="card-premium p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-semibold text-foreground text-sm">Progresso do dia</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {completedCount} de {checklist.length} itens
                </p>
              </div>
              <span className="text-2xl font-bold text-foreground">{progressPct}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progressPct}%` }} />
            </div>
          </section>

          {/* ── Escalas clínicas ──────────────────── */}
          <section>
            <p className="section-title">Avaliação de hoje</p>
            <div className="card-premium divide-y divide-border/50">
              {/* Humor */}
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-semibold text-sm text-foreground">Humor</p>
                    <p className="text-xs text-muted-foreground">Como você está hoje?</p>
                  </div>
                  <span className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center text-sm font-bold text-foreground">
                    {humor[0]}
                  </span>
                </div>
                <Slider
                  min={1} max={10} step={1}
                  value={humor}
                  onValueChange={setHumor}
                  className="[&_[role=slider]]:bg-primary [&_[role=slider]]:border-primary"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground mt-1.5">
                  <span>1 · Muito mal</span><span>10 · Excelente</span>
                </div>
              </div>
              {/* Desejo */}
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-semibold text-sm text-foreground">Desejo de apostar</p>
                    <p className="text-xs text-muted-foreground">Intensidade do impulso hoje</p>
                  </div>
                  <span className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold ${
                    desejo[0] <= 3 ? "bg-accent text-accent-foreground" :
                    desejo[0] <= 6 ? "bg-warning/15 text-warning" :
                    "bg-destructive/10 text-destructive"
                  }`}>
                    {desejo[0]}
                  </span>
                </div>
                <Slider
                  min={1} max={10} step={1}
                  value={desejo}
                  onValueChange={setDesejo}
                  className="[&_[role=slider]]:bg-destructive [&_[role=slider]]:border-destructive"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground mt-1.5">
                  <span>1 · Nenhum</span><span>10 · Muito forte</span>
                </div>
                {desejo[0] >= 7 && (
                  <p className="text-xs text-destructive mt-2 flex items-center gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    Impulso elevado. Considere acionar seu Porto Seguro.
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* ── Checklist diário ──────────────────── */}
          <section>
            <p className="section-title">Checklist dos 6 pilares</p>
            <div className="card-premium divide-y divide-border/50">
              {checklist.map((item) => {
                const checked = checkedItems.includes(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => toggle(item.id)}
                    className={`w-full flex items-center gap-4 px-4 py-4 text-left transition-colors hover:bg-secondary/30 ${
                      checked ? "bg-accent/30" : ""
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      checked ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                    }`}>
                      {checked
                        ? <CheckCircle className="h-5 w-5" />
                        : <item.icon className="h-5 w-5" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold ${checked ? "text-primary" : "text-foreground"}`}>
                        {item.label}
                      </p>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                    {checked
                      ? <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                      : <Circle className="h-4 w-4 text-border shrink-0" />
                    }
                  </button>
                );
              })}
            </div>
          </section>

          {/* ── Refeições (fixas, não editáveis) ──── */}
          <section>
            <p className="section-title">Refeições do dia</p>
            <div className="card-premium divide-y divide-border/50">
              {fixedMeals.map((meal) => (
                <div key={meal.id} className="flex items-center gap-4 px-4 py-4">
                  <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                    <meal.icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">{meal.label}</p>
                    <p className="text-xs text-muted-foreground">{meal.time}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium px-2 py-1 bg-secondary rounded-md">
                    Fixo
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* ── Atividades personalizadas ─────────── */}
          <section>
            <p className="section-title">Atividades personalizadas</p>
            <div className="card-premium">
              {customActivities.length > 0 && (
                <div className="divide-y divide-border/50 border-b border-border/50">
                  {customActivities.map((act, idx) => (
                    <div key={idx} className="flex items-center gap-3 px-4 py-3.5">
                      <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                      <span className="text-sm text-foreground flex-1">{act}</span>
                      <button
                        onClick={() => removeActivity(idx)}
                        className="text-muted-foreground hover:text-destructive transition-colors p-1"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-2 p-4">
                <input
                  value={newActivity}
                  onChange={(e) => setNewActivity(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addActivity()}
                  placeholder="Adicionar atividade..."
                  className="flex-1 text-sm bg-transparent outline-none placeholder:text-muted-foreground text-foreground"
                />
                <button
                  onClick={addActivity}
                  className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </section>

          {/* ── Save CTA ──────────────────────────── */}
          <section className="pb-4">
            <button className="btn-cta w-full py-4 text-base">
              <Star className="h-5 w-5" />
              Salvar rotina de hoje
            </button>
          </section>

        </main>

        <BottomNavigation />
        <PortoSeguroButton />
        <AIChatPanel />
      </div>
    </>
  );
}
