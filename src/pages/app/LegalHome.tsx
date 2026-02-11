import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Scale, Search, MapPin, Filter, Star, Clock, Shield, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BottomNavigation } from "@/components/BottomNavigation";
import { AIChatPanel } from "@/components/chat/AIChatPanel";
import { DebtSimulator } from "@/components/legal/DebtSimulator";
import { LawyerBookingDialog } from "@/components/legal/LawyerBookingDialog";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const SPECIALTIES = [
  "Direito do Consumidor",
  "Renegociação de Dívidas",
  "Direito Bancário",
  "Superendividamento",
  "Recuperação Judicial",
];

export default function LegalHome() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("");
  const [showSimulator, setShowSimulator] = useState(false);
  const [selectedLawyer, setSelectedLawyer] = useState<any>(null);

  const { data: lawyers = [], isLoading } = useQuery({
    queryKey: ["lawyers", searchTerm, cityFilter, specialtyFilter],
    queryFn: async () => {
      let query = supabase
        .from("professional_profiles")
        .select("*, profiles!inner(full_name, avatar_url, city, phone)")
        .eq("professional_type", "advogado")
        .eq("is_approved", true);

      if (specialtyFilter) {
        query = query.ilike("specialty", `%${specialtyFilter}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      let filtered = data || [];

      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter((l: any) =>
          l.profiles?.full_name?.toLowerCase().includes(term) ||
          l.specialty?.toLowerCase().includes(term)
        );
      }

      if (cityFilter) {
        const city = cityFilter.toLowerCase();
        filtered = filtered.filter((l: any) =>
          l.profiles?.city?.toLowerCase().includes(city)
        );
      }

      return filtered;
    },
  });

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="bg-primary text-primary-foreground">
        <div className="container px-4 py-6">
          <div className="flex items-center gap-3 mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/app/saude")}
              className="text-white/80 hover:text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-display font-bold">Apoio Jurídico</h1>
              <p className="text-primary-foreground/70 text-sm">
                Conecte-se com advogados especializados
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container px-4 -mt-4 space-y-4">
        {/* Debt Simulator CTA */}
        <button
          onClick={() => setShowSimulator(!showSimulator)}
          className="w-full card-premium p-4 flex items-center gap-4 text-left"
        >
          <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
            <Calculator className="h-6 w-6 text-accent-foreground" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">Simulador de Renegociação</h3>
            <p className="text-sm text-muted-foreground">
              Calcule prazos e parcelas estimadas com IA
            </p>
          </div>
          <ArrowLeft className="h-5 w-5 text-muted-foreground rotate-180" />
        </button>

        {showSimulator && <DebtSimulator />}

        {/* Search & Filters */}
        <Card className="card-premium">
          <CardContent className="p-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar advogado por nome ou área..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 input-premium"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                <Input
                  placeholder="Cidade"
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                  className="pl-10 input-premium"
                />
              </div>
              <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
                <SelectTrigger className="input-premium">
                  <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Especialidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {SPECIALTIES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Lawyers List */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Scale className="h-5 w-5 text-primary" />
            Advogados Disponíveis
          </h2>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton h-32 rounded-2xl" />
              ))}
            </div>
          ) : lawyers.length === 0 ? (
            <Card className="card-premium">
              <CardContent className="p-8 text-center">
                <Scale className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">
                  Nenhum advogado encontrado com os filtros selecionados.
                </p>
              </CardContent>
            </Card>
          ) : (
            lawyers.map((lawyer: any) => (
              <Card key={lawyer.id} className="card-premium">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Scale className="h-7 w-7 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">
                        {lawyer.profiles?.full_name || "Advogado"}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        OAB/{lawyer.council_state} {lawyer.council_number}
                      </p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        <Badge variant="secondary" className="text-xs">
                          {lawyer.specialty}
                        </Badge>
                        {lawyer.profiles?.city && (
                          <Badge variant="outline" className="text-xs">
                            <MapPin className="h-3 w-3 mr-1" />
                            {lawyer.profiles.city}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          {lawyer.rating > 0 && (
                            <span className="flex items-center gap-1">
                              <Star className="h-3.5 w-3.5 text-warning fill-warning" />
                              {Number(lawyer.rating).toFixed(1)}
                            </span>
                          )}
                          <span className="font-semibold text-foreground">
                            R$ {Number(lawyer.hourly_rate).toFixed(0)}
                          </span>
                        </div>
                        <Button
                          size="sm"
                          className="btn-premium-primary text-xs px-4 py-1 h-8"
                          onClick={() => setSelectedLawyer(lawyer)}
                        >
                          <Clock className="h-3.5 w-3.5 mr-1" />
                          Agendar
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </section>

        {/* LGPD Notice */}
        <div className="rounded-xl bg-accent/50 p-4 flex gap-3">
          <Shield className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground">
            Seus dados só serão compartilhados com o profissional selecionado
            mediante seu consentimento explícito, conforme a LGPD.
          </p>
        </div>
      </main>

      {selectedLawyer && (
        <LawyerBookingDialog
          lawyer={selectedLawyer}
          open={!!selectedLawyer}
          onOpenChange={(open) => !open && setSelectedLawyer(null)}
        />
      )}

      <BottomNavigation />
      <AIChatPanel />
    </div>
  );
}
