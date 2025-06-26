export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  slug: string;
  image: { url: string };
  stock: number;
  categories: Category[];
}

export interface CartItemType {
  product: Product;
  quantity: number;
}
