"use client";
import { Suspense } from "react";
import dynamic from "next/dynamic";

const CartContent = dynamic(() => import("../components/cart/CartContent"), {
  ssr: false,
  loading: () => (
    <div className="text-center py-12">Carregando carrinho...</div>
  ),
});

export default function CartPage() {
  return (
    <Suspense fallback={<div className="text-center py-12">Carregando...</div>}>
      <CartContent />
    </Suspense>
  );
}
