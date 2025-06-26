import { Product, Category } from '../types';

const API_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'https://strapi.lacrosstech.com.br';

export async function fetchCategories(): Promise<Category[]> {
  const res = await fetch(`${API_URL}/api/categories`);
  const json = await res.json();
  return json.data.map((c: any) => ({ id: c.id, ...c.attributes }));
}

export async function fetchProducts(): Promise<Product[]> {
  const res = await fetch(`${API_URL}/api/products?populate=*&sort=createdAt:desc`);
  const json = await res.json();
  return json.data.map((p: any) => ({ id: p.id, ...p.attributes }));
}

export async function fetchProductBySlug(slug: string | undefined): Promise<Product> {
  const res = await fetch(`${API_URL}/api/products?filters[slug][$eq]=${slug}&populate=*`);
  const json = await res.json();
  const p = json.data[0];
  return { id: p.id, ...p.attributes };
}
