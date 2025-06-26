import { CartItemType } from "../../types";
import { Button } from "../ui/button";

interface Props {
  items: CartItemType[];
  onStripeCheckout: () => void;
  onMercadoPagoCheckout: () => void;
  onAsaasCheckout: () => void;
}

export function CartSummary({
  items,
  onStripeCheckout,
  onMercadoPagoCheckout,
  onAsaasCheckout,
}: Props) {
  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );

  const shipping = 0; // Exemplo: frete fixo
  const total = subtotal + shipping;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4">Resumo do Pedido</h2>

      <div className="space-y-2 mb-6">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>R$ {subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Frete</span>
          <span>R$ {shipping.toFixed(2)}</span>
        </div>
        <div className="flex justify-between pt-2 border-t font-bold">
          <span>Total</span>
          <span>R$ {total.toFixed(2)}</span>
        </div>
      </div>

      <div className="space-y-3">
        <Button
          onClick={onStripeCheckout}
          className="w-full bg-indigo-600 hover:bg-indigo-700"
        >
          Pagar com Cartão (Stripe)
        </Button>

        <Button
          onClick={onMercadoPagoCheckout}
          className="w-full bg-blue-500 hover:bg-blue-600"
        >
          Pagar com Mercado Pago
        </Button>

        <Button
          onClick={onAsaasCheckout}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          Pagar com Boleto (Asaas)
        </Button>
      </div>

      <div className="mt-6 text-center">
        <a href="/" className="text-indigo-600 hover:text-indigo-800">
          Continuar Comprando
        </a>
      </div>
    </div>
  );
}
