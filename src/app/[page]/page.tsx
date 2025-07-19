import type { Metadata } from "next";
import Prose from "@/app/components/prose";
import { getPage } from "@/app/lib/api";
import { notFound } from "next/navigation";

type PageParams = {
  params: {
    page: string;
  };
};

export async function generateMetadata({
  params,
}: PageParams): Promise<Metadata> {
  const pageData = await getPage(params.page);
  if (!pageData) notFound();

  return {
    title: pageData.seo?.title || pageData.title,
    description: pageData.seo?.description || pageData.bodySummary,
    openGraph: {
      publishedTime: pageData.createdAt,
      modifiedTime: pageData.updatedAt,
      type: "article",
    },
  };
}

export default async function Page({ params }: PageParams) {
  const pageData = await getPage(params.page);
  if (!pageData) notFound();

  return (
    <>
      <h1 className="mb-8 text-5xl font-bold">{pageData.title}</h1>
      <Prose className="mb-8" html={pageData.body} />
      <p className="text-sm italic">
        {`This document was last updated on ${new Intl.DateTimeFormat(
          undefined,
          {
            year: "numeric",
            month: "long",
            day: "numeric",
          },
        ).format(new Date(pageData.updatedAt))}.`}
      </p>
    </>
  );
}
