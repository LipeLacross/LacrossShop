import { Carousel } from "@/app/components/carousel";
import { ThreeItemGrid } from "@/app/components/grid/three-items";
import Footer from "@/app/components/layout/footer";

export const metadata = {
  description:
    "High-performance ecommerce store built with Next.js, Vercel, and Shopify.",
  openGraph: {
    type: "website",
  },
};

export default function HomePage() {
  return (
    <>
      <ThreeItemGrid />
      <Carousel />
      <Footer />
    </>
  );
}
