// ─────────────────────────────────────────────────────────────────────────────
// CONFIG — "Compre Tempo" (Carta de vendas em texto)
// Todos os valores que o Gustavo precisa editar pra liberar a campanha estão aqui.
// ─────────────────────────────────────────────────────────────────────────────

// O cronômetro NÃO é mais uma data global fixa. Agora cada pessoa recebe um
// link único (?u=<token>) e o prazo é POR PESSOA: 48h a partir do 1º acesso,
// carimbado no servidor (Notion) e à prova de reset. Ver lib/notion.ts e
// app/compre-tempo/page.tsx.

/**
 * URL do checkout (InfinitePay) pra onde os botões de compra levam.
 * Pode ser sobrescrita pela env NEXT_PUBLIC_COMPRE_TEMPO_CHECKOUT_URL.
 */
export const CHECKOUT_URL =
  process.env.NEXT_PUBLIC_COMPRE_TEMPO_CHECKOUT_URL ??
  "https://loja.infinitepay.io/yuri_lucimar/bvv6015-compre-tempo-sua-rota-direta-pra-carreira-";

/** Link do Instagram do Yuri (fallback quando a oferta expira). */
export const INSTAGRAM_URL = "https://ig.me/m/oyuridosanjos";

// Ancoragem de preço. Strings já formatadas em pt-BR, SEM o "R$" (o componente
// adiciona). Layout: De ~997~ / por 12x [VALOR GRANDE] / ou [à vista].
export const PRICE_ANCHOR = "997,00"; // valor cheio, riscado
export const PRICE_INSTALLMENT_COUNT = "12x"; // nº de parcelas
export const PRICE_INSTALLMENT_VALUE = "48,00"; // valor de CADA parcela (destaque grande)
export const PRICE_CASH = "497,00"; // à vista — ⚠️ CONFIRMAR com o Gustavo (ele falou "49,77", não bate)

/**
 * Depoimentos renderizados como cards (sem nome, sem foto — privacidade).
 * `highlight` = frase-chave em destaque no topo (entre aspas).
 * `text` = depoimento completo logo abaixo.
 * Transcritos dos prints originais; nomes removidos. Ordem = ordem de exibição.
 *
 * Distribuição na página:
 *   - [0]            → logo após a Seção 3 (prova de resultado)
 *   - [1] e [2]      → entre Seção 5 e Seção 6 (objeção de preço)
 *   - [3..]          → galeria masonry final (Seção 8)
 */
export type Testimonial = {
  highlight: string;
  text: string;
};

export const TESTIMONIALS: Testimonial[] = [
  {
    highlight: "Na parte da vida financeira realmente acertou.",
    text: "Queria agradecer pela revolução solar que você fez. Na parte da vida financeira realmente acertou: ganhei um aumento de salário no trabalho e vou receber um bônus.",
  },
  {
    highlight: "Você está vendendo praticamente de graça — pagaria o dobro, fácil!",
    text: "Estou até agora em choque com a consulta. Você não faz ideia do quanto me ajudou. Eu já estava achando a consulta de áudio barata, mas depois de ter pago menos de mil reais nessa caixa de Pandora, percebo que você está vendendo praticamente de graça. Pagaria o dobro fácil! Que Deus abençoe você e sua família. Te agradeço demais pela consulta.",
  },
  {
    highlight: "Você basicamente decifrou todos os meus problemas mais profundos.",
    text: "Cara, surreal sua análise do meu mapa. Eu não imaginava que seria tão bom assim. Você basicamente decifrou todos os meus problemas mais profundos. Não imaginava mesmo que era assim — pensei que seria mais superficial.",
  },
  {
    highlight:
      "Quanto custa ficar perdido, sem saber onde aplicar seu tempo, energia e dinheiro?",
    text: "Venho agradecer pela consulta, de onde tiramos soluções para a minha vida, que anda bem complicada. Mas agora, graças à sua análise, tenho direcionamento do que fazer. Para quem está pensando em se consultar: apenas faça. Pense — quanto custa ficar perdido, sem saber onde aplicar seu tempo, energia e dinheiro? E quanto vale saber exatamente o que está pesando na sua vida, como melhorar os pontos fracos e direcionar corretamente os fortes? É melhor fazer a consulta: ela é um investimento.",
  },
  {
    highlight: "Se tivesse que recomendar com uma palavra, eu diria: FAÇA, FAÇA, FAÇA!",
    text: "Se tivesse que recomendar a consulta do Yuri com uma palavra, eu diria: FAÇA! E repetiria: FAÇA, FAÇA, FAÇA! Ele me ajudou a identificar várias inclinações da minha personalidade que estavam me levando por um caminho decadente e, além disso, me deu soluções práticas de como eu poderia progredir no autoconhecimento. Ajudou-me até a entender em que tipo de estudo eu deveria me dedicar. Hoje tenho certeza de que qualquer pessoa que fizer a consulta vai conhecer melhor a si mesma.",
  },
  {
    highlight: "Estou até meio arrependido… de não ter feito antes!",
    text: "Boa noite, professor Yuri. Agora tive um tempo para ver o mapa escrito e dar um feedback. Cara, em primeiro lugar: estou até meio arrependido de não ter feito antes! A riqueza de detalhes, a descrição da nossa natureza através dos símbolos dos astros, que por si só já nos faz ter uma direção melhor na vida — das nossas melhores e piores possibilidades. Magnífico mesmo. Toda a leitura que você fez foi absolutamente sensacional, de verdade. Muito obrigado!",
  },
  {
    highlight: "Ao final da consulta eu tenho certeza: você é macumbeiro!",
    text: "Quero te dar meu feedback sobre a consulta astrológica: ela foi muito boa — e acima daquilo que eu esperava. Agora consigo compreender as minhas inclinações e entender o motivo daquilo que eu faço; consigo conhecer os meus defeitos e lutar contra eles, usando-os como um caminho de santificação. Sem contar a certeza de que estou no caminho certo para a realização do meu plano de vida, totalmente de acordo com o meu mapa. E, ao final da consulta, não acho mais: agora eu tenho certeza, você é macumbeiro!",
  },
  {
    highlight:
      "O relatório mais assertivo e objetivo que já vi — depois de inúmeras consultas.",
    text: "Depois de inúmeras consultas, seja com astrólogos tradicionais, modernos ou cabalísticos, o seu relatório escrito de mapa natal é, sem dúvida, o mais assertivo e objetivo que já vi. Entrega exatamente o que se espera de uma leitura de mapa natal: o apontamento das facilidades e dificuldades no decorrer da vida, na medida exata para deixar o leitor reflexivo e dar ferramentas para o autoconhecimento.",
  },
  {
    highlight:
      "Problemas que pareciam obscuros e difíceis ficaram claríssimos e simples.",
    text: "Estou muitíssimo satisfeito com a consultoria. Muito mesmo. Problemas que pra mim pareciam obscuros e difíceis de resolver agora ficaram claríssimos e simples de solucionar. Saí muito feliz e até hoje comento sobre o que conversamos. Você me deu explicações diretas, simples e práticas pra melhorar o que me atrapalha. Me sinto bem mais tranquilo e confiante, com a certeza de que vou conseguir agir e atingir meus objetivos.",
  },
  {
    highlight: "Foi muito certeiro — realmente aconteceu o que você apontou.",
    text: "Foi muito certeiro: realmente aconteceu esse 'algo' na minha empresa que me desmotivou, e vou pedir demissão. Pro meu chefe eu não trabalho nunca mais.",
  },
  {
    highlight: "Como se a venda tivesse caído dos olhos.",
    text: "A melhor experiência que tive nos últimos tempos. Como se a venda tivesse caído dos olhos — agora posso me preparar e tomar decisões mais acertadas.",
  },
  {
    highlight: "Eu tinha um pouco de receio, mas foi totalmente esclarecedor.",
    text: "Gostaria de agradecer pela consulta e pelo mapa. Eu tinha um pouco de receio, mas foi totalmente esclarecedor. Me mostrou diversos pontos importantes e me deu um bom norte para seguir e mudar certas coisas. Sua análise acertou diversos pontos da minha personalidade. Recomendo a todos.",
  },
  {
    highlight: "Mesmo quem já está bem encaminhado tira proveito.",
    text: "Tenho certeza de que mesmo quem está muito bem encaminhado — ótima carreira, excelente saúde, uma parceria incrível, filhos maravilhosos — poderia tirar proveito, nem que seja com perguntas de como melhorar e aperfeiçoar ainda mais. Imagina então a maioria de nós.",
  },
  {
    highlight: "Tu fez meu interesse por astrologia crescer.",
    text: "Eu só tenho a te agradecer pelas consultas. Sensacional. Tu fez o meu interesse por astrologia crescer: comecei a estudar e pretendo comprar o seu curso. Já estou conseguindo ajudar algumas pessoas com certos problemas através do mapa natal. Obrigado por tudo — você está sempre nas minhas orações.",
  },
  {
    highlight: "Percebi o quanto fiquei tranquilo depois da consulta.",
    text: "Relendo as anotações que fiz da consulta, percebo o quanto fiquei tranquilo depois dela. Você me direcionou quanto ao meu medo, à questão de lidar com as dificuldades materiais, às sugestões de hobby para motivação e foco, e às dicas de paternidade. Sou extremamente grato. O senhor foi extremamente detalhista e claro — bateu tudo certinho.",
  },
  {
    highlight: "Um alívio saber que estou caminhando no certo.",
    text: "Sua consulta foi muito esclarecedora e também um alívio: saber que em alguns setores já estou caminhando no certo, melhorando o ciclo que vivo e entendendo o que dá pra evitar. Tu tem uma comunicação ótima e muito simples de entender. Quando for fazer o próximo mapa, vou indicar pra minha irmã, que também tem interesse nessa busca por autoconhecimento.",
  },
];
