import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Utensils, Dumbbell, Smile } from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { format, subDays, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

function formatDateLabel(dateStr: string) {
  try {
    return format(parseISO(dateStr), "dd/MM", { locale: ptBR });
  } catch {
    return dateStr;
  }
}

export function ProntuarioCharts() {
  const { user } = useAuth();
  const thirtyDaysAgo = subDays(new Date(), 30).toISOString();

  const { data: nutritionData } = useQuery({
    queryKey: ["prontuario-nutrition-chart", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("nutrition_logs")
        .select("logged_at, calories, protein, carbohydrates, fat")
        .eq("user_id", user.id)
        .gte("logged_at", thirtyDaysAgo.split("T")[0])
        .order("logged_at");

      if (!data || data.length === 0) return [];

      // Aggregate by day
      const byDay: Record<string, { calories: number; protein: number; carbs: number; fat: number; count: number }> = {};
      data.forEach((log) => {
        const day = log.logged_at.split("T")[0];
        if (!byDay[day]) byDay[day] = { calories: 0, protein: 0, carbs: 0, fat: 0, count: 0 };
        byDay[day].calories += Number(log.calories);
        byDay[day].protein += Number(log.protein);
        byDay[day].carbs += Number(log.carbohydrates);
        byDay[day].fat += Number(log.fat);
        byDay[day].count++;
      });

      return Object.entries(byDay).map(([date, vals]) => ({
        date,
        label: formatDateLabel(date),
        calories: Math.round(vals.calories),
        protein: Math.round(vals.protein),
        carbs: Math.round(vals.carbs),
        fat: Math.round(vals.fat),
      }));
    },
    enabled: !!user,
  });

  const { data: exerciseData } = useQuery({
    queryKey: ["prontuario-exercise-chart", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("exercise_logs")
        .select("logged_at, duration_minutes, calories_burned")
        .eq("user_id", user.id)
        .gte("logged_at", thirtyDaysAgo.split("T")[0])
        .order("logged_at");

      if (!data || data.length === 0) return [];

      const byDay: Record<string, { minutes: number; calories: number }> = {};
      data.forEach((log) => {
        const day = log.logged_at.split("T")[0];
        if (!byDay[day]) byDay[day] = { minutes: 0, calories: 0 };
        byDay[day].minutes += log.duration_minutes;
        byDay[day].calories += Number(log.calories_burned || 0);
      });

      return Object.entries(byDay).map(([date, vals]) => ({
        date,
        label: formatDateLabel(date),
        minutos: vals.minutes,
        calorias: vals.calories,
      }));
    },
    enabled: !!user,
  });

  const { data: moodData } = useQuery({
    queryKey: ["prontuario-mood-chart", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("routine_days")
        .select("date, mood_rating")
        .eq("user_id", user.id)
        .gte("date", thirtyDaysAgo.split("T")[0])
        .not("mood_rating", "is", null)
        .order("date");

      if (!data || data.length === 0) return [];

      return data.map((d) => ({
        date: d.date,
        label: formatDateLabel(d.date),
        humor: d.mood_rating,
      }));
    },
    enabled: !!user,
  });

  const hasNutrition = nutritionData && nutritionData.length > 0;
  const hasExercise = exerciseData && exerciseData.length > 0;
  const hasMood = moodData && moodData.length > 0;
  const hasAnyData = hasNutrition || hasExercise || hasMood;

  if (!hasAnyData) {
    return (
      <Card className="card-premium">
        <CardContent className="p-6 text-center">
          <TrendingUp className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            Gráficos de evolução aparecerão aqui quando houver dados registrados nos últimos 30 dias.
          </p>
        </CardContent>
      </Card>
    );
  }

  const chartColors = {
    primary: "hsl(var(--primary))",
    green: "#22c55e",
    blue: "#3b82f6",
    orange: "#f97316",
    purple: "#a855f7",
    red: "#ef4444",
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-display font-semibold flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-primary" /> Gráficos de Evolução (30 dias)
      </h2>

      {/* Mood Chart */}
      {hasMood && (
        <Card className="card-premium">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Smile className="h-4 w-4 text-primary" /> Humor ao Longo do Tempo
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={moodData}>
                <defs>
                  <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartColors.purple} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={chartColors.purple} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                />
                <Area type="monotone" dataKey="humor" stroke={chartColors.purple} fill="url(#moodGrad)" strokeWidth={2} dot={{ r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Nutrition Chart */}
      {hasNutrition && (
        <Card className="card-premium">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Utensils className="h-4 w-4 text-green-500" /> Calorias Diárias
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={nutritionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                />
                <Bar dataKey="calories" name="Calorias" fill={chartColors.green} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Macros Chart */}
      {hasNutrition && (
        <Card className="card-premium">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Utensils className="h-4 w-4 text-green-500" /> Macronutrientes (g)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={nutritionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                />
                <Legend />
                <Line type="monotone" dataKey="protein" name="Proteína" stroke={chartColors.blue} strokeWidth={2} dot={{ r: 2 }} />
                <Line type="monotone" dataKey="carbs" name="Carboidrato" stroke={chartColors.orange} strokeWidth={2} dot={{ r: 2 }} />
                <Line type="monotone" dataKey="fat" name="Gordura" stroke={chartColors.red} strokeWidth={2} dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Exercise Chart */}
      {hasExercise && (
        <Card className="card-premium">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Dumbbell className="h-4 w-4 text-blue-500" /> Exercícios (Minutos/dia)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={exerciseData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                />
                <Legend />
                <Bar dataKey="minutos" name="Minutos" fill={chartColors.blue} radius={[4, 4, 0, 0]} />
                <Bar dataKey="calorias" name="Calorias" fill={chartColors.orange} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
