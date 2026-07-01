import { Client } from "@notionhq/client";
import { randomBytes } from "node:crypto";

// ─────────────────────────────────────────────────────────────────────────────
// Notion — MESMAS credenciais do form-potencial-financeiro (base "Entrega -
// Diagnóstico Potencial de Riqueza"). NÃO hardcodar id de banco: o id vem da
// env NOTION_DATA_SOURCE_ID (ou NOTION_DATABASE_ID), então é impossível cair
// no banco errado (Bússola / Raio-X) por engano.
//
// Duas responsabilidades:
//   1. resolveDeadline(token) — a página lê o token do link e carimba/lê o
//      prazo de 48h POR PESSOA (à prova de reset, guardado no próprio Notion).
//   2. generateLinks(baseUrl) — o "agente": pega quem entrou em "Entregue" e
//      ainda não tem token, gera token+link e escreve de volta no Notion.
// ─────────────────────────────────────────────────────────────────────────────

// Status que dispara o agente. O print do Yuri mostra o fluxo
// A fazer → Não iniciada → Em andamento → Texto feito → Entregar → Entregue.
const STATUS_TRIGGER = process.env.NOTION_STATUS_TRIGGER ?? "Entregue";

// Janela por pessoa, em horas (48h por padrão).
const COUNTDOWN_HOURS = Number(process.env.COUNTDOWN_HOURS ?? "48") || 48;

// Propriedades no Notion. "Nome"/"Status" já existem; as 3 de baixo precisam
// ser criadas na base (ver README): rich_text, date e url.
const PROP = {
  nome: "Nome", // title
  status: "Status", // status
  token: "Token Compre Tempo", // rich_text
  prazo: "Prazo Compre Tempo", // date
  link: "Link Compre Tempo", // url
} as const;

let cached: Client | null = null;
function notion(): Client {
  if (cached) return cached;
  const auth = process.env.NOTION_API_KEY;
  if (!auth) throw new Error("NOTION_API_KEY não configurada");
  cached = new Client({
    auth,
    notionVersion: process.env.NOTION_VERSION ?? undefined,
  });
  return cached;
}

// Query no data source (API nova, 2025-09+) ou no database (fallback antigo).
// Tipos do SDK aqui são uniões pesadas; usamos `any` de propósito no acesso a
// propriedades — o formato é estável e o custo/benefício de tipar não compensa.
async function queryDb(filter: unknown, pageSize = 100): Promise<any> {
  const client = notion() as any;
  const dataSourceId = process.env.NOTION_DATA_SOURCE_ID;
  if (dataSourceId) {
    return client.dataSources.query({
      data_source_id: dataSourceId,
      filter,
      page_size: pageSize,
    });
  }
  const databaseId = process.env.NOTION_DATABASE_ID;
  if (!databaseId) {
    throw new Error("Configure NOTION_DATA_SOURCE_ID ou NOTION_DATABASE_ID");
  }
  return client.databases.query({
    database_id: databaseId,
    filter,
    page_size: pageSize,
  });
}

function readTitle(page: any): string {
  const t = page?.properties?.[PROP.nome]?.title;
  return Array.isArray(t) && t[0]?.plain_text ? t[0].plain_text : "(sem nome)";
}

function readDeadline(page: any): string | null {
  return page?.properties?.[PROP.prazo]?.date?.start ?? null;
}

// ── 1. Página: resolve o prazo POR PESSOA a partir do token ──────────────────
// Retorna null se o token não bate em ninguém (→ tela de link inválido).
export async function resolveDeadline(
  token: string,
): Promise<{ deadlineMs: number } | null> {
  const clean = token.trim();
  if (!clean) return null;

  const res = await queryDb({
    property: PROP.token,
    rich_text: { equals: clean },
  });
  const page = res?.results?.[0];
  if (!page) return null;

  // Já carimbado? usa o prazo existente (idempotente → à prova de reset).
  const existing = readDeadline(page);
  if (existing) {
    const ms = Date.parse(existing);
    if (!Number.isNaN(ms)) return { deadlineMs: ms };
  }

  // Primeiro acesso: carimba agora + N horas e grava no Notion.
  const deadline = new Date(Date.now() + COUNTDOWN_HOURS * 3_600_000);
  await (notion() as any).pages.update({
    page_id: page.id,
    properties: { [PROP.prazo]: { date: { start: deadline.toISOString() } } },
  });
  return { deadlineMs: deadline.getTime() };
}

// ── 2. Agente: gera token+link pra quem está "Entregue" e ainda sem token ────
export async function generateLinks(
  baseUrl: string,
): Promise<{ nome: string; link: string; pageId: string }[]> {
  const res = await queryDb({
    and: [
      { property: PROP.status, status: { equals: STATUS_TRIGGER } },
      { property: PROP.token, rich_text: { is_empty: true } },
    ],
  });
  const pages: any[] = res?.results ?? [];

  const out: { nome: string; link: string; pageId: string }[] = [];
  const base = baseUrl.replace(/\/+$/, "");
  for (const page of pages) {
    const token = randomBytes(9).toString("base64url");
    const link = `${base}/consultas/compre-tempo?u=${token}`;
    await (notion() as any).pages.update({
      page_id: page.id,
      properties: {
        [PROP.token]: { rich_text: [{ text: { content: token } }] },
        [PROP.link]: { url: link },
      },
    });
    out.push({ nome: readTitle(page), link, pageId: page.id });
  }
  return out;
}
