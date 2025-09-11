import { NextRequest, NextResponse } from "next/server";

async function melhorEnvioTrack(code: string) {
  const token = process.env.ME_API_TOKEN;
  if (!token) return null;
  try {
    const url = `${process.env.ME_API_URL || "https://melhorenvio.com.br"}/api/v2/me/tracking/${encodeURIComponent(
      code,
    )}`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "User-Agent": "NeoMercado/1.0",
      },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      code?: string;
      events?: Array<{
        description?: string;
        created_at?: string;
      }>;
      status?: string;
    };
    const events = (json.events || []).map((e) => ({
      date: e.created_at || new Date().toISOString(),
      desc: e.description || "Atualização",
    }));
    return {
      code: json.code || code,
      status: json.status || (events.length ? "in_transit" : "unknown"),
      events,
    };
  } catch {
    return null;
  }
}

// body: { code: string } => retorna eventos simulados ou integra transportadora no futuro
export async function POST(req: NextRequest) {
  try {
    const { code } = (await req.json()) as { code?: string };
    if (!code)
      return NextResponse.json({ error: "Código ausente" }, { status: 400 });

    const me = await melhorEnvioTrack(code);
    if (me) return NextResponse.json(me);

    // Fallback simulado
    return NextResponse.json({
      code,
      status: "in_transit",
      events: [
        {
          date: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
          desc: "Objeto postado",
        },
        {
          date: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
          desc: "Em trânsito para unidade de tratamento",
        },
        {
          date: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
          desc: "Objeto em transferência",
        },
      ],
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Erro desconhecido";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
