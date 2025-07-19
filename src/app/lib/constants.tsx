export type SortFilterItem = {
  title: string;
  slug: string;
  sortKey: string;
  reverse: boolean;
};

export const sorting: SortFilterItem[] = [
  { title: "Mais Relevantes", slug: "", sortKey: "relevance", reverse: false },
  {
    title: "Mais Novos",
    slug: "date-new",
    sortKey: "createdAt",
    reverse: true,
  },
  { title: "Maior Preço", slug: "price-desc", sortKey: "price", reverse: true },
  { title: "Menor Preço", slug: "price-asc", sortKey: "price", reverse: false },
];

export const defaultSort = sorting[0];
