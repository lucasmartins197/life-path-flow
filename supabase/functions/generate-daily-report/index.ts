import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const today = new Date().toISOString().split("T")[0];

    // Check if report already exists for today
    const { data: existing } = await supabase
      .from("daily_reports")
      .select("*")
      .eq("user_id", user.id)
      .eq("report_date", today)
      .maybeSingle();

    if (existing) {
      return new Response(JSON.stringify({ report: existing, cached: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch today's and recent data
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    const [profileRes, patientRes, nutritionRes, exerciseRes, trailRes, routineRes, financeRes, riskRes] = await Promise.all([
      supabase.from("profiles").select("full_name").eq("user_id", user.id).single(),
      supabase.from("patient_profiles").select("current_step, streak_days, goals").eq("user_id", user.id).single(),
      supabase.from("nutrition_logs").select("calories, protein, carbohydrates, fat, meal_type").eq("user_id", user.id).gte("logged_at", yesterday),
      supabase.from("exercise_logs").select("duration_minutes, calories_burned, intensity").eq("user_id", user.id).gte("logged_at", yesterday),
      supabase.from("trail_progress").select("is_completed, journey_steps(title, step_number)").eq("user_id", user.id),
      supabase.from("routine_days").select("*").eq("user_id", user.id).gte("date", sevenDaysAgo).order("date", { ascending: false }),
      supabase.from("finance_events").select("event_type, amount, is_completed").eq("user_id", user.id).gte("created_at", sevenDaysAgo),
      supabase.from("risk_signals").select("signal_type, severity, description").eq("user_id", user.id).eq("is_resolved", false).order("detected_at", { ascending: false }).limit(5),
    ]);

    const context = {
      name: profileRes.data?.full_name || "Usuário",
      patient: patientRes.data,
      nutrition_yesterday: nutritionRes.data || [],
      exercise_yesterday: exerciseRes.data || [],
      trail_progress: trailRes.data || [],
      routine_week: routineRes.data || [],
      finance_week: financeRes.data || [],
      active_risks: riskRes.data || [],
      today,
    };

    const systemPrompt = `Você é Lia, assistente terapêutica do app "Movimento Apostando na Vida" para recuperação de ludopatia.

Gere um relatório diário motivacional e clínico em JSON com esta estrutura:

{
  "greeting": "Saudação personalizada com nome do usuário e algo motivacional",
  "journey_summary": "Resumo curto do progresso na jornada dos 12 passos (1-2 frases)",
  "nutrition_summary": "Resumo da alimentação recente (1-2 frases)",
  "exercise_summary": "Resumo dos exercícios recentes (1-2 frases)",
  "routine_summary": "Resumo da adesão à rotina na semana (1-2 frases)",
  "risk_alert": "Alerta de risco se houver sinais ativos, ou null se tudo ok",
  "daily_tip": "Dica prática do dia relacionada à recuperação",
  "motivation_quote": "Frase motivacional curta",
  "overall_mood": "positivo|neutro|atencao|critico",
  "priority_actions": ["Ação prioritária 1", "Ação prioritária 2", "Ação prioritária 3"],
  "score": número de 0 a 100 representando o estado geral
}

Regras:
- Seja empático, acolhedor e nunca julgue
- Para dados ausentes, encoraje o registro sem criticar
- Se detectar risco ativo, priorize no relatório
- Máximo 2 frases por campo de resumo
- Fale em português brasileiro informal mas respeitoso`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Gere o relatório diário:\n${JSON.stringify(context, null, 2)}` },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI error:", aiResponse.status, errText);
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit. Tente novamente em instantes." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices[0]?.message?.content;

    let parsed;
    try { parsed = JSON.parse(content); } catch { parsed = { greeting: content }; }

    // Save to daily_reports
    const reportData = {
      user_id: user.id,
      report_date: today,
      journey_summary: { text: parsed.journey_summary },
      nutrition_summary: { text: parsed.nutrition_summary },
      exercise_summary: { text: parsed.exercise_summary },
      routine_summary: { text: parsed.routine_summary },
      risk_assessment: { alert: parsed.risk_alert, mood: parsed.overall_mood },
      ai_recommendations: parsed.priority_actions || [],
      overall_score: parsed.score || null,
    };

    const { data: savedReport, error: saveError } = await supabase
      .from("daily_reports")
      .insert(reportData)
      .select()
      .single();

    if (saveError) console.error("Save error:", saveError);

    return new Response(JSON.stringify({
      report: savedReport || reportData,
      ai_data: parsed,
      cached: false,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Daily report error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
