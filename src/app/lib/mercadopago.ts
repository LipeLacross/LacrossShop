import mercadopago from "mercadopago";

// Solução para o erro de tipagem
const mp = mercadopago as never;

// Configuração segura
mp.configure({
  access_token: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

interface MercadoPagoItem {
  title: string;
  unit_price: number;
  quantity: number;
}

export async function createMercadoPagoLink(items: MercadoPagoItem[]) {
  try {
    const preference = await mp.preferences.create({
      items,
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_APP_URL}/success`,
        failure: `${process.env.NEXT_PUBLIC_APP_URL}/cart`,
      },
    });

    return preference.body.init_point;
  } catch (error) {
    console.error("MercadoPago error:", error);
    throw new Error("Falha ao criar link de pagamento");
  }
}
