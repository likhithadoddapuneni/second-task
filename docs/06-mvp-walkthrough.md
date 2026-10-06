# 06 — The MVP, section by section

A walkthrough of everything in `mvp/`: every screen, what the customer does, what happens underneath,
which standard governs it, and what to say about it in a demo.

Run it first — see [`../mvp/README.md`](../mvp/README.md). Read this with the app open beside you, at
phone width, which is the width it was designed for.

---

## Map

| # | Route | Screen | Standard |
|---|---|---|---|
| 1 | `#/` | Landing | MB-FLW-001 §1, MB-DSN-001 |
| 2 | `#/profile/1-3` | Base Morning Profile | MB-PER-001 §1 |
| 3 | `#/dates` | Choose your mornings | MB-FLW-001 §3 |
| 4 | `#/morning/<date>` | Daily Context (+ Same as Previous Day) | MB-FLW-001 §4–5 |
| 5 | `#/box/<date>` | Your Morning Box | MB-REC-001 §8–12 |
| 6 | `#/plan` | Weekly summary | MB-FLW-001 §6 |
| 7 | `#/account` → `#/delivery` → `#/review` | Checkout | MB-FLW-001 §7–9 |
| 8 | `#/orders` | Orders and feedback | MB-DLV-001 §5,11 |
| 9 | `#/business/1-6` | Business Breakfast | MB-B2B-001 |
| 10 | `#/ops` | Operations console | MB-OPS-001 |

---

# Part A — The customer journey

## Section 1 · Landing `#/`

**What you see.** A hero built from the approved homepage direction: the editorial headline with its
second line in gold, two entry paths, four value props, the DIFC locality band, and a plain explanation
of how it works.

**What happens underneath.** Nothing — deliberately. No session, no tracking, no questions. The two CTAs
are the only decision on the page, because MB-DSN-001 §9 asks for one primary action per screen.

**Worth pointing out.** There is no menu, no bakery grid and no discount badge anywhere. That is a
product rule, not a styling choice: *"Do not introduce restaurant/bakery grids, menus, ratings or
marketplace-style discovery."*

> **Demo line:** "This is the whole homepage. Two paths. If it looked like Deliveroo we would have failed
> the design standard on the first screen."

---

## Section 2 · The three profile questions `#/profile/1…3`

**What you see.** One question per screen, a quiet three-segment progress bar, large tappable answers
with an unmistakable selected state, and one primary action.

**What happens underneath.**

- **Q1 Eating Style** sets the recommendation *branch*. Health-Conscious and Flexible never cross over.
- **Q2 Breakfast Preference** is multi-select and **expands the candidate pool** — it never blends two
  categories into one box.
- **Q3** is one screen with two clearly separated areas, Dietary and Allergies, exactly as MB-PER-001 §1
  specifies. Both are optional; both are hard rules when set.

Changing any answer **invalidates every morning already built**, so the engine re-runs. Keeping a box
assembled under different safety inputs would breach MB-REC-001 §3.

**What is deliberately absent.** No price, portion, size or quantity question. Those belong to the
ordering flow, not the profile.

> **Demo line:** "Three questions. That is the whole onboarding. The standard caps it at three and says
> they must stay editable — so they are."

---

## Section 3 · Choose your mornings `#/dates`

**What you see.** Fourteen date tiles, each showing weekday, day number and month. A note states the
current time and the earliest morning that can be prepared.

**What happens underneath.** The first orderable date is tomorrow before 21:00, and the day after once
the cutoff has passed. Each selected date becomes an independent planned day.

**Worth pointing out.** MB-FLW-001 §3 forbids relying on weekday names alone — "Tuesday" is ambiguous
when you are planning eleven days out, so every tile carries the exact date.

---

## Section 4 · Daily Context `#/morning/<date>`

**What you see.** The active date in large type at the top, then four contexts. From the second morning
onward, a **Same as [previous date]** card appears *above* the contexts with the previous breakfast shown.

**What happens underneath.** The context is stored on the day, never on the profile — MB-PER-001 §2 is
explicit that one user has one profile and different mornings. Copying a day deep-copies context,
breakfast, size, swaps and add-ons into an independent record: editing the copy never touches the original.

> **Demo line:** "Tuesday can be a busy morning and Wednesday relaxed, without touching who you are."

---

## Section 5 · Your Morning Box `#/box/<date>` — the hero screen

This is where the engine shows its work.

### What you see
The box itself, drawn as an open kraft box with one compartment per component and the real portion under
each. Then the component list, the size selector, the add-on entries, the live price, and —
when one exists — *Another Option for You*.

### What happens underneath — the MB-REC-001 pipeline

1. **Pool.** Filter the 32 Base Recommendations to the user's Eating Style branch, the exact Daily
   Context, and only the preferences they selected.
2. **Safety filter.** For each candidate, check every component against the allergen record and the
   dietary requirements.
3. **Approved substitution.** If a component fails, look in its Swap Group for one that is eligible *and*
   compatible with the rest of the box. A substitution may only come from the Morning Box library —
   never the bakery's general menu.
4. **Reject, do not weaken.** If no approved substitution exists, the whole Base Recommendation leaves
   the pool.
5. **Tie-break.** If more than one candidate survives, order them by the Context Priority table.
6. **Output.** Highest priority becomes *Your Morning Box*; the next becomes *Another Option for You*.

### The parts worth demonstrating

| Behaviour | What it proves |
|---|---|
| **System substitution notice** | With a peanut allergy on a Sweet breakfast, peanut butter becomes honey and the screen says so. Approved library only |
| **Swap** | Only eligible alternatives appear, re-filtered for safety, diet, eating style and combination compatibility. Same group, so the price does not move |
| **No swap on some items** | Avocado, olives, Greek yogurt and overnight oats have no meaningful equivalent, so they display no Swap action at all |
| **Size** | Light / Regular / Large changes quantity, never composition. Two simple Busy breakfasts show no selector at all, with the reason stated |
| **Add-ons** | Bread and pastry only. A group with no eligible product is not shown — not greyed out, not shown |
| **One strong recommendation** | With a single preference selected there is no second option, and the screen explains why |
| **No-match** | The locked message appears, with one action: Review my preferences |

### Tapping a compartment
Opens the component's record: portion at the selected size, category, declared allergens, and the
approved variant where one applies. *"No product may enter the recommendation, swap or add-on system
without an approved ingredient and allergen record."*

> **Demo line:** "Tap the peanut butter… it is not there. I declared a peanut allergy three screens ago,
> so the engine substituted honey before it showed me anything, and it told me it had done so."

---

## Section 6 · Weekly summary `#/plan`

Every planned morning with its exact date, breakfast, size, extras and price, each editable; then the
total count and total value.

**Why this screen exists at all.** MB-FLW-001 §6 requires the value to be visible *before* registration,
and the prepared plan to survive registration intact. The order of these two screens is a product
decision, not a layout one.

---

## Section 7 · Checkout `#/account` → `#/delivery` → `#/review`

| Screen | Rule it enforces |
|---|---|
| **Account** | Mobile + OTP + first name. Email optional. Never ask the user to rebuild their mornings |
| **Delivery** | Live zones only. A **window**, not a time — "Morning Box promises a delivery window, not an exact delivery time" |
| **Review** | Every date with breakfast, window, location and price, plus a clear statement of the free-change window |

---

## Section 8 · Orders and feedback `#/orders`

**What you see.** Per morning: the date, the breakfast, the window, a four-step status trail,
*Prepared by [Partner Bakery]* once allocated, and proof of delivery once delivered.

**Cancellation.** Free until 9:00 PM the evening before — and cancelling one date never touches the
others. After the cutoff the button is replaced by an explanation, because production and routing have
begun.

**Feedback.** *Loved it* / *Not for me* after delivery. The screen says plainly that it is recorded as a
learning signal and never changes a safety rule — MB-REC-001 §14 separates Safety Data from Preference
Data.

> **Demo line:** "Bakery name, yes. Bakery choice, no. The customer never picks the bakery — that is
> allocation, and it is ours."

---

## Section 9 · Business Breakfast `#/business/1…6`

| Step | What it does | Rule |
|---|---|---|
| 1 Headcount | The first and only opening question | Team / Meeting / Company is never asked — "don't ask a question unless the answer changes the experience" |
| 2 Dietary | One yes/no, then **Special Breakfast groups** combining requirement + quantity | Not ambiguous separate counts |
| 3 Selection | **Morning Box Mix** spreads evenly across the standard models, or **Choose Your Boxes** | `Total Boxes = Total People` is validated continuously |
| 4 Dates | Multi-day, each day independent | Not a subscription |
| 5 Delivery | Company, building, contact person, mobile, business email, window | The contact may differ from the orderer; no trade licence or TRN |
| 6 Review | Breakfast total → **volume discount per day** → final | Prepaid, invoice on request |

**What business deliberately removes:** no Swap, no extras, no component-level customization. Only
Model × Size × Quantity. That is MB-B2B-001 §5, and it exists to keep group ordering fast and
operationally reliable.

**The honest edge case.** Add *Vegan + Tree nut × 3* and the library cannot produce it. The review screen
says "needs manual confirmation", and placing the order raises a **Dietary/Allergy exception** owned by
Operations rather than letting those three boxes quietly disappear.

---

## Section 10 · Operations console `#/ops`

Not a customer screen. This is the night-before and morning-of surface.

| Panel | What it shows |
|---|---|
| **KPI row** | Boxes in production, earliest ready-by, open exceptions, auto-reconciled |
| **Night-before cycle** | One action runs the 9:00 PM cutoff: finalize orders, validate capacity, finalize allocation, generate production lists |
| **Production View** | Aggregated by component, size and quantity — what the kitchen must make — with each component's packing rule |
| **Packing View** | One row per box: id, components, size, **allergy flags**, special marker, ready-by time |
| **Order progress** | Per line: bakery, production state, delivery state, what the customer sees, and the next available action |
| **Exception queue** | Kind, owner, safety flag, resolve |
| **Reconciliation** | Delivered and matched, refunded, exceptions, revenue |

**The two views are the point.** MB-OPS-001 §3: *"Aggregate for production. Separate for packing.
Identify every order for handover."* One dataset, two shapes, because a kitchen and a packing bench need
opposite things.

**The QC gate is real.** Try to mark a line Ready before passing QC and the transition is refused —
*"A Morning Box may only be marked Ready after the final assembled breakfast matches the approved
product specification and the confirmed customer order."*

**Allocation.** Bakeries are filtered on product capability, dietary and allergy handling, capacity and
delivery window, and only then sorted by proximity. Select a gluten-free requirement and three of the
four partners are excluded with the reason shown. For business orders it is Single Bakery First,
expanding to the next nearest eligible partner only when capacity requires — and the customer still sees
one order and one payment.

> **Demo line:** "Advance this line to Ready… refused, because QC has not passed. The standard says a box
> may only be marked Ready after the final product matches the spec, so the button enforces it."

---

# Part B — The code, file by file

```
mvp/
├── index.html              Page shell, fonts, header, footer
├── css/morningbox.css      The whole design system as tokens
└── js/
    ├── standards.js        Controlled vocabularies, context priority, cutoff, windows, pricing architecture
    ├── library.js          Core Component Library: portions, allergen records, swap groups, eligibility
    ├── recipes.js          The 32 Base Recommendations, verbatim from MB-PRO-001 §12
    ├── engine.js           MB-REC-001: filter, substitute, match, tie-break, swap, size, add-ons, trace
    ├── operations.js       Bakeries, allocation, orders, cutoff, production lists, exceptions, reconciliation
    ├── art.js              Food illustrations drawn from each component's own record
    ├── ui.js               Brand mark and the icon family
    └── app.js              Router, every screen, and one delegated action handler
```

| File | Key exports |
|---|---|
| `standards.js` | `EATING_STYLES`, `PREFERENCES`, `DIETARY`, `ALLERGENS`, `CONTEXTS`, `CONTEXT_PRIORITY`, `DELIVERY_WINDOWS`, `firstOrderableDate`, `cutoffFor`, `isBeforeCutoff` |
| `library.js` | `COMPONENTS` (35), `SWAP_GROUPS` (10), `NO_DIRECT_SWAP`, `isComponentEligible`, `resolveBuild`, `portion`, `packingNote` |
| `recipes.js` | `BASE_RECOMMENDATIONS` (32), `describe`, `priceLevel`, `auditLibrary` |
| `engine.js` | `recommend`, `resolveEligibility`, `swapOptions`, `applySwap`, `setSize`, `addonGroups`, `priceBox`, `traceRecord`, `morningBoxMix`, `resolveSpecial`, `priceBusinessDay` |
| `operations.js` | `BAKERIES`, `allocate`, `allocateBusiness`, `createOrder`, `cancelDay`, `runCutoff`, `productionPlan`, `advanceBakery`, `recordDelivery`, `raiseException`, `reconcile` |

Every file cites the governing standard section at the point of decision. If a number looks arbitrary,
the citation beside it says where it came from — and `recipes.js` carries a self-audit that fails the
build if the 32 combinations are ever incomplete.

---

# Part C — Cross-cutting concerns

## Determinism
`Same Inputs → Same Recommendation`. There is no randomness anywhere in the recommendation path. The
demo catalogue is generated from a fixed seed so every machine shows the same thing.

## Traceability
`traceRecord()` produces the backend record MB-REC-001 §15 requires: the inputs, the selected base
recommendation and reason code, every system substitution and user swap, the size, the add-ons, and the
final configuration with portions and price.

## The design system
`css/morningbox.css` is MB-DSN-001 as tokens: six brand colours, the 8 px spacing system, the
DM Serif Display / Inter pairing, pill CTAs in Morning Gold, and ~48 px minimum tap targets. Nothing
outside that file hard-codes a brand value.

**Mobile-first is literal here.** The base stylesheet is the phone layout; two media queries expand it.
The selected state uses a tick as well as colour, because MB-DSN-001 §10 forbids relying on colour alone.

## Food imagery
There is no photography and none is faked. `art.js` draws each component from its own record — type,
category and portion. Swap the bread and the picture changes because the data changed. When real
photography arrives, `foodArt()` is the single function to replace.

---

# Part D — Demo cue card

| Stop | Click | Say |
|---|---|---|
| 1 | Landing | "Two paths. No menu, no bakery grid — that is a product rule." |
| 2 | Three questions | "Three. The standard caps onboarding at three and they stay editable." |
| 3 | Add a peanut allergy | "A hard safety filter, applied before anything is recommended." |
| 4 | Two dates | "Exact dates, never weekday alone. Cutoff is 9 PM." |
| 5 | Daily context | "Belongs to the day, not to who you are." |
| 6 | The box | "This is the hero. One confident recommendation, not twenty options." |
| 7 | The substitution notice | "It substituted honey for peanut butter and told me — approved library only." |
| 8 | Swap the bread | "Only eligible alternatives. Same group, so the price does not move." |
| 9 | Size | "Quantity, not composition. Some Busy boxes have no size at all, and it says why." |
| 10 | Save → day two | "Same as yesterday — a copy that stays independent." |
| 11 | Summary before signup | "Value first, registration second. The plan is never rebuilt." |
| 12 | Orders | "Prepared by the bakery. Free cancellation until 9 PM, that date only." |
| 13 | Business: 35 people, vegan + tree nut | "Special groups, not loose counts." |
| 14 | Operations | "Production view aggregates; packing view separates. One dataset, two shapes." |
| 15 | Try Ready before QC | "Refused. The standard says QC first, so the button enforces it." |

### Three things to show that most demos would hide

1. **A no-match.** Set Gluten-Free and run any morning. It returns nothing, and says so.
2. **A single preference.** No *Another Option for You*, with the reason stated on screen.
3. **An unmatchable Special Breakfast.** It becomes an operations exception instead of vanishing.

Each one is the product refusing to flatter itself, which is the most convincing thing a
recommendation engine can do in front of a client — and the third one is how the gluten-free gap in
`docs/05` was found.
