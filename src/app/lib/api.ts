import { Product, Category } from "../types";

const API_URL =
  process.env.NEXT_PUBLIC_STRAPI_URL || "https://strapi.lacrosstech.com.br";

/* ------------------------------ UTILS ------------------------------ */

// Handler de erro padrão para fetchs
async function handle404(res: Response) {
  if (!res.ok)
    throw new Error(
      `API ${res.url} failed: ${res.status} - ${await res.text()}`,
    );
  return res.json();
}

// Wrapper seguro para fetch com tipagem e fallback
async function safeFetch<T>(
  input: RequestInfo,
  init?: RequestInit,
): Promise<T | null> {
  try {
    const res = await fetch(input, { ...init, cache: "no-store" });
    return await handle404(res);
  } catch (err) {
    console.error(`❌ Falha ao buscar ${input.toString()}:`, err);
    return null;
  }
}

/* ------------------------------ TIPOS ------------------------------ */

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

/* ------------------------------ PARSERS ------------------------------ */

// Converte um produto vindo da API do Strapi para o formato do frontend
function mapStrapiProduct(p: StrapiProduct): Product {
  return {
    id: p.id,
    title: p.name,
    description: p.description,
    price: parseFloat(p.price),
    slug: p.slug,
    image: {
      url: p.images?.[0]?.url || "",
    },
    stock: p.stock,
    categories:
      p.categories?.map(({ id, name, slug }) => ({ id, name, slug })) || [],
  };
}

/* ------------------------------ FETCHERS ------------------------------ */

// Todas as categorias (simples)
export async function fetchCategories(): Promise<Category[]> {
  const data = await safeFetch<StrapiCategory[]>(`${API_URL}/categories`);
  if (!data) return [];
  return data.map(({ id, name, slug }) => ({ id, name, slug }));
}

// Todas as categorias com title e updatedAt
export async function getCollections(): Promise<
  { id: number; title: string; slug: string; updatedAt?: string }[]
> {
  const data = await safeFetch<StrapiCategory[]>(`${API_URL}/categories`);
  if (!data) return [];
  return data.map((c) => ({
    id: c.id,
    title: c.name,
    slug: c.slug,
    updatedAt: c.updatedAt,
  }));
}

// Todos os produtos (limitado a 100)
export async function fetchProducts(): Promise<Product[]> {
  const query = `_limit=100&_sort=id:desc&_populate=images,categories`;
  const data = await safeFetch<StrapiProduct[]>(`${API_URL}/products?${query}`);
  return data?.map(mapStrapiProduct) || [];
}

// Produto por slug
export async function fetchProductBySlug(
  slug: string,
): Promise<Product | null> {
  const data = await safeFetch<StrapiProduct[]>(
    `${API_URL}/products?slug=${slug}&_limit=1&_populate=images,categories`,
  );
  return data?.[0] ? mapStrapiProduct(data[0]) : null;
}

// Produtos filtrados por categoria (slug)
export async function getCollectionProducts(slug: string): Promise<Product[]> {
  const categories = await safeFetch<StrapiCategory[]>(
    `${API_URL}/categories?slug=${slug}&_limit=1`,
  );
  if (!categories?.[0]?.id) return [];

  const categoryId = categories[0].id;
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

// Todas as páginas CMS (para sitemap)
export async function getPages(): Promise<
  { slug: string; updatedAt: string }[]
> {
  const pages = await safeFetch<StrapiPage[]>(
    `${API_URL}/pages?_limit=100&_sort=id:desc`,
  );
  return (
    pages?.map((pg) => ({
      slug: pg.slug,
      updatedAt: pg.updatedAt,
    })) || []
  );
}

// Busca de produtos com query/sort reversível
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
  if (query) params.set("q", query);
  params.set("_sort", `${sortKey}:${reverse ? "desc" : "asc"}`);
  params.set("_limit", "100");
  params.set("_populate", "images,categories");

  const url = `${API_URL}/products?${params.toString()}`;
  const data = await safeFetch<StrapiProduct[]>(url);
  return data?.map(mapStrapiProduct) || [];
}
