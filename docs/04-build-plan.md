# 04 — Build plan

The Master Plan's §12 roadmap, with what this build proves and what a production MVP still needs.

---

## Roadmap status

| Phase | Deliverable | Exit condition | Status after this build |
|---|---|---|---|
| **A** UX specification | Screen-by-screen customer + B2B + operational flows | Every screen mapped to locked standards | **Done** — `docs/03` |
| **B** Interactive demo | Clickable high-fidelity demo | Core personal and business journeys testable end to end | **Done** — `mvp/`, and it is functional rather than clickable |
| **C** Technical build | Customer app/PWA, backend, engine, admin/bakery workflow | Core functional QA passed | **Partly** — engine, journeys and operations logic are real; persistence, auth and payments are not |
| **D** Partner setup | Bakery product mapping, records, capacity, packaging, commercial | ≥ 1 launch-ready bakery + contingency | Not started — needs real partners |
| **E** Delivery setup | Courier process, windows, handoff, POD | Controlled delivery test passed | Not started |
| **F** Closed pilot | Real orders with a controlled user group | Operational KPIs within thresholds | Not started |
| **G** DIFC launch | Public or limited launch | Daily operating rhythm stable | Not started |
| **H** Optimise | Feedback, conversion, operational improvement | Evidence supports expansion | Not started |

---

## What phase C still needs

| Workstream | Why it is not in this build | Effort shape |
|---|---|---|
| **Database and schema** | Everything runs in browser memory | Implement `docs/03` §7 as migrations. The entity model is settled; this is execution |
| **Auth: mobile + OTP** | Registration is simulated | An OTP provider plus one hard rule: the guest plan must survive registration untouched |
| **Payments** | Payment is simulated | Gateway for personal cards and business prepay, plus the refund path the cutoff rules require |
| **Bakery view** | Operations console stands in for it | A partner-facing surface: assigned orders, production and packing views, Confirm / In Preparation / Report Delay / Ready |
| **Delivery integration** | Courier states are driven manually | Pickup planning from Ready-by time, route, status and POD capture |
| **Catalogue ingestion** | The library is transcribed from MB-PRO-001 | Per-bakery ingredient and allergen records against each approved item. **This is a data-quality project with a human owner, not a sprint** |
| **Notifications** | None | Confirmation, on-the-way, delivered, and exception messages only when they materially affect the order |

---

## Suggested delivery order

1. **Resolve the dietary coverage gap first** (`docs/05` gap 1). Until the Core Library can serve a
   gluten-free or vegan customer, every downstream decision — bakery onboarding, allergen records,
   marketing claims — is built on a product that excludes those customers entirely.
2. **Schema and catalogue ingestion.** Nothing is testable until real approved products exist with real
   allergen records.
3. **Engine as a service, behind a stable contract.** Port it from `mvp/js/engine.js`, persist
   `recommendation_run` and `final_configuration`, and build the fixture tests before tuning anything.
4. **The ordering spine** — days, cutoff, cancellation and refund rules. These have the strictest
   correctness requirements in the standards.
5. **Operations and the bakery view.** The night-before cycle is the operational heartbeat; get it right
   before adding a courier integration.
6. **Payments last**, but do not defer the audit trail — retrofitting `audit_event` is expensive and the
   standards require traceability from MB-REC-001 §15 onward.

---

## Risks

| Risk | Why it matters | Mitigation |
|---|---|---|
| **Dietary coverage** | Gluten-free and vegan customers cannot be served at all today | Treat as a product decision, not an engineering one. See `docs/05` gap 1 |
| **Bakery consistency** | The same Morning Box standard across different bakeries, with different suppliers | MB-BOX-001 §10's controlled-standardization model only works if the QC in MB-PRO-001 §15.3 is enforced at every handover |
| **Single-partner concentration** | DIFC launch with one or two bakeries | The Master Plan already says: smallest practical number *plus backup*. Capacity and the next-nearest-eligible rule are implemented; the contingency partner is a commercial task |
| **Capacity accepted but not deliverable** | Over-accepting a window | Capacity is reserved at payment and finalized at cutoff; a window closes when either production or delivery capacity is exhausted |
| **Unpriced product** | Every AED figure is TBD | The price architecture is built and labelled indicative. Costing must land before pilot, not before launch |
| **Special Breakfast with no safe match** | A business order can contain a requirement the library cannot serve | Now raises a Dietary/Allergy exception at order placement rather than disappearing |
| **Freshness vs route efficiency** | Consolidation can quietly degrade the product | The standard is explicit that freshness wins; make it a measured KPI in the pilot, not an aspiration |

---

## What this build is useful for now

- **Demonstrating the product** end to end in five minutes, to a stakeholder, a bakery partner or DIFC.
- **Pressure-testing the standards** — the fourteen findings in `docs/05` only became visible by
  executing the rules rather than reading them.
- **Fixing the UI language** — MB-DSN-001 is fully implemented as tokens in `mvp/css/morningbox.css`.
- **Writing the acceptance suite** — each Master Plan §13 test area maps to behaviour the build already
  exhibits, including the no-match and exception paths that are easiest to forget.
