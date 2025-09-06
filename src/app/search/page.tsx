import Grid from "@/app/components/grid";
import { ProductGrid } from "@/app/components/product/ProductGrid";
import { getProducts } from "@/app/lib/api";
import { defaultSort, sorting } from "@/app/lib/constants";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type Props = {
  searchParams?: Promise<{ q?: string; sort?: string }>;
};

export const metadata: Metadata = {
  title: "Busca",
  description: "Busque por produtos na NeoMercado.",
};

export default async function SearchPage({ searchParams }: Props) {
  const sp = searchParams ? await searchParams : {};
  const { q: searchValue, sort } = sp;

  const sortItem = sorting.find((s) => s.slug === sort) || defaultSort;

  const products = await getProducts({
    query: searchValue,
    sortKey: sortItem.sortKey,
    reverse: sortItem.reverse,
  });

  if (!products) notFound();

  const resultsText = products.length !== 1 ? "resultados" : "resultado";

  return (
    <>
      {searchValue && (
        <p className="mb-4">
          {products.length === 0
            ? "Não há produtos que correspondam a "
            : `Exibindo ${products.length} ${resultsText} para `}
          <span className="font-bold">&quot;{searchValue}&quot;</span>
        </p>
      )}
      {products.length > 0 && (
        <Grid className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <ProductGrid products={products} />
        </Grid>
      )}
    </>
  );
}
