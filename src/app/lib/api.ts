import { Product, Category } from "../types";

const API_URL =
  process.env.NEXT_PUBLIC_STRAPI_URL || "https://strapi.lacrosstech.com.br";

async function handle404(response: Response) {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API request failed: ${response.status} - ${errorText}`);
  }
  return response.json();
}

interface StrapiCategory {
  id: number;
  name: string;
  slug: string;
}

interface StrapiProduct {
  id: number;
  title: string;
  description: string;
  price: number;
  slug: string;
  image: { url: string } | null;
  stock: number;
  categories: StrapiCategory[];
}

export async function fetchCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${API_URL}/categories`);
    const json: StrapiCategory[] = await handle404(res);
    return json.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
    }));
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

export async function fetchProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${API_URL}/products`);
    const json: StrapiProduct[] = await handle404(res);
    return json.map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      price: p.price,
      slug: p.slug,
      image: {
        url: p.image?.url || "",
      },
      stock: p.stock,
      categories:
        p.categories?.map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
        })) || [],
    }));
  } catch (error) {
    console.error("Error fetching products:", error);
    throw new Error("Failed to load products: " + (error as Error).message);
  }
}

export async function fetchProductBySlug(slug: string): Promise<Product> {
  try {
    const res = await fetch(`${API_URL}/products?slug=${slug}`);
    const json: StrapiProduct[] = await handle404(res);
    if (!json || json.length === 0) {
      throw new Error(`Product not found for slug: ${slug}`);
    }
    const p = json[0];
    return {
      id: p.id,
      title: p.title,
      description: p.description,
      price: p.price,
      slug: p.slug,
      image: {
        url: p.image?.url || "",
      },
      stock: p.stock,
      categories:
        p.categories?.map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
        })) || [],
    };
  } catch (error) {
    console.error(`Error fetching product by slug (${slug}):`, error);
    throw new Error(
      "Failed to load product details: " + (error as Error).message,
    );
  }
}
