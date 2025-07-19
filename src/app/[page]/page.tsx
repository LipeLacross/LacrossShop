// src/app/[page]/page.tsx
import type { Metadata } from "next";
import Prose from "@/app/components/prose";
import { getPage } from "@/app/lib/api";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ page: string }>;
  // se você vier a usar searchParams, descomente e tipifique como Promise:
  // searchParams: Promise<{ [key: string]: string | undefined }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { page } = await params;
  const pageData = await getPage(page);
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

export default async function Page({ params }: Props) {
  const { page } = await params;
  const pageData = await getPage(page);
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
