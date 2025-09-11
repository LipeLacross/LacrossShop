import { NextRequest, NextResponse } from "next/server";

async function melhorEnvioQuote(body: any) {
  const token = process.env.ME_API_TOKEN;
  const fromZip =
    process.env.ME_FROM_ZIP || process.env.STORE_ZIP || "01001-000";
  if (!token) return null;
  try {
    const destZip = String(body?.to?.zip || "").replace(/\D/g, "");
    if (!destZip) return null;

    const items = Array.isArray(body?.items) ? body.items : [];
    const totalWeight = items.reduce(
      (acc: number, i: any) =>
        acc + (Number(i.weight) || 0.3) * (Number(i.qty) || 1),
      0,
    );
    // Dimensões mínimas por padrão
    const dims = {
      height: Math.max(2, ...items.map((i: any) => Number(i.height) || 2)),
      width: Math.max(11, ...items.map((i: any) => Number(i.width) || 11)),
      length: Math.max(16, ...items.map((i: any) => Number(i.length) || 16)),
    };

    const payload = [
      {
        from: { postal_code: fromZip },
        to: { postal_code: destZip },
        package: {
          weight: Math.max(0.1, Number(totalWeight.toFixed(3))),
          height: dims.height,
          width: dims.width,
          length: dims.length,
          // format, diameter opcionais
        },
        // services opcional: se informado, filtra
      },
    ];

    const res = await fetch(
      `${process.env.ME_API_URL || "https://melhorenvio.com.br"}/api/v2/me/shipment/calculate`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
          "User-Agent": "NeoMercado/1.0",
        },
        body: JSON.stringify(payload),
        // Melhor Envio exige CORS server-side apenas
      },
    );
    if (!res.ok) {
      const t = await res.text();
      throw new Error(`Melhor Envio: ${res.status} ${t}`);
    }
    const data = (await res.json()) as Array<{
      company: { name: string };
      name: string;
      price: string | number;
      delivery_time: number;
    } | null>;
    const best = (data || [])
      .filter(Boolean)
      .sort((a: any, b: any) => Number(a!.price) - Number(b!.price))[0] as any;
    if (!best) return null;
    return {
      price: Number(best.price),
      label: `${best.company?.name || "Transportadora"} - ${best.name || "Frete"}`,
      days: Number(best.delivery_time || 0),
    };
  } catch {
    return null;
  }
}

// Contrato simples: body { items: [...], from?: { zip }, to: { zip }, service?: string }
// Retorno: { price: number; label: string; days: number }
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as any;

    if (!body?.to?.zip || !Array.isArray(body?.items))
      return NextResponse.json(
        { error: "Dados insuficientes" },
        { status: 400 },
      );

    // 1) Melhor Envio (se configurado)
    const me = await melhorEnvioQuote(body);
    if (me) return NextResponse.json(me);

    // 2) Fallback local: preço por região + peso
    const dest = String(body.to.zip).replace(/\D/g, "");
    const totalWeight = (body.items || []).reduce(
      (acc: number, i: any) =>
        acc + (Number(i.weight) || 0.3) * (Number(i.qty) || 1),
      0,
    );
    let base = 24.9;
    if (/^[0-3]/.test(dest))
      base = 19.9; // Sul/Sudeste
    else if (/^[7-9]/.test(dest)) base = 29.9; // Norte/Nordeste
    const extra = Math.max(0, totalWeight - 1) * 8;
    const price = Number((base + extra).toFixed(2));
    const days = /^[0-3]/.test(dest) ? 3 : /^[4-6]/.test(dest) ? 5 : 8;

    return NextResponse.json({ price, label: body.service || "Frete", days });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Erro desconhecido";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
