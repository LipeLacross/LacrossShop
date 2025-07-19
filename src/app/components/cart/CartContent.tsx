// Exemplo mínimo para `/components/cart/CartContent.tsx`
"use client";

import { useCart } from "./cart-context";

export default function CartContent() {
  const { items } = useCart();

  if (!items.length) return <div>Seu carrinho está vazio.</div>;

  return (
    <ul>
      {items.map(({ product, quantity }) => (
        <li key={product.id}>
          {quantity} × {product.title} - R$ {product.price}
        </li>
      ))}
    </ul>
  );
}
