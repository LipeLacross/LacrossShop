import { ProductGrid } from './components/product/ProductGrid';
import { fetchProducts } from './lib/api';

export default async function Home() {
  const products = await fetchProducts();

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Produtos em Destaque</h1>
      <ProductGrid products={products} />
    </div>
  );
}
