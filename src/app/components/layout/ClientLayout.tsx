"use client";

import { ReactNode, Suspense } from "react";
import { CartProvider } from "@/app/components/cart/cart-context";
import { Navbar } from "@/app/components/layout/navbar";
import { WelcomeToast } from "@/app/components/welcome-toast";
import { Toaster } from "sonner";

export default function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      <Navbar />
      <Suspense fallback={null}>
        {children}
        <Toaster closeButton />
        <WelcomeToast />
      </Suspense>
    </CartProvider>
  );
}
