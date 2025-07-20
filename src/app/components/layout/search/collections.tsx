"use client";

import clsx from "clsx";
import { Suspense } from "react";
import FilterList from "./filter";
import { getCollections } from "@/app/lib/api";

// ✅ Define o tipo esperado se necessário (supondo que seja igual a SortFilterItem)
type ListItem = {
  title: string;
  slug: string;
  sortKey: string;
  reverse: boolean;
};

async function CollectionList() {
  const collections = await getCollections();

  // ✅ Mapeia os resultados para o tipo ListItem esperado no FilterList
  const mapped: ListItem[] = collections.map((col) => ({
    title: col.title,
    slug: col.slug,
    sortKey: "relevance", // or other logic based on use case
    reverse: false,
  }));

  return <FilterList list={mapped} title="Collections" />;
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
