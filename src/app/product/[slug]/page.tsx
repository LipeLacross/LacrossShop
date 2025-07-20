"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { fetchProductBySlug } from "../../lib/api";
import { Product } from "../../types";
import Image from "next/image";
import { Button } from "../../components/ui/button";

// ✅ Tipo CartItemType definido localmente
type CartItemType = {
  product: {
    id: number;
    title: string;
    price: number;
    image: { url: string };
    slug: string;
    description: string;
    stock: number;
    categories: { id: number; name: string; slug: string }[];
  };
  quantity: number;
};

export default function ProductPage() {
  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;

  const [product, setProduct] = useState<Product | null>(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProduct() {
      try {
        if (typeof slug !== "string") {
          throw new Error("Slug inválido");
        }
        const productData = await fetchProductBySlug(slug);
        setProduct(productData);
      } catch (err) {
        console.error("Failed to load product:", err);
        setError(err instanceof Error ? err.message : "Erro desconhecido");
      } finally {
        setLoading(false);
      }
    }

    if (slug) loadProduct();
  }, [slug]);

  const handleAddToCart = () => {
    if (!product) return;

    const cartItems: CartItemType[] = JSON.parse(
      localStorage.getItem("cart") || "[]",
    );
    const existingItemIndex = cartItems.findIndex(
      (item) => item.product.id === product.id,
    );

    if (existingItemIndex >= 0) {
      cartItems[existingItemIndex].quantity += qty;
    } else {
      cartItems.push({
        product: {
          id: product.id,
          title: product.title,
          price: product.price,
          image: product.image,
          slug: product.slug,
          description: product.description,
          stock: product.stock,
          categories: product.categories,
        },
        quantity: qty,
      });
    }

    localStorage.setItem("cart", JSON.stringify(cartItems));
    alert(`${qty} × ${product.title} adicionado ao carrinho`);
    setQty(1);
  };

  if (loading) return <div className="text-center py-8">Carregando...</div>;
  if (error)
    return <div className="text-center py-8 text-red-500">{error}</div>;
  if (!product)
    return <div className="text-center py-8">Produto não encontrado</div>;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/2 flex justify-center">
          {product.image?.url ? (
            <Image
              src={product.image.url}
              alt={product.title}
              width={500}
              height={500}
              className="rounded-lg object-cover"
            />
          ) : (
            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-96 flex items-center justify-center">
              <span className="text-gray-500">Imagem não disponível</span>
            </div>
          )}
        </div>

        <div className="md:w-1/2">
          <h1 className="text-3xl font-bold mb-4">{product.title}</h1>
          <p className="text-gray-700 mb-6">{product.description}</p>

          <div className="mb-6">
            <span className="text-2xl font-bold text-primary">
              R$ {product.price.toFixed(2)}
            </span>
            {product.stock > 0 ? (
              <span className="ml-4 text-green-600">Em estoque</span>
            ) : (
              <span className="ml-4 text-red-600">Esgotado</span>
            )}
          </div>

          <div className="flex items-center gap-4 mb-8">
            <input
              type="number"
              min={1}
              max={product.stock}
              value={qty}
              onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
              className="w-20 px-3 py-2 border rounded text-center"
            />
            <Button
              onClick={handleAddToCart}
              className="px-6 py-3"
              disabled={product.stock <= 0}
            >
              Adicionar ao Carrinho
            </Button>
          </div>

          {product.categories && product.categories.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Categorias</h2>
              <div className="flex flex-wrap gap-2">
                {product.categories.map((category) => (
                  <span
                    key={category.id}
                    className="bg-gray-100 px-3 py-1 rounded-full text-sm"
                  >
                    {category.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
