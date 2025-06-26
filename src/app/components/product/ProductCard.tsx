import Link from "next/link";
import Image from "next/image";
import { Product } from "../../types";

export function ProductCard({ product }: { product: Product }) {
  return (
    <div className="border rounded-lg overflow-hidden transition-shadow hover:shadow-md">
      <Link href={`/product/${product.slug}`} className="block">
        <div className="aspect-square bg-gray-100 flex items-center justify-center">
          {product.image.url ? (
            <Image
              src={product.image.url}
              alt={product.title}
              width={300}
              height={300}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="text-gray-500 text-center p-4">Sem imagem</div>
          )}
        </div>

        <div className="p-4">
          <h2 className="font-semibold line-clamp-1">{product.title}</h2>
          <p className="text-primary font-medium mt-2">
            R$ {product.price.toFixed(2)}
          </p>
        </div>
      </Link>
    </div>
  );
}
