"use client";

import { useMemo } from "react";
import type { AuditEvent, ContentGrant, StaffMember } from "@/data/types";
import { adminApi } from "@/lib/redux/api/adminApi";
import { store as reduxStore } from "@/lib/redux/store";
import { useGetAdminAuditQuery, useGetAdminManagersQuery } from "@/lib/redux/api/adminApi";

type ManagerPatch = Partial<Pick<StaffMember, "name" | "duty" | "assignment" | "status">> & {
  contentGrant?: ContentGrant | null;
};

export type DirectoryEntry = StaffMember;
export type AuditEntry = AuditEvent;

export function useManagers(): DirectoryEntry[] {
  const { data } = useGetAdminManagersQuery();
  return data ?? [];
}

export function useAudit(): AuditEntry[] {
  const { data } = useGetAdminAuditQuery(undefined);
  return useMemo(
    () => [...(data?.items ?? [])].sort((a, b) => Date.parse(b.at) - Date.parse(a.at)),
    [data],
  );
}

export async function updateManager(id: string, patch: ManagerPatch) {
  const endpoints = adminApi.endpoints;

  if (patch.status === "suspended") {
    await reduxStore.dispatch(endpoints.suspendManager.initiate(id)).unwrap();
  } else if (patch.status === "active") {
    await reduxStore.dispatch(endpoints.reactivateManager.initiate(id)).unwrap();
  }

  const { contentGrant, ...directPatch } = patch;
  delete directPatch.status;
  if (Object.keys(directPatch).length > 0) {
    await reduxStore
      .dispatch(endpoints.updateManager.initiate({ staffId: id, patch: directPatch }))
      .unwrap();
  }

  if (contentGrant === null) {
    await reduxStore.dispatch(endpoints.revokeManagerGrant.initiate(id)).unwrap();
  } else if (contentGrant) {
    await reduxStore
      .dispatch(
        endpoints.grantManager.initiate({
          staffId: id,
          scopes: contentGrant.scopes,
          startsAt: contentGrant.startsAt,
          expiresAt: contentGrant.expiresAt,
        }),
      )
      .unwrap();
  }
}

export async function inviteManager(
  member: Pick<StaffMember, "name" | "email" | "assignment">,
) {
  await reduxStore.dispatch(adminApi.endpoints.inviteManager.initiate(member)).unwrap();
}
