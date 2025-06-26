import { CartItemType } from "../../types";
import { Button } from "../ui/button";
import Image from "next/image";

interface Props {
  item: CartItemType;
  onRemove: () => void;
  onUpdateQuantity: (newQuantity: number) => void;
}

export function CartItem({ item, onRemove, onUpdateQuantity }: Props) {
  return (
    <div className="flex items-center p-4">
      <div className="flex-shrink-0 w-24 h-24 bg-gray-100 rounded-md overflow-hidden">
        {item.product.image.url ? (
          <Image
            src={item.product.image.url}
            alt={item.product.title}
            width={96}
            height={96}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="bg-gray-200 border-2 border-dashed w-full h-full flex items-center justify-center">
            <span className="text-gray-500 text-xs">Sem imagem</span>
          </div>
        )}
      </div>

      <div className="ml-4 flex-1">
        <h3 className="font-medium text-lg">{item.product.title}</h3>
        <p className="text-gray-600">R$ {item.product.price.toFixed(2)}</p>

        <div className="mt-2 flex items-center">
          <input
            type="number"
            min="1"
            value={item.quantity}
            onChange={(e) => onUpdateQuantity(Number(e.target.value))}
            className="w-16 px-2 py-1 border rounded text-center"
          />
          <Button
            onClick={onRemove}
            className="ml-2 text-red-600 hover:text-red-800"
            variant="ghost"
          >
            Remover
          </Button>
        </div>
      </div>

      <div className="text-right">
        <p className="font-semibold">
          R$ {(item.product.price * item.quantity).toFixed(2)}
        </p>
      </div>
    </div>
  );
}
