import { createAsaasClient } from "asaas-node-sdk";

if (!process.env.ASAAS_API_KEY || !process.env.ASAAS_ENVIRONMENT) {
  throw new Error("Variáveis ASAAS não configuradas");
}

const asaas = createAsaasClient({
  apiKey: process.env.ASAAS_API_KEY,
  environment: process.env.ASAAS_ENVIRONMENT as "sandbox" | "production",
});

type BillingType = "BOLETO" | "CREDIT_CARD" | "PIX" | "UNDEFINED";

interface AsaasPaymentResponse {
  invoiceUrl?: string;
  bankSlipUrl?: string;
}

// Interface corrigida para usar Date
interface PaymentBody {
  customer: string;
  value: number;
  dueDate: Date; // Tipo corrigido para Date
  billingType: BillingType;
}

export async function createAsaasPayment(
  customerId: string,
  value: number,
  dueDate: Date,
  billingType: BillingType = "BOLETO",
): Promise<string> {
  try {
    const body: PaymentBody = {
      customer: customerId,
      value,
      dueDate, // Passamos o objeto Date diretamente
      billingType,
    };

    const payment = await asaas.createNewPayment({ body });
    if (!payment.data) throw new Error("Resposta do Asaas sem dados");

    const data = payment.data as AsaasPaymentResponse;
    return data.invoiceUrl || data.bankSlipUrl || "";
  } catch (error) {
    console.error("Asaas payment error:", error);
    throw new Error("Falha ao criar pagamento Asaas");
  }
}
