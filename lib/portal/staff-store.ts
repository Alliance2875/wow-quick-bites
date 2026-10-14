"use client";

import { useMemo } from "react";
import { auditEvents } from "@/data/audit";
import { managers as sampleManagers } from "@/data/staff";
import type { AuditEvent, ContentGrant, StaffMember } from "@/data/types";
import type { Localized } from "@/i18n/config";
import type { StaffDict } from "@/i18n/dictionaries/en/staff";
import { createStore } from "@/lib/create-store";
import { portalNow } from "./clock";

// MOCK staff administration until the backend exists: manager edits, invitations, grants and the
// audit events they produce, kept in this browser. Replace with the staff API (PATCH /managers/:id,
// POST /invitations, GET /audit). Sign-in access still follows the server directory (data/staff.ts).

type ManagerPatch = Partial<Pick<StaffMember, "name" | "duty" | "assignment" | "status">> & {
  /** null = grant revoked */
  contentGrant?: ContentGrant | null;
};

/** Event recorded in the demo: rendered from a dictionary template, so it reads well in EN and FR. */
export type LiveAudit = Omit<AuditEvent, "text"> & {
  template: keyof StaffDict["auditTemplates"];
  values: Record<string, string | number | Localized>;
};

export type AuditEntry = AuditEvent | LiveAudit;

type NewAudit = Omit<LiveAudit, "id" | "at">;

type State = {
  managers: Record<string, ManagerPatch>;
  invited: StaffMember[];
  audit: LiveAudit[];
};

const store = createStore<State>("wqb-staff", { managers: {}, invited: [], audit: [] });

const nextTime = (state: State) => new Date(portalNow() + (state.audit.length + 1) * 60_000).toISOString();

export type DirectoryEntry = StaffMember & { invited?: boolean };

export function useManagers(): DirectoryEntry[] {
  const { managers, invited } = store.useValue();
  return useMemo(
    () => [
      ...sampleManagers.map((member) => {
        const { contentGrant, ...patch } = managers[member.id] ?? {};
        return {
          ...member,
          ...patch,
          contentGrant: contentGrant === null ? undefined : (contentGrant ?? member.contentGrant),
        };
      }),
      ...invited.map((member) => ({ ...member, invited: true })),
    ],
    [managers, invited],
  );
}

export function useAudit(): AuditEntry[] {
  const { audit } = store.useValue();
  return useMemo(() => ([...audit, ...auditEvents] as AuditEntry[]).sort((a, b) => Date.parse(b.at) - Date.parse(a.at)), [audit]);
}

/** Saves a manager change and records it in the audit trail. */
export function updateManager(
  id: string,
  patch: ManagerPatch,
  audit: NewAudit,
) {
  store.set((state) => ({
    ...state,
    managers: { ...state.managers, [id]: { ...state.managers[id], ...patch } },
    audit: [{ ...audit, id: `live-${state.audit.length + 1}`, at: nextTime(state) }, ...state.audit],
  }));
}

export function inviteManager(member: Pick<StaffMember, "name" | "email" | "assignment">, audit: NewAudit) {
  store.set((state) => ({
    ...state,
    invited: [
      ...state.invited,
      { ...member, id: `invite-${state.invited.length + 1}`, role: "manager", duty: "off", status: "active" },
    ],
    audit: [{ ...audit, id: `live-${state.audit.length + 1}`, at: nextTime(state) }, ...state.audit],
  }));
}

/** Content changes (drafts, publications) are audited too. */
export function recordAudit(audit: NewAudit) {
  store.set((state) => ({
    ...state,
    audit: [{ ...audit, id: `live-${state.audit.length + 1}`, at: nextTime(state) }, ...state.audit],
  }));
}
