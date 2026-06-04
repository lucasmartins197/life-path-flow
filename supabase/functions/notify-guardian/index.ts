import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RESEND_KEY = "re_eLRc8cwT_HZYSsQonMX3K1U1LZ3kby9k4";
const ZAPI_URL = "https://api.z-api.io/instances/3F4251576B10F1BE557C9A7EE4F1867E/token/2D6CDE945D6DB4F275171067/send-text";

async function sendWhatsApp(phone: string, message: string) {
  try {
    // Formatar número: remover tudo exceto dígitos, garantir código do país
    let number = phone.replace(/\D/g, "");
    if (!number.startsWith("55")) number = "55" + number;
    
    const res = await fetch(ZAPI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: number, message }),
    });
    const data = await res.json();
    console.log("Z-API response:", JSON.stringify(data));
    return res.ok;
  } catch (e) {
    console.error("Z-API error:", e);
    return false;
  }
}

async function sendEmail(to: string, subject: string, html: string) {
  try {
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
  } catch (e) {
    console.error("Email error:", e);
    return false;
  }
}

async function fetchUserReport(supabase: any, user_id: string) {
  try {
    const [profileRes, clinicRes, journeyRes, tasksRes, prontuarioRes] = await Promise.all([
      supabase.from("profiles").select("full_name, city, gambling_duration, recovery_situation").eq("id", user_id).maybeSingle(),
      supabase.from("onboarding_clinico").select("*").eq("user_id", user_id).maybeSingle(),
      supabase.from("journey_progress").select("step_number, completed").eq("user_id", user_id),
      supabase.from("daily_tasks").select("concluido, categoria").eq("user_id", user_id).gte("data", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]),
      supabase.from("prontuarios").select("resumo_clinico, nivel_risco, recomendacoes").eq("user_id", user_id).order("gerado_em", { ascending: false }).limit(1).maybeSingle(),
    ]);

    const passos = journeyRes.data || [];
    const tasks = tasksRes.data || [];
    const passosCompletos = passos.filter((p: any) => p.completed).length;
    const tarefasFeitas = tasks.filter((t: any) => t.concluido).length;
    const totalTarefas = tasks.length;
    const clinico = clinicRes.data;
    const prontuario = prontuarioRes.data;

    return {
      passosCompletos,
      tarefasFeitas,
      totalTarefas,
      clinico,
      prontuario,
    };
  } catch (e) {
    console.error("Error fetching report:", e);
    return null;
  }
}

function getGreeting(): string {
  const hour = parseInt(new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", hour: "numeric", hour12: false }));
  if (hour >= 5 && hour < 12) return "Bom dia";
  if (hour >= 12 && hour < 18) return "Boa tarde";
  return "Boa noite";
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
    const toPhone = guardian_phone;
    const toName = guardian_name || "Contato Âncora";
    const fromName = user_name || "Seu apoiado";

    if (!toPhone && !toEmail) {
      return new Response(JSON.stringify({ ok: false, error: "Telefone ou email do âncora não informado" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Buscar relatório se necessário
    let report = null;
    if (user_id && (include_report || type === "update" || type === "weekly_report" || type === "step_complete")) {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );
      report = await fetchUserReport(supabase, user_id);
    }

    let whatsappMsg = "";
    let emailSubject = "";
    let emailHtml = "";

    // Montar relatório em texto para WhatsApp
    const reportText = report ? `\n\n📊 *Progresso esta semana:*\n✅ Passos concluídos: ${report.passosCompletos}/12\n📅 Tarefas: ${report.tarefasFeitas}/${report.totalTarefas}${report.clinico?.mental_health_risk ? `\n🧠 Estado emocional: ${report.clinico.mental_health_risk}` : ""}${report.prontuario?.nivel_risco ? `\n⚠️ Nível de risco: ${report.prontuario.nivel_risco.toUpperCase()}` : ""}` : "";

    const reportHtml = report ? `
      <div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:12px;padding:20px;margin:16px 0">
        <h3 style="color:#1B4332;margin:0 0 12px">📊 Relatório de Progresso</h3>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:4px 0;color:#374151;font-size:14px">✅ Passos concluídos</td><td style="text-align:right;font-weight:bold;color:#1B4332">${report.passosCompletos}/12</td></tr>
          <tr><td style="padding:4px 0;color:#374151;font-size:14px">📅 Tarefas (7 dias)</td><td style="text-align:right;font-weight:bold;color:#1B4332">${report.tarefasFeitas}/${report.totalTarefas}</td></tr>
          ${report.clinico?.mental_health_risk ? `<tr><td style="padding:4px 0;color:#374151;font-size:14px">🧠 Estado emocional</td><td style="text-align:right;font-weight:bold;color:#1B4332">${report.clinico.mental_health_risk}</td></tr>` : ""}
          ${report.prontuario?.nivel_risco ? `<tr><td style="padding:4px 0;color:#374151;font-size:14px">⚠️ Nível de risco</td><td style="text-align:right;font-weight:bold;color:${report.prontuario.nivel_risco === 'critico' ? '#DC2626' : report.prontuario.nivel_risco === 'alto' ? '#D97706' : '#16A34A'}">${report.prontuario.nivel_risco.toUpperCase()}</td></tr>` : ""}
        </table>
        ${report.prontuario?.resumo_clinico ? `<div style="margin-top:12px;padding-top:12px;border-top:1px solid #BBF7D0"><p style="color:#374151;font-size:13px;margin:0"><strong>Avaliação clínica:</strong> ${report.prontuario.resumo_clinico.slice(0, 400)}...</p></div>` : ""}
      </div>` : "";

    if (type === "urgency" || type === "emergency") {
      whatsappMsg = `🚨 *${getGreeting()}, ${toName}!*\n\nSomos da *Stake Real*, plataforma de recuperação de ludopatia.\n\nEstamos entrando em contato porque *${fromName}*, seu(sua) ancorado(a) no aplicativo, acionou um *pedido de apoio urgente*.\n\nEle(a) pode estar em situação de risco neste momento. Por favor, entre em contato imediatamente por ligação ou mensagem.\n\nConte com você para fazer a diferença! 💚\n\n_Enviado automaticamente pelo app Stake Real_`;
      emailSubject = `🚨 ${fromName} precisa do seu apoio AGORA`;
      emailHtml = `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
        <div style="background:#DC2626;padding:24px;border-radius:12px;text-align:center;margin-bottom:20px"><h1 style="color:white;margin:0">⚠️ Pedido de Apoio Urgente</h1></div>
        <h2 style="color:#DC2626">Olá, ${toName}!</h2>
        <p><strong>${fromName}</strong> está pedindo apoio urgente. Por favor, entre em contato imediatamente.</p>
        <div style="background:#FEF2F2;border:1px solid #FECACA;border-radius:12px;padding:16px;margin:16px 0"><p style="color:#991B1B;margin:0;font-weight:bold">Esta é uma situação de risco. Seu apoio pode fazer a diferença.</p></div>
        <p style="color:#6B7280;font-size:12px;text-align:center">Equipe Stake Real</p>
      </div>`;

    } else if (type === "update") {
      whatsappMsg = `💚 *Atualização — Stake Real*\n\nOlá ${toName}! ${fromName} enviou uma atualização sobre sua jornada de recuperação.${reportText}\n\n_Enviado automaticamente pelo app Stake Real_`;
      emailSubject = `💚 Relatório de progresso de ${fromName} — Stake Real`;
      emailHtml = `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
        <div style="background:#1B4332;padding:24px;border-radius:12px;text-align:center;margin-bottom:20px"><h1 style="color:white;margin:0">Stake Real</h1></div>
        <h2 style="color:#1B4332">Olá, ${toName}!</h2>
        <p><strong>${fromName}</strong> enviou uma atualização sobre sua jornada.</p>
        ${reportHtml}
        <p>Continue apoiando — você faz diferença! 💚</p>
        <p style="color:#6B7280;font-size:12px;text-align:center">Equipe Stake Real</p>
      </div>`;

    } else if (type === "step_complete") {
      whatsappMsg = `🏆 *Conquista — Stake Real*\n\nOlá ${toName}! ${fromName} acabou de concluir mais um passo na jornada de recuperação! 🎉${reportText}\n\n_Enviado automaticamente pelo app Stake Real_`;
      emailSubject = `🏆 ${fromName} concluiu um passo!`;
      emailHtml = `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
        <div style="background:#1B4332;padding:24px;border-radius:12px;text-align:center;margin-bottom:20px"><h1 style="color:white;margin:0">Stake Real</h1></div>
        <h2 style="color:#1B4332">Olá, ${toName}!</h2>
        <p>🎉 <strong>${fromName}</strong> concluiu mais um passo na jornada!</p>
        ${reportHtml}
        <p style="color:#6B7280;font-size:12px;text-align:center">Equipe Stake Real</p>
      </div>`;

    } else if (type === "relapse") {
      whatsappMsg = `💛 *Atenção — Stake Real*\n\nOlá ${toName}, ${fromName} registrou uma recaída. Este é um momento importante para oferecer apoio sem julgamento. Entre em contato com carinho. 💛\n\n_Enviado automaticamente pelo app Stake Real_`;
      emailSubject = `💛 ${fromName} registrou uma recaída — apoio necessário`;
      emailHtml = `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
        <div style="background:#D97706;padding:24px;border-radius:12px;text-align:center;margin-bottom:20px"><h1 style="color:white;margin:0">Stake Real</h1></div>
        <h2 style="color:#D97706">Olá, ${toName}!</h2>
        <p><strong>${fromName}</strong> registrou uma recaída. Ofereça apoio sem julgamento. 💛</p>
        ${reportHtml}
        <p style="color:#6B7280;font-size:12px;text-align:center">Equipe Stake Real</p>
      </div>`;

    } else if (type === "weekly_report") {
      whatsappMsg = `📊 *Relatório Semanal — Stake Real*\n\nOlá ${toName}! Aqui está o progresso semanal de ${fromName}:${reportText}\n\nObrigado pelo seu apoio! 💚\n\n_Enviado automaticamente pelo app Stake Real_`;
      emailSubject = `📊 Relatório semanal de ${fromName} — Stake Real`;
      emailHtml = `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
        <div style="background:#1B4332;padding:24px;border-radius:12px;text-align:center;margin-bottom:20px"><h1 style="color:white;margin:0">Stake Real</h1></div>
        <h2 style="color:#1B4332">Olá, ${toName}!</h2>
        <p>Relatório semanal de <strong>${fromName}</strong>:</p>
        ${reportHtml}
        <p style="color:#6B7280;font-size:12px;text-align:center">Equipe Stake Real</p>
      </div>`;

    } else if (type === "inactive") {
      whatsappMsg = `💚 *Stake Real*\n\nOlá ${toName}, ${fromName} não acessa o app há mais de 3 dias. Que tal entrar em contato e oferecer apoio? Uma mensagem pode fazer toda a diferença! 💚\n\n_Enviado automaticamente pelo app Stake Real_`;
      emailSubject = `${fromName} pode precisar do seu apoio`;
      emailHtml = `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
        <div style="background:#1B4332;padding:24px;border-radius:12px;text-align:center;margin-bottom:20px"><h1 style="color:white;margin:0">Stake Real</h1></div>
        <h2 style="color:#1B4332">Olá, ${toName}!</h2>
        <p><strong>${fromName}</strong> não acessa o app há mais de 3 dias. Entre em contato! 💚</p>
        <p style="color:#6B7280;font-size:12px;text-align:center">Equipe Stake Real</p>
      </div>`;

    } else if (type === "invite") {
      whatsappMsg = `💚 *Stake Real*\n\nOlá ${toName}! ${fromName} te escolheu como Contato Âncora no app de recuperação Stake Real. Você receberá notificações para apoiá-lo(a) na jornada. Obrigado por fazer parte disso! 💚\n\n_Enviado automaticamente pelo app Stake Real_`;
      emailSubject = `${fromName} te convidou para ser seu Contato Âncora`;
      emailHtml = `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
        <div style="background:#1B4332;padding:24px;border-radius:12px;text-align:center;margin-bottom:20px"><h1 style="color:white;margin:0">Stake Real</h1></div>
        <h2 style="color:#1B4332">Olá, ${toName}!</h2>
        <p><strong>${fromName}</strong> te escolheu como Contato Âncora no Stake Real.</p>
        <ul><li>Receber alertas de inatividade</li><li>Pedidos de apoio urgente</li><li>Relatórios de progresso</li></ul>
        <p>Seu apoio faz toda a diferença! 💚</p>
        <p style="color:#6B7280;font-size:12px;text-align:center">Equipe Stake Real</p>
      </div>`;
    }

    // Enviar WhatsApp e Email em paralelo
    const results = await Promise.allSettled([
      toPhone ? sendWhatsApp(toPhone, whatsappMsg) : Promise.resolve(false),
      toEmail && emailSubject ? sendEmail(toEmail, emailSubject, emailHtml) : Promise.resolve(false),
    ]);

    const whatsOk = results[0].status === "fulfilled" && results[0].value;
    const emailOk = results[1].status === "fulfilled" && results[1].value;

    return new Response(JSON.stringify({ ok: true, whatsapp: whatsOk, email: emailOk }), {
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
