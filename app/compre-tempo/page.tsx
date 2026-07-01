import type { Metadata } from "next";
import { Playfair_Display } from "next/font/google";
import { CompreTempoClient } from "./compre-tempo-client";
import { INSTAGRAM_URL } from "./config";
import { resolveDeadline } from "@/lib/notion";

// Serifada elegante e de traço firme (alto contraste, serifas retas) só pros
// títulos/preço desta rota — não vaza pro resto do app.
const serif = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Compre Tempo · Yuri dos Anjos",
  description:
    "Pare de pagar com anos de vida o que você pode resolver em uma hora de consulta.",
  robots: { index: false, follow: false },
};

// Depende do ?u= e carimba o prazo no Notion no 1º acesso → nunca cacheia.
export const dynamic = "force-dynamic";

export default async function CompreTempoPage({
  searchParams,
}: {
  searchParams: Promise<{ u?: string }>;
}) {
  const { u } = await searchParams;

  // Sem token, token inválido ou Notion fora do ar → tela de link inválido.
  let deadlineMs: number | null = null;
  if (u) {
    try {
      const r = await resolveDeadline(u);
      deadlineMs = r?.deadlineMs ?? null;
    } catch {
      deadlineMs = null;
    }
  }

  return (
    <div className={serif.variable}>
      {deadlineMs === null ? (
        <InvalidLink />
      ) : (
        <CompreTempoClient
          deadlineMs={deadlineMs}
          initiallyExpired={deadlineMs <= Date.now()}
        />
      )}
    </div>
  );
}

// Link ausente/inválido: não mostra a carta, manda falar com o Yuri.
function InvalidLink() {
  return (
    <main className="flex min-h-svh w-full flex-col items-center justify-center gap-6 bg-[#0A0A0B] px-5 py-24 text-center text-[#FAF6EE]">
      <h1 className="font-serif text-3xl font-semibold">
        Link inválido ou expirado
      </h1>
      <p className="max-w-md text-[#FAF6EE]/70">
        Este link de acesso não é válido. Se você recebeu o seu Diagnóstico e
        quer a consulta Compre Tempo, chame o Yuri no direct que ele te reenvia.
      </p>
      <a
        href={INSTAGRAM_URL}
        className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#9A7B4E]/50 px-6 py-3 text-sm font-medium text-[#C9A877] transition-colors hover:bg-[#9A7B4E]/10"
      >
        Falar com o Yuri no Instagram →
      </a>
    </main>
  );
}
