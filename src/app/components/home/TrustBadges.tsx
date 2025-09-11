export default function TrustBadges() {
  return (
    <section className="mx-auto mt-10 w-full max-w-[--breakpoint-2xl] px-4">
      <div className="grid grid-cols-1 gap-4 rounded-xl border p-6 md:grid-cols-3 dark:border-neutral-800">
        <div>
          <p className="text-sm font-semibold">Pagamentos</p>
          <p className="text-xs text-neutral-600 dark:text-neutral-400">
            Cartão, Pix e Boleto
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold">Proteção de compra</p>
          <p className="text-xs text-neutral-600 dark:text-neutral-400">
            Troca e devolução facilitadas
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold">Entrega rastreável</p>
          <p className="text-xs text-neutral-600 dark:text-neutral-400">
            Acompanhe seu pedido do envio à entrega
          </p>
        </div>
      </div>
    </section>
  );
}
