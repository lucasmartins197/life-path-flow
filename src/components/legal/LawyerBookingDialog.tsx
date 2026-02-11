import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Shield, Scale } from "lucide-react";

interface LawyerBookingDialogProps {
  lawyer: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LawyerBookingDialog({ lawyer, open, onOpenChange }: LawyerBookingDialogProps) {
  const [patientName, setPatientName] = useState("");
  const [patientCpf, setPatientCpf] = useState("");
  const [patientCity, setPatientCity] = useState("");
  const [debtDescription, setDebtDescription] = useState("");
  const [approximateIncome, setApproximateIncome] = useState("");
  const [lgpdConsent, setLgpdConsent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!lgpdConsent) {
      toast({ variant: "destructive", title: "Consentimento obrigatório", description: "Você precisa autorizar o compartilhamento de dados." });
      return;
    }

    if (!patientName.trim() || !patientCpf.trim() || !patientCity.trim() || !debtDescription.trim()) {
      toast({ variant: "destructive", title: "Preencha todos os campos obrigatórios" });
      return;
    }

    if (!user) {
      toast({ variant: "destructive", title: "Faça login para agendar" });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.from("legal_consultations").insert({
        patient_id: user.id,
        lawyer_id: lawyer.user_id,
        patient_name: patientName.trim(),
        patient_cpf: patientCpf.trim(),
        patient_city: patientCity.trim(),
        debt_description: debtDescription.trim(),
        approximate_income: approximateIncome ? parseFloat(approximateIncome) : null,
        lgpd_consent: true,
      });

      if (error) throw error;

      toast({ title: "Solicitação enviada!", description: "O advogado receberá sua solicitação e entrará em contato." });
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      toast({ variant: "destructive", title: "Erro ao enviar solicitação" });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="mx-auto w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
            <Scale className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle>Agendar Consulta Jurídica</DialogTitle>
          <DialogDescription>
            Com {lawyer.profiles?.full_name || "Advogado"} — OAB/{lawyer.council_state} {lawyer.council_number}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Nome completo *</Label>
            <Input id="name" value={patientName} onChange={(e) => setPatientName(e.target.value)} placeholder="Seu nome" className="input-premium" required maxLength={100} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cpf">CPF *</Label>
            <Input id="cpf" value={patientCpf} onChange={(e) => setPatientCpf(e.target.value)} placeholder="000.000.000-00" className="input-premium" required maxLength={14} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="city">Cidade *</Label>
            <Input id="city" value={patientCity} onChange={(e) => setPatientCity(e.target.value)} placeholder="Sua cidade" className="input-premium" required maxLength={100} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="debt">Descrição da dívida / situação *</Label>
            <Textarea id="debt" value={debtDescription} onChange={(e) => setDebtDescription(e.target.value)} placeholder="Descreva brevemente sua situação..." className="input-premium resize-none" rows={3} required maxLength={1000} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="income">Renda aproximada (R$)</Label>
            <Input id="income" type="number" value={approximateIncome} onChange={(e) => setApproximateIncome(e.target.value)} placeholder="Ex: 3000" className="input-premium" min="0" />
          </div>

          <div className="rounded-xl bg-accent/50 p-4">
            <div className="flex items-start gap-3">
              <Checkbox id="lgpd" checked={lgpdConsent} onCheckedChange={(v) => setLgpdConsent(!!v)} className="mt-0.5" />
              <label htmlFor="lgpd" className="text-sm text-muted-foreground cursor-pointer">
                <Shield className="h-4 w-4 inline mr-1 text-primary" />
                Autorizo compartilhar meus dados com o profissional selecionado, conforme a Lei Geral de Proteção de Dados (LGPD).
              </label>
            </div>
          </div>

          <Button type="submit" className="w-full btn-premium-primary" disabled={isLoading || !lgpdConsent}>
            {isLoading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Enviando...</>
            ) : (
              "Enviar Solicitação"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
