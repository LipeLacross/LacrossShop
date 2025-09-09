import { NextRequest, NextResponse } from "next/server";

// Contrato simples: body { items: { id:number; qty:number; weight?:number; height?:number; width?:number; length?:number }[],
// from?: { zip: string }, to: { zip: string }, service?: string }
// Retorno: { price: number; label: string; days: number }
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      items: Array<{
        id: number;
        qty: number;
        weight?: number; // kg
        height?: number; // cm
        width?: number; // cm
        length?: number; // cm
      }>;
      from?: { zip: string };
      to: { zip: string };
      service?: string;
    };

    if (!body?.to?.zip || !Array.isArray(body?.items))
      return NextResponse.json(
        { error: "Dados insuficientes" },
        { status: 400 },
      );

    // Fallback local: preço por região + peso
    const dest = body.to.zip.replace(/\D/g, "");
    const totalWeight = (body.items || []).reduce(
      (acc, i) => acc + (i.weight || 0.3) * (i.qty || 1),
      0,
    ); // default 300g
    let base = 24.9;
    if (/^[0-3]/.test(dest))
      base = 19.9; // Sul/Sudeste
    else if (/^[7-9]/.test(dest)) base = 29.9; // Norte/Nordeste
    // Acréscimo por kg acima de 1kg
    const extra = Math.max(0, totalWeight - 1) * 8;
    const price = Number((base + extra).toFixed(2));
    const days = /^[0-3]/.test(dest) ? 3 : /^[4-6]/.test(dest) ? 5 : 8;

    // FUTURO: integrar Melhor Envio/Correios se env estiver configurado
    // if (process.env.ME_API_TOKEN) { ... }

    return NextResponse.json({ price, label: body.service || "Frete", days });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Erro desconhecido";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
