# WOW Quick Bites — API contracts (frontend ↔ backend)

Status: **draft v1** · Owner: frontend team · Audience: backend team

This document lists every endpoint the frontend needs to replace its mocks. Each section names the mock it
replaces, so the switch is one file per domain. Shapes are copied from the TypeScript types the UI already
uses (`data/types.ts`, `lib/…`): if the API returns exactly these, no component changes.

Open questions are marked **❓** — please answer them in the PR / issue that implements the endpoint.

---

## 1. Conventions

| Topic | Rule |
|---|---|
| Base URL | `/api/v1` (e.g. `https://api.wowquickbites.rw/api/v1`) |
| Format | JSON, `camelCase` keys, UTF-8 |
| Dates | ISO 8601 **with offset**, Kigali time: `"2026-10-06T12:18:00+02:00"` |
| Money | Integers in **RWF**, no decimals: `6000` (UI shows `RWF 6,000`) |
| Bilingual text | Content objects carry both languages: `{ "en": "Burger", "fr": "Burger" }` (type `Localized`). UI strings are **not** sent by the API. |
| IDs | Strings. Menu items use a URL slug (`"wow-toasted-burger"`); orders `"ORD-1042"`; client codes `"WQB001A"` |
| Auth | Session cookie (see §2). Every non-public endpoint returns `401` without a valid session, `403` when the role/permission is missing. |
| Lists | `{ "items": [...], "nextCursor": "…" \| null }` when paginated; plain arrays otherwise (noted per endpoint). |
| Errors | See §11. |

**Client code vs order ID** — a client code (`WQB001A`) is permanent and identifies a *person* across all
purchases; an order ID (`ORD-1042`) identifies *one purchase*. The UI groups orders and chat by client code.

### Shared types

```ts
type Localized = { en: string; fr: string };
type Role = "client" | "manager" | "superadmin";
type OrderStage = "new" | "accepted" | "preparing" | "ready" | "completed" | "cancelled";
type PaymentMethod = "pay-on-pickup" | "mtn-momo" | "airtel-money";
type PaymentStatus = "pending" | "paid" | "not-charged";
type Fulfilment = "pickup" | "delivery";
```

---

## 2. Authentication & session

Replaces: `lib/auth/directory.ts` (`authenticate`, `register`). The frontend keeps its own flow
(Server Actions → session cookie → `proxy.ts` → `lib/auth/dal.ts`), so two integration options exist:

- **Option A (recommended)** — the backend issues the session cookie itself (HttpOnly, Secure, SameSite=Lax,
  same parent domain). The frontend forwards it and calls `GET /auth/me` to know the viewer.
- **Option B** — the backend only validates credentials and returns the user; the frontend signs its own JWT
  (current behaviour, `SESSION_SECRET`).

❓ Which option? Option A is needed if the mobile app or other clients will use the same API.

### `POST /auth/sign-in` — public
```json
// request
{ "email": "eric@wowquickbites.rw", "password": "…" }
// 200
{ "user": SessionUser }
```
Errors: `401 invalid_credentials`, `403 account_suspended`, `429 too_many_attempts`.

### `POST /auth/sign-up` — public (clients only)
```json
// request
{ "name": "Aline", "email": "aline@example.com", "phone": "078 123 4567", "password": "min 6 chars" }
// 201
{ "user": SessionUser }
```
The backend **assigns the permanent client code** (`WQB` + 3 digits + letter). Errors: `409 email_taken`, `422 validation_failed`.

### `POST /auth/sign-out` — any session → `204`

### `GET /auth/me` — any session
```ts
type SessionUser = {
  id: string;            // staff id ("eric") or client code ("WQB001A")
  role: Role;
  name: string;
  email: string;
  phone?: string;
  clientCode?: string;   // clients only
  permissions: Permission[];          // effective permissions, grant included
  contentGrant?: ContentGrant;        // managers with an active grant
};
type Permission =
  | "overview:view" | "orders:process" | "messages:reply"
  | "menu:edit" | "labels:edit" | "ads:manage" | "content:publish"
  | "managers:manage" | "business:edit";
```
Must reflect **current** state: a suspended manager or an expired grant is refused here even if the session is
still valid (the frontend relies on this).

### Password recovery — public
Replaces the stand-in in `components/account/ForgotPasswordFlow.tsx`.

| Endpoint | Body | Response |
|---|---|---|
| `POST /auth/password/forgot` | `{ "email" }` | `202` always (never reveal whether the email exists) |
| `POST /auth/password/reset` | `{ "token", "password" }` | `204` · `400 invalid_or_expired_token` |

The reset email links to `https://<site>/{lang}/forgot-password?token=…` ❓ confirm the link format.

### Google sign-in
Button exists (`components/account/AuthCard.tsx`). ❓ OAuth flow and callback URL to agree on.

---

## 3. Roles & permissions (server must enforce)

| Capability | Superadmin | Manager (default) | Manager + content grant | Client |
|---|---|---|---|---|
| Store overview | ✓ | – | – | – |
| Process orders (accept → complete) | all orders | **assigned** orders | assigned orders | – |
| Reply to client messages | all clients | assigned clients | assigned clients | own conversation |
| Edit menu items (`menu:edit`) | ✓ | – | if scope `food`/`drinks` | – |
| NEW labels (`labels:edit`) | ✓ | – | if scope `labels` | – |
| Ads (`ads:manage`) | ✓ | – | if scope `ads` | – |
| Publish content (`content:publish`) | ✓ | – | if scope `publish` | – |
| Managers, grants, business settings | ✓ | – | **never** | – |
| Own orders, notifications, chat | – | – | – | ✓ |

A manager's "assigned" orders/clients = orders whose `managerId` is that manager; a conversation belongs to the
manager of the client's latest order. Grants are never delegable by a manager.

---

## 4. Catalogue (public)

Replaces: `data/menu.ts`, `data/categories.ts`, `data/product-options.ts`, `data/tags.ts`, `data/promotions.ts`,
`data/contact.ts`. Read at build/request time by Server Components → cacheable (`Cache-Control: public, max-age=60, stale-while-revalidate=600`).

### `GET /menu/items` → `MenuItem[]`
Query: `?group=food|drinks`, `?category=burgers`, `?includeUnavailable=true` (staff only).
```ts
type MenuItem = {
  id: string;                 // slug, also the product URL /menu/[id]
  name: Localized;
  description: Localized;
  cartMeta?: Localized;       // "Beef · Cheese · Toasted bun"
  price: number;              // RWF
  image: string;              // absolute URL (CDN)
  group: "food" | "drinks";
  section?: "smoothies" | "milkshakes" | "ice-cream" | "mojitos" | "spiced-tea"; // drinks only
  categories: CategoryId[];   // "burgers" | "pizza" | "desserts" | "drinks" | "chips" | "chicken"
  tags: string[];             // keys of GET /menu/tags
  isNew?: boolean;
  available: boolean;         // false = shown greyed, cannot be ordered
  optionGroups?: string[];    // ids of GET /menu/option-groups
  pairsWith?: string;         // menu item id suggested on the product page
};
```

### `GET /menu/items/{id}` → `MenuItem` · `404`

### `GET /menu/categories` → `{ id, name: Localized, icon }[]`
### `GET /menu/drink-sections` → `{ id, name: Localized, note?: Localized }[]`
### `GET /menu/tags` → `Record<string, Localized>`

### `GET /menu/option-groups` → `Record<string, OptionGroup>`
```ts
type OptionGroup = {
  id: string; name: Localized; hint?: Localized;
  kind: "add" | "remove";     // add = paid extras, remove = "leave out"
  required: boolean; max?: number;
  choices: { id: string; name: Localized; price: number }[];
};
```

### `GET /promotions` → `Promotion[]` (homepage offers currently **published**)
```ts
type Promotion = {
  id: string; kicker: Localized; title: Localized; text: Localized; cta: Localized;
  image: string; href: string;
  highlight?: { label: Localized; value: Localized; labelFirst: boolean };
  tone: "yellow" | "plain";
};
```

### `GET /business` → business & contact info (footer, contact page, portal settings)
```ts
{ name: Localized; owner: string; location: Localized; hours: Localized; email: string; phone: string;
  socials: { label: string; href: string }[] }
```

---

## 5. Cart & checkout

Replaces: `lib/cart/cart.ts`, `lib/orders.ts` (`placeOrder`).

❓ Should the cart live on the server? The UI works with a local cart (guests keep it until they sign in). A
server cart is only needed for cross-device carts; if so: `GET/PUT /cart` with the `CartLine[]` below.

```ts
type CartLine = { itemId: string; quantity: number; choices: string[]; note?: string };
```

### `POST /orders` — client
```json
// request
{
  "lines": [{ "itemId": "wow-toasted-burger", "quantity": 1, "choices": ["extra-cheese"], "note": "no onions" }],
  "fulfilment": "pickup",
  "address": null,
  "payment": "pay-on-pickup",
  "contact": { "name": "Aline", "phone": "078 123 4567", "email": "aline@example.com" },
  "notes": "optional"
}
// 201
{ "order": Order }
```
**The server recomputes all prices** from the current menu (never trust client totals) and returns `subtotal`,
`fees`, `total`. Errors: `409 item_unavailable` (with `itemIds`), `422 validation_failed`.

❓ Mobile Money (MTN MoMo / Airtel Money): payment initiation + webhook flow and the states to show while
waiting (`paymentStatus: "pending"` until confirmed?).

---

## 6. Orders

Replaces: `data/orders.ts`, `lib/portal/store.ts` (`useOrders`, `moveOrder`).

```ts
type Order = {
  id: string;                    // "ORD-1042"
  clientCode: string;            // "WQB001A"
  clientName: string;
  managerId: string;             // staff id in charge
  placedAt: string;
  fulfilment: Fulfilment;
  address?: string;
  payment: PaymentMethod;
  paymentStatus: PaymentStatus;
  stage: OrderStage;
  lines: {
    itemId: string; quantity: number; choices: string[]; note?: string;
    name: Localized;             // snapshot at order time
    unitPrice: number;           // snapshot: historical totals never change with menu prices
    total: number;
  }[];
  subtotal: number; fees: number; total: number;
  history: Partial<Record<OrderStage, string>>;  // when each stage was reached
};
```
> The current mock computes line prices from the live menu; the real API must **snapshot** names and prices.

### Client
| Endpoint | Response |
|---|---|
| `GET /me/orders?status=active\|completed\|cancelled&q=ORD-10` | `Order[]` newest first (own orders only) |
| `GET /me/orders/{id}` | `Order` · `404` if not the caller's (same 404 whether it exists or not) |

### Staff
| Endpoint | Who | Notes |
|---|---|---|
| `GET /orders?since=ISO&stage=…&managerId=…&q=…` | manager, superadmin | Register queue. `q` matches order id, client code or name. Default `since` = 3 days ago. |
| `GET /orders/{id}` | manager, superadmin | |
| `POST /orders/{id}/transition` | assigned manager, superadmin | Body `{ "to": OrderStage }` → `200 { order }` |

Allowed transitions (server-enforced, otherwise `409 invalid_transition`):

```
new → accepted → preparing → ready → completed
new | accepted → cancelled
```
- `completed` sets `paymentStatus: "paid"` (pay on pickup); `cancelled` sets `"not-charged"`.
- Each transition **creates a client notification** (§8) and an **audit event** (§10).
- `403 not_assigned` when a manager acts on another manager's order.

### Live updates
❓ The queue, client tracking and chat should update without reload. Proposal: Server-Sent Events
`GET /events` (per session) emitting `order.updated`, `message.created`, `notification.created`. WebSocket is fine too.

---

## 7. Messages (one conversation per client code)

Replaces: `data/messages.ts`, `lib/portal/store.ts` (`useMessages`, `sendMessage`, `markConversationRead`).

```ts
type ChatMessage = {
  id: string;
  clientCode: string;
  from: "client" | "manager";
  authorId?: string;          // staff id when from = manager
  orderId?: string;           // order the message is about
  text: string;               // plain text as typed (not Localized)
  sentAt: string;
  readByClient: boolean;
  readByManager: boolean;
};
```
> The mock stores sample text as `Localized`; real messages are plain strings.

### Client
| Endpoint | Response |
|---|---|
| `GET /me/conversation` | `{ manager: { id, name } \| null, messages: ChatMessage[] }` |
| `POST /me/conversation/messages` `{ text, orderId? }` | `201 ChatMessage` |
| `POST /me/conversation/read` | `204` — marks manager messages read |

### Staff
| Endpoint | Response |
|---|---|
| `GET /conversations?q=` | `{ clientCode, clientName, managerId, lastMessage, unread, latestOrder }[]` (assigned only for managers) |
| `GET /conversations/{clientCode}` | `ChatMessage[]` oldest first |
| `POST /conversations/{clientCode}/messages` `{ text, orderId? }` | `201 ChatMessage` |
| `POST /conversations/{clientCode}/read` | `204` |

Text limit ❓ (proposal: 1–2,000 characters).

---

## 8. Client notifications

Replaces: `data/notifications.ts`, `lib/portal/store.ts` (`useNotifications`, `markNotificationsRead`).

```ts
type ClientNotification = {
  id: string; clientCode: string; orderId: string; stage: OrderStage;
  title: Localized; text: Localized;   // generated server side in both languages
  at: string; read: boolean;
};
```
| Endpoint | Response |
|---|---|
| `GET /me/notifications?unread=true` | `ClientNotification[]` newest first |
| `POST /me/notifications/read` `{ ids: string[] }` or `{ all: true }` | `204` |

Wording per stage is in `i18n/dictionaries/*/client-area.ts → notifications.templates` (reuse it).
❓ Also send SMS / push for `ready`?

---

## 9. Content management (Menu & Ads)

Replaces: `lib/portal/content-store.ts`. Permissions in §3.

### Menu items
| Endpoint | Permission | Body / response |
|---|---|---|
| `POST /admin/menu/items` | `menu:edit` | `MenuItemInput` → `201 MenuItem` (state `draft`) |
| `PATCH /admin/menu/items/{id}` | `menu:edit` (+ `labels:edit` to change `isNew`) | partial `MenuItemInput` → saves a **draft** |
| `POST /admin/menu/items/{id}/publish` | `content:publish` | `200 MenuItem` — applies photo, price, availability and badge together |
| `GET /admin/menu/items` | `menu:edit` | `(MenuItem & { state: "draft" \| "published", draft?: MenuItemInput })[]` |

```ts
type MenuItemInput = Pick<MenuItem,
  "name" | "description" | "price" | "group" | "section" | "categories" | "tags" | "isNew" | "available"> & { imageId?: string };
```
Price changes never alter past orders (snapshots, §6).

### Uploads
`POST /admin/uploads` (multipart, `file`) → `{ imageId, url }`. ❓ Max size / formats (proposal: 5 MB, JPEG/PNG/WebP, server resizes).

### Campaigns (homepage ads)
```ts
type Campaign = {
  id: string;
  status: "draft" | "scheduled" | "published" | "paused";
  tag: "promotion" | "new" | "offer";
  placement: "home-offers" | "home-hero";
  title: Localized; text: Localized; cta: Localized;
  ctaCategory: CategoryId | null;   // null = whole menu
  imageId: string; image: string;
  startsAt?: string; endsAt?: string;
  schedule?: Localized;             // short line, e.g. "Weekdays"
};
```
| Endpoint | Permission |
|---|---|
| `GET /admin/campaigns` | `ads:manage` |
| `POST /admin/campaigns` · `PATCH /admin/campaigns/{id}` · `DELETE /admin/campaigns/{id}` (drafts only) | `ads:manage` |
| `POST /admin/campaigns/{id}/publish` (→ `scheduled` if `startsAt` is in the future) | `content:publish` |
| `POST /admin/campaigns/{id}/pause` · `/resume` · `/cancel-schedule` | `ads:manage` |

`GET /promotions` (§4) returns only campaigns that are `published` and inside their date window.

### Business settings
`PUT /admin/business` (`business:edit`) — body = `GET /business` shape.

---

## 10. Staff administration (superadmin only)

Replaces: `data/staff.ts`, `lib/portal/staff-store.ts`.

```ts
type StaffMember = {
  id: string; name: string; email: string;
  role: "manager" | "superadmin";
  assignment: "pickup-register" | "backup" | "none";
  duty: "on" | "off";
  status: "active" | "suspended" | "invited";
  contentGrant?: ContentGrant;
  activeOrders: number;        // for the directory "Orders" column
};
type ContentGrant = {
  grantedBy: string;
  scopes: ("food" | "drinks" | "labels" | "ads" | "publish")[];
  startsAt: string;
  expiresAt?: string;          // absent = until revoked
};
```

| Endpoint | Body | Notes |
|---|---|---|
| `GET /admin/managers?status=&q=` | | `StaffMember[]` |
| `PATCH /admin/managers/{id}` | `{ name?, duty?, assignment? }` | |
| `POST /admin/managers/{id}/suspend` | | also removes assignment and grant; ❓ what happens to its active orders (block or reassign?) |
| `POST /admin/managers/{id}/reactivate` | | |
| `PUT /admin/managers/{id}/grant` | `ContentGrant` without `grantedBy` | takes effect immediately for the manager's next request |
| `DELETE /admin/managers/{id}/grant` | | |
| `POST /admin/invitations` | `{ name, email, assignment }` | sends the invitation email; default access = orders + chat only. ❓ invitation acceptance flow / link |

### Overview
`GET /admin/overview` (superadmin) — or the frontend computes it from `GET /orders` + `GET /admin/managers`:
```ts
{ orders: number; ordersToday: number; active: Record<OrderStage, number>;
  completedValue: number; managers: { active: number; total: number; onDuty: number; offDuty: number; suspended: number } }
```

### Audit
Replaces `data/audit.ts`. Every order transition, content change and access change is recorded.
```ts
type AuditEvent = {
  id: string; at: string;
  actorId: string;                 // staff id or "system"
  scope: "orders" | "content" | "access";
  targetId?: string;               // person affected (access events)
  type: string;                    // e.g. "order.transition", "grant.created", "menu.published"
  data: Record<string, unknown>;   // e.g. { orderId, to: "preparing", clientCode }
  text: Localized;                 // ready-to-display sentence (or the frontend formats from type + data ❓)
};
```
`GET /admin/audit?scope=&limit=20&cursor=` (superadmin; managers ❓ none for now).

---

## 11. Errors

```json
{ "error": { "code": "invalid_transition", "message": "Human-readable (English) for logs", "details": {} } }
```
| Status | When | `code` examples |
|---|---|---|
| 400 | malformed request | `bad_request` |
| 401 | no / expired session | `unauthenticated` |
| 403 | role or permission missing | `forbidden`, `not_assigned`, `account_suspended` |
| 404 | not found **or not yours** | `not_found` |
| 409 | state conflict | `invalid_transition`, `email_taken`, `item_unavailable` |
| 422 | validation | `validation_failed` + `details: { field: "reason" }` |
| 429 | rate limit (sign-in, sign-up, messages) | `too_many_attempts` |

The UI translates `code` (EN/FR), so codes must be stable; `message` is not shown to users.

---

## 12. Non-functional

- **CORS / cookies**: if API and site are on different subdomains, cookie `Domain=.wowquickbites.rw`, CORS with credentials for the site origin only.
- **Security**: CSRF protection on cookie-authenticated mutations (SameSite=Lax + origin check or token), password hashing (argon2/bcrypt/scrypt), rate limiting on auth.
- **Time zone**: store UTC, return with `+02:00`; "today" in the register = Kigali calendar day.
- **Performance**: catalogue endpoints cacheable; list endpoints < 300 ms p95; images served from a CDN with width variants (the site uses `next/image`, so absolute URLs on an allowed host ❓ give us the host).
- **Environments**: ❓ staging URL + seed data matching `data/` (the sample accounts Aline, Eric, Nadia… make QA easy).

---

## 13. Frontend switch checklist

| Mock to replace | Endpoints |
|---|---|
| `lib/auth/directory.ts` | §2 |
| `data/menu.ts`, `categories.ts`, `product-options.ts`, `tags.ts`, `promotions.ts`, `contact.ts`, `site.ts` | §4 |
| `lib/cart/cart.ts`, `lib/orders.ts` | §5 |
| `data/orders.ts`, `lib/portal/store.ts` (orders) | §6 |
| `data/messages.ts`, `lib/portal/store.ts` (messages) | §7 |
| `data/notifications.ts`, `lib/portal/store.ts` (notifications) | §8 |
| `lib/portal/content-store.ts`, `data/campaigns.ts`, `data/business.ts` | §9 |
| `data/staff.ts`, `data/audit.ts`, `lib/portal/staff-store.ts` | §10 |
| `lib/portal/clock.ts` (`portalNow`) | real time once orders are live |
