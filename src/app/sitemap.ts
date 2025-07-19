import { MetadataRoute } from "next";
import { getCollections, getPages, getProducts } from "@/app/lib/api";
import { baseUrl } from "@/app/lib/utils";
import type { Product } from "@/app/types";

// Corrigimos aqui o tipo da coleção, que tem 'title' no getCollections
interface CollectionEntry {
  id: number;
  title: string;
  slug: string;
  updatedAt?: string;
}

interface Page {
  slug: string;
  updatedAt: string;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const home: MetadataRoute.Sitemap[0] = {
    url: `${baseUrl}/`,
    lastModified: new Date().toISOString(),
  };

  const [collections, products, pages] = await Promise.all([
    getCollections(), // Retorna CollectionEntry[]
    getProducts({}), // Retorna Product[]
    getPages(), // Retorna Page[]
  ]);

  const collectionRoutes = collections.map((col: CollectionEntry) => ({
    url: `${baseUrl}/search/${col.slug}`,
    lastModified: col.updatedAt ?? new Date().toISOString(),
  }));

  const productRoutes = products.map((prod: Product) => ({
    url: `${baseUrl}/product/${prod.slug}`,
    lastModified: prod.updatedAt ?? new Date().toISOString(),
  }));

  const pageRoutes = pages.map((pg: Page) => ({
    url: `${baseUrl}/${pg.slug}`,
    lastModified: pg.updatedAt ?? new Date().toISOString(),
  }));

  return [home, ...collectionRoutes, ...productRoutes, ...pageRoutes];
}
