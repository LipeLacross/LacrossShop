"use client";

import { ReactNode, Suspense } from "react";
import { CartProvider } from "@/app/components/cart/cart-context";
import { Navbar } from "@/app/components/layout/navbar";
import { WelcomeToast } from "@/app/components/welcome-toast";
import { Toaster } from "sonner";
import type { Category } from "@/app/types";

interface ClientLayoutProps {
  children: ReactNode;
  categories: Category[];
}

export default function ClientLayout({
  children,
  categories,
}: ClientLayoutProps) {
  return (
    <CartProvider>
      <Navbar categories={categories || []} />
      <Suspense fallback={null}>
        {children}
        <Toaster closeButton />
        <WelcomeToast />
      </Suspense>
    </CartProvider>
  );
}
