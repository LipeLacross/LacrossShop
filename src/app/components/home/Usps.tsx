import {
  TruckIcon,
  ShieldCheckIcon,
  CreditCardIcon,
  ChatBubbleBottomCenterTextIcon,
} from "@heroicons/react/24/outline";

export default function Usps() {
  const items = [
    {
      icon: TruckIcon,
      title: "Frete ágil",
      desc: "Cálculo por CEP com prazos reais",
    },
    {
      icon: CreditCardIcon,
      title: "Parcelamento",
      desc: "Em até 12x, com/sem juros",
    },
    {
      icon: ShieldCheckIcon,
      title: "Checkout seguro",
      desc: "PCI-DSS e antifraude",
    },
    {
      icon: ChatBubbleBottomCenterTextIcon,
      title: "Atendimento",
      desc: "Suporte humanizado",
    },
  ];
  return (
    <section className="mx-auto mt-10 grid w-full max-w-[--breakpoint-2xl] grid-cols-1 gap-4 px-4 md:grid-cols-4">
      {items.map(({ icon: Icon, title, desc }) => (
        <div
          key={title}
          className="flex items-center gap-3 rounded-xl border p-4 dark:border-neutral-800"
        >
          <Icon className="h-6 w-6" />
          <div>
            <p className="text-sm font-semibold">{title}</p>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              {desc}
            </p>
          </div>
        </div>
      ))}
    </section>
  );
}
