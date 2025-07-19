"use client";

import { useRouter, useSearchParams } from "next/navigation";
import React, { createContext, useContext, useMemo, useState } from "react";

type ProductState = {
  [key: string]: string | undefined;
};

type ProductContextType = {
  state: ProductState;
  updateOption: (name: string, value: string) => ProductState;
  updateImage: (index: string) => ProductState;
};

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();

  const getInitialState = (): ProductState => {
    const params: ProductState = {};
    for (const [key, value] of searchParams.entries()) {
      params[key] = value;
    }
    return params;
  };

  const [state, setState] = useState<ProductState>(getInitialState());

  const updateOption = (name: string, value: string): ProductState => {
    const newState = { ...state, [name]: value };
    setState(newState);
    return newState;
  };

  const updateImage = (index: string): ProductState => {
    const newState = { ...state, image: index };
    setState(newState);
    return newState;
  };

  const value = useMemo(
    () => ({
      state,
      updateOption,
      updateImage,
    }),
    [state],
  );

  return (
    <ProductContext.Provider value={value}>{children}</ProductContext.Provider>
  );
}

export function useProduct() {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error("useProduct must be used within a ProductProvider");
  }
  return context;
}

export function useUpdateURL() {
  const router = useRouter();

  return (state: ProductState) => {
    const newParams = new URLSearchParams(window.location.search);
    Object.entries(state).forEach(([key, value]) => {
      if (value !== undefined) {
        newParams.set(key, value);
      }
    });
    router.push(`?${newParams.toString()}`, { scroll: false });
  };
}
