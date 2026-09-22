import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getSalonBySlug, getSalonServices, getSalonStaff } from "@/lib/data/salons";

interface SalonPageProps {
  params: { citySlug: string; categorySlug: string; salonSlug: string };
}

export async function generateMetadata({ params }: SalonPageProps): Promise<Metadata> {
  const salon = await getSalonBySlug(params.citySlug, params.categorySlug, params.salonSlug);
  if (!salon) return {};
  return {
    title: salon.name,
    description: salon.description ?? `${salon.name} à ${salon.city}`,
  };
}

export default async function SalonPage({ params }: SalonPageProps) {
  const salon = await getSalonBySlug(params.citySlug, params.categorySlug, params.salonSlug);
  if (!salon) notFound();

  const [services, staff] = await Promise.all([
    getSalonServices(salon.id),
    getSalonStaff(salon.id),
  ]);

  const bookHref = `/${params.citySlug}/${params.categorySlug}/${params.salonSlug}/reserver`;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{salon.name}</h1>
          <p className="text-ink/60">{salon.address ?? salon.city}</p>
        </div>
        {salon.phone && (
          <a
            href={`tel:${salon.phone}`}
            className="shrink-0 rounded-full bg-brand-light px-4 py-2 text-sm font-medium text-brand-dark"
          >
            Appeler le salon
          </a>
        )}
      </div>

      {salon.description && <p className="mt-4 text-ink/80">{salon.description}</p>}

      <div className="mt-2 flex flex-wrap gap-1 text-xs">
        {salon.home_service && (
          <span className="rounded-full bg-black/5 px-2 py-0.5">
            À domicile{salon.home_fee ? ` (+${salon.home_fee} €)` : ""}
          </span>
        )}
        {salon.has_iban && (
          <span className="rounded-full bg-black/5 px-2 py-0.5">Acompte à la réservation</span>
        )}
      </div>

      <section className="mt-8">
        <h2 className="text-lg font-medium">Prestations</h2>
        <ul className="mt-3 divide-y divide-black/5 rounded-xl border border-black/10 bg-white">
          {services.map((service) => (
            <li key={service.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="font-medium">{service.name}</p>
                <p className="text-sm text-ink/50">{service.duration_min} min</p>
              </div>
              <p className="font-medium">{service.price} €</p>
            </li>
          ))}
          {services.length === 0 && (
            <li className="px-4 py-3 text-sm text-ink/50">Aucune prestation renseignée.</li>
          )}
        </ul>
      </section>

      {staff.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-medium">Équipe</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {staff.map((member) => (
              <span
                key={member.id}
                className="rounded-full bg-black/5 px-3 py-1 text-sm"
              >
                {member.name}
              </span>
            ))}
          </div>
        </section>
      )}

      <Link
        href={bookHref}
        className="mt-8 inline-block w-full rounded-lg bg-brand px-5 py-3 text-center font-medium text-white hover:bg-brand-dark sm:w-auto"
      >
        Réserver un rendez-vous
      </Link>
    </div>
  );
}
