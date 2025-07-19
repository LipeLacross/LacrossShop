import OpengraphImage from "@/app/components/opengraph-image";
import { getPage } from "@/app/lib/api";

export default async function Image({ params }: { params: { page: string } }) {
  const pageData = await getPage(params.page);

  // ✅ Verificação segura
  if (!pageData) {
    const fallbackTitle = "Página não encontrada";
    return await OpengraphImage({ title: fallbackTitle });
  }

  const title = pageData.seo?.title || pageData.title;

  return await OpengraphImage({ title });
}
