"use client";

import clsx from "clsx";
import { Suspense } from "react";
import FilterList from "./filter";
import { getCollections } from "@/app/lib/api"; // ✅ CORRETO: função que retorna todas as categorias

async function CollectionList() {
  const collections = await getCollections(); // ✅ sem argumento!
  return <FilterList list={collections} title="Collections" />;
}

const skeleton = "mb-3 h-4 w-5/6 animate-pulse rounded-sm";
const activeAndTitles = "bg-neutral-800 dark:bg-neutral-300";
const items = "bg-neutral-400 dark:bg-neutral-700";

export default function Collections() {
  return (
    <Suspense
      fallback={
        <div className="col-span-2 hidden h-[400px] w-full flex-none py-4 lg:block">
          <div className={clsx(skeleton, activeAndTitles)} />
          {Array(9)
            .fill(0)
            .map((_, i) => (
              <div key={i} className={clsx(skeleton, items)} />
            ))}
        </div>
      }
    >
      <CollectionList />
    </Suspense>
  );
}
