"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useCart } from "../components/cart/cart-context";
import { ShippingForm } from "../components/checkout/ShippingForm";
import { PaymentForm } from "../components/checkout/PaymentForm";
import { toast } from "sonner";

interface ShippingAddress {
  fullName: string;
  phone: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { items, setItems } = useCart();
  const paymentStatus = searchParams.get("status");
  
  const [step, setStep] = useState<"shipping" | "payment">("shipping");
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (paymentStatus === "success") {
      localStorage.removeItem("cart");
      setItems([]);
      setMessage("Pagamento realizado com sucesso!");
      toast.success("Pedido confirmado! Você receberá um email com os detalhes.");
    } else if (paymentStatus === "failure") {
      setMessage("Falha no pagamento, tente novamente");
      toast.error("Falha no pagamento. Tente novamente ou escolha outro método.");
    }
  }, [paymentStatus, setItems]);

  useEffect(() => {
    if (items.length === 0) {
      router.push("/cart");
    }
  }, [items, router]);

  const handleShippingSubmit = (address: ShippingAddress) => {
    setShippingAddress(address);
    setStep("payment");
    toast.success("Endereço de envio confirmado!");
  };

  const handlePaymentSuccess = (paymentId: string) => {
    setLoading(true);
    // Aqui você salvaria o pedido no backend
    setTimeout(() => {
      router.push("/checkout?status=success");
    }, 1000);
  };

  const handlePaymentError = (error: string) => {
    toast.error(error);
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <h1 className="text-3xl font-bold mb-6">Carrinho Vazio</h1>
        <p className="text-xl text-gray-600">Adicione produtos ao carrinho para continuar.</p>
      </div>
    );
  }

  if (message) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <h1 className="text-3xl font-bold mb-6">Status do Pedido</h1>
        <div className="text-xl text-green-600 mb-6">{message}</div>
        <button
          onClick={() => router.push("/")}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Continuar Comprando
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Finalizar Compra</h1>
        
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step === "shipping" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
            }`}>
              1
            </div>
            <div className={`w-16 h-1 mx-2 ${
              step === "payment" ? "bg-blue-600" : "bg-gray-200"
            }`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step === "payment" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
            }`}>
              2
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {step === "shipping" ? (
              <div>
                <h2 className="text-2xl font-semibold mb-6">Endereço de Envio</h2>
                <ShippingForm onSubmit={handleShippingSubmit} loading={loading} />
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-semibold mb-6">Pagamento</h2>
                <PaymentForm
                  amount={calculateTotal()}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                  loading={loading}
                />
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 p-6 rounded-lg sticky top-4">
              <h3 className="text-lg font-semibold mb-4">Resumo do Pedido</h3>
              
              <div className="space-y-3 mb-4">
                {items.map((item) => (
                  <div key={item.product.id} className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                        {item.product.image.url ? (
                          <img
                            src={item.product.image.url}
                            alt={item.product.title}
                            className="w-full h-full object-cover rounded"
                          />
                        ) : (
                          <span className="text-gray-500 text-xs">IMG</span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{item.product.title}</p>
                        <p className="text-gray-500 text-xs">Qtd: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="font-medium">R$ {(item.product.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>R$ {calculateTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Frete:</span>
                  <span className="text-green-600">Grátis</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>R$ {calculateTotal().toFixed(2)}</span>
                </div>
              </div>

              {step === "shipping" && (
                <button
                  onClick={() => setStep("payment")}
                  disabled={!shippingAddress}
                  className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
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
    <Suspense fallback={<div className="text-center py-12">Carregando...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
