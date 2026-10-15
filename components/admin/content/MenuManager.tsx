"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ActionButton } from "@/components/portal/ui/Action";
import BilingualField, { PreviewLanguage } from "@/components/portal/ui/BilingualField";
import { chipClasses, Input, SearchInput, Select, Toggle } from "@/components/portal/ui/Controls";
import { Eyebrow, Panel } from "@/components/portal/ui/Panel";
import Icon from "@/components/shared/ui/Icon";
import NewBadge from "@/components/shared/ui/NewBadge";
import Tag from "@/components/shared/ui/Tag";
import { tagLabel } from "@/data/tags";
import type { MenuGroup } from "@/data/types";
import { localize, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { Permission } from "@/lib/auth/roles";
import { cn, fill, formatPrice, plural } from "@/lib/format";
import { saveItem, useMenuItems, type EditableItem } from "@/lib/portal/content-store";
import { useGetCategoriesQuery, useGetDrinkSectionsQuery, useGetTagsQuery } from "@/lib/redux/api/menuApi";
import ImageDrop from "./ImageDrop";

type Filter = "all" | MenuGroup;
type Availability = "all" | "available" | "unavailable";

/** "food:burgers" / "drinks:smoothies" */
const categoryValue = (item: Pick<EditableItem, "group" | "categories" | "section">) =>
  item.group === "drinks" ? `drinks:${item.section ?? ""}` : `food:${item.categories[0] ?? ""}`;

const blankItem = (
  group: MenuGroup,
  firstFoodCategory?: string,
  firstDrinkSection?: string,
): EditableItem => ({
  id: "new-item",
  name: { en: "", fr: "" },
  description: { en: "", fr: "" },
  price: 0,
  image: "",
  group,
  section: group === "drinks" ? firstDrinkSection : undefined,
  categories: group === "drinks" ? ["drinks"] : firstFoodCategory ? [firstFoodCategory] : [],
  tags: [],
  available: true,
  state: "draft",
  isDraftNew: true,
});

export default function MenuManager({
  lang,
  viewer,
  dict,
}: {
  lang: Locale;
  viewer: { id: string; name: string; permissions: Permission[] };
  dict: Pick<Dictionary, "portal" | "staff">;
}) {
  const t = dict.staff.content;
  const p = dict.portal;
  const can = (permission: Permission) => viewer.permissions.includes(permission);
  const { data: categories = [], isError: categoriesError } = useGetCategoriesQuery();
  const { data: drinkSections = [], isError: sectionsError } = useGetDrinkSectionsQuery();
  const { data: tags = {}, isError: tagsError } = useGetTagsQuery();
  const foodCategories = categories.filter((category) => category.id !== "drinks");
  const items = useMenuItems();
  const [filter, setFilter] = useState<Filter>("all");
  const [availability, setAvailability] = useState<Availability>("all");
  const [query, setQuery] = useState("");
  const [draftOverride, setDraft] = useState<EditableItem | null>(null);
  const draft = draftOverride ?? items[0] ?? blankItem("food", foodCategories[0]?.id, drinkSections[0]?.id);
  const [message, setMessage] = useState<{ text: string; tone: "ok" | "error" } | null>(null);
  // Storefront preview language: independent of the portal language
  const [previewLang, setPreviewLang] = useState<Locale>(lang);
  const bilingual = { same: t.editor.sameText, languages: t.editor.languages };
  const list = useRef<HTMLUListElement>(null);

  // Show the item being edited inside the scrollable list (without scrolling the page)
  useEffect(() => {
    const box = list.current;
    const row = box?.querySelector<HTMLElement>('[aria-current="true"]');
    if (box && row) box.scrollTop = row.offsetTop - box.offsetTop - 8;
  }, [draft.id]);

  const groupName = (group: MenuGroup) => t.menu.groups[group];
  const categoryName = (item: EditableItem) =>
    item.group === "drinks"
      ? localize(drinkSections.find((s) => s.id === item.section)?.name ?? { en: groupName("drinks"), fr: groupName("drinks") }, lang)
      : localize(categories.find((c) => c.id === item.categories[0])?.name ?? { en: groupName("food"), fr: groupName("food") }, lang);

  const q = query.trim().toLowerCase();
  const shown = items
    .filter((item) => filter === "all" || item.group === filter)
    .filter((item) => availability === "all" || (availability === "available") === item.available)
    .filter((item) => !q || localize(item.name, lang).toLowerCase().includes(q));

  const options = [
    ...foodCategories.map((c) => ({ value: `food:${c.id}`, label: `${groupName("food")} / ${localize(c.name, lang)}` })),
    ...drinkSections.map((s) => ({ value: `drinks:${s.id}`, label: `${groupName("drinks")} / ${localize(s.name, lang)}` })),
  ];

  const update = (patch: Partial<EditableItem>) => {
    setDraft((current) => ({ ...(current ?? draft), ...patch }));
    setMessage(null);
  };

  const setCategory = (value: string) => {
    const [group, id] = value.split(":") as [MenuGroup, string];
    update(
      group === "drinks"
        ? { group, section: id, categories: ["drinks"] }
        : { group, section: undefined, categories: [id] },
    );
  };

  const addItem = (group: MenuGroup) => {
    const template =
      items.find((item) => item.group === group) ?? blankItem(group, foodCategories[0]?.id, drinkSections[0]?.id);
    setDraft({
      ...template,
      id: `draft-${Date.now().toString(36)}`,
      name: { en: "", fr: "" },
      description: { en: "", fr: "" },
      cartMeta: undefined,
      price: 0,
      tags: [],
      isNew: true,
      available: true,
      state: "draft",
      isDraftNew: true,
    });
    setMessage(null);
  };

  const save = async (state: "draft" | "published") => {
    if ((!draft.name.en.trim() && !draft.name.fr.trim()) || draft.price <= 0) {
      setMessage({ text: draft.price <= 0 ? t.editor.required : t.editor.requiredName, tone: "error" });
      return;
    }
    // A language left empty shows the other one until it is translated
    const both = (text: { en: string; fr: string }) => ({ en: text.en.trim() || text.fr, fr: text.fr.trim() || text.en });
    const item: EditableItem = { ...draft, name: both(draft.name), description: both(draft.description) };
    try {
      const saved = await saveItem(item, state);
      setDraft({ ...saved, isDraftNew: false, state });
      setMessage({ text: state === "published" ? t.editor.publishedToast : t.editor.saved, tone: "ok" });
    } catch {
      setMessage({ text: t.editor.saveError, tone: "error" });
    }
  };

  const name = localize(draft.name, lang) || draft.name.en || draft.name.fr || t.menu.newItem;
  const previewName = localize(draft.name, previewLang) || name;

  return (
    <section aria-labelledby="menu-title" className="space-y-5">
      {(categoriesError || sectionsError || tagsError) && (
        <p role="alert" className="text-sm text-critical">{t.editor.loadError}</p>
      )}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="menu-title" className="text-xl">
            {t.menu.title}
          </h2>
          <p className="mt-1 text-[0.8125rem] text-muted-foreground">{t.menu.subtitle}</p>
        </div>
        <div className="flex gap-2">
          <ActionButton onClick={() => addItem("food")}>
            <Icon name="plus" className="h-4 w-4" /> {t.menu.addFood}
          </ActionButton>
          <ActionButton variant="primary" onClick={() => addItem("drinks")}>
            <Icon name="plus" className="h-4 w-4" /> {t.menu.addDrink}
          </ActionButton>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {(["all", "food", "drinks"] as const).map((id) => (
            <button key={id} type="button" aria-pressed={filter === id} onClick={() => setFilter(id)} className={chipClasses(filter === id, "sm")}>
              {t.menu.filters[id]}
            </button>
          ))}
        </div>
        <div className="flex w-full flex-wrap gap-2 sm:w-auto">
          <SearchInput label={t.menu.search} value={query} onChange={(e) => setQuery(e.target.value)} className="w-full sm:w-60" />
          <label className="relative w-full sm:w-auto">
            <span className="sr-only">{t.menu.availability}</span>
            <select
              value={availability}
              onChange={(e) => setAvailability(e.target.value as Availability)}
              className="h-10 w-full cursor-pointer appearance-none rounded-md border border-border bg-panel pl-4 pr-9 text-[0.8125rem] outline-none focus:border-primary"
            >
              {(["all", "available", "unavailable"] as const).map((id) => (
                <option key={id} value={id}>
                  {t.menu.availabilityOptions[id]}
                </option>
              ))}
            </select>
            <Icon name="chevronDown" className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </label>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[17.5rem_minmax(0,1fr)] xl:grid-cols-[17.5rem_minmax(0,1fr)_21rem]">
        <Panel title={t.menu.list} subtitle={plural(t.menu.listMeta, shown.length)} bodyClassName="">
          <ul ref={list} className="relative max-h-[34rem] overflow-y-auto">
            {shown.map((item) => {
              const selected = item.id === draft.id;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setDraft(item);
                      setMessage(null);
                    }}
                    aria-current={selected ? "true" : undefined}
                    className={cn(
                      "w-full border-t border-border p-4 text-left transition first:border-t-0",
                      selected ? "bg-soft" : "hover:bg-panel-muted/60",
                    )}
                  >
                    <span className="flex items-center gap-3">
                      {item.image && <Image src={item.image} alt="" width={96} height={96} sizes="48px" className="h-12 w-12 shrink-0 rounded-md object-cover" />}
                      <span className="min-w-0">
                        <span className="block truncate text-[0.8125rem] font-semibold">{localize(item.name, lang) || t.menu.newItem}</span>
                        <span className="mt-0.5 block text-[0.6875rem] text-muted-foreground">
                          {groupName(item.group)} · {categoryName(item)}
                        </span>
                      </span>
                    </span>
                    <span className="mt-3 flex items-center justify-between text-[0.8125rem]">
                      {formatPrice(item.price)}
                      <span className={cn("flex items-center gap-1 text-[0.6875rem]", item.available ? "text-success" : "text-critical")}>
                        {item.available && <Icon name="check" className="h-3 w-3" strokeWidth={2.5} />}
                        {item.available ? t.menu.available : t.menu.unavailable}
                      </span>
                    </span>
                    <span className="mt-1.5 flex items-center justify-between text-[0.6875rem] text-muted-foreground">
                      {item.state === "draft" ? `${t.menu.draft}${item.isNew ? ` · ${t.menu.newOn}` : ""}` : t.menu.published}
                      <span className="flex items-center gap-1 font-semibold text-accent">
                        {t.menu.edit} <Icon name="arrowRight" className="h-3 w-3" />
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <p className="border-t border-border px-5 py-4 text-[0.6875rem] leading-relaxed text-muted-foreground">{t.menu.listNote}</p>
        </Panel>

        <Panel
          title={draft.isDraftNew ? t.editor.titleNew : t.editor.title}
          subtitle={fill(t.editor.meta, {
            name,
            state: draft.state === "draft" ? t.editor.stateDraft : t.editor.statePublished,
          })}
        >
          <div className="space-y-4">
            <ImageDrop
              image={draft.image}
              alt={name}
              title={t.editor.photo}
              labels={{
                drop: t.editor.drop,
                upload: t.editor.upload,
                uploading: t.editor.uploading,
                uploadError: t.editor.uploadError,
                invalid: t.editor.invalidImage,
              }}
              onImage={(image, imageId) => update({ image, imageId })}
            />
            {/* key: the "same text" choice is read again for each item */}
            <BilingualField key={`${draft.id}-name`} label={t.editor.name} value={draft.name} onChange={(value) => update({ name: value })} labels={bilingual} required />
            <BilingualField
              key={`${draft.id}-description`}
              label={t.editor.description}
              value={draft.description}
              onChange={(value) => update({ description: value })}
              labels={bilingual}
              multiline
            />
            <p className="text-[0.6875rem] text-muted-foreground">{t.editor.languageNote}</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Select label={t.editor.category} value={categoryValue(draft)} options={options} onChange={(e) => setCategory(e.target.value)} />
              <Input
                label={t.editor.price}
                type="number"
                inputMode="numeric"
                min={0}
                step={100}
                value={draft.price || ""}
                onChange={(e) => update({ price: Math.max(0, Math.round(Number(e.target.value))) })}
              />
            </div>

            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[0.8125rem] font-semibold">{t.editor.availableTitle}</p>
                <p className="mt-0.5 text-[0.6875rem] text-muted-foreground">{t.editor.availableText}</p>
              </div>
              <Toggle checked={draft.available} onChange={(available) => update({ available })} label={t.editor.availableTitle} labels={p.common} />
            </div>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[0.8125rem] font-semibold">{t.editor.newTitle}</p>
                <p className="mt-0.5 text-[0.6875rem] text-muted-foreground">
                  {can("labels:edit") ? t.editor.newText : t.editor.noLabels}
                </p>
              </div>
              <Toggle
                checked={Boolean(draft.isNew)}
                onChange={(isNew) => update({ isNew })}
                label={t.editor.newTitle}
                labels={p.common}
                disabled={!can("labels:edit")}
              />
            </div>

            <p className="text-[0.6875rem] text-muted-foreground">
              {fill(t.editor.owner, { name: viewer.name, role: p.roles.superadmin })}
            </p>
            <div className="flex flex-wrap gap-2">
              <ActionButton onClick={() => save("draft")}>{t.editor.saveDraft}</ActionButton>
              <ActionButton variant="primary" onClick={() => save("published")} disabled={!can("content:publish")}>
                {t.editor.publish}
              </ActionButton>
            </div>
            {!can("content:publish") && <p className="text-[0.6875rem] text-muted-foreground">{t.editor.noPublish}</p>}
            {message && (
              <p role="status" className={cn("text-xs", message.tone === "ok" ? "text-success" : "text-critical")}>
                {message.text}
              </p>
            )}
          </div>
        </Panel>

        <div className="min-w-0 lg:col-span-2 xl:col-span-1">
          <div className="mb-3 flex items-center justify-between gap-3">
            <Eyebrow className="text-foreground">{t.preview.card}</Eyebrow>
            <PreviewLanguage value={previewLang} onChange={setPreviewLang} label={t.editor.previewIn} labels={t.editor.languages} />
          </div>
          <article className="max-w-sm overflow-hidden rounded-2xl border border-border bg-card">
            <div className="relative aspect-[6/5]">
              {draft.image && (
              <Image
                src={draft.image}
                alt={previewName}
                fill
                sizes="(min-width: 1280px) 21rem, 24rem"
                unoptimized={draft.image.startsWith("blob:")}
                className={cn("object-cover", !draft.available && "grayscale")}
              />
              )}
              {draft.isNew && <NewBadge label={t.preview.new} className="absolute left-3 top-3" />}
            </div>
            <div className="space-y-2 p-5">
              <h3 className="text-lg font-semibold">{previewName}</h3>
              <p className="line-clamp-2 text-xs text-muted-foreground">{localize(draft.description, previewLang)}</p>
              <div className="flex flex-wrap gap-1">
                {draft.tags.map((tag) => (
                  <Tag key={tag}>{tagLabel(tag, previewLang, tags)}</Tag>
                ))}
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-lg font-bold text-accent">{formatPrice(draft.price)}</span>
                <span className={cn("rounded-md bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground", !draft.available && "opacity-40")}>
                  {t.preview.orderNow}
                </span>
              </div>
            </div>
          </article>
          <p className="mt-3 max-w-sm text-[0.6875rem] leading-relaxed text-muted-foreground">{t.preview.cardNote}</p>
        </div>
      </div>
    </section>
  );
}
