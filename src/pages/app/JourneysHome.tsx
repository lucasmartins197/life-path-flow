import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ArrowLeft, 
  CheckCircle2, 
  Circle, 
  Lock, 
  Play,
  Flame,
  Trophy
} from "lucide-react";
import { FloatingAIButton } from "@/components/FloatingAIButton";

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
    async function fetchData() {
      if (!user) return;

      // Fetch journey steps
      const { data: stepsData } = await supabase
        .from("journey_steps")
        .select("*")
        .eq("is_published", true)
        .order("step_number");

      if (stepsData) {
        setSteps(stepsData);
      }

      // Fetch user progress
      const { data: progressData } = await supabase
        .from("trail_progress")
        .select("step_id, is_completed")
        .eq("user_id", user.id);

      if (progressData) {
        setProgress(progressData);
      }

      setIsLoading(false);
    }

    fetchData();
  }, [user]);

  const getStepStatus = (stepId: string, stepNumber: number) => {
    const stepProgress = progress.find((p) => p.step_id === stepId);
    
    if (stepProgress?.is_completed) {
      return "completed";
    }
    
    // Check if previous steps are completed
    const previousSteps = steps.filter((s) => s.step_number < stepNumber);
    const allPreviousCompleted = previousSteps.every((ps) =>
      progress.some((p) => p.step_id === ps.id && p.is_completed)
    );
    
    if (allPreviousCompleted || stepNumber === 1) {
      return "available";
    }
    
    return "locked";
  };

  const completedCount = progress.filter((p) => p.is_completed).length;
  const progressPercentage = steps.length > 0 
    ? Math.round((completedCount / steps.length) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-background safe-top safe-bottom">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container flex items-center h-16 px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/app")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="ml-3 text-lg font-display font-semibold">
            A Jornada
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container px-4 py-6 pb-24">
        {/* Progress Overview */}
        <section className="mb-8">
          <Card className="bg-gradient-to-br from-primary to-primary/80 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-display font-bold">
                    Trilha dos 12 Passos
                  </h2>
                  <p className="text-white/80">
                    Sua jornada de transformação
                  </p>
                </div>
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                  <Trophy className="h-8 w-8" />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Progresso</span>
                  <span>{completedCount}/{steps.length} passos</span>
                </div>
                <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-white rounded-full transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <Flame className="h-5 w-5 text-orange-300" />
                  <span className="text-sm">7 dias de streak</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Steps List */}
        <section>
          <h3 className="text-lg font-display font-semibold mb-4">
            Os 12 Passos
          </h3>
          
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton h-24 rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {steps.map((step) => {
                const status = getStepStatus(step.id, step.step_number);
                
                return (
                  <Card 
                    key={step.id}
                    className={`card-premium cursor-pointer transition-all ${
                      status === "locked" ? "opacity-60" : ""
                    }`}
                    onClick={() => {
                      if (status !== "locked") {
                        navigate(`/app/jornada/${step.step_number}`);
                      }
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className={`
                          w-12 h-12 rounded-full flex items-center justify-center shrink-0
                          ${status === "completed" 
                            ? "bg-primary text-primary-foreground" 
                            : status === "available"
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground"
                          }
                        `}>
                          {status === "completed" ? (
                            <CheckCircle2 className="h-6 w-6" />
                          ) : status === "locked" ? (
                            <Lock className="h-5 w-5" />
                          ) : (
                            <span className="text-lg font-bold">{step.step_number}</span>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">
                              Passo {step.step_number}
                            </h4>
                            {status === "available" && (
                              <span className="text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded-full">
                                Disponível
                              </span>
                            )}
                          </div>
                          <p className="text-base font-medium text-foreground">
                            {step.title}
                          </p>
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {step.description}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            ⏱️ {step.duration_minutes} minutos
                          </p>
                        </div>
                        
                        {status === "available" && (
                          <Button size="icon" variant="ghost" className="shrink-0">
                            <Play className="h-5 w-5 text-primary" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <FloatingAIButton />
    </div>
  );
}
