"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "../components/cart/cart-context";
import { ShippingForm } from "../components/checkout/ShippingForm";
import { PaymentForm } from "../components/checkout/PaymentForm";
import { toast } from "sonner";

type ShippingAddress = {
  fullName: string;
  email: string;
  phone: string;
  cpfCnpj?: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
};

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentStatus = searchParams.get("status");

  const { items, setItems } = useCart();

  const [step, setStep] = useState<"shipping" | "payment">("shipping");
  const [shippingAddress, setShippingAddress] =
    useState<ShippingAddress | null>(null);
  const [shippingCost, setShippingCost] = useState<number>(0);
  const [shippingLabel, setShippingLabel] = useState<string>("Frete");
  const [loading, setLoading] = useState<boolean>(false);

  const subtotal = useMemo(
    () => items.reduce((acc, i) => acc + i.product.price * i.quantity, 0),
    [items],
  );
  const total = useMemo(
    () => Number((subtotal + (shippingCost || 0)).toFixed(2)),
    [subtotal, shippingCost],
  );

  // Feedback pós-redirect (?status=success|failure)
  if (paymentStatus === "success") {
    try {
      localStorage.removeItem("cart");
      setItems([]);
    } catch {}
  }

  const handleShippingSubmit = async (address: ShippingAddress) => {
    setLoading(true);
    try {
      const payload = {
        to: { zip: address.zipCode },
        items: items.map((i) => ({ id: i.product.id, qty: i.quantity })),
        service: "Frete",
      };
      const res = await fetch("/api/shipping/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Falha no cálculo de frete");
      const q = (await res.json()) as {
        price: number;
        label: string;
        days?: number;
      };
      setShippingLabel(q.label || "Frete");
      setShippingCost(Number((q.price || 0).toFixed(2)));
      setShippingAddress(address);
      setStep("payment");
      toast.success("Endereço confirmado!");
    } catch {
      // Fallback simples
      const cep = (address.zipCode || "").replace(/\D/g, "");
      let base = 24.9;
      if (/^[0-3]/.test(cep)) base = 19.9;
      else if (/^[7-9]/.test(cep)) base = 29.9;
      setShippingLabel("Frete");
      setShippingCost(Number(base.toFixed(2)));
      setShippingAddress(address);
      setStep("payment");
      toast.success("Endereço confirmado!");
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    try {
      const code = sessionStorage.getItem("lastOrderCode");
      if (code) {
        router.push(`/pedido/${code}`);
        return;
      }
    } catch {}
    router.push("/checkout?status=success");
  };

  const handlePaymentError = (error: string) => {
    console.error("Pagamento falhou:", error);
    toast.error("Falha no pagamento. Tente novamente.");
  };

  if (!items.length) {
    return (
      <div className="mx-auto max-w-3xl py-16 px-4 text-center">
        <h1 className="mb-4 text-3xl font-bold">Carrinho vazio</h1>
        <p className="mb-6 text-neutral-600 dark:text-neutral-300">
          Adicione produtos ao carrinho para continuar.
        </p>
        <Link
          href="/search"
          className="rounded-md bg-black px-5 py-3 text-sm font-semibold text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
        >
          Explorar produtos
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-8 text-center text-3xl font-bold">
          Finalizar Compra
        </h1>

        {/* Steps */}
        <div className="mb-8 flex items-center justify-center">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
              step === "shipping"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            1
          </div>
          <div
            className={`mx-2 h-1 w-16 ${
              step === "payment" ? "bg-blue-600" : "bg-gray-200"
            }`}
          />
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
              step === "payment"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            2
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {step === "shipping" ? (
              <div>
                <h2 className="mb-6 text-2xl font-semibold">
                  Endereço de Envio
                </h2>
                <ShippingForm
                  onSubmit={handleShippingSubmit}
                  loading={loading}
                />
              </div>
            ) : (
              <div>
                <h2 className="mb-6 text-2xl font-semibold">Pagamento</h2>
                <PaymentForm
                  amount={total}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                  loading={loading}
                  customer={
                    shippingAddress
                      ? {
                          name: shippingAddress.fullName,
                          email: shippingAddress.email,
                          phone: shippingAddress.phone,
                          cpfCnpj: shippingAddress.cpfCnpj,
                        }
                      : undefined
                  }
                  items={items.map((i) => ({
                    id: i.product.id,
                    title: i.product.title,
                    price: i.product.price,
                    qty: i.quantity,
                  }))}
                  shipping={
                    shippingAddress
                      ? {
                          address: shippingAddress as unknown as Record<
                            string,
                            unknown
                          >,
                          price: shippingCost,
                          label: shippingLabel,
                        }
                      : undefined
                  }
                />
              </div>
            )}
          </div>

          {/* Resumo do pedido */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 rounded-lg bg-gray-50 p-6 dark:bg-neutral-800/40">
              <h3 className="mb-4 text-lg font-semibold">Resumo do Pedido</h3>

              <div className="mb-4 space-y-3">
                {items.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded bg-gray-200">
                        {item.product.image.url ? (
                          <Image
                            src={item.product.image.url}
                            alt={item.product.title}
                            width={48}
                            height={48}
                            className="h-full w-full rounded object-cover"
                          />
                        ) : (
                          <span className="text-xs text-gray-500">IMG</span>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {item.product.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          Qtd: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <p className="font-medium">
                      R$ {(item.product.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>R$ {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{shippingLabel}:</span>
                  <span className={shippingCost === 0 ? "text-green-600" : ""}>
                    {shippingCost === 0
                      ? "Grátis"
                      : `R$ ${shippingCost.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>R$ {total.toFixed(2)}</span>
                </div>
              </div>

              {step === "shipping" && (
                <button
                  onClick={() => shippingAddress && setStep("payment")}
                  disabled={!shippingAddress}
                  className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  Continuar para Pagamento
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="py-12 text-center">Carregando...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
