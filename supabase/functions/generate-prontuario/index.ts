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

    // Fetch ALL patient data in parallel
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const [
      profileRes, patientRes, nutritionRes, exerciseRes, 
      journeyStepsRes, trailRes, routineRes, financeRes,
      riskRes, bodyRes, anchorRes, recordsRes, badgesRes
    ] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", user.id).single(),
      supabase.from("patient_profiles").select("*").eq("user_id", user.id).single(),
      supabase.from("nutrition_logs").select("*, nutrition_foods(name)").eq("user_id", user.id).gte("logged_at", thirtyDaysAgo).order("logged_at", { ascending: false }),
      supabase.from("exercise_logs").select("*, exercise_activities(name, category)").eq("user_id", user.id).gte("logged_at", thirtyDaysAgo).order("logged_at", { ascending: false }),
      supabase.from("journey_steps").select("*").order("step_number"),
      supabase.from("trail_progress").select("*, journey_steps(title, step_number)").eq("user_id", user.id),
      supabase.from("routine_days").select("*").eq("user_id", user.id).gte("date", sevenDaysAgo).order("date", { ascending: false }),
      supabase.from("finance_events").select("*").eq("user_id", user.id).gte("created_at", thirtyDaysAgo),
      supabase.from("risk_signals").select("*").eq("user_id", user.id).order("detected_at", { ascending: false }).limit(20),
      supabase.from("body_evolution").select("*").eq("user_id", user.id).order("taken_at", { ascending: false }).limit(5),
      supabase.from("anchor_contacts").select("*").eq("user_id", user.id),
      supabase.from("patient_record_entries").select("*").eq("patient_id", user.id).order("created_at", { ascending: false }).limit(20),
      supabase.from("user_badges").select("*").eq("user_id", user.id),
    ]);

    const patientData = {
      profile: profileRes.data,
      patient: patientRes.data,
      nutrition: nutritionRes.data || [],
      exercise: exerciseRes.data || [],
      journeySteps: journeyStepsRes.data || [],
      trailProgress: trailRes.data || [],
      routine: routineRes.data || [],
      finance: financeRes.data || [],
      riskSignals: riskRes.data || [],
      bodyEvolution: bodyRes.data || [],
      anchors: anchorRes.data || [],
      records: recordsRes.data || [],
      badges: badgesRes.data || [],
      today: new Date().toISOString().split("T")[0],
    };

    const systemPrompt = `Você é um sistema clínico especializado em gerar prontuários médicos detalhados para pacientes em recuperação de ludopatia (vício em jogos de azar).

Gere um prontuário médico completo e profissional em formato JSON com a seguinte estrutura:

{
  "patient_info": {
    "name": "nome do paciente",
    "age": "idade ou N/A",
    "journey_start": "data início da jornada",
    "current_step": número,
    "streak_days": número
  },
  "journey_status": {
    "current_step": número,
    "total_steps": 12,
    "completed_steps": [lista de passos concluídos com títulos],
    "pending_steps": [lista de passos pendentes],
    "progress_percentage": número,
    "assessment": "avaliação detalhada do progresso na jornada"
  },
  "routine_analysis": {
    "days_tracked": número,
    "average_mood": número ou null,
    "consistency_score": "alta/média/baixa",
    "morning_adherence": "percentual ou descrição",
    "afternoon_adherence": "percentual ou descrição",
    "evening_adherence": "percentual ou descrição",
    "assessment": "avaliação das rotinas"
  },
  "nutrition_summary": {
    "total_meals_logged": número,
    "avg_daily_calories": número,
    "avg_protein": número,
    "avg_carbs": número,
    "avg_fat": número,
    "assessment": "avaliação nutricional"
  },
  "exercise_summary": {
    "total_sessions": número,
    "total_minutes": número,
    "total_calories_burned": número,
    "favorite_activities": [lista],
    "assessment": "avaliação da atividade física"
  },
  "financial_health": {
    "total_income": número,
    "total_expenses": número,
    "debts_paid": número,
    "pending_debts": número,
    "assessment": "avaliação financeira"
  },
  "risk_assessment": {
    "total_signals": número,
    "critical_signals": número,
    "recent_signals": [lista resumida],
    "risk_level": "baixo/moderado/alto/crítico",
    "assessment": "avaliação de risco"
  },
  "body_evolution": {
    "has_data": boolean,
    "weight_trend": "descrição",
    "assessment": "avaliação corporal"
  },
  "badges_achievements": {
    "total_badges": número,
    "badges": [lista de conquistas],
    "assessment": "avaliação de conquistas"
  },
  "clinical_notes_summary": {
    "total_entries": número,
    "recent_themes": [temas recentes],
    "assessment": "resumo clínico"
  },
  "overall_assessment": {
    "score": número de 0 a 100,
    "status": "Excelente/Bom/Regular/Atenção/Crítico",
    "strengths": [pontos fortes, máx 5],
    "areas_improvement": [áreas de melhoria, máx 5],
    "recommendations": [recomendações clínicas, máx 5],
    "evolution_comparison": "comparação de evolução ao longo do tempo",
    "professional_notes": "notas para o profissional de saúde"
  },
  "generated_at": "data/hora de geração"
}

Seja detalhado, clínico e profissional. Use dados reais fornecidos. Para dados ausentes, indique "Dados insuficientes". Não invente dados.`;

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
          { role: "user", content: `Gere o prontuário médico completo baseado nos dados:\n${JSON.stringify(patientData, null, 2)}` },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI error:", aiResponse.status, errText);
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Muitas requisições. Aguarde um momento." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices[0]?.message?.content;

    let prontuario;
    try {
      prontuario = JSON.parse(content);
    } catch {
      prontuario = { error: "Falha ao processar prontuário", raw: content };
    }

    return new Response(JSON.stringify({ prontuario }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Prontuario error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
