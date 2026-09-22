import { redirect } from "next/navigation";
import { requireAccount } from "@/lib/auth";
import { getMySalons, getUpcomingBookings } from "@/lib/data/pro";
import { SalonSwitcher } from "@/components/SalonSwitcher";

interface AgendaPageProps {
  searchParams: { salon?: string };
}

export default async function AgendaPage({ searchParams }: AgendaPageProps) {
  const account = await requireAccount();
  const salons = await getMySalons(account.id);
  const approved = salons.filter((s) => s.status === "approved");

  if (approved.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-black/10 p-6 text-ink/50">
        Aucune fiche publiée pour l&apos;instant.
      </p>
    );
  }

  const salonId = searchParams.salon ?? approved[0].id;
  const salon = approved.find((s) => s.id === salonId);
  if (!salon) redirect(`/pro/tableau-de-bord/agenda?salon=${approved[0].id}`);

  const bookings = await getUpcomingBookings(salon!.id);
  const byDate = bookings.reduce<Record<string, typeof bookings>>((acc, b) => {
    (acc[b.booking_date] ??= []).push(b);
    return acc;
  }, {});

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Agenda — {salon!.name}</h1>
        {approved.length > 1 && (
          <SalonSwitcher salons={approved} currentId={salon!.id} />
        )}
      </div>

      <div className="mt-6 space-y-6">
        {Object.entries(byDate).map(([date, dayBookings]) => (
          <div key={date}>
            <h2 className="text-sm font-semibold text-ink/50">
              {new Date(`${date}T00:00:00`).toLocaleDateString("fr-FR", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </h2>
            <ul className="mt-2 divide-y divide-black/5 rounded-xl border border-black/10 bg-white">
              {dayBookings.map((b) => (
                <li key={b.id} className="flex items-center justify-between px-4 py-3 text-sm">
                  <span>
                    {b.booking_time.slice(0, 5)} — {b.client_name}
                  </span>
                  <span className="text-ink/50">{b.duration_min} min · {b.price} €</span>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {bookings.length === 0 && (
          <p className="rounded-xl border border-dashed border-black/10 p-6 text-ink/50">
            Aucun rendez-vous à venir.
          </p>
        )}
      </div>
    </div>
  );
}
