/**
 * Allegro source selector — the single entry point the catalogue engine uses.
 * Switches between the offline mock middleware and the live REST adapter
 * based on configuration, with an automatic fallback to mock data if the live
 * API fails (so the storefront never renders empty because of an outage).
 */
import { config } from "../config";
import type { AllegroRawOffer, CategorySlug } from "../types";
import { mockAllegro } from "./mock";
import { liveAllegro } from "./live";

export interface AllegroSource {
  listOffers(params?: { category?: CategorySlug; phrase?: string; limit?: number }): Promise<AllegroRawOffer[]>;
  getOffer(id: string): Promise<AllegroRawOffer | null>;
}

const withFallback = (live: AllegroSource): AllegroSource => ({
  async listOffers(params) {
    try {
      return await live.listOffers(params);
    } catch (err) {
      console.error("[allegro] live listing failed, serving mock data:", (err as Error).message);
      return mockAllegro.listOffers(params);
    }
  },
  async getOffer(id) {
    try {
      return await live.getOffer(id);
    } catch (err) {
      console.error("[allegro] live offer failed, serving mock data:", (err as Error).message);
      return mockAllegro.getOffer(id);
    }
  },
});

export const allegro: AllegroSource = config.allegro.mode === "live" ? withFallback(liveAllegro) : mockAllegro;
export const allegroMode = config.allegro.mode;
