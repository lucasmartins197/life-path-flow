import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Users, 
  Calendar, 
  FileText, 
  DollarSign, 
  LogOut,
  Video,
  Clock
} from "lucide-react";
import { useState } from "react";

export default function ProHome() {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const [isOnline, setIsOnline] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const stats = [
    { label: "Pacientes ativos", value: "12", icon: Users },
    { label: "Sessões hoje", value: "4", icon: Calendar },
    { label: "Ganhos do mês", value: "R$ 2.400", icon: DollarSign },
  ];

  const upcomingSessions = [
    { patient: "João Silva", time: "14:00", type: "Vídeo" },
    { patient: "Maria Santos", time: "15:00", type: "Vídeo" },
    { patient: "Pedro Costa", time: "16:30", type: "Áudio" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container flex items-center justify-between h-16 px-4">
          <div>
            <p className="text-sm text-muted-foreground">Painel Profissional</p>
            <h1 className="text-lg font-display font-semibold">
              Dr(a). {profile?.full_name || "Profissional"}
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch
                id="online-status"
                checked={isOnline}
                onCheckedChange={setIsOnline}
              />
              <Label htmlFor="online-status" className="text-sm">
                {isOnline ? (
                  <span className="flex items-center gap-1 text-green-600">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    Online
                  </span>
                ) : (
                  <span className="text-muted-foreground">Offline</span>
                )}
              </Label>
            </div>
            
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
        <section className="grid grid-cols-3 gap-4 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="card-premium">
              <CardContent className="p-4">
                <stat.icon className="h-5 w-5 text-primary mb-2" />
                <p className="text-2xl font-display font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        {/* Quick Actions */}
        <section className="grid grid-cols-2 gap-4 mb-8">
          <Button
            variant="outline"
            className="h-auto py-6 flex flex-col items-center gap-2"
            onClick={() => navigate("/pro/pacientes")}
          >
            <Users className="h-6 w-6 text-primary" />
            <span>Meus Pacientes</span>
          </Button>
          
          <Button
            variant="outline"
            className="h-auto py-6 flex flex-col items-center gap-2"
            onClick={() => navigate("/pro/agenda")}
          >
            <Calendar className="h-6 w-6 text-primary" />
            <span>Agenda</span>
          </Button>
          
          <Button
            variant="outline"
            className="h-auto py-6 flex flex-col items-center gap-2"
            onClick={() => navigate("/pro/prontuarios")}
          >
            <FileText className="h-6 w-6 text-primary" />
            <span>Prontuários</span>
          </Button>
          
          <Button
            variant="outline"
            className="h-auto py-6 flex flex-col items-center gap-2"
            onClick={() => navigate("/pro/financeiro")}
          >
            <DollarSign className="h-6 w-6 text-primary" />
            <span>Financeiro</span>
          </Button>
        </section>

        {/* Upcoming Sessions */}
        <section>
          <Card className="card-premium">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Próximas Sessões
              </CardTitle>
              <CardDescription>Sessões agendadas para hoje</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingSessions.map((session, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 rounded-xl bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Video className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{session.patient}</p>
                        <p className="text-sm text-muted-foreground">
                          {session.type}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{session.time}</p>
                      <Button size="sm" variant="outline" className="mt-1">
                        Iniciar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
