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
  const categories = attrs.categories?.data?.map(cat => ({
    id: cat.id,
    name: cat.attributes.name,
    slug: cat.attributes.slug
  })) || [];

  return {
    id: p.id,
    title: attrs.name,
    description: attrs.description,
    price: attrs.price,
    slug: attrs.slug,
    image: { url: imageUrl },
    stock: attrs.stock,
    categories: categories,
  };
}

/* ---------------------------- FETCHERS --------------------------- */

// Categorias básicas
export async function fetchCategories(): Promise<Category[]> {
  const data = await safeFetch<{ data: StrapiCategory[] }>(`${API_URL}/categories?populate=*`);
  return data?.data?.map(cat => ({
    id: cat.id,
    name: cat.attributes.name,
    slug: cat.attributes.slug
  })) || [];
}

// Categorias completas para sitemap
export async function getCollections(): Promise<
  { id: number; title: string; slug: string; updatedAt?: string }[]
> {
  const data = await safeFetch<{ data: StrapiCategory[] }>(`${API_URL}/categories?populate=*`);
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
  const data = await safeFetch<{ data: StrapiProduct[] }>(`${API_URL}/products?${query}`);
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
      `${API_URL}/categories?filters[slug][$eq]=${slug}&pagination[limit]=1`);
  const categoryId = categories?.data?.[0]?.id;
  if (!categoryId) return [];

  const products = await safeFetch<{ data: StrapiProduct[] }>(
    `${API_URL}/products?filters[categories][id][$eq]=${categoryId}&populate=images,categories&pagination[limit]=100&sort=id:desc`,
  );
  return products?.data?.map(mapStrapiProduct) || [];
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
  const data = await safeFetch<{ data: StrapiProduct[] }>(url);
  return data?.data?.map(mapStrapiProduct) || [];
}
