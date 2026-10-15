"use client";

import { useMemo } from "react";
import type { Campaign, MenuItem } from "@/data/types";
import type { Localized } from "@/i18n/config";
import { adminApi, type AdminMenuItem } from "@/lib/redux/api/adminApi";
import { store as reduxStore } from "@/lib/redux/store";
import {
  useGetAdminBusinessQuery,
  useGetAdminCampaignsQuery,
  useGetAdminMenuItemsQuery,
} from "@/lib/redux/api/adminApi";

export type ContentState = "published" | "draft";
export type EditableItem = MenuItem & { available: boolean; state: ContentState; isDraftNew?: boolean };

export type EditableCampaign = Campaign & {
  promotionId: string;
  title: Localized;
  text: Localized;
  cta: Localized;
  image: string;
  paused?: boolean;
  deleted?: boolean;
};

export type BusinessSettings = { name: Localized; location: Localized; hours: Localized; email: string; phone: string; owner: string };

const toEditableItem = (item: AdminMenuItem): EditableItem => ({
  ...item,
  available: item.available,
  state: item.state,
});

export function useMenuItems(): EditableItem[] {
  const { data } = useGetAdminMenuItemsQuery();
  return useMemo(() => (data ?? []).filter((item) => !item.deleted).map(toEditableItem), [data]);
}

export async function saveItem(item: EditableItem, state: ContentState): Promise<EditableItem> {
  const payload: Partial<AdminMenuItem> = {
    name: item.name,
    description: item.description,
    cartMeta: item.cartMeta,
    price: item.price,
    image: item.image,
    imageId: item.imageId,
    group: item.group,
    section: item.section,
    categories: item.categories,
    tags: item.tags,
    isNew: item.isNew,
    optionGroups: item.optionGroups,
    pairsWith: item.pairsWith,
    available: item.available,
  };

  const saved = item.isDraftNew
    ? await reduxStore.dispatch(adminApi.endpoints.createAdminMenuItem.initiate(payload)).unwrap()
    : await reduxStore
        .dispatch(adminApi.endpoints.updateAdminMenuItem.initiate({ slug: item.id, data: payload }))
        .unwrap();
  const published =
    state === "published"
      ? await reduxStore.dispatch(adminApi.endpoints.publishAdminMenuItem.initiate(saved.id)).unwrap()
      : saved;
  return toEditableItem(published);
}

function toEditableCampaign(campaign: Campaign): EditableCampaign {
  const id = campaign.id ?? campaign.promotionId;
  if (!id) throw new Error("The campaign response is missing its id.");
  return {
    ...campaign,
    promotionId: id,
    title: campaign.title ?? { en: "", fr: "" },
    text: campaign.text ?? { en: "", fr: "" },
    cta: campaign.cta ?? { en: "", fr: "" },
    image: campaign.image ?? "",
    paused: campaign.paused ?? campaign.status === "paused",
    status: campaign.status === "paused" ? "published" : campaign.status,
  };
}

export function useCampaigns(): EditableCampaign[] {
  const { data } = useGetAdminCampaignsQuery();
  return useMemo(() => (data ?? []).map(toEditableCampaign), [data]);
}

function campaignPayload(campaign: EditableCampaign): Partial<Campaign> {
  return {
    id: campaign.promotionId,
    tag: campaign.tag,
    placement: campaign.placement,
    ctaCategory: campaign.ctaCategory,
    title: campaign.title,
    text: campaign.text,
    cta: campaign.cta,
    image: campaign.image,
    imageId: campaign.imageId,
    startsAt: campaign.startsAt,
    endsAt: campaign.endsAt,
    schedule: campaign.schedule,
  };
}

export async function saveCampaign(campaign: EditableCampaign): Promise<EditableCampaign> {
  const api = adminApi.endpoints;
  const campaigns = api.getAdminCampaigns.select()(reduxStore.getState()).data ?? [];
  const alreadyExists = campaigns.some((entry) => (entry.id ?? entry.promotionId) === campaign.promotionId);
  const saved = alreadyExists
    ? await reduxStore
        .dispatch(
          api.updateAdminCampaign.initiate({
            slug: campaign.promotionId,
            data: campaignPayload(campaign),
          }),
        )
        .unwrap()
    : await reduxStore.dispatch(api.createAdminCampaign.initiate(campaignPayload(campaign))).unwrap();
  const shouldPublish = campaign.status !== "draft" && campaign.status !== "paused";
  const result = shouldPublish
    ? await reduxStore.dispatch(api.publishAdminCampaign.initiate(saved.id ?? campaign.promotionId)).unwrap()
    : saved;
  return toEditableCampaign(result);
}

export async function patchCampaign(id: string, patch: Partial<EditableCampaign>) {
  const api = adminApi.endpoints;
  if (patch.deleted) {
    await reduxStore.dispatch(api.deleteAdminCampaign.initiate(id)).unwrap();
    return;
  }
  if (patch.paused === true) {
    await reduxStore.dispatch(api.pauseAdminCampaign.initiate(id)).unwrap();
    return;
  }
  if (patch.paused === false) {
    await reduxStore.dispatch(api.resumeAdminCampaign.initiate(id)).unwrap();
    return;
  }
  if (patch.status === "draft" && patch.startsAt === undefined) {
    await reduxStore.dispatch(api.cancelScheduleAdminCampaign.initiate(id)).unwrap();
    return;
  }
  const existing = adminApi.endpoints.getAdminCampaigns
    .select()(reduxStore.getState())
    .data?.find((campaign) => (campaign.id ?? campaign.promotionId) === id);
  if (!existing) throw new Error(`Campaign "${id}" is not available in the API cache.`);
  const merged = { ...toEditableCampaign(existing), ...patch, promotionId: id };
  await reduxStore
    .dispatch(
      api.updateAdminCampaign.initiate({
        slug: id,
        data: campaignPayload(merged),
      }),
    )
    .unwrap();
}

export function useBusinessSettings() {
  const { data, isLoading, isError } = useGetAdminBusinessQuery();
  const settings = data
    ? {
        name: data.name,
        location: data.location ?? { en: "", fr: "" },
        hours: data.hours ?? { en: "", fr: "" },
        email: data.email ?? "",
        phone: data.phone ?? "",
        owner: data.owner ?? "",
      }
    : undefined;
  return { settings, isLoading, isError };
}

export async function saveBusinessSettings(settings: BusinessSettings) {
  const editable = {
    name: settings.name,
    location: settings.location,
    hours: settings.hours,
    email: settings.email,
    phone: settings.phone,
  };
  await reduxStore.dispatch(adminApi.endpoints.updateAdminBusiness.initiate(editable)).unwrap();
}
