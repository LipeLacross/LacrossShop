'use client';
import { useEffect, useState } from 'react';
import { CartItemType } from '../types';
import { Button } from '../components/ui/button';
import { createPagSeguroTransaction } from '../lib/pagseguro';
import { createAsaasPayment } from '../lib/asaas';

export default function CheckoutPage() {
  const [items, setItems] = useState<CartItemType[]>([]);

  useEffect(() => {
    // Recuperar itens do carrinho (localStorage/context)
  }, []);

  const handleAsaasCheckout = async () => {
    const payment = await createAsaasPayment('cus_123', 150.00, '2025-07-10');
    window.location.href = payment.paymentLink;
  };

  const handlePagSeguroCheckout = async () => {
    const itemsFormatted = items.map(item => ({
      id: item.product.id.toString(),
      description: item.product.title,
      amount: item.product.price,
      quantity: item.quantity
    }));
    const url = await createPagSeguroTransaction(itemsFormatted, `PEDIDO_${Date.now()}`);
    window.location.href = url;
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl mb-6">Finalizar Compra</h1>
      <div className="space-y-4">
        <Button onClick={handleAsaasCheckout} className="w-full">
          Pagar com Asaas
        </Button>
        <Button onClick={handlePagSeguroCheckout} className="w-full">
          Pagar com PagSeguro
        </Button>
      </div>
    </div>
  );
}
