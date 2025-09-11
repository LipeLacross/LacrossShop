"use client";

import { useState } from "react";
import { Product } from "@/app/types";
import { useCart } from "@/app/components/cart/cart-context";
import { Button } from "../ui/button";
import { toast } from "sonner";

interface AddToCartProps {
  product: Product;
}

export function AddToCart({ product }: AddToCartProps) {
  const { items, setItems } = useCart();
  const [quantity, setQuantity] = useState(1);

  function handleAddToCart() {
    const existingIndex = items.findIndex(
      (item) => item.product.id === product.id,
    );
    let newItems;

    if (existingIndex >= 0) {
      newItems = [...items];
      newItems[existingIndex].quantity += quantity;
    } else {
      newItems = [...items, { product, quantity }];
    }

    setItems(newItems);
    setQuantity(1);
    // Feedback discreto e abrir carrinho automaticamente
    try {
      toast.success(`${quantity}× ${product.title} adicionado ao carrinho`);
    } catch {}
    try {
      window.dispatchEvent(new CustomEvent("cart:open", { detail: { id: product.id } }));
    } catch {}
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleAddToCart();
      }}
      className="flex items-center gap-4"
    >
      <input
        type="number"
        min={1}
        max={product.stock}
        value={quantity}
        onChange={(e) =>
          setQuantity(
            Math.min(Math.max(1, Number(e.target.value)), product.stock),
          )
        }
        className="w-20 rounded border px-3 py-1 text-center"
        aria-label="Quantidade"
      />
      <Button type="submit" disabled={product.stock === 0}>
        Adicionar ao carrinho
      </Button>
    </form>
  );
}
