import { CartItemType } from '../../types';
import { Button } from '../ui/button';

export function CartItem({
  item,
  onRemove,
}: {
  item: CartItemType;
  onRemove: () => void;
}) {
  return (
    <div className="flex justify-between items-center">
      <span>{item.product.title}</span>
      <span>{item.quantity} × R$ {item.product.price.toFixed(2)}</span>
      <Button onClick={onRemove}>Remover</Button>
    </div>
  );
}
