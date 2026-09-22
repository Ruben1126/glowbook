import { CATEGORIES } from "@/lib/types";

export interface ParsedQuery {
  categorySlug?: string;
  maxPrice?: number;
  keywords: string[];
}

const CATEGORY_HINTS: Record<string, string> = {
  coiffeur: "coiffeur",
  coiffure: "coiffeur",
  coupe: "coiffeur",
  balayage: "coiffeur",
  barbier: "barbier",
  barbe: "barbier",
  ongle: "ongles",
  ongles: "ongles",
  manucure: "ongles",
  esthetique: "esthetique",
  institut: "esthetique",
  soin: "esthetique",
  massage: "massage",
  masseur: "massage",
};

/**
 * Analyse en langage libre très simple ("balayage samedi matin, moins de
 * 140 €") : ce n'est pas une IA, juste une extraction de mots-clés pour
 * pré-remplir les filtres de recherche.
 */
export function parseFreeTextQuery(text: string): ParsedQuery {
  const normalized = text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

  const words = normalized.split(/[^a-z0-9]+/).filter(Boolean);

  let categorySlug: string | undefined;
  for (const word of words) {
    if (CATEGORY_HINTS[word]) {
      categorySlug = CATEGORY_HINTS[word];
      break;
    }
  }
  if (categorySlug && !CATEGORIES.some((c) => c.slug === categorySlug)) {
    categorySlug = undefined;
  }

  const priceMatch = normalized.match(/moins de\s*(\d+)/);
  const maxPrice = priceMatch ? Number(priceMatch[1]) : undefined;

  return { categorySlug, maxPrice, keywords: words };
}
