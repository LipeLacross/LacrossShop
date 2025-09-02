import { Product, Category } from "../types";

const API_URL = (process.env.NEXT_PUBLIC_STRAPI_URL || "https://seu-strapi") + "/api";

/* ------------------------- HANDLERS UTIL ------------------------- */

async function handle404(res: Response) {
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
    console.error(`❌ Falha ao buscar ${input.toString()}:`, error);
    return null;
  }
}

/* ---------------------------- TIPOS RAW -------------------------- */

interface StrapiCategory {
  id: number;
  name: string;
  slug: string;
  updatedAt?: string;
}

interface StrapiFile {
  url: string;
}

interface StrapiProduct {
  id: number;
  name: string;
  description: string;
  price: string;
  slug: string;
  images: StrapiFile[];
  stock: number;
  updatedAt?: string;
  categories: StrapiCategory[];
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
  return {
    id: p.id,
    title: p.name,
    description: p.description,
    price: parseFloat(p.price),
    slug: p.slug,
    image: { url: p.images[0]?.url || "" },
    stock: p.stock,
    categories: p.categories.map(({ id, name, slug }) => ({ id, name, slug })),
  };
}

/* ---------------------------- FETCHERS --------------------------- */

// Categorias básicas
export async function fetchCategories(): Promise<Category[]> {
  const data = await safeFetch<StrapiCategory[]>(`${API_URL}/categories`);
  return data?.map(({ id, name, slug }) => ({ id, name, slug })) || [];
}

// Categorias completas para sitemap
export async function getCollections(): Promise<
  { id: number; title: string; slug: string; updatedAt?: string }[]
> {
  const data = await safeFetch<StrapiCategory[]>(`${API_URL}/categories`);
  return (
    data?.map((c) => ({
      id: c.id,
      title: c.name,
      slug: c.slug,
      updatedAt: c.updatedAt,
    })) || []
  );
}

// Todos os produtos
export async function fetchProducts(): Promise<Product[]> {
  const query = `_limit=100&_sort=id:desc&_populate=images,categories`;
  const data = await safeFetch<StrapiProduct[]>(`${API_URL}/products?${query}`);
  return data?.map(mapStrapiProduct) || [];
}

// Produto único por slug
export async function fetchProductBySlug(
  slug: string,
): Promise<Product | null> {
  const data = await safeFetch<StrapiProduct[]>(
      `${API_URL}/products?populate=images,categories&pagination[limit]=100&sort=id:desc`,
  );
  return data?.[0] ? mapStrapiProduct(data[0]) : null;
}

// Produtos de uma categoria
export async function getCollectionProducts(slug: string): Promise<Product[]> {
  const categories = await safeFetch<StrapiCategory[]>(
      `${API_URL}/products?filters[slug][$eq]=${slug}&populate=images,categories&pagination[limit]=1`,  );
  const categoryId = categories?.[0]?.id;
  if (!categoryId) return [];

  const products = await safeFetch<StrapiProduct[]>(
    `${API_URL}/products?categories.id=${categoryId}&_limit=100&_sort=id:desc&_populate=images,categories`,
  );
  return products?.map(mapStrapiProduct) || [];
}

// Página CMS por slug
export async function getPage(slug: string): Promise<StrapiPage | null> {
  const data = await safeFetch<StrapiPage[]>(
    `${API_URL}/pages?slug=${slug}&_limit=1`,
  );
  return data?.[0] || null;
}

// Todas as páginas para sitemap
export async function getPages(): Promise<
  { slug: string; updatedAt: string }[]
> {
  const data = await safeFetch<StrapiPage[]>(
    `${API_URL}/pages?_limit=100&_sort=id:desc`,
  );
  return (
    data?.map((pg) => ({
      slug: pg.slug,
      updatedAt: pg.updatedAt,
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
  const data = await safeFetch<StrapiProduct[]>(url);
  return data?.map(mapStrapiProduct) || [];
}
