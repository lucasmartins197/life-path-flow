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
    } = body;

    // Suporta dois formatos: {guardian_email} ou {anchor_email}
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

    if (type === "invite") {
      subject = `${fromName} te convidou para ser seu Contato Âncora no Stake Real`;
      html = `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
        <div style="background:#1B4332;padding:24px;border-radius:12px;text-align:center;margin-bottom:20px">
          <h1 style="color:white;margin:0">Stake Real</h1>
        </div>
        <h2 style="color:#1B4332">Olá, ${toName}!</h2>
        <p><strong>${fromName}</strong> te escolheu como <strong>Contato Âncora</strong> na jornada de recuperação dele(a) no app Stake Real.</p>
        <p>Como Contato Âncora, você receberá notificações quando:</p>
        <ul>
          <li>${fromName} ficar inativo por mais de 3 dias</li>
          <li>Houver um pedido de apoio urgente</li>
          <li>Um passo importante da jornada for concluído</li>
        </ul>
        <p>Seu apoio faz toda a diferença! 💚</p>
        <p style="color:#6B7280;font-size:12px;text-align:center">Equipe Stake Real</p>
      </div>`;
    } else if (type === "urgency" || type === "emergency") {
      subject = `🚨 ${fromName} precisa do seu apoio AGORA`;
      html = `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
        <div style="background:#DC2626;padding:24px;border-radius:12px;text-align:center;margin-bottom:20px">
          <h1 style="color:white;margin:0">⚠️ Pedido de Apoio Urgente</h1>
        </div>
        <h2 style="color:#DC2626">Olá, ${toName}!</h2>
        <p><strong>${fromName}</strong> está pedindo apoio urgente através do app Stake Real.</p>
        <p>Por favor, entre em contato imediatamente por telefone ou WhatsApp.</p>
        <div style="background:#FEF2F2;border:1px solid #FECACA;border-radius:12px;padding:16px;margin:16px 0">
          <p style="color:#991B1B;margin:0;font-weight:bold">Esta é uma situação de risco. Seu apoio pode fazer a diferença.</p>
        </div>
        <p style="color:#6B7280;font-size:12px;text-align:center">Equipe Stake Real</p>
      </div>`;
    } else if (type === "update") {
      subject = `💚 Atualização de ${fromName} no Stake Real`;
      html = `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
        <div style="background:#1B4332;padding:24px;border-radius:12px;text-align:center;margin-bottom:20px">
          <h1 style="color:white;margin:0">Stake Real</h1>
        </div>
        <h2 style="color:#1B4332">Olá, ${toName}!</h2>
        <p><strong>${fromName}</strong> está pensando em você e quis te enviar uma atualização sobre sua jornada de recuperação.</p>
        <p>Ele(a) está progredindo e agradece pelo seu apoio! 💚</p>
        <p style="color:#6B7280;font-size:12px;text-align:center">Equipe Stake Real</p>
      </div>`;
    } else if (type === "step_complete") {
      subject = `🏆 ${fromName} concluiu um passo na jornada!`;
      html = `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
        <div style="background:#1B4332;padding:24px;border-radius:12px;text-align:center;margin-bottom:20px">
          <h1 style="color:white;margin:0">Stake Real</h1>
        </div>
        <h2 style="color:#1B4332">Olá, ${toName}!</h2>
        <p>Boa notícia! <strong>${fromName}</strong> acabou de concluir mais um passo na jornada de recuperação! 🎉</p>
        <p>Cada passo é uma vitória. Seu apoio está fazendo diferença!</p>
        <p style="color:#6B7280;font-size:12px;text-align:center">Equipe Stake Real</p>
      </div>`;
    } else if (type === "relapse") {
      subject = `💛 ${fromName} registrou uma recaída — apoio necessário`;
      html = `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
        <div style="background:#D97706;padding:24px;border-radius:12px;text-align:center;margin-bottom:20px">
          <h1 style="color:white;margin:0">Stake Real</h1>
        </div>
        <h2 style="color:#D97706">Olá, ${toName}!</h2>
        <p><strong>${fromName}</strong> registrou uma recaída no app Stake Real.</p>
        <p>Recaídas fazem parte do processo de recuperação. Este é um momento importante para oferecer apoio sem julgamento.</p>
        <p>Entre em contato com carinho e encorajamento. 💛</p>
        <p style="color:#6B7280;font-size:12px;text-align:center">Equipe Stake Real</p>
      </div>`;
    } else if (type === "inactive") {
      subject = `${fromName} pode precisar do seu apoio`;
      html = `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
        <div style="background:#1B4332;padding:24px;border-radius:12px;text-align:center;margin-bottom:20px">
          <h1 style="color:white;margin:0">Stake Real</h1>
        </div>
        <h2 style="color:#1B4332">Olá, ${toName}!</h2>
        <p><strong>${fromName}</strong> não acessa o app Stake Real há mais de 3 dias.</p>
        <p>Que tal entrar em contato e oferecer apoio? Uma mensagem pode fazer toda a diferença! 💚</p>
        <p style="color:#6B7280;font-size:12px;text-align:center">Equipe Stake Real</p>
      </div>`;
    } else {
      subject = `Notificação do Stake Real sobre ${fromName}`;
      html = `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
        <p>Olá ${toName}, você tem uma notificação sobre ${fromName} no app Stake Real.</p>
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
