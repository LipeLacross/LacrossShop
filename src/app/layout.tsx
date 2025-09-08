import "./globals.css";
import { ReactNode } from "react";
import { GeistSans } from "geist/font/sans";
import { baseUrl } from "@/app/lib/utils";
import ClientLayout from "@/app/components/layout/ClientLayout";
import { fetchCategories } from "@/app/lib/api";

const { SITE_NAME } = process.env;

export const metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: SITE_NAME ?? "NeoMercado",
    template: `%s | ${SITE_NAME || "NeoMercado"}`,
  },
  robots: { follow: true, index: true },
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const categories = await fetchCategories();
  return (
    <html
      lang="en"
      className={GeistSans?.variable ?? ""}
      suppressHydrationWarning
    >
      <body
        className="bg-neutral-50 text-black dark:bg-neutral-900 dark:text-white selection:bg-teal-300 dark:selection:bg-pink-500 dark:selection:text-white"
        suppressHydrationWarning
      >
        <ClientLayout categories={categories}>{children}</ClientLayout>
      </body>
    </html>
  );
}
