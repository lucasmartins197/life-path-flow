import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

// ── Types ─────────────────────────────────────────
export interface PillarScore {
  name: string;
  score: number;
  max: number;
  trend: "up" | "stable" | "down";
  tip: string;
}

export interface RecoveryIndex {
  total: number;
  prev7Total: number;   // score 7 days ago for trend comparison
  trend: "up" | "stable" | "down";
  trendDelta: number;
  pillarRotina: PillarScore;
  pillarEmocional: PillarScore;
  pillarFinanceiro: PillarScore;
  pillarJornada: PillarScore;
  riskFlag: boolean;       // desejo >= 7 avg
  fallAlert: boolean;      // dropped 15+ pts in 7 days
  trendExplanation: string;
  topRecommendation: string;
  // Weekly snapshots for charts (last 7 daily totals)
  weeklyTotals: number[];
  weeklyLabels: string[];
}

// ── Helpers ───────────────────────────────────────
function clamp(v: number, min: number, max: number) {
  return Math.min(Math.max(v, min), max);
}

function sevenDaysAgo() {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  return d.toISOString().split("T")[0];
}

function thirtyDaysAgo() {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d.toISOString().split("T")[0];
}

function trendLabel(delta: number): "up" | "stable" | "down" {
  if (delta >= 2) return "up";
  if (delta <= -2) return "down";
  return "stable";
}

// ── Hook ──────────────────────────────────────────
export function useRecoveryIndex() {
  const { user } = useAuth();

  return useQuery<RecoveryIndex>({
    queryKey: ["recovery-index", user?.id],
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // re-calc every 5 min
    queryFn: async (): Promise<RecoveryIndex> => {
      const userId = user!.id;
      const today = new Date().toISOString().split("T")[0];
      const d7 = sevenDaysAgo();
      const d30 = thirtyDaysAgo();

      // ── Fetch all data in parallel ─────────────
      const [
        routineRes,
        trailProgressRes,
        financeRes,
        recoveryScoresRes,
      ] = await Promise.all([
        // Routine days last 7d (includes mood & craving via notes field for now)
        supabase
          .from("routine_days")
          .select("date, mood_rating, notes")
          .eq("user_id", userId)
          .gte("date", d7),

        // Journey progress
        supabase
          .from("trail_progress")
          .select("is_completed, completed_at")
          .eq("user_id", userId),

        // Finance events last 30d
        supabase
          .from("finance_events")
          .select("event_type, due_date, is_completed, created_at")
          .eq("user_id", userId)
          .gte("created_at", `${d30}T00:00:00Z`),

        // Last 8 daily recovery scores (for trend & chart)
        supabase
          .from("recovery_scores")
          .select("score, calculated_at, journey_score, routine_score, therapy_score, nutrition_score, exercise_score, streak_bonus")
          .eq("user_id", userId)
          .order("calculated_at", { ascending: false })
          .limit(8),
      ]);

      const routineDays = routineRes.data || [];
      const trailProgress = trailProgressRes.data || [];
      const financeEvents = financeRes.data || [];
      const pastScores = recoveryScoresRes.data || [];

      // ── PILAR 1: Consistência de Rotina (0-25) ──
      const routineDaysCount = routineDays.length;
      // Check for 3-day consecutive gap penalty
      const last3Dates = Array.from({ length: 3 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i - 1);
        return d.toISOString().split("T")[0];
      });
      const hasGap3 = !last3Dates.some((d) =>
        routineDays.find((r) => r.date === d)
      );
      let scoreRotina = Math.round((routineDaysCount / 7) * 25);
      if (hasGap3) scoreRotina = Math.max(0, scoreRotina - 5);
      scoreRotina = clamp(scoreRotina, 0, 25);

      const rotinaTip =
        scoreRotina < 15
          ? `Preencha a rotina hoje para recuperar até +${25 - scoreRotina} pts`
          : "Continue preenchendo a rotina todos os dias";

      // ── PILAR 2: Saúde Emocional (0-25) ─────────
      // mood_rating stored in DB; desejo stored in notes as JSON "desejo:N"
      const parseDesejo = (notes: string | null): number | null => {
        if (!notes) return null;
        const m = notes.match(/desejo:(\d+)/);
        return m ? parseInt(m[1]) : null;
      };

      const humorVals = routineDays
        .map((r) => r.mood_rating)
        .filter((v): v is number => v !== null && v !== undefined);
      const desejoVals = routineDays
        .map((r) => parseDesejo(r.notes))
        .filter((v): v is number => v !== null);

      const avgHumor = humorVals.length
        ? humorVals.reduce((a, b) => a + b, 0) / humorVals.length
        : 5;
      const avgDesejo = desejoVals.length
        ? desejoVals.reduce((a, b) => a + b, 0) / desejoVals.length
        : 3;

      const humorNorm = avgHumor / 10;
      const desejoNorm = 1 - avgDesejo / 10;
      const scoreEmocional = clamp(
        Math.round((0.6 * humorNorm + 0.4 * desejoNorm) * 25),
        0,
        25
      );
      const riskFlag = avgDesejo >= 7;
      const emocionalTip = riskFlag
        ? "Impulso elevado detectado — considere falar com a IA ou um terapeuta"
        : avgHumor < 5
        ? "Tente registrar momentos positivos do dia para elevar o humor"
        : "Sua saúde emocional está em boa trajetória";

      // ── PILAR 3: Responsabilidade Financeira (0-25)
      // Days with at least 1 finance entry in last 7 days
      const finDates7 = new Set(
        financeEvents
          .filter((f) => f.created_at >= `${d7}T00:00:00Z`)
          .map((f) => f.created_at.split("T")[0])
      );
      const diasFin7 = finDates7.size;

      const pagamentos30 = financeEvents.filter(
        (f) => (f.event_type === "payment" || f.event_type === "debt") && f.is_completed
      ).length;

      const dividasAtivas = financeEvents.filter(
        (f) => f.event_type === "debt" && !f.is_completed
      ).length;

      const scoreRegistro = Math.round((diasFin7 / 7) * 10);
      const scorePagamento = Math.min(pagamentos30 * 3, 10);
      const scoreDividas = Math.max(5 - dividasAtivas, 0);
      const scoreFinanceiro = clamp(
        scoreRegistro + scorePagamento + scoreDividas,
        0,
        25
      );
      const financeiroTip =
        diasFin7 === 0
          ? "Registre ao menos 1 lançamento financeiro hoje para ganhar pontos"
          : dividasAtivas > 3
          ? "Reduza dívidas ativas para melhorar este pilar"
          : "Continue registrando suas finanças regularmente";

      // ── PILAR 4: Progresso na Jornada (0-25) ────
      const completedSteps = trailProgress.filter((p) => p.is_completed).length;
      let scoreJornada = Math.round((completedSteps / 12) * 25);

      // Bonus: completed a step in last 7 days
      const recentlyCompleted = trailProgress.some((p) => {
        if (!p.is_completed || !p.completed_at) return false;
        return p.completed_at >= `${d7}T00:00:00Z`;
      });
      if (recentlyCompleted) scoreJornada = Math.min(scoreJornada + 3, 25);
      scoreJornada = clamp(scoreJornada, 0, 25);

      const jornadaTip =
        completedSteps === 0
          ? "Comece o Passo 1 da Jornada para ganhar até 25 pontos"
          : completedSteps < 12
          ? `Avance para o próximo passo e ganhe até +5 pontos`
          : "Jornada completa! Mantenha os hábitos aprendidos";

      // ── ÍNDICE FINAL ─────────────────────────────
      const total = clamp(
        scoreRotina + scoreEmocional + scoreFinanceiro + scoreJornada,
        0,
        100
      );

      // ── Trend vs previous score ──────────────────
      const prev7Total = pastScores.length >= 2 ? pastScores[pastScores.length - 1].score : total;
      const prevLast = pastScores.length >= 1 ? pastScores[0].score : total;
      const trendDelta = total - prev7Total;
      const trend = trendLabel(trendDelta);
      const fallAlert = trendDelta <= -15;

      // ── Explanation ──────────────────────────────
      let explanation = "";
      if (trendDelta > 0)
        explanation = `Seu índice subiu ${trendDelta} pts nos últimos 7 dias — continue assim!`;
      else if (trendDelta < 0)
        explanation = `Seu índice caiu ${Math.abs(trendDelta)} pts. ${
          fallAlert ? "Atenção: queda significativa detectada." : "Foque nos pilares mais baixos."
        }`;
      else explanation = "Índice estável. Mantenha a consistência diária.";

      // Top recommendation: find weakest pillar
      const pillarScores = [
        { name: "Rotina", score: scoreRotina, tip: rotinaTip },
        { name: "Emocional", score: scoreEmocional, tip: emocionalTip },
        { name: "Financeiro", score: scoreFinanceiro, tip: financeiroTip },
        { name: "Jornada", score: scoreJornada, tip: jornadaTip },
      ];
      pillarScores.sort((a, b) => a.score - b.score);
      const topRecommendation = pillarScores[0].tip;

      // ── Weekly chart (last 7 days) ────────────────
      // Use pastScores (most recent first) reversed for chronological
      const chartScores = [...pastScores].reverse().slice(-7);
      const weeklyTotals = chartScores.map((s) => s.score);
      const weeklyLabels = chartScores.map((s) => {
        const d = new Date(s.calculated_at);
        return d.toLocaleDateString("pt-BR", { weekday: "short" });
      });

      // If no history yet, fill with current
      if (weeklyTotals.length === 0) {
        weeklyTotals.push(total);
        weeklyLabels.push("Hoje");
      }

      // Pillar trends using recovery_scores history
      const pillarTrend = (key: keyof typeof pastScores[0]): "up" | "stable" | "down" => {
        if (pastScores.length < 2) return "stable";
        const latest = Number(pastScores[0][key] ?? 0);
        const prev = Number(pastScores[1][key] ?? 0);
        return trendLabel(latest - prev);
      };

      // ── Persist today's score ─────────────────────
      // Upsert: one record per user per day
      supabase
        .from("recovery_scores")
        .upsert(
          {
            user_id: userId,
            score: total,
            journey_score: scoreJornada,
            routine_score: scoreRotina,
            therapy_score: scoreEmocional,
            exercise_score: scoreFinanceiro,
            nutrition_score: 0,
            streak_bonus: 0,
            calculated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        )
        .then(() => {}); // fire-and-forget

      return {
        total,
        prev7Total,
        trend,
        trendDelta,
        riskFlag,
        fallAlert,
        trendExplanation: explanation,
        topRecommendation,
        weeklyTotals,
        weeklyLabels,
        pillarRotina: {
          name: "Consistência de Rotina",
          score: scoreRotina,
          max: 25,
          trend: pillarTrend("routine_score"),
          tip: rotinaTip,
        },
        pillarEmocional: {
          name: "Saúde Emocional",
          score: scoreEmocional,
          max: 25,
          trend: pillarTrend("therapy_score"),
          tip: emocionalTip,
        },
        pillarFinanceiro: {
          name: "Responsabilidade Financeira",
          score: scoreFinanceiro,
          max: 25,
          trend: pillarTrend("exercise_score"),
          tip: financeiroTip,
        },
        pillarJornada: {
          name: "Progresso na Jornada",
          score: scoreJornada,
          max: 25,
          trend: pillarTrend("journey_score"),
          tip: jornadaTip,
        },
      };
    },
  });
}
