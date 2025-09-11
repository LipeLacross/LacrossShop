import { Carousel } from "@/app/components/carousel";
import { ThreeItemGrid } from "@/app/components/grid/three-items";
import Footer from "@/app/components/layout/footer";
import Hero from "@/app/components/home/Hero";
import Usps from "@/app/components/home/Usps";
import CtaBanner from "@/app/components/home/CtaBanner";
import TrustBadges from "@/app/components/home/TrustBadges";
import Reviews from "@/app/components/home/Reviews";
import Link from "next/link";

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
      <Usps />
      <section id="destaques" className="mt-10">
        <ThreeItemGrid />
      </section>
      <CtaBanner />
      <Carousel />
      <Reviews />
      <TrustBadges />

      {/* FAQ resumida */}
      <section className="mx-auto mt-10 w-full max-w-[--breakpoint-2xl] px-4">
        <h3 className="mb-4 text-xl font-bold">Perguntas frequentes</h3>
        <div className="space-y-4">
          <details className="rounded-lg border p-4 dark:border-neutral-800">
            <summary className="cursor-pointer font-medium">
              Como funcionam frete e prazos?
            </summary>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
              Informamos o prazo estimado no checkout e enviamos o código de
              rastreio após a postagem.
            </p>
          </details>
          <details className="rounded-lg border p-4 dark:border-neutral-800">
            <summary className="cursor-pointer font-medium">
              Quais formas de pagamento aceitam?
            </summary>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
              Cartões de crédito, Pix e Boleto. Parcelamento disponível conforme
              valor e regras.
            </p>
          </details>
          <details className="rounded-lg border p-4 dark:border-neutral-800">
            <summary className="cursor-pointer font-medium">
              Posso trocar ou devolver?
            </summary>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
              Sim. Consulte políticas de devolução e prazos na página dedicada.
            </p>
          </details>
        </div>
      </section>

      <Footer />
    </>
  );
}
