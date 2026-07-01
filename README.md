# consultas-yuri

App Next.js das **consultas** do Yuri dos Anjos, servido por path em
`yuridosanjos.com.br/consultas/*`. Hoje tem uma rota:

- **`/consultas/compre-tempo`** — carta de vendas (VSL) do upsell **Compre Tempo**,
  enviado por WhatsApp a quem recebeu o Diagnóstico de Potencial de Riqueza.

Veio do `form-potencial-financeiro` (onde a página nasceu como
`/form/potencial-financeiro/compre-tempo`). Aqui ela é enxuta: só a página, sem
formulário/banco/pagamento.

## Cronômetro por pessoa (48h, à prova de reset)

Não existe mais data global. Cada pessoa recebe um link único:

```
https://yuridosanjos.com.br/consultas/compre-tempo?u=<token>
```

No **1º acesso**, o servidor carimba `prazo = agora + 48h` numa propriedade do
Notion daquela pessoa. Depois disso o prazo é fixo — a pessoa pode fechar, limpar
o cache ou trocar de aparelho que o relógio é o mesmo (vive no Notion, não no
navegador). Zerou → botões caem no fallback do Instagram. Token inválido/ausente
→ tela de "link inválido".

`COUNTDOWN_HOURS` muda a janela (default 48).

## O agente (gera os links sozinho)

Quando você marca uma pessoa como **"Entregue"** no Notion, o agente gera o token
e escreve o link pronto de volta na linha dela.

- Endpoint: `POST` (ou `GET`) `/consultas/api/agent/gerar-links?secret=<AGENT_SECRET>`
- Ele pega as linhas com **Status = `NOTION_STATUS_TRIGGER`** (default `Entregue`) e
  **sem** token, gera token + link e preenche as colunas. Idempotente: quem já tem
  token é ignorado.
- Rode por **cron** (a cada ~10 min) ou dispare manual pelo navegador.

Retorno: `{ ok, count, generated: [{ nome, link, pageId }] }`.

## Notion — propriedades a criar

Na base **"Entrega - Diagnóstico Potencial de Riqueza"** (a mesma do
`form-potencial-financeiro`), crie 3 colunas:

| Propriedade | Tipo |
|---|---|
| `Token Compre Tempo` | Texto (rich_text) |
| `Prazo Compre Tempo` | Data (date) |
| `Link Compre Tempo` | URL |

Já existentes e usadas: `Nome` (title) e `Status` (status, com a opção `Entregue`).

> A integração do Notion precisa ter acesso a essa base (a mesma key do form já tem).

## Variáveis de ambiente

Ver `.env.example`. Reaproveite `NOTION_API_KEY` + `NOTION_DATA_SOURCE_ID` do
`form-potencial-financeiro`. Defina também `AGENT_SECRET` e `PUBLIC_SITE_URL`.

## Rodar local

```
npm install
cp .env.example .env.local   # preencher os valores
npm run dev                  # http://localhost:3000/consultas/compre-tempo?u=<token>
```

## Deploy (Coolify)

App novo no Coolify, repo próprio, domínio **`yuridosanjos.com.br/consultas`** (path),
builder nixpacks — igual aos outros forms. `basePath` já está em `/consultas`
(`next.config.ts`).

⚠️ **Gotcha do path + basePath (mesmo dos outros apps):** o Coolify gera um
middleware `stripprefix` automático pra domínios com path, que quebra o basePath
do Next (404). Fix: remover a def `*.stripprefix.prefixes` e o token `stripprefix`
da linha de `middlewares` nos `custom_labels`, deixando só `gzip`, e dar RESTART.

## Notas de verificação (fazer 1 smoke test)

- A query usa `client.dataSources.query` (API nova do Notion, com data source).
  Rodar o agente 1x com credenciais reais pra confirmar o método/filtros antes de
  usar pra valer.
- Preço à vista no `app/compre-tempo/config.ts` está `497,00` com um TODO: o Yuri
  falou `49,77` — confirmar antes de publicar.
