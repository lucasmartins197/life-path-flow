import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, Flame, Heart, Dumbbell, Apple, Compass } from "lucide-react";

interface ScoreBreakdown {
  journey: number;
  routine: number;
  therapy: number;
  exercise: number;
  nutrition: number;
  streak: number;
  total: number;
}

export function RecoveryScoreCard() {
  const { user } = useAuth();
  const [score, setScore] = useState<ScoreBreakdown | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    calculateScore();
  }, [user]);

  async function calculateScore() {
    if (!user) return;
    try {
      // Fetch data in parallel
      const [journeyRes, routineRes, exerciseRes, nutritionRes, sessionRes, patientRes] = await Promise.all([
        supabase.from("trail_progress").select("*").eq("user_id", user.id),
        supabase.from("routine_days").select("*").eq("user_id", user.id).gte("date", new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0]),
        supabase.from("exercise_logs").select("*").eq("user_id", user.id).gte("logged_at", new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0]),
        supabase.from("nutrition_logs").select("*").eq("user_id", user.id).gte("logged_at", new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0]),
        supabase.from("sessions").select("*").eq("patient_id", user.id).eq("status", "completed"),
        supabase.from("patient_profiles").select("streak_days").eq("user_id", user.id).maybeSingle(),
      ]);

      const completedSteps = (journeyRes.data || []).filter(s => s.is_completed).length;
      const journeyScore = Math.min(Math.round((completedSteps / 12) * 25), 25);

      const routineDays = (routineRes.data || []).length;
      const routineScore = Math.min(Math.round((routineDays / 20) * 20), 20);

      const completedSessions = (sessionRes.data || []).length;
      const therapyScore = Math.min(Math.round((completedSessions / 4) * 15), 15);

      const exerciseDays = (exerciseRes.data || []).length;
      const exerciseScore = Math.min(Math.round((exerciseDays / 12) * 15), 15);

      const nutritionDays = new Set((nutritionRes.data || []).map(n => n.logged_at)).size;
      const nutritionScore = Math.min(Math.round((nutritionDays / 15) * 15), 15);

      const streakDays = patientRes.data?.streak_days || 0;
      const streakBonus = Math.min(Math.round((streakDays / 30) * 10), 10);

      const total = journeyScore + routineScore + therapyScore + exerciseScore + nutritionScore + streakBonus;

      setScore({
        journey: journeyScore,
        routine: routineScore,
        therapy: therapyScore,
        exercise: exerciseScore,
        nutrition: nutritionScore,
        streak: streakBonus,
        total,
      });

      // Save to DB
      await supabase.from("recovery_scores").insert({
        user_id: user.id,
        score: total,
        journey_score: journeyScore,
        routine_score: routineScore,
        therapy_score: therapyScore,
        exercise_score: exerciseScore,
        nutrition_score: nutritionScore,
        streak_bonus: streakBonus,
      });
    } catch (err) {
      console.error("Error calculating recovery score:", err);
    } finally {
      setLoading(false);
    }
  }

  function getScoreLabel(total: number) {
    if (total >= 80) return { label: "Excelente", color: "text-green-500" };
    if (total >= 60) return { label: "Bom", color: "text-blue-500" };
    if (total >= 40) return { label: "Em progresso", color: "text-yellow-500" };
    return { label: "Iniciando", color: "text-orange-500" };
  }

  if (loading) {
    return (
      <Card className="card-premium mb-6 animate-pulse">
        <CardContent className="p-5 h-32" />
      </Card>
    );
  }

  if (!score) return null;

  const { label, color } = getScoreLabel(score.total);

  const categories = [
    { name: "Jornada", value: score.journey, max: 25, icon: Compass, color: "bg-blue-500" },
    { name: "Rotina", value: score.routine, max: 20, icon: Flame, color: "bg-orange-500" },
    { name: "Terapia", value: score.therapy, max: 15, icon: Heart, color: "bg-pink-500" },
    { name: "Exercício", value: score.exercise, max: 15, icon: Dumbbell, color: "bg-green-500" },
    { name: "Nutrição", value: score.nutrition, max: 15, icon: Apple, color: "bg-red-500" },
    { name: "Streak", value: score.streak, max: 10, icon: Trophy, color: "bg-yellow-500" },
  ];

  return (
    <Card className="card-premium mb-6 overflow-hidden">
      <div className="bg-gradient-to-r from-primary to-primary/80 p-4 text-primary-foreground">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-primary-foreground/70">Score de Recuperação</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold">{score.total}</span>
              <span className="text-sm text-primary-foreground/70">/100</span>
            </div>
            <p className={`text-sm font-semibold mt-1 ${color}`}>{label}</p>
          </div>
          <div className="w-16 h-16 rounded-full border-4 border-primary-foreground/30 flex items-center justify-center">
            <Trophy className="h-8 w-8 text-primary-foreground" />
          </div>
        </div>
      </div>
      <CardContent className="p-4 space-y-3">
        {categories.map((cat) => (
          <div key={cat.name} className="flex items-center gap-3">
            <cat.icon className="h-4 w-4 text-muted-foreground shrink-0" />
            <div className="flex-1">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">{cat.name}</span>
                <span className="font-medium">{cat.value}/{cat.max}</span>
              </div>
              <Progress value={(cat.value / cat.max) * 100} className="h-2" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
