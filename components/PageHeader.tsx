import Link from "next/link";
import Container from "@/components/Container";
import { ChevronRight } from "@/components/icons";

type Crumb = { label: string; href?: string };

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  breadcrumb?: Crumb[];
};

export default function PageHeader({
  title,
  subtitle,
  breadcrumb,
}: PageHeaderProps) {
  return (
    <section className="border-b border-navy-800 bg-gradient-to-br from-navy-900 to-navy-800 text-white">
      <Container className="py-10 sm:py-14">
        {breadcrumb && breadcrumb.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-3">
            <ol className="flex flex-wrap items-center gap-1 text-sm text-navy-200">
              {breadcrumb.map((c, i) => (
                <li key={`${c.label}-${i}`} className="inline-flex items-center gap-1">
                  {c.href ? (
                    <Link href={c.href} className="hover:text-white">
                      {c.label}
                    </Link>
                  ) : (
                    <span className="text-navy-100">{c.label}</span>
                  )}
                  {i < breadcrumb.length - 1 && (
                    <ChevronRight size={14} className="text-navy-400" />
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}
        <h1 className="text-3xl font-extrabold sm:text-4xl">{title}</h1>
        {subtitle && (
          <p className="mt-3 max-w-2xl text-navy-200">{subtitle}</p>
        )}
      </Container>
    </section>
  );
}
