import { fetchOrderByCode } from "@/app/lib/api";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function OrderStatusPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const order = await fetchOrderByCode(code);

  if (!order) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-12">
        <h1 className="mb-4 text-2xl font-bold">Pedido não encontrado</h1>
        <p className="mb-6 text-neutral-600 dark:text-neutral-300">
          Verifique o código do pedido e tente novamente.
        </p>
        <Link
          className="rounded bg-black px-4 py-2 text-white dark:bg-white dark:text-black"
          href="/"
        >
          Voltar à loja
        </Link>
      </div>
    );
  }

  const paid = order.status === "paid" || order.status === "confirmed";

  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-2 text-2xl font-bold">Pedido {order.code}</h1>
      <p className="mb-6 text-neutral-600 dark:text-neutral-300">
        Status:{" "}
        <span className={paid ? "text-green-600" : "text-amber-600"}>
          {order.status}
        </span>
      </p>

      {!paid && order.paymentUrl && (
        <div className="mb-8 rounded border p-4">
          <h2 className="mb-2 text-lg font-semibold">Concluir pagamento</h2>
          <p className="mb-3 text-sm text-neutral-600 dark:text-neutral-300">
            Seu pagamento ainda não foi confirmado. Você pode abrir o link
            abaixo para finalizar.
          </p>
          <a
            href={order.paymentUrl}
            target="_blank"
            className="inline-block rounded border px-4 py-2 text-sm"
          >
            Abrir link de pagamento
          </a>
        </div>
      )}

      <Link
        className="rounded bg-black px-4 py-2 text-white dark:bg-white dark:text-black"
        href="/"
      >
        Voltar à loja
      </Link>
    </div>
  );
}
