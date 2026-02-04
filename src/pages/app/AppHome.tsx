import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Compass, 
  Heart, 
  Calendar, 
  ChevronRight,
  Flame,
  Settings,
  Utensils,
  Dumbbell,
  CalendarDays,
  Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FloatingAIButton } from "@/components/FloatingAIButton";

export default function AppHome() {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();

  const quickModules = [
    { id: "nutricao", label: "Nutrição", icon: Utensils, path: "/app/nutricao", color: "text-orange-500" },
    { id: "exercicios", label: "Exercícios", icon: Dumbbell, path: "/app/exercicios", color: "text-blue-500" },
    { id: "agenda", label: "Agenda", icon: CalendarDays, path: "/app/agenda", color: "text-purple-500" },
    { id: "ancora", label: "Rede de Apoio", icon: Shield, path: "/app/ancora", color: "text-primary" },
  ];

  return (
    <div className="min-h-screen bg-background safe-top safe-bottom">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container flex items-center justify-between h-16 px-4">
          <div>
            <p className="text-sm text-muted-foreground">Olá,</p>
            <h1 className="text-lg font-display font-semibold">
              {profile?.full_name || "Bem-vindo"}
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Streak badge */}
            <div className="badge-streak">
              <Flame className="h-4 w-4 text-orange-500" />
              <span>7 dias</span>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/app/configuracoes")}
              className="text-muted-foreground"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container px-4 py-6 pb-24">
        {/* Welcome Section */}
        <section className="mb-6">
          <h2 className="text-2xl font-display font-bold mb-2">
            Sua jornada continua
          </h2>
          <p className="text-muted-foreground">
            Escolha uma área para explorar hoje
          </p>
        </section>

        {/* Quick Access Modules */}
        <section className="mb-6">
          <div className="grid grid-cols-4 gap-3">
            {quickModules.map((module) => (
              <button
                key={module.id}
                onClick={() => navigate(module.path)}
                className="flex flex-col items-center p-3 rounded-xl bg-card border border-border hover:bg-muted/50 transition-colors"
              >
                <module.icon className={`h-6 w-6 mb-2 ${module.color}`} />
                <span className="text-xs font-medium text-center">{module.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Three Hubs */}
        <section className="space-y-4">
          {/* A JORNADA */}
          <button
            onClick={() => navigate("/app/jornada")}
            className="w-full hub-card hub-card-journey group"
          >
            <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-30 transition-opacity">
              <Compass className="h-24 w-24" />
            </div>
            
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mb-4">
                <Compass className="h-6 w-6" />
              </div>
              
              <h3 className="text-2xl font-display font-bold mb-2">
                A Jornada
              </h3>
              <p className="text-white/80 mb-4">
                Trilha dos 12 passos para sua transformação
              </p>
              
              {/* Progress indicator */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-white rounded-full transition-all duration-500"
                    style={{ width: "25%" }}
                  />
                </div>
                <span className="text-sm font-medium">3/12</span>
              </div>
            </div>
            
            <div className="absolute bottom-4 right-4 flex items-center gap-1 text-white/80">
              <span className="text-sm">Continuar</span>
              <ChevronRight className="h-4 w-4" />
            </div>
          </button>

          {/* TERAPIA */}
          <button
            onClick={() => navigate("/app/terapia")}
            className="w-full hub-card hub-card-therapy group"
          >
            <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-30 transition-opacity">
              <Heart className="h-24 w-24" />
            </div>
            
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mb-4">
                <Heart className="h-6 w-6" />
              </div>
              
              <h3 className="text-2xl font-display font-bold mb-2">
                Terapia
              </h3>
              <p className="text-white/80 mb-4">
                Conecte-se com profissionais especializados
              </p>
              
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-sm">5 profissionais online</span>
              </div>
            </div>
            
            <div className="absolute bottom-4 right-4 flex items-center gap-1 text-white/80">
              <span className="text-sm">Explorar</span>
              <ChevronRight className="h-4 w-4" />
            </div>
          </button>

          {/* CONSTRUÇÃO DE ROTINA */}
          <button
            onClick={() => navigate("/app/rotina")}
            className="w-full hub-card hub-card-routine group"
          >
            <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-30 transition-opacity">
              <Calendar className="h-24 w-24" />
            </div>
            
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6" />
              </div>
              
              <h3 className="text-2xl font-display font-bold mb-2">
                Construção de Rotina
              </h3>
              <p className="text-white/80 mb-4">
                Organize sua vida com ferramentas práticas
              </p>
              
              <div className="flex items-center gap-4 text-sm">
                <span>💰 Finanças</span>
                <span>🥗 Alimentação</span>
                <span>🏃 Exercícios</span>
              </div>
            </div>
            
            <div className="absolute bottom-4 right-4 flex items-center gap-1 text-white/80">
              <span className="text-sm">Planejar</span>
              <ChevronRight className="h-4 w-4" />
            </div>
          </button>
        </section>
      </main>

      {/* Floating AI Button */}
      <FloatingAIButton />
    </div>
  );
}
