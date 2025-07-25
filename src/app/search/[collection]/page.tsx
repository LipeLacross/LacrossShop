import Grid from "@/app/components/grid";
import ProductGridItems from "@/app/components/layout/product-grid-items";
import { defaultSort, sorting } from "@/app/lib/constants";
import { getProducts } from "@/app/lib/api";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ collection: string }>;
  searchParams?: Promise<{ q?: string; sort?: string }>;
};

// ✅ SEO dinâmico com `collection`
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { collection } = await params;

  return {
    title: `Search results for ${collection}`,
    description: `Browse products in the ${collection} collection.`,
  };
}

// ✅ `params` removido completamente pois não é usado dentro
export default async function SearchPage({
  searchParams,
}: Omit<Props, "params">) {
  const sp = searchParams ? await searchParams : {};
  const { q: searchValue, sort } = sp;
  const sortItem = sorting.find((s) => s.slug === sort) || defaultSort;

  const products = await getProducts({
    query: searchValue,
    sortKey: sortItem.sortKey,
    reverse: sortItem.reverse,
  });

  if (!products) notFound();

  const resultsText = products.length === 1 ? "result" : "results";

  return (
    <>
      {searchValue && (
        <p className="mb-4">
          {products.length === 0
            ? "There are no products that match "
            : `Showing ${products.length} ${resultsText} for `}
          <span className="font-bold">&quot;{searchValue}&quot;</span>
        </p>
      )}
      {products.length > 0 && (
        <Grid className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <ProductGridItems products={products} />
        </Grid>
      )}
    </>
  );
}
