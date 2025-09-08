import FilterList from "./filter";
import { getCollections } from "@/app/lib/api";

// Map Strapi collections to SortFilterItem-like objects
export default async function Collections() {
  const collections = await getCollections();
  if (!collections || collections.length === 0) return null;
  const mapped = collections.map((col) => ({
    title: col.title,
    slug: col.slug,
    sortKey: "createdAt",
    reverse: false,
  }));
  return <FilterList list={mapped} title="Collections" />;
}
