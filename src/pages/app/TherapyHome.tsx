import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  ArrowLeft, 
  Search,
  Star,
  Video,
  Calendar,
  MessageCircle
} from "lucide-react";
import { FloatingAIButton } from "@/components/FloatingAIButton";
import { useState } from "react";

// Mock data - will be replaced with real data
const professionals = [
  {
    id: "1",
    name: "Dra. Ana Beatriz",
    specialty: "Psicóloga Clínica",
    rating: 4.9,
    totalSessions: 234,
    hourlyRate: 150,
    isOnline: true,
    avatarUrl: null,
    bio: "Especialista em dependência química e transtornos de ansiedade."
  },
  {
    id: "2",
    name: "Dr. Carlos Eduardo",
    specialty: "Psiquiatra",
    rating: 4.8,
    totalSessions: 189,
    hourlyRate: 200,
    isOnline: true,
    avatarUrl: null,
    bio: "15 anos de experiência em tratamento de dependências."
  },
  {
    id: "3",
    name: "Dra. Mariana Costa",
    specialty: "Terapeuta Ocupacional",
    rating: 4.7,
    totalSessions: 156,
    hourlyRate: 120,
    isOnline: false,
    avatarUrl: null,
    bio: "Foco em reabilitação e construção de rotinas saudáveis."
  },
];

export default function TherapyHome() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProfessionals = professionals.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.specialty.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const onlineProfessionals = professionals.filter((p) => p.isOnline);

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
            Terapia
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container px-4 py-6 pb-24">
        {/* Search */}
        <section className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Buscar profissional..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 input-premium"
            />
          </div>
        </section>

        {/* Online Now */}
        {onlineProfessionals.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <h2 className="text-lg font-display font-semibold">
                Online Agora
              </h2>
              <span className="text-sm text-muted-foreground">
                ({onlineProfessionals.length})
              </span>
            </div>
            
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {onlineProfessionals.map((pro) => (
                <Card 
                  key={pro.id}
                  className="card-premium shrink-0 w-48 cursor-pointer"
                  onClick={() => navigate(`/app/terapia/${pro.id}`)}
                >
                  <CardContent className="p-4">
                    <div className="relative mb-3">
                      <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-xl font-bold text-primary">
                          {pro.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                        </span>
                      </div>
                      <div className="absolute bottom-0 right-1/2 translate-x-6 w-4 h-4 rounded-full bg-green-500 border-2 border-background" />
                    </div>
                    <h3 className="font-semibold text-center truncate">
                      {pro.name}
                    </h3>
                    <p className="text-xs text-muted-foreground text-center truncate">
                      {pro.specialty}
                    </p>
                    <div className="flex items-center justify-center gap-1 mt-2">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{pro.rating}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* All Professionals */}
        <section>
          <h2 className="text-lg font-display font-semibold mb-4">
            Todos os Profissionais
          </h2>
          
          <div className="space-y-4">
            {filteredProfessionals.map((pro) => (
              <Card 
                key={pro.id}
                className="card-premium cursor-pointer"
                onClick={() => navigate(`/app/terapia/${pro.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className="relative shrink-0">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-lg font-bold text-primary">
                          {pro.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                        </span>
                      </div>
                      {pro.isOnline && (
                        <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-green-500 border-2 border-background" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold">{pro.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {pro.specialty}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{pro.rating}</span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {pro.bio}
                      </p>
                      
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span>{pro.totalSessions} sessões</span>
                        </div>
                        <span className="font-semibold text-primary">
                          R$ {pro.hourlyRate}/sessão
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Calendar className="h-4 w-4 mr-2" />
                      Agendar
                    </Button>
                    {pro.isOnline && (
                      <Button size="sm" className="flex-1">
                        <Video className="h-4 w-4 mr-2" />
                        Ligar
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>

      <FloatingAIButton />
    </div>
  );
}
