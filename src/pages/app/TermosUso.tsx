import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { BottomNavigation } from "@/components/BottomNavigation";

export default function TermosUso() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="bg-card border-b px-5 pt-8 pb-5">
        <div className="max-w-lg mx-auto">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-muted-foreground mb-4 text-sm">
            <ChevronLeft className="h-4 w-4" /> Voltar
          </button>
          <h1 className="text-2xl font-bold">Termos de Uso</h1>
        </div>
      </header>
      <main className="max-w-lg mx-auto px-5 pt-6 space-y-6 text-sm text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-base font-bold text-foreground mb-2">1. Aceitação dos Termos</h2>
          <p>Ao utilizar o aplicativo Stake Real, você concorda com estes Termos de Uso. O app é operado pela Clínica Terapêutica Sobriety Ltda (CNPJ 46.115.913/0001-54).</p>
        </section>
        <section>
          <h2 className="text-base font-bold text-foreground mb-2">2. Descrição do Serviço</h2>
          <p>O Stake Real é uma plataforma de apoio à recuperação de ludopatia que oferece jornada terapêutica, rotina inteligente, terapia online e apoio jurídico. Não substitui tratamento médico profissional.</p>
        </section>
        <section>
          <h2 className="text-base font-bold text-foreground mb-2">3. Assinatura e Pagamentos</h2>
          <p>A assinatura é mensal no valor de R$ 79,90, cobrada automaticamente via cartão de crédito. O cancelamento pode ser feito a qualquer momento pelo app.</p>
        </section>
        <section>
          <h2 className="text-base font-bold text-foreground mb-2">4. Responsabilidades do Usuário</h2>
          <p>O usuário é responsável por manter suas informações atualizadas e pelo uso adequado da plataforma. Conteúdo ofensivo ou inapropriado na comunidade será removido.</p>
        </section>
        <section>
          <h2 className="text-base font-bold text-foreground mb-2">5. Limitação de Responsabilidade</h2>
          <p>O Stake Real não se responsabiliza por decisões tomadas com base nas informações fornecidas. Sempre consulte profissionais de saúde qualificados.</p>
        </section>
        <section>
          <h2 className="text-base font-bold text-foreground mb-2">6. Contato</h2>
          <p>Em caso de dúvidas: contato@apostandonavida.com.br</p>
        </section>
      </main>
      <BottomNavigation />
    </div>
  );
}
