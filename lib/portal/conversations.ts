import { getClient } from "@/data/clients";
import type { ChatMessage, PortalOrder } from "@/data/types";
import { newestFirst } from "./orders";

// One conversation per client code. It belongs to the manager of the client's latest order.

export type Conversation = {
  clientCode: string;
  clientName: string;
  managerId: string;
  messages: ChatMessage[];
  last: ChatMessage;
  /** Latest order of the client (the one the chat is linked to) */
  order?: PortalOrder;
};

export function buildConversations(messages: ChatMessage[], orders: PortalOrder[]): Conversation[] {
  const byClient = new Map<string, ChatMessage[]>();
  messages.forEach((message) => byClient.set(message.clientCode, [...(byClient.get(message.clientCode) ?? []), message]));

  return [...byClient.entries()]
    .map(([clientCode, thread]) => {
      const sorted = [...thread].sort((a, b) => Date.parse(a.sentAt) - Date.parse(b.sentAt));
      const order = orders.filter((o) => o.clientCode === clientCode).sort(newestFirst)[0];
      return {
        clientCode,
        clientName: getClient(clientCode)?.name ?? clientCode,
        managerId: order?.managerId ?? sorted.find((m) => m.authorId)?.authorId ?? "",
        messages: sorted,
        last: sorted[sorted.length - 1],
        order,
      };
    })
    .sort((a, b) => Date.parse(b.last.sentAt) - Date.parse(a.last.sentAt));
}

/** Conversations a staff member handles: their own clients (managers) or everyone (superadmin). */
export const visibleTo = (conversations: Conversation[], viewer: { id: string; role: string }) =>
  viewer.role === "superadmin" ? conversations : conversations.filter((c) => c.managerId === viewer.id);

export const unreadForManager = (conversation: Conversation) =>
  conversation.messages.filter((m) => m.from === "client" && !m.readByManager).length;

export const unreadForClient = (messages: ChatMessage[], clientCode: string) =>
  messages.filter((m) => m.clientCode === clientCode && m.from === "manager" && !m.readByClient).length;
