import OpengraphImage from "@/app/components/opengraph-image";
import { fetchCategories } from "@/app/lib/api";

export default async function Image({
  params,
}: {
  params: { collection: string };
}) {
  // Busca todas as categorias e encontra a que tem o slug correto
  const categories = await fetchCategories();
  const collection = categories.find((cat) => cat.slug === params.collection);
  const title = collection?.name || "Coleção não encontrada";
  return await OpengraphImage({ title });
}
