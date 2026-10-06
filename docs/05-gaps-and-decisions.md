# 05 — Gaps in the standards, and the decisions taken

Every item below is a place where the locked standards are silent, ambiguous, or could not be executed
as written. Each records the decision used in `mvp/` so it can be confirmed or overruled.

---

## The finding that should be read first

### Gap 1 — Gluten-Free and gluten allergy cannot be served at all

Running every dietary requirement against all 32 approved Base Recommendations gives:

| Requirement | Base Recommendations that can be served |
|---|---|
| No restrictions | 32 of 32 |
| Peanut allergy | 32 of 32 |
| Vegetarian | 28 of 32 |
| Tree nut allergy | 24 of 32 |
| Egg allergy | 22 of 32 |
| Dairy allergy | 12 of 32 |
| Dairy-Free | 9 of 32 |
| Vegan | 8 of 32 |
| **Gluten-Free** | **0 of 32** |
| **Gluten allergy** | **0 of 32** |

MB-BOX-001 §9 names Gluten-Free explicitly as a supported requirement, needing a bakery *"specifically
eligible for the required handling standard"*. But the Core Item Library (MB-BOX-001 §4.2, MB-PRO-001 §4)
contains only wheat breads, and all three approved grains — overnight oats, granola, muesli — carry
gluten. There is no gluten-free product of any kind in the approved library.

**The engine is behaving correctly.** It refuses to invent a substitute from outside the approved
library, exactly as MB-REC-001 §3 requires, and returns the locked no-match message. The hole is in the
product, not the logic.

**Decision taken:** none — the build surfaces it honestly. Resolving it is a product decision with three
possible shapes: add a gluten-free bread and grain to the Core Library; declare Gluten-Free out of MVP
scope and remove it from the profile question; or keep it and accept that those customers always receive
a no-match. The first is the only one that matches what MB-BOX-001 §9 currently promises.

The same reasoning applies, less severely, to vegan (8/32) and dairy-free (9/32): there is no plant
yogurt, no vegan pastry and no vegetarian savory protein in the library.

---

## Confirmed gaps

| # | Gap | Where | Decision taken here |
|---|---|---|---|
| 2 | **No vegetarian savory protein.** The Savory Protein swap group is chicken sausage, beef bacon and turkey bacon — all meat. A vegetarian loses all four Flexible/Savory models | MB-PRO-001 §11 | Those four Base Recommendations are removed from the pool for vegetarians, which is correct behaviour but costs 4 of 32 |
| 3 | **Overnight Oats has two builds but one record.** §9 approves "rolled oats + approved dairy **or plant milk** base", yet the component is modelled as a single item | MB-PRO-001 §9 | Implemented as an **approved variant** of the same component, selectable by the engine under §3's substitution rule. It lifts vegan from 5 to 8 of 32. The variant is carried into the production list so the kitchen knows which build to make. **Needs sign-off** |
| 4 | **Every AED figure is TBD.** Retail prices, size adjustments, add-on prices, bakery settlement and volume-discount tiers are all explicitly deferred | MB-BOX-001 §8, MB-B2B-001 §7, Master Plan §11 | The price *architecture* is implemented exactly; the numbers are placeholders, labelled indicative wherever a price appears |
| 5 | **The homepage reference contradicts the product standard.** The approved design image shows a coffee cup inside the Morning Box; MB-BOX-001 §4.10 excludes all beverages from the MVP | MB-DSN-001 §8 vs MB-BOX-001 §4.10 | The product standard wins: no beverage appears anywhere in the build. MB-DSN-001 §8 already says the image is a design reference, not a content specification — worth noting before anyone briefs a photographer |
| 6 | **No rule for a Special Breakfast that cannot be matched.** A business order may contain a requirement the library cannot serve | MB-B2B-001 §3 | The review screen shows *"needs manual confirmation"*, and placing the order raises a **Dietary/Allergy exception** owned by Operations. MB-OPS-001 §8 requires ownership; the standards do not say whether the order should be blocked outright |
| 7 | **Which Busy breakfasts are "simple enough" for one Standard Size is not defined** | MB-PRO-001 §13.1 | Applied to the two Busy models whose components are all fixed-unit or whole items — Cheese Croissant + Banana, and Pain au Chocolat + Banana. Everything else keeps Light/Regular/Large. **Needs confirmation** |
| 8 | **The Combination Compatibility Filter is named but not specified.** §11 requires it and gives one example (beans in a sandwich) | MB-PRO-001 §11 | Implemented as two rules: an alternative already present elsewhere in the box is excluded, and a component marked unsuitable for a ready-to-eat format is excluded from that format. More rules will surface in the pilot |
| 9 | **Bakery handling eligibility has no definition.** §9 requires a bakery to be "specifically eligible" for gluten-free and allergy preparation, but nothing says what qualifies | MB-BOX-001 §9 | Modelled as capability flags on the partner record (`glutenFreeHandling`, `nutFreeLine`) that gate allocation. What earns a flag is an onboarding and audit question, not a software one |
| 10 | **No Food Safety & Handling Standard exists.** MB-PRO-001 §15.4 correctly refuses to invent holding temperatures and times, and defers to a future `MB-FDS-001` | MB-PRO-001 §15.4 | Nothing invented. Ready-by times are derived from the delivery window; no temperature or holding logic is simulated |
| 11 | **Large business orders have no lead-time rule.** MB-DLV-001 §2 says the 9:00 PM cutoff applies "unless a future large-order policy explicitly requires a longer lead time" | MB-DLV-001 §2 | The 9:00 PM cutoff is applied uniformly. A 200-box order placed at 20:55 is accepted if capacity exists — which may not be operationally sane |
| 12 | **Service-credit levels are deferred.** A late delivery is a recorded service failure, but the remedy is TBD | MB-DLV-001 §6, §11 | Late delivery is recorded; only the "could not fulfil" case triggers the full refund the standard does mandate |
| 13 | **Context Priority never fires for single-preference users.** The tie-break table only applies when more than one preference is selected and more than one candidate survives | MB-REC-001 §7 | Correct per the standard — but it means a single-preference user never sees *Another Option for You*, by design. Worth confirming as acceptable UX before launch |
| 14 | **Learned Behaviour is described but excluded from MVP.** MB-PER-001 §4 describes learning; MB-REC-001 §14 forbids a single feedback event from changing a rule | MB-PER-001 §4 vs MVP scope | Feedback is captured and stored against user, base recommendation, final configuration, context and value. Nothing acts on it. The association is recorded so the data is usable later |

---

## Interpretation calls (defensible, but worth confirming)

| # | Call | Rationale |
|---|---|---|
| A | **Eating Style is applied as a hard branch filter**, including excluding standard pastries and Flexible-only proteins from Health-Conscious recommendations | MB-REC-001 §4.1 says these "are not default recommendations" for that branch and §4.3 forbids automatic cross-over. Treating it as a filter is the only reading that honours both |
| B | **Allergen records were authored for this build.** The standards require every product to carry one but do not publish them | Each component's allergens follow its stated ingredients — bread and the three grains carry gluten, pastries carry gluten/dairy/egg, dairy items carry dairy, peanut butter carries peanut, granola and muesli carry tree nuts. **These must be replaced by the partner bakery's verified records before any real order** |
| C | **A Base Recommendation is rejected the moment any one component cannot be made safe**, rather than being served incomplete | MB-REC-001 §3: *"If no approved compatible substitution exists, the Base Recommendation is removed from the Candidate Pool"* |
| D | **Internal price levels are derived from composition**: component count plus a premium-category weighting maps to one of four levels | MB-BOX-001 §8 allows "a limited number of internal price levels based on product composition and cost" and forbids exposing them. Four levels, never shown |
| E | **Proximity is modelled as a stored distance per zone** rather than live geocoding | The MVP allocation rule is "nearest eligible partner bakery". Distance per delivery zone is enough to implement and test the rule |
| F | **A copied morning is a deep copy.** Editing the copy never touches the original | MB-PER-001 §3.1: *"A copied day becomes independent and remains editable without changing the original day"* |
| G | **Changing the profile invalidates every built morning.** The engine re-runs rather than keeping an existing box | Not stated explicitly, but keeping a box built under different safety inputs would violate MB-REC-001 §3 |

---

## Open questions for Morning Box

1. **Gluten-free:** add products to the Core Library, or remove the requirement from the profile question?
   Today it guarantees a no-match.
2. **Vegan and dairy-free:** is 8 of 32 and 9 of 32 acceptable for launch, or does the library need a
   plant yogurt and a vegan pastry?
3. **Vegetarian savory protein:** should the Savory Protein swap group gain a vegetarian option, so
   vegetarians keep the Flexible/Savory models?
4. **Overnight Oats plant-milk variant:** confirm it is an approved variant the engine may select, and
   confirm how the kitchen is told which build to make.
5. **One Standard Size:** confirm which Busy breakfasts qualify.
6. **Unmatchable Special Breakfast:** should the business order be blocked at checkout, or accepted with
   an operations exception as implemented?
7. **Large-order lead time:** does a 200-box order really get the same 9:00 PM cutoff?
8. **Beverage imagery:** the approved homepage shows a coffee that the MVP does not sell. Confirm the
   photography brief excludes it.
