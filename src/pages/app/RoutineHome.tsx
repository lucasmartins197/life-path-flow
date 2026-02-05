import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
  Moon,
  BookOpen,
  Heart,
  Sparkles,
  CheckCircle
} from "lucide-react";
import { BottomNavigation } from "@/components/BottomNavigation";
import { PortoSeguroButton } from "@/components/PortoSeguroButton";
import { AIChatPanel } from "@/components/chat/AIChatPanel";

// Daily checklist items as per prompt: sono, exercício, alimentação, família, espiritualidade, estudo
const dailyChecklist = [
  { id: "sono", label: "Sono adequado", icon: Moon, description: "Dormi bem (7-8h)" },
  { id: "exercicio", label: "Exercício físico", icon: Dumbbell, description: "Atividade física realizada" },
  { id: "alimentacao", label: "Alimentação saudável", icon: Utensils, description: "Refeições equilibradas" },
  { id: "familia", label: "Tempo com família", icon: Users, description: "Momento com pessoas queridas" },
  { id: "espiritualidade", label: "Espiritualidade", icon: Sparkles, description: "Meditação ou reflexão" },
  { id: "estudo", label: "Estudo/Leitura", icon: BookOpen, description: "Aprendizado do dia" },
];

const routineModules = [
  {
    id: "financeiro",
    title: "Finanças",
    description: "Controle de gastos, dívidas e metas",
    icon: DollarSign,
    path: "/app/financas",
  },
  {
    id: "alimentacao",
    title: "Nutrição",
    description: "Registro de refeições e macros",
    icon: Utensils,
    path: "/app/nutricao",
  },
  {
    id: "exercicios",
    title: "Exercícios",
    description: "Atividades físicas e evolução",
    icon: Dumbbell,
    path: "/app/exercicios",
  },
  {
    id: "agenda",
    title: "Agenda",
    description: "Compromissos e eventos",
    icon: Calendar,
    path: "/app/agenda",
  },
];

export default function RoutineHome() {
  const navigate = useNavigate();
  const [checkedItems, setCheckedItems] = useState<string[]>([]);
  
  const today = new Date().toLocaleDateString("pt-BR", { 
    weekday: "long", 
    day: "numeric", 
    month: "long" 
  });

  const toggleItem = (itemId: string) => {
    setCheckedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const completedCount = checkedItems.length;
  const totalCount = dailyChecklist.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="min-h-screen bg-background safe-top pb-24">
      {/* Header */}
      <header className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
        <div className="container px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-primary-foreground/80 capitalize text-sm">{today}</p>
              <h1 className="text-2xl font-display font-bold">Minha Rotina</h1>
            </div>
            <Button 
              size="icon" 
              variant="secondary" 
              className="rounded-full bg-white/20 hover:bg-white/30"
              onClick={() => navigate("/app/agenda")}
            >
              <Plus className="h-5 w-5 text-white" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container px-4 -mt-4 pb-6">
        {/* Daily Progress Card */}
        <Card className="card-premium mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-display font-semibold text-foreground">
                  Checklist do Dia
                </h2>
                <p className="text-sm text-muted-foreground">
                  {completedCount} de {totalCount} completados
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">{progressPercent}%</p>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Daily Checklist */}
        <section className="mb-8">
          <h2 className="text-lg font-display font-semibold mb-4 text-foreground">
            Checklist Diário
          </h2>
          
          <div className="space-y-3">
            {dailyChecklist.map((item) => {
              const isChecked = checkedItems.includes(item.id);
              return (
                <Card
                  key={item.id}
                  className={`card-premium cursor-pointer transition-all ${
                    isChecked ? "border-primary/50 bg-primary/5" : ""
                  }`}
                  onClick={() => toggleItem(item.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isChecked ? "bg-primary text-primary-foreground" : "bg-primary/10"
                      }`}>
                        {isChecked ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : (
                          <item.icon className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-medium ${isChecked ? "text-primary" : "text-foreground"}`}>
                          {item.label}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                      
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={() => toggleItem(item.id)}
                        className="shrink-0"
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Quick Access Modules */}
        <section>
          <h2 className="text-lg font-display font-semibold mb-4 text-foreground">
            Áreas da Vida
          </h2>
          
          <div className="grid grid-cols-2 gap-4">
            {routineModules.map((module) => (
              <Card 
                key={module.id}
                className="card-premium cursor-pointer"
                onClick={() => navigate(module.path)}
              >
                <CardContent className="p-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                    <module.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground">{module.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {module.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Weekly Summary */}
        <section className="mt-6">
          <Card className="card-premium bg-gradient-to-br from-primary/5 to-primary/10">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="h-6 w-6 text-primary" />
                <h2 className="text-lg font-display font-semibold text-foreground">
                  Progresso Semanal
                </h2>
              </div>
              
              <div className="grid grid-cols-7 gap-1 mb-4">
                {["S", "T", "Q", "Q", "S", "S", "D"].map((day, i) => (
                  <div key={i} className="text-center">
                    <span className="text-xs text-muted-foreground">{day}</span>
                    <div className={`mt-1 w-full aspect-square rounded-lg flex items-center justify-center text-xs font-medium ${
                      i < 5 ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                    }`}>
                      {i < 5 ? "✓" : "-"}
                    </div>
                  </div>
                ))}
              </div>
              
              <p className="text-sm text-muted-foreground text-center">
                5 dias consecutivos com rotina completa!
              </p>
            </CardContent>
          </Card>
        </section>
      </main>

      <BottomNavigation />
      <PortoSeguroButton />
      <AIChatPanel />
    </div>
  );
}
