import Grid from "@/app/components/grid";
import { GridTileImage } from "@/app/components/grid/tile";
import Link from "next/link";
import { Product } from "@/app/types"; // ✅ importa o tipo correto

export default function ProductGridItems({
  products,
}: {
  products: Product[];
}) {
  return (
    <>
      {products.map((product) => (
        <Grid.Item key={product.id} className="animate-fadeIn">
          <Link
            className="relative inline-block h-full w-full"
            href={`/product/${product.slug}`}
            prefetch={true}
          >
            <GridTileImage
              alt={product.title}
              label={{
                title: product.title,
                amount: product.price.toFixed(2),
                currencyCode: "BRL",
              }}
              src={product.image?.url}
              fill
              sizes="(min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
            />
          </Link>
        </Grid.Item>
      ))}
    </>
  );
}
