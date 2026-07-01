// Setup + smoke test do Notion (rodar 1x). NÃO faz parte do build do app.
//   node scripts/notion-setup.mjs          → garante colunas + conta (read-only)
//   node scripts/notion-setup.mjs --gerar   → tambconfigém gera token+link (mutação real)
import { Client } from "@notionhq/client";
import { readFileSync } from "node:fs";
import { randomBytes } from "node:crypto";

// carrega .env.local manualmente (sem dotenv)
for (const line of readFileSync(new URL("../.env.local", import.meta.url), "utf8").split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2];
}

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
  notionVersion: process.env.NOTION_VERSION || undefined,
});
const dsId = process.env.NOTION_DATA_SOURCE_ID;
const dbId = process.env.NOTION_DATABASE_ID;
const TRIGGER = process.env.NOTION_STATUS_TRIGGER || "Entregue";
const BASE = (process.env.PUBLIC_SITE_URL || "https://yuridosanjos.com.br").replace(/\/+$/, "");
const HOURS = Number(process.env.COUNTDOWN_HOURS || "48") || 48;
const PROP = { nome: "Nome", status: "Status", token: "Token Compre Tempo", prazo: "Prazo Compre Tempo", link: "Link Compre Tempo" };

async function ensureProps() {
  const properties = {
    [PROP.token]: { rich_text: {} },
    [PROP.prazo]: { date: {} },
    [PROP.link]: { url: {} },
  };
  if (dsId) await notion.dataSources.update({ data_source_id: dsId, properties });
  else await notion.databases.update({ database_id: dbId, properties });
  console.log("✓ colunas garantidas:", Object.values(PROP).slice(2).join(" | "));
}

async function query(filter) {
  if (dsId) return notion.dataSources.query({ data_source_id: dsId, filter, page_size: 100 });
  return notion.databases.query({ database_id: dbId, filter, page_size: 100 });
}

const nameOf = (p) => {
  const t = p.properties?.[PROP.nome]?.title;
  return Array.isArray(t) && t[0]?.plain_text ? t[0].plain_text : "(sem nome)";
};

async function run() {
  await ensureProps();
  const res = await query({
    and: [
      { property: PROP.status, status: { equals: TRIGGER } },
      { property: PROP.token, rich_text: { is_empty: true } },
    ],
  });
  const pages = res.results;
  console.log(`\n"${TRIGGER}" sem token: ${pages.length}`);
  for (const p of pages) console.log("  -", nameOf(p));

  if (!process.argv.includes("--gerar")) {
    console.log("\n(read-only. Rode de novo com --gerar pra criar os links.)");
    return;
  }
  console.log("\n--gerar: criando token+link...");
  for (const p of pages) {
    const token = randomBytes(9).toString("base64url");
    const link = `${BASE}/consultas/compre-tempo?u=${token}`;
    await notion.pages.update({
      page_id: p.id,
      properties: {
        [PROP.token]: { rich_text: [{ text: { content: token } }] },
        [PROP.link]: { url: link },
      },
    });
    console.log(`  ✓ ${nameOf(p)} → ${link}`);
  }
  console.log(`\n✓ ${pages.length} link(s) gerados e gravados no Notion. Prazo de ${HOURS}h começa no 1º acesso de cada um.`);
}

run().catch((e) => { console.error("ERRO:", e?.body || e?.message || e); process.exit(1); });
