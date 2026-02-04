import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, Stethoscope, Shield } from "lucide-react";

const BRAZILIAN_STATES = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
  "RS", "RO", "RR", "SC", "SP", "SE", "TO"
];

export default function ProfessionalRegister() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Step 1: Account
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");

  // Step 2: Professional info
  const [professionalType, setProfessionalType] = useState<string>("");
  const [councilNumber, setCouncilNumber] = useState("");
  const [councilState, setCouncilState] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [bio, setBio] = useState("");
  const [hourlyRate, setHourlyRate] = useState("150");

  async function handleStep1(e: React.FormEvent) {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "As senhas não coincidem.",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "A senha deve ter pelo menos 6 caracteres.",
      });
      return;
    }

    setStep(2);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!professionalType || !councilNumber || !councilState || !specialty) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
      });
      return;
    }

    setIsLoading(true);

    // Create user account
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          full_name: fullName,
        },
      },
    });

    if (authError) {
      toast({
        variant: "destructive",
        title: "Erro no cadastro",
        description: authError.message,
      });
      setIsLoading(false);
      return;
    }

    if (authData.user) {
      // Add professional role
      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({ user_id: authData.user.id, role: "professional" });

      if (roleError) {
        console.error("Error adding role:", roleError);
      }

      // Create professional profile
      const { error: profileError } = await supabase
        .from("professional_profiles")
        .insert({
          user_id: authData.user.id,
          professional_type: professionalType as any,
          council_number: councilNumber,
          council_state: councilState,
          specialty,
          bio,
          hourly_rate: parseFloat(hourlyRate),
          is_approved: false,
          council_verified: false,
        });

      if (profileError) {
        console.error("Error creating professional profile:", profileError);
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Erro ao criar perfil profissional.",
        });
      } else {
        toast({
          title: "Cadastro realizado!",
          description: "Verifique seu email e aguarde a aprovação do seu registro profissional.",
        });
        navigate("/auth");
      }
    }

    setIsLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg border-0 shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Stethoscope className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-display">
            Cadastro Profissional
          </CardTitle>
          <CardDescription>
            {step === 1 
              ? "Crie sua conta profissional" 
              : "Informações do registro profissional"}
          </CardDescription>
          <div className="flex justify-center gap-2 mt-4">
            <div className={`w-3 h-3 rounded-full ${step >= 1 ? "bg-primary" : "bg-muted"}`} />
            <div className={`w-3 h-3 rounded-full ${step >= 2 ? "bg-primary" : "bg-muted"}`} />
          </div>
        </CardHeader>
        <CardContent>
          {step === 1 ? (
            <form onSubmit={handleStep1} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Nome completo *</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Dr. João Silva"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="input-premium"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input-premium"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="input-premium"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar senha *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Repita a senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="input-premium"
                />
              </div>

              <Button type="submit" className="w-full btn-premium-primary">
                Continuar
              </Button>

              <Link to="/auth" className="block">
                <Button variant="ghost" className="w-full">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar para login
                </Button>
              </Link>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Tipo de Profissional *</Label>
                <Select value={professionalType} onValueChange={setProfessionalType}>
                  <SelectTrigger className="input-premium">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="psicologo">Psicólogo(a)</SelectItem>
                    <SelectItem value="psiquiatra">Psiquiatra</SelectItem>
                    <SelectItem value="terapeuta">Terapeuta</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="councilNumber">Nº do Conselho *</Label>
                  <Input
                    id="councilNumber"
                    type="text"
                    placeholder="CRP/CRM"
                    value={councilNumber}
                    onChange={(e) => setCouncilNumber(e.target.value)}
                    required
                    className="input-premium"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Estado *</Label>
                  <Select value={councilState} onValueChange={setCouncilState}>
                    <SelectTrigger className="input-premium">
                      <SelectValue placeholder="UF" />
                    </SelectTrigger>
                    <SelectContent>
                      {BRAZILIAN_STATES.map((state) => (
                        <SelectItem key={state} value={state}>{state}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialty">Especialidade *</Label>
                <Input
                  id="specialty"
                  type="text"
                  placeholder="Ex: Dependência química, TCC..."
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  required
                  className="input-premium"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hourlyRate">Valor da sessão (R$)</Label>
                <Input
                  id="hourlyRate"
                  type="number"
                  min="0"
                  step="10"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
                  className="input-premium"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Sobre você</Label>
                <Textarea
                  id="bio"
                  placeholder="Conte um pouco sobre sua experiência e abordagem..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  className="input-premium resize-none"
                />
              </div>

              <div className="rounded-lg bg-accent/50 p-4 flex gap-3">
                <Shield className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  Seu registro será validado junto ao conselho profissional antes da aprovação.
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1"
                >
                  Voltar
                </Button>
                <Button
                  type="submit"
                  className="flex-1 btn-premium-primary"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Cadastrando...
                    </>
                  ) : (
                    "Criar conta"
                  )}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
