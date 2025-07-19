import Link from "next/link";
import { getCollectionProducts } from "@/app/lib/api";
import { GridTileImage } from "./grid/tile";

export async function Carousel() {
  const products = await getCollectionProducts("hidden-homepage-carousel");

  if (!products.length) return null;

  const repeated = [...products, ...products, ...products];

  return (
    <div className="w-full overflow-x-auto pb-6 pt-1">
      <ul className="flex animate-carousel gap-4">
        {repeated.map((product, i) => (
          <li
            key={`${product.slug}-${i}`}
            className="relative aspect-square h-[30vh] max-h-[275px] w-2/3 max-w-[475px] flex-none md:w-1/3"
          >
            <Link
              href={`/product/${product.slug}`}
              className="relative h-full w-full"
            >
              <GridTileImage
                alt={product.title}
                label={{
                  title: product.title,
                  amount: String(product.price),
                  currencyCode: "BRL",
                }}
                src={product.image.url}
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
