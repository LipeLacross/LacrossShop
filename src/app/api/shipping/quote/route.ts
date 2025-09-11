import { NextRequest, NextResponse } from "next/server";

type QuoteItem = {
  id?: number;
  qty?: number;
  weight?: number;
  height?: number;
  width?: number;
  length?: number;
};

type QuoteBody = {
  to: { zip: string };
  from?: { zip?: string };
  items: QuoteItem[];
  service?: string;
};

type MECalcRequest = Array<{
  from: { postal_code: string };
  to: { postal_code: string };
  package: {
    weight: number;
    height: number;
    width: number;
    length: number;
  };
}>;

type MECalcResponseItem = {
  company?: { name?: string };
  name?: string;
  price?: string | number;
  delivery_time?: number;
} | null;

async function melhorEnvioQuote(
  body: QuoteBody,
): Promise<{ price: number; label: string; days: number } | null> {
  const token = process.env.ME_API_TOKEN;
  const fromZip = (
    body.from?.zip ||
    process.env.ME_FROM_ZIP ||
    process.env.STORE_ZIP ||
    "01001-000"
  ).toString();
  if (!token) return null;
  try {
    const destZip = String(body?.to?.zip || "").replace(/\D/g, "");
    if (!destZip) return null;

    const items = Array.isArray(body?.items) ? body.items : [];
    const totalWeight = items.reduce<number>(
      (acc, i) => acc + (Number(i.weight) || 0.3) * (Number(i.qty) || 1),
      0,
    );
    // Dimensões mínimas por padrão
    const dims = {
      height: Math.max(2, ...items.map((i) => Number(i.height) || 2)),
      width: Math.max(11, ...items.map((i) => Number(i.width) || 11)),
      length: Math.max(16, ...items.map((i) => Number(i.length) || 16)),
    };

    const payload: MECalcRequest = [
      {
        from: { postal_code: fromZip },
        to: { postal_code: destZip },
        package: {
          weight: Math.max(0.1, Number(totalWeight.toFixed(3))),
          height: dims.height,
          width: dims.width,
          length: dims.length,
        },
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
      },
    );
    if (!res.ok) {
      // Em caso de erro no provedor, usa fallback
      await res.text().catch(() => "");
      return null;
    }
    const data = (await res.json()) as MECalcResponseItem[];
    const valid = (data || []).filter(
      (x): x is NonNullable<MECalcResponseItem> => Boolean(x),
    );
    valid.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    const best = valid[0];
    if (!best) return null;
    return {
      price: Number(best.price || 0),
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
    const raw = (await req.json()) as unknown;
    if (!raw || typeof raw !== "object")
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });

    const body = raw as Partial<QuoteBody>;
    const toZip = String(body?.to?.zip || "").trim();
    const items = Array.isArray(body?.items) ? body!.items : [];

    if (!toZip || !Array.isArray(items))
      return NextResponse.json(
        { error: "Dados insuficientes" },
        { status: 400 },
      );

    // 1) Melhor Envio (se configurado)
    const me = await melhorEnvioQuote({
      to: { zip: toZip },
      from: body.from,
      items,
      service: body.service,
    } as QuoteBody);
    if (me) return NextResponse.json(me);

    // 2) Fallback local: preço por região + peso
    const dest = toZip.replace(/\D/g, "");
    const totalWeight = (items || []).reduce<number>(
      (acc, i) => acc + (Number(i.weight) || 0.3) * (Number(i.qty) || 1),
      0,
    );
    let base = 24.9;
    if (/^[0-3]/.test(dest))
      base = 19.9; // Sul/Sudeste
    else if (/^[7-9]/.test(dest)) base = 29.9; // Norte/Nordeste
    const extra = Math.max(0, totalWeight - 1) * 8;
    const price = Number((base + extra).toFixed(2));
    const days = /^[0-3]/.test(dest) ? 3 : /^[4-6]/.test(dest) ? 5 : 8;

    return NextResponse.json({ price, label: body?.service || "Frete", days });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Erro desconhecido";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
