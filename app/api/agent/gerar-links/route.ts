import { NextResponse, type NextRequest } from "next/server";
import { generateLinks } from "@/lib/notion";

// Precisa de Node (crypto + SDK do Notion) e nunca deve cachear.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Protegido por segredo: header `x-agent-secret` OU ?secret=... na query.
function authorized(req: NextRequest): boolean {
  const secret = process.env.AGENT_SECRET;
  if (!secret) return false;
  const provided =
    req.headers.get("x-agent-secret") ??
    new URL(req.url).searchParams.get("secret");
  return provided === secret;
}

async function run(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const baseUrl = process.env.PUBLIC_SITE_URL ?? "https://yuridosanjos.com.br";
  try {
    const generated = await generateLinks(baseUrl);
    return NextResponse.json({ ok: true, count: generated.length, generated });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}

// POST (cron/automação) e GET (disparo manual pelo navegador) — ambos exigem o segredo.
export async function POST(req: NextRequest) {
  return run(req);
}
export async function GET(req: NextRequest) {
  return run(req);
}
