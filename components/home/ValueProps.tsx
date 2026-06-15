import Container from "@/components/Container";
import Reveal from "@/components/Reveal";
import { ShieldCheck, Tag, Wrench, Users } from "@/components/icons";

const items = [
  {
    icon: ShieldCheck,
    title: "Quality Pre-Owned Vehicles",
    text: "Every vehicle is hand-picked and thoroughly inspected so you can buy with confidence.",
  },
  {
    icon: Tag,
    title: "Honest, Affordable Pricing",
    text: "Fair, transparent prices with no hidden surprises — making ownership accessible for everyone.",
  },
  {
    icon: Wrench,
    title: "In-House Service & Repairs",
    text: "Our team keeps your vehicle running its best long after you drive off the lot.",
  },
  {
    icon: Users,
    title: "No-Pressure Experience",
    text: "A friendly, family-run dealership focused on finding the right fit for you — not a hard sell.",
  },
];

export default function ValueProps() {
  return (
    <section className="bg-white py-16 sm:py-20">
      <Container>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, i) => (
            <Reveal key={item.title} delay={i * 0.08}>
              <div className="h-full rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-navy-50 text-brand-500">
                  <item.icon size={24} />
                </span>
                <h3 className="mt-4 text-lg font-bold text-navy-900">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {item.text}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
