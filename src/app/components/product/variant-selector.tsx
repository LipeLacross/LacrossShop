"use client";

import clsx from "clsx";
import {
  useProduct,
  useUpdateURL,
} from "@/app/components/product/product-context";

// ✅ Adicione aqui os tipos ausentes
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

type Combination = {
  id: string;
  availableForSale: boolean;
  [key: string]: string | boolean;
};

export function VariantSelector({
  options,
  variants,
}: {
  options: ProductOption[];
  variants: ProductVariant[];
}) {
  const { state, updateOption } = useProduct();
  const updateURL = useUpdateURL();
  const hasNoOptionsOrJustOneOption =
    !options.length ||
    (options.length === 1 && options[0]?.values.length === 1);

  if (hasNoOptionsOrJustOneOption) return null;

  const combinations: Combination[] = variants.map((variant) => ({
    id: variant.id,
    availableForSale: variant.availableForSale,
    ...variant.selectedOptions.reduce(
      (acc, opt) => {
        acc[opt.name.toLowerCase()] = opt.value;
        return acc;
      },
      {} as { [key: string]: string },
    ),
  }));

  return options.map((option) => (
    <form key={option.id}>
      <dl className="mb-8">
        <dt className="mb-4 text-sm uppercase tracking-wide">{option.name}</dt>
        <dd className="flex flex-wrap gap-3">
          {option.values.map((value) => {
            const nameLC = option.name.toLowerCase();
            const optionParams = { ...state, [nameLC]: value };
            const filtered = Object.entries(optionParams).filter(([k, v]) =>
              options.find(
                (opt) => opt.name.toLowerCase() === k && opt.values.includes(v),
              ),
            );
            const isAvailableForSale =
              combinations.find((c) =>
                filtered.every(([k, v]) => c[k] === v && c.availableForSale),
              ) !== undefined;

            const isActive = state[nameLC] === value;

            return (
              <button
                formAction={() => {
                  const newState = updateOption(nameLC, value);
                  updateURL(newState);
                }}
                key={value}
                aria-disabled={!isAvailableForSale}
                disabled={!isAvailableForSale}
                title={`${option.name} ${value}${!isAvailableForSale ? " (Out of Stock)" : ""}`}
                className={clsx(
                  "flex min-w-[48px] items-center justify-center rounded-full border bg-neutral-100 px-2 py-1 text-sm dark:border-neutral-800 dark:bg-neutral-900",
                  {
                    "cursor-default ring-2 ring-blue-600": isActive,
                    "ring-1 ring-transparent transition duration-300 ease-in-out hover:ring-blue-600":
                      !isActive && isAvailableForSale,
                    "relative z-10 cursor-not-allowed overflow-hidden bg-neutral-100 text-neutral-500 ring-1 ring-neutral-300 before:absolute before:inset-x-0 before:-z-10 before:h-px before:-rotate-45 before:bg-neutral-300 before:transition-transform dark:bg-neutral-900 dark:text-neutral-400 dark:ring-neutral-700 dark:before:bg-neutral-700":
                      !isAvailableForSale,
                  },
                )}
              >
                {value}
              </button>
            );
          })}
        </dd>
      </dl>
    </form>
  ));
}
