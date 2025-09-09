import OpengraphImage from "@/app/components/opengraph-image";
import { getPage } from "@/app/lib/api";

export default async function Image({ params }: { params: { page: string } }) {
  const pageData = await getPage(params.page);

  // ✅ Verificação segura
  if (!pageData) {
    const fallbackTitle = "Página não encontrada";
    return await OpengraphImage({ title: fallbackTitle });
  }

  const seo = pageData.seo as Record<string, unknown> | undefined;
  const seoTitle =
    seo && typeof seo.title === "string" ? (seo.title as string) : "";
  const title = (seoTitle || pageData.title || "NeoMercado") as string;

  return await OpengraphImage({ title });
}
