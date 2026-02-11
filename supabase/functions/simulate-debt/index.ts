import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { debt_amount, interest_rate, monthly_income } = await req.json();

    if (!debt_amount || !interest_rate || !monthly_income) {
      return new Response(JSON.stringify({ error: "Missing fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    const prompt = `Você é um simulador financeiro especializado em renegociação de dívidas no Brasil.

Dados do usuário:
- Valor da dívida: R$ ${debt_amount}
- Taxa de juros mensal: ${interest_rate}%
- Renda mensal: R$ ${monthly_income}

Calcule uma proposta realista de renegociação considerando:
1. Desconto típico em renegociações (30-70% dependendo do caso)
2. Parcela máxima de 30% da renda
3. Prazos típicos de 12 a 60 meses

Responda APENAS com um JSON válido neste formato exato (sem markdown, sem texto extra):
{
  "estimated_monthly_payment": number,
  "estimated_months": number,
  "total_paid": number,
  "savings_percentage": number,
  "recommendation": "string com recomendação breve em português"
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
      }),
    });

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content || "";

    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("AI did not return valid JSON");
    }

    const result = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
