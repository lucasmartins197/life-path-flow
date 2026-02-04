import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowLeft, 
  DollarSign,
  Utensils,
  Dumbbell,
  Users,
  Calendar,
  ChevronRight,
  Plus,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import { FloatingAIButton } from "@/components/FloatingAIButton";

const routineModules = [
  {
    id: "financeiro",
    title: "Financeiro",
    description: "Controle de gastos, dívidas e metas",
    icon: DollarSign,
    color: "bg-emerald-500",
    path: "/app/rotina/financeiro",
    stats: { label: "Saldo", value: "R$ 2.450" }
  },
  {
    id: "alimentacao",
    title: "Alimentação",
    description: "Sugestões e registro de refeições",
    icon: Utensils,
    color: "bg-orange-500",
    path: "/app/rotina/alimentacao",
    stats: { label: "Hoje", value: "3 refeições" }
  },
  {
    id: "exercicios",
    title: "Exercícios",
    description: "Atividades físicas e metas",
    icon: Dumbbell,
    color: "bg-blue-500",
    path: "/app/rotina/exercicios",
    stats: { label: "Semana", value: "4/5 dias" }
  },
  {
    id: "familia",
    title: "Família",
    description: "Relacionamentos e compromissos",
    icon: Users,
    color: "bg-pink-500",
    path: "/app/rotina/familia",
    stats: { label: "Próximo", value: "Jantar dom." }
  },
];

export default function RoutineHome() {
  const navigate = useNavigate();
  const today = new Date().toLocaleDateString("pt-BR", { 
    weekday: "long", 
    day: "numeric", 
    month: "long" 
  });

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
            Construção de Rotina
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container px-4 py-6 pb-24">
        {/* Today's Overview */}
        <section className="mb-8">
          <Card className="bg-gradient-to-br from-routine to-routine/80 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-white/80 capitalize">{today}</p>
                  <h2 className="text-2xl font-display font-bold">
                    Plano do Dia
                  </h2>
                </div>
                <Button 
                  size="icon" 
                  variant="secondary" 
                  className="rounded-full bg-white/20 hover:bg-white/30"
                  onClick={() => navigate("/app/rotina/plano")}
                >
                  <Plus className="h-5 w-5 text-white" />
                </Button>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/10">
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                  <span className="text-sm">08:00 - Meditação matinal</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/10">
                  <div className="w-2 h-2 rounded-full bg-white/50" />
                  <span className="text-sm">10:00 - Sessão de terapia</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/10">
                  <div className="w-2 h-2 rounded-full bg-white/50" />
                  <span className="text-sm">14:00 - Exercício físico</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Routine Modules */}
        <section>
          <h2 className="text-lg font-display font-semibold mb-4">
            Áreas da Vida
          </h2>
          
          <div className="grid grid-cols-1 gap-4">
            {routineModules.map((module) => (
              <Card 
                key={module.id}
                className="card-premium cursor-pointer"
                onClick={() => navigate(module.path)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl ${module.color} flex items-center justify-center shrink-0`}>
                      <module.icon className="h-6 w-6 text-white" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold">{module.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {module.description}
                      </p>
                    </div>
                    
                    <div className="text-right shrink-0">
                      <p className="text-xs text-muted-foreground">
                        {module.stats.label}
                      </p>
                      <p className="font-semibold text-sm">
                        {module.stats.value}
                      </p>
                    </div>
                    
                    <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Quick Stats */}
        <section className="mt-8">
          <h2 className="text-lg font-display font-semibold mb-4">
            Resumo da Semana
          </h2>
          
          <div className="grid grid-cols-2 gap-4">
            <Card className="card-premium">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-xs text-muted-foreground">Economia</span>
                </div>
                <p className="text-xl font-bold">R$ 320</p>
                <p className="text-xs text-green-500">+15% vs semana passada</p>
              </CardContent>
            </Card>
            
            <Card className="card-premium">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Dumbbell className="h-4 w-4 text-blue-500" />
                  <span className="text-xs text-muted-foreground">Exercícios</span>
                </div>
                <p className="text-xl font-bold">4 dias</p>
                <p className="text-xs text-muted-foreground">Meta: 5 dias</p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <FloatingAIButton />
    </div>
  );
}
