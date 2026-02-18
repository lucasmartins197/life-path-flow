import { useNavigate } from "react-router-dom";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  ChevronRight,
  Lightbulb,
} from "lucide-react";
import { useRecoveryIndex } from "@/hooks/useRecoveryIndex";

// ── Pillar bar ───────────────────────────────────
function PillarBar({
  name,
  score,
  max,
  trend,
}: {
  name: string;
  score: number;
  max: number;
  trend: "up" | "stable" | "down";
}) {
  const pct = Math.round((score / max) * 100);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground font-medium">{name}</span>
        <div className="flex items-center gap-1.5">
          {trend === "up" && <TrendingUp className="h-3 w-3 text-primary" />}
          {trend === "down" && <TrendingDown className="h-3 w-3 text-destructive" />}
          {trend === "stable" && <Minus className="h-3 w-3 text-muted-foreground" />}
          <span className="font-semibold text-foreground">
            {score}
            <span className="font-normal text-muted-foreground">/{max}</span>
          </span>
        </div>
      </div>
      <div className="progress-bar">
        <div
          className="progress-fill transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ── Score ring (SVG) ─────────────────────────────
function ScoreRing({ value, size = 88 }: { value: number; size?: number }) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const fill = (value / 100) * circ;
  const color =
    value >= 70 ? "hsl(var(--primary))" : value >= 45 ? "hsl(var(--warning))" : "hsl(var(--destructive))";

  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={7} stroke="hsl(var(--secondary))" fill="none" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        strokeWidth={7}
        stroke={color}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={`${fill} ${circ}`}
        style={{ transition: "stroke-dasharray 0.8s ease" }}
      />
    </svg>
  );
}

// ── Main card ────────────────────────────────────
export function RecoveryIndexCard() {
  const navigate = useNavigate();
  const { data: idx, isLoading } = useRecoveryIndex();

  if (isLoading) {
    return (
      <div className="card-premium p-5">
        <div className="skeleton h-4 w-40 mb-4 rounded-lg" />
        <div className="skeleton h-20 rounded-xl" />
      </div>
    );
  }

  if (!idx) return null;

  const TrendIcon =
    idx.trend === "up" ? TrendingUp : idx.trend === "down" ? TrendingDown : Minus;
  const trendColor =
    idx.trend === "up"
      ? "text-primary"
      : idx.trend === "down"
      ? "text-destructive"
      : "text-muted-foreground";
  const trendText =
    idx.trend === "up"
      ? `+${idx.trendDelta} pts`
      : idx.trend === "down"
      ? `${idx.trendDelta} pts`
      : "Estável";

  const scoreLabel =
    idx.total >= 80
      ? "Excelente"
      : idx.total >= 60
      ? "Bom progresso"
      : idx.total >= 40
      ? "Em desenvolvimento"
      : "Iniciando";

  const pillars = [
    idx.pillarRotina,
    idx.pillarEmocional,
    idx.pillarFinanceiro,
    idx.pillarJornada,
  ];

  return (
    <div className="space-y-3">
      {/* ── Risk banner ────────────────────────── */}
      {idx.riskFlag && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 flex items-start gap-3">
          <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
          <p className="text-xs text-destructive font-medium leading-relaxed">
            Risco elevado de recaída detectado. Considere falar com um terapeuta ou acionar seu Porto Seguro.
          </p>
        </div>
      )}

      {idx.fallAlert && !idx.riskFlag && (
        <div className="rounded-xl border border-warning/30 bg-warning/5 p-3 flex items-start gap-3">
          <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
          <p className="text-xs text-warning font-medium leading-relaxed">
            Seu índice caiu {Math.abs(idx.trendDelta)} pontos nos últimos 7 dias. Fale com a IA ou agende uma sessão.
          </p>
        </div>
      )}

      {/* ── Main card ──────────────────────────── */}
      <div className="card-premium overflow-hidden">
        {/* Top: score + ring */}
        <div className="p-5 flex items-center gap-5">
          <div className="relative shrink-0">
            <ScoreRing value={idx.total} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold text-foreground leading-none">{idx.total}</span>
              <span className="text-[10px] text-muted-foreground">/100</span>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Índice de Recuperação
              </p>
            </div>
            <p className="text-base font-bold text-foreground">{scoreLabel}</p>
            <div className={`flex items-center gap-1 mt-1 ${trendColor}`}>
              <TrendIcon className="h-3.5 w-3.5" />
              <span className="text-xs font-semibold">{trendText} esta semana</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed line-clamp-2">
              {idx.trendExplanation}
            </p>
          </div>
        </div>

        {/* Pillars */}
        <div className="px-5 pb-4 space-y-3 border-t border-border/50 pt-4">
          {pillars.map((p) => (
            <PillarBar key={p.name} name={p.name} score={p.score} max={p.max} trend={p.trend} />
          ))}
        </div>

        {/* Recommendation */}
        <div className="mx-5 mb-4 rounded-xl bg-accent p-3 flex items-start gap-2.5">
          <Lightbulb className="h-4 w-4 text-accent-foreground shrink-0 mt-0.5" />
          <p className="text-xs text-accent-foreground leading-relaxed">{idx.topRecommendation}</p>
        </div>

        {/* CTA */}
        <button
          onClick={() => navigate("/app/indice")}
          className="w-full flex items-center justify-between px-5 py-3.5 border-t border-border/50 hover:bg-secondary/30 transition-colors"
        >
          <span className="text-xs font-semibold text-foreground">Ver histórico detalhado</span>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
}
