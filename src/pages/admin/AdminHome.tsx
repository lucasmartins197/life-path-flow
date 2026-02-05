import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  UserCheck, 
  Video, 
  FileText, 
  DollarSign, 
  LogOut,
  Settings,
  BarChart3,
  Shield,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";

export default function AdminHome() {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const metrics = [
    { 
      label: "Total Assinantes", 
      value: "1,234", 
      change: "+12%", 
      trend: "up",
      icon: Users 
    },
    { 
      label: "MRR", 
      value: "R$ 45.2k", 
      change: "+8.5%", 
      trend: "up",
      icon: DollarSign 
    },
    { 
      label: "Volume Consultas", 
      value: "342", 
      change: "+23%", 
      trend: "up",
      icon: Video 
    },
    { 
      label: "Profissionais Ativos", 
      value: "45", 
      change: "+3", 
      trend: "up",
      icon: UserCheck 
    },
  ];

  const recentTransactions = [
    { type: "income", description: "Assinatura Premium - João S.", value: 29.90, date: "Hoje" },
    { type: "income", description: "Sessão Terapia - Maria L.", value: 150.00, date: "Hoje" },
    { type: "expense", description: "Repasse Pro - Dr. Carlos", value: -90.00, date: "Hoje" },
    { type: "income", description: "Assinatura Basic - Pedro M.", value: 29.90, date: "Ontem" },
    { type: "expense", description: "Repasse Pro - Dra. Ana", value: -60.00, date: "Ontem" },
  ];

  const adminModules = [
    { 
      title: "Aprovar Profissionais", 
      description: "Revisar e aprovar novos profissionais",
      icon: UserCheck,
      path: "/admin/profissionais",
      badge: "3 pendentes"
    },
    { 
      title: "Conteúdo da Jornada", 
      description: "Editar passos e conteúdos",
      icon: FileText,
      path: "/admin/conteudo"
    },
    { 
      title: "Gerenciar Vídeos", 
      description: "Upload e gestão de vídeos",
      icon: Video,
      path: "/admin/videos"
    },
    { 
      title: "Planos e Assinaturas", 
      description: "Configurar planos Stripe",
      icon: DollarSign,
      path: "/admin/planos"
    },
    { 
      title: "Relatórios", 
      description: "Análises e métricas",
      icon: BarChart3,
      path: "/admin/relatorios"
    },
    { 
      title: "Auditoria", 
      description: "Logs e segurança",
      icon: Shield,
      path: "/admin/auditoria"
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-primary text-primary-foreground">
        <div className="container flex items-center justify-between h-16 px-4">
          <div>
            <p className="text-sm text-primary-foreground/70">Painel Master</p>
            <h1 className="text-lg font-display font-semibold">
              {profile?.full_name || "Administrador"}
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-white/10"
            >
              <Settings className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-white/10"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container px-4 py-6">
        {/* Metrics Grid */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {metrics.map((metric, index) => (
            <Card key={index} className="metric-card">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <metric.icon className="h-5 w-5 text-primary" />
                </div>
                <span className={`flex items-center gap-1 text-xs font-medium ${
                  metric.trend === "up" ? "text-success" : "text-destructive"
                }`}>
                  {metric.trend === "up" ? (
                    <ArrowUpRight className="h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3" />
                  )}
                  {metric.change}
                </span>
              </div>
              <p className="metric-value">{metric.value}</p>
              <p className="metric-label">{metric.label}</p>
            </Card>
          ))}
        </section>

        {/* Financial Overview */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Entries/Exits Chart Placeholder */}
          <Card className="card-premium">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                Entradas vs Saídas
              </CardTitle>
              <CardDescription>Últimos 30 dias</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-48 flex items-center justify-center bg-muted/30 rounded-xl">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Gráfico de Entradas/Saídas
                  </p>
                  <div className="flex items-center justify-center gap-6 mt-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-success" />
                      <span className="text-xs">Entradas: R$ 52.4k</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-destructive" />
                      <span className="text-xs">Saídas: R$ 18.2k</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card className="card-premium">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-primary" />
                Transações Recentes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentTransactions.map((tx, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    tx.type === "income" ? "bg-success/10" : "bg-destructive/10"
                  }`}>
                    {tx.type === "income" ? (
                      <TrendingUp className="h-4 w-4 text-success" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-destructive" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{tx.description}</p>
                    <p className="text-xs text-muted-foreground">{tx.date}</p>
                  </div>
                  <p className={`text-sm font-semibold ${
                    tx.value > 0 ? "text-success" : "text-destructive"
                  }`}>
                    {tx.value > 0 ? "+" : ""}R$ {Math.abs(tx.value).toFixed(2)}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        {/* Admin Modules */}
        <section>
          <h2 className="text-xl font-display font-semibold mb-4">
            Gerenciamento
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {adminModules.map((module, index) => (
              <Card 
                key={index} 
                className="card-premium cursor-pointer"
                onClick={() => navigate(module.path)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <module.icon className="h-5 w-5 text-primary" />
                    </div>
                    {module.badge && (
                      <span className="text-xs bg-destructive text-destructive-foreground px-2 py-1 rounded-full">
                        {module.badge}
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-base mb-1">{module.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {module.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
