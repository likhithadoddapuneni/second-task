# Morning Box — MVP

Morning Box is not a food-ordering marketplace. It is a **personal breakfast assistant**: three short
questions, one confident recommendation, freshly produced by an approved partner bakery and delivered
next morning in the window the customer chose.

> **Positioning:** Your Personal Breakfast Assistant.
> **Customer promise:** simple questions, clear choices and fast decisions.
> **Launch geography:** DIFC first. — *MVP Master Plan v1.1 §1*

---

## 1. What is in this repository

| Path | What it is |
|---|---|
| `extracted/` | The 14 source PDFs: the Master Plan, the 12 locked standards, the competitive landscape, the approved logo and homepage direction |
| `docs/` | The written understanding, the screen-and-functional specification, the build plan and the gaps |
| `mvp/` | **A running MVP** — open it and use it. Start at [`mvp/README.md`](mvp/README.md) |
| `MorningBox_MVP_Client_Presentation.pptx` | A 4-slide client deck with the full talk track in the speaker notes |
| `MorningBox_MVP_Talk_Track.md` | The same script in printable form, plus likely questions and honest answers |

The PDFs are the **specification**. They are not the product.

---

## 2. "MVP" here means a working product

Settled by the Master Plan itself, not by preference:

- **§8 Technology & MVP Architecture** names six surfaces to be built: Customer Web/PWA, Recommendation
  Engine, Admin/Operations, Bakery View, Delivery Coordination, Data Layer.
- **§8.1** lists the required customer screens, in order, from Landing to Feedback.
- **§12 MVP Development Roadmap** runs A→H: UX specification, interactive demo, technical build, partner
  setup, delivery setup, closed pilot, DIFC launch, optimise.
- **§18 Launch Gate** has "Technical MVP build — PENDING: Functional QA passed" as a hard gate.
- The Master Plan's own closing line names the next artifact: a **Screen-by-Screen UX & Functional
  Specification**. That is `docs/03`.

See `docs/01-what-the-mvp-is.md` for the full reasoning, including when a deck is still the right thing.

---

## 3. Run it

No build step, no package manager, no database, no accounts.

```bash
cd mvp
python3 -m http.server 8788
# then open http://localhost:8788
```

It uses native ES modules, so it must be served over HTTP. **Design and test it on a phone-width
window first** — MB-DSN-001 §5 makes mobile the primary target, and that is how it was built.

### What works

| Area | What the build does |
|---|---|
| **Morning Profile** | The three locked questions — Eating Style, Breakfast Preference (multi-select), Dietary Requirements & Allergies |
| **Day planning** | One day, several days or a week. Exact dates everywhere. *Same as Previous Day* copies a morning and keeps it independent |
| **Daily Context** | Per-day context that never alters the base profile |
| **Recommendation** | The real MB-REC-001 engine over all 32 approved Base Recommendations: safety filter, approved substitution, eating-style branch, exact context match, preference pool, context tie-break, *Your Morning Box* + *Another Option for You*, and a genuine no-match |
| **Customization** | Swap within the approved Swap Group only; Size where meaningful (and one Standard Size where not); approved Bread and Pastry add-ons |
| **Checkout** | Registration *after* value is created, delivery window not delivery time, review and payment |
| **Orders** | Customer tracking, *Prepared by [Partner Bakery]*, free cancellation until the 9:00 PM cutoff, Loved it / Not for me |
| **Business** | Headcount first, Special Breakfast groups, Morning Box Mix or Choose Your Boxes, multi-day, volume discount, prepaid |
| **Operations** | Proximity-first allocation with eligibility filtering, the 9:00 PM cutoff, Production View vs Packing View, bakery and delivery state machines, QC gate, exception queue, proof of delivery, daily reconciliation |

### What it is not

- **Not a backend.** Everything runs in the browser against a generated catalogue. No database, no auth,
  no payment provider — those are Roadmap phases C and E.
- **Not priced.** MB-BOX-001 §8 defers every AED figure to costing approval. The price *architecture*
  (Base + Size Adjustment + Add-ons) is exact; the numbers are labelled indicative everywhere they appear.
- **Not photographed.** MB-DSN-001 §7 asks for premium food photography. There is none here and none is
  faked: every component is drawn from its own approved record.

---

## 4. The finding that matters most

Running the standards rather than reading them surfaced this:

| Requirement | Base Recommendations that can be served |
|---|---|
| No restrictions | **32 of 32** |
| Peanut allergy | 32 of 32 |
| Vegetarian | 28 of 32 |
| Tree nut allergy | 24 of 32 |
| Egg allergy | 22 of 32 |
| Dairy allergy | 12 of 32 |
| Dairy-Free | 9 of 32 |
| Vegan | 8 of 32 |
| **Gluten-Free** | **0 of 32** |
| **Gluten allergy** | **0 of 32** |

MB-BOX-001 §9 names Gluten-Free as a supported requirement needing a specially eligible bakery — but the
Core Item Library contains only wheat breads, and every approved grain (oats, granola, muesli) carries
gluten. **A coeliac customer cannot be served a single approved Morning Box.** The engine is behaving
correctly; the product library has a hole in it.

All fourteen findings are in `docs/05-gaps-and-decisions.md`.

---

## 5. Documents

| Document | Read it for |
|---|---|
| [`docs/01-what-the-mvp-is.md`](docs/01-what-the-mvp-is.md) | The MVP-vs-deck question, answered from the Master Plan |
| [`docs/02-standards-digest.md`](docs/02-standards-digest.md) | All 12 locked standards summarised, with the values the engine needs |
| [`docs/03-screen-and-functional-spec.md`](docs/03-screen-and-functional-spec.md) | The screen-by-screen UX & functional specification the Master Plan names as the next artifact |
| [`docs/04-build-plan.md`](docs/04-build-plan.md) | Roadmap A→H, what this build proves, what remains |
| [`docs/05-gaps-and-decisions.md`](docs/05-gaps-and-decisions.md) | Fourteen gaps found by executing the standards, with the decision taken for each |
| [`docs/06-mvp-walkthrough.md`](docs/06-mvp-walkthrough.md) | Every screen explained: what it does, what runs underneath, what to say about it |
| [`mvp/README.md`](mvp/README.md) | How to run it, a five-minute demo path, troubleshooting |

---

## 6. The locked standards

| Code | Standard |
|---|---|
| `MB-PRD-001` | Core Product |
| `MB-USR-001` | User & Use Case |
| `MB-DSN-001` | Design & UI |
| `MB-PER-001` | Personalization & Morning Profile |
| `MB-BOX-001` | Breakfast Box & Menu Architecture |
| `MB-B2B-001` | Business & Team Breakfast |
| `MB-FLW-001` | Experience & Ordering Flow |
| `MB-DLV-001` | Delivery & Fulfilment |
| `MB-BKY-001` | Partner Bakery |
| `MB-OPS-001` | Operations |
| `MB-PRO-001` | Production & Food Specification |
| `MB-REC-001` | Recommendation & Decision Logic |

Where a Master Plan summary and a locked standard differ, **the locked standard is the source of truth**.
Every file in `mvp/js/` cites the governing section at the point of decision.
