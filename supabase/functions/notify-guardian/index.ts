import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RESEND_KEY = "re_eLRc8cwT_HZYSsQonMX3K1U1LZ3kby9k4";

async function sendEmail(to: string, subject: string, html: string) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Stake Real <contato@apostandonavida.com.br>",
      to: [to],
      subject,
      html,
    }),
  });
  return res.ok;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const {
      type,
      guardian_name,
      guardian_email,
      guardian_phone,
      user_name,
      user_id,
      anchor_email,
      include_report,
    } = body;

    const toEmail = guardian_email || anchor_email;
    const toName = guardian_name || "Contato Âncora";
    const fromName = user_name || "Seu apoiado";

    if (!toEmail) {
      return new Response(JSON.stringify({ ok: false, error: "Email do âncora não informado" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let subject = "";
    let html = "";

    // Buscar dados do usuário se include_report ou user_id disponível
    let reportHtml = "";
    if (user_id && (include_report || type === "weekly_report" || type === "update")) {
      try {
        const supabase = createClient(
          Deno.env.get("SUPABASE_URL")!,
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
        );

        const [profileRes, clinicRes, journeyRes, tasksRes, prontuarioRes] = await Promise.all([
          supabase.from("profiles").select("full_name, city, gambling_duration, recovery_situation, gambling_free_since").eq("id", user_id).maybeSingle(),
          supabase.from("onboarding_clinico").select("*").eq("user_id", user_id).maybeSingle(),
          supabase.from("journey_progress").select("step_number, completed").eq("user_id", user_id),
          supabase.from("daily_tasks").select("concluido, categoria").eq("user_id", user_id).gte("data", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]),
          supabase.from("prontuarios").select("resumo_clinico, nivel_risco, recomendacoes").eq("user_id", user_id).order("gerado_em", { ascending: false }).limit(1).maybeSingle(),
        ]);

        const profile = profileRes.data;
        const clinico = clinicRes.data;
        const passos = journeyRes.data || [];
        const tasks = tasksRes.data || [];
        const prontuario = prontuarioRes.data;

        const passosCompletos = passos.filter((p: any) => p.completed).length;
        const tarefasFeitas = tasks.filter((t: any) => t.concluido).length;
        const totalTarefas = tasks.length;

        reportHtml = `
          <div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:12px;padding:20px;margin:16px 0">
            <h3 style="color:#1B4332;margin:0 0 12px">📊 Relatório de Progresso</h3>
            <table style="width:100%;border-collapse:collapse">
              <tr><td style="padding:4px 0;color:#374151;font-size:14px">✅ Passos concluídos</td><td style="text-align:right;font-weight:bold;color:#1B4332">${passosCompletos}/12</td></tr>
              <tr><td style="padding:4px 0;color:#374151;font-size:14px">📅 Tarefas (7 dias)</td><td style="text-align:right;font-weight:bold;color:#1B4332">${tarefasFeitas}/${totalTarefas}</td></tr>
              ${clinico?.main_motivation ? `<tr><td style="padding:4px 0;color:#374151;font-size:14px">💪 Motivação</td><td style="text-align:right;font-weight:bold;color:#1B4332">${clinico.main_motivation}</td></tr>` : ""}
              ${clinico?.mental_health_risk ? `<tr><td style="padding:4px 0;color:#374151;font-size:14px">🧠 Estado emocional</td><td style="text-align:right;font-weight:bold;color:#1B4332">${clinico.mental_health_risk}</td></tr>` : ""}
            </table>
            ${prontuario?.resumo_clinico ? `<div style="margin-top:12px;padding-top:12px;border-top:1px solid #BBF7D0"><p style="color:#374151;font-size:13px;margin:0"><strong>Avaliação clínica:</strong> ${prontuario.resumo_clinico.slice(0, 300)}...</p></div>` : ""}
            ${prontuario?.nivel_risco ? `<p style="margin:8px 0 0;font-size:13px;color:#374151"><strong>Nível de risco:</strong> <span style="color:${prontuario.nivel_risco === 'critico' ? '#DC2626' : prontuario.nivel_risco === 'alto' ? '#D97706' : '#16A34A'}">${prontuario.nivel_risco.toUpperCase()}</span></p>` : ""}
          </div>`;
      } catch (e) {
        console.error("Error fetching report data:", e);
      }
    }

    if (type === "invite") {
      subject = `${fromName} te convidou para ser seu Contato Âncora no Stake Real`;
      html = `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
        <div style="background:#1B4332;padding:24px;border-radius:12px;text-align:center;margin-bottom:20px"><h1 style="color:white;margin:0">Stake Real</h1></div>
        <h2 style="color:#1B4332">Olá, ${toName}!</h2>
        <p><strong>${fromName}</strong> te escolheu como <strong>Contato Âncora</strong> no app Stake Real.</p>
        <p>Como Contato Âncora, você receberá notificações quando:</p>
        <ul><li>${fromName} ficar inativo por mais de 3 dias</li><li>Houver um pedido de apoio urgente</li><li>Um passo importante da jornada for concluído</li></ul>
        <p>Seu apoio faz toda a diferença! 💚</p>
        <p style="color:#6B7280;font-size:12px;text-align:center">Equipe Stake Real</p>
      </div>`;

    } else if (type === "urgency" || type === "emergency") {
      subject = `🚨 ${fromName} precisa do seu apoio AGORA`;
      html = `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
        <div style="background:#DC2626;padding:24px;border-radius:12px;text-align:center;margin-bottom:20px"><h1 style="color:white;margin:0">⚠️ Pedido de Apoio Urgente</h1></div>
        <h2 style="color:#DC2626">Olá, ${toName}!</h2>
        <p><strong>${fromName}</strong> está pedindo apoio urgente através do app Stake Real.</p>
        <p>Por favor, entre em contato imediatamente por telefone ou WhatsApp.</p>
        <div style="background:#FEF2F2;border:1px solid #FECACA;border-radius:12px;padding:16px;margin:16px 0"><p style="color:#991B1B;margin:0;font-weight:bold">Esta é uma situação de risco. Seu apoio pode fazer a diferença.</p></div>
        <p style="color:#6B7280;font-size:12px;text-align:center">Equipe Stake Real</p>
      </div>`;

    } else if (type === "update") {
      subject = `💚 Relatório de progresso de ${fromName} — Stake Real`;
      html = `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
        <div style="background:#1B4332;padding:24px;border-radius:12px;text-align:center;margin-bottom:20px"><h1 style="color:white;margin:0">Stake Real</h1></div>
        <h2 style="color:#1B4332">Olá, ${toName}!</h2>
        <p><strong>${fromName}</strong> enviou uma atualização sobre sua jornada de recuperação.</p>
        ${reportHtml}
        <p>Continue apoiando — você faz uma diferença enorme! 💚</p>
        <p style="color:#6B7280;font-size:12px;text-align:center">Equipe Stake Real</p>
      </div>`;

    } else if (type === "step_complete") {
      subject = `🏆 ${fromName} concluiu um passo na jornada!`;
      html = `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
        <div style="background:#1B4332;padding:24px;border-radius:12px;text-align:center;margin-bottom:20px"><h1 style="color:white;margin:0">Stake Real</h1></div>
        <h2 style="color:#1B4332">Olá, ${toName}!</h2>
        <p>🎉 <strong>${fromName}</strong> acabou de concluir mais um passo na jornada de recuperação!</p>
        ${reportHtml}
        <p>Seu apoio está fazendo diferença!</p>
        <p style="color:#6B7280;font-size:12px;text-align:center">Equipe Stake Real</p>
      </div>`;

    } else if (type === "relapse") {
      subject = `💛 ${fromName} registrou uma recaída — apoio necessário`;
      html = `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
        <div style="background:#D97706;padding:24px;border-radius:12px;text-align:center;margin-bottom:20px"><h1 style="color:white;margin:0">Stake Real</h1></div>
        <h2 style="color:#D97706">Olá, ${toName}!</h2>
        <p><strong>${fromName}</strong> registrou uma recaída no app Stake Real.</p>
        <p>Recaídas fazem parte do processo. Este é um momento importante para oferecer apoio sem julgamento.</p>
        ${reportHtml}
        <p>Entre em contato com carinho e encorajamento. 💛</p>
        <p style="color:#6B7280;font-size:12px;text-align:center">Equipe Stake Real</p>
      </div>`;

    } else if (type === "weekly_report") {
      subject = `📊 Relatório semanal de ${fromName} — Stake Real`;
      html = `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
        <div style="background:#1B4332;padding:24px;border-radius:12px;text-align:center;margin-bottom:20px"><h1 style="color:white;margin:0">Stake Real</h1></div>
        <h2 style="color:#1B4332">Olá, ${toName}!</h2>
        <p>Aqui está o relatório semanal de progresso de <strong>${fromName}</strong>:</p>
        ${reportHtml}
        <p>Obrigado por fazer parte dessa jornada! 💚</p>
        <p style="color:#6B7280;font-size:12px;text-align:center">Equipe Stake Real</p>
      </div>`;

    } else if (type === "inactive") {
      subject = `${fromName} pode precisar do seu apoio`;
      html = `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
        <div style="background:#1B4332;padding:24px;border-radius:12px;text-align:center;margin-bottom:20px"><h1 style="color:white;margin:0">Stake Real</h1></div>
        <h2 style="color:#1B4332">Olá, ${toName}!</h2>
        <p><strong>${fromName}</strong> não acessa o app Stake Real há mais de 3 dias.</p>
        <p>Que tal entrar em contato e oferecer apoio? Uma mensagem pode fazer toda a diferença! 💚</p>
        <p style="color:#6B7280;font-size:12px;text-align:center">Equipe Stake Real</p>
      </div>`;
    }

    const sent = await sendEmail(toEmail, subject, html);

    return new Response(JSON.stringify({ ok: sent }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("notify-guardian error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
