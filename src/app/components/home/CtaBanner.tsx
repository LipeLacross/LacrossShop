import Link from "next/link";

export default function CtaBanner() {
  return (
    <section className="mx-auto mt-10 w-full max-w-[--breakpoint-2xl] px-4">
      <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border bg-gradient-to-br from-neutral-50 to-white p-6 md:flex-row dark:border-neutral-800 dark:from-neutral-900 dark:to-neutral-900">
        <div>
          <h2 className="text-2xl font-bold">Ofertas e novidades</h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Explore coleções selecionadas e lançamentos.
          </p>
        </div>
        <Link
          href="/search"
          className="rounded-md bg-black px-5 py-3 text-sm font-semibold text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
        >
          Ver produtos
        </Link>
      </div>
    </section>
  );
}
