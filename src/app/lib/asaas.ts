import { createAsaasClient } from "asaas-node-sdk";

// Verificação de variáveis de ambiente
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

export async function createAsaasPayment(
  customerId: string,
  value: number,
  dueDate: Date, // Aceita objeto Date
  billingType: BillingType = "BOLETO",
): Promise<string> {
  try {
    // Converter para string no formato YYYY-MM-DD
    const formattedDueDate = dueDate.toISOString().split("T")[0];

    const payment = await asaas.createNewPayment({
      body: {
        customer: customerId,
        value,
        dueDate: formattedDueDate, // String formatada
        billingType,
      },
    });

    if (!payment.data) {
      throw new Error("Resposta do Asaas sem dados");
    }

    const data = payment.data as AsaasPaymentResponse;
    return data.invoiceUrl || data.bankSlipUrl || "";
  } catch (error) {
    console.error("Asaas payment error:", error);
    throw new Error("Falha ao criar pagamento Asaas");
  }
}
