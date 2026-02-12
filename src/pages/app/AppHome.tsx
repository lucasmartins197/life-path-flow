import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Compass, 
  Stethoscope, 
  Calendar,
  TrendingUp,
  ChevronRight,
  Flame,
  Activity,
  Scale
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { BottomNavigation } from "@/components/BottomNavigation";
import { PortoSeguroButton } from "@/components/PortoSeguroButton";
import { AIChatPanel } from "@/components/chat/AIChatPanel";
import { DailyReportCard } from "@/components/daily-report/DailyReportCard";

export default function AppHome() {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const quickStats = [
    { label: "Dias na Jornada", value: "7", icon: Flame, trend: "+3" },
    { label: "Streak", value: "5", icon: Activity, trend: "+2" },
    { label: "Passo Atual", value: "3", icon: Compass, trend: "" },
  ];

  return (
    <div className="min-h-screen bg-background safe-top pb-24">
      {/* Header */}
      <header className="bg-primary text-primary-foreground">
        <div className="container px-4 py-6">
          <p className="text-primary-foreground/80 text-sm">Olá,</p>
          <h1 className="text-2xl font-display font-bold">
            {profile?.full_name || "Bem-vindo"}
          </h1>
          <p className="text-primary-foreground/70 text-sm mt-1">
            Sua jornada está no caminho certo
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container px-4 -mt-4">
        {/* AI Daily Report */}
        <DailyReportCard />

        {/* Quick Stats */}
        <section className="grid grid-cols-3 gap-3 mb-6">
          {quickStats.map((stat, index) => (
            <Card key={index} className="card-premium">
              <CardContent className="p-4 text-center">
                <stat.icon className="h-5 w-5 mx-auto mb-2 text-primary" />
                <p className="text-lg font-bold text-foreground">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                {stat.trend && (
                  <span className="text-[10px] text-success font-medium">{stat.trend}</span>
                )}
              </CardContent>
            </Card>
          ))}
        </section>

        {/* Main Modules - As per prompt: Jornada, Terapia, Rotina, Evolução */}
        <section className="space-y-4">
          {/* A Jornada */}
          <button
            onClick={() => navigate("/app/jornada")}
            className="w-full module-card module-card-journey group text-left"
          >
            <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-30 transition-opacity">
              <Compass className="h-20 w-20" />
            </div>
            
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mb-4">
                <Compass className="h-6 w-6" />
              </div>
              
              <h3 className="text-xl font-display font-bold mb-1">
                A Jornada
              </h3>
              <p className="text-white/80 text-sm mb-4">
                12 passos para sua transformação
              </p>
              
              {/* Progress */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-white rounded-full"
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

          {/* Terapia */}
          <button
            onClick={() => navigate("/app/terapia")}
            className="w-full module-card module-card-health group text-left"
          >
            <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-30 transition-opacity">
              <Stethoscope className="h-20 w-20" />
            </div>
            
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mb-4">
                <Stethoscope className="h-6 w-6" />
              </div>
              
              <h3 className="text-xl font-display font-bold mb-1">
                Terapia
              </h3>
              <p className="text-white/80 text-sm mb-3">
                Psicólogos, psiquiatras e terapeutas
              </p>
              
              <div className="flex items-center gap-4 text-sm text-white/80">
                <span>🩺 Agendar</span>
                <span>💬 Consultas</span>
              </div>
            </div>
            
            <div className="absolute bottom-4 right-4 flex items-center gap-1 text-white/80">
              <span className="text-sm">Ver Profissionais</span>
              <ChevronRight className="h-4 w-4" />
            </div>
          </button>

          {/* Rotina */}
          <button
            onClick={() => navigate("/app/rotina")}
            className="w-full module-card module-card-finance group text-left"
          >
            <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-30 transition-opacity">
              <Calendar className="h-20 w-20" />
            </div>
            
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6" />
              </div>
              
              <h3 className="text-xl font-display font-bold mb-1">
                Rotina
              </h3>
              <p className="text-white/80 text-sm mb-3">
                Checklist diário e organização da vida
              </p>
              
              <div className="flex items-center gap-4 text-sm text-white/80">
                <span>😴 Sono</span>
                <span>🏋️ Exercício</span>
                <span>🍎 Alimentação</span>
              </div>
            </div>
            
            <div className="absolute bottom-4 right-4 flex items-center gap-1 text-white/80">
              <span className="text-sm">Gerenciar</span>
              <ChevronRight className="h-4 w-4" />
            </div>
          </button>

          {/* Minha Evolução */}
          <button
            onClick={() => navigate("/app/evolucao")}
            className="w-full module-card group text-left"
            style={{ 
              background: "linear-gradient(135deg, hsl(192 70% 28%) 0%, hsl(160 84% 32%) 100%)" 
            }}
          >
            <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-30 transition-opacity">
              <TrendingUp className="h-20 w-20 text-white" />
            </div>
            
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              
              <h3 className="text-xl font-display font-bold mb-1 text-white">
                Minha Evolução
              </h3>
              <p className="text-white/80 text-sm mb-3">
                Acompanhe seu progresso e conquistas
              </p>
              
              <div className="flex items-center gap-4 text-sm text-white/80">
                <span>📊 Gráficos</span>
                <span>🏆 Conquistas</span>
              </div>
            </div>
            
            <div className="absolute bottom-4 right-4 flex items-center gap-1 text-white/80">
              <span className="text-sm">Ver Evolução</span>
              <ChevronRight className="h-4 w-4" />
            </div>
          </button>

          {/* Apoio Jurídico */}
          <button
            onClick={() => navigate("/app/juridico")}
            className="w-full module-card group text-left"
            style={{ 
              background: "linear-gradient(135deg, hsl(220 60% 30%) 0%, hsl(250 50% 40%) 100%)" 
            }}
          >
            <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-30 transition-opacity">
              <Scale className="h-20 w-20 text-white" />
            </div>
            
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mb-4">
                <Scale className="h-6 w-6 text-white" />
              </div>
              
              <h3 className="text-xl font-display font-bold mb-1 text-white">
                Apoio Jurídico
              </h3>
              <p className="text-white/80 text-sm mb-3">
                Advogados especializados e simulador de dívidas
              </p>
              
              <div className="flex items-center gap-4 text-sm text-white/80">
                <span>⚖️ Consultas</span>
                <span>📊 Simulador</span>
              </div>
            </div>
            
            <div className="absolute bottom-4 right-4 flex items-center gap-1 text-white/80">
              <span className="text-sm">Acessar</span>
              <ChevronRight className="h-4 w-4" />
            </div>
          </button>
        </section>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />

      {/* Porto Seguro - Fixed Button */}
      <PortoSeguroButton />

      {/* AI Chat */}
      <AIChatPanel />
    </div>
  );
}
