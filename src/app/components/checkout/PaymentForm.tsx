"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { toast } from "sonner";

interface PaymentData {
  method: "credit_card" | "debit_card" | "boleto" | "pix";
  gateway: "asaas" | "mercadopago" | "stripe";
  installments?: number;
  cardData?: {
    number: string;
    holderName: string;
    expiryMonth: string;
    expiryYear: string;
    cvv: string;
  };
}

interface PaymentFormProps {
  amount: number;
  onSuccess: (paymentId: string) => void;
  onError: (error: string) => void;
  loading?: boolean;
}

export function PaymentForm({ amount, onSuccess, onError, loading = false }: PaymentFormProps) {
  const [paymentData, setPaymentData] = useState<PaymentData>({
    method: "credit_card",
    gateway: "asaas",
    installments: 1,
  });

  const [cardData, setCardData] = useState({
    number: "",
    holderName: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
  });

  const [errors, setErrors] = useState<Partial<PaymentData & typeof cardData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<PaymentData & typeof cardData> = {};

    if (paymentData.method === "credit_card" || paymentData.method === "debit_card") {
      if (!cardData.number.trim()) newErrors.number = "Número do cartão é obrigatório";
      if (!cardData.holderName.trim()) newErrors.holderName = "Nome do titular é obrigatório";
      if (!cardData.expiryMonth.trim()) newErrors.expiryMonth = "Mês de expiração é obrigatório";
      if (!cardData.expiryYear.trim()) newErrors.expiryYear = "Ano de expiração é obrigatório";
      if (!cardData.cvv.trim()) newErrors.cvv = "CVV é obrigatório";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      // Simular processamento de pagamento
      toast.loading("Processando pagamento...");
      
      // Aqui você integraria com o gateway de pagamento escolhido
      const response = await processPayment(paymentData, amount);
      
      toast.dismiss();
      toast.success("Pagamento processado com sucesso!");
      onSuccess(response.paymentId);
      
    } catch (error) {
      toast.dismiss();
      const errorMessage = error instanceof Error ? error.message : "Erro ao processar pagamento";
      toast.error(errorMessage);
      onError(errorMessage);
    }
  };

  const processPayment = async (data: PaymentData, amount: number) => {
    // Simulação de API de pagamento
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simular sucesso 90% das vezes
    if (Math.random() > 0.1) {
      return { paymentId: `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` };
    } else {
      throw new Error("Falha na transação. Tente novamente.");
    }
  };

  const handleInputChange = (field: keyof typeof cardData, value: string) => {
    setCardData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(" ");
    } else {
      return v;
    }
  };

  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear + i);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Resumo do Pedido</h3>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Total a pagar:</span>
          <span className="text-2xl font-bold text-green-600">
            R$ {amount.toFixed(2)}
          </span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Método de Pagamento
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { value: "credit_card", label: "Cartão de Crédito", icon: "💳" },
            { value: "debit_card", label: "Cartão de Débito", icon: "💳" },
            { value: "boleto", label: "Boleto", icon: "📄" },
            { value: "pix", label: "PIX", icon: "📱" },
          ].map((method) => (
            <button
              key={method.value}
              type="button"
              onClick={() => setPaymentData(prev => ({ ...prev, method: method.value as any }))}
              className={`p-3 border rounded-lg text-center transition-colors ${
                paymentData.method === method.value
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              <div className="text-2xl mb-1">{method.icon}</div>
              <div className="text-sm font-medium">{method.label}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Gateway de Pagamento
        </label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: "asaas", label: "Asaas", icon: "🏦" },
            { value: "mercadopago", label: "Mercado Pago", icon: "🛒" },
            { value: "stripe", label: "Stripe", icon: "💳" },
          ].map((gateway) => (
            <button
              key={gateway.value}
              type="button"
              onClick={() => setPaymentData(prev => ({ ...prev, gateway: gateway.value as any }))}
              className={`p-3 border rounded-lg text-center transition-colors ${
                paymentData.gateway === gateway.value
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              <div className="text-2xl mb-1">{gateway.icon}</div>
              <div className="text-sm font-medium">{gateway.label}</div>
            </button>
          ))}
        </div>
      </div>

      {(paymentData.method === "credit_card" || paymentData.method === "debit_card") && (
        <>
          <div>
            <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Número do Cartão *
            </label>
            <input
              type="text"
              id="cardNumber"
              value={cardData.number}
              onChange={(e) => handleInputChange("number", formatCardNumber(e.target.value))}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.number ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="0000 0000 0000 0000"
              maxLength={19}
            />
            {errors.number && (
              <p className="text-red-500 text-sm mt-1">{errors.number}</p>
            )}
          </div>

          <div>
            <label htmlFor="holderName" className="block text-sm font-medium text-gray-700 mb-1">
              Nome do Titular *
            </label>
            <input
              type="text"
              id="holderName"
              value={cardData.holderName}
              onChange={(e) => handleInputChange("holderName", e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.holderName ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Nome como está no cartão"
            />
            {errors.holderName && (
              <p className="text-red-500 text-sm mt-1">{errors.holderName}</p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label htmlFor="expiryMonth" className="block text-sm font-medium text-gray-700 mb-1">
                Mês *
              </label>
              <select
                id="expiryMonth"
                value={cardData.expiryMonth}
                onChange={(e) => handleInputChange("expiryMonth", e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.expiryMonth ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">MM</option>
                {months.map(month => (
                  <option key={month} value={month.toString().padStart(2, "0")}>
                    {month.toString().padStart(2, "0")}
                  </option>
                ))}
              </select>
              {errors.expiryMonth && (
                <p className="text-red-500 text-sm mt-1">{errors.expiryMonth}</p>
              )}
            </div>

            <div>
              <label htmlFor="expiryYear" className="block text-sm font-medium text-gray-700 mb-1">
                Ano *
              </label>
              <select
                id="expiryYear"
                value={cardData.expiryYear}
                onChange={(e) => handleInputChange("expiryYear", e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.expiryYear ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">AAAA</option>
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              {errors.expiryYear && (
                <p className="text-red-500 text-sm mt-1">{errors.expiryYear}</p>
              )}
            </div>

            <div>
              <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">
                CVV *
              </label>
              <input
                type="text"
                id="cvv"
                value={cardData.cvv}
                onChange={(e) => handleInputChange("cvv", e.target.value.replace(/\D/g, ""))}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.cvv ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="123"
                maxLength={4}
              />
              {errors.cvv && (
                <p className="text-red-500 text-sm mt-1">{errors.cvv}</p>
              )}
            </div>
          </div>

          {paymentData.method === "credit_card" && (
            <div>
              <label htmlFor="installments" className="block text-sm font-medium text-gray-700 mb-1">
                Parcelas
              </label>
              <select
                id="installments"
                value={paymentData.installments}
                onChange={(e) => setPaymentData(prev => ({ ...prev, installments: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map(installment => (
                  <option key={installment} value={installment}>
                    {installment}x de R$ {(amount / installment).toFixed(2)}
                  </option>
                ))}
              </select>
            </div>
          )}
        </>
      )}

      <Button
        type="submit"
        disabled={loading}
        className="w-full py-3 text-lg bg-green-600 hover:bg-green-700"
      >
        {loading ? "Processando..." : `Pagar R$ ${amount.toFixed(2)}`}
      </Button>

      <div className="text-center text-sm text-gray-500">
        <p>🔒 Seus dados estão seguros e criptografados</p>
        <p>💳 Aceitamos todos os principais cartões de crédito e débito</p>
      </div>
    </form>
  );
}
