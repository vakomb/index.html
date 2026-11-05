import type { Category, CategorySlug } from "./types";

/**
 * Category hierarchy mapping: Lenkynas (LT) ⇄ Allegro (PL).
 *
 * `allegroCategoryId` values are Allegro's top-level category identifiers used
 * by the live adapter. Allegro occasionally restructures its tree — confirm the
 * ids against `GET /sale/categories` when you switch ALLEGRO_MODE to "live".
 */
export const CATEGORIES: Category[] = [
  {
    slug: "elektronika",
    name: "Elektronika",
    description: "Išmanieji įrenginiai, garso technika ir kompiuterių priedai.",
    allegroCategoryId: "42540aec-367a-4e5e-b411-17c09b08e41f",
    icon: "chip",
  },
  {
    slug: "drabuziai",
    name: "Drabužiai",
    description: "Kasdienė ir sezoninė apranga, avalynė bei aksesuarai.",
    allegroCategoryId: "4bd97d96-f0ff-46cb-a52c-2992bd972bb1",
    icon: "shirt",
  },
  {
    slug: "namai-ir-sodas",
    name: "Namai ir sodas",
    description: "Buitinė technika, interjeras, įrankiai ir sodo priežiūra.",
    allegroCategoryId: "5",
    icon: "leaf",
  },
  {
    slug: "autodalys",
    name: "Autodalys",
    description: "Atsarginės dalys, priežiūros priemonės ir automobilių priedai.",
    allegroCategoryId: "3",
    icon: "gear",
  },
  {
    slug: "sportas",
    name: "Sportas ir laisvalaikis",
    description: "Treniruočių inventorius, turizmas ir aktyvus poilsis.",
    allegroCategoryId: "3919",
    icon: "ball",
  },
  {
    slug: "grozis",
    name: "Grožis ir sveikata",
    description: "Priežiūros priemonės, prietaisai ir kasdieniai sveikatos produktai.",
    allegroCategoryId: "1429",
    icon: "drop",
  },
];

export function getCategory(slug: string): Category | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function isCategorySlug(slug: string): slug is CategorySlug {
  return CATEGORIES.some((c) => c.slug === slug);
}
