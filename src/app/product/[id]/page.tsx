'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { fetchProductBySlug } from '../../lib/api';
import { Product } from '../../types';
import Image from 'next/image';
import { Button } from '../../components/ui/button';

export default function ProductPage() {
  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;

  const [product, setProduct] = useState<Product | null>(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProduct() {
      try {
        const productData = await fetchProductBySlug(slug);
        setProduct(productData);
      } catch (error) {
        console.error('Failed to load product:', error);
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [slug]);

  const handleAdd = () => {
    if (!product) return;

    const cartItems = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cartItems.find((item: any) => item.product.id === product.id);

    if (existingItem) {
      existingItem.quantity += qty;
    } else {
      cartItems.push({
        product: {
          id: product.id,
          title: product.title,
          price: product.price,
          image: product.image,
          slug: product.slug
        },
        quantity: qty
      });
    }

    localStorage.setItem('cart', JSON.stringify(cartItems));
    alert(`${qty} × ${product.title} adicionado ao carrinho`);
  };

  if (loading) return <div>Carregando...</div>;
  if (!product) return <div>Produto não encontrado</div>;

  return (
    <div className="p-8 flex flex-col md:flex-row gap-8">
      <div className="flex-shrink-0">
        <Image
          src={product.image.url}
          alt={product.title}
          width={400}
          height={400}
          className="rounded-lg"
        />
      </div>
      <div className="flex-grow">
        <h1 className="text-3xl font-bold">{product.title}</h1>
        <p className="mt-4 text-gray-700">{product.description}</p>
        <p className="mt-4 text-2xl font-semibold text-primary">
          R$ {product.price.toFixed(2)}
        </p>
        <div className="mt-6 flex items-center gap-4">
          <input
            type="number"
            min={1}
            value={qty}
            onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
            className="w-20 px-3 py-2 border rounded"
          />
          <Button onClick={handleAdd} className="px-6 py-3">
            Adicionar ao Carrinho
          </Button>
        </div>
      </div>
    </div>
  );
}
