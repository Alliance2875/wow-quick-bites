"use client";

import { useRef, useState } from "react";
import { ActionButton } from "@/components/portal/ui/Action";
import { chipClasses, Input, SearchInput, Select, Toggle } from "@/components/portal/ui/Controls";
import Note from "@/components/portal/ui/Note";
import PageHeader from "@/components/portal/ui/PageHeader";
import { Eyebrow, Panel } from "@/components/portal/ui/Panel";
import { Badge } from "@/components/portal/ui/Status";
import { Table, TableFooter, Td, Th, THead, Tr } from "@/components/portal/ui/Table";
import { useToast } from "@/components/portal/ui/Toast";
import Icon from "@/components/shared/ui/Icon";
import { getStaff, superadmin } from "@/data/staff";
import type { ContentGrant, StaffMember } from "@/data/types";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { grantScopes, type GrantScope } from "@/lib/auth/roles";
import { cn, fill } from "@/lib/format";
import { isActiveWindow } from "@/lib/portal/clock";
import { formatDate, formatTime, fromKigaliInput, toKigaliInput } from "@/lib/portal/format";
import { isActiveOrder } from "@/lib/portal/orders";
import { useOrders } from "@/lib/portal/store";
import { inviteManager, updateManager, useAudit, useManagers, type DirectoryEntry } from "@/lib/portal/staff-store";
import { auditText } from "./audit";

type Filter = "all" | "active" | "suspended";
const scopeIds = Object.keys(grantScopes) as GrantScope[];

export default function ManagersWorkspace({
  lang,
  viewerId,
  initialManager,
  dict,
}: {
  lang: Locale;
  viewerId: string;
  initialManager?: string;
  dict: Pick<Dictionary, "portal" | "staff">;
}) {
  const t = dict.staff.managers;
  const p = dict.portal;
  const { show, toast } = useToast();
  const managers = useManagers();
  const orders = useOrders();
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(() => managers.find((m) => m.id === initialManager)?.id ?? managers[0].id);
  const inviteRef = useRef<HTMLInputElement>(null);
  const selected = managers.find((m) => m.id === selectedId) ?? managers[0];

  const activeOrders = (id: string) => orders.filter((o) => o.managerId === id && isActiveOrder(o)).length;
  const hasGrant = (m: StaffMember) => Boolean(m.contentGrant && isActiveWindow(m.contentGrant.startsAt, m.contentGrant.expiresAt));
  const scopeLine = (m: DirectoryEntry) =>
    m.invited ? t.scope.invited : m.status === "suspended" ? t.scope.none : hasGrant(m) ? t.scope.grant : t.scope.default;

  const q = query.trim().toLowerCase();
  const shown = managers
    .filter((m) => filter === "all" || m.status === filter)
    .filter((m) => !q || m.name.toLowerCase().includes(q) || p.assignment[m.assignment].toLowerCase().includes(q));
  const count = (f: Filter) => managers.filter((m) => f === "all" || m.status === f).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t.title}
        subtitle={t.subtitle}
        action={
          <ActionButton
            variant="primary"
            onClick={() => {
              inviteRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
              inviteRef.current?.focus({ preventScroll: true });
            }}
          >
            <Icon name="plus" className="h-4 w-4" /> {t.invite}
          </ActionButton>
        }
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {(["all", "active", "suspended"] as const).map((id) => (
            <button key={id} type="button" aria-pressed={filter === id} onClick={() => setFilter(id)} className={chipClasses(filter === id, "sm")}>
              {t.filters[id]} · {count(id)}
            </button>
          ))}
        </div>
        <SearchInput label={t.search} value={query} onChange={(e) => setQuery(e.target.value)} className="w-full sm:w-64" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_30.5rem]">
        <div className="min-w-0 space-y-6">
          <Panel title={t.directory} subtitle={t.directoryMeta} bodyClassName="">
            <Table minWidth="min-w-[38rem]">
              <THead>
                <Th>{t.columns.manager}</Th>
                <Th>{t.columns.assignment}</Th>
                <Th>{t.columns.status}</Th>
                <Th>{t.columns.orders}</Th>
                <Th>{t.columns.action}</Th>
              </THead>
              <tbody>
                {shown.map((m) => (
                  <Tr key={m.id} highlight={m.id === selected.id}>
                    <Td>
                      <p className="font-semibold">{m.name}</p>
                      <p className="mt-0.5 max-w-[9rem] text-[0.6875rem] leading-snug text-muted-foreground">{scopeLine(m)}</p>
                    </Td>
                    <Td>
                      {p.assignment[m.assignment]}
                      {m.status === "active" && m.assignment !== "none" && ` · ${p.duty[m.duty]}`}
                    </Td>
                    <Td className={cn("text-xs", m.status === "active" ? "text-success" : "text-critical")}>
                      {m.invited ? t.invited : p.staffStatus[m.status]}
                    </Td>
                    <Td className="tabular-nums">{activeOrders(m.id)}</Td>
                    <Td>
                      <ActionButton size="sm" variant={m.id === selected.id ? "strong" : "secondary"} onClick={() => setSelectedId(m.id)}>
                        {t.edit}
                      </ActionButton>
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
            <TableFooter>
              {fill(t.footer, {
                active: managers.filter((m) => m.status === "active").length,
                suspended: managers.filter((m) => m.status === "suspended").length,
              })}
            </TableFooter>
          </Panel>

          <InviteForm inputRef={inviteRef} viewerId={viewerId} dict={dict} onSent={show} />

          <Note title={t.suspendNote.title}>{t.suspendNote.text}</Note>
        </div>

        <ManagerEditor
          key={selected.id + JSON.stringify(selected.contentGrant ?? null) + selected.status}
          manager={selected}
          viewerId={viewerId}
          dict={dict}
          onSaved={show}
          hasGrant={hasGrant(selected)}
        />
      </div>

      <Matrix manager={selected} hasGrant={hasGrant(selected)} dict={dict} />
      <AccessAudit lang={lang} dict={dict} />
      {toast}
    </div>
  );
}

function InviteForm({
  inputRef,
  viewerId,
  dict,
  onSent,
}: {
  inputRef: React.RefObject<HTMLInputElement | null>;
  viewerId: string;
  dict: Pick<Dictionary, "portal" | "staff">;
  onSent: (message: string) => void;
}) {
  const t = dict.staff.managers.inviteForm;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [assignment, setAssignment] = useState<"pickup-register" | "backup">("pickup-register");

  return (
    <Panel title={t.title} subtitle={t.subtitle}>
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          inviteManager(
            { name: name.trim(), email: email.trim(), assignment },
            { actorId: viewerId, scope: "access", template: "invited", values: { email: email.trim() } },
          );
          onSent(fill(t.sent, { email: email.trim() }));
          setName("");
          setEmail("");
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-xs text-muted-foreground">{t.name}</span>
            <input
              ref={inputRef}
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.namePlaceholder}
              className="h-10 w-full rounded-md border border-border bg-field px-3 text-[0.8125rem] outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/25"
            />
          </label>
          <Input label={t.email} type="email" required placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <Select
          label={t.roleAssignment}
          value={assignment}
          options={(["pickup-register", "backup"] as const).map((id) => ({ value: id, label: t.roleOptions[id] }))}
          onChange={(e) => setAssignment(e.target.value as "pickup-register" | "backup")}
        />
        <Note title={t.noteTitle}>{t.note}</Note>
        <p className="text-[0.6875rem] text-muted-foreground">{t.starts}</p>
        <ActionButton type="submit" variant="primary">
          {t.send}
        </ActionButton>
      </form>
    </Panel>
  );
}

function ManagerEditor({
  manager,
  viewerId,
  dict,
  onSaved,
  hasGrant,
}: {
  manager: DirectoryEntry;
  viewerId: string;
  dict: Pick<Dictionary, "portal" | "staff">;
  onSaved: (message: string) => void;
  hasGrant: boolean;
}) {
  const t = dict.staff.managers.detail;
  const p = dict.portal;
  const [name, setName] = useState(manager.name);
  const [duty, setDuty] = useState(manager.duty);
  const [assignment, setAssignment] = useState(manager.assignment);
  const [scopes, setScopes] = useState<GrantScope[]>(manager.contentGrant?.scopes ?? []);
  const [expires, setExpires] = useState(manager.contentGrant ? Boolean(manager.contentGrant.expiresAt) : true);
  const [start, setStart] = useState(toKigaliInput(manager.contentGrant?.startsAt ?? "2026-10-06T09:00:00+02:00"));
  const [end, setEnd] = useState(toKigaliInput(manager.contentGrant?.expiresAt ?? "2026-10-09T18:00:00+02:00"));
  const suspended = manager.status === "suspended";
  const audit = (template: "managerSaved" | "suspend" | "reactivate" | "grant" | "revoke", values: Record<string, string> = {}) => ({
    actorId: viewerId,
    scope: "access" as const,
    targetId: manager.id,
    template,
    values,
  });

  const saveManager = () => {
    updateManager(
      manager.id,
      { name: name.trim() || manager.name, duty, assignment },
      audit("managerSaved", { assignment: p.assignment[assignment], duty: p.duty[duty] }),
    );
    onSaved(t.saved);
  };

  const toggleSuspension = () =>
    updateManager(
      manager.id,
      suspended ? { status: "active" } : { status: "suspended", duty: "off", assignment: "none", contentGrant: null },
      audit(suspended ? "reactivate" : "suspend"),
    );

  const grant = () => {
    if (!scopes.length) return revoke();
    const contentGrant: ContentGrant = {
      grantedBy: superadmin.id,
      scopes,
      startsAt: fromKigaliInput(start) ?? new Date().toISOString(),
      expiresAt: expires ? fromKigaliInput(end) : undefined,
    };
    const scopeNames = dict.staff.content.grant.scopes;
    updateManager(
      manager.id,
      { contentGrant },
      audit("grant", {
        scopes: scopes.map((scope) => scopeNames[scope]).join(", "),
        expiry: contentGrant.expiresAt
          ? fill(dict.staff.auditTemplates.until, { date: `${formatDate(contentGrant.expiresAt)}, ${formatTime(contentGrant.expiresAt)}` })
          : dict.staff.auditTemplates.noExpiry,
      }),
    );
    onSaved(fill(t.granted, { name: manager.name }));
  };

  const revoke = () => {
    updateManager(manager.id, { contentGrant: null }, audit("revoke"));
    setScopes([]);
    onSaved(fill(t.revoked, { name: manager.name }));
  };

  const permissionRow = (title: string, text: string, control: React.ReactNode) => (
    <div key={title} className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="text-[0.8125rem] font-semibold">{title}</p>
        <p className="mt-0.5 text-[0.6875rem] text-muted-foreground">{text}</p>
      </div>
      {control}
    </div>
  );

  return (
    <Panel
      title={fill(t.title, { name: manager.name })}
      subtitle={fill(t.meta, { status: p.staffStatus[manager.status], duty: p.duty[manager.duty] })}
      className="self-start"
    >
      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label={t.name} value={name} onChange={(e) => setName(e.target.value)} disabled={suspended} />
          <Select
            label={t.duty}
            value={duty}
            disabled={suspended}
            options={(["on", "off"] as const).map((id) => ({ value: id, label: p.duty[id] }))}
            onChange={(e) => setDuty(e.target.value as StaffMember["duty"])}
          />
        </div>
        <Select
          label={t.assignment}
          value={assignment}
          disabled={suspended}
          options={(["pickup-register", "backup", "none"] as const).map((id) => ({
            value: id,
            label: fill(t.assignmentOption, { assignment: p.assignment[id] }),
          }))}
          onChange={(e) => setAssignment(e.target.value as StaffMember["assignment"])}
        />
        <div className="flex flex-wrap gap-2">
          <ActionButton onClick={saveManager} disabled={suspended}>
            {t.save}
          </ActionButton>
          <ActionButton variant={suspended ? "primary" : "danger"} onClick={toggleSuspension}>
            {suspended ? t.reactivate : t.suspend}
          </ActionButton>
        </div>

        {suspended ? (
          <Note>{fill(t.suspendedNote, { name: manager.name })}</Note>
        ) : (
          <>
            <div className="space-y-4">
              <Eyebrow className="text-foreground">{t.defaults}</Eyebrow>
              {permissionRow(
                t.process.title,
                t.process.text,
                <span className="flex items-center gap-3">
                  <span className="text-[0.6875rem] text-muted-foreground">{t.defaultTag}</span>
                  <Toggle checked onChange={() => {}} label={t.process.title} labels={p.common} disabled />
                </span>,
              )}
            </div>

            <div className="space-y-4 border-t border-border pt-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[0.9375rem] font-semibold">{t.content}</p>
                <Badge tone={hasGrant ? "accent" : "muted"}>{hasGrant ? t.activeGrant : t.noGrant}</Badge>
              </div>
              {scopeIds.map((scope) =>
                permissionRow(
                  t.scopes[scope].title,
                  t.scopes[scope].text,
                  <Toggle
                    checked={scopes.includes(scope)}
                    onChange={(on) => setScopes((current) => (on ? [...current, scope] : current.filter((s) => s !== scope)))}
                    label={t.scopes[scope].title}
                    labels={p.common}
                  />,
                ),
              )}
            </div>

            <div className="space-y-4">
              <Eyebrow className="text-foreground">{t.window}</Eyebrow>
              <div className="flex gap-2" role="radiogroup" aria-label={t.window}>
                {[
                  { value: true, label: t.setExpiry },
                  { value: false, label: t.noExpiry },
                ].map((option) => (
                  <button
                    key={option.label}
                    type="button"
                    role="radio"
                    aria-checked={expires === option.value}
                    onClick={() => setExpires(option.value)}
                    className={cn(
                      "flex h-7 items-center gap-1.5 rounded-md px-2.5 text-[0.6875rem] font-semibold transition",
                      expires === option.value ? "bg-soft text-accent" : "border border-border text-foreground",
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className={cn("h-2 w-2 rounded-full", expires === option.value ? "bg-current" : "border border-current")}
                    />
                    {option.label}
                  </button>
                ))}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label={t.start} type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} />
                <Input label={t.expiry} type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} disabled={!expires} />
              </div>
              <p className="text-[0.8125rem] leading-relaxed">
                {fill(t.grantedBy, { name: getStaff(manager.contentGrant?.grantedBy ?? superadmin.id)?.name ?? "", role: hasGrant ? t.roleDelegate : t.roleDefault })}
              </p>
            </div>

            <Note title={t.lockTitle}>{fill(t.lockText, { name: manager.name })}</Note>

            <div className="flex flex-wrap gap-2">
              <ActionButton variant="primary" onClick={grant}>
                {t.grant}
              </ActionButton>
              <ActionButton variant="danger" onClick={revoke} disabled={!manager.contentGrant}>
                {t.revoke}
              </ActionButton>
            </div>
          </>
        )}
        <p className="text-[0.6875rem] leading-relaxed text-muted-foreground">{t.footnote}</p>
      </div>
    </Panel>
  );
}

function Matrix({ manager, hasGrant, dict }: { manager: DirectoryEntry; hasGrant: boolean; dict: Pick<Dictionary, "portal" | "staff"> }) {
  const t = dict.staff.managers.matrix;
  const v = t.values;
  const scopes = manager.contentGrant?.scopes ?? [];
  const granted = (...needed: GrantScope[]) =>
    manager.status === "suspended" ? v.suspended : hasGrant && needed.some((s) => scopes.includes(s)) ? v.granted : v.notAllowed;

  const rows = [
    { label: t.rows.content, admin: v.ownsAll, manager: v.notAllowed, selected: granted("food", "drinks") },
    { label: t.rows.labels, admin: v.ownsAll, manager: v.notAllowed, selected: granted("labels") },
    { label: t.rows.ads, admin: v.ownsAll, manager: v.notAllowed, selected: granted("ads", "publish") },
    { label: t.rows.orders, admin: v.viewAll, manager: v.assigned, selected: manager.status === "suspended" ? v.suspended : v.assigned },
    { label: t.rows.settings, admin: v.ownsAll, manager: v.notAllowed, selected: v.notAllowed },
    { label: t.rows.grants, admin: v.superadminOnly, manager: v.neverAllowed, selected: v.neverAllowed },
  ];

  return (
    <Panel title={t.title} subtitle={t.subtitle} bodyClassName="">
      <Table minWidth="min-w-[44rem]">
        <THead>
          <Th>{t.columns.capability}</Th>
          <Th>{t.columns.superadmin}</Th>
          <Th>{t.columns.manager}</Th>
          <Th>{fill(t.columns.selected, { name: manager.name })}</Th>
        </THead>
        <tbody>
          {rows.map((row) => (
            <Tr key={row.label}>
              <Td>{row.label}</Td>
              <Td>{row.admin}</Td>
              <Td className="text-muted-foreground">{row.manager}</Td>
              <Td className={row.selected === v.granted ? "text-accent" : row.selected === v.suspended ? "text-critical" : "text-muted-foreground"}>
                {row.selected}
              </Td>
            </Tr>
          ))}
        </tbody>
      </Table>
    </Panel>
  );
}

function AccessAudit({ lang, dict }: { lang: Locale; dict: Pick<Dictionary, "portal" | "staff"> }) {
  const t = dict.staff.managers.audit;
  const events = useAudit()
    .filter((event) => event.scope === "access")
    .slice(0, 8);

  return (
    <Panel title={t.title} subtitle={t.subtitle} bodyClassName="py-2">
      <ul>
        {events.map((event) => (
          <li key={event.id} className="grid gap-1 px-5 py-2.5 text-[0.8125rem] md:grid-cols-[11rem_16rem_minmax(0,1fr)] md:gap-6">
            <span className="text-[0.6875rem] text-muted-foreground md:text-xs">
              {formatDate(event.at)} · {formatTime(event.at)}
            </span>
            <span>
              {getStaff(event.actorId)?.name ?? event.actorId}
              {event.targetId && ` → ${getStaff(event.targetId)?.name ?? event.targetId}`}
            </span>
            <span>{auditText(event, lang, dict.staff.auditTemplates)}</span>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
