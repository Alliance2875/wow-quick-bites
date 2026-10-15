# Working together without conflicts

The code is split so that two people working on two features almost never edit the same file.

## 1. Branches

- Never commit on `main`. Create `feat/<name>-<feature>` from an up-to-date `main` (`git pull origin main` first).
- Keep pull requests small: one feature or one fix. Rebase or merge `main` into your branch before opening the PR.
- Run `npm run lint` and `npm run build` before pushing.

## 2. Who edits what

| Area | Folders | Rule |
|---|---|---|
| Feature (owned) | `components/<feature>/`, `app/[lang]/(group)/<page>/`, `i18n/dictionaries/{en,fr}/<feature>.ts` | Edit freely when you own the feature. |
| Shared | `components/shared/`, `lib/`, `app/globals.css`, `app/[lang]/layout.tsx`, `i18n/config.ts` | Announce the change to the team first, keep it backward compatible (add props, don't rename them). |
| Data | `data/*.ts` | One file per domain. Add entries at the end of arrays to limit conflicts. |

Feature folders: `home`, `menu`, `product`, `contact`, `cart`, `checkout`, `account`, `client-area`, `admin`
(`components/portal/` is shared by the client area and the staff portal).
If something from your feature is needed by a second feature, move it to `components/shared/` in its own small PR.

## 3. Conventions

- **Strings**: no text in JSX. Add the key in `i18n/dictionaries/en/<feature>.ts` **and** `fr/<feature>.ts` (TypeScript fails if FR is missing). Variables use `{name}` + `fill()`.
  French typography: non-breaking space before `? : ; !` (`"Nouveau ici ?"`).
- **Business content** (menu, categories, promotions, contact): read from the backend through RTK Query. Keep bilingual UI copy in the locale dictionaries.
- **Links**: `localePath(lang, routes.menu)` — never hard-code `/en/...`.
- **Colours**: only theme utilities (`bg-card`, `text-accent`, `bg-soft`, `border-border`…). Need a new colour? Add a token in `app/globals.css` for both themes.
  `dark:` / `light:` variants follow the theme toggle (not the OS).
- **Server first**: pages and components are Server Components. Add `"use client"` only for state/effects, and pass only the dictionary slice the component needs.
- **Icons**: add the Lucide paths to `components/shared/ui/Icon.tsx` (no icon library).
- **Portal pages**: call `requireViewer(lang, path, { roles, anyPermission })` from `lib/auth/dal.ts` first; add a new
  protected path to `portalRules` in `lib/auth/roles.ts`. Never read portal data before that check.
- **Prices**: integers in RWF, displayed with `formatPrice()` → `RWF 6,000` (both languages).

## 4. Adding a page

1. `app/[lang]/(group)/my-page/page.tsx` — get texts with `const { lang, dict } = await resolveLang(params)`.
2. Add the path to `lib/routes.ts`.
3. Put its components in `components/<feature>/` and its strings in a new dictionary file (`en/` + `fr/`, registered in both `index.ts`).

## 5. Backend data and local state

| Domain | Source of truth |
|---|---|---|
| Catalogue, business contact, promotions | Backend API through `lib/redux/api/*` |
| Orders, notifications, staff, audit, admin content | Backend API through RTK Query; portal stores expose the hooks |
| Sign-in, sign-up, verification, password flows | Backend API through server actions / RTK Query; DAL verifies the current user |
| Cart draft | Browser-local cart state; prices and availability are refreshed from the API before checkout |
| Presentation copy, navigation, payment labels | Locale dictionaries and UI configuration; not backend business records |
