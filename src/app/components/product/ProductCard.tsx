import Link from 'next/link';
import Image from 'next/image';
import { Product } from '../../types';

export function ProductCard({ product }: { product: Product }) {
  return (
    <div className="border rounded p-4 flex flex-col">
      <Link href={`/product/${product.slug}`}>
        <Image src={product.image.url} alt={product.title} width={200} height={200} />
        <h2 className="mt-2 font-semibold">{product.title}</h2>
        <p className="text-primary">R$ {product.price.toFixed(2)}</p>
      </Link>
    </div>
  );
}
