"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

interface CartItem {
  product: {
    id: number;
    title: string;
    price: number;
    image: { url: string };
    slug: string;
    description: string;
    stock: number;
    categories: any[]; // Pode ser mais restrito se quiser
  };
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  setItems: (items: CartItem[]) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({
  children,
  cartPromise,
}: {
  children: ReactNode;
  cartPromise?: Promise<any>; // Agora é opcional e ignorado
}) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("cart");
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch (err) {
      console.warn("Falha ao carregar carrinho do localStorage", err);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items));
  }, [items]);

  return (
    <CartContext.Provider value={{ items, setItems }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
