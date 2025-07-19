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
  title: string; // mapeado de Strapi.name
  description: string;
  price: number; // agora number
  slug: string;
  image: ProductImage; // primeira imagem
  stock: number;
  categories: Category[];
}
