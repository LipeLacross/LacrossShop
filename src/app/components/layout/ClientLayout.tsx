"use client";

import { ReactNode, Suspense } from "react";
import { CartProvider } from "@/app/components/cart/cart-context";
import { Navbar } from "@/app/components/layout/navbar";
import { WelcomeToast } from "@/app/components/welcome-toast";
import { Toaster } from "sonner";
import type { Category } from "@/app/types";
import CookieConsent from "../cookie-consent";

interface ClientLayoutProps {
  children: ReactNode;
  categories: Category[];
  siteName?: string;
}

export default function ClientLayout({
  children,
  categories,
  siteName,
}: ClientLayoutProps) {
  return (
    <CartProvider>
      <Navbar categories={categories || []} siteName={siteName} />
      <Suspense fallback={null}>
        {children}
        <Toaster closeButton />
        <WelcomeToast />
        <CookieConsent />
      </Suspense>
    </CartProvider>
  );
}
