import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Search,
  Star,
  Calendar,
  ChevronLeft,
  Filter,
  Video,
} from "lucide-react";
import { BottomNavigation } from "@/components/BottomNavigation";
import { PortoSeguroButton } from "@/components/PortoSeguroButton";
import { AIChatPanel } from "@/components/chat/AIChatPanel";

const professionals = [
  {
    id: "1",
    name: "Dra. Ana Beatriz",
    specialty: "Psicóloga Clínica",
    tag: "Dependência química",
    rating: 4.9,
    totalSessions: 234,
    hourlyRate: 150,
    isOnline: true,
    bio: "Especialista em dependência química e transtornos de ansiedade. 12 anos de experiência clínica.",
  },
  {
    id: "2",
    name: "Dr. Carlos Eduardo",
    specialty: "Psiquiatra",
    tag: "Compulsão",
    rating: 4.8,
    totalSessions: 189,
    hourlyRate: 200,
    isOnline: true,
    bio: "15 anos de experiência em tratamento de dependências e transtornos do humor.",
  },
  {
    id: "3",
    name: "Dra. Mariana Costa",
    specialty: "Terapeuta Ocupacional",
    tag: "Reabilitação",
    rating: 4.7,
    totalSessions: 156,
    hourlyRate: 120,
    isOnline: false,
    bio: "Foco em reabilitação e construção de rotinas saudáveis para recuperação.",
  },
];

function Initials({ name }: { name: string }) {
  const parts = name.split(" ");
  return <>{parts[0][0]}{parts[1]?.[0]}</>;
}

export default function TherapyHome() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState("all");

  const filtered = professionals.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.specialty.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background safe-top pb-28">

      {/* ── Header ──────────────────────────────── */}
      <header className="bg-card border-b border-border/60 px-5 pt-8 pb-5">
        <div className="max-w-lg mx-auto">
          <button
            onClick={() => navigate("/app")}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors mb-5 text-sm"
          >
            <ChevronLeft className="h-4 w-4" />
            Home
          </button>
          <h1 className="text-2xl font-bold text-foreground">Terapia</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Psicólogos, psiquiatras e terapeutas</p>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-5 pt-6 space-y-6">

        {/* ── Search ────────────────────────────── */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar profissional..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 input-premium"
          />
        </div>

        {/* ── Online agora ──────────────────────── */}
        <section>
          <p className="section-title flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary inline-block animate-pulse" />
            Online agora
          </p>
          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
            {professionals.filter((p) => p.isOnline).map((pro) => (
              <button
                key={pro.id}
                className="card-premium p-4 shrink-0 w-44 text-center hover:scale-[1.02] active:scale-[0.98] transition-transform"
              >
                <div className="relative w-14 h-14 mx-auto mb-3">
                  <div className="w-full h-full rounded-full bg-secondary flex items-center justify-center text-base font-bold text-foreground">
                    <Initials name={pro.name} />
                  </div>
                  <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-primary border-2 border-card" />
                </div>
                <p className="font-semibold text-sm text-foreground truncate">{pro.name}</p>
                <p className="text-xs text-muted-foreground truncate mt-0.5">{pro.specialty}</p>
                <div className="flex items-center justify-center gap-1 mt-2">
                  <Star className="h-3 w-3 text-warning fill-warning" />
                  <span className="text-xs font-semibold">{pro.rating}</span>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* ── All professionals ─────────────────── */}
        <section>
          <p className="section-title">Todos os profissionais</p>
          <div className="space-y-3">
            {filtered.map((pro) => (
              <div key={pro.id} className="card-premium p-4">
                <div className="flex gap-4">
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center text-sm font-bold text-foreground">
                      <Initials name={pro.name} />
                    </div>
                    {pro.isOnline && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-primary border-2 border-card" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-foreground text-sm">{pro.name}</p>
                        <p className="text-xs text-muted-foreground">{pro.specialty}</p>
                      </div>
                      <div className="flex items-center gap-0.5 shrink-0">
                        <Star className="h-3.5 w-3.5 text-warning fill-warning" />
                        <span className="text-sm font-semibold">{pro.rating}</span>
                      </div>
                    </div>

                    <span className="inline-block mt-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-secondary text-muted-foreground uppercase tracking-wide">
                      {pro.tag}
                    </span>

                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{pro.bio}</p>

                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-muted-foreground">{pro.totalSessions} sessões</span>
                      <span className="text-sm font-bold text-foreground">R$ {pro.hourlyRate}<span className="font-normal text-muted-foreground">/sessão</span></span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-4">
                  <button className="btn-cta flex-1 py-2.5 text-xs">
                    <Calendar className="h-3.5 w-3.5" />
                    Agendar
                  </button>
                  {pro.isOnline && (
                    <button className="btn-secondary flex-1 py-2.5 text-xs">
                      <Video className="h-3.5 w-3.5" />
                      Videochamada
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {filtered.length === 0 && (
          <div className="card-premium p-10 text-center">
            <p className="text-muted-foreground text-sm">Nenhum profissional encontrado.</p>
          </div>
        )}

      </main>

      <BottomNavigation />
      <PortoSeguroButton />
      <AIChatPanel />
    </div>
  );
}
