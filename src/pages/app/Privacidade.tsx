import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { BottomNavigation } from "@/components/BottomNavigation";

export default function Privacidade() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="bg-card border-b px-5 pt-8 pb-5">
        <div className="max-w-lg mx-auto">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-muted-foreground mb-4 text-sm">
            <ChevronLeft className="h-4 w-4" /> Voltar
          </button>
          <h1 className="text-2xl font-bold">Política de Privacidade</h1>
        </div>
      </header>
      <main className="max-w-lg mx-auto px-5 pt-6 space-y-6 text-sm text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-base font-bold text-foreground mb-2">1. Dados Coletados</h2>
          <p>Coletamos nome, email, cidade, dados clínicos sobre o vício em apostas e informações de uso do app. Dados de pagamento são processados pelo Stripe e não armazenamos dados de cartão.</p>
        </section>
        <section>
          <h2 className="text-base font-bold text-foreground mb-2">2. Uso dos Dados</h2>
          <p>Seus dados são usados para personalizar sua jornada de recuperação, gerar prontuários clínicos e facilitar o contato com profissionais. Não vendemos seus dados a terceiros.</p>
        </section>
        <section>
          <h2 className="text-base font-bold text-foreground mb-2">3. Dados Sensíveis</h2>
          <p>Informações sobre sua saúde mental e histórico de apostas são tratadas com sigilo clínico, acessíveis apenas a você e aos profissionais vinculados ao seu atendimento.</p>
        </section>
        <section>
          <h2 className="text-base font-bold text-foreground mb-2">4. Contato Âncora</h2>
          <p>O contato âncora que você cadastrar receberá notificações automáticas conforme suas preferências. Você pode desativar essas notificações a qualquer momento.</p>
        </section>
        <section>
          <h2 className="text-base font-bold text-foreground mb-2">5. Seus Direitos (LGPD)</h2>
          <p>Você tem direito de acessar, corrigir ou excluir seus dados a qualquer momento. Solicitações: contato@apostandonavida.com.br</p>
        </section>
        <section>
          <h2 className="text-base font-bold text-foreground mb-2">6. Cookies e Rastreamento</h2>
          <p>Usamos apenas cookies essenciais para autenticação. Não utilizamos rastreadores de terceiros para publicidade.</p>
        </section>
      </main>
      <BottomNavigation />
    </div>
  );
}
