import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// Mantém runtime Node para usar crypto
export const dynamic = "force-dynamic";

// Util: lê corpo bruto e JSON de forma segura
async function readBody(req: NextRequest) {
  const raw = await req.text();
  let json: any = null;
  try {
    json = JSON.parse(raw);
  } catch (_) {
    // ignora; trata abaixo
  }
  return { raw, json } as const;
}

function timingSafeEqual(a: string, b: string) {
  const ba = Buffer.from(a || "");
  const bb = Buffer.from(b || "");
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

function computeHmac(raw: string, secret: string) {
  return crypto.createHmac("sha256", secret).update(raw, "utf8").digest("hex");
}

function getSigHeader(req: NextRequest) {
  // Tentativa ampla de headers comuns; o Asaas documenta assinatura HMAC em header próprio.
  const candidates = [
    "x-asaas-signature",
    "asaas-signature",
    "x-hub-signature",
    "x-hub-signature-256",
    "x-signature",
  ];
  for (const h of candidates) {
    const v = req.headers.get(h);
    if (v) return { name: h, value: v } as const;
  }
  return null;
}

function mapAsaasToOrderStatus(
  event: string | undefined,
  status: string | undefined,
) {
  const e = String(event || "").toUpperCase();
  const s = String(status || "").toUpperCase();
  // Eventos típicos: PAYMENT_CREATED, PAYMENT_CONFIRMED, PAYMENT_RECEIVED, PAYMENT_OVERDUE, PAYMENT_REFUNDED, PAYMENT_DELETED
  if (e.includes("PAYMENT_CONFIRMED") || e.includes("PAYMENT_RECEIVED"))
    return "paid";
  if (e.includes("PAYMENT_REFUNDED") || e.includes("PAYMENT_DELETED"))
    return "canceled";
  if (e.includes("PAYMENT_OVERDUE")) return "overdue";

  // Fallback via status da entidade
  if (["CONFIRMED", "RECEIVED"].includes(s)) return "paid";
  if (["REFUNDED", "CANCELED"].includes(s)) return "canceled";
  if (s === "OVERDUE") return "overdue";
  return "pending";
}

function baseStrapiUrl() {
  return (
    process.env.NEXT_PUBLIC_STRAPI_URL || "http://127.0.0.1:1337"
  ).replace(/\/+$/, "");
}

async function findOrderIdByExternalPaymentId(paymentId: string) {
  const url = `${baseStrapiUrl()}/api/orders?filters[externalPaymentId][$eq]=${encodeURIComponent(paymentId)}&fields[0]=id`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const token = process.env.STRAPI_TOKEN;
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(url, { headers, cache: "no-store" });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`Strapi find order failed: ${res.status} ${t}`);
  }
  const json = (await res.json()) as { data?: Array<{ id: number }> };
  const id = json?.data?.[0]?.id;
  return typeof id === "number" ? id : null;
}

async function updateOrderStatus(
  id: number,
  status: string,
  extra?: Record<string, unknown>,
) {
  const url = `${baseStrapiUrl()}/api/orders/${id}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const token = process.env.STRAPI_TOKEN;
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (!token) throw new Error("STRAPI_TOKEN ausente para atualizar pedido");
  const body = { data: { status, ...(extra || {}) } };
  const res = await fetch(url, {
    method: "PUT",
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`Strapi update order failed: ${res.status} ${t}`);
  }
  return res.json();
}

export async function POST(req: NextRequest) {
  try {
    // Rate limit leve por IP
    const ip = (
      req.headers.get("cf-connecting-ip") ||
      req.headers.get("x-forwarded-for") ||
      ""
    )
      .split(",")[0]
      .trim();
    const key = `asaas:wh:${ip}`;
    // Armazenamento simples em memória não está disponível entre invocações; manter apenas como nota. Em produção, use KV/Redis.

    const { raw, json } = await readBody(req);
    if (!json)
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

    const secret = process.env.ASAAS_WEBHOOK_SECRET || "";
    const sigHeader = getSigHeader(req);
    if (secret) {
      if (!sigHeader) {
        return NextResponse.json(
          { error: "Missing signature" },
          { status: 401 },
        );
      }
      const expected = computeHmac(raw, secret);
      const provided = sigHeader.value.replace(/^sha256=/i, "");
      if (!timingSafeEqual(expected, provided)) {
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 401 },
        );
      }
    }

    const event = json.event as string | undefined;
    const payment = json.payment || json.data || {};
    const paymentId: string | undefined = payment?.id;
    const paymentStatus: string | undefined = payment?.status;

    if (!paymentId) {
      return NextResponse.json(
        { ok: true, skipped: true, reason: "No payment id" },
        { status: 202 },
      );
    }

    const targetStatus = mapAsaasToOrderStatus(event, paymentStatus);

    const orderId = await findOrderIdByExternalPaymentId(paymentId);
    if (!orderId) {
      // idempotente; pode chegar antes de criarmos o pedido (janela curta)
      return NextResponse.json(
        { ok: true, skipped: true, reason: "Order not found yet" },
        { status: 202 },
      );
    }

    // Atualiza status; quando vira "paid", lifecycle no Strapi baixa o estoque
    try {
      await updateOrderStatus(orderId, targetStatus, {
        paidAt: targetStatus === "paid" ? new Date().toISOString() : undefined,
      });
    } catch (e) {
      // Falta de STRAPI_TOKEN ou permissão; não falhar webhook
      return NextResponse.json(
        { ok: true, warning: (e as Error).message },
        { status: 202 },
      );
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
