import mercadopago from "mercadopago";

interface MercadoPagoConfig {
  configure: (config: { access_token: string }) => void;
  preferences: {
    create: (payload: unknown) => Promise<{ body: { init_point: string } }>;
  };
}

const mp = mercadopago as unknown as MercadoPagoConfig;

if (process.env.MERCADOPAGO_ACCESS_TOKEN) {
  mp.configure({
    access_token: process.env.MERCADOPAGO_ACCESS_TOKEN,
  });
}

interface MercadoPagoItem {
  title: string;
  unit_price: number;
  quantity: number;
}

export async function createMercadoPagoLink(
  items: MercadoPagoItem[],
): Promise<string> {
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
