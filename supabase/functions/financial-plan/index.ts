const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  try {
    const { income, fixed_expenses, debts, goal, user_name } = await req.json();

    const totalExpenses = Array.isArray(fixed_expenses) 
      ? fixed_expenses.reduce((s: number, e: any) => s + (e.amount || 0), 0) 
      : 0;
    const totalDebts = Array.isArray(debts)
      ? debts.reduce((s: number, d: any) => s + (d.total || 0), 0)
      : 0;
    const monthlyIncome = income?.monthly || 0;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": Deno.env.get("ANTHROPIC_API_KEY")!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        messages: [{
          role: "user",
          content: `Você é um consultor financeiro especializado em recuperação de ludopatia no Brasil.

Dados financeiros de ${user_name || "usuário"}:
- Renda mensal: R$ ${monthlyIncome}
- Despesas fixas: R$ ${totalExpenses}
- Total de dívidas: R$ ${totalDebts}
- Meta: ${goal || "organizar finanças"}

Crie um plano financeiro realista. Responda APENAS com JSON válido:
{
  "resumo": "análise breve da situação",
  "disponivel_mensal": number,
  "plano_mensal": ["passo 1", "passo 2", "passo 3"],
  "dicas": ["dica 1", "dica 2", "dica 3"],
  "prazo_estimado": "X meses"
}`
        }],
      }),
    });

    const data = await response.json();
    const content = data.content?.[0]?.text || "{}";
    const clean = content.replace(/```json|```/g, "").trim();
    let plan = {};
    try { plan = JSON.parse(clean); } catch(e) { plan = { resumo: content }; }

    return new Response(JSON.stringify(plan), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("financial-plan error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
