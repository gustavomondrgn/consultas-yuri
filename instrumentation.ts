// Cron interno: a cada N minutos gera token+link pra quem virou "Entregue" no
// Notion e ainda não tem link. Sem cron externo — roda dentro do próprio
// servidor Next (next start), 1x por instância. É o "agente automático":
// você marca "Entregue" e o link aparece sozinho no Notion.
export async function register() {
  // só no runtime Node do servidor (não no edge, não durante o build)
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { generateLinks } = await import("@/lib/notion");
  const baseUrl = process.env.PUBLIC_SITE_URL ?? "https://yuridosanjos.com.br";
  const interval =
    Number(process.env.AGENT_INTERVAL_MS ?? "") || 10 * 60 * 1000; // 10 min

  const tick = async () => {
    try {
      const gerados = await generateLinks(baseUrl);
      if (gerados.length) {
        console.log(
          `[agente] ${gerados.length} link(s) gerados:`,
          gerados.map((x) => x.nome).join(", "),
        );
      }
    } catch (e) {
      console.error("[agente] erro:", e instanceof Error ? e.message : e);
    }
  };

  // uma passada logo após subir, depois a cada intervalo
  setTimeout(tick, 15_000);
  setInterval(tick, interval);
  console.log(
    `[agente] cron interno ligado (a cada ${Math.round(interval / 60000)} min)`,
  );
}
