import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Glowbook — Réservez votre rendez-vous beauté",
    template: "%s · Glowbook",
  },
  description:
    "Glowbook, la réservation en ligne pour les salons de coiffure, barbiers, instituts, ongleries et masseurs.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
