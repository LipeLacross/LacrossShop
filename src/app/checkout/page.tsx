"use client";
import { useEffect, useState } from "react";
import { CartItemType } from "../types";
import { Button } from "../components/ui/button";
import { createAsaasPayment } from "../lib/asaas";

export default function CheckoutPage() {
  const [items] = useState<CartItemType[]>([]);

  useEffect(() => {
    // Recuperar itens do carrinho (localStorage/context)
  }, []);

  const handleAsaasCheckout = async () => {
    const url = await createAsaasPayment("cus_123", 150.0, new Date());
    window.location.href = url;
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl mb-6">Finalizar Compra</h1>
      <div className="space-y-4">
        <Button onClick={handleAsaasCheckout} className="w-full">
          Pagar com Asaas
        </Button>
      </div>
    </div>
  );
}
