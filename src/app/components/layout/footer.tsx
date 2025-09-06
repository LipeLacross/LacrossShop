import Link from "next/link";
import { Suspense } from "react";
import FooterMenu from "@/app/components/layout/footer-menu";
import LogoSquare from "@/app/components/logo-square";
import { fetchCategories } from "@/app/lib/api";
import { Category } from "@/app/types";

const { COMPANY_NAME, SITE_NAME } = process.env;

export default async function Footer() {
  const currentYear = new Date().getFullYear();
  const copyright = 2023 + (currentYear > 2023 ? `-${currentYear}` : "");

  const skeleton =
    "w-full h-6 animate-pulse rounded-sm bg-neutral-200 dark:bg-neutral-700";

  let categories: Category[] = [];

  try {
    categories = await fetchCategories();
  } catch (err) {
    console.error("Erro ao buscar categorias no footer:", err);
  }

  const menu = categories.map((cat) => ({
    title: cat.name,
    path: `/search/${cat.slug}`,
  }));

  const copyrightName = COMPANY_NAME || SITE_NAME || "NeoMercado";

  return (
    <footer className="text-sm text-neutral-500 dark:text-neutral-400">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 border-t border-neutral-200 px-6 py-12 text-sm md:flex-row md:gap-12 md:px-4 min-[1320px]:px-0 dark:border-neutral-700">
        <div>
          <Link
            href="/"
            className="flex items-center gap-2 text-black md:pt-1 dark:text-white"
          >
            <LogoSquare size="sm" />
            <span className="uppercase">{SITE_NAME}</span>
          </Link>
        </div>

        <Suspense
          fallback={
            <div className="flex h-[188px] w-[200px] flex-col gap-2">
              {Array(6)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className={skeleton} />
                ))}
            </div>
          }
        >
          <FooterMenu menu={menu} />
        </Suspense>

        {/* Botão de deploy da Vercel removido para padronização de branding */}
      </div>

      <div className="border-t border-neutral-200 py-6 dark:border-neutral-700">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-1 px-4 md:flex-row">
          <p>
            &copy; {copyright} {copyrightName}
            {copyrightName.length && !copyrightName.endsWith(".")
              ? "."
              : ""}{" "}
            All rights reserved.
          </p>
          <hr className="mx-4 hidden h-4 w-[1px] border-l border-neutral-400 md:inline-block" />
          {/* Links externos padrão removidos */}
        </div>
      </div>
    </footer>
  );
}
