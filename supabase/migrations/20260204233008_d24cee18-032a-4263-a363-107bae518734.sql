-- Add address fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS street TEXT,
ADD COLUMN IF NOT EXISTS number TEXT,
ADD COLUMN IF NOT EXISTS complement TEXT,
ADD COLUMN IF NOT EXISTS neighborhood TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS zip_code TEXT,
ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'Brasil',
ADD COLUMN IF NOT EXISTS cpf TEXT,
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;

-- Fix RLS policy on profiles - remove public access, only authenticated users
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Professionals can view linked patient profiles" ON public.profiles FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.patient_professional_links 
    WHERE patient_id = profiles.user_id 
    AND professional_id = auth.uid() 
    AND is_active = true
  )
);

-- Fix RLS on anchor_contacts - ensure proper policies exist
DROP POLICY IF EXISTS "Users can manage own anchor contacts" ON public.anchor_contacts;
CREATE POLICY "Users can view own anchor contacts" ON public.anchor_contacts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own anchor contacts" ON public.anchor_contacts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own anchor contacts" ON public.anchor_contacts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own anchor contacts" ON public.anchor_contacts FOR DELETE USING (auth.uid() = user_id);

-- Populate journey_steps with the 12 steps content
INSERT INTO public.journey_steps (step_number, title, description, duration_minutes, video_url, thumbnail_url, exercises, reflection_questions, is_published)
VALUES 
(1, 'Admissão - Reconhecendo a Impotência', 
'O primeiro passo é reconhecer que perdemos o controle sobre o vício e que nossas vidas se tornaram ingovernáveis. Este é o fundamento de toda recuperação.',
45,
NULL,
NULL,
'[
  {"id": "1a", "type": "text", "title": "Escreva sobre um momento em que você perdeu o controle", "description": "Descreva uma situação específica onde o vício controlou suas ações"},
  {"id": "1b", "type": "checklist", "title": "Consequências do vício na minha vida", "items": ["Problemas financeiros", "Conflitos familiares", "Problemas de saúde", "Dificuldades no trabalho", "Perda de amizades", "Problemas legais"]},
  {"id": "1c", "type": "scale", "title": "Quanto controle você sente que tem hoje?", "min": 1, "max": 10}
]'::jsonb,
'[
  "O que significa admitir que você é impotente?",
  "Como o vício afetou sua capacidade de tomar decisões?",
  "O que você ganhou ao tentar controlar sozinho?"
]'::jsonb,
true),

(2, 'Esperança - Acreditando na Recuperação',
'Chegamos a acreditar que um Poder Superior a nós mesmos poderia devolver-nos à sanidade. A esperança é o combustível da recuperação.',
40,
NULL,
NULL,
'[
  {"id": "2a", "type": "text", "title": "O que significa esperança para você?", "description": "Escreva sobre momentos em que você sentiu esperança"},
  {"id": "2b", "type": "text", "title": "Defina seu Poder Superior", "description": "Pode ser Deus, a natureza, o grupo, o universo - o que faz sentido para você"},
  {"id": "2c", "type": "checklist", "title": "Sinais de sanidade que busco", "items": ["Paz interior", "Relacionamentos saudáveis", "Estabilidade emocional", "Clareza mental", "Propósito de vida"]}
]'::jsonb,
'[
  "O que a sanidade significa para você?",
  "Você já experimentou momentos de clareza? Descreva.",
  "O que te impede de ter esperança?"
]'::jsonb,
true),

(3, 'Decisão - Entregando a Vontade',
'Decidimos entregar nossa vontade e nossa vida aos cuidados de Deus, na forma em que O concebíamos.',
50,
NULL,
NULL,
'[
  {"id": "3a", "type": "text", "title": "Carta de compromisso", "description": "Escreva uma carta formal de compromisso com sua recuperação"},
  {"id": "3b", "type": "checklist", "title": "Áreas da vida que entrego", "items": ["Finanças", "Relacionamentos", "Carreira", "Saúde", "Família", "Futuro"]},
  {"id": "3c", "type": "text", "title": "Oração ou afirmação pessoal", "description": "Crie uma oração ou afirmação que você pode usar diariamente"}
]'::jsonb,
'[
  "O que significa entregar o controle?",
  "Quais medos surgem ao pensar em se render?",
  "Como seria sua vida se você confiasse mais?"
]'::jsonb,
true),

(4, 'Inventário - Autoconhecimento Profundo',
'Fizemos um minucioso e destemido inventário moral de nós mesmos.',
60,
NULL,
NULL,
'[
  {"id": "4a", "type": "text", "title": "Lista de ressentimentos", "description": "Pessoas, instituições ou situações com quem você tem ressentimento"},
  {"id": "4b", "type": "text", "title": "Lista de medos", "description": "Escreva todos os medos que conseguir identificar"},
  {"id": "4c", "type": "text", "title": "Relacionamentos afetados", "description": "Como o vício afetou seus relacionamentos?"},
  {"id": "4d", "type": "text", "title": "Padrões de comportamento", "description": "Identifique padrões repetitivos em sua vida"}
]'::jsonb,
'[
  "Qual ressentimento é mais difícil de admitir?",
  "Como seus medos influenciaram suas escolhas?",
  "Que padrões você gostaria de mudar?"
]'::jsonb,
true),

(5, 'Admissão - Compartilhando a Verdade',
'Admitimos perante Deus, perante nós mesmos e perante outro ser humano, a natureza exata de nossas falhas.',
45,
NULL,
NULL,
'[
  {"id": "5a", "type": "text", "title": "Prepare sua partilha", "description": "Resuma os pontos principais do seu inventário para compartilhar"},
  {"id": "5b", "type": "checklist", "title": "Antes de compartilhar", "items": ["Escolhi alguém de confiança", "Agendei um horário adequado", "Estou preparado emocionalmente", "Li meu inventário completo"]},
  {"id": "5c", "type": "text", "title": "Reflexão pós-partilha", "description": "Como você se sentiu após compartilhar? (preencher depois)"}
]'::jsonb,
'[
  "Por que é importante compartilhar com outro ser humano?",
  "O que você teme ao se expor?",
  "Que liberdade você espera encontrar?"
]'::jsonb,
true),

(6, 'Prontidão - Preparando-se para Mudar',
'Prontificamo-nos inteiramente a deixar que Deus removesse todos esses defeitos de caráter.',
40,
NULL,
NULL,
'[
  {"id": "6a", "type": "checklist", "title": "Defeitos que identifico em mim", "items": ["Orgulho", "Medo", "Ressentimento", "Egoísmo", "Desonestidade", "Impaciência", "Intolerância"]},
  {"id": "6b", "type": "text", "title": "Benefícios ocultos dos defeitos", "description": "Como esses defeitos te serviram? O que você ganhava com eles?"},
  {"id": "6c", "type": "scale", "title": "Quão pronto você está para mudar?", "min": 1, "max": 10}
]'::jsonb,
'[
  "Há algum defeito que você não quer abandonar?",
  "O que você perderia se mudasse completamente?",
  "Como seria sua vida sem esses defeitos?"
]'::jsonb,
true),

(7, 'Humildade - Pedindo Transformação',
'Humildemente rogamos a Ele que nos livrasse de nossas imperfeições.',
35,
NULL,
NULL,
'[
  {"id": "7a", "type": "text", "title": "Oração de libertação", "description": "Escreva uma oração pedindo para ser livre de cada defeito identificado"},
  {"id": "7b", "type": "text", "title": "Visão do novo eu", "description": "Descreva quem você será sem esses defeitos"},
  {"id": "7c", "type": "checklist", "title": "Compromissos diários", "items": ["Praticar humildade", "Pedir ajuda quando precisar", "Reconhecer limitações", "Agradecer progressos"]}
]'::jsonb,
'[
  "O que humildade significa para você?",
  "Qual é a diferença entre humildade e humilhação?",
  "Como você pode praticar humildade hoje?"
]'::jsonb,
true),

(8, 'Lista de Reparações',
'Fizemos uma lista de todas as pessoas que tínhamos prejudicado e nos dispusemos a reparar os danos a elas causados.',
50,
NULL,
NULL,
'[
  {"id": "8a", "type": "text", "title": "Lista de pessoas prejudicadas", "description": "Nome, o que fez, como afetou a pessoa"},
  {"id": "8b", "type": "checklist", "title": "Categorias de danos", "items": ["Danos financeiros", "Danos emocionais", "Danos físicos", "Quebra de confiança", "Negligência", "Mentiras"]},
  {"id": "8c", "type": "text", "title": "Sua parte em cada situação", "description": "Independente do que os outros fizeram, qual foi sua responsabilidade?"}
]'::jsonb,
'[
  "Há alguém que você teme incluir na lista?",
  "Como você se prejudicou também?",
  "O que te impede de querer reparar?"
]'::jsonb,
true),

(9, 'Reparações Diretas',
'Fizemos reparações diretas dos danos causados a tais pessoas, sempre que possível, salvo quando fazê-lo significasse prejudicá-las ou a outrem.',
55,
NULL,
NULL,
'[
  {"id": "9a", "type": "checklist", "title": "Antes de fazer reparação", "items": ["Consultei meu padrinho/madrinha", "Considerei se vai prejudicar alguém", "Estou fazendo por mim, não por aprovação", "Não tenho expectativas de resposta"]},
  {"id": "9b", "type": "text", "title": "Plano de reparação", "description": "Para cada pessoa, descreva como planeja reparar"},
  {"id": "9c", "type": "text", "title": "Registro de reparações feitas", "description": "Documente cada reparação: data, pessoa, o que disse/fez, como se sentiu"}
]'::jsonb,
'[
  "Qual reparação te assusta mais?",
  "Como você lidará se a pessoa não aceitar?",
  "O que você aprendeu sobre si mesmo neste processo?"
]'::jsonb,
true),

(10, 'Inventário Contínuo',
'Continuamos fazendo o inventário pessoal e, quando estávamos errados, nós o admitíamos prontamente.',
40,
NULL,
NULL,
'[
  {"id": "10a", "type": "checklist", "title": "Revisão noturna diária", "items": ["Fui egoísta hoje?", "Fui desonesto?", "Fui ressentido?", "Fui medroso?", "Devo desculpas a alguém?", "Guardei algo para mim?", "Fui gentil e amoroso?", "O que poderia ter feito melhor?"]},
  {"id": "10b", "type": "text", "title": "Diário do dia", "description": "Escreva sobre os eventos significativos do dia"},
  {"id": "10c", "type": "scale", "title": "Como foi seu dia em geral?", "min": 1, "max": 10}
]'::jsonb,
'[
  "Por que a revisão diária é importante?",
  "O que acontece quando você não admite erros?",
  "Como você pode tornar isso um hábito?"
]'::jsonb,
true),

(11, 'Oração e Meditação',
'Procuramos, através da prece e da meditação, melhorar nosso contato consciente com Deus, na forma em que O concebíamos, rogando apenas o conhecimento de Sua vontade em relação a nós, e forças para realizar essa vontade.',
45,
NULL,
NULL,
'[
  {"id": "11a", "type": "checklist", "title": "Práticas espirituais", "items": ["Meditação matinal", "Leitura espiritual", "Oração", "Gratidão", "Silêncio contemplativo", "Conexão com a natureza"]},
  {"id": "11b", "type": "text", "title": "Rotina espiritual diária", "description": "Descreva sua rotina espiritual ideal"},
  {"id": "11c", "type": "text", "title": "Experiências de conexão", "description": "Descreva momentos em que você sentiu uma conexão espiritual"}
]'::jsonb,
'[
  "Como você se conecta com algo maior que você?",
  "O que atrapalha sua prática espiritual?",
  "Que orientação você está buscando?"
]'::jsonb,
true),

(12, 'Serviço - Transmitindo a Mensagem',
'Tendo experimentado um despertar espiritual, graças a estes passos, procuramos transmitir esta mensagem aos adictos e praticar estes princípios em todas as nossas atividades.',
50,
NULL,
NULL,
'[
  {"id": "12a", "type": "text", "title": "Minha história de recuperação", "description": "Escreva sua história: como era, o que aconteceu, como está agora"},
  {"id": "12b", "type": "checklist", "title": "Formas de servir", "items": ["Partilhar em reuniões", "Apadrinhar/amadrinhar", "Trabalho de serviço", "Ajudar recém-chegados", "Ser exemplo", "Compartilhar experiência"]},
  {"id": "12c", "type": "text", "title": "Compromisso de serviço", "description": "Como você vai retribuir o que recebeu?"}
]'::jsonb,
'[
  "O que significa despertar espiritual para você?",
  "Como você pode ajudar outros sem prejudicar sua recuperação?",
  "Que princípios você pratica no dia a dia?"
]'::jsonb,
true)
ON CONFLICT (step_number) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  duration_minutes = EXCLUDED.duration_minutes,
  exercises = EXCLUDED.exercises,
  reflection_questions = EXCLUDED.reflection_questions;

-- Create unique constraint on step_number if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'journey_steps_step_number_key') THEN
    ALTER TABLE public.journey_steps ADD CONSTRAINT journey_steps_step_number_key UNIQUE (step_number);
  END IF;
END
$$;