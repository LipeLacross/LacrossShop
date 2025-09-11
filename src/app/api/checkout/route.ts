import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { rateLimit } from "@/app/lib/rate-limit";
import { orderReceivedTemplate } from "@/app/lib/email-templates";

function baseUrl() {
  const env = process.env.ASAAS_ENVIRONMENT || "sandbox";
  return env === "production"
    ? "https://api.asaas.com/v3"
    : "https://sandbox.asaas.com/api/v3";
}

async function asaasFetch(path: string, init?: RequestInit) {
  const apiKey = process.env.ASAAS_API_KEY;
  if (!apiKey) throw new Error("ASAAS_API_KEY ausente no ambiente");
  const url = `${baseUrl()}${path}`;
  const headers = new Headers(init?.headers);
  headers.set("Content-Type", "application/json");
  headers.set("access_token", apiKey);
  return fetch(url, { ...init, headers });
}

async function getOrCreateCustomer({
  email,
  name,
  phone,
  cpfCnpj,
}: {
  email: string;
  name: string;
  phone?: string;
  cpfCnpj?: string;
}) {
  const res = await asaasFetch(
    `/customers?email=${encodeURIComponent(email)}`,
    { method: "GET" },
  );
  if (!res.ok) throw new Error(`Asaas customers GET falhou: ${res.status}`);
  const list = (await res.json()) as { data?: Array<{ id: string }> };
  if (Array.isArray(list.data) && list.data[0]?.id) return list.data[0];
  const create = await asaasFetch(`/customers`, {
    method: "POST",
    body: JSON.stringify({ email, name, mobilePhone: phone, cpfCnpj }),
  });
  if (!create.ok)
    throw new Error(
      `Asaas customers POST falhou: ${create.status} - ${await create.text()}`,
    );
  return (await create.json()) as { id: string };
}

async function saveOrderOnStrapi(payload: Record<string, unknown>) {
  const base = (
    process.env.NEXT_PUBLIC_STRAPI_URL || "http://127.0.0.1:1337"
  ).replace(/\/+$/, "");
  const url = `${base}/api/orders`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const token = process.env.STRAPI_TOKEN;
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      data: { ...payload, publishedAt: new Date().toISOString() },
    }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok)
    throw new Error(
      `Falha ao salvar pedido no Strapi: ${res.status} - ${JSON.stringify(json)}`,
    );
  return json;
}

async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from =
    process.env.SMTP_FROM || (user ? `${user}` : "no-reply@neomercado.local");
  if (!host || !user || !pass) return { skipped: true };
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
  return transporter.sendMail({ from, to, subject, html });
}

export async function POST(req: NextRequest) {
  try {
    const forwarded = req.headers.get("x-forwarded-for") || "";
    const cf = req.headers.get("cf-connecting-ip") || "";
    const ip = (cf || forwarded.split(",")[0] || "unknown").trim();
    const ok = rateLimit({
      key: `checkout:${ip}`,
      limit: 20,
      windowMs: 60_000,
    });
    if (!ok)
      return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });

    const body = await req.json();
    const {
      email,
      name,
      phone,
      cpfCnpj,
      amount,
      method,
      items = [],
      shipping,
      provider,
      card,
    } = body as {
      email: string;
      name: string;
      phone?: string;
      cpfCnpj?: string;
      amount: number;
      method: "pix" | "boleto" | "credit_card" | "debit_card";
      items?: Array<{ id: number; title: string; price: number; qty: number }>;
      shipping?: {
        address: Record<string, unknown>;
        price: number;
        label: string;
      };
      provider?: string;
      card?: {
        number: string;
        holderName: string;
        expiryMonth: string;
        expiryYear: string;
        cvv: string;
      };
    };

    if (!email || !name || !amount || !method) {
      return NextResponse.json(
        { error: "Campos obrigatórios ausentes" },
        { status: 400 },
      );
    }

    const customer = await getOrCreateCustomer({ email, name, phone, cpfCnpj });

    // CARTÃO (crédito/débito) via Asaas
    if (method === "credit_card" || method === "debit_card") {
      if (!card) {
        return NextResponse.json(
          { error: "Dados do cartão ausentes" },
          { status: 400 },
        );
      }
      const holderAddress = (shipping?.address || {}) as Record<
        string,
        unknown
      >;
      const readStr = (k: string) =>
        typeof (holderAddress as Record<string, unknown>)[k] === "string"
          ? ((holderAddress as Record<string, string>)[k] as string)
          : "";
      const billingType = "CREDIT_CARD";
      const payload: Record<string, unknown> = {
        customer: customer.id,
        value: Number(Number(amount).toFixed(2)),
        billingType,
        description: `Pedido NeoMercado - ${new Date().toLocaleDateString("pt-BR")}`,
        creditCard: {
          holderName: card.holderName,
          number: card.number,
          expiryMonth: card.expiryMonth,
          expiryYear: card.expiryYear,
          ccv: card.cvv,
        },
        creditCardHolderInfo: {
          name,
          email,
          cpfCnpj: cpfCnpj || undefined,
          postalCode: readStr("zipCode") || readStr("cep"),
          addressNumber: readStr("number"),
          addressComplement: readStr("complement"),
          phone: phone || undefined,
          mobilePhone: phone || undefined,
        },
      };
      const payRes = await asaasFetch(`/payments`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const payJson = await payRes.json();
      if (!payRes.ok) {
        return NextResponse.json({ error: payJson }, { status: payRes.status });
      }

      const orderCode = `NM-${Date.now().toString(36).toUpperCase()}`;
      await saveOrderOnStrapi({
        code: orderCode,
        customerName: name,
        customerEmail: email,
        customerPhone: phone || "",
        items,
        amount,
        shippingPrice: shipping?.price || 0,
        shippingLabel: shipping?.label || "",
        address: shipping?.address || {},
        provider: provider || "asaas",
        method,
        externalPaymentId: payJson.id,
        paymentUrl: payJson.invoiceUrl || null,
        status:
          payJson.status?.toLowerCase?.() === "confirmed" ? "paid" : "pending",
      });

      await sendEmail({
        to: email,
        subject: `Seu pedido (${orderCode}) no NeoMercado`,
        html: orderReceivedTemplate({
          name,
          orderCode,
          amount,
          paymentUrl: payJson.invoiceUrl || null,
        }),
      }).catch(() => null);

      return NextResponse.json(
        { paymentId: payJson.id, status: payJson.status, orderCode },
        { status: 200 },
      );
    }

    // PIX/BOLETO
    const billingType = method === "pix" ? "PIX" : "BOLETO";
    const payload: Record<string, unknown> = {
      customer: customer.id,
      value: Number(Number(amount).toFixed(2)),
      billingType,
      description: `Pedido NeoMercado - ${new Date().toLocaleDateString("pt-BR")}`,
    };
    if (billingType === "BOLETO") {
      const due = new Date();
      due.setDate(due.getDate() + 2);
      payload["dueDate"] = due.toISOString().slice(0, 10);
    }

    const payRes = await asaasFetch(`/payments`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    const payJson = await payRes.json();
    if (!payRes.ok) {
      return NextResponse.json({ error: payJson }, { status: payRes.status });
    }

    const paymentUrl =
      payJson.invoiceUrl || payJson.bankSlipUrl || payJson.pixQrCode || null;

    // Salva pedido no Strapi
    const orderCode = `NM-${Date.now().toString(36).toUpperCase()}`;
    await saveOrderOnStrapi({
      code: orderCode,
      customerName: name,
      customerEmail: email,
      customerPhone: phone || "",
      items,
      amount,
      shippingPrice: shipping?.price || 0,
      shippingLabel: shipping?.label || "",
      address: shipping?.address || {},
      provider: provider || "asaas",
      method,
      externalPaymentId: payJson.id,
      paymentUrl: paymentUrl,
      status: "pending",
    });

    // Envia e-mail de confirmação (se SMTP configurado)
    const itemsHtml = Array.isArray(items)
      ? `<ul>${items
          .map(
            (i) =>
              `<li>${i.qty}x ${i.title} — R$ ${(i.price * i.qty).toFixed(2)}</li>`,
          )
          .join("")}</ul>`
      : "";
    const shippingHtml = shipping
      ? `<p>${shipping.label}: ${shipping.price ? `R$ ${shipping.price.toFixed(2)}` : "Grátis"}</p>`
      : "";
    await sendEmail({
      to: email,
      subject: `Seu pedido (${orderCode}) no NeoMercado`,
      html: orderReceivedTemplate({
        name,
        orderCode,
        amount,
        itemsHtml,
        shippingHtml,
        paymentUrl,
      }),
    }).catch(() => null);

    // Dados extras para PIX/Boleto
    const pixPayload = payJson.pixCopyPaste || payJson.pixQrCode || null;
    const pixImage = payJson.pixEncodedImage || null;
    const boletoLine = payJson.identificationField || null;

    return NextResponse.json(
      {
        paymentId: payJson.id,
        url: paymentUrl,
        orderCode,
        pix:
          pixPayload || pixImage
            ? {
                payload: pixPayload,
                encodedImage: pixImage,
              }
            : undefined,
        boleto: boletoLine ? { line: boletoLine } : undefined,
      },
      { status: 200 },
    );
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Erro desconhecido";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
