import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-gradient-to-br from-sky-50 to-indigo-50 p-8 dark:border-neutral-800 dark:from-neutral-900 dark:to-neutral-950">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white md:text-5xl">
              NeoMercado
            </h1>
            <p className="mt-4 text-neutral-700 dark:text-neutral-300">
              Uma loja moderna, rápida e escalável. Encontre eletrônicos,
              acessórios e muito mais.
            </p>
            <div className="mt-6 flex gap-3">
              <Link
                href="/search"
                className="rounded-md bg-black px-5 py-3 text-sm font-semibold text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
              >
                Explorar produtos
              </Link>
              <a
                href="#destaques"
                className="rounded-md border border-neutral-300 px-5 py-3 text-sm font-semibold text-neutral-900 hover:bg-neutral-100 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-800"
              >
                Ver destaques
              </a>
            </div>
          </div>
          <div className="relative hidden aspect-[4/3] w-full rounded-xl bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white to-transparent shadow-inner md:block dark:from-neutral-800">
            <div className="absolute inset-8 rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700" />
          </div>
        </div>
      </div>
    </section>
  );
}
