import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Compass, 
  Heart, 
  Wallet,
  ChevronRight,
  Flame,
  TrendingUp,
  Activity
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { BottomNavigation } from "@/components/BottomNavigation";
import { AIChatPanel } from "@/components/chat/AIChatPanel";

export default function AppHome() {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const quickStats = [
    { label: "Dias na Jornada", value: "7", icon: Flame, trend: "+3" },
    { label: "Saúde Score", value: "82", icon: Activity, trend: "+5" },
    { label: "Economia", value: "R$ 450", icon: TrendingUp, trend: "+12%" },
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
        {/* Quick Stats */}
        <section className="grid grid-cols-3 gap-3 mb-6">
          {quickStats.map((stat, index) => (
            <Card key={index} className="card-premium">
              <CardContent className="p-4 text-center">
                <stat.icon className="h-5 w-5 mx-auto mb-2 text-primary" />
                <p className="text-lg font-bold text-foreground">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                <span className="text-[10px] text-success font-medium">{stat.trend}</span>
              </CardContent>
            </Card>
          ))}
        </section>

        {/* Main Modules */}
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

          {/* Saúde */}
          <button
            onClick={() => navigate("/app/saude")}
            className="w-full module-card module-card-health group text-left"
          >
            <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-30 transition-opacity">
              <Heart className="h-20 w-20" />
            </div>
            
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mb-4">
                <Heart className="h-6 w-6" />
              </div>
              
              <h3 className="text-xl font-display font-bold mb-1">
                Saúde
              </h3>
              <p className="text-white/80 text-sm mb-3">
                IA Nutricional e Treinos Personalizados
              </p>
              
              <div className="flex items-center gap-4 text-sm text-white/80">
                <span>🥗 Nutrição</span>
                <span>🏋️ Treinos</span>
              </div>
            </div>
            
            <div className="absolute bottom-4 right-4 flex items-center gap-1 text-white/80">
              <span className="text-sm">Explorar</span>
              <ChevronRight className="h-4 w-4" />
            </div>
          </button>

          {/* Finanças */}
          <button
            onClick={() => navigate("/app/financas")}
            className="w-full module-card module-card-finance group text-left"
          >
            <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-30 transition-opacity">
              <Wallet className="h-20 w-20" />
            </div>
            
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mb-4">
                <Wallet className="h-6 w-6" />
              </div>
              
              <h3 className="text-xl font-display font-bold mb-1">
                Finanças
              </h3>
              <p className="text-white/80 text-sm mb-3">
                Controle financeiro inteligente
              </p>
              
              <div className="flex items-center gap-4 text-sm text-white/80">
                <span>💰 Gastos</span>
                <span>📊 Relatórios</span>
              </div>
            </div>
            
            <div className="absolute bottom-4 right-4 flex items-center gap-1 text-white/80">
              <span className="text-sm">Gerenciar</span>
              <ChevronRight className="h-4 w-4" />
            </div>
          </button>
        </section>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />

      {/* AI Chat */}
      <AIChatPanel />
    </div>
  );
}
