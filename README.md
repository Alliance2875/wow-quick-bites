# WOW Quick Bites — frontend

Next.js 16 (App Router) + Tailwind CSS 4. Bilingual (EN/FR), dark/light themes, built from the Figma designs in `picsDesigns/`
(storefront, shop, account) and `picsDesigns copy/` (client area, manager and superadmin portal).

```bash
npm install
npm run dev     # http://localhost:3000 → redirects to /en or /fr
npm run lint
npm run build
cp .env.example .env.local   # production only: set SESSION_SECRET (dev has a built-in fallback)
```

## Portal access (client area + staff portal)

| Area | URL | Who |
|---|---|---|
| Client area | `/en/account` (dashboard, orders, tracking, notifications) | clients |
| Staff portal | `/en/admin/orders`, `/en/admin/orders/[id]` | managers + superadmin |
| | `/en/admin/content` (Menu & Ads) | superadmin, or a manager with an active content grant |
| | `/en/admin` (overview), `/en/admin/managers` | superadmin only |

Everyone signs in at `/en/sign-in` and lands in their own workspace.
**Role-based access control** with a **signed session cookie** (JWT HS256 via `jose`, HttpOnly, SameSite=Lax, 8 h):

1. `lib/auth/actions.ts` — Server Actions check the credentials on the server and set the cookie.
2. `proxy.ts` — fast, optimistic check on every `/account` and `/admin` request (redirects to sign-in or to the
   person's own home; adds `Cache-Control: private, no-store` and `X-Robots-Tag: noindex`).
3. `lib/auth/dal.ts` — the authoritative check: every portal page calls `requireViewer()` with its roles and
   permissions. Suspended managers and expired content grants are refused here even with a valid cookie.
4. `lib/auth/roles.ts` — roles, permissions and the routes each role may open (one place to change the rules).

Managers handle orders by default; Menu & Ads permissions only come from an explicit, time-limited
grant by the superadmin, verified against the backend session.

Accounts and roles are managed by the backend. Use provisioned staging accounts to test role-specific access.

## Project structure

```
app/
  globals.css               Theme tokens (dark + light). Components never use raw hex colours.
  [lang]/                   Every page lives under /en or /fr
    layout.tsx              <html>, fonts, theme script, header + footer
    (storefront)/           Home, menu, product page, about, contact
    (shop)/                 Cart, checkout, order confirmation
    (site)/                 Public website: yellow header + footer
      (storefront)/         Home, menu, product page, about, contact
      (shop)/               Cart, checkout, order confirmation
      (account)/            Sign in, sign up, forgot password
    (portal)/               Sidebar shell, signed-in only
      account/              Client area: dashboard, orders, order tracking, notifications, chat
      admin/                Staff portal: overview, order queue/detail, messages, Menu & Ads, managers
proxy.ts                    Locale redirect + optimistic role check for /account and /admin

components/
  shared/                   Used by several features — change with care, tell the team
    ui/                     Button, Icon, Field, Tag, Breadcrumb, QuantityStepper…
    layout/                 SiteHeader, SiteFooter, ThemeToggle, LanguageToggle, CartButton…
    product/                DishCard, OrderButton, OptionsModal, OptionGroupFields
    order/                  StepIndicator, SummaryRows, OrderLineRow (cart/checkout/confirmation)
  portal/                   Portal shell (sidebar, top bar) + portal UI kit (Panel, Table, Status, Controls…)
  home/  menu/  product/  contact/  cart/  checkout/  account/  client-area/  admin/
                            One folder per feature, used by that feature only

data/                       Mock content (menu, categories, promotions, options, checkout…)
                            Same shape as the future API: swap a file for a fetch() later.
i18n/
  config.ts                 Locales, Localized<T> type, localize()
  get-dictionary.ts         resolveLang(params) for pages and layouts
  dictionaries/en/*.ts      UI strings, one file per feature
  dictionaries/fr/*.ts      Same keys, typed against en/ (a missing key is a type error)
lib/
  routes.ts                 All internal paths + localePath()
  format.ts                 formatPrice, fill, plural, cn
  theme.ts                  Theme cookie + no-flash script
  auth/                     roles.ts (RBAC), token.ts (session JWT), dal.ts (access checks), actions.ts (sign in/out)
  portal/                   Portal clock, date format, order helpers, mock stores (orders, chat, content, staff)
  cart/  orders.ts          Client stores (localStorage MOCKS until the backend exists)
```

Backend endpoints the frontend expects: [docs/API_CONTRACTS.md](docs/API_CONTRACTS.md).

See [CONTRIBUTING.md](CONTRIBUTING.md) for the team rules (branches, ownership, how to add a page or a string).
