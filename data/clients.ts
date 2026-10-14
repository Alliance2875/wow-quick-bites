import type { Client } from "./types";

// Mock client accounts — will come from the backend. The client code never changes.

export const clients: Client[] = [
  { code: "WQB001A", name: "Aline", email: "aline@example.com", phone: "078 123 4567" },
  { code: "WQB002A", name: "Patrick", email: "patrick@example.com" },
  { code: "WQB003A", name: "Claude", email: "claude@example.com" },
  { code: "WQB004A", name: "Diane", email: "diane@example.com" },
  { code: "WQB005A", name: "Grace", email: "grace@example.com" },
  { code: "WQB006A", name: "Jean", email: "jean@example.com" },
];

export const getClient = (code: string) => clients.find((client) => client.code === code);
