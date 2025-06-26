import { createAsaasClient } from "asaas-node-sdk";

const asaas = createAsaasClient({
  apiKey: process.env.ASAAS_API_KEY!,
  environment: process.env.ASAAS_ENVIRONMENT as "sandbox" | "production",
});

type BillingType = "BOLETO" | "CREDIT_CARD" | "PIX" | "UNDEFINED";

export async function createAsaasPayment(
  customerId: string,
  value: number,
  dueDate: string, // Mantido como string (formato YYYY-MM-DD)
  billingType: BillingType = "BOLETO",
): Promise<string> {
  try {
    const payment = await asaas.createNewPayment({
      body: {
        customer: customerId,
        value,
        dueDate,
        billingType,
      },
    });

    // Verificação segura para payment.data
    if (!payment.data) {
      throw new Error("Resposta do Asaas sem dados");
    }

    // Acesso seguro às propriedades
    return (
      (payment.data as any).invoiceUrl ||
      (payment.data as any).bankSlipUrl ||
      ""
    );
  } catch (error) {
    console.error("Asaas payment error:", error);
    throw new Error("Falha ao criar pagamento Asaas");
  }
}
