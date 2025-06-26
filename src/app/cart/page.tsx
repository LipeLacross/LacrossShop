'use client';
import { useState, useEffect } from 'react';
import { CartItemType } from '../types';
import { CartItem } from '../components/cart/CartItem';
import { CartSummary } from '../components/cart/CartSummary';
import { createStripeSession } from '../lib/stripe';
import { createMercadoPagoLink } from '../lib/mercadopago';
import { createAsaasPayment } from '../lib/asaas';
import { createPagSeguroTransaction } from '../lib/pagseguro';

export default function CartPage() {
  const [items, setItems] = useState<CartItemType[]>([]);

  // Carregar itens do carrinho do localStorage
  useEffect(() => {
    const savedItems = localStorage.getItem('cart');
    if (savedItems) {
      setItems(JSON.parse(savedItems));
    }
  }, []);

  // Salvar itens no localStorage sempre que mudarem
  useEffect(() => {
    if (items.length > 0) {
      localStorage.setItem('cart', JSON.stringify(items));
    } else {
      localStorage.removeItem('cart');
    }
  }, [items]);

  const handleRemove = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };


const handleCheckout = async (gateway: 'stripe' | 'mercadopago' | 'pagseguro' | 'asaas') => {
  try {
    let url: string | null = null;

    if (gateway === 'asaas') {
      const total = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 3);

      // Chama diretamente a função que retorna a URL
      url = await createAsaasPayment(
        'cus_000000000001',
        total,
        dueDate.toISOString().split('T')[0],
        'BOLETO'
      );
    }
    // ...outros gateways...
  } catch (error) {
    console.error('Checkout error:', error);
    alert('Erro ao processar pagamento');
  }
};

  return (
    <div className="p-8">
      <h1 className="text-2xl mb-4">Carrinho</h1>
      {items.length === 0 ? (
        <p>Seu carrinho está vazio</p>
      ) : (
        <>
          {items.map((item, idx) => (
            <CartItem key={idx} item={item} onRemove={() => handleRemove(idx)} />
          ))}
          <CartSummary
            items={items}
            onStripeCheckout={() => handleCheckout('stripe')}
            onMercadoPagoCheckout={() => handleCheckout('mercadopago')}
            onPagSeguroCheckout={() => handleCheckout('pagseguro')}
            onAsaasCheckout={() => handleCheckout('asaas')}
          />
        </>
      )}
    </div>
  );
}
