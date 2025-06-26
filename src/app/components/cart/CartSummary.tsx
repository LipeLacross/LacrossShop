// src/app/components/cart/CartSummary.tsx
import { CartItemType } from '../../types';
import { Button } from '../ui/button';

interface Props {
  items: CartItemType[];
  onStripeCheckout: () => void;
  onMercadoPagoCheckout: () => void;
  onPagSeguroCheckout: () => void;
  onAsaasCheckout: () => void;
}

export function CartSummary({
  items,
  onStripeCheckout,
  onMercadoPagoCheckout,
  onPagSeguroCheckout,
  onAsaasCheckout
}: Props) {
  const total = items.reduce((sum, i) => sum + i.quantity * i.product.price, 0);

  return (
    <div className="border-t pt-4 mt-4">
      <div className="flex justify-between items-center mb-4">
        <span className="font-semibold">Total:</span>
        <span className="text-xl font-bold">R$ {total.toFixed(2)}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <Button onClick={onStripeCheckout} className="w-full">
          Pagar com Cartão (Stripe)
        </Button>

        <Button onClick={onMercadoPagoCheckout} className="w-full bg-[#009EE3] hover:bg-[#0080C0]">
          Pagar com Mercado Pago
        </Button>

        <Button onClick={onPagSeguroCheckout} className="w-full bg-[#FFC107] hover:bg-[#E0A800] text-gray-900">
          Pagar com PagSeguro
        </Button>

        <Button onClick={onAsaasCheckout} className="w-full bg-[#00B894] hover:bg-[#00A885]">
          Pagar com Asaas (Boleto)
        </Button>
      </div>
    </div>
  );
}
