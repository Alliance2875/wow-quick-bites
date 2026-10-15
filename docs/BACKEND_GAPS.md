# Backend API — gaps and inconsistencies

Status: **historical audit snapshot** · Date: 2026-10-15 · From: frontend team · To: backend team

This records observations from the initial backend review only. It is not a current runtime health report:
the OpenAPI file in the project is now the contract source of truth, and the deployed backend was not
smoke-tested during the latest frontend integration.

Thanks for the work so far: the validation errors are clear, the 404s are correct, and the menu structure
(categories, items, variants, extras) is a good base.

**How to read it.** Each point says what we observed, why it matters, and what we need.
Priorities: 🔴 **blocker** (we cannot integrate without it) · 🟠 **important** (the integration works but a
feature stays on mock data) · 🟢 **minor** (we can adapt, but alignment is welcome).

---

## Summary

| # | Area | Issue | Priority |
|---|---|---|---|
| A1 | Auth | Login, register and verify-email responses are not documented | 🔴 |
| A2 | Auth | No endpoint returning the current user (role, permissions, client code) | 🔴 |
| A3 | Auth | Error format differs between endpoints, no stable error codes | 🟠 |
| A4 | Auth | Password recovery, profile update and Google sign-in endpoints missing | 🟠 |
| A5 | Auth | OTP length and the register fields differ from the contract | 🟢 |
| M1 | Menu | No price on menu items | 🔴 |
| M2 | Menu | Content readable in one language only | 🔴 |
| M3 | Menu | No seed data: every list is empty | 🔴 |
| M4 | Menu | No slug: items are identified by integers only | 🟠 |
| M5 | Menu | Missing fields: food/drinks group, drink section, tags, category icon, pairing | 🟠 |
| M6 | Menu | Extras are global: no option groups, no "remove" options, no rules | 🟠 |
| M7 | Menu | Image format unknown (absolute URL? which host?) | 🟠 |
| M8 | Menu | Prices are decimal strings | 🟢 |
| G1 | General | Documentation: 200/201 responses show "No response body" | 🟠 |
| G2 | General | Missing domains: orders, checkout, notifications, promotions, business info, staff | 🟠 |
| G3 | General | JSON keys in `snake_case`, contract uses `camelCase` | 🟢 |

Concrete Django / DRF examples for each point are in the [appendix](#appendix--django--drf-examples).

---

## 1. Authentication

### A1 🔴 — Responses of login, register and verify-email are not documented

**Observed.** The schema shows `200 No response body` for `POST /accounts/login/`, `201 No response body` for
`POST /accounts/register/` and `200 No response body` for `POST /accounts/verify-email/`. Only
`/accounts/token/refresh/` documents its response (`{ refresh, access }`).

**Why it matters.** We cannot write the sign-in flow without knowing what a successful login returns: tokens in
the body, a cookie, the user, or several of these.

**What we need.** Please document, and ideally return, the following:

```jsonc
// POST /accounts/login/  →  200
{
  "access": "<jwt>",
  "refresh": "<jwt>",
  "user": SessionUser   // see A2
}

// POST /accounts/register/  →  201
{ "email": "aline@example.com", "pendingVerification": true }

// POST /accounts/verify-email/  →  200 (signs the user in, like login)
{ "access": "<jwt>", "refresh": "<jwt>", "user": SessionUser }
```

Please also confirm:
- the lifetime of the access and refresh tokens;
- whether `token/refresh/` rotates the refresh token (the response contains a `refresh` field);
- whether `logout` expects the refresh token in the body (as the schema says) **and** a valid access token.

We will keep the tokens server-side (in our HttpOnly session cookie), so the API does not need to set cookies
for the website.

### A2 🔴 — No "current user" endpoint

**Observed.** There is no `GET /accounts/me/` (or equivalent).

**Why it matters.** The website shows a different area for clients, managers and the superadmin, and hides
actions a manager is not allowed to do. Without the role and permissions we cannot route a user after login.
The client code (`WQB001A`) is also shown on the client's profile and orders.

**What we need.** `GET /accounts/me/` (authenticated) → `200 SessionUser`, also returned by login and
verify-email:

```ts
type SessionUser = {
  id: string;
  role: "client" | "manager" | "superadmin";
  name: string;
  email: string;
  phone?: string;
  clientCode?: string;        // clients only, assigned by the backend, permanent ("WQB" + 3 digits + 1 letter)
  permissions: Permission[];  // effective permissions
  contentGrant?: {            // managers with temporary content rights
    grantedBy: string;
    scopes: ("food" | "drinks" | "labels" | "ads" | "publish")[];
    startsAt: string;         // ISO 8601
    expiresAt?: string;
  };
};

type Permission =
  | "overview:view" | "orders:process"
  | "menu:edit" | "labels:edit" | "ads:manage" | "content:publish"
  | "managers:manage" | "business:edit";
```

It must reflect the **current** state: a suspended manager or an expired grant must be refused (`403`) even
if their token is still valid.

### A3 🟠 — Error format differs between endpoints

**Observed.**

| Call | Response |
|---|---|
| Login, wrong password | `400 {"detail": ["Invalid email or password."]}` (an array) |
| Login, empty body | `400 {"email": ["This field is required."], "password": [...]}` |
| Verify email, wrong code | `400 {"error": "Invalid or expired verification code."}` (a string) |
| Unknown menu item | `404 {"detail": "No MenuItem matches the given query."}` (a string) |

So the message is sometimes under `detail` (array or string) and sometimes under `error`. A wrong password
also returns `400`, where `401` is expected.

**Why it matters.** The website is bilingual (EN/FR). We do not show backend messages: we translate a
**stable code**. Without codes we have to match English sentences, which breaks as soon as the wording changes.

**What we need.** One format for every error:

```json
{ "error": { "code": "invalid_credentials", "message": "Invalid email or password.", "details": {} } }
```

- Validation errors: `422` (or `400`) with `code: "validation_failed"` and `details: { "email": "required" }`.
- Codes we need now: `invalid_credentials` (401), `email_not_verified` (403), `account_suspended` (403),
  `email_taken` (409), `invalid_code` (400), `code_expired` (400/410), `too_many_attempts` (429),
  `not_found` (404), `unauthenticated` (401), `forbidden` (403).

If changing the format is too much right now, the **minimum** is a stable `code` field in every error body.

Please also tell us what login returns for an account that registered but **did not verify** its email.

### A4 🟠 — Missing auth endpoints

| Endpoint | Purpose | Where it is used |
|---|---|---|
| `POST /accounts/password/forgot/` `{ email }` → `202` always | Send a reset link (never reveal whether the email exists) | `/forgot-password` page |
| `POST /accounts/password/reset/` `{ token, password }` → `204` | Set the new password | `/forgot-password?token=…` |
| `PATCH /accounts/me/` `{ name?, phone? }` → `200 SessionUser` | Client edits their profile (email not editable) | `/account/profile` |
| `POST /accounts/google/` `{ email, name }` → `200`/`201 { access, refresh, user }` | Google sign-in: the website does the OAuth exchange and calls this server-to-server | "Continue with Google" |

For Google sign-in: the website already runs the OAuth flow and only sends a **verified** email. The endpoint
finds the account by email, or creates a client account (with a client code). Staff accounts must keep using
their password (`403 staff_password_only`). Because this endpoint trusts the caller, it must be protected (for
example a shared secret header that only our server knows). We are open to another design if you prefer to run
the OAuth exchange on your side.

Please also confirm the reset link format: `https://<site>/{lang}/forgot-password?token=…` (`lang` = `en` or `fr`).

### A5 🟢 — Small differences we can adapt to

| Topic | Contract | Backend | Action |
|---|---|---|---|
| OTP length | 6 digits | 5 digits | **We adapt** to 5. Please confirm its validity (we show "10 minutes") and the maximum attempts. |
| Name field | `name` | `full_name` | **We adapt.** |
| Password confirmation | not sent | `confirm_password` required | **We adapt.** |
| Phone | Rwandan mobile, validated | optional, format unknown | Please validate `07X XXX XXXX` / `+250 7XX XXX XXX` and tell us the stored format. |
| Resend OTP | 1 per 30 s | `429` exists | Please confirm the delay, and return it (`Retry-After` header) so we can show a countdown. |

---

## 2. Menu

### M1 🔴 — No price on menu items

**Observed.** `MenuItem` has no price field. Prices exist only on `ItemVariant` (`menu_item`, `name`,
`price`), and `MenuItem` has `price_on_request`.

**Why it matters.** Every product card, the cart and the checkout need the price of an item. To show one menu
page today we would need two calls (`items` + `variants`) and to merge them, and an item without a variant has
no price at all.

**What we need.**
- A `price` on each item (base price, integer RWF), **and**
- the variants **nested** in the item when they exist:

```jsonc
{
  "id": 12,
  "slug": "wow-toasted-burger",
  "price": 6000,
  "variants": [ { "id": 3, "name": { "en": "Double", "fr": "Double" }, "price": 8000, "isAvailable": true } ]
}
```

Please also explain `price_on_request`: which items use it, and what the customer should see and pay.

### M2 🔴 — Content readable in one language only

**Observed.** Every write takes an `input_language` (`en` | `fr`), but every read returns a single `name`
(and a single `description`). `Accept-Language: fr` and `?lang=fr` change nothing (tested on an empty list,
so we could not confirm with data).

**Why it matters.** The whole website exists in English and French (`/en/...`, `/fr/...`). Each product needs
both texts.

**What we need.** Read responses return both languages for each translatable field:

```json
{ "name": { "en": "Toasted burger", "fr": "Burger toasté" },
  "description": { "en": "...", "fr": "..." } }
```

If you prefer one language per call, then document the parameter (`?lang=fr` or `Accept-Language`) and say what
is returned when a translation is missing. Also please explain how `input_language` works: does saving in
`fr` create the French version without touching the English one? Can the admin edit both?

### M3 🔴 — No data

**Observed.** `GET /menu/categories/`, `/items/`, `/extras/` and `/variants/` all return `[]`.

**Why it matters.** We cannot check real responses, images or translations, nor test the menu pages.

**What we need.** Seed data on the hosted instance matching the catalogue contract, plus staging test accounts
for one client, one manager and one superadmin.

### M4 🟠 — No slug

**Observed.** Items and categories are identified by integers.

**Why it matters.** Product URLs are `/menu/wow-toasted-burger` (readable, shared, indexed by search engines).
Category filters use ids like `burgers`.

**What we need.**
- A unique `slug` on items and categories.
- `GET /menu/items/{slug}/`, or a filter `GET /menu/items/?slug=…`.
- Filters: `?category=<slug>`, `?group=food|drinks`.

### M5 🟠 — Missing fields

| Field | Used for | Proposed type |
|---|---|---|
| `group` on item | Separate "Menu" and "Drinks" pages | `"food" \| "drinks"` |
| `section` on drink items | Drinks page sections | `"smoothies" \| "milkshakes" \| "ice-cream" \| "mojitos" \| "spiced-tea"` |
| `tags` on item | Labels such as spicy, vegetarian | `string[]`, plus `GET /menu/tags/` → `{ key: { en, fr } }` |
| `icon` on category | Category chips | `string` (icon name) |
| `cartMeta` on item | Short line in the cart ("Beef · Cheese · Toasted bun") | `{ en, fr }`, optional |
| `pairsWith` on item | "Add something refreshing" on the product page | item slug, optional |
| item belongs to **several** categories | An item shown under "Burgers" and "Chicken" | `categories: string[]` (today: one `category`) |

Please also confirm the meaning of `is_featured`, `is_default` (category) and `display_order`, so that we can
use them.

### M6 🟠 — Extras are global, without option groups

**Observed.** `Extra` is a flat list (`name`, `price`, `is_available`) linked to items by ids.

**Why it matters.** The product page shows **groups** of options, each with rules:

- "Add extras" (paid, optional, at most N);
- "Choose your sauce" (required, 1 choice);
- "Leave out" (remove onions, cheese… free, unchecked by default).

With a flat list we cannot show the rules, nor the options to remove.

**What we need.**

```ts
type OptionGroup = {
  id: string;
  name: { en: string; fr: string };
  hint?: { en: string; fr: string };
  kind: "add" | "remove";
  required: boolean;
  max?: number;
  choices: { id: string; name: { en: string; fr: string }; price: number; isAvailable: boolean }[];
};
```

Either nested in each item (`optionGroups: OptionGroup[]`) or as `GET /menu/option-groups/` with ids on the item.

### M7 🟠 — Image format

**Observed.** `image` is a string. We cannot see real values because the lists are empty.

**What we need.** An absolute URL (`https://…`) on a fixed host, so we can allow it in the website image
configuration. Please tell us the host (Cloudinary, S3, the API itself…) and how images are uploaded
(`POST /admin/uploads` in the contract: multipart → `{ imageId, url }`).

### M8 🟢 — Prices as decimal strings

**Observed.** `price` is a decimal string (`"6000.00"`).

**What we need.** An integer in RWF (`6000`). The Rwandan franc has no decimals. **We can convert** if this is
hard to change, but please confirm prices never have decimals.

---

## 3. General

### G1 🟠 — Documentation

Several 200/201 responses show "No response body", and no error responses are documented. In drf-spectacular
this is usually fixed with `@extend_schema(responses=...)` on the views. Please also add `security` to the
public endpoints (login, register) and describe the query filters.

### G2 🟠 — Domains not available yet

Until these exist, the website keeps its mock data for them. In order of priority for us:

1. **Orders and checkout**: `POST /orders` (client and guest), client order history, staff register queue,
   stage transitions (see contract §5–6).
2. **Business info**: `GET /business` (hours, address, phone, delivery fees).
3. **Promotions**: `GET /promotions` (homepage offers).
4. **Client notifications** (§8).
5. **Content management** with draft/publish (§9) and **staff administration** (§10).

Questions still open from the contract: the payment flow for MTN MoMo / Airtel Money (is a payment confirmed by
a webhook, or verified manually by the admin?), live updates of the order queue, and whether the cart is kept
on the server.

### G3 🟢 — Hosting

The API is on the Render free plan: the first request after inactivity takes 30–50 s. We will add a timeout and
fall back to cached data, but please tell us if a staging and a production URL are planned, and their URLs.

CORS is not open to the website, which is fine: we call the API from our server only. If that changes, we will
let you know the origins.

### G4 🟢 — `snake_case` keys

The API returns `is_available`, `display_order`…, the contract uses `isAvailable`, `displayOrder`. We can convert
on our side, but switching the API to camelCase (one setting, see appendix §5) keeps both sides on the same
names and lets us generate TypeScript types straight from the schema.

---

## What we will do in the meantime

- Integrate register → email code → login → logout as soon as **A1** is answered.
- Write an adapter that converts the menu responses to the website format, with a fallback to the current menu
  while **M1–M3** are open, so the site keeps working.
- Keep mock data for every domain listed in **G2**.

Please answer in the group or as comments on this document, using the point numbers (A1, M2…).

---

## Appendix — Django / DRF examples

These are **suggestions** to show the expected result, based on the stack we can see in the schema (Django REST
Framework, drf-spectacular, Simple JWT). Model and app names are guesses: adapt them to your code.

### 0. How we stay in sync

1. **The OpenAPI schema is the contract.** Every endpoint documents its request, its responses (success and
   errors) with `@extend_schema`. If `/api/schema/` is right, nobody needs to guess.
2. **The frontend generates its types from it**
   (`npx openapi-typescript https://…/api/schema/ -o lib/api/schema.d.ts`). A field renamed on your side then
   shows up as a TypeScript error on ours, before anything breaks in production.
3. **A change to an existing response is announced** in the group (or in the PR), with the point number of this
   document when it fixes one.
4. **Seed data on the hosted instance** so both sides test against the same menu and accounts.

### 1. One error format (A3)

```python
# core/exceptions.py
from rest_framework.exceptions import APIException, ValidationError
from rest_framework.views import exception_handler

STATUS_CODES = {400: "bad_request", 401: "unauthenticated", 403: "forbidden",
                404: "not_found", 405: "method_not_allowed", 429: "too_many_attempts"}


def api_exception_handler(exc, context):
    response = exception_handler(exc, context)
    if response is None:  # unhandled error -> Django's 500
        return None

    if isinstance(exc, ValidationError):
        # {"email": ["required"]} -> {"email": "required"}
        codes = exc.get_codes()
        details = {f: (c[0] if isinstance(c, list) else c) for f, c in codes.items()} if isinstance(codes, dict) else {}
        body = {"code": "validation_failed", "message": "Validation failed.", "details": details}
    else:
        codes = exc.get_codes() if isinstance(exc, APIException) else None
        code = codes if isinstance(codes, str) else STATUS_CODES.get(response.status_code, "error")
        body = {"code": code, "message": str(getattr(exc, "detail", exc)), "details": {}}

    response.data = {"error": body}
    return response
```

```python
# core/errors.py: one class per business error, the code is what the website translates
from rest_framework.exceptions import APIException


class InvalidCredentials(APIException):
    status_code = 401
    default_code = "invalid_credentials"
    default_detail = "Invalid email or password."


class EmailNotVerified(APIException):
    status_code = 403
    default_code = "email_not_verified"
    default_detail = "Verify your email address first."


class AccountSuspended(APIException):
    status_code = 403
    default_code = "account_suspended"
    default_detail = "This account is suspended."


class InvalidCode(APIException):
    status_code = 400
    default_code = "invalid_code"
    default_detail = "Invalid or expired verification code."
```

```python
# settings.py
REST_FRAMEWORK = {
    # ...
    "EXCEPTION_HANDLER": "core.exceptions.api_exception_handler",
}
```

Then `raise InvalidCredentials()` anywhere gives
`401 {"error": {"code": "invalid_credentials", "message": "Invalid email or password.", "details": {}}}`.

### 2. Login returns tokens + user, and `GET/PATCH /me` (A1, A2, A4)

```python
# accounts/serializers.py
from rest_framework import serializers


class SessionUserSerializer(serializers.ModelSerializer):
    id = serializers.SerializerMethodField()
    role = serializers.SerializerMethodField()
    name = serializers.CharField(source="full_name")
    client_code = serializers.CharField(read_only=True, allow_null=True)
    permissions = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "role", "name", "email", "phone", "client_code", "permissions"]
        read_only_fields = ["email"]  # the email is the sign-in identity

    def get_id(self, user):
        return user.client_code or str(user.pk)

    def get_role(self, user):
        return user.role  # "client" | "manager" | "superadmin"

    def get_permissions(self, user):
        return sorted(user.effective_permissions())  # role permissions + active content grant


class AuthResponseSerializer(serializers.Serializer):
    access = serializers.CharField()
    refresh = serializers.CharField()
    user = SessionUserSerializer()


class ErrorSerializer(serializers.Serializer):  # documents the error body once
    code = serializers.CharField()
    message = serializers.CharField()
    details = serializers.DictField()
```

```python
# accounts/views.py
from django.contrib.auth import authenticate
from drf_spectacular.utils import extend_schema
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken


def auth_response(user):
    refresh = RefreshToken.for_user(user)
    return {"access": str(refresh.access_token), "refresh": str(refresh),
            "user": SessionUserSerializer(user).data}


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    @extend_schema(request=LoginRequestSerializer,
                   responses={200: AuthResponseSerializer, 401: ErrorSerializer, 403: ErrorSerializer})
    def post(self, request):
        data = LoginRequestSerializer(data=request.data)
        data.is_valid(raise_exception=True)
        email, password = data.validated_data["email"], data.validated_data["password"]

        user = User.objects.filter(email__iexact=email).first()
        if user and user.check_password(password) and not user.email_verified:
            raise EmailNotVerified()
        if not authenticate(request, email=email, password=password):  # USERNAME_FIELD = "email"
            raise InvalidCredentials()
        return Response(auth_response(user))


class MeView(generics.RetrieveUpdateAPIView):
    """GET /accounts/me/ and PATCH /accounts/me/ { name?, phone? }"""
    serializer_class = SessionUserSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ["get", "patch"]

    def get_object(self):
        user = self.request.user
        if getattr(user, "is_suspended", False):  # current state, not the state at token time
            raise AccountSuspended()
        return user
```

`verify-email` ends with `return Response(auth_response(user), status=200)` so the user is signed in right after
entering the code.

### 3. Bilingual fields (M2)

Store both languages (two columns, or `django-modeltranslation` which creates `name_en` / `name_fr` for you),
and expose them as one `{ en, fr }` object:

```python
# core/fields.py
from rest_framework import serializers


class LocalizedField(serializers.Field):
    """name_en / name_fr on the model  <->  {"en": ..., "fr": ...} in JSON."""

    def __init__(self, base, **kwargs):
        self.base = base
        kwargs["source"] = "*"
        super().__init__(**kwargs)

    def to_representation(self, obj):
        return {"en": getattr(obj, f"{self.base}_en") or "", "fr": getattr(obj, f"{self.base}_fr") or ""}

    def to_internal_value(self, data):
        if not isinstance(data, dict) or not ({"en", "fr"} & data.keys()):
            raise serializers.ValidationError("expected {\"en\": ..., \"fr\": ...}", code="invalid")
        return {f"{self.base}_{lang}": data[lang] for lang in ("en", "fr") if lang in data}
```

With this, `input_language` is no longer needed: the admin sends the languages it edits, and a PATCH with
`{"name": {"fr": "Burger toasté"}}` only changes the French text.

### 4. Menu item with slug, integer price, variants and option groups (M1, M4, M5, M6, M8)

```python
# menu/models.py (extract: only the fields that change)
class MenuItem(models.Model):
    slug = models.SlugField(unique=True)
    group = models.CharField(max_length=10, choices=[("food", "Food"), ("drinks", "Drinks")])
    section = models.CharField(max_length=20, blank=True)       # drinks only
    categories = models.ManyToManyField(Category, related_name="items")
    price = models.PositiveIntegerField()                       # RWF, no decimals
    tags = models.ManyToManyField(Tag, blank=True)
    pairs_with = models.ForeignKey("self", null=True, blank=True, on_delete=models.SET_NULL)
    option_groups = models.ManyToManyField("OptionGroup", blank=True)
    # name_en, name_fr, description_en, description_fr, image, is_available, is_new, display_order...


class OptionGroup(models.Model):
    slug = models.SlugField(unique=True)
    kind = models.CharField(max_length=6, choices=[("add", "Add"), ("remove", "Remove")])
    required = models.BooleanField(default=False)
    max = models.PositiveSmallIntegerField(null=True, blank=True)
    # name_en, name_fr, hint_en, hint_fr


class OptionChoice(models.Model):
    group = models.ForeignKey(OptionGroup, related_name="choices", on_delete=models.CASCADE)
    slug = models.SlugField()
    price = models.PositiveIntegerField(default=0)              # 0 for "remove" options
    is_available = models.BooleanField(default=True)
    # name_en, name_fr
```

```python
# menu/serializers.py
class VariantSerializer(serializers.ModelSerializer):
    name = LocalizedField("name")

    class Meta:
        model = ItemVariant
        fields = ["id", "name", "price", "is_available"]


class OptionChoiceSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source="slug")
    name = LocalizedField("name")

    class Meta:
        model = OptionChoice
        fields = ["id", "name", "price", "is_available"]


class OptionGroupSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source="slug")
    name = LocalizedField("name")
    hint = LocalizedField("hint", required=False)
    choices = OptionChoiceSerializer(many=True, read_only=True)

    class Meta:
        model = OptionGroup
        fields = ["id", "name", "hint", "kind", "required", "max", "choices"]


class MenuItemSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source="slug", read_only=True)   # the website uses the slug as id
    name = LocalizedField("name")
    description = LocalizedField("description")
    image = serializers.ImageField(use_url=True)                 # absolute URL when the request is in context
    categories = serializers.SlugRelatedField(many=True, slug_field="slug", read_only=True)
    tags = serializers.SlugRelatedField(many=True, slug_field="key", read_only=True)
    pairs_with = serializers.SlugRelatedField(slug_field="slug", read_only=True)
    variants = VariantSerializer(many=True, read_only=True)
    option_groups = OptionGroupSerializer(many=True, read_only=True)

    class Meta:
        model = MenuItem
        fields = ["id", "name", "description", "price", "image", "group", "section", "categories",
                  "tags", "is_new", "is_available", "pairs_with", "variants", "option_groups", "display_order"]
```

```python
# menu/views.py
class MenuItemViewSet(viewsets.ModelViewSet):
    serializer_class = MenuItemSerializer
    lookup_field = "slug"                                        # GET /menu/items/wow-toasted-burger/
    permission_classes = [IsMenuManagerOrReadOnly]

    def get_queryset(self):
        qs = (MenuItem.objects.order_by("display_order")
              .prefetch_related("categories", "tags", "variants", "option_groups__choices")
              .select_related("pairs_with"))
        params = self.request.query_params
        if group := params.get("group"):
            qs = qs.filter(group=group)
        if category := params.get("category"):
            qs = qs.filter(categories__slug=category)
        if not self.request.user.has_perm("menu.change_menuitem"):
            qs = qs.filter(is_deleted=False)                     # public: no soft-deleted items
        return qs
```

`prefetch_related` keeps the menu list to a handful of SQL queries even with nested variants and options.

### 5. camelCase JSON (G4)

```bash
pip install djangorestframework-camel-case
```

```python
# settings.py
REST_FRAMEWORK = {
    "DEFAULT_RENDERER_CLASSES": ["djangorestframework_camel_case.render.CamelCaseJSONRenderer",
                                 "djangorestframework_camel_case.render.CamelCaseBrowsableAPIRenderer"],
    "DEFAULT_PARSER_CLASSES": ["djangorestframework_camel_case.parser.CamelCaseJSONParser",
                               "djangorestframework_camel_case.parser.CamelCaseMultiPartParser",
                               "djangorestframework_camel_case.parser.CamelCaseFormParser"],
    # ...
}

SPECTACULAR_SETTINGS = {
    # so that /api/schema/ also shows camelCase names
    "POSTPROCESSING_HOOKS": ["drf_spectacular.hooks.postprocess_schema_enums",
                             "drf_spectacular.contrib.djangorestframework_camel_case.camelize_serializer_fields"],
}
```

Python code keeps `snake_case`; only the JSON changes (`is_available` → `isAvailable`).

### 6. Trusted Google sign-in endpoint (A4)

```python
# accounts/permissions.py
import hmac
from django.conf import settings
from rest_framework.permissions import BasePermission


class FromWebsiteServer(BasePermission):
    """Only our Next.js server knows FRONTEND_SHARED_SECRET (never sent to a browser)."""

    def has_permission(self, request, view):
        sent = request.headers.get("X-Frontend-Secret", "")
        return bool(settings.FRONTEND_SHARED_SECRET) and hmac.compare_digest(sent, settings.FRONTEND_SHARED_SECRET)
```

`POST /accounts/google/` uses `permission_classes = [FromWebsiteServer]`, finds the user by email or creates a
verified client account, and returns `auth_response(user)` (`201` when created). We share the secret privately.

### 7. Documenting responses (G1)

Every view gets its responses, including errors, so `/api/schema/` matches reality:

```python
@extend_schema(
    request=CustomerRegistrationRequestSerializer,
    responses={201: PendingVerificationSerializer, 409: ErrorSerializer, 422: ErrorSerializer},
)
def post(self, request): ...
```

### 8. Seed data (M3)

```bash
python manage.py loaddata menu_seed.json accounts_seed.json   # after migrate, on the hosted instance too
```

The initial frontend catalogue can be used as reference material for a staging fixture if seed data is needed.
