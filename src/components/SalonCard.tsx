import Link from "next/link";
import type { Salon } from "@/lib/types";

export function SalonCard({ salon }: { salon: Salon }) {
  const href = `/${salon.city_slug}/${salon.category_slug}/${salon.slug}`;

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-black/10 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <Link href={href} className="text-lg font-medium hover:underline">
            {salon.name}
          </Link>
          <p className="text-sm text-ink/60">{salon.city}</p>
        </div>
        {salon.phone && (
          <a
            href={`tel:${salon.phone}`}
            className="shrink-0 rounded-full bg-brand-light px-3 py-1 text-xs font-medium text-brand-dark"
          >
            Appeler le salon
          </a>
        )}
      </div>

      {salon.description && (
        <p className="line-clamp-2 text-sm text-ink/70">{salon.description}</p>
      )}

      <div className="mt-1 flex flex-wrap gap-1 text-xs">
        {salon.home_service && (
          <span className="rounded-full bg-black/5 px-2 py-0.5">À domicile</span>
        )}
        {salon.has_iban && (
          <span className="rounded-full bg-black/5 px-2 py-0.5">Acompte à la réservation</span>
        )}
      </div>

      <Link
        href={`${href}/reserver`}
        className="mt-2 inline-block rounded-lg bg-brand px-4 py-2 text-center text-sm font-medium text-white hover:bg-brand-dark"
      >
        Réserver
      </Link>
    </div>
  );
}
