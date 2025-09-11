import { StarIcon } from "@heroicons/react/20/solid";

type Review = {
  name: string;
  title: string;
  rating: number; // 0-5
  content: string;
  date: string;
};

const reviews: Review[] = [
  {
    name: "Ana Souza",
    title: "Entrega rápida e produto original",
    rating: 5,
    content:
      "Chegou antes do prazo e o atendimento foi ótimo. Recomendo a loja!",
    date: "2025-08-12",
  },
  {
    name: "Bruno Lima",
    title: "Checkout simples",
    rating: 4,
    content:
      "Processo de compra rápido e sem complicação. Só senti falta de mais fotos no produto.",
    date: "2025-07-03",
  },
  {
    name: "Carla Menezes",
    title: "Suporte atencioso",
    rating: 5,
    content: "Tive uma dúvida e responderam na hora, já fiz a segunda compra.",
    date: "2025-06-20",
  },
];

function Stars({ rating }: { rating: number }) {
  const stars = Array.from({ length: 5 }, (_, i) => i < rating);
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} de 5`}>
      {stars.map((on, i) => (
        <StarIcon
          key={i}
          className={on ? "h-4 w-4 text-yellow-500" : "h-4 w-4 text-gray-300"}
        />
      ))}
    </div>
  );
}

export default function Reviews() {
  return (
    <section className="mx-auto mt-10 w-full max-w-[--breakpoint-2xl] px-4">
      <h3 className="mb-4 text-xl font-bold">O que dizem nossos clientes</h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {reviews.map((r) => (
          <article
            key={`${r.name}-${r.date}`}
            className="rounded-xl border p-4 dark:border-neutral-800"
          >
            <header className="mb-2">
              <Stars rating={r.rating} />
              <h4 className="mt-2 text-sm font-semibold">{r.title}</h4>
            </header>
            <p className="text-sm text-neutral-700 dark:text-neutral-300">
              {r.content}
            </p>
            <footer className="mt-3 text-xs text-neutral-500">
              {r.name} • {new Date(r.date).toLocaleDateString("pt-BR")}
            </footer>
          </article>
        ))}
      </div>
    </section>
  );
}
