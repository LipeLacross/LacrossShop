// src/app/cart/CartContent.tsx
"use client";
import { useState, useEffect } from "react";
import { CartItemType } from "../../types";
import { CartItem } from "../../components/cart/CartItem";
import { CartSummary } from "../../components/cart/CartSummary";
import Link from "next/link";

export default function CartContent() {
  const [items, setItems] = useState<CartItemType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedItems = localStorage.getItem("cart");
    if (savedItems) {
      try {
        setItems(JSON.parse(savedItems));
      } catch (error) {
        console.error("Error parsing cart items:", error);
        localStorage.removeItem("cart");
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (items.length > 0) {
      localStorage.setItem("cart", JSON.stringify(items));
    } else {
      localStorage.removeItem("cart");
    }
  }, [items]);

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleUpdateQuantity = (index: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    setItems(
      items.map((item, i) =>
        i === index ? { ...item, quantity: newQuantity } : item,
      ),
    );
  };

  const handleCheckout = async (
    gateway: "stripe" | "mercadopago" | "asaas",
  ) => {
    try {
      let url: string | null = null;

      if (gateway === "stripe") {
        const { createStripeSession } = await import("../../lib/stripe");
        url = await createStripeSession(
          items.map((item) => ({
            product: {
              title: item.product.title,
              price: item.product.price,
            },
            quantity: item.quantity,
          })),
        );
      } else if (gateway === "mercadopago") {
        const { createMercadoPagoLink } = await import("../../lib/mercadopago");
        const formattedItems = items.map((item) => ({
          title: item.product.title,
          unit_price: item.product.price,
          quantity: item.quantity,
        }));
        url = await createMercadoPagoLink(formattedItems);
      } else if (gateway === "asaas") {
        const { createAsaasPayment } = await import("../../lib/asaas");
        const total = items.reduce(
          (sum, item) => sum + item.product.price * item.quantity,
          0,
        );
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 3);
        url = await createAsaasPayment(
          "cus_000000000001",
          total,
          dueDate,
          "BOLETO",
        );
      }

      if (url) {
        localStorage.removeItem("cart");
        window.location.href = url;
      } else {
        throw new Error("URL de pagamento não gerada");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Erro ao processar pagamento: " + (error as Error).message);
    }
  };

  if (loading)
    return <div className="text-center py-8">Carregando carrinho...</div>;

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Seu Carrinho</h1>

      {items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl mb-4">Seu carrinho está vazio</p>
          <Link
            href="/"
            className="px-6 py-3 bg-primary text-white rounded hover:bg-primary/90"
          >
            Continuar Comprando
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow divide-y">
              {items.map((item, index) => (
                <CartItem
                  key={item.product.id || index}
                  item={item}
                  onRemove={() => handleRemoveItem(index)}
                  onUpdateQuantity={(newQty) =>
                    handleUpdateQuantity(index, newQty)
                  }
                />
              ))}
            </div>
          </div>

          <div className="lg:col-span-1">
            <CartSummary
              items={items}
              onStripeCheckout={() => handleCheckout("stripe")}
              onMercadoPagoCheckout={() => handleCheckout("mercadopago")}
              onAsaasCheckout={() => handleCheckout("asaas")}
            />
          </div>
        </div>
      )}
    </div>
  );
}
