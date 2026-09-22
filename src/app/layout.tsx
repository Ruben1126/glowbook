import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "MonCréno — Réservez votre rendez-vous beauté",
    template: "%s · MonCréno",
  },
  description:
    "MonCréno, la réservation en ligne pour les salons de coiffure, barbiers, instituts, ongleries et masseurs.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
