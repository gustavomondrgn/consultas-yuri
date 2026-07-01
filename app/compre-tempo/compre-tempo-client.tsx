"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CHECKOUT_URL,
  INSTAGRAM_URL,
  PRICE_ANCHOR,
  PRICE_CASH,
  PRICE_INSTALLMENT_COUNT,
  PRICE_INSTALLMENT_VALUE,
  TESTIMONIALS,
  type Testimonial,
} from "./config";
import { CountdownBar } from "./countdown-bar";

// ── Primitivas reutilizáveis ────────────────────────────────────────────────

function BuyButton({ label = "QUERO COMPRAR TEMPO" }: { label?: string }) {
  return (
    <a
      href={CHECKOUT_URL}
      className="group inline-flex w-full items-center justify-center gap-2.5 rounded-[6px] bg-[#C9A877] px-7 py-5 text-base font-semibold uppercase tracking-[0.06em] text-[#0A0A0B] shadow-[0_4px_28px_-8px_rgba(201,168,119,0.55)] ring-1 ring-inset ring-[#E9C77B]/40 transition-colors hover:bg-[#D8B988] active:translate-y-px sm:text-lg"
    >
      {label}
      <span className="transition-transform group-hover:translate-x-1">→</span>
    </a>
  );
}

function Stars() {
  return (
    <div className="flex gap-0.5 text-[#E9C77B]" aria-label="5 de 5 estrelas">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} viewBox="0 0 20 20" className="h-4 w-4 fill-current" aria-hidden>
          <path d="M10 1.5l2.6 5.27 5.82.846-4.21 4.104.994 5.795L10 14.85l-5.205 2.736.995-5.795L1.58 7.616l5.82-.846L10 1.5z" />
        </svg>
      ))}
    </div>
  );
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <figure className="mb-4 break-inside-avoid rounded-xl border border-[#9A7B4E]/20 bg-white/[0.03] p-5">
      <Stars />
      <blockquote className="mt-3 font-serif text-lg italic leading-snug text-[#E9C77B]">
        &ldquo;{testimonial.highlight}&rdquo;
      </blockquote>
      <p className="mt-3 text-sm leading-relaxed text-[#FAF6EE]/70">
        {testimonial.text}
      </p>
    </figure>
  );
}

// Imagem real da carta. Frame escuro com borda bronze sutil pra não brigar
// com prints que já têm fundo preto/escuro (caso do dashboard de vendas).
// eslint-disable-next-line @next/next/no-img-element — tráfego é ~48 pessoas,
// next/image aqui é overkill e dificulta as composições (FaturamentoStack).
function CartaImage({
  src,
  alt,
  maxWidth,
}: {
  src: string;
  alt: string;
  maxWidth?: number;
}) {
  return (
    <div
      className="mx-auto my-2 overflow-hidden rounded-xl border border-[#9A7B4E]/25 bg-black/40"
      style={maxWidth ? { maxWidth } : undefined}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} loading="lazy" className="block h-auto w-full" />
    </div>
  );
}

// Composição dos dois prints de faturamento: card de totais (fat-yuri1) em
// cima do calendário mensal (fat-yuri2), dentro de um frame único pra
// parecer um print contínuo do mesmo dashboard.
function FaturamentoStack() {
  return (
    <div className="my-2 overflow-hidden rounded-xl border border-[#9A7B4E]/25 bg-[#161618]">
      <div className="flex flex-col gap-2 p-2 sm:gap-3 sm:p-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/compre-tempo/fat-yuri1.png"
          alt="Resumo de vendas: 96 vendas entre 1 e 23 de maio, R$ 25.418,56 bruto, R$ 23.944,12 líquido"
          loading="lazy"
          className="block h-auto w-full rounded-md"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/compre-tempo/fat-yuri2.png"
          alt="Calendário de vendas diárias em maio de 2026"
          loading="lazy"
          className="block h-auto w-full rounded-md"
        />
      </div>
    </div>
  );
}

/**
 * Destaque amarelo gema pras palavras-chave das headlines. Cor escolhida
 * pra contrastar com o dourado/bronze (#C9A877, #E9C77B) já usado em
 * outros pontos — esse amarelo é mais saturado/vivo, "puxa o olho".
 */
function Hi({ children }: { children: React.ReactNode }) {
  return <span className="text-[#FFD24A]">{children}</span>;
}

/**
 * Bloco de uma seção da carta: headline (H2) + corpo. O brief pede que
 * lendo SÓ as headlines a pessoa entenda a oferta inteira — por isso o H2
 * é grande, serifado e as palavras-chave vão em amarelo (<Hi>) pra
 * escanear ainda mais rápido.
 */
function Section({
  headline,
  children,
}: {
  headline: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="flex w-full flex-col gap-5">
      <h2 className="font-serif text-3xl font-semibold leading-[1.15] tracking-tight text-[#FAF6EE] sm:text-[2.25rem]">
        {headline}
      </h2>
      <div className="flex flex-col gap-5 text-[17px] leading-[1.75] text-[#FAF6EE]/85 sm:text-lg sm:leading-[1.8]">
        {children}
      </div>
    </section>
  );
}

function SectionDivider() {
  return (
    <div
      className="mx-auto h-px w-16 bg-[#9A7B4E]/30"
      role="presentation"
      aria-hidden
    />
  );
}

// ── Bloco de preço (Seção 6) ────────────────────────────────────────────────

function PriceBlock() {
  return (
    <div className="relative flex flex-col items-center gap-3 rounded-2xl border border-[#9A7B4E]/30 bg-white/[0.025] px-6 py-8 text-center shadow-[0_0_60px_-20px_rgba(201,168,119,0.3)]">
      <p className="text-sm uppercase tracking-[0.22em] text-[#9A7B4E]">
        Sua condição agora
      </p>

      <p className="text-base text-[#FAF6EE]/60">
        De{" "}
        <span className="line-through decoration-[#9A7B4E]/70 decoration-2">
          R$ {PRICE_ANCHOR}
        </span>
      </p>

      <div className="flex items-center justify-center gap-2.5">
        <span className="flex flex-col items-end text-sm font-medium leading-tight text-[#FAF6EE]/75">
          <span>por</span>
          <span>{PRICE_INSTALLMENT_COUNT}</span>
        </span>
        <span className="font-serif text-6xl font-bold leading-none text-[#E9C77B] [font-variant-numeric:lining-nums] drop-shadow-[0_2px_18px_rgba(233,199,123,0.35)] sm:text-7xl">
          R$ {PRICE_INSTALLMENT_VALUE}
        </span>
      </div>

      <p className="text-base text-[#FAF6EE]/75">
        ou{" "}
        <span className="font-semibold text-[#FAF6EE]">R$ {PRICE_CASH}</span> à
        vista no Pix
      </p>

      <div className="mt-2 flex flex-col items-center gap-1">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#C9A877]">
          50% de desconto · só pras primeiras pessoas
        </p>
        <p className="text-xs text-[#FAF6EE]/55">
          Válido enquanto o cronômetro do topo não zerar
        </p>
      </div>
    </div>
  );
}

// ── Lista de entregáveis (Seção 5) ──────────────────────────────────────────

function DeliverableItem({
  title,
  desc,
}: {
  title: string;
  desc: string;
}) {
  return (
    <li className="flex gap-4">
      <span
        className="mt-2 h-[1px] w-6 flex-none bg-[#C9A877]/70"
        aria-hidden
      />
      <div>
        <p className="font-serif text-xl font-semibold text-[#E9C77B] sm:text-2xl">
          {title}
        </p>
        <p className="mt-1 text-[17px] leading-[1.7] text-[#FAF6EE]/80 sm:text-lg">
          {desc}
        </p>
      </div>
    </li>
  );
}

// ── Estado expirado ─────────────────────────────────────────────────────────

function ExpiredState() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-6 px-5 py-24 text-center">
      <h1 className="font-serif text-3xl font-semibold text-[#FAF6EE]">
        Esta oportunidade foi encerrada.
      </h1>
      <p className="text-[#FAF6EE]/70">
        Se você ainda tem interesse, chame o Yuri no direct.
      </p>
      <a
        href={INSTAGRAM_URL}
        className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#9A7B4E]/50 px-6 py-3 text-sm font-medium text-[#C9A877] transition-colors hover:bg-[#9A7B4E]/10"
      >
        Falar com o Yuri no Instagram →
      </a>
    </div>
  );
}

// ── Página ──────────────────────────────────────────────────────────────────

export function CompreTempoClient({
  deadlineMs,
  initiallyExpired,
}: {
  deadlineMs: number;
  initiallyExpired: boolean;
}) {
  const [expired, setExpired] = useState(initiallyExpired);

  const handleExpire = useCallback((value: boolean) => {
    setExpired(value);
  }, []);

  // Scrollbar minimalista (track preto, thumb fino) só nesta rota — outras
  // páginas do app são light-themed e usam a scrollbar default.
  useEffect(() => {
    document.documentElement.classList.add("dark-scroll");
    return () => {
      document.documentElement.classList.remove("dark-scroll");
    };
  }, []);

  // Distribuição: [0] na seção 3, [1] e [2] antes do preço, resto na galeria.
  const proofTestimonial = TESTIMONIALS[0];
  const objectionTestimonials = TESTIMONIALS.slice(1, 3);
  const galleryTestimonials = TESTIMONIALS.slice(3);

  return (
    <main className="min-h-svh w-full bg-[#0A0A0B] text-[#FAF6EE]">
      <CountdownBar deadlineMs={deadlineMs} onExpire={handleExpire} />

      {expired ? (
        <ExpiredState />
      ) : (
        <article className="mx-auto flex w-full max-w-[680px] flex-col gap-14 px-5 py-12 sm:gap-16 sm:py-16">
          {/* ── HERO ─────────────────────────────────────────────────────── */}
          <header className="flex flex-col items-center gap-5 text-center">
            <h1 className="font-serif text-5xl font-semibold leading-none tracking-tight sm:text-6xl">
              Compre Tempo
            </h1>
            <h2 className="max-w-xl text-base leading-relaxed text-[#FAF6EE]/75 sm:text-lg sm:leading-[1.6]">
              Pare de pagar com <Hi>anos de vida</Hi> o que você pode resolver
              em <Hi>uma hora de consulta</Hi>. Sua rota direta pra carreira,
              vocação e dinheiro.
            </h2>
          </header>

          <SectionDivider />

          {/* ── SEÇÃO 1 ─────────────────────────────────────────────────── */}
          <Section
            headline={
              <>
                Em 2021, eu saí de <Hi>mil reais por mês</Hi> pra uma vida que
                eu <Hi>nunca imaginei ter</Hi>
              </>
            }
          >
            <p>
              Se você acabou de receber o seu Diagnóstico, os próximos minutos
              de leitura podem ser os mais importantes que você vai investir
              esse ano.
            </p>
            <p>
              Porque eu vou te contar como, em 2021, eu saí de mil reais por
              mês pra hoje faturar uma coisa que eu nunca, nunca imaginei que
              eu faturaria na vida — e não foi sorte, não foi esforço, e não
              levou dez anos.
            </p>
            <p>Foi uma decisão que eu tomei olhando pra uma coisa só.</p>
            <CartaImage
              src="/compre-tempo/Screenshot_2.png"
              alt="Yuri em 2021, em casa, ambiente simples"
              maxWidth={360}
            />
          </Section>

          {/* ── SEÇÃO 2 ─────────────────────────────────────────────────── */}
          <Section
            headline={
              <>
                <Hi>O pior ano da minha vida</Hi>: pai recente, família pra
                sustentar, <Hi>mil reais no bolso</Hi>
              </>
            }
          >
            <p>2021 foi o pior ano da minha vida.</p>
            <p>
              Eu tinha acabado de ser pai. Minha esposa contava comigo. E eu
              tava ganhando mil reais por mês. Mil reais, com uma família
              inteira pra sustentar.
            </p>
            <p>
              Eu fazia de tudo. Tentava de tudo. E nada engatava. Cada mês era
              uma angústia nova de não saber se ia dar pra pagar as contas.
            </p>
            <p>
              E o pior nem era o dinheiro. O pior era a sensação de tá no
              caminho errado e não saber qual era o certo. De tá remando,
              remando, e não sair do lugar.
            </p>
            <p>
              Eu não sabia se o problema era eu. Se eu não era bom o
              suficiente. Se eu tinha escolhido a profissão errada. Eu só
              sabia que alguma coisa tava muito errada.
            </p>
            <CartaImage
              src="/compre-tempo/photo_2023-08-25_12-15-38.jpg"
              alt="Yuri num leito de hospital, em momento difícil da época"
              maxWidth={420}
            />
          </Section>

          {/* ── SEÇÃO 3 ─────────────────────────────────────────────────── */}
          <Section
            headline={
              <>
                Até que eu olhei pro <Hi>meu próprio mapa</Hi> — e vi o{" "}
                <Hi>caminho que eu vinha ignorando</Hi>
              </>
            }
          >
            <p>Até que eu fiz uma coisa que eu deveria ter feito anos antes.</p>
            <p>
              Eu parei de tentar adivinhar, e fui olhar pro meu próprio mapa.
              Com método. Com técnica. Não como uma leitura boba só pra afagar
              o ego, mas tentando de fato achar soluções novas que ninguém
              poderia me dar melhor que o meu próprio manual de instruções —
              o meu mapa natal.
            </p>
            <p>E o que eu vi mudou tudo.</p>
            <p>
              O meu mapa mostrava, com uma clareza que me deu até medo, qual
              era o caminho que eu tava ignorando. Onde tava o meu dinheiro
              de verdade. Qual era a profissão que eu nasci pra fazer.
            </p>
            <p>
              Era essa. Era ser astrólogo. Era ler mapas pra outras pessoas
              do jeito que eu acabei de ler o meu. Eu só não tinha visto
              porque ninguém tinha me mostrado como olhar.
            </p>
            <p>
              E o resultado disso? Olha, eu não vou te prometer milhão,
              porque eu odeio esse tipo de promessa.
            </p>
            <p>
              Hoje eu faturo, num mês bom, entre vinte e trinta mil reais.
              Num mês ruim, dez, quinze mil. E o meu custo de vida é uns
              cinco mil por mês.
            </p>
            <p>
              Pode parecer pouco pra muita gente. Mas pra quem ganhava mil
              reais e não sabia se ia conseguir pagar a conta no fim do mês —
              isso aqui é uma vida que eu nunca, jamais, imaginei que eu
              fosse ter. Eu não achava que eu fosse capaz de ganhar nem
              cinco mil num mês. E hoje isso é o meu pior cenário.
            </p>
            <FaturamentoStack />
          </Section>

          {/* Depoimento #1 — logo após a prova de que funcionou */}
          {proofTestimonial && (
            <div className="mx-auto w-full max-w-[560px]">
              <TestimonialCard testimonial={proofTestimonial} />
            </div>
          )}

          {/* ── SEÇÃO 4 ─────────────────────────────────────────────────── */}
          <Section
            headline={
              <>
                Eu não fiquei rico. Eu fiz algo melhor:{" "}
                <Hi>parei de perder tempo no caminho errado</Hi>
              </>
            }
          >
            <p>Presta atenção no que eu vou falar agora, porque é aqui que mora tudo.</p>
            <p>
              Eu não fiquei rico. E não é isso que eu tô te vendendo. O que
              aconteceu foi melhor: eu parei de perder tempo no caminho
              errado.
            </p>
            <p>
              Imagina se eu tivesse demorado mais dez anos pra ver isso.
              Vinte anos. Imagina se eu descobrisse aos quarenta e cinco o
              que eu descobri aos vinte e poucos.
            </p>
            <p>
              Na vida, você tem mil portas na sua frente. Mil escolhas de
              carreira, de caminho, de em que apostar a sua energia. A
              maioria leva pro mesmo lugar: trabalhar a vida toda sem sair
              do lugar.
            </p>
            <p>
              O que o mapa faz é te mostrar qual porta abrir — antes de você
              gastar dez anos descobrindo no susto.
            </p>
            <p>
              E é por isso que eu chamo isso de comprar tempo. Porque a
              coisa mais cara que existe não é dinheiro. É o ano que você
              não volta. É a década que você queima no caminho errado.
            </p>
            <CartaImage
              src="/compre-tempo/corredor-de-portas.png"
              alt="Corredor escuro com muitas portas fechadas e uma única porta iluminada de luz dourada"
            />
          </Section>

          {/* ── SEÇÃO 5 ─────────────────────────────────────────────────── */}
          <Section
            headline={
              <>
                O Diagnóstico foi o <Hi>raio-x</Hi>. A consulta Compre Tempo é{" "}
                <Hi>o caminho</Hi>
              </>
            }
          >
            <p>
              O Diagnóstico que você recebeu te deu um raio-x. Mostrou o seu
              potencial, o seu Score, o seu gargalo. Mas raio-x não é
              tratamento. Diagnóstico não é o caminho — é o mapa do terreno.
            </p>
            <p>
              Por isso eu criei a consulta{" "}
              <strong className="font-semibold text-[#E9C77B]">
                Compre Tempo
              </strong>
              .
            </p>
            <p>
              É uma consulta ao vivo, comigo, de uma hora. Onde eu pego o
              seu mapa e a gente traça, juntos, o seu plano real nas três
              áreas que mais importam:
            </p>

            <ul className="my-2 flex flex-col gap-5 border-l border-[#9A7B4E]/25 pl-1">
              <DeliverableItem
                title="Vocação"
                desc="qual é a profissão que você nasceu pra fazer, e que talvez você esteja ignorando agora."
              />
              <DeliverableItem
                title="Trabalho"
                desc="como executar isso na prática, passo a passo, a partir de onde você tá hoje."
              />
              <DeliverableItem
                title="Dinheiro"
                desc="a rota concreta entre o seu potencial e a sua conta bancária."
              />
            </ul>

            <p>
              Você sai com a gravação completa e a transcrição, pra
              reconsumir quantas vezes quiser e garantir que você se
              manterá no caminho correto.
            </p>
          </Section>

          {/* Depoimentos #2 e #3 — antes do preço */}
          {objectionTestimonials.length > 0 && (
            <div className="grid w-full gap-4 sm:grid-cols-2">
              {objectionTestimonials.map((t, i) => (
                <TestimonialCard key={i} testimonial={t} />
              ))}
            </div>
          )}

          {/* ── SEÇÃO 6 ─────────────────────────────────────────────────── */}
          <Section
            headline={
              <>
                Uma consulta inédita. Pra quem chega primeiro,{" "}
                <Hi>metade do preço</Hi>
              </>
            }
          >
            <p>
              Essa consulta, a Compre Tempo, é uma coisa nova. Eu tô criando
              ela agora. Ela nunca existiu antes. E quando ela entrar no ar
              pra todo mundo, o preço dela vai ser novecentos e noventa e
              sete reais.
            </p>
            <p>
              Mas eu tenho um princípio. Eu sempre faço questão de honrar as
              primeiras pessoas de qualquer coisa que eu lanço. As pessoas
              que confiam antes de todo mundo, que entram primeiro.
            </p>
            <p>
              E você é uma dessas pessoas. Você acabou de confiar e receber
              o seu Diagnóstico de Potencial de Riqueza. Você já tá aqui
              comigo nessa jornada.
            </p>

            <PriceBlock />

            <p>
              Quando esse contador zerar, essa página sai do ar. E a próxima
              vez que essa consulta aparecer, vai ser pelo preço cheio: 997.
            </p>
          </Section>

          {/* ── SEÇÃO 7 — FECHAMENTO ────────────────────────────────────── */}
          <Section
            headline={
              <>
                A coisa mais importante que você faz na vida são as{" "}
                <Hi>suas decisões</Hi>
              </>
            }
          >
            <p>
              Vou ser honesto com você. A coisa mais importante que você
              faz na vida são as suas decisões. As boas te levam pra
              frente. As erradas te custam anos.
            </p>
            <p>
              E a astrologia, quando bem usada, é a melhor ferramenta que
              existe pra você tomar boas decisões. É por isso que isso aqui
              devia ser prioridade na sua vida.
            </p>
            <p>
              Então para de tatear no escuro. Para de tentar sozinho,
              correndo o risco de perder cinco, dez anos no caminho
              errado. Correndo o risco de olhar pra trás um dia e se
              arrepender de não ter tido clareza quando dava tempo.
            </p>
            <p>Toma essa decisão. Decide comprar tempo. Decide fazer essa consulta.</p>

            <div className="mt-2 flex w-full flex-col items-center gap-3">
              <BuyButton label="GARANTIR MINHA CONSULTA" />
              <p className="text-center text-xs text-[#FAF6EE]/55">
                Clica no botão e garante o seu agendamento antes do cronômetro
                no topo zerar.
              </p>
            </div>
          </Section>

          {/* ── SEÇÃO 8 — GALERIA DE DEPOIMENTOS ────────────────────────── */}
          {galleryTestimonials.length > 0 && (
            <section className="flex w-full flex-col items-center gap-6">
              <h3 className="text-xs font-medium uppercase tracking-[0.18em] text-[#9A7B4E]">
                Quem já viveu isso
              </h3>
              {/* Masonry: 1 coluna no mobile, 2 no desktop. Cards de alturas
                  variadas encaixam sem buracos (estilo Pinterest). */}
              <div className="w-full gap-4 [column-fill:balance] columns-1 sm:columns-2">
                {galleryTestimonials.map((t, i) => (
                  <TestimonialCard key={i} testimonial={t} />
                ))}
              </div>

              {/* Segundo CTA pra quem rolou até o fim */}
              <div className="flex w-full max-w-md flex-col items-center gap-3 pt-4">
                <p className="font-serif text-xl italic text-[#FAF6EE]/85">
                  Ok, estou convencido.
                </p>
                <BuyButton label="GARANTIR MINHA CONSULTA" />
              </div>
            </section>
          )}

          {/* ── RODAPÉ ──────────────────────────────────────────────────── */}
          <footer className="flex flex-col items-center gap-1 pt-6 text-center text-xs text-[#FAF6EE]/40">
            <span>Yuri dos Anjos</span>
            <span>Consulta individual · vagas limitadas</span>
          </footer>
        </article>
      )}
    </main>
  );
}
