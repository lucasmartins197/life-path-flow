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
  Shield
} from "lucide-react";

export default function AdminHome() {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const stats = [
    { label: "Total Usuários", value: "1,234", icon: Users, color: "text-blue-500" },
    { label: "Profissionais", value: "45", icon: UserCheck, color: "text-green-500" },
    { label: "Receita Mensal", value: "R$ 45.2k", icon: DollarSign, color: "text-emerald-500" },
    { label: "Sessões Hoje", value: "89", icon: Video, color: "text-purple-500" },
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
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container flex items-center justify-between h-16 px-4">
          <div>
            <p className="text-sm text-muted-foreground">Painel Administrativo</p>
            <h1 className="text-lg font-display font-semibold">
              {profile?.full_name || "Administrador"}
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              className="text-muted-foreground"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container px-4 py-6">
        {/* Stats Grid */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="card-premium">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <p className="text-2xl font-display font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
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
