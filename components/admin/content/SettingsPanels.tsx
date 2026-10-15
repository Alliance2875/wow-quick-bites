"use client";

import { useState } from "react";
import { ActionButton, ActionLink } from "@/components/portal/ui/Action";
import BilingualField from "@/components/portal/ui/BilingualField";
import { Input } from "@/components/portal/ui/Controls";
import Note from "@/components/portal/ui/Note";
import { Eyebrow, Panel } from "@/components/portal/ui/Panel";
import { Badge } from "@/components/portal/ui/Status";
import { Table, Td, Th, THead, Tr } from "@/components/portal/ui/Table";
import type { GrantScope } from "@/lib/auth/roles";
import { localize, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { fill } from "@/lib/format";
import { saveBusinessSettings, useBusinessSettings, type BusinessSettings } from "@/lib/portal/content-store";
import { formatDate, formatDayMonth, formatTime } from "@/lib/portal/format";
import { updateManager, useAudit, useManagers } from "@/lib/portal/staff-store";
import { localePath, routes } from "@/lib/routes";
import { auditText } from "../audit";

type Dict = Pick<Dictionary, "portal" | "staff">;

export function BusinessPanel({ lang, dict }: { lang: Locale; dict: Dict }) {
  const t = dict.staff.content.business;
  const { settings, isLoading, isError } = useBusinessSettings();
  const [editing, setEditing] = useState<BusinessSettings | null>(null);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState(false);

  const editor = dict.staff.content.editor;
  // Business texts in both languages at once, whatever the portal language
  const field = (key: "name" | "location" | "hours") => ({
    value: editing![key],
    onChange: (value: BusinessSettings[typeof key]) => setEditing({ ...editing!, [key]: value }),
    labels: { same: editor.sameText, languages: editor.languages },
    required: true,
  });

  return (
    <Panel id="business" title={t.title} subtitle={t.subtitle}>
      {editing ? (
        <form
          className="space-y-4"
          onSubmit={async (event) => {
            event.preventDefault();
            setSaveError(false);
            try {
              await saveBusinessSettings(editing);
              setEditing(null);
              setSaved(true);
            } catch {
              setSaveError(true);
            }
          }}
        >
          <p className="text-[0.8125rem] font-semibold">{t.editTitle}</p>
          <BilingualField label={t.name} {...field("name")} />
          <div className="grid gap-4 sm:grid-cols-2">
            <BilingualField label={t.location} {...field("location")} />
            <BilingualField label={t.hours} {...field("hours")} />
            <Input label={t.email} type="email" required value={editing.email} onChange={(e) => setEditing({ ...editing, email: e.target.value })} />
            <Input label={t.phone} type="tel" required value={editing.phone} onChange={(e) => setEditing({ ...editing, phone: e.target.value })} />
          </div>
          <div className="flex gap-2">
            <ActionButton type="submit" variant="primary">
              {t.save}
            </ActionButton>
            <ActionButton onClick={() => setEditing(null)}>{dict.portal.common.cancel}</ActionButton>
          </div>
          {saveError && <p role="alert" className="text-xs text-critical">{t.saveError}</p>}
        </form>
      ) : !settings ? (
        <p role={isError ? "alert" : "status"} aria-busy={isLoading} className="text-sm text-muted-foreground">
          {isError ? t.loadError : t.loading}
        </p>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2.5 text-[0.8125rem]">
              <Eyebrow>{t.business}</Eyebrow>
              <p className="font-semibold">{localize(settings.name, lang)}</p>
              <p>{fill(t.owner, { name: settings.owner })}</p>
              <p>{localize(settings.location, lang)}</p>
              <p>{localize(settings.hours, lang)}</p>
            </div>
            <div className="space-y-2.5 text-[0.8125rem]">
              <Eyebrow>{t.contact}</Eyebrow>
              <p>{settings.email}</p>
              <p>{settings.phone}</p>
              <p className="text-[0.6875rem] leading-relaxed text-muted-foreground">{t.phoneNote}</p>
            </div>
          </div>
          <Note title={t.codesTitle} className="mt-5">
            {t.codesText}
          </Note>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <ActionButton
              onClick={() => {
                setEditing(settings);
                setSaved(false);
              }}
            >
              {t.edit}
            </ActionButton>
            {saved && (
              <p role="status" className="text-xs text-success">
                {t.saved}
              </p>
            )}
          </div>
        </>
      )}
    </Panel>
  );
}

export function PublishingPanel({ lang, dict }: { lang: Locale; dict: Dict }) {
  const t = dict.staff.content.publishing;
  const scopes = dict.staff.content.grant.scopes;
  const delegates = useManagers().filter((m) => m.contentGrant && m.status === "active");
  const [error, setError] = useState(false);

  return (
    <Panel title={t.title} subtitle={t.subtitle}>
      {delegates.length === 0 && <p className="text-[0.8125rem] text-muted-foreground">{t.none}</p>}
      <div className="space-y-6">
        {delegates.map((manager) => {
          const grant = manager.contentGrant!;
          const values = {
            grantor: grant.grantedBy,
            scopes: grant.scopes.map((scope: GrantScope) => scopes[scope]).join(" · "),
            expiry: grant.expiresAt ? `${formatDate(grant.expiresAt)}, ${formatTime(grant.expiresAt)}` : "",
          };
          return (
            <div key={manager.id}>
              <div className="flex items-center justify-between gap-3">
                <p className="text-[0.8125rem] font-semibold">
                  {manager.name} · {dict.portal.roles.manager}
                </p>
                <Badge>{t.temporary}</Badge>
              </div>
              <p className="mt-3 text-[0.8125rem] leading-relaxed">{fill(grant.expiresAt ? t.granted : t.grantedNoExpiry, values)}</p>
              <p className="mt-3 text-[0.6875rem] leading-relaxed text-muted-foreground">{t.others}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <ActionLink href={`${localePath(lang, routes.adminManagers)}?manager=${manager.id}`} variant="primary">
                  {fill(t.manage, { name: manager.name })}
                </ActionLink>
                <ActionButton
                  variant="danger"
                  onClick={async () => {
                    setError(false);
                    try {
                      await updateManager(manager.id, { contentGrant: null });
                    } catch {
                      setError(true);
                    }
                  }}
                >
                  {t.revoke}
                </ActionButton>
              </div>
              {error && <p role="alert" className="mt-4 text-xs text-critical">{t.error}</p>}
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

export function AuditPanel({ lang, dict }: { lang: Locale; dict: Dict }) {
  const t = dict.staff.content.audit;
  const audit = useAudit().slice(0, 8);

  return (
    <Panel id="audit" title={t.title} subtitle={t.subtitle} bodyClassName="">
      <Table minWidth="min-w-[40rem]">
        <THead>
          <Th className="w-36">{t.columns.time}</Th>
          <Th>{t.columns.event}</Th>
          <Th className="w-52">{t.columns.actor}</Th>
        </THead>
        <tbody>
          {audit.map((event) => (
            <Tr key={event.id}>
              <Td className="whitespace-nowrap text-muted-foreground">
                {formatDayMonth(event.at)} · {formatTime(event.at)}
              </Td>
              <Td>
                {event.targetId && `${event.targetId} · `}
                {auditText(event, lang)}
              </Td>
              <Td>{event.actorId}</Td>
            </Tr>
          ))}
        </tbody>
      </Table>
    </Panel>
  );
}
