export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface ProductImage {
  url: string;
}

export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  slug: string;
  image: ProductImage;
  stock: number;
  categories: Category[];
  updatedAt?: string; // ✅ adicionado para uso no sitemap
}
