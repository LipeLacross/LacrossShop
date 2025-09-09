import { NextRequest, NextResponse } from "next/server";

// body: { code: string } => retorna eventos simulados ou integra transportadora no futuro
export async function POST(req: NextRequest) {
  try {
    const { code } = (await req.json()) as { code?: string };
    if (!code) return NextResponse.json({ error: "Código ausente" }, { status: 400 });
    // FUTURO: integrar SRO Correios / Melhor Envio
    return NextResponse.json({
      code,
      status: "in_transit",
      events: [
        { date: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(), desc: "Objeto postado" },
        { date: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(), desc: "Em trânsito para unidade de tratamento" },
        { date: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(), desc: "Objeto em transferência" },
      ],
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Erro desconhecido";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

