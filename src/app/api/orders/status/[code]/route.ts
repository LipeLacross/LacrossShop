import { NextRequest, NextResponse } from "next/server";

function strapiBase() {
  return (
    process.env.NEXT_PUBLIC_STRAPI_URL || "http://127.0.0.1:1337"
  ).replace(/\/+$/, "");
}

export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl ?? new URL(req.url);
    const parts = url.pathname.split("/").filter(Boolean);
    const code = parts[parts.length - 1] || "";
    if (!code)
      return NextResponse.json({ error: "Missing code" }, { status: 400 });

    const apiUrl = `${strapiBase()}/api/orders/status/${encodeURIComponent(code)}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    const token = process.env.STRAPI_TOKEN;
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch(apiUrl, { headers, cache: "no-store" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return NextResponse.json(data, { status: res.status });
    return NextResponse.json(data, { status: 200 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Erro desconhecido";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
