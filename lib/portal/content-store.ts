"use client";

import { useMemo } from "react";
import { business } from "@/data/business";
import { campaigns as sampleCampaigns } from "@/data/campaigns";
import { contactCards } from "@/data/contact";
import { menuItems } from "@/data/menu";
import { promotions } from "@/data/promotions";
import type { Campaign, MenuItem } from "@/data/types";
import type { Localized } from "@/i18n/config";
import { createStore } from "@/lib/create-store";

// MOCK content workspace until the backend exists: menu items, campaigns and business details
// edited in the portal, kept in this browser. "Publish" marks the change as published here;
// with the backend it becomes PUT /menu/:id, PUT /campaigns/:id, PUT /business.

export type ContentState = "published" | "draft";

export type EditableItem = MenuItem & { available: boolean; state: ContentState; isDraftNew?: boolean };

export type EditableCampaign = Campaign & {
  title: Localized;
  text: Localized;
  cta: Localized;
  image: string;
  paused?: boolean;
  deleted?: boolean;
};

export type BusinessSettings = { name: Localized; location: Localized; hours: Localized; email: string; phone: string };

type State = {
  items: Record<string, Partial<EditableItem>>;
  added: EditableItem[];
  campaigns: Record<string, Partial<EditableCampaign>>;
  addedCampaigns: EditableCampaign[];
  business?: BusinessSettings;
};

const store = createStore<State>("wqb-content", { items: {}, added: [], campaigns: {}, addedCampaigns: [] });

export function useMenuItems(): EditableItem[] {
  const { items, added } = store.useValue();
  return useMemo(
    () => [
      ...added.map((item) => ({ ...item, ...items[item.id] })),
      ...menuItems.map((item) => ({ ...item, available: true, state: "published" as const, ...items[item.id] })),
    ],
    [items, added],
  );
}

export function saveItem(item: EditableItem, state: ContentState) {
  store.set((current) => {
    const exists = current.added.some((a) => a.id === item.id) || menuItems.some((m) => m.id === item.id);
    return exists
      ? { ...current, items: { ...current.items, [item.id]: { ...item, state } } }
      : { ...current, added: [{ ...item, state }, ...current.added] };
  });
}

export function useCampaigns(): EditableCampaign[] {
  const { campaigns, addedCampaigns } = store.useValue();
  return useMemo(
    () =>
      [
        ...addedCampaigns,
        ...sampleCampaigns.map((campaign) => {
          const promotion = promotions.find((p) => p.id === campaign.promotionId)!;
          return {
            ...campaign,
            title: promotion.title,
            text: promotion.text,
            cta: promotion.cta,
            image: promotion.image,
          };
        }),
      ]
        .map((campaign) => ({ ...campaign, ...campaigns[campaign.promotionId] }))
        .filter((campaign) => !campaign.deleted),
    [campaigns, addedCampaigns],
  );
}

export function saveCampaign(campaign: EditableCampaign) {
  store.set((current) => {
    const exists =
      current.addedCampaigns.some((c) => c.promotionId === campaign.promotionId) ||
      sampleCampaigns.some((c) => c.promotionId === campaign.promotionId);
    return exists
      ? { ...current, campaigns: { ...current.campaigns, [campaign.promotionId]: campaign } }
      : { ...current, addedCampaigns: [campaign, ...current.addedCampaigns] };
  });
}

export function patchCampaign(id: string, patch: Partial<EditableCampaign>) {
  store.set((current) => ({ ...current, campaigns: { ...current.campaigns, [id]: { ...current.campaigns[id], ...patch } } }));
}

const contact = (index: number) => contactCards[index].value;

export const defaultBusiness: BusinessSettings = {
  name: business.name,
  location: contact(2),
  hours: contact(3),
  email: contact(1).en,
  phone: contact(0).en,
};

export function useBusinessSettings(): BusinessSettings {
  return store.useValue().business ?? defaultBusiness;
}

export const saveBusinessSettings = (settings: BusinessSettings) => store.set((current) => ({ ...current, business: settings }));
