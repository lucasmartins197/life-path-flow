import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Sparkles,
  AlertTriangle,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Loader2,
  Target,
  X,
  Zap,
  Trophy,
  Shield,
  Heart,
  Flame,
  Star,
} from "lucide-react";

interface DailyAIData {
  greeting: string;
  journey_summary: string;
  nutrition_summary: string;
  exercise_summary: string;
  routine_summary: string;
  risk_alert: string | null;
  daily_tip: string;
  motivation_quote: string;
  overall_mood: string;
  priority_actions: string[];
  score: number;
}

function getLevel(score: number) {
  if (score >= 90) return { level: 10, title: "Lendário", icon: Trophy, color: "text-yellow-400", bg: "from-yellow-500/20 to-amber-500/20", border: "border-yellow-500/30", bar: "bg-yellow-400" };
  if (score >= 80) return { level: 9, title: "Épico", icon: Star, color: "text-purple-400", bg: "from-purple-500/20 to-pink-500/20", border: "border-purple-500/30", bar: "bg-purple-400" };
  if (score >= 70) return { level: 8, title: "Mestre", icon: Shield, color: "text-blue-400", bg: "from-blue-500/20 to-cyan-500/20", border: "border-blue-500/30", bar: "bg-blue-400" };
  if (score >= 60) return { level: 7, title: "Veterano", icon: Zap, color: "text-cyan-400", bg: "from-cyan-500/20 to-teal-500/20", border: "border-cyan-500/30", bar: "bg-cyan-400" };
  if (score >= 50) return { level: 6, title: "Guerreiro", icon: Flame, color: "text-orange-400", bg: "from-orange-500/20 to-red-500/20", border: "border-orange-500/30", bar: "bg-orange-400" };
  if (score >= 40) return { level: 5, title: "Explorador", icon: Heart, color: "text-green-400", bg: "from-green-500/20 to-emerald-500/20", border: "border-green-500/30", bar: "bg-green-400" };
  if (score >= 30) return { level: 4, title: "Aprendiz", icon: Sparkles, color: "text-teal-400", bg: "from-teal-500/20 to-green-500/20", border: "border-teal-500/30", bar: "bg-teal-400" };
  if (score >= 20) return { level: 3, title: "Iniciante", icon: Zap, color: "text-sky-400", bg: "from-sky-500/20 to-blue-500/20", border: "border-sky-500/30", bar: "bg-sky-400" };
  if (score >= 10) return { level: 2, title: "Novato", icon: Heart, color: "text-slate-400", bg: "from-slate-500/20 to-gray-500/20", border: "border-slate-500/30", bar: "bg-slate-400" };
  return { level: 1, title: "Despertar", icon: Sparkles, color: "text-gray-400", bg: "from-gray-500/20 to-slate-500/20", border: "border-gray-500/30", bar: "bg-gray-400" };
}

function getStatBars(data: DailyAIData) {
  const has = (s: string) => s && s.length > 10;
  return [
    { label: "Jornada", emoji: "🧭", filled: has(data.journey_summary) },
    { label: "Rotina", emoji: "📋", filled: has(data.routine_summary) },
    { label: "Nutrição", emoji: "🍎", filled: has(data.nutrition_summary) },
    { label: "Exercício", emoji: "🏋️", filled: has(data.exercise_summary) },
  ];
}

export function DailyReportCard() {
  const { user } = useAuth();
  const [aiData, setAiData] = useState<DailyAIData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [hasTriedToday, setHasTriedToday] = useState(false);

  useEffect(() => {
    if (user && !hasTriedToday) {
      generateReport();
    }
  }, [user]);

  const generateReport = async () => {
    if (!user || isLoading) return;
    setIsLoading(true);
    setHasTriedToday(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-daily-report", {});
      if (error) throw error;
      if (data?.ai_data) {
        setAiData(data.ai_data);
      } else if (data?.report) {
        const r = data.report;
        setAiData({
          greeting: `Olá! Seu relatório de hoje já foi gerado.`,
          journey_summary: r.journey_summary?.text || "",
          nutrition_summary: r.nutrition_summary?.text || "",
          exercise_summary: r.exercise_summary?.text || "",
          routine_summary: r.routine_summary?.text || "",
          risk_alert: r.risk_assessment?.alert || null,
          daily_tip: "",
          motivation_quote: "",
          overall_mood: r.risk_assessment?.mood || "neutro",
          priority_actions: r.ai_recommendations || [],
          score: r.overall_score || 0,
        });
      }
    } catch (e) {
      console.error("Daily report error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  if (isDismissed) return null;

  if (isLoading) {
    return (
      <Card className="overflow-hidden mb-6 border border-primary/20 bg-gradient-to-br from-primary/5 to-background">
        <div className="h-1 bg-gradient-to-r from-primary via-cyan-400 to-primary animate-pulse" />
        <CardContent className="p-5 flex items-center gap-3">
          <div className="relative">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <div className="absolute inset-0 h-6 w-6 animate-ping text-primary opacity-20">
              <Zap className="h-6 w-6" />
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Gerando relatório...</p>
            <p className="text-xs text-muted-foreground">Lia está analisando seus dados ⚡</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!aiData) return null;

  const lvl = getLevel(aiData.score);
  const LevelIcon = lvl.icon;
  const stats = getStatBars(aiData);
  const nextLevelScore = Math.min((lvl.level) * 10, 100);
  const progressToNext = aiData.score >= 90 ? 100 : ((aiData.score % 10) / 10) * 100;

  return (
    <Card className={`overflow-hidden mb-6 border ${lvl.border} bg-gradient-to-br ${lvl.bg} backdrop-blur-sm animate-in fade-in slide-in-from-top-4 duration-500`}>
      {/* XP Bar top */}
      <div className="h-1.5 bg-muted/30 relative">
        <div className={`h-full ${lvl.bar} transition-all duration-1000 ease-out`} style={{ width: `${aiData.score}%` }} />
      </div>

      <CardContent className="p-4 space-y-3">
        {/* Header: Level + Score + Dismiss */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${lvl.bg} border ${lvl.border} flex items-center justify-center`}>
              <LevelIcon className={`h-5 w-5 ${lvl.color}`} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className={`text-xs font-bold uppercase tracking-wider ${lvl.color}`}>Nv. {lvl.level}</span>
                <span className="text-xs font-bold text-foreground">{lvl.title}</span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Progress value={progressToNext} className="h-1.5 w-20 bg-muted/40" />
                <span className="text-[10px] text-muted-foreground font-mono">{aiData.score}/100 XP</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Badge variant="outline" className={`text-xs font-mono border ${lvl.border} ${lvl.color}`}>
              <Zap className="h-3 w-3 mr-0.5" /> {aiData.score}
            </Badge>
            <button onClick={() => setIsDismissed(true)} className="p-1 text-muted-foreground hover:text-foreground transition-colors">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Greeting */}
        <p className="text-sm font-medium text-foreground">{aiData.greeting}</p>

        {/* Stat Bars - RPG style */}
        <div className="grid grid-cols-4 gap-2">
          {stats.map((s, i) => (
            <div key={i} className={`text-center p-2 rounded-lg border transition-all ${s.filled ? `${lvl.border} bg-gradient-to-b ${lvl.bg}` : 'border-muted/20 bg-muted/5 opacity-50'}`}>
              <span className="text-lg">{s.emoji}</span>
              <p className={`text-[10px] font-semibold mt-0.5 ${s.filled ? 'text-foreground' : 'text-muted-foreground'}`}>{s.label}</p>
              {s.filled && <Flame className={`h-3 w-3 mx-auto mt-0.5 ${lvl.color}`} />}
            </div>
          ))}
        </div>

        {/* Risk Alert */}
        {aiData.risk_alert && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30">
            <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
            <p className="text-sm text-destructive">{aiData.risk_alert}</p>
          </div>
        )}

        {/* Priority Quests */}
        {aiData.priority_actions?.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs font-bold text-muted-foreground flex items-center gap-1 uppercase tracking-wider">
              <Target className="h-3 w-3" /> Missões do Dia
            </p>
            {aiData.priority_actions.map((action, i) => (
              <div key={i} className={`flex items-start gap-2.5 text-sm p-2 rounded-lg border ${lvl.border} bg-gradient-to-r ${lvl.bg}`}>
                <div className={`w-5 h-5 rounded-md ${lvl.bar} flex items-center justify-center shrink-0`}>
                  <span className="text-[10px] font-bold text-white">{i + 1}</span>
                </div>
                <span className="text-foreground text-xs">{action}</span>
              </div>
            ))}
          </div>
        )}

        {/* Expandable Details */}
        {isExpanded && (
          <div className="space-y-3 pt-2 border-t border-border/30 animate-in fade-in duration-300">
            {aiData.journey_summary && (
              <div className={`p-3 rounded-lg border ${lvl.border} bg-gradient-to-r ${lvl.bg}`}>
                <p className="text-xs font-bold text-muted-foreground mb-1">🧭 Jornada</p>
                <p className="text-sm text-foreground">{aiData.journey_summary}</p>
              </div>
            )}
            {aiData.routine_summary && (
              <div className={`p-3 rounded-lg border ${lvl.border} bg-gradient-to-r ${lvl.bg}`}>
                <p className="text-xs font-bold text-muted-foreground mb-1">📋 Rotina</p>
                <p className="text-sm text-foreground">{aiData.routine_summary}</p>
              </div>
            )}
            {aiData.nutrition_summary && (
              <div className={`p-3 rounded-lg border ${lvl.border} bg-gradient-to-r ${lvl.bg}`}>
                <p className="text-xs font-bold text-muted-foreground mb-1">🍎 Nutrição</p>
                <p className="text-sm text-foreground">{aiData.nutrition_summary}</p>
              </div>
            )}
            {aiData.exercise_summary && (
              <div className={`p-3 rounded-lg border ${lvl.border} bg-gradient-to-r ${lvl.bg}`}>
                <p className="text-xs font-bold text-muted-foreground mb-1">🏋️ Exercícios</p>
                <p className="text-sm text-foreground">{aiData.exercise_summary}</p>
              </div>
            )}
            {aiData.daily_tip && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20">
                <Lightbulb className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <p className="text-sm text-foreground">{aiData.daily_tip}</p>
              </div>
            )}
            {aiData.motivation_quote && (
              <p className="text-sm italic text-muted-foreground text-center px-4">"{aiData.motivation_quote}"</p>
            )}
          </div>
        )}

        {/* Expand Toggle */}
        <Button
          variant="ghost"
          size="sm"
          className={`w-full text-xs border ${lvl.border} hover:bg-gradient-to-r hover:${lvl.bg}`}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <><ChevronUp className="h-3 w-3 mr-1" /> Recolher</>
          ) : (
            <><ChevronDown className="h-3 w-3 mr-1" /> Ver detalhes da missão</>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}