const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { debt_amount, interest_rate, monthly_income, monthly_payment } = await req.json();

    if (!debt_amount) {
      return new Response(JSON.stringify({ error: "Valor da dívida é obrigatório" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const prompt = `Você é um simulador financeiro especializado em renegociação de dívidas no Brasil.

Dados do usuário:
- Valor da dívida: R$ ${debt_amount}
- Taxa de juros mensal: ${interest_rate || 2}%
- Renda mensal: R$ ${monthly_income || 0}
- Parcela desejada: R$ ${monthly_payment || 0}

Calcule uma proposta realista de renegociação considerando:
1. Desconto típico em renegociações (30-70% dependendo do caso)
2. Parcela máxima de 30% da renda se informada
3. Prazos típicos de 12 a 60 meses

Responda APENAS com JSON válido neste formato (sem markdown, sem texto extra):
{
  "estimated_monthly_payment": number,
  "estimated_months": number,
  "total_paid": number,
  "savings_percentage": number,
  "recommendation": "string com recomendação breve em português"
}`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": Deno.env.get("ANTHROPIC_API_KEY")!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 512,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const aiData = await response.json();
    const content = aiData.content?.[0]?.text || "";

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("IA não retornou JSON válido");

    const result = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("simulate-debt error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
