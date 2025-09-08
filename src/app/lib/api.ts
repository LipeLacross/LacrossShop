import { Product, Category } from "../types";

const RAW_BASE = (
  process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337"
).replace(/\/+$/, "");
const API_URL = RAW_BASE + "/api";

/* ------------------------- HANDLERS UTIL ------------------------- */

async function handle404(res: Response) {
  if (res.status === 404) {
    return null as unknown as { data: unknown } | null;
  }
  if (res.status === 400) {
    // Log detalhado do corpo para debug
    try {
      const clone = res.clone();
      const txt = await clone.text();
      console.warn("⚠️  400 Body:", res.url, txt);
    } catch {}
    return null as unknown as { data: unknown } | null;
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

interface StrapiFileItem {
  id: number;
  attributes: {
    url: string;
    name: string;
    alternativeText?: string;
  };
}
interface StrapiFileRelation {
  data: StrapiFileItem[];
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
    images?: StrapiFileRelation;
    categories: { data: StrapiCategory[] };
  };
}

/* ------------------------ HELPERS QUERY -------------------------- */

// Substitui populate específico por wildcard para evitar 400
const PRODUCT_POPULATE = "populate=*";

/* ------------------------ TRANSFORMADORES ------------------------ */

function mapStrapiProduct(p: any): Product | null {
  if (!p || typeof p !== "object") return null;
  // Strapi v4: { id, attributes: {...} }
  // Strapi v5 (ou Document API): { id, name, slug, ... } direto
  const attrs: any = p.attributes ? p.attributes : p;
  if (!attrs || typeof attrs !== "object") return null;

  // Imagem: tentar ambos formatos (media relation array) v4 e v5
  let imageUrl = "";
  if (attrs.images?.data?.[0]?.attributes?.url) {
    imageUrl = attrs.images.data[0].attributes.url;
  } else if (Array.isArray(attrs.images) && attrs.images[0]?.url) {
    imageUrl = attrs.images[0].url;
  }

  // Categorias: v4 => attrs.categories.data[], v5 possivelmente attrs.categories[]
  let rawCats: any[] = [];
  if (attrs.categories?.data) rawCats = attrs.categories.data;
  else if (Array.isArray(attrs.categories)) rawCats = attrs.categories;

  const categories = rawCats
    .filter((c) => c && (c.attributes || c.name))
    .map((c) => {
      const cAttrs = c.attributes ? c.attributes : c;
      return {
        id: c.id,
        name: cAttrs.name,
        slug: cAttrs.slug,
      } as Category;
    });

  // Campos obrigatórios mínimos
  if (!attrs.name || !attrs.slug) return null;

  return {
    id: p.id,
    title: attrs.name,
    description: attrs.description || attrs.shortDescription || "",
    price: Number(attrs.price) || 0,
    slug: attrs.slug,
    image: { url: imageUrl },
    stock: Number(attrs.stock) || 0,
    categories,
    updatedAt: attrs.updatedAt,
  };
}

/* ---------------------------- FETCHERS --------------------------- */

// Categorias básicas
export async function fetchCategories(): Promise<Category[]> {
  const data = await safeFetch<{ data: StrapiCategory[] | null }>(
    `${API_URL}/categories?populate=*`,
  );
  if (!data || !Array.isArray(data.data)) return [];
  return data.data
    .filter((cat): cat is StrapiCategory => !!cat && !!cat.attributes)
    .map((cat) => ({
      id: cat.id,
      name: cat.attributes.name,
      slug: cat.attributes.slug,
    }));
}

// Categorias completas para sitemap
export async function getCollections(): Promise<
  { id: number; title: string; slug: string; updatedAt?: string }[]
> {
  const data = await safeFetch<{ data: StrapiCategory[] | null }>(
    `${API_URL}/categories?populate=*`,
  );
  const list = Array.isArray(data?.data) ? data!.data : [];
  return list
    .filter((c): c is StrapiCategory => !!c && !!c.attributes)
    .map((c) => ({
      id: c.id,
      title: c.attributes.name,
      slug: c.attributes.slug,
      updatedAt: c.attributes.updatedAt,
    }));
}

// Todos os produtos
export async function fetchProducts(): Promise<Product[]> {
  const query = `${PRODUCT_POPULATE}&pagination[limit]=100&sort=id:desc`;
  const data = await safeFetch<{ data: any[] }>(`${API_URL}/products?${query}`);
  return (data?.data || [])
    .map(mapStrapiProduct)
    .filter((p): p is Product => !!p);
}

// Produto único por slug
export async function fetchProductBySlug(
  slug: string,
): Promise<Product | null> {
  const data = await safeFetch<{ data: any[] }>(
    `${API_URL}/products?filters[slug][$eq]=${encodeURIComponent(
      slug,
    )}&${PRODUCT_POPULATE}&pagination[limit]=1`,
  );
  const prod = (data?.data || []).map(mapStrapiProduct).find(Boolean) || null;
  return prod;
}

// Produtos de uma categoria
export async function getCollectionProducts(slug: string): Promise<Product[]> {
  const categories = await safeFetch<{ data: StrapiCategory[] }>(
    `${API_URL}/categories?filters[slug][$eq]=${encodeURIComponent(
      slug,
    )}&pagination[limit]=1`,
  );
  const categoryId = categories?.data?.[0]?.id;
  if (!categoryId) return [];
  const products = await safeFetch<{ data: any[] }>(
    `${API_URL}/products?filters[categories][id][$eq]=${categoryId}&${PRODUCT_POPULATE}&pagination[limit]=100&sort=id:desc`,
  );
  return (products?.data || [])
    .map(mapStrapiProduct)
    .filter((p): p is Product => !!p);
}

export async function getPage(slug: string) {
  const url = `${API_URL}/pages?filters[slug][$eq]=${encodeURIComponent(
    slug,
  )}&populate=*&pagination[limit]=1`;
  const data = await safeFetch<{
    data: { id: number; attributes: Record<string, unknown> }[];
  }>(url);
  const item = data?.data?.[0];
  if (!item || typeof item !== "object") return null;
  const a = item.attributes as Record<string, unknown>;
  return {
    id: item.id,
    title: a["title"] as string,
    slug: a["slug"] as string,
    body: a["body"] as string,
    bodySummary: a["bodySummary"] as string,
    createdAt: a["createdAt"] as string,
    updatedAt: a["updatedAt"] as string,
    seo: a["seo"] as Record<string, unknown> | undefined,
  };
}

// Todas as páginas para sitemap
export async function getPages(): Promise<
  { slug: string; updatedAt: string }[]
> {
  const url = `${API_URL}/pages?pagination[limit]=100&sort=id:desc`;
  const data = await safeFetch<{
    data: { id: number; attributes: Record<string, unknown> }[];
  }>(url);
  return (
    data?.data?.map(({ attributes }) => {
      const a = attributes as Record<string, unknown>;
      return {
        slug: a["slug"] as string,
        updatedAt: (a["updatedAt"] as string) || "",
      };
    }) || []
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
  const allowedSort = ["createdAt", "price", "updatedAt", "name", "id"];
  const finalSortKey = allowedSort.includes(sortKey) ? sortKey : "createdAt";
  params.set("sort", `${finalSortKey}:${reverse ? "desc" : "asc"}`);
  params.set("pagination[limit]", "100");
  params.set("populate", "*");
  const baseUrl = `${API_URL}/products?${params.toString()}`;
  let data = await safeFetch<{ data: any[] }>(baseUrl);
  if (!data || !Array.isArray(data.data)) {
    const retry = new URLSearchParams(params);
    retry.delete("sort");
    data = await safeFetch<{ data: any[] }>(
      `${API_URL}/products?${retry.toString()}`,
    );
  }
  const raw = data?.data || [];
  console.warn(
    "[getProducts] raw length=",
    raw.length,
    "query=",
    query,
    "sample=",
    raw[0] ? Object.keys(raw[0]) : null,
  );
  const mapped = raw.map(mapStrapiProduct);
  const filtered = mapped.filter((p): p is Product => !!p);
  if (filtered.length !== raw.length) {
    console.warn(
      `[getProducts] descartados ${raw.length - filtered.length} itens sem attributes/estruturas esperadas.`,
    );
  }
  return filtered;
}
