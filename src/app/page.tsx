import { ProductGrid } from "./components/product/ProductGrid";
import { fetchProducts } from "./lib/api";

export default async function Home() {
  try {
    const products = await fetchProducts();

    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">Produtos em Destaque</h1>
        <ProductGrid products={products} />
      </div>
    );
  } catch (error) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Erro ao carregar produtos</h1>
        <p className="text-red-500">
          {error instanceof Error ? error.message : "Erro desconhecido"}
        </p>
      </div>
    );
  }
}
