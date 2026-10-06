# 02 — The twelve locked standards, digested

Everything below is drawn from the supplied PDFs. Where a standard carries values the engine needs, the
values are reproduced so the build team does not have to reopen a PDF. **The locked standards remain the
source of truth** — this is a working digest, not a replacement.

---

## A. The mental model

```
Base Morning Profile  →  Daily Context  →  Weekly Morning Plan  →  Learned Behaviour
        (who)               (this day)         (which days)         (post-MVP)

Safety → Eating Style → Daily Context → Breakfast Preference → Dietary Compatibility
       → Eligible Base Recommendation → Your Morning Box / Another Option
```

One user. One profile. Different mornings.
**Recommend first. Customize second. Safety before preference.**

---

## B. MB-PRD-001 · Core Product · MB-USR-001 · Users

Two user types, four use cases:

| User | Need |
|---|---|
| **Personal** | A personalised, pre-planned breakfast without browsing menus or choosing between many options. Not limited to office workers |
| **Business** | Breakfast for a team, meeting or company without managing individual orders or complex catering |

Explicitly **out of scope**: on-demand breakfast, restaurant or bakery browsing, fully custom meals,
event catering, subscriptions, recurring automated orders, item-by-item meal construction.

---

## C. MB-PER-001 · Personalization & Morning Profile

**Three profile questions, and no more.**

| Q | Question | Answers |
|---|---|---|
| 1 | How do you usually like to eat? | Health-Conscious / Flexible |
| 2 | What kind of breakfast do you usually enjoy? | Savory / Bread & Pastry / Fresh & Wholesome / Sweet — **multi-select** |
| 3 | Any dietary requirements or allergies? | Two clearly separated areas, both multi-select, both editable |

Price, portion, size, quantity and product customization are **deliberately not** profile questions.

**Daily Context** belongs to the day, not the profile: Active Morning / Regular Workday / Busy & On the
Go / Relaxed Morning. Only ask it when it can meaningfully change the recommendation.

**Weekly plan**: plan one day, several, or a week. *Same as Previous Day* and *Use This Plan Again* are
deliberate user actions — a copied week is **never** an automatic subscription.

---

## D. MB-BOX-001 · Product & Menu Architecture

- **Recommend → Swap within category → Add Something Extra → Confirm.** There is no Remove action;
  safety exclusions happen before the recommendation is generated.
- **Swap** replaces one component with one eligible alternative from its internal Swap Group. It does not
  add a component and does not change the price.
- **Add-ons** are standalone approved bakery products, presented separately after the breakfast.
- **Size** is Light / Regular / Large, Regular default. *Size changes quantity, not composition.*
- **Pricing:** `Breakfast Base Price + Size Adjustment + Add-ons = Final Price`. Morning Box may use a
  limited number of internal price levels; they are never shown as user-facing budget categories.
  **Actual AED prices are TBD.**
- **Beverages are not in the MVP.** Coffee, tea, juice, water and smoothies are outside the Core Product
  Library. After confirmation Morning Box may offer an assistant-style reminder to prepare a drink —
  not part of the order.
- **Allergy = hard safety filter.** An allergen-restricted item must not appear in a recommendation, a
  swap or an add-on. For sensitive requirements such as Gluten-Free, a partner bakery must be
  *specifically eligible for the required handling standard*; offering a labelled product is not enough.

---

## E. MB-PRO-001 · Production & Food Specification

### Portion system
Regular is the reference. `Light < Regular < Large`, with **no universal scaling ratio** — each component
carries its own approved portions in the unit that suits it (piece, egg count, grams, loaf).

| Category | Examples and Regular portions |
|---|---|
| Egg & hot savory | Scrambled eggs 2 · Omelette 2 · Boiled eggs 2 · Beans 120 g |
| Savory protein *(Flexible only)* | Chicken sausage 2 pcs · Beef bacon 40 g · Turkey bacon 40 g |
| Bread *(all baked in-house, untoasted by default)* | White / Whole Wheat Sourdough, Multigrain, Ciabatta, Focaccia — 60 g |
| Pastry *(one piece at any size)* | Plain Croissant 55–70 g · Cheese Croissant 65–80 g · Pain au Chocolat 60–75 g · Fruit Danish 70–90 g |
| Fresh savory | Avocado 60 g · Tomato 75 g · Cucumber 75 g · Mixed greens 30 g · Olives 30 g |
| Fruit | Seasonal mix 150 g (min. 3 fruits) · Berries 75 g · Banana medium |
| Dairy & cheese | Greek yogurt 150 g · Labneh 75 g · Feta 45 g |
| Grains & bowls | Overnight oats 200 g · Granola 45 g · Muesli 45 g |
| Spreads | Cream cheese 30 g · Butter 15 g · Honey 15 g · Jam 15 g · Peanut butter 25 g |

### Swap Groups (§11)
`Egg/Hot Main` · `Savory Protein` · `Bread` · `Pastry` · `Fresh Vegetable` · `Fruit` · `Savory Dairy` ·
`Dry Grain` · `Savory/Neutral Spread` · `Sweet Spread`.

**No direct swap:** Avocado, Olives, Greek Yogurt, Overnight Oats — these display no Swap action.

A swap preserves the **role**, not exact weight or nutrition. Same group = no price change. A
*Combination Compatibility Filter* must prevent mechanically valid but unsuitable results — for example,
beans offered as a sandwich swap.

### The 32 Base Recommendations (§12)
4 Breakfast Preferences × 2 Eating Styles × 4 Daily Contexts. All defined at **Regular** size; Light and
Large are derived from component portions. **No separate Light or Large recipes exist.**

- Regular Savory normally uses four core components; a fifth only when context justifies it.
- Standard pastries are not the default for Health-Conscious users — a recommendation direction, not a
  prohibition.
- A very simple Busy breakfast may be offered in **one Standard Size only**, with no size selector.

### Packaging (§15.2)
Dry grains never pre-mixed with wet. Bread and pastry protected from hot and wet. Spreads portioned
separately unless the specification defines a ready-to-eat format. Pre-assemble only when the spec
requires it.

### Quality check (§15.3)
`Correct Product → Correct Portion → Correct Swap → Dietary/Allergy Compliance → Freshness & Appearance
→ Correct Packaging`. **A box may only be marked Ready after this passes.**

---

## F. MB-REC-001 · Recommendation & Decision Logic — the engine

### Four stages
`Understand → Filter → Match → Recommend`

### The locked rules (§16.1)

1. Safety always comes first.
2. Only Morning Box-approved products and Base Recommendations may be used.
3. **Same Inputs → Same Recommendation.** Deterministic and rule-based. No randomness, no unsupported AI claims.
4. Eating Style defines the recommendation branch — and there is **no automatic cross-over**.
5. Daily Context is never silently changed.
6. Multiple Breakfast Preferences **expand the pool**; they are never combined into one hybrid breakfast.
7. Context Priority resolves ties between multiple eligible selected Preferences.
8. Customization happens after Recommendation and cannot bypass eligibility.
9. **No eligible match is better than an unsafe or forced recommendation.**
10. Feedback is collected for learning but does not override deterministic MVP rules.

### Safety and substitution (§3)
`Base Recommendation → Component Check → Approved Safe Substitution → Eligible / Ineligible`

A substitution may only come from the Morning Box-approved Component Library — **never** the partner
bakery's general menu. If no approved compatible substitution exists, the Base Recommendation is removed
from the Candidate Pool.

### Context priority — tie-break only (§7)

| Daily Context | 1 | 2 | 3 | 4 |
|---|---|---|---|---|
| Active Morning | Savory | Fresh & Wholesome | Bread & Pastry | Sweet |
| Regular Workday | Savory | Fresh & Wholesome | Bread & Pastry | Sweet |
| **Busy & On the Go** | **Bread & Pastry** | Savory | Sweet | Fresh & Wholesome |
| Relaxed Morning | Savory | Bread & Pastry | Fresh & Wholesome | Sweet |

Busy differs because portability and ease of eating decide the order; bowls and cups need more handling.

### Another Option for You (§8)
The **next** highest-priority eligible candidate, within the same selected preferences, Eating Style and
Daily Context. If only one eligible candidate exists, it is not shown.

### No-match (§13.1) — the message, verbatim
> *"We couldn't find a Morning Box that safely matches your requirements."*
> Action: **Review my preferences**

The user may review their own inputs. The system does not relax them.

### Traceability (§15)
Every recommendation must be traceable from inputs → substitutions → swaps → size → add-ons → final
configuration. Internal reason codes: `PRIMARY_CONTEXT_PRIORITY`, `SECONDARY_ELIGIBLE_OPTION`,
`SYSTEM_DIETARY_SUBSTITUTION`, `NO_ELIGIBLE_RECOMMENDATION` — backend only, never shown to the customer.

### System Substitution vs User Swap (§10)

| | When | Purpose |
|---|---|---|
| **System Substitution** | Before the recommendation is shown | Make an otherwise compatible Base Recommendation eligible |
| **User Swap** | After the recommendation is shown | Controlled customization from eligible alternatives |

Backend records which one occurred.

---

## G. MB-FLW-001 · Experience & Ordering Flow

**Simple questions. Clear choices. Fast decisions.**

### Personal
`Create My Morning → 3 Base Profile Questions → Choose Date(s) → Daily Context → Your Morning Box →
Size → Swap → Add Something Extra → Final Breakfast + Price → Weekly Summary → Create Account / Sign In
→ Delivery → Payment → Confirm`

- Registration appears **only after value has been created**, and the prepared plan must never be rebuilt.
- MVP registration = **Mobile Number + OTP + First Name**. Email optional at checkout.
- Every selectable morning shows the day **and exact date**; weekday names alone are not enough.
- Complete one morning before moving to the next.
- For the next date: *Same as Previous Day* or *Choose a Different Morning*. A copy carries Context,
  Breakfast, Size, Swaps and Add-ons but stays independently editable.

### Business
`Business Breakfast → Number of People → Breakfast Selection → Day → Delivery → Confirm`

Team / Meeting / Company are **use cases, not a mandatory classification screen**.

---

## H. MB-B2B-001 · Business & Team Breakfast

- All business breakfasts are **individual boxes**, never shared platters.
- **Morning Box Mix** spreads the general order evenly across standard models (20 → 5+5+5+5; 10 → 3+3+2+2).
  **Choose Your Boxes** lets the user pick models and quantities.
- **Special Breakfast** groups combine the requirement with a quantity — *Vegan + Nut Allergy × 2* —
  rather than ambiguous separate counts. They stay separate from the general mix.
- Business removes component-level customization entirely: **no Swap, no extras.** Only Model × Size × Quantity.
- `Total Boxes = Total Number of People` must hold continuously.
- Volume discount is automatic, **calculated per day**, never aggregated across days. **Tiers are TBD.**
- Prepaid. Tax invoice on request. Credit accounts and 30-day terms are out of MVP.

---

## I. MB-DLV-001 · Delivery & Fulfilment

| Rule | Value |
|---|---|
| Order cutoff | **9:00 PM** the previous day |
| Delivery windows | 7:30–8:30 / 8:30–9:30 / 9:30–10:30 AM |
| Promise | The **window**, not an exact minute |
| Customer tracking | Order Confirmed → Being Prepared → Out for Delivery → Delivered |
| Cancellation before cutoff | **Full refund** for that breakfast. Cancelling one date does not cancel the others |
| Cancellation after cutoff | Not eligible for a full refund — production and routing have begun |
| Morning Box cannot fulfil | **Full refund** for the affected breakfast |
| Proof of delivery | Delivery Time + Location/Point + Recipient Type. No signature needed for MVP |

**Allocation:** filter on Product Availability → Dietary/Allergy Capability → Capacity → Delivery Window,
then apply the locked **proximity-first** rule. For large business orders, **Single Bakery First**,
expanding to the next nearest eligible partner only when capacity requires it — the customer still has
one order and one payment.

> *Arrival is not delivery. Handover is delivery.*
> *Freshness takes priority over delivery efficiency.*
> *Morning Box owns the customer experience, even when a partner causes the problem.*

---

## J. MB-BKY-001 · Partner Bakery

- Every partner must **bake its own bread in-house**.
- Every approved product needs an ingredient, allergen and dietary-compatibility record.
- The same Morning Box standard does **not** require the same ingredient supplier across bakeries.
- The customer never browses or selects the bakery. After allocation, Order Details may show
  *Prepared by [Partner Bakery]*.
- **Accepted Order = Production Commitment.** Bakery actions: Confirm → In Preparation → Report Delay → Ready.
- Onboarding gates: eligibility (in-house bread) · product approval · safety data · capacity · packaging ·
  system readiness · pilot.

---

## K. MB-OPS-001 · Operations

**Plan the night before. Execute by exception in the morning.**

- **9:00 PM:** finalize orders → validate capacity → final bakery allocation → generate production lists →
  bakery confirmation → finalize delivery routes.
- Capacity is **reserved when the customer pays** (provisional allocation) and **finalized at cutoff**.
- Two views from one dataset: the **Production View** aggregates what the kitchen must make; the
  **Packing View** says exactly what belongs in each box. Allergy and Special Breakfast requirements must
  be identifiable in **both**.
- A bakery must explicitly **Confirm Production Plan or Report an Issue** — and must never confirm then
  silently change an order during production.
- Morning states: `In Preparation → Quality Check → Ready → Courier Pickup → Handed Over → Out for
  Delivery → Delivered`. Ready-by times are derived per batch from the delivery window.
- **Every exception has an Owner, an Action and a Resolution.** Safety concerns get the highest priority.
  Partners never decide customer-facing remedies.
- Daily reconciliation: `Customer Order ↔ Bakery Fulfilment ↔ Delivery Record`. Matches auto-reconcile;
  only mismatches queue. Failed, late, refunded and partner-caused orders stay identifiable.

---

## L. MB-DSN-001 · Design & UI

Premium / Minimal / Warm / Fresh / Personal / Intelligent / Calm / Modern.
**Never** a bright multi-colour marketplace, crowded restaurant cards, discount-led visuals or
Deliveroo-style browsing.

| Token | HEX | Use |
|---|---|---|
| Morning Gold | `#D99A12` | Primary accent; CTA, active states, key highlights |
| Deep Espresso | `#3B2D22` | Primary text, dark sections, premium contrast |
| Warm Ivory | `#FBF7EF` | Default page background |
| Soft Sand | `#E9D8BD` | Cards, panels, secondary surfaces |
| Muted Gold | `#B98524` | Borders, small labels, secondary accents |
| Pure White | `#FFFFFF` | High-contrast surfaces |

> Ivory and white dominate. **Gold is an accent, not a background for entire screens.**

**Typography:** DM Serif Display (display) + Inter (UI/body). Hero 48–72 px desktop, 36–48 px mobile.
**Spacing:** 8 px system; sections 72–112 px desktop, 48–72 px mobile.
**Mobile-first is a requirement**, not a preference: design and test at 375–430 px, then expand.
**Accessibility:** ~44 × 44 px minimum targets; never gold for small body text on ivory; focus, error and
selected states must not rely on colour alone.

### §9 Product UI rules
One primary action per screen · no restaurant browsing · personalization feels guided, not like a form ·
selection is visual and immediate · **the recommendation is the hero** · bakery assignment is secondary ·
business follows the same system · feedback stays lightweight.
