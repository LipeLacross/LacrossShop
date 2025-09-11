"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { Category } from "@/app/types";

interface CartItem {
  product: {
    id: number;
    title: string;
    price: number;
    image: { url: string };
    slug: string;
    description: string;
    stock: number;
    categories: Category[];
  };
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  setItems: (items: CartItem[]) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = window.localStorage.getItem("cart");
      return stored ? (JSON.parse(stored) as CartItem[]) : [];
    } catch (err) {
      console.warn("Falha ao carregar carrinho do localStorage", err);
      return [];
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem("cart", JSON.stringify(items));
      // Opcional: sincronização básica entre abas
      window.dispatchEvent(new Event("cart:updated"));
    } catch (err) {
      console.warn("Falha ao salvar carrinho no localStorage", err);
    }
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
