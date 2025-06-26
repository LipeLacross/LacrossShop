"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

// Componente interno que usa useSearchParams
function CheckoutContent() {
  const searchParams = useSearchParams();
  const paymentStatus = searchParams.get("status");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (paymentStatus === "success") {
      localStorage.removeItem("cart");
      setMessage("Pagamento realizado com sucesso!");
    } else if (paymentStatus === "failure") {
      setMessage("Falha no pagamento, tente novamente");
    }
  }, [paymentStatus]);

  return (
    <div className="container mx-auto py-12 px-4 text-center">
      <h1 className="text-3xl font-bold mb-6">Status do Pagamento</h1>
      <div className="text-xl">{message || "Processando..."}</div>
    </div>
  );
}

// Componente principal com Suspense Boundary
export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="text-center py-12">Carregando...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
