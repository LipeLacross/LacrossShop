import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { rateLimit } from "@/app/lib/rate-limit";
import nodemailer from "nodemailer";
import { orderPaidTemplate } from "@/app/lib/email-templates";

// Atualiza status do pedido no Strapi e dispara e-mail de pagamento aprovado
async function updateOrderStatus(paymentId: string, status: string) {
  const base = (
    process.env.NEXT_PUBLIC_STRAPI_URL || "http://127.0.0.1:1337"
  ).replace(/\/+$/, "");
  // Busca pedido pelo paymentId
  const res = await fetch(
    `${base}/api/orders?filters[externalPaymentId][$eq]=${paymentId}`,
  );
  const json = await res.json().catch(() => ({}));
  const order = json?.data?.[0];
  if (!order) return false;
  // Atualiza status
  await fetch(`${base}/api/orders/${order.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data: { status } }),
  });
  // Dispara e-mail de pagamento aprovado
  if (status === "paid") {
    const email = order.attributes.customerEmail;
    const name = order.attributes.customerName;
    const code = order.attributes.code;
    const sendEmail = async () => {
      // Reutiliza lógica do checkout
      const host = process.env.SMTP_HOST;
      const port = Number(process.env.SMTP_PORT || 587);
      const user = process.env.SMTP_USER;
      const pass = process.env.SMTP_PASS;
      const from =
        process.env.SMTP_FROM ||
        (user ? `${user}` : "no-reply@neomercado.local");
      if (!host || !user || !pass) return { skipped: true } as const;
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
      return transporter.sendMail({
        from,
        to: email,
        subject: `Pagamento aprovado (${code}) - NeoMercado`,
        html: orderPaidTemplate({ name, orderCode: code }),
      });
    };
    await sendEmail().catch(() => null);
  }
  return true;
}

function verifySignature(raw: string, header?: string | null): boolean {
  const secret = process.env.ASAAS_WEBHOOK_SECRET;
  if (!secret) return true; // sem secret, não valida
  if (!header) return false;
  const hmac = crypto.createHmac("sha256", secret).update(raw).digest("hex");
  // aceita formatos "sha256=..." ou só hex
  return header === hmac || header === `sha256=${hmac}`;
}

export async function POST(req: NextRequest) {
  try {
    const forwarded = req.headers.get("x-forwarded-for") || "";
    const cf = req.headers.get("cf-connecting-ip") || "";
    const ip = (cf || forwarded.split(",")[0] || "unknown").trim();
    const ok = rateLimit({ key: `webhook:${ip}`, limit: 60, windowMs: 60_000 });
    if (!ok)
      return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });

    const raw = await req.text();
    const sig =
      req.headers.get("x-signature") ||
      req.headers.get("x-hub-signature") ||
      req.headers.get("x-asaas-signature");
    if (!verifySignature(raw, sig))
      return NextResponse.json(
        { error: "Assinatura inválida" },
        { status: 401 },
      );

    const body = JSON.parse(raw);
    const paymentId = body?.payment?.id || body?.id;
    const status =
      body?.event === "PAYMENT_RECEIVED"
        ? "paid"
        : body?.event === "PAYMENT_DELETED"
          ? "canceled"
          : null;
    if (!paymentId || !status)
      return NextResponse.json(
        { error: "Dados insuficientes" },
        { status: 400 },
      );
    await updateOrderStatus(paymentId, status);
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Erro desconhecido";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
