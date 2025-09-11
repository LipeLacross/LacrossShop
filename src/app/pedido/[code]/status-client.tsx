"use client";

import { useEffect, useMemo, useState } from "react";

type OrderStatus =
  | "pending"
  | "paid"
  | "confirmed"
  | "canceled"
  | "overdue"
  | string;

type OrderStatusResp = {
  code: string;
  status: OrderStatus;
  paymentUrl?: string | null;
  createdAt?: string | null;
  error?: string;
};

export default function StatusClient({ code }: { code: string }) {
  const [data, setData] = useState<OrderStatusResp | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const isPaid = useMemo(
    () => data && (data.status === "paid" || data.status === "confirmed"),
    [data],
  );
  const isFinal = useMemo(
    () =>
      data && ["paid", "confirmed", "canceled"].includes(String(data.status)),
    [data],
  );

  useEffect(() => {
    let mounted = true;
    let timer: any;

    async function fetchStatus() {
      try {
        const res = await fetch(
          `/api/orders/status/${encodeURIComponent(code)}`,
          {
            cache: "no-store",
          },
        );
        const json = (await res.json()) as OrderStatusResp;
        if (!mounted) return;
        if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`);
        setData(json);
        setError("");
        // Se chegou a um estado final, para o polling
        if (["paid", "confirmed", "canceled"].includes(String(json.status))) {
          if (timer) clearInterval(timer);
          timer = undefined;
        }
      } catch (e) {
        if (!mounted) return;
        setError(e instanceof Error ? e.message : "Erro ao buscar status");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchStatus();
    timer = setInterval(fetchStatus, 5000);
    return () => {
      mounted = false;
      if (timer) clearInterval(timer);
    };
  }, [code]);

  if (loading && !data)
    return (
      <p className="text-neutral-600 dark:text-neutral-300">
        Carregando status…
      </p>
    );

  if (error && !data)
    return (
      <div className="rounded border border-amber-300 bg-amber-50 p-4 text-amber-900 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
        Falha ao consultar status: {error}
      </div>
    );

  if (!data)
    return (
      <div className="rounded border p-4 dark:border-neutral-800">
        Não foi possível localizar este pedido.
      </div>
    );

  return (
    <div className="rounded border p-4 dark:border-neutral-800">
      <p className="mb-2 text-neutral-700 dark:text-neutral-300">
        Status:
        <span
          className={
            isPaid
              ? "ml-2 font-semibold text-green-600"
              : "ml-2 font-semibold text-amber-600"
          }
        >
          {data.status}
        </span>
      </p>

      {!isPaid && data.paymentUrl && (
        <div className="mt-4 rounded border p-3 dark:border-neutral-800">
          <h2 className="mb-2 text-base font-semibold">Concluir pagamento</h2>
          <p className="mb-3 text-sm text-neutral-600 dark:text-neutral-400">
            Seu pagamento ainda não foi confirmado. Você pode abrir o link
            abaixo para finalizar.
          </p>
          <a
            href={data.paymentUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-block rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
          >
            Abrir link de pagamento
          </a>
        </div>
      )}

      {error && <p className="mt-3 text-xs text-amber-600">{error}</p>}
    </div>
  );
}
