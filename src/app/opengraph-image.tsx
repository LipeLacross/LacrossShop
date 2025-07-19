import OpengraphImage from "@/app/components/opengraph-image";
import { fetchCategories } from "@/app/lib/api";

export default async function Image() {
  const categories = await fetchCategories();
  // Escolha a categoria desejada, ou use o campo apropriado
  const title = categories[0]?.name || "Título padrão";
  return await OpengraphImage({ title });
}
