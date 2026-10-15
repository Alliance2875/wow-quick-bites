"use client";

import { useRouter } from "next/navigation";
import { useActionState, useState } from "react";
import { ActionLink } from "@/components/portal/ui/Action";
import { Input } from "@/components/portal/ui/Controls";
import PageHeader from "@/components/portal/ui/PageHeader";
import { Panel } from "@/components/portal/ui/Panel";
import { StagePill } from "@/components/portal/ui/Status";
import Icon from "@/components/shared/ui/Icon";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { updateProfileAction, type ProfileState } from "@/lib/auth/actions";
import { updateSession, useSession } from "@/lib/auth/session";
import { useHydrated } from "@/lib/create-store";
import { cn, fill, formatPrice } from "@/lib/format";
import { formatDayMonth } from "@/lib/portal/format";
import { isActiveOrder, newestFirst, orderLines, orderTotal } from "@/lib/portal/orders";
import { useOrders } from "@/lib/portal/store";
import { localePath, routes } from "@/lib/routes";

type Props = {
  lang: Locale;
  viewer: { name: string; clientCode: string };
  dict: Pick<Dictionary, "portal" | "clientArea">;
};

/** Client profile (design "My Profile"): identity card, personal information with edit, code and orders overview. */
export default function ClientProfile({ lang, viewer, dict }: Props) {
  const t = dict.clientArea.profile;
  const p = dict.portal;
  const router = useRouter();
  const hydrated = useHydrated();
  // Email and phone come from the display copy of the profile (the session cookie holds neither)
  const session = useSession();
  const name = viewer.name;
  const email = hydrated ? session?.email : undefined;
  const phone = hydrated ? session?.phone : undefined;
  const [editing, setEditing] = useState(false);

  const [state, action, pending] = useActionState(async (previous: ProfileState, form: FormData) => {
    const result = await updateProfileAction(previous, form);
    if (result && "saved" in result) {
      updateSession(result.saved);
      setEditing(false);
      // The sidebar and the greeting read the name from the session cookie
      router.refresh();
    }
    return result;
  }, undefined);

  const orders = useOrders()
    .filter((order) => order.clientCode === viewer.clientCode)
    .sort(newestFirst);
  const overview = [orders.find(isActiveOrder), orders.find((o) => !isActiveOrder(o))].filter((o) => o !== undefined);
  const firstName = name.split(" ")[0];

  const rows = [
    { label: t.fullName, value: name },
    { label: t.phone, value: phone || <span className="text-muted-foreground">{t.notSet}</span> },
    { label: t.email, value: email || "—" },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl space-y-7">
      <PageHeader title={t.title} subtitle={t.subtitle} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="min-w-0 space-y-6">
          <Panel>
            <div className="flex flex-wrap items-center gap-6 py-2 sm:px-2">
              <span
                aria-hidden="true"
                className="grid h-24 w-24 shrink-0 place-items-center rounded-full bg-primary text-4xl font-bold text-primary-foreground"
              >
                {name.charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0 space-y-2.5">
                <p className="text-lg font-bold">{name}</p>
                <span className="inline-flex rounded-full bg-soft px-3 py-0.5 text-[0.6875rem] font-medium text-accent">
                  {t.clientAccount}
                </span>
                {email && (
                  <p className="flex items-center gap-2.5 text-xs">
                    <Icon name="mail" className="h-4 w-4 shrink-0" /> <span className="break-all">{email}</span>
                  </p>
                )}
                {phone && (
                  <p className="flex items-center gap-2.5 text-xs">
                    <Icon name="phone" className="h-4 w-4 shrink-0" /> {phone}
                  </p>
                )}
              </div>
            </div>
          </Panel>

          <Panel>
            <div className="sm:px-6 sm:py-3">
              <h2 className="flex items-center gap-4 text-xl font-semibold">
                <Icon name="user" className="h-7 w-7 text-accent" /> {t.personal}
              </h2>

              {editing ? (
                <form action={action} className="mt-6 max-w-xl space-y-4">
                  <Input label={t.fullName} name="name" defaultValue={name} autoComplete="name" required />
                  <Input
                    label={t.phone}
                    name="phone"
                    type="tel"
                    defaultValue={phone}
                    placeholder={t.phonePlaceholder}
                    autoComplete="tel"
                    required
                  />
                  <Input label={t.email} value={email ?? ""} readOnly disabled />
                  <p className="-mt-2 text-[0.6875rem] text-muted-foreground">{t.emailNote}</p>
                  {state && "error" in state && (
                    <p role="alert" className="text-xs text-critical">
                      {t.errors[state.error]}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2 pt-2">
                    <button
                      type="submit"
                      disabled={pending}
                      className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-6 font-semibold text-primary-foreground transition hover:brightness-110 disabled:opacity-60"
                    >
                      {pending ? t.saving : t.save}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditing(false)}
                      className="h-11 rounded-full border border-border px-6 text-sm transition hover:border-primary/60"
                    >
                      {t.cancel}
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <dl className="mt-7 space-y-6 sm:pl-12">
                    {rows.map((row) => (
                      <div key={row.label} className="grid gap-1 sm:grid-cols-[10rem_minmax(0,1fr)]">
                        <dt>{row.label}</dt>
                        <dd className="break-words">{row.value}</dd>
                      </div>
                    ))}
                  </dl>
                  {state && "saved" in state && (
                    <p role="status" className="mt-5 text-xs text-success sm:pl-12">
                      {t.saved}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    className="mt-8 inline-flex h-12 items-center gap-3 rounded-full bg-primary px-8 text-base font-semibold text-primary-foreground transition hover:brightness-110 sm:ml-12"
                  >
                    <Icon name="pencil" className="h-5 w-5" /> {t.edit}
                  </button>
                </>
              )}
            </div>
          </Panel>
        </div>

        <div className="min-w-0 space-y-6">
          <Panel title={t.codeTitle}>
            <p className="rounded-lg bg-soft px-4 py-4 text-xl font-bold text-accent">{viewer.clientCode}</p>
            <p className="mt-4 text-xs text-muted-foreground">{t.codeText}</p>
          </Panel>

          <Panel>
            <h2 className="text-lg font-semibold">{fill(t.welcome, { name: firstName })}</h2>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{t.welcomeText}</p>
            <h3 className="mt-6 font-semibold">{t.overview}</h3>
            {overview.length === 0 && <p className="mt-3 text-xs text-muted-foreground">{t.noOrders}</p>}
            <div className="mt-4 space-y-6">
              {overview.map((order) => {
                const active = isActiveOrder(order);
                return (
                  <div key={order.id} className="space-y-3 text-[0.8125rem] sm:px-3">
                    <p className="flex flex-wrap items-center gap-3">
                      <StagePill stage={order.stage} label={p.stages[order.stage]} />
                      <span className="text-[0.6875rem] text-muted-foreground">
                        {order.id} · {formatDayMonth(order.placedAt)}
                      </span>
                    </p>
                    <ul>
                      {orderLines(order).map((line) => (
                        <li key={line.itemId}>
                          {line.quantity} × {line.item.name[lang]}
                        </li>
                      ))}
                    </ul>
                    <dl className="grid grid-cols-[7.5rem_minmax(0,1fr)] gap-y-2">
                      <dt className="text-xs text-muted-foreground">{active ? t.total : t.totalPaid}</dt>
                      <dd>{formatPrice(orderTotal(order))}</dd>
                      {active && (
                        <>
                          <dt className="text-xs text-muted-foreground">{t.payment}</dt>
                          <dd>
                            {p.payment[order.payment]} · {p.paymentStatus[order.paymentStatus]}
                          </dd>
                        </>
                      )}
                    </dl>
                    <ActionLink
                      href={localePath(lang, routes.accountOrder(order.id))}
                      variant={active ? "primary" : "secondary"}
                      className={cn(!active && "font-normal")}
                    >
                      {fill(active ? t.track : t.view, { id: order.id })} <Icon name="arrowRight" className="h-4 w-4" />
                    </ActionLink>
                  </div>
                );
              })}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
