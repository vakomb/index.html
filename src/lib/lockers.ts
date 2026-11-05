/**
 * Parcel locker (paštomatų) directory used by the checkout picker.
 *
 * A curated static list keeps the repo zero-config. In production, replace
 * `LOCKERS` with a periodic import from the carriers' public locator feeds
 * (Omniva, LP EXPRESS, DPD Pickup) — the shape below is all the UI needs.
 */
export interface Locker {
  id: string;
  network: "Omniva" | "LP EXPRESS" | "DPD Pickup";
  city: string;
  name: string;
  address: string;
}

export const LOCKERS: Locker[] = [
  { id: "omn-vln-akropolis", network: "Omniva", city: "Vilnius", name: "Akropolis", address: "Ozo g. 25" },
  { id: "omn-vln-panorama", network: "Omniva", city: "Vilnius", name: "Panorama", address: "Saltoniškių g. 9" },
  { id: "lpx-vln-ozas", network: "LP EXPRESS", city: "Vilnius", name: "Ozas", address: "Ozo g. 18" },
  { id: "lpx-vln-gedimino", network: "LP EXPRESS", city: "Vilnius", name: "Gedimino pr.", address: "Gedimino pr. 7" },
  { id: "dpd-vln-pcpanorama", network: "DPD Pickup", city: "Vilnius", name: "Žirmūnai", address: "Žirmūnų g. 70" },
  { id: "omn-kns-mega", network: "Omniva", city: "Kaunas", name: "Mega", address: "Islandijos pl. 32" },
  { id: "lpx-kns-akropolis", network: "LP EXPRESS", city: "Kaunas", name: "Akropolis", address: "Karaliaus Mindaugo pr. 49" },
  { id: "dpd-kns-savanoriu", network: "DPD Pickup", city: "Kaunas", name: "Savanorių pr.", address: "Savanorių pr. 255" },
  { id: "omn-kpd-akropolis", network: "Omniva", city: "Klaipėda", name: "Akropolis", address: "Taikos pr. 61" },
  { id: "lpx-kpd-bigas", network: "LP EXPRESS", city: "Klaipėda", name: "BIG", address: "Taikos pr. 139" },
  { id: "omn-sia-saule", network: "Omniva", city: "Šiauliai", name: "Saulės miestas", address: "Tilžės g. 109" },
  { id: "lpx-pnv-babilonas", network: "LP EXPRESS", city: "Panevėžys", name: "Babilonas", address: "J. Biliūno g. 6" },
  { id: "dpd-als-centras", network: "DPD Pickup", city: "Alytus", name: "Centras", address: "Naujoji g. 2" },
];

export function getLocker(id: string): Locker | undefined {
  return LOCKERS.find((l) => l.id === id);
}

export const lockerLabel = (l: Locker) => `${l.network} · ${l.city}, ${l.name} (${l.address})`;
