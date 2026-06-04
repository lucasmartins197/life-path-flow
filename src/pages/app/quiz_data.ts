// Quiz data para cada passo da jornada
export const STEP_QUIZ: Record<number, {
  questions: {
    text: string;
    options: string[];
    correct: number;
  }[];
  depositoPrompt: string;
}> = {
  1: {
    questions: [
      {
        text: "O que significa 'reconhecer' o problema com apostas?",
        options: [
          "Admitir que perdeu o controle e que o vício é real",
          "Contar para os amigos que aposta às vezes",
          "Decidir apostar menos a partir de hoje",
          "Aceitar que apostas são normais na vida"
        ],
        correct: 0
      },
      {
        text: "Por que o reconhecimento é considerado o passo mais difícil?",
        options: [
          "Porque exige muito dinheiro",
          "Porque o viciado geralmente nega que tem um problema",
          "Porque é o último passo da recuperação",
          "Porque precisa de ajuda médica imediata"
        ],
        correct: 1
      },
      {
        text: "Qual sentimento é mais comum ao admitir o vício pela primeira vez?",
        options: [
          "Alegria e entusiasmo",
          "Indiferença total",
          "Vergonha e medo, mas também alívio",
          "Raiva dos outros"
        ],
        correct: 2
      }
    ],
    depositoPrompt: "Descreva com suas próprias palavras: como você percebeu que perdeu o controle? O que mudou na sua vida por causa das apostas?"
  },
  2: {
    questions: [
      {
        text: "O que representa o Passo 2 'Esperança' na recuperação?",
        options: [
          "Acreditar que uma força maior pode nos ajudar a recuperar",
          "Esperar que o problema se resolva sozinho",
          "Ter esperança de ganhar nas apostas",
          "Aguardar que alguém resolva seus problemas"
        ],
        correct: 0
      },
      {
        text: "Por que é importante acreditar que a recuperação é possível?",
        options: [
          "Para impresionar os familiares",
          "Porque sem esperança não há motivação para mudar",
          "Porque os médicos exigem isso",
          "Para conseguir empréstimo bancário"
        ],
        correct: 1
      },
      {
        text: "A esperança na recuperação vem de:",
        options: [
          "Ganhar na loteria e quitar as dívidas",
          "Exemplos de outras pessoas que se recuperaram",
          "Prometer para si mesmo que vai parar",
          "Tomar remédios controlados"
        ],
        correct: 1
      }
    ],
    depositoPrompt: "O que te dá esperança de que você pode se recuperar? Cite uma pessoa, história ou razão que te faz acreditar que a mudança é possível."
  },
  3: {
    questions: [
      {
        text: "O Passo 3 'Entrega' significa:",
        options: [
          "Desistir de tudo e não fazer mais nada",
          "Confiar em algo maior que si mesmo e pedir ajuda",
          "Entregar dinheiro para custódia de terceiros",
          "Aceitar que nunca vai melhorar"
        ],
        correct: 1
      },
      {
        text: "Por que pedir ajuda é sinal de força, não fraqueza?",
        options: [
          "Porque todo mundo faz isso",
          "Porque reconhecer os limites e buscar apoio requer coragem",
          "Porque é obrigatório por lei",
          "Porque os médicos recomendam"
        ],
        correct: 1
      },
      {
        text: "Quem pode ser um 'apoio maior' no Passo 3?",
        options: [
          "Apenas religiosos e pastores",
          "Família, grupo de apoio, terapeuta ou crença espiritual",
          "Somente médicos psiquiatras",
          "Apenas o próprio viciado"
        ],
        correct: 1
      }
    ],
    depositoPrompt: "Em quem ou no quê você confia para te apoiar nessa jornada? Como foi a experiência de pedir ajuda pela primeira vez?"
  },
  4: {
    questions: [
      {
        text: "O que é um 'gatilho' no contexto da recuperação?",
        options: [
          "Uma arma usada por viciados",
          "Uma situação, emoção ou lugar que desperta o desejo de apostar",
          "Um exercício físico recomendado",
          "Um aplicativo de bloqueio"
        ],
        correct: 1
      },
      {
        text: "Por que é importante fazer um inventário pessoal?",
        options: [
          "Para mostrar para o médico",
          "Para conhecer seus pontos fracos e se preparar para eles",
          "Para cadastrar no app obrigatoriamente",
          "Para impressionar familiares"
        ],
        correct: 1
      },
      {
        text: "Quais são exemplos comuns de gatilhos para apostas?",
        options: [
          "Comer, dormir e fazer exercícios",
          "Estresse, dinheiro disponível, propaganda e solidão",
          "Trabalho e estudos apenas",
          "Dormir cedo e acordar tarde"
        ],
        correct: 1
      }
    ],
    depositoPrompt: "Quais são seus principais gatilhos? Descreva uma situação em que sentiu forte vontade de apostar e o que estava acontecendo naquele momento."
  },
  5: {
    questions: [
      {
        text: "Por que falar a verdade sobre o vício é terapêutico?",
        options: [
          "Porque os outros vão resolver o problema por você",
          "Porque o segredo mantém a vergonha viva e fortalece o vício",
          "Porque é obrigatório por lei",
          "Porque você ganha dinheiro por isso"
        ],
        correct: 1
      },
      {
        text: "O que acontece quando você admite o problema para alguém de confiança?",
        options: [
          "A pessoa vai te julgar e afastar",
          "A vergonha diminui e você se sente menos sozinho",
          "Você automaticamente para de apostar",
          "Nada muda de fato"
        ],
        correct: 1
      },
      {
        text: "Qual é o risco de guardar segredo sobre o vício?",
        options: [
          "Nenhum risco, é o melhor a fazer",
          "O isolamento alimenta o ciclo do vício",
          "As pessoas vão te admirar mais",
          "Você economiza dinheiro"
        ],
        correct: 1
      }
    ],
    depositoPrompt: "Existe algo que você nunca contou para ninguém sobre seu vício? Como você se sente carregando esse peso sozinho? Escreva aqui com segurança."
  },
  6: {
    questions: [
      {
        text: "O que significa 'disponibilidade' na recuperação?",
        options: [
          "Estar disponível para apostar quando quiser",
          "Estar aberto para mudar hábitos e rotinas que alimentavam o vício",
          "Ter tempo livre para fazer nada",
          "Disponibilizar dinheiro para tratamento"
        ],
        correct: 1
      },
      {
        text: "Por que a rotina diária é importante na recuperação?",
        options: [
          "Para se ocupar e reduzir o tempo ocioso que pode levar à recaída",
          "Porque médicos obrigam",
          "Para ganhar mais dinheiro",
          "Não tem importância real"
        ],
        correct: 0
      },
      {
        text: "Quais hábitos saudáveis ajudam a substituir o tempo gasto apostando?",
        options: [
          "Dormir o dia todo",
          "Exercício, hobbies, conexões sociais e voluntariado",
          "Trabalhar 24 horas por dia",
          "Assistir apostas de outras pessoas"
        ],
        correct: 1
      }
    ],
    depositoPrompt: "Que mudanças de hábito você já fez ou planeja fazer? Como sua rotina vai ser diferente a partir de agora?"
  },
  7: {
    questions: [
      {
        text: "O que é 'humildade' no processo de recuperação?",
        options: [
          "Se humilhar perante os outros",
          "Reconhecer que não consegue se recuperar sozinho e aceitar ajuda",
          "Ser fraco e dependente",
          "Pedir dinheiro emprestado"
        ],
        correct: 1
      },
      {
        text: "Por que a terapia profissional é importante na ludopatia?",
        options: [
          "Porque é obrigatória por lei",
          "Porque o terapeuta ajuda a entender causas profundas e desenvolver estratégias",
          "Apenas para casos graves",
          "Para conseguir atestado médico"
        ],
        correct: 1
      },
      {
        text: "Qual é uma barreira comum para buscar terapia?",
        options: [
          "Falta de tempo e vergonha de admitir que precisa de ajuda",
          "Alto custo sempre inviabiliza",
          "Terapeutas não entendem do assunto",
          "Não há terapeutas disponíveis"
        ],
        correct: 0
      }
    ],
    depositoPrompt: "Como foi sua experiência buscando ajuda profissional? O que você espera da terapia e quais medos ainda tem em relação a esse processo?"
  },
  8: {
    questions: [
      {
        text: "O que o Passo 8 'Reparação' propõe fazer?",
        options: [
          "Esquecer o passado e fingir que nada aconteceu",
          "Reconhecer os danos causados e se dispor a repará-los",
          "Cobrar dos outros o que te devem",
          "Pedir desconto nas dívidas"
        ],
        correct: 1
      },
      {
        text: "Por que enfrentar as dívidas é parte da recuperação?",
        options: [
          "Porque o banco exige",
          "Porque carregar dívidas gera estresse que pode levar à recaída",
          "Para impressionar a família",
          "Não tem relação com a recuperação"
        ],
        correct: 1
      },
      {
        text: "Qual é o primeiro passo para lidar com dívidas de forma saudável?",
        options: [
          "Ignorá-las e esperar prescreverem",
          "Mapear tudo que se deve e criar um plano realista",
          "Pedir mais empréstimos para pagar",
          "Fugir dos credores"
        ],
        correct: 1
      }
    ],
    depositoPrompt: "Quais danos o vício causou na sua vida financeira e nos seus relacionamentos? O que você deseja reparar primeiro e como planeja fazer isso?"
  },
  9: {
    questions: [
      {
        text: "O que é o check-in diário na recuperação?",
        options: [
          "Checar o saldo bancário todo dia",
          "Registrar presença e estado emocional diariamente para manter consciência",
          "Reportar para a polícia",
          "Checar apostas de outros"
        ],
        correct: 1
      },
      {
        text: "Por que a consistência diária é mais importante que grandes gestos esporádicos?",
        options: [
          "Porque pequenas ações diárias constroem novos hábitos e identidade",
          "Porque é mais fácil",
          "Porque médicos recomendam",
          "Não faz diferença"
        ],
        correct: 0
      },
      {
        text: "O que fazer em um dia difícil quando a vontade de apostar aumenta?",
        options: [
          "Ceder um pouco para diminuir a ansiedade",
          "Usar as ferramentas do app, acionar o âncora e buscar apoio",
          "Ignorar e esperar passar sozinho",
          "Evitar todas as pessoas"
        ],
        correct: 1
      }
    ],
    depositoPrompt: "Como você se sente quando consegue passar um dia sem apostar? Descreva um dia difícil que você superou e o que te ajudou naquele momento."
  },
  10: {
    questions: [
      {
        text: "O que significa 'vigilância' na recuperação?",
        options: [
          "Espionar outros viciados",
          "Manter atenção constante aos sinais de recaída e não baixar a guarda",
          "Contratar segurança particular",
          "Vigiar o celular do parceiro"
        ],
        correct: 1
      },
      {
        text: "Quando o risco de recaída é maior?",
        options: [
          "Nos primeiros dias apenas",
          "Pode acontecer a qualquer momento, especialmente em momentos de estresse",
          "Apenas quando há dinheiro disponível",
          "Somente em finais de semana"
        ],
        correct: 1
      },
      {
        text: "Quais sinais indicam que uma recaída pode estar se aproximando?",
        options: [
          "Estar feliz e satisfeito",
          "Pensamentos frequentes em apostas, isolamento e minimizar o problema",
          "Dormir bem e comer direito",
          "Trabalhar muito"
        ],
        correct: 1
      }
    ],
    depositoPrompt: "Quais sinais de alerta você já identificou em você mesmo antes de uma recaída? Como você pretende agir ao perceber esses sinais no futuro?"
  },
  11: {
    questions: [
      {
        text: "O que representa o Passo 11 'Conexão Final'?",
        options: [
          "Conectar na internet para apostar",
          "Fortalecer vínculos com propósito de vida, família e comunidade",
          "Fazer conexões de negócios",
          "Conectar dispositivos eletrônicos"
        ],
        correct: 1
      },
      {
        text: "Por que ter propósito de vida ajuda na recuperação?",
        options: [
          "Porque dá status social",
          "Porque quando há razões para viver bem, o jogo perde poder de atração",
          "Porque é exigido pelo programa",
          "Não tem relação com a recuperação"
        ],
        correct: 1
      },
      {
        text: "Quais são exemplos de conexões que fortalecem a recuperação?",
        options: [
          "Grupos de apostas e cassinos",
          "Família, amigos saudáveis, grupos de apoio e voluntariado",
          "Redes sociais e influenciadores",
          "Trabalho exclusivamente"
        ],
        correct: 1
      }
    ],
    depositoPrompt: "Quais conexões na sua vida foram prejudicadas pelo vício? O que você está fazendo para reconstruir esses laços? Qual propósito de vida te move agora?"
  },
  12: {
    questions: [
      {
        text: "O que significa 'repasse' no último passo?",
        options: [
          "Repassar dinheiro para outros viciados",
          "Compartilhar sua experiência para ajudar outros que ainda sofrem",
          "Repassar as apostas para terceiros",
          "Repetir os passos anteriores"
        ],
        correct: 1
      },
      {
        text: "Por que ajudar outros na recuperação beneficia também quem ajuda?",
        options: [
          "Porque você ganha dinheiro por isso",
          "Porque fortalecer outros fortalece seu próprio compromisso com a sobriedade",
          "Porque é obrigatório",
          "Não beneficia quem ajuda"
        ],
        correct: 1
      },
      {
        text: "Completar os 12 passos significa:",
        options: [
          "Que você está curado e pode apostar moderadamente",
          "Que você tem ferramentas para manter a recuperação — é uma jornada contínua",
          "Que o tratamento acabou completamente",
          "Que não precisa mais de apoio"
        ],
        correct: 1
      }
    ],
    depositoPrompt: "Olhando para trás, o que mudou em você durante essa jornada? O que você diria para alguém que está começando agora? Como planeja manter sua recuperação?"
  }
};
