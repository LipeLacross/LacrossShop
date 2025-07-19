import Grid from "@/app/components/grid";
import { ProductGrid } from "@/app/components/product/ProductGrid"; // corrigido aqui
import { getProducts } from "@/app/lib/api";
import { defaultSort, sorting } from "@/app/lib/constants";

export const metadata = {
  title: "Search",
  description: "Search for products in the store.",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams?: { q?: string; sort?: string };
}) {
  const { q: searchValue, sort } = searchParams || {};

  const sortItem = sorting.find((s) => s.slug === sort) || defaultSort;

  const products = await getProducts({
    query: searchValue,
    sortKey: sortItem.sortKey,
    reverse: sortItem.reverse,
  });

  const resultsText = products.length !== 1 ? "results" : "result";

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
          <ProductGrid products={products} />
        </Grid>
      )}
    </>
  );
}
