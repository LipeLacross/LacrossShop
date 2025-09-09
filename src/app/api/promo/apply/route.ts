import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { code, amount, shippingPrice } = (await req.json()) as {
      code?: string;
      amount?: number;
      shippingPrice?: number;
    };
    if (!code || typeof amount !== "number")
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });

    const base = (
      process.env.NEXT_PUBLIC_STRAPI_URL || "http://127.0.0.1:1337"
    ).replace(/\/+$/, "");
    const url = `${base}/api/coupons?filters[code][$eq]=${encodeURIComponent(
      code,
    )}&pagination[limit]=1`;
    const res = await fetch(url);
    const json = await res.json().catch(() => ({}));
    const item = json?.data?.[0];
    if (!item)
      return NextResponse.json(
        { valid: false, message: "Cupom inválido" },
        { status: 200 },
      );

    const c = item.attributes as Record<string, unknown>;
    const active = Boolean(c["active"]) !== false;
    const startsAt = c["startsAt"] ? new Date(String(c["startsAt"])) : null;
    const endsAt = c["endsAt"] ? new Date(String(c["endsAt"])) : null;
    const now = new Date();
    if (!active || (startsAt && now < startsAt) || (endsAt && now > endsAt)) {
      return NextResponse.json(
        { valid: false, message: "Cupom expirado" },
        { status: 200 },
      );
    }

    const minAmount = Number(c["minAmount"] ?? 0);
    if (amount < minAmount)
      return NextResponse.json(
        { valid: false, message: "Valor mínimo não atingido" },
        { status: 200 },
      );

    const type = String(c["discountType"] || "percent");
    const value = Number(c["value"] ?? 0);
    let discount = 0;
    if (type === "percent") discount = (amount * value) / 100;
    else discount = value;

    discount = Math.max(0, Math.min(discount, amount));
    const freeShipping = Boolean(c["freeShipping"]) || false;
    const finalShipping = freeShipping ? 0 : Number(shippingPrice || 0);
    const finalAmount = Math.max(0, amount - discount + finalShipping);

    return NextResponse.json({
      valid: true,
      code,
      discount: Number(discount.toFixed(2)),
      freeShipping,
      finalAmount: Number(finalAmount.toFixed(2)),
      message: "Cupom aplicado",
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Erro";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
