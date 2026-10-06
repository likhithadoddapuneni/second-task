# 01 — What "build the MVP" means for Morning Box

## The short answer

**A working web product.** Not a PowerPoint, not a Figma file, not another standard.

The confusion is understandable: you were handed fourteen PDFs and the word "MVP", and PDFs look like
deliverables. They are not. They are the **specification** for a product that does not exist yet.

---

## Why the Master Plan settles it

### 1. §8 names six software surfaces

| Surface | MVP responsibility |
|---|---|
| Customer Web/PWA | Landing, profile, day planning, recommendation, customization, checkout, order management, feedback |
| Recommendation Engine | Rule-based eligibility, matching, tie-break, alternative, substitution and traceability |
| Admin / Operations | Orders, allocation, capacity, exceptions, customer issue visibility, refunds/status oversight |
| Bakery View | Assigned orders, production details, special requirements, Confirm / In Preparation / Delay / Ready |
| Delivery Coordination | Ready orders, pickup/handoff, delivery status and proof |
| Data Layer | User profile, day context, product library, allergen/dietary records, recommendations, final configuration, feedback |

### 2. §8.1 lists the screens, in order

> Landing → Personal / Business entry → Base Morning Profile → Day selection → Daily Context →
> Recommendation → Breakfast detail/customization → Add-ons → Day saved / Next Day → Checkout →
> Confirmation → Order management → Feedback.

That is a build list, not a slide outline.

### 3. §12 is a development roadmap with exit conditions

A (UX specification) → B (interactive demo) → C (**technical build** — "Core functional QA passed") →
D (partner setup) → E (delivery setup) → F (closed pilot) → G (DIFC launch) → H (optimise).

### 4. §18 makes it a launch gate

> | Technical MVP build | PENDING | Functional QA passed |

You cannot pass functional QA on a deck.

### 5. The Master Plan names the next artifact itself

> "Immediate next build artifact after this Master Plan: **Screen-by-Screen UX & Functional
> Specification** for the interactive demo and development team."

That document is `docs/03-screen-and-functional-spec.md` in this repository, and the interactive demo it
describes is `mvp/`.

---

## So when *is* a deck the right thing?

A deck is a **wrapper**, never the deliverable.

| Situation | What to produce |
|---|---|
| Showing you understood the twelve standards | A short deck or a one-page summary — a reading check, not the MVP |
| Pitching for the build, or reporting to a non-technical stakeholder | A deck **built around a live demo** |
| Talking to a candidate bakery partner or to DIFC | The demo, with a few slides of context |
| Asked to deliver "the MVP" | The running product |

`MorningBox_MVP_Client_Presentation.pptx` is exactly that wrapper: four slides, with the demo in the
middle.

---

## What a *complete* production MVP still needs

The build in `mvp/` covers the customer journey and the decision logic end to end, in the browser. A
production MVP additionally needs:

1. **Persistence** — the entity model in `docs/03` §7 as a real schema.
2. **Authentication** — mobile + OTP, with the guest plan surviving registration untouched.
3. **A payment provider** — card capture, refunds, and the business invoice flow.
4. **A bakery view** — the Confirm / In Preparation / Report Delay / Ready workflow in the partner's hands.
5. **Delivery partner integration** — pickup, route, status and proof of delivery.
6. **Real partner product mapping** — ingredient and allergen records per bakery, per approved item.
7. **Locked commercial numbers** — retail prices, bakery settlement, delivery cost, discount tiers.
8. **A Food Safety & Handling Standard** — the Master Plan notes `MB-FDS-001` may be created at
   operational launch; it does not exist yet.

Roadmap and effort for each are in `docs/04-build-plan.md`.
