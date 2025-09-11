import { Product, Category } from "../types";

const RAW_BASE = (
  process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337"
).replace(/\/+$/, "");
const API_URL = RAW_BASE + "/api";

async function handle404(res: Response) {
  if (res.status === 404) return null as unknown as { data: unknown } | null;
  if (res.status === 400) {
    try {
      const txt = await res.clone().text();
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

// Tipos (suporta v4 e v5)
export type StrapiCategoryV4Data = {
  id: number;
  attributes: { name: string; slug: string };
};
export type StrapiCategoryInline = { id: number; name: string; slug: string };
export type StrapiImagesV4 = { data: Array<{ attributes: { url: string } }> };
export type StrapiImagesV5 = Array<{ url: string }>;
export type ProductAttrsV4 = {
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  price: number;
  stock: number;
  images?: StrapiImagesV4 | StrapiImagesV5;
  categories?: { data: StrapiCategoryV4Data[] } | StrapiCategoryInline[];
  updatedAt?: string;
};
export type StrapiProductV4 = { id: number; attributes: ProductAttrsV4 };
export type StrapiProductV5 = {
  id: number;
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  price: number;
  stock: number;
  images?: StrapiImagesV4 | StrapiImagesV5;
  categories?: { data: StrapiCategoryV4Data[] } | StrapiCategoryInline[];
  updatedAt?: string;
};
export type StrapiProductAny = StrapiProductV4 | StrapiProductV5;

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null;
}
function isProductV4(p: StrapiProductAny): p is StrapiProductV4 {
  return (
    isRecord(p) &&
    "attributes" in p &&
    isRecord((p as Record<string, unknown>)["attributes"])
  );
}
function isImagesV4(x: unknown): x is StrapiImagesV4 {
  return isRecord(x) && Array.isArray((x as Record<string, unknown>)["data"]);
}
function isCategoryV4Data(x: unknown): x is StrapiCategoryV4Data {
  return (
    isRecord(x) &&
    typeof (x as Record<string, unknown>)["id"] === "number" &&
    isRecord((x as Record<string, unknown>)["attributes"]) &&
    typeof (
      (x as Record<string, unknown>)["attributes"] as Record<string, unknown>
    )["name"] === "string" &&
    typeof (
      (x as Record<string, unknown>)["attributes"] as Record<string, unknown>
    )["slug"] === "string"
  );
}
function isCategoryInline(x: unknown): x is StrapiCategoryInline {
  return (
    isRecord(x) &&
    typeof x["id"] === "number" &&
    typeof x["name"] === "string" &&
    typeof x["slug"] === "string"
  );
}

const PRODUCT_POPULATE = "populate=*";

function mapStrapiProduct(p: StrapiProductAny): Product | null {
  const attrs: ProductAttrsV4 | StrapiProductV5 = isProductV4(p)
    ? p.attributes
    : p;

  // imagem
  let imageUrl = "";
  const imgs = attrs.images;
  if (isImagesV4(imgs)) {
    const first = imgs.data?.[0];
    if (
      first &&
      isRecord(first.attributes) &&
      typeof first.attributes["url"] === "string"
    )
      imageUrl = first.attributes["url"] as string;
  } else if (
    Array.isArray(imgs) &&
    imgs[0] &&
    isRecord(imgs[0]) &&
    typeof imgs[0]["url"] === "string"
  ) {
    imageUrl = imgs[0]["url"] as string;
  }
  if (imageUrl && imageUrl.startsWith("/")) imageUrl = RAW_BASE + imageUrl;

  // categorias
  let cats: Array<StrapiCategoryV4Data | StrapiCategoryInline> = [];
  const rawCats = (attrs as ProductAttrsV4).categories;
  if (isRecord(rawCats) && Array.isArray(rawCats["data"]))
    cats = (rawCats["data"] as unknown[]).filter(isCategoryV4Data);
  else if (Array.isArray(rawCats)) cats = rawCats.filter(isCategoryInline);

  const categories: Category[] = cats.map((c) =>
    isCategoryInline(c)
      ? { id: c.id, name: c.name, slug: c.slug }
      : { id: c.id, name: c.attributes.name, slug: c.attributes.slug },
  );

  const name =
    (attrs as StrapiProductV5).name || (attrs as ProductAttrsV4).name;
  const slug =
    (attrs as StrapiProductV5).slug || (attrs as ProductAttrsV4).slug;
  if (!name || !slug) return null;

  const description =
    (attrs as StrapiProductV5).description ??
    (attrs as ProductAttrsV4).description ??
    (attrs as StrapiProductV5).shortDescription ??
    (attrs as ProductAttrsV4).shortDescription ??
    "";
  const price = Number(
    (attrs as StrapiProductV5).price ?? (attrs as ProductAttrsV4).price ?? 0,
  );
  const stock = Number(
    (attrs as StrapiProductV5).stock ?? (attrs as ProductAttrsV4).stock ?? 0,
  );
  const updatedAt =
    (attrs as StrapiProductV5).updatedAt ?? (attrs as ProductAttrsV4).updatedAt;

  return {
    id: p.id,
    title: name,
    description,
    price,
    slug,
    image: { url: imageUrl },
    stock,
    categories,
    updatedAt,
  };
}

export async function fetchCategories(): Promise<Category[]> {
  type Resp = { data: StrapiCategoryV4Data[] | null };
  const data = await safeFetch<Resp>(`${API_URL}/categories?populate=*`);
  if (!data || !Array.isArray(data.data)) return [];
  return data.data.filter(isCategoryV4Data).map((cat) => ({
    id: cat.id,
    name: cat.attributes.name,
    slug: cat.attributes.slug,
  }));
}

export async function getCollections(): Promise<
  { id: number; title: string; slug: string; updatedAt?: string }[]
> {
  type Resp = { data: StrapiCategoryV4Data[] | null };
  const data = await safeFetch<Resp>(`${API_URL}/categories?populate=*`);
  const list = Array.isArray(data?.data) ? data!.data : [];
  return list.filter(isCategoryV4Data).map((c) => ({
    id: c.id,
    title: c.attributes.name,
    slug: c.attributes.slug,
    updatedAt: undefined,
  }));
}

export async function fetchProducts(): Promise<Product[]> {
  type Resp = { data: StrapiProductAny[] };
  const query = `${PRODUCT_POPULATE}&pagination[limit]=100&sort=id:desc`;
  const data = await safeFetch<Resp>(`${API_URL}/products?${query}`);
  return (data?.data || [])
    .map(mapStrapiProduct)
    .filter((p): p is Product => !!p);
}

export async function fetchProductBySlug(
  slug: string,
): Promise<Product | null> {
  type Resp = { data: StrapiProductAny[] };
  const data = await safeFetch<Resp>(
    `${API_URL}/products?filters[slug][$eq]=${encodeURIComponent(slug)}&${PRODUCT_POPULATE}&pagination[limit]=1`,
  );
  return (data?.data || []).map(mapStrapiProduct).find(Boolean) || null;
}

export async function getCollectionProducts(slug: string): Promise<Product[]> {
  type CatResp = { data: StrapiCategoryV4Data[] };
  const categories = await safeFetch<CatResp>(
    `${API_URL}/categories?filters[slug][$eq]=${encodeURIComponent(slug)}&pagination[limit]=1`,
  );
  const categoryId = categories?.data?.[0]?.id;
  if (!categoryId) return [];
  type ProdResp = { data: StrapiProductAny[] };
  const products = await safeFetch<ProdResp>(
    `${API_URL}/products?filters[categories][id][$eq]=${categoryId}&${PRODUCT_POPULATE}&pagination[limit]=100&sort=id:desc`,
  );
  return (products?.data || [])
    .map(mapStrapiProduct)
    .filter((p): p is Product => !!p);
}

export async function getPage(slug: string) {
  type PageItem = { id: number; attributes: Record<string, unknown> };
  type Resp = { data: PageItem[] };
  const url = `${API_URL}/pages?filters[slug][$eq]=${encodeURIComponent(slug)}&populate=*&pagination[limit]=1`;
  const data = await safeFetch<Resp>(url);
  const item = data?.data?.[0];
  if (!item || typeof item !== "object") return null;
  const a = item.attributes as Record<string, unknown>;
  return {
    id: item.id,
    title: (a["title"] as string) || "",
    slug: (a["slug"] as string) || "",
    body: (a["body"] as string) || "",
    bodySummary: (a["bodySummary"] as string) || "",
    createdAt: (a["createdAt"] as string) || "",
    updatedAt: (a["updatedAt"] as string) || "",
    seo: (a["seo"] as Record<string, unknown>) || undefined,
  };
}

export async function getPages(): Promise<
  { slug: string; updatedAt: string }[]
> {
  type PageItem = { id: number; attributes: Record<string, unknown> };
  type Resp = { data: PageItem[] };
  const url = `${API_URL}/pages?pagination[limit]=100&sort=id:desc`;
  const data = await safeFetch<Resp>(url);
  return (
    data?.data?.map(({ attributes }) => {
      const a = attributes as Record<string, unknown>;
      return {
        slug: (a["slug"] as string) || "",
        updatedAt: (a["updatedAt"] as string) || "",
      };
    }) || []
  );
}

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
  type Resp = { data: StrapiProductAny[] };
  let data = await safeFetch<Resp>(`${API_URL}/products?${params.toString()}`);
  if (!data || !Array.isArray(data.data)) {
    const retry = new URLSearchParams(params);
    retry.delete("sort");
    data = await safeFetch<Resp>(`${API_URL}/products?${retry.toString()}`);
  }
  const raw = data?.data || [];
  console.warn(
    "[getProducts] raw length=",
    raw.length,
    "query=",
    query,
    "sample=",
    raw[0] ? Object.keys(raw[0] as Record<string, unknown>) : null,
  );
  const mapped = raw.map(mapStrapiProduct);
  const filtered = mapped.filter((p): p is Product => !!p);
  if (filtered.length !== raw.length)
    console.warn(
      `[getProducts] descartados ${raw.length - filtered.length} itens sem attributes/estruturas esperadas.`,
    );
  return filtered;
}

export async function fetchOrderByCode(code: string): Promise<{
  code: string;
  status: string;
  paymentUrl?: string | null;
} | null> {
  type Resp = { code?: string; status?: string; paymentUrl?: string | null };
  const url = `${API_URL}/orders/status/${encodeURIComponent(code)}`;
  const data = await safeFetch<Resp>(url);
  if (!data || (!data.code && !data.status)) return null;
  return {
    code: data.code || code,
    status: data.status || "pending",
    paymentUrl: data.paymentUrl ?? null,
  };
}
