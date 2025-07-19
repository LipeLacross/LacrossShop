import Link from "next/link";
import { getCollectionProducts } from "@/app/lib/api";
import { GridTileImage } from "./tile";

type ThreeItemGridItemProps = {
  product: {
    slug: string;
    title: string;
    price: number;
    image: { url: string };
  };
  size: "full" | "half";
  priority?: boolean;
};

function ThreeItemGridItem({
  product,
  size,
  priority,
}: ThreeItemGridItemProps) {
  const classes =
    size === "full"
      ? "md:col-span-4 md:row-span-2"
      : "md:col-span-2 md:row-span-1";
  return (
    <div className={classes}>
      <Link
        href={`/product/${product.slug}`}
        prefetch
        className="block aspect-square w-full h-full"
      >
        <GridTileImage
          src={product.image.url}
          alt={product.title}
          fill
          sizes={
            size === "full"
              ? "(min-width: 768px) 66vw, 100vw"
              : "(min-width: 768px) 33vw, 100vw"
          }
          priority={priority}
          label={{
            title: product.title,
            amount: String(product.price),
            currencyCode: "BRL",
          }}
        />
      </Link>
    </div>
  );
}

export async function ThreeItemGrid() {
  const items = await getCollectionProducts("hidden-homepage-featured-items");
  if (items.length < 3) return null;
  const [first, second, third] = items;
  return (
    <section className="mx-auto grid max-w-[--breakpoint-2xl] gap-4 px-4 pb-4 md:grid-cols-6 md:grid-rows-2 lg:max-h-[calc(100vh-200px)]">
      <ThreeItemGridItem product={first} size="full" priority />
      <ThreeItemGridItem product={second} size="half" priority />
      <ThreeItemGridItem product={third} size="half" />
    </section>
  );
}
