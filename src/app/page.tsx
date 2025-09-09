import { Carousel } from "@/app/components/carousel";
import { ThreeItemGrid } from "@/app/components/grid/three-items";
import Footer from "@/app/components/layout/footer";
import Hero from "@/app/components/home/Hero";

export const metadata = {
  description: "NeoMercado — loja virtual moderna, rápida e escalável.",
  openGraph: {
    type: "website",
  },
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <section id="destaques" className="mt-8">
        <ThreeItemGrid />
      </section>
      <Carousel />
      <Footer />
    </>
  );
}
