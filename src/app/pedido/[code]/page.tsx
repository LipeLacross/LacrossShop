import Link from "next/link";
import StatusClient from "./StatusClient";

export const dynamic = "force-dynamic";

export default async function OrderStatusPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-2 text-2xl font-bold">Pedido {code}</h1>
      <StatusClient code={code} />
      <div className="mt-8">
        <Link
          className="rounded bg-black px-4 py-2 text-white dark:bg-white dark:text-black"
          href="/"
        >
          Voltar à loja
        </Link>
      </div>
    </div>
  );
}
