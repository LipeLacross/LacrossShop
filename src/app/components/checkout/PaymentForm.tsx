"use client";

import { useMemo, useState } from "react";
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
  customer?: { name: string; email: string; phone?: string; cpfCnpj?: string };
  items?: { id: number; title: string; price: number; qty: number }[];
  shipping?: { address: Record<string, unknown>; price: number; label: string };
}

export function PaymentForm({
  amount,
  onSuccess,
  onError,
  loading = false,
  customer,
  items = [],
  shipping,
}: PaymentFormProps) {
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

  const [errors, setErrors] = useState<Partial<PaymentData & typeof cardData>>(
    {},
  );

  const [modal, setModal] = useState<null | {
    type: "pix" | "boleto";
    url?: string | null;
    pixPayload?: string;
    pixImage?: string; // base64
    boletoLine?: string;
  }>(null);

  const [couponCode, setCouponCode] = useState<string>("");
  const [discount, setDiscount] = useState<number>(0);
  const [freeShipping, setFreeShipping] = useState<boolean>(false);

  const shippingPrice = shipping?.price || 0;
  const effectiveShipping = freeShipping ? 0 : shippingPrice;
  const subtotal = amount - (shipping?.price || 0); // amount vem com frete somado da página
  const finalAmount = useMemo(
    () =>
      Number(Math.max(0, subtotal - discount + effectiveShipping).toFixed(2)),
    [subtotal, discount, effectiveShipping],
  );

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      const res = await fetch("/api/promo/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponCode.trim(),
          amount: subtotal,
          shippingPrice,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.valid) {
        setDiscount(0);
        setFreeShipping(false);
        toast.error(json?.message || "Cupom inválido");
        return;
      }
      setDiscount(Number(json.discount || 0));
      setFreeShipping(Boolean(json.freeShipping));
      toast.success("Cupom aplicado");
    } catch {
      toast.error("Falha ao aplicar cupom");
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<PaymentData & typeof cardData> = {};

    if (
      paymentData.method === "credit_card" ||
      paymentData.method === "debit_card"
    ) {
      if (!cardData.number.trim())
        newErrors.number = "Número do cartão é obrigatório";
      if (!cardData.holderName.trim())
        newErrors.holderName = "Nome do titular é obrigatório";
      if (!cardData.expiryMonth.trim())
        newErrors.expiryMonth = "Mês de expiração é obrigatório";
      if (!cardData.expiryYear.trim())
        newErrors.expiryYear = "Ano de expiração é obrigatório";
      if (!cardData.cvv.trim()) newErrors.cvv = "CVV é obrigatório";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const copyToClipboard = async (text?: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copiado!");
    } catch {
      toast.error("Falha ao copiar");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      toast.loading("Processando pagamento...");

      const basePayload = {
        email: customer?.email,
        name: customer?.name,
        phone: customer?.phone,
        cpfCnpj: customer?.cpfCnpj,
        amount: finalAmount, // usa valor final com desconto e frete efetivo
        method: paymentData.method,
        provider: paymentData.gateway,
        items,
        shipping: shipping
          ? { ...shipping, price: effectiveShipping }
          : undefined,
        installments:
          paymentData.installments && paymentData.installments > 1
            ? paymentData.installments
            : undefined,
      } as Record<string, unknown>;

      if (paymentData.method === "boleto" || paymentData.method === "pix") {
        if (!customer?.email || !customer?.name)
          throw new Error("Nome e e-mail são obrigatórios");
        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(basePayload),
        });
        const json = await res.json();
        if (!res.ok)
          throw new Error(
            typeof json?.error === "string" ? json.error : "Falha no checkout",
          );
        toast.dismiss();
        toast.success("Pedido criado! Continue o pagamento.");
        if (paymentData.method === "pix") {
          setModal({
            type: "pix",
            url: json.url,
            pixPayload: json.pix?.payload || json.payload,
            pixImage: json.pix?.encodedImage || json.encodedImage,
          });
        } else {
          setModal({
            type: "boleto",
            url: json.url,
            boletoLine: json.boleto?.line || json.identificationField,
          });
        }
        try {
          if (json.orderCode)
            sessionStorage.setItem("lastOrderCode", json.orderCode);
        } catch {}
        onSuccess(json.paymentId as string);
        return;
      }

      if (
        paymentData.method === "credit_card" ||
        paymentData.method === "debit_card"
      ) {
        if (!customer?.email || !customer?.name)
          throw new Error("Nome e e-mail são obrigatórios");
        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...basePayload,
            method: "credit_card",
            card: {
              number: cardData.number.replace(/\s+/g, ""),
              holderName: cardData.holderName,
              expiryMonth: cardData.expiryMonth,
              expiryYear: cardData.expiryYear,
              cvv: cardData.cvv,
            },
          }),
        });
        const json = await res.json();
        if (!res.ok)
          throw new Error(
            typeof json?.error === "string" ? json.error : "Falha no cartão",
          );
        toast.dismiss();
        toast.success("Pagamento confirmado!");
        try {
          if (json.orderCode)
            sessionStorage.setItem("lastOrderCode", json.orderCode);
        } catch {}
        onSuccess(json.paymentId as string);
        return;
      }

      throw new Error("Método de pagamento não suportado");
    } catch (error) {
      toast.dismiss();
      const errorMessage =
        error instanceof Error ? error.message : "Erro ao processar pagamento";
      toast.error(errorMessage);
      onError(errorMessage);
    }
  };

  const handleInputChange = (field: keyof typeof cardData, value: string) => {
    setCardData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [] as string[];

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
  const installmentOptions = [1, 2, 3, 4, 5, 6, 10, 12];

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Resumo do Pedido</h3>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Subtotal:</span>
            <span>R$ {subtotal.toFixed(2)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between items-center text-green-700">
              <span>Desconto:</span>
              <span>- R$ {discount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between items-center">
            <span>Frete:</span>
            <span className={freeShipping ? "text-green-600" : ""}>
              {freeShipping ? "Grátis" : `R$ ${effectiveShipping.toFixed(2)}`}
            </span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-gray-600">Total a pagar:</span>
            <span className="text-2xl font-bold text-green-600">
              R$ {finalAmount.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cupom de desconto
            </label>
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="EXEMPLO10"
            />
          </div>
          <Button type="button" onClick={applyCoupon} className="px-4 py-2">
            Aplicar
          </Button>
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
                onClick={() =>
                  setPaymentData((prev) => ({
                    ...prev,
                    method: method.value as PaymentData["method"],
                  }))
                }
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

        {(paymentData.method === "credit_card" ||
          paymentData.method === "debit_card") && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Parcelas
            </label>
            <select
              value={paymentData.installments || 1}
              onChange={(e) =>
                setPaymentData((p) => ({
                  ...p,
                  installments: Number(e.target.value) || 1,
                }))
              }
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {installmentOptions.map((n) => (
                <option key={n} value={n}>
                  {n}x de R$ {(finalAmount / n).toFixed(2)}
                </option>
              ))}
            </select>
          </div>
        )}

        {(paymentData.method === "credit_card" ||
          paymentData.method === "debit_card") && (
          <>
            <div>
              <label
                htmlFor="cardNumber"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Número do Cartão *
              </label>
              <input
                type="text"
                id="cardNumber"
                value={cardData.number}
                onChange={(e) =>
                  handleInputChange("number", formatCardNumber(e.target.value))
                }
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
              <label
                htmlFor="holderName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nome do Titular *
              </label>
              <input
                type="text"
                id="holderName"
                value={cardData.holderName}
                onChange={(e) =>
                  handleInputChange("holderName", e.target.value)
                }
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
                <label
                  htmlFor="expiryMonth"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Mês *
                </label>
                <select
                  id="expiryMonth"
                  value={cardData.expiryMonth}
                  onChange={(e) =>
                    handleInputChange("expiryMonth", e.target.value)
                  }
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.expiryMonth ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">MM</option>
                  {months.map((month) => (
                    <option
                      key={month}
                      value={month.toString().padStart(2, "0")}
                    >
                      {month.toString().padStart(2, "0")}
                    </option>
                  ))}
                </select>
                {errors.expiryMonth && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.expiryMonth}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="expiryYear"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Ano *
                </label>
                <select
                  id="expiryYear"
                  value={cardData.expiryYear}
                  onChange={(e) =>
                    handleInputChange("expiryYear", e.target.value)
                  }
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.expiryYear ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">AAAA</option>
                  {years.map((year) => (
                    <option key={year} value={String(year)}>
                      {year}
                    </option>
                  ))}
                </select>
                {errors.expiryYear && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.expiryYear}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="cvv"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  CVV *
                </label>
                <input
                  type="text"
                  id="cvv"
                  value={cardData.cvv}
                  onChange={(e) => handleInputChange("cvv", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.cvv ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="000"
                  maxLength={4}
                />
                {errors.cvv && (
                  <p className="text-red-500 text-sm mt-1">{errors.cvv}</p>
                )}
              </div>
            </div>
          </>
        )}

        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">Pagamento seguro</div>
          <Button type="submit" disabled={loading} className="px-6 py-3">
            {loading ? "Processando..." : "Pagar"}
          </Button>
        </div>
      </form>

      {/* Modais simples para PIX / Boleto */}
      {modal?.type === "pix" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded bg-white p-6 shadow-lg dark:bg-neutral-900">
            <h4 className="mb-2 text-lg font-semibold">Pague com PIX</h4>
            {modal.pixImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`data:image/png;base64,${modal.pixImage}`}
                alt="PIX QRCode"
                className="mx-auto mb-3 h-48 w-48"
              />
            ) : null}
            <div className="mb-3 break-all rounded bg-gray-100 p-2 text-xs text-gray-700">
              {modal.pixPayload}
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => copyToClipboard(modal.pixPayload)}
                className="rounded bg-neutral-200 px-3 py-1 text-sm hover:bg-neutral-300 dark:bg-neutral-700 dark:text-white dark:hover:bg-neutral-600"
              >
                Copiar código do PIX
              </button>
              <button
                onClick={() => setModal(null)}
                className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {modal?.type === "boleto" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded bg-white p-6 shadow-lg dark:bg-neutral-900">
            <h4 className="mb-2 text-lg font-semibold">Boleto Gerado</h4>
            {modal.url ? (
              <a
                href={modal.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                Abrir boleto
              </a>
            ) : null}
            <div className="mt-3 text-xs text-gray-700">
              Linha digitável: {modal.boletoLine || "—"}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => copyToClipboard(modal.boletoLine)}
                className="rounded bg-neutral-200 px-3 py-1 text-sm hover:bg-neutral-300 dark:bg-neutral-700 dark:text-white dark:hover:bg-neutral-600"
              >
                Copiar linha
              </button>
              <button
                onClick={() => setModal(null)}
                className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
