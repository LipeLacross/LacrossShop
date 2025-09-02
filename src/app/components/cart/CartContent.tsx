"use client";

import { useState } from "react";
import { useCart } from "./cart-context";
import { Button } from "../ui/button";
import Image from "next/image";
import Link from "next/link";
import { TrashIcon, PlusIcon, MinusIcon } from "@heroicons/react/24/outline";

export default function CartContent() {
  const { items, setItems } = useCart();
  const [updating, setUpdating] = useState<number | null>(null);

  if (!items.length) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="text-2xl font-bold mb-4">Seu carrinho está vazio</h2>
        <p className="text-gray-600 mb-8">Adicione produtos para começar suas compras!</p>
        <Link href="/">
          <Button className="px-8 py-3 text-lg">
            Continuar Comprando
          </Button>
        </Link>
      </div>
    );
  }

  const updateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(productId);
      return;
    }

    setUpdating(productId);
    setTimeout(() => {
      setItems(prev => 
        prev.map(item => 
          item.product.id === productId 
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
      setUpdating(null);
    }, 300);
  };

  const removeItem = (productId: number) => {
    setItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const calculateSubtotal = () => {
    return items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal(); // Frete grátis por enquanto
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Carrinho de Compras</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border">
            {items.map(({ product, quantity }) => (
              <div key={product.id} className="flex items-center p-4 border-b last:border-b-0">
                <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  {product.image.url ? (
                    <Image
                      src={product.image.url}
                      alt={product.title}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <span className="text-xs">IMG</span>
                    </div>
                  )}
                </div>

                <div className="ml-4 flex-grow">
                  <h3 className="font-semibold text-lg">{product.title}</h3>
                  <p className="text-gray-600 text-sm mb-2">
                    {product.categories.map(cat => cat.name).join(", ")}
                  </p>
                  <p className="text-green-600 font-bold">
                    R$ {product.price.toFixed(2)}
                  </p>
                </div>

                <div className="flex items-center space-x-2 mx-4">
                  <button
                    onClick={() => updateQuantity(product.id, quantity - 1)}
                    disabled={updating === product.id}
                    className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-50"
                  >
                    <MinusIcon className="w-4 h-4" />
                  </button>
                  
                  <span className="w-12 text-center font-medium">
                    {updating === product.id ? "..." : quantity}
                  </span>
                  
                  <button
                    onClick={() => updateQuantity(product.id, quantity + 1)}
                    disabled={updating === product.id || quantity >= product.stock}
                    className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-50"
                  >
                    <PlusIcon className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-right ml-4">
                  <p className="font-bold text-lg">
                    R$ {(product.price * quantity).toFixed(2)}
                  </p>
                  <button
                    onClick={() => removeItem(product.id)}
                    className="text-red-500 hover:text-red-700 text-sm flex items-center mt-1"
                  >
                    <TrashIcon className="w-4 h-4 mr-1" />
                    Remover
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-4">
            <h3 className="text-lg font-semibold mb-4">Resumo do Pedido</h3>
            
            <div className="space-y-3 mb-4">
              <div className="flex justify-between">
                <span>Subtotal ({items.reduce((total, item) => total + item.quantity, 0)} itens):</span>
                <span>R$ {calculateSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Frete:</span>
                <span className="text-green-600">Grátis</span>
              </div>
            </div>

            <div className="border-t pt-4 mb-6">
              <div className="flex justify-between text-xl font-bold">
                <span>Total:</span>
                <span>R$ {calculateTotal().toFixed(2)}</span>
              </div>
            </div>

            <Link href="/checkout" className="block">
              <Button className="w-full py-3 text-lg bg-green-600 hover:bg-green-700">
                Finalizar Compra
              </Button>
            </Link>

            <Link href="/" className="block mt-3">
              <Button variant="outline" className="w-full">
                Continuar Comprando
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
