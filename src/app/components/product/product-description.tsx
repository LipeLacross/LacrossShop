import Price from "../price";
import Prose from "../prose";
import { VariantSelector } from "./variant-selector";
import { Product } from "@/app/types";
import { AddToCart } from "@/app/components/cart/add-to-cart";

// Tipos podem ser importados ou definidos aqui caso sejam usados só neste componente:
type ProductOption = {
  id: string;
  name: string;
  values: string[];
};

type ProductVariant = {
  id: string;
  availableForSale: boolean;
  selectedOptions: {
    name: string;
    value: string;
  }[];
};

type ProductWithVariants = Product & {
  variants?: ProductOption[];
  variantsData?: ProductVariant[];
  descriptionHtml?: string;
};

export function ProductDescription({
  product,
}: {
  product: ProductWithVariants;
}) {
  return (
    <>
      <div className="mb-6 flex flex-col border-b pb-6 dark:border-neutral-700">
        <h1 className="mb-2 text-5xl font-medium">{product.title}</h1>
        <div className="mr-auto w-auto rounded-full bg-blue-600 p-2 text-sm text-white">
          <Price amount={String(product.price)} currencyCode="BRL" />
        </div>
      </div>

      <VariantSelector
        options={product.variants || []}
        variants={product.variantsData || []}
      />

      {product.descriptionHtml && (
        <Prose
          className="mb-6 text-sm leading-tight dark:text-white/[60%]"
          html={product.descriptionHtml}
        />
      )}

      <AddToCart product={product} />
    </>
  );
}
