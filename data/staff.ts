import type { StaffMember } from "./types";

// Mock staff directory — will come from the backend.
// Content rights are never automatic: Eric holds a temporary grant from the superadmin.

export const staff: StaffMember[] = [
  {
    id: "rwasibo",
    name: "Rwasibo Alexis Junior",
    email: "owner@wowquickbites.rw",
    role: "superadmin",
    assignment: "none",
    duty: "on",
    status: "active",
  },
  {
    id: "eric",
    name: "Eric",
    email: "eric@wowquickbites.rw",
    role: "manager",
    assignment: "pickup-register",
    duty: "on",
    status: "active",
    contentGrant: {
      grantedBy: "rwasibo",
      scopes: ["food", "drinks", "labels", "ads", "publish"],
      startsAt: "2026-10-06T09:00:00+02:00",
      expiresAt: "2026-10-09T18:00:00+02:00",
    },
  },
  {
    id: "nadia",
    name: "Nadia",
    email: "nadia@wowquickbites.rw",
    role: "manager",
    assignment: "pickup-register",
    duty: "on",
    status: "active",
  },
  {
    id: "kevin",
    name: "Kevin",
    email: "kevin@wowquickbites.rw",
    role: "manager",
    assignment: "backup",
    duty: "off",
    status: "active",
  },
  {
    id: "chantal",
    name: "Chantal",
    email: "chantal@wowquickbites.rw",
    role: "manager",
    assignment: "none",
    duty: "off",
    status: "suspended",
  },
];

export const getStaff = (id: string) => staff.find((member) => member.id === id);

export const managers = staff.filter((member) => member.role === "manager");

export const superadmin = staff.find((member) => member.role === "superadmin")!;
