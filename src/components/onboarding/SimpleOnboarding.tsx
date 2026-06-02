import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const GAMBLING_DURATIONS = [
  "Menos de 6 meses",
  "6 meses a 1 ano",
  "1 a 3 anos",
  "3 a 5 anos",
  "Mais de 5 anos",
];

const RECOVERY_SITUATIONS = [
  "Ainda apostando",
  "Tentando parar",
  "Parei recentemente",
  "Em recuperação há meses",
  "Recaí e quero recomeçar",
];

const LOSS_RANGES = [
  "Até R$ 5.000",
  "R$ 5.000 a R$ 20.000",
  "R$ 20.000 a R$ 50.000",
  "R$ 50.000 a R$ 100.000",
  "Mais de R$ 100.000",
  "Prefiro não informar",
];

const GAMBLING_TYPES = [
  "Apostas esportivas",
  "Cassino online",
  "Tigrinho / slots",
  "Loterias",
  "Poker",
  "Bingo",
  "Outros",
];

const STOP_ATTEMPTS = ["Nunca tentei", "1 a 2 vezes", "3 a 5 vezes", "Mais de 5 vezes"];

const MENTAL_HEALTH = [
  "Estou bem",
  "Ansiedade leve",
  "Ansiedade ou depressão moderada",
  "Pensamentos graves / preciso de ajuda",
];

const MOTIVATIONS = [
  "Minha família",
  "Minha saúde mental",
  "Minha situação financeira",
  "Recuperar minha dignidade",
  "Meus filhos",
  "Outro",
];

export function SimpleOnboarding({ onComplete }: { onComplete: () => void }) {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [saving, setSaving] = useState(false);

  // Step 1
  const [fullName, setFullName] = useState("");
  const [city, setCity] = useState("");
  const [gamblingDuration, setGamblingDuration] = useState("");
  const [recoverySituation, setRecoverySituation] = useState("");

  // Step 2
  const [totalLoss, setTotalLoss] = useState("");
  const [gamblingTypes, setGamblingTypes] = useState<string[]>([]);
  const [stopAttempts, setStopAttempts] = useState("");
  const [familyAware, setFamilyAware] = useState("");
  const [mentalHealth, setMentalHealth] = useState("");
  const [motivation, setMotivation] = useState("");

  // Step 3
  const [signature, setSignature] = useState("");

  function toggleType(t: string) {
    setGamblingTypes((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  }

  async function handleStep1() {
    if (!user) return;
    if (!fullName.trim() || !city.trim() || !gamblingDuration || !recoverySituation) {
      toast({ title: "Preencha todos os campos", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName.trim().slice(0, 100),
        city: city.trim().slice(0, 80),
        gambling_duration: gamblingDuration,
        recovery_situation: recoverySituation,
      })
      .eq("user_id", user.id);
    setSaving(false);
    if (error) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
      return;
    }
    setStep(2);
  }

  async function handleStep2() {
    if (!user) return;
    if (
      !totalLoss ||
      gamblingTypes.length === 0 ||
      !stopAttempts ||
      !familyAware ||
      !mentalHealth ||
      !motivation
    ) {
      toast({ title: "Preencha todos os campos", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("onboarding_clinico").upsert(
      {
        user_id: user.id,
        total_loss_range: totalLoss,
        gambling_types: gamblingTypes,
        stop_attempts: stopAttempts,
        family_aware: familyAware,
        mental_health_risk: mentalHealth,
        main_motivation: motivation,
      },
      { onConflict: "user_id" }
    );
    setSaving(false);
    if (error) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
      return;
    }
    setStep(3);
  }

  async function handleStep3() {
    if (!user) return;
    if (signature.trim().toLowerCase() !== fullName.trim().toLowerCase()) {
      toast({
        title: "Assinatura inválida",
        description: "Digite seu nome completo exatamente como informado.",
        variant: "destructive",
      });
      return;
    }
    setSaving(true);
    const { error: commitErr } = await supabase.from("recovery_commitments").upsert(
      {
        user_id: user.id,
        signature_name: signature.trim().slice(0, 120),
      },
      { onConflict: "user_id" }
    );
    if (commitErr) {
      setSaving(false);
      toast({ title: "Erro ao assinar", description: commitErr.message, variant: "destructive" });
      return;
    }
    const { error: profErr } = await supabase
      .from("profiles")
      .update({ onboarding_completed: true })
      .eq("user_id", user.id);
    setSaving(false);
    if (profErr) {
      toast({ title: "Erro ao concluir", description: profErr.message, variant: "destructive" });
      return;
    }
    await refreshProfile();
    onComplete();
    navigate("/app", { replace: true });
  }

  const progress = step === 1 ? 33 : step === 2 ? 66 : 100;

  return (
    <div className="min-h-screen bg-background safe-top safe-bottom px-4 py-6 flex items-start justify-center">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-3">
          <Progress value={progress} className="h-1.5" />
          <div className="text-xs text-muted-foreground">Etapa {step} de 3</div>
          {step === 1 && (
            <>
              <CardTitle>Seus dados</CardTitle>
              <CardDescription>Vamos começar com algumas informações sobre você.</CardDescription>
            </>
          )}
          {step === 2 && (
            <>
              <CardTitle>Sobre suas apostas</CardTitle>
              <CardDescription>
                Essas respostas são confidenciais e ajudam a personalizar seu acompanhamento.
              </CardDescription>
            </>
          )}
          {step === 3 && (
            <>
              <CardTitle>Compromisso de Recuperação</CardTitle>
              <CardDescription>Leia com atenção e assine digitando seu nome completo.</CardDescription>
            </>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {step === 1 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="fullName">Nome completo</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  maxLength={100}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  value={city}
                  maxLength={80}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Há quanto tempo você aposta?</Label>
                <Select value={gamblingDuration} onValueChange={setGamblingDuration}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {GAMBLING_DURATIONS.map((o) => (
                      <SelectItem key={o} value={o}>
                        {o}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Situação atual</Label>
                <Select value={recoverySituation} onValueChange={setRecoverySituation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {RECOVERY_SITUATIONS.map((o) => (
                      <SelectItem key={o} value={o}>
                        {o}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full" onClick={handleStep1} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Continuar"}
              </Button>
            </>
          )}

          {step === 2 && (
            <>
              <div className="space-y-2">
                <Label>Quanto você perdeu financeiramente (estimativa)?</Label>
                <Select value={totalLoss} onValueChange={setTotalLoss}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {LOSS_RANGES.map((o) => (
                      <SelectItem key={o} value={o}>
                        {o}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tipos de jogos (selecione todos que se aplicam)</Label>
                <div className="grid grid-cols-1 gap-2">
                  {GAMBLING_TYPES.map((t) => (
                    <label
                      key={t}
                      className="flex items-center gap-3 rounded-md border p-3 cursor-pointer hover:bg-accent/40"
                    >
                      <Checkbox
                        checked={gamblingTypes.includes(t)}
                        onCheckedChange={() => toggleType(t)}
                      />
                      <span className="text-sm">{t}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Quantas vezes já tentou parar?</Label>
                <Select value={stopAttempts} onValueChange={setStopAttempts}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {STOP_ATTEMPTS.map((o) => (
                      <SelectItem key={o} value={o}>
                        {o}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Sua família sabe?</Label>
                <Select value={familyAware} onValueChange={setFamilyAware}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sim">Sim</SelectItem>
                    <SelectItem value="nao">Não</SelectItem>
                    <SelectItem value="parcialmente">Parcialmente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Como está sua saúde mental?</Label>
                <Select value={mentalHealth} onValueChange={setMentalHealth}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {MENTAL_HEALTH.map((o) => (
                      <SelectItem key={o} value={o}>
                        {o}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Principal motivação para parar</Label>
                <Select value={motivation} onValueChange={setMotivation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {MOTIVATIONS.map((o) => (
                      <SelectItem key={o} value={o}>
                        {o}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)} disabled={saving}>
                  Voltar
                </Button>
                <Button className="flex-1" onClick={handleStep2} disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Continuar"}
                </Button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="rounded-md border bg-muted/40 p-4 text-sm leading-relaxed space-y-3">
                <p>
                  Eu, <strong>{fullName || "[seu nome]"}</strong>, reconheço que o vício em apostas
                  tem causado sofrimento à minha vida e às pessoas que amo.
                </p>
                <p>
                  Me comprometo a percorrer essa jornada com honestidade, disciplina e coragem — a
                  usar as ferramentas deste programa, a ser transparente com meu acompanhamento e a
                  pedir ajuda quando precisar.
                </p>
                <p>Sei que a recuperação é um caminho, e dou hoje o primeiro passo.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="signature">Assine digitando seu nome completo</Label>
                <Input
                  id="signature"
                  value={signature}
                  maxLength={120}
                  onChange={(e) => setSignature(e.target.value)}
                  placeholder={fullName}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(2)} disabled={saving}>
                  Voltar
                </Button>
                <Button className="flex-1" onClick={handleStep3} disabled={saving}>
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Assinar meu compromisso"
                  )}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
