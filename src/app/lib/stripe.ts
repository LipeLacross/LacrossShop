import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

interface StripeItem {
  product: {
    title: string;
    price: number;
  };
  quantity: number;
}

export async function createStripeSession(items: StripeItem[]) {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: items.map((i) => ({
        price_data: {
          currency: "brl",
          product_data: { name: i.product.title },
          unit_amount: Math.round(i.product.price * 100),
        },
        quantity: i.quantity,
      })),
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cart`,
    });
    return session.url;
  } catch (error) {
    console.error("Stripe error:", error);
    throw new Error("Falha ao criar sessão de pagamento");
  }
}
