# 03 — Screen-by-Screen UX & Functional Specification

This is the artifact the Master Plan names as the immediate next deliverable:

> "Immediate next build artifact after this Master Plan: **Screen-by-Screen UX & Functional
> Specification** for the interactive demo and development team. It should translate the locked
> standards into exact screens, fields, buttons, states, validations and backend actions without
> reopening already-approved product rules."

Every screen below is implemented in `mvp/`. Field types are indicative (PostgreSQL). `→` marks a
foreign key.

---

## 1. Screen map

| # | Screen | Route in the build | Standard |
|---|---|---|---|
| 1 | Landing | `#/` | MB-FLW-001 §1 |
| 2 | Profile Q1 — Eating Style | `#/profile/1` | MB-PER-001 §1 |
| 3 | Profile Q2 — Breakfast Preference | `#/profile/2` | MB-PER-001 §1 |
| 4 | Profile Q3 — Dietary & Allergies | `#/profile/3` | MB-PER-001 §1, MB-BOX-001 §9 |
| 5 | Choose dates | `#/dates` | MB-FLW-001 §3 |
| 6 | Daily Context | `#/morning/<date>` | MB-FLW-001 §4, MB-PER-001 §2 |
| 7 | Recommendation & customization | `#/box/<date>` | MB-REC-001 §8–12 |
| 8 | Weekly summary | `#/plan` | MB-FLW-001 §6 |
| 9 | Account | `#/account` | MB-FLW-001 §7 |
| 10 | Delivery | `#/delivery` | MB-FLW-001 §8, MB-DLV-001 §1,3 |
| 11 | Review & payment | `#/review` | MB-FLW-001 §9 |
| 12 | Orders & feedback | `#/orders` | MB-FLW-001 §10, MB-DLV-001 §5,11 |
| 13 | Business, steps 1–6 | `#/business/<n>` | MB-B2B-001 |
| 14 | Operations console | `#/ops` | MB-OPS-001 |

Plus three overlays: **Swap**, **Add something extra**, **Component detail**.

---

## 2. Personal screens

### S1 · Landing

| | |
|---|---|
| **Shows** | Hero, two entry paths, four value props, the DIFC locality band, "Breakfast, reimagined" |
| **Actions** | `Create My Morning` → S2 · `Morning Box for Business` → S13 |
| **Must not** | Show bakery browsing, a menu, restaurant cards or discount visuals |
| **Validation** | None |
| **Backend** | None. No session is created until a profile answer exists |

### S2–S4 · Base Morning Profile

One question per screen, a quiet progress indicator, one primary action.

| Screen | Field | Type | Required | Values |
|---|---|---|---|---|
| S2 | `eating_style` | enum | Yes | `health` \| `flexible` |
| S3 | `preferences[]` | enum[] | Yes, ≥ 1 | `savory` \| `bakery` \| `fresh` \| `sweet` |
| S4 | `dietary[]` | enum[] | No | `vegetarian` \| `vegan` \| `dairyFree` \| `glutenFree` \| `halal` |
| S4 | `allergies[]` | enum[] | No | `gluten` \| `dairy` \| `egg` \| `peanut` \| `treenut` \| `sesame` \| `soy` |

- **Validation:** Continue stays disabled until the screen's own answer exists. S4 may be empty.
- **Backend:** upsert the reusable `morning_profile`. Any profile change **invalidates every built
  morning** — the engine must re-run rather than keep a box that may no longer be eligible.
- **Must not:** ask for price, portion, size, quantity or product composition. Registration must not
  interrupt these steps.

### S5 · Choose dates

| | |
|---|---|
| **Shows** | 14 selectable mornings from the first orderable date, each with **weekday + day + month** |
| **Rule** | The first orderable date is tomorrow before 21:00, otherwise the day after |
| **Actions** | Toggle any number of dates → Build my morning |
| **Validation** | ≥ 1 date |
| **Backend** | Create one `planned_day` per selected date, state `draft` |
| **Must not** | Rely on weekday names alone; offer same-day |

### S6 · Daily Context

| | |
|---|---|
| **Shows** | The active date in **large, unmistakable** type at the top, then four contexts |
| **Extra** | From morning 2 onward, a **Same as [previous date]** card appears above the contexts |
| **Actions** | Pick a context → S7 · or copy the previous morning → S7 |
| **Validation** | One context required |
| **Backend** | `planned_day.context`. A copy duplicates Context, Breakfast, Size, Swaps and Add-ons into an **independent** record |

### S7 · Recommendation & customization — the hero screen

**Shows**

- `Your Morning Box` with the box illustration; each compartment is tappable
- The component list with portion for the selected size, and a Swap action where one exists
- A system-substitution notice when the engine had to adjust for safety or diet
- Size selector, or a note when the breakfast is one Standard Size
- Add-on entry points for Bread and Pastry, when those groups have eligible products
- Live price, broken into Breakfast + Extras
- `Another Option for You`, when a second eligible candidate exists

**Actions and their rules**

| Action | Rule | Standard |
|---|---|---|
| Swap | Only eligible alternatives from the same Swap Group, re-filtered for safety, diet, eating style and combination compatibility. **No price change** | MB-REC-001 §9 |
| Size | Light / Regular / Large, Regular default. Changes quantity only. Hidden entirely where the breakfast is one Standard Size | MB-REC-001 §11 |
| Add-ons | Approved Bread (half/whole loaf × qty) and Pastry (piece × qty) only. A group with no eligible product is **not shown**. Default = no add-on | MB-REC-001 §12 |
| Use this instead | Swaps primary and alternative | MB-REC-001 §8 |
| Save this morning | Marks the day saved, moves to the next unsaved date, or to S8 | MB-FLW-001 §5 |

**No-match state.** When no eligible candidate exists the screen is replaced by the locked message
*"We couldn't find a Morning Box that safely matches your requirements."* with a single action,
**Review my preferences**. The system never relaxes the user's inputs.

**Backend:** persist the `recommendation_run` and the evolving `final_configuration` (see §7).

### S8 · Weekly summary

Every planned morning with exact date, breakfast, size, extras, price and an **Edit** action; then the
total count and total value. **Registration appears only after this.**

### S9 · Account

| Field | Required | Note |
|---|---|---|
| `first_name` | Yes | |
| `mobile` | Yes | + OTP |
| `email` | No | Collected optionally at checkout for the confirmation |

**Must not** ask the user to rebuild their mornings. Trade licence, TRN and company size are not
registration fields.

### S10 · Delivery

Area (live zones only) · building/floor/unit · **delivery window** (not a time). For multi-day orders,
one setup applies to all mornings unless a day is changed later.

### S11 · Review & payment

Every date with breakfast, window, location and price; then Breakfast + Extras, Delivery, Total.
Optional confirmation email. A clear statement of the free-change window.

### S12 · Orders & feedback

| | |
|---|---|
| **Shows** | Per order: id, placed-at, total. Per morning: date, breakfast, window, location, customer status trail, `Prepared by [Partner Bakery]`, proof of delivery once delivered |
| **Actions** | Cancel this morning — **only before the 9:00 PM cutoff**, full refund, and only that date. `Loved it` / `Not for me` after delivery |
| **Must not** | Expose internal operational states, or let a feedback event change a deterministic rule |

---

## 3. Business screens (S13)

| Step | Screen | Fields | Rules |
|---|---|---|---|
| 1 | Headcount | `people` int | The first and only opening question. Team/Meeting/Company is **not** asked |
| 2 | Dietary | `has_special` bool; `specials[]` of `{dietary[], allergies[], qty}` | Each special is a *group*, not a loose count. The running total stays visible |
| 3 | Selection | `mode` = `mix` \| `choose`; `lines[]` of `{model, size, qty}` | `Total Boxes = Total People` must hold. **No Swap, no extras, no component customization** |
| 4 | Dates | `dates[]` | Multi-day supported; each day independent; not a subscription |
| 5 | Delivery & company | company, building, contact person, mobile, business email, window | The contact person may differ from the orderer |
| 6 | Review & pay | — | Breakfast total → **volume discount per day** → final. Prepaid. Invoice on request |

**Morning Box Mix** distributes the general headcount as evenly as practical across the standard models
(20 → 5+5+5+5; 10 → 3+3+2+2).

---

## 4. Operations console (S14)

| Panel | Contents | Standard |
|---|---|---|
| Date selector and KPI row | Boxes in production, earliest ready-by, open exceptions, auto-reconciled | MB-OPS-001 §1 |
| Night-before cycle | One action that runs the 9:00 PM cutoff: finalize → validate capacity → final allocation → production lists | §1–2 |
| **Production View** | Aggregated by component, size and quantity, with the packing rule for each | §3 |
| **Packing View** | One row per box: box id, components, size, **allergy flags**, special marker, ready-by | §3 |
| Order progress | Per line: bakery, production state, delivery state, what the customer sees, and the available next action | §5 |
| Exception queue | Kind, owner, line, safety flag, resolve action | §8 |
| Daily reconciliation | Delivered and matched, refunded, exceptions, revenue | §9 |

**State machines**

```
Bakery     Assigned → Confirmed → In Preparation → Ready → Handed Over
                                   └─ QC must pass before Ready
Delivery   Picked Up → Out for Delivery → Delivered (+ proof of delivery)
Customer   Order Confirmed → Being Prepared → Out for Delivery → Delivered
           terminal: Cancelled · Refunded
```

An open exception blocks production progress on that line. Resolving as *Refunded — could not fulfil*
marks the breakfast refunded.

---

## 5. Cross-cutting rules

| Rule | Where it binds |
|---|---|
| Safety before preference | Every recommendation, swap and add-on |
| Same Inputs → Same Recommendation | The engine is deterministic; no randomness anywhere |
| Recommend first, customize second | S7 only; never S2–S6 |
| Exact dates, never weekday alone | S5, S6, S8, S11, S12, S14 |
| Registration after value | S9 comes after S8 |
| Window, not time | S10, S11, S12 |
| One primary action per screen | All |
| Mobile first | All — 375–430 px is the design target |

---

## 6. Validation matrix

| Screen | Blocks on |
|---|---|
| S2 | No eating style |
| S3 | Zero preferences |
| S5 | Zero dates |
| S6 | No context chosen |
| S7 | Nothing — but a swap is rejected if it is not in the eligible set |
| S9 | Missing first name or mobile |
| S13.3 | `Total Boxes ≠ Total People` |
| S13.6 | Unbalanced boxes, or no date selected |
| S14 | Invalid state transition; Ready before QC; progress while an exception is open |

---

## 7. Data model

```
morning_profile (user) ─┬─ planned_day ─── recommendation_run ─── final_configuration
                        │        │                                      │
                        │        └── delivery_setup                     ├── system_substitution[]
                        │                                               ├── user_swap[]
                        │                                               ├── size
                        │                                               └── addon[]
order ── order_day ──┬── box[] ──────────────────────────────────────────┘
                     ├── allocation ── partner_bakery
                     ├── exception[]
                     └── proof_of_delivery
```

### Core tables

**`morning_profile`** — `user_id`, `eating_style` enum, `preferences` enum[], `dietary` enum[],
`allergies` enum[], `updated_at`. Short, simple, editable.

**`component`** — `id`, `name`, `category`, `portion_light|regular|large`, `allergens` enum[],
`dietary_compatibility` enum[], `swap_group` → `swap_group.id` (nullable), `flexible_only` bool,
`standard_pastry` bool, `approved_variant` jsonb, `packaging_rule`, `preparation_standard`,
`quality_check`.
> No product may enter the recommendation, swap or add-on system without an approved ingredient and
> allergen record.

**`base_recommendation`** — `id`, `preference`, `eating_style`, `context`, `components` jsonb (ordered),
`format` text, `standard_size_only` bool. Exactly 32 rows, all defined at Regular.

**`recommendation_run`** — `planned_day_id`, inputs snapshot (eating style, preferences, context,
dietary, allergies), `selected_base_recommendation`, `alternative_base_recommendation`, `reason_code`,
`rejected_candidates` jsonb, `created_at`.

**`final_configuration`** — `run_id`, `components` jsonb, `size`, `addons` jsonb,
`system_substitutions` jsonb, `user_swaps` jsonb, `price_base`, `price_size_adjustment`,
`price_addons`, `price_total`.

**`partner_bakery`** — `id`, `name`, `area`, `in_house_bread` bool, `handling_capabilities` enum[],
`capacity_by_window` jsonb, `status`, plus distance or geo for proximity.

**`order` / `order_day` / `box`** — one order may cover several mornings; each `order_day` carries its
own delivery setup, allocation, states, exceptions, proof of delivery, refund flag and feedback.

**`exception`** — `order_day_id`, `kind`, `owner`, `state`, `action`, `outcome`, `safety` bool,
`raised_at`, `resolved_at`. Every exception has an owner, an action and a resolution.

**`audit_event`** — every state transition above, plus price and allocation snapshots.

---

## 8. API surface (indicative)

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/profile` | Create or update the Base Morning Profile |
| `POST` | `/days` | Create planned days for the selected dates |
| `PATCH` | `/days/{id}` | Set the Daily Context |
| `POST` | `/days/{id}/recommend` | Run the engine; returns Your Morning Box, Another Option, reason code |
| `GET` | `/days/{id}/swaps?component=` | Eligible alternatives for one component |
| `POST` | `/days/{id}/swap` | Apply a user swap, re-validated |
| `PATCH` | `/days/{id}/size` | Set size where a selector exists |
| `POST` | `/days/{id}/addons` | Add or remove an approved add-on |
| `POST` | `/days/{id}/copy-from/{otherId}` | Same as Previous Day, as an independent copy |
| `POST` | `/orders` | Create the order, reserve provisional bakery capacity |
| `DELETE` | `/orders/{id}/days/{dayId}` | Cancel one morning; full refund if before cutoff |
| `POST` | `/orders/{id}/days/{dayId}/feedback` | Loved it / Not for me |
| `POST` | `/ops/cutoff?date=` | Finalize orders, capacity and allocation |
| `GET` | `/ops/production?date=&bakery=` | Production View and Packing View |
| `POST` | `/ops/lines/{id}/state` | Advance bakery or delivery state |
| `POST` | `/ops/lines/{id}/exceptions` | Raise or resolve an exception |
| `GET` | `/ops/reconciliation?date=` | Daily reconciliation |

---

## 9. Acceptance tests (from Master Plan §13)

| Area | What must be proven |
|---|---|
| Profile & recommendation | Correct deterministic result for representative input combinations |
| Safety | Allergen and dietary exclusions, and approved substitutions, behave correctly |
| Customization | Swap, Size and Add-ons never bypass eligibility |
| Ordering | Day selection, next-day cutoff, checkout, edit/cancel rules, confirmation |
| Bakery | Order visibility, portions, packaging, QC and status updates |
| Delivery | Pickup readiness, handoff, correct address and window |
| B2B | People count, mix quantities, special breakfasts, invoice, fulfilment |
| Exceptions | No-match, unavailable component, delay, capacity, payment/refund, delivery issue |

Test across **all four Daily Contexts and both Eating Styles**, with single- and multi-preference cases,
and with allergy and dietary cases that must produce a **safe no-match**.
