import { MetadataRoute } from "next";
import { getCollections, getProducts, getPages } from "@/app/lib/api";
import { baseUrl } from "@/app/lib/utils";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const home = {
    url: `${baseUrl}/`,
    lastModified: new Date().toISOString(),
  };

  const [collections, products, pages] = await Promise.all([
    getCollections(),
    getProducts({}),
    getPages(),
  ]);

  const collectionRoutes = collections.map((col: any) => ({
    url: `${baseUrl}/search/${col.slug}`,
    lastModified: col.updatedAt,
  }));

  const productRoutes = products.map((prod: any) => ({
    url: `${baseUrl}/product/${prod.slug}`,
    lastModified: prod.updatedAt,
  }));

  const pageRoutes = pages.map((pg: any) => ({
    url: `${baseUrl}/${pg.slug}`,
    lastModified: pg.updatedAt,
  }));

  return [home, ...collectionRoutes, ...productRoutes, ...pageRoutes];
}
