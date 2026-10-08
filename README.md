# WOW Quick Bites — frontend

Next.js 16 (App Router) + Tailwind CSS 4. Bilingual (EN/FR), dark/light themes, built from the Figma designs in `picsDesigns/`.

```bash
npm install
npm run dev     # http://localhost:3000 → redirects to /en or /fr
npm run lint
npm run build
```

## Project structure

```
app/
  globals.css               Theme tokens (dark + light). Components never use raw hex colours.
  [lang]/                   Every page lives under /en or /fr
    layout.tsx              <html>, fonts, theme script, header + footer
    (storefront)/           Home, menu, product page, about, contact
    (shop)/                 Cart, checkout, order confirmation
    (account)/              Sign in, sign up, forgot password
proxy.ts                    Redirects "/menu" → "/en/menu" (cookie → browser language → en)

components/
  shared/                   Used by several features — change with care, tell the team
    ui/                     Button, Icon, Field, Tag, Breadcrumb, QuantityStepper…
    layout/                 SiteHeader, SiteFooter, ThemeToggle, LanguageToggle, CartButton…
    product/                DishCard, OrderButton, OptionsModal, OptionGroupFields
    order/                  StepIndicator, SummaryRows, OrderLineRow (cart/checkout/confirmation)
  home/  menu/  product/  contact/  cart/  checkout/  account/
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
  cart/  auth/  orders.ts   Client stores (localStorage MOCKS until the backend exists)
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for the team rules (branches, ownership, how to add a page or a string).
