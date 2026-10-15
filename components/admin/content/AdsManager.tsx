"use client";

import Image from "next/image";
import { useState } from "react";
import { ActionButton } from "@/components/portal/ui/Action";
import BilingualField, { PreviewLanguage } from "@/components/portal/ui/BilingualField";
import { Input, Select } from "@/components/portal/ui/Controls";
import { Eyebrow, Panel } from "@/components/portal/ui/Panel";
import { Badge } from "@/components/portal/ui/Status";
import Icon from "@/components/shared/ui/Icon";
import type { Campaign, CategoryId } from "@/data/types";
import { localize, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { Permission } from "@/lib/auth/roles";
import { cn, fill, plural } from "@/lib/format";
import { portalNow } from "@/lib/portal/clock";
import { patchCampaign, saveCampaign, useCampaigns, type EditableCampaign } from "@/lib/portal/content-store";
import { formatDayMonth, formatTime, fromKigaliInput, toKigaliInput } from "@/lib/portal/format";
import { useGetCategoriesQuery } from "@/lib/redux/api/menuApi";
import ImageDrop from "./ImageDrop";

type Status = Campaign["status"] | "paused";

const blankCampaign = (): EditableCampaign => ({
  promotionId: "new-campaign",
  status: "draft",
  tag: "promotion",
  placement: "home-offers",
  ctaCategory: null,
  title: { en: "", fr: "" },
  text: { en: "", fr: "" },
  cta: { en: "", fr: "" },
  image: "",
});

export default function AdsManager({
  lang,
  viewer,
  dict,
}: {
  lang: Locale;
  viewer: { id: string; permissions: Permission[] };
  dict: Pick<Dictionary, "portal" | "staff">;
}) {
  const t = dict.staff.content.ads;
  const c = dict.staff.content;
  const { data: categories = [] } = useGetCategoriesQuery();
  const canPublish = viewer.permissions.includes("content:publish");
  const campaigns = useCampaigns();
  const [draftOverride, setDraft] = useState<EditableCampaign | null>(null);
  const draft = draftOverride ?? campaigns[0] ?? blankCampaign();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState(false);
  // Storefront preview language: independent of the portal language
  const [previewLang, setPreviewLang] = useState<Locale>(lang);
  const bilingual = { same: c.editor.sameText, languages: c.editor.languages };

  const status = (campaign: EditableCampaign): Status => (campaign.paused ? "paused" : campaign.status);
  const destination = (category: CategoryId | null) =>
    category
      ? fill(t.menuCategory, {
          category: localize(categories.find((item) => item.id === category)?.name ?? { en: category, fr: category }, lang),
        })
      : t.wholeMenu;

  const update = (patch: Partial<EditableCampaign>) => {
    setDraft((current) => ({ ...(current ?? draft), ...patch }));
    setMessage(null);
  };

  const save = async (publish: boolean) => {
    const later = Boolean(draft.startsAt && Date.parse(draft.startsAt) > portalNow());
    // A language left empty shows the other one until it is translated
    const both = (text: { en: string; fr: string }) => ({ en: text.en.trim() || text.fr, fr: text.fr.trim() || text.en });
    const campaign: EditableCampaign = {
      ...draft,
      title: both(draft.title),
      text: both(draft.text),
      cta: both(draft.cta),
      status: publish ? (later ? "scheduled" : "published") : "draft",
      paused: false,
    };
    setError(false);
    try {
      const saved = await saveCampaign(campaign);
      setDraft(saved);
      setMessage(publish ? c.editor.publishedToast : c.editor.saved);
    } catch {
      setError(true);
      setMessage(c.editor.saveError);
    }
  };

  const addAd = () => {
    const template = campaigns[0] ?? blankCampaign();
    setDraft({
      ...template,
      promotionId: `campaign-${Date.now().toString(36)}`,
      status: "draft",
      title: { en: "", fr: "" },
      text: { en: "", fr: "" },
      startsAt: undefined,
      endsAt: undefined,
      schedule: undefined,
      paused: false,
    });
    setMessage(null);
    setError(false);
  };

  const updateCampaign = async (id: string, patch: Partial<EditableCampaign>) => {
    setError(false);
    try {
      await patchCampaign(id, patch);
      setMessage(t.updated);
    } catch {
      setError(true);
      setMessage(c.editor.saveError);
    }
  };

  const scheduleLine = (campaign: EditableCampaign) =>
    campaign.status === "scheduled" && campaign.startsAt
      ? fill(t.scheduledFrom, { date: `${formatDayMonth(campaign.startsAt)}, ${formatTime(campaign.startsAt)}` })
      : fill(t.placementLine, { schedule: campaign.schedule ? localize(campaign.schedule, lang) : t.notScheduled });

  const title = localize(draft.title, lang) || draft.title.en || draft.title.fr;
  const previewTitle = localize(draft.title, previewLang) || title;
  const categoryOptions = [
    { value: "", label: t.wholeMenu },
    ...categories.map((x) => ({ value: x.id, label: fill(t.menuCategory, { category: localize(x.name, lang) }) })),
  ];

  return (
    <section aria-labelledby="ads-title" className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="ads-title" className="text-xl">
            {t.title}
          </h2>
          <p className="mt-1 text-[0.8125rem] text-muted-foreground">{t.subtitle}</p>
        </div>
        <ActionButton variant="primary" onClick={addAd}>
          <Icon name="plus" className="h-4 w-4" /> {t.add}
        </ActionButton>
      </div>

      <div className="grid gap-5 lg:grid-cols-[17.5rem_minmax(0,1fr)] xl:grid-cols-[17.5rem_minmax(0,1fr)_21rem]">
        <Panel title={t.list} subtitle={plural(t.listMeta, campaigns.length)} bodyClassName="">
          <ul>
            {campaigns.map((campaign) => {
              const selected = campaign.promotionId === draft.promotionId;
              const s = status(campaign);
              return (
                <li key={campaign.promotionId} className={cn("border-t border-border p-4 first:border-t-0", selected && "bg-soft")}>
                  <Image
                    src={campaign.image}
                    alt=""
                    width={496}
                    height={180}
                    sizes="248px"
                    unoptimized={campaign.image.startsWith("blob:")}
                    className="h-[5.5rem] w-full rounded-md object-cover"
                  />
                  <p className="mt-3 text-[0.8125rem] font-semibold">{localize(campaign.title, lang) || t.editorNew}</p>
                  <p className="mt-1 text-[0.6875rem] text-muted-foreground">{scheduleLine(campaign)}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Badge tone={s === "published" ? "success" : s === "scheduled" ? "accent" : "muted"} className="mr-auto">
                      {t.status[s]}
                    </Badge>
                    <div className="flex gap-2">
                    {s === "published" && (
                      <ActionButton
                        size="sm"
                        onClick={() => {
                          void updateCampaign(campaign.promotionId, { paused: true });
                        }}
                      >
                        {t.pause}
                      </ActionButton>
                    )}
                    {s === "paused" && (
                      <ActionButton
                        size="sm"
                        onClick={() => {
                          void updateCampaign(campaign.promotionId, { paused: false });
                        }}
                      >
                        {t.resume}
                      </ActionButton>
                    )}
                    {s === "draft" && (
                      <ActionButton
                        size="sm"
                        onClick={() => {
                          void updateCampaign(campaign.promotionId, { deleted: true }).then(() => {
                            if (selected) setDraft(null);
                          });
                        }}
                      >
                        {t.delete}
                      </ActionButton>
                    )}
                    {s === "scheduled" && (
                      <ActionButton
                        size="sm"
                        onClick={() => {
                          void updateCampaign(campaign.promotionId, { status: "draft", startsAt: undefined });
                        }}
                      >
                        {t.cancel}
                      </ActionButton>
                    )}
                    <ActionButton
                      size="sm"
                      variant={selected ? "strong" : "secondary"}
                      onClick={() => {
                        setDraft(campaign);
                        setMessage(null);
                      }}
                    >
                      {t.edit}
                    </ActionButton>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
          <p className="border-t border-border px-5 py-4 text-[0.6875rem] leading-relaxed text-muted-foreground">{t.listNote}</p>
        </Panel>

        <Panel title={draft.status === "draft" && !title ? t.editorNew : t.editor} subtitle={title || undefined}>
          <div className="space-y-4">
            <ImageDrop
              image={draft.image}
              alt={title}
              title={t.asset}
              labels={{
                drop: c.editor.drop,
                upload: c.editor.upload,
                uploading: c.editor.uploading,
                uploadError: c.editor.uploadError,
                invalid: c.editor.invalidImage,
              }}
              onImage={(image, imageId) => update({ image, imageId })}
            />
            {/* key: the "same text" choice is read again for each ad */}
            <BilingualField key={`${draft.promotionId}-title`} label={t.headline} value={draft.title} onChange={(title) => update({ title })} labels={bilingual} />
            <BilingualField
              key={`${draft.promotionId}-text`}
              label={t.copy}
              value={draft.text}
              onChange={(text) => update({ text })}
              labels={bilingual}
              multiline
            />
            <BilingualField key={`${draft.promotionId}-cta`} label={t.cta} value={draft.cta} onChange={(cta) => update({ cta })} labels={bilingual} />
            <p className="text-[0.6875rem] text-muted-foreground">{c.editor.languageNote}</p>
            <Select
              label={t.tag}
              value={draft.tag}
              options={(["promotion", "new", "offer"] as const).map((tag) => ({ value: tag, label: t.tags[tag] }))}
              onChange={(e) => update({ tag: e.target.value as Campaign["tag"] })}
            />
            <Select
              label={t.destination}
              value={draft.ctaCategory ?? ""}
              options={categoryOptions}
              onChange={(e) => update({ ctaCategory: (e.target.value || null) as CategoryId | null })}
            />
            <Select
              label={t.placement}
              value={draft.placement}
              options={(["home-offers", "home-hero"] as const).map((id) => ({ value: id, label: t.placements[id] }))}
              onChange={(e) => update({ placement: e.target.value as Campaign["placement"] })}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label={t.start}
                type="datetime-local"
                value={toKigaliInput(draft.startsAt)}
                onChange={(e) => update({ startsAt: fromKigaliInput(e.target.value) })}
              />
              <Input
                label={t.end}
                type="datetime-local"
                value={toKigaliInput(draft.endsAt)}
                onChange={(e) => update({ endsAt: fromKigaliInput(e.target.value) })}
              />
            </div>
            <p className="text-[0.6875rem] text-muted-foreground">{t.publishRule}</p>
            <div className="flex flex-wrap gap-2">
              <ActionButton onClick={() => save(false)}>{t.saveDraft}</ActionButton>
              <ActionButton variant="primary" onClick={() => save(true)} disabled={!canPublish}>
                {t.publish}
              </ActionButton>
            </div>
            {message && (
              <p role={error ? "alert" : "status"} className={cn("text-xs", error ? "text-critical" : "text-success")}>
                {message}
              </p>
            )}
          </div>
        </Panel>

        <div className="min-w-0 lg:col-span-2 xl:col-span-1">
          <div className="mb-3 flex items-center justify-between gap-3">
            <Eyebrow className="text-foreground">{c.preview.offer}</Eyebrow>
            <PreviewLanguage value={previewLang} onChange={setPreviewLang} label={c.editor.previewIn} labels={c.editor.languages} />
          </div>
          <article className="max-w-sm overflow-hidden rounded-2xl border border-border bg-card">
            <div className="relative aspect-[3/2]">
              {draft.image && (
                <Image
                  src={draft.image}
                  alt={previewTitle}
                  fill
                  sizes="(min-width: 1280px) 21rem, 24rem"
                  unoptimized={draft.image.startsWith("blob:")}
                  className="object-cover"
                />
              )}
            </div>
            <div className="p-5">
              <Badge>{t.tags[draft.tag]}</Badge>
              <h3 className="mt-3 text-xl font-semibold">{previewTitle || t.editorNew}</h3>
              <p className="mt-2 text-[0.8125rem] leading-relaxed text-muted-foreground">{localize(draft.text, previewLang)}</p>
              <span className="mt-4 inline-flex rounded-md bg-primary px-4 py-2.5 text-[0.8125rem] font-bold text-primary-foreground">
                {localize(draft.cta, previewLang)}
              </span>
            </div>
          </article>
          <p className="mt-3 max-w-sm text-[0.6875rem] leading-relaxed text-muted-foreground">
            {fill(c.preview.offerNote, { placement: t.placements[draft.placement], destination: destination(draft.ctaCategory) })}
          </p>
        </div>
      </div>
    </section>
  );
}
