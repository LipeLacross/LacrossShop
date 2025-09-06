import { Product, Category } from "../types";

const RAW_BASE = (
  process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337"
).replace(/\/+$/, "");
const API_URL = RAW_BASE + "/api";

/* ------------------------- HANDLERS UTIL ------------------------- */

async function handle404(res: Response) {
  if (res.status === 404) {
    // Gracefully treat 404 as missing resource
    return null as any;
  }
  if (!res.ok)
    throw new Error(
      `API ${res.url} failed: ${res.status} - ${await res.text()}`,
    );
  return res.json();
}

async function safeFetch<T>(
  input: RequestInfo,
  init?: RequestInit,
): Promise<T | null> {
  try {
    const response = await fetch(input, {
      ...init,
      cache: process.env.NODE_ENV === "production" ? "force-cache" : "no-store",
    });
    return await handle404(response);
  } catch (error) {
    // Only log unexpected errors (network / non-404)
    console.error(`❌ Falha ao buscar ${input.toString()}:`, error);
    return null;
  }
}

/* ---------------------------- TIPOS RAW -------------------------- */

interface StrapiCategory {
  id: number;
  attributes: {
    name: string;
    slug: string;
    description?: string;
    featured: boolean;
    updatedAt?: string;
  };
}

interface StrapiFile {
  data: {
    id: number;
    attributes: {
      url: string;
      name: string;
      alternativeText?: string;
    };
  }[];
}

interface StrapiProduct {
  id: number;
  attributes: {
    name: string;
    description: string;
    shortDescription?: string;
    price: number;
    slug: string;
    stock: number;
    featured: boolean;
    active: boolean;
    updatedAt?: string;
    images: StrapiFile;
    categories: {
      data: StrapiCategory[];
    };
  };
}

interface StrapiPage {
  id: number;
  title: string;
  slug: string;
  body: string;
  bodySummary: string;
  createdAt: string;
  updatedAt: string;
  seo?: {
    title?: string;
    description?: string;
  };
}

/* ------------------------ TRANSFORMADORES ------------------------ */

function mapStrapiProduct(p: StrapiProduct): Product {
  const attrs = p.attributes;
  const imageUrl = attrs.images?.data?.[0]?.attributes?.url || "";
  const categories =
    attrs.categories?.data?.map((cat) => ({
      id: cat.id,
      name: cat.attributes.name,
      slug: cat.attributes.slug,
    })) || [];
  return {
    id: p.id,
    title: attrs.name,
    description: attrs.description,
    price: Number(attrs.price), // garante número mesmo se vier string (decimal)
    slug: attrs.slug,
    image: { url: imageUrl },
    stock: attrs.stock,
    categories,
  };
}

/* ---------------------------- FETCHERS --------------------------- */

// Categorias básicas
export async function fetchCategories(): Promise<Category[]> {
  const data = await safeFetch<{ data: StrapiCategory[] }>(
    `${API_URL}/categories?populate=*`,
  );
  return (
    data?.data?.map((cat) => ({
      id: cat.id,
      name: cat.attributes.name,
      slug: cat.attributes.slug,
    })) || []
  );
}

// Categorias completas para sitemap
export async function getCollections(): Promise<
  { id: number; title: string; slug: string; updatedAt?: string }[]
> {
  const data = await safeFetch<{ data: StrapiCategory[] }>(
    `${API_URL}/categories?populate=*`,
  );
  return (
    data?.data?.map((c) => ({
      id: c.id,
      title: c.attributes.name,
      slug: c.attributes.slug,
      updatedAt: c.attributes.updatedAt,
    })) || []
  );
}

// Todos os produtos
export async function fetchProducts(): Promise<Product[]> {
  const query = `populate=images,categories&pagination[limit]=100&sort=id:desc`;
  const data = await safeFetch<{ data: StrapiProduct[] }>(
    `${API_URL}/products?${query}`,
  );
  return data?.data?.map(mapStrapiProduct) || [];
}

// Produto único por slug
export async function fetchProductBySlug(
  slug: string,
): Promise<Product | null> {
  const data = await safeFetch<{ data: StrapiProduct[] }>(
    `${API_URL}/products?filters[slug][$eq]=${slug}&populate=images,categories&pagination[limit]=1`,
  );
  return data?.data?.[0] ? mapStrapiProduct(data.data[0]) : null;
}

// Produtos de uma categoria
export async function getCollectionProducts(slug: string): Promise<Product[]> {
  const categories = await safeFetch<{ data: StrapiCategory[] }>(
    `${API_URL}/categories?filters[slug][$eq]=${slug}&pagination[limit]=1`,
  );
  const categoryId = categories?.data?.[0]?.id;
  if (!categoryId) return [];

  const products = await safeFetch<{ data: StrapiProduct[] }>(
    `${API_URL}/products?filters[categories][id][$eq]=${categoryId}&populate=images,categories&pagination[limit]=100&sort=id:desc`,
  );
  return products?.data?.map(mapStrapiProduct) || [];
}

export async function getPage(slug: string) {
  // v5: usa filters + pagination e mapeia o objeto {id, attributes}
  const url = `${API_URL}/pages?filters[slug][$eq]=${encodeURIComponent(
    slug,
  )}&populate=*&pagination[limit]=1`;
  const data = await safeFetch<{ data: { id: number; attributes: any }[] }>(
    url,
  );
  const item = data?.data?.[0];
  if (!item) return null;

  const a = item.attributes;
  return {
    id: item.id,
    title: a.title,
    slug: a.slug,
    body: a.body,
    bodySummary: a.bodySummary,
    createdAt: a.createdAt,
    updatedAt: a.updatedAt,
    seo: a.seo,
  };
}

// Todas as páginas para sitemap
export async function getPages(): Promise<
  { slug: string; updatedAt: string }[]
> {
  const url = `${API_URL}/pages?pagination[limit]=100&sort=id:desc`;
  const data = await safeFetch<{ data: { id: number; attributes: any }[] }>(
    url,
  );
  return (
    data?.data?.map(({ attributes: a }) => ({
      slug: a.slug,
      updatedAt: a.updatedAt,
    })) || []
  );
}
// Produtos com busca + ordenação
export async function getProducts({
  query,
  sortKey = "createdAt",
  reverse = false,
}: {
  query?: string;
  sortKey?: string;
  reverse?: boolean;
}): Promise<Product[]> {
  const params = new URLSearchParams();
  if (query) params.set("filters[name][$containsi]", query);
  params.set("sort", `${sortKey}:${reverse ? "desc" : "asc"}`);
  params.set("pagination[limit]", "100");
  params.set("populate", "images,categories");

  const url = `${API_URL}/products?${params.toString()}`;
  const data = await safeFetch<{ data: StrapiProduct[] }>(url);
  return data?.data?.map(mapStrapiProduct) || [];
}
