import { MetadataRoute } from "next";
import { getCollections, getPages, getProducts } from "@/app/lib/api";
import { baseUrl } from "@/app/lib/utils";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const home: MetadataRoute.SitemapEntry = {
    url: baseUrl + "/",
    lastModified: new Date().toISOString(),
  };

  const [collections, products, pages] = await Promise.all([
    getCollections(),
    getProducts({}),
    getPages(),
  ]);

  const collectionRoutes = collections.map((col) => ({
    url: `${baseUrl}/search/${col.slug}`,
    lastModified: col.updatedAt,
  }));
  const productRoutes = products.map((prod) => ({
    url: `${baseUrl}/product/${prod.slug}`,
    lastModified: prod.updatedAt,
  }));
  const pageRoutes = pages.map((pg) => ({
    url: `${baseUrl}/${pg.slug}`,
    lastModified: pg.updatedAt,
  }));

  return [home, ...collectionRoutes, ...productRoutes, ...pageRoutes];
}
