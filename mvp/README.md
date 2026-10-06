# Morning Box MVP — how to run it

This folder is the **running Morning Box MVP**. No build step, no package manager, no database, no
accounts. The recommendation engine, the product library, bakery allocation, ordering and the whole
operations cycle run in the browser.

---

## 1. Run it

```bash
cd "/Users/rahul/Downloads/morning box project/mvp"
python3 -m http.server 8788
```

Then open **<http://localhost:8788>**. Stop with `Ctrl + C`.

> **Open it at phone width first.** MB-DSN-001 §5 makes mobile the primary target: *"The interactive
> demo must be designed and tested primarily for mobile. Desktop should expand the same system rather
> than create a separate visual language."* In Chrome, `Cmd/Ctrl + Shift + M` and pick iPhone 14 Pro.

### Why a server and not just opening index.html

The app is written as native **ES modules**. Browsers refuse to load modules over `file://`, so
double-clicking `index.html` gives a blank page and a CORS error. Any static server fixes it.

| You have | Command |
|---|---|
| Node.js | `npx serve -l 8788` or `npx http-server -p 8788` |
| PHP | `php -S localhost:8788` |
| VS Code | Right-click `index.html` → **Open with Live Server** |
| Ruby | `ruby -run -e httpd . -p 8788` |

Port busy? `lsof -ti:8788 | xargs kill`, or pick another port.

---

## 2. A five-minute demo path

### Personal Breakfast

| # | Do this | Point out |
|---|---|---|
| 1 | **Create My Morning** | Two entry paths only. No bakery browsing, no menu |
| 2 | *Health-Conscious* → Continue | One question per screen. A recommendation direction, not a medical rule |
| 3 | Tick **Savory** and **Fresh & Wholesome** | Multi-select widens the pool — it never blends two categories into one box |
| 4 | Tick the **Peanut** allergy → Continue | A hard safety filter, applied before anything is recommended |
| 5 | Pick two dates | Exact dates everywhere, never weekday names alone. The 9:00 PM cutoff is stated |
| 6 | **Active Morning** | Daily context belongs to the day, not the profile |
| 7 | The recommendation appears | *Your Morning Box* — the hero. Tap any compartment for its allergen record |
| 8 | **Swap** the bread | Only eligible alternatives, re-filtered. Same swap group, so the price does not move |
| 9 | **Large**, then add a pastry | Size changes quantity, not composition. Extras never influence the recommendation |
| 10 | **Save and plan the next morning** | Day two offers **Same as [date]** — a copy that stays independent |
| 11 | Weekly summary | Total mornings and total value are visible **before** registration |
| 12 | Register → delivery → pay | Mobile + OTP + first name. A window, not a time. The plan is never rebuilt |
| 13 | Orders | *Prepared by [Partner Bakery]*, free cancellation until 9:00 PM the night before |

### Business Breakfast

| # | Do this | Point out |
|---|---|---|
| 1 | **Morning Box for Business** → 35 people | Headcount is the first and only opening question |
| 2 | Dietary → **Yes** → add *Vegan + Tree nut × 3* | Special Breakfast groups, not ambiguous separate counts |
| 3 | **Morning Box Mix** | 32 general boxes spread across the standard models. Total boxes must equal headcount |
| 4 | Pick a date → fill delivery → review | Volume discount is calculated per day, never aggregated across days |

### Operations

Open **Operations** in the header after placing an order.

| # | Do this | Point out |
|---|---|---|
| 1 | **Run the 9:00 PM cutoff** | Provisional allocation becomes final; production lists are generated |
| 2 | Compare the two panels | *Production View* aggregates for the kitchen; *Packing View* is one row per box with allergy flags |
| 3 | Advance a line: Confirmed → In Preparation → **Pass QC** → Ready | Ready is blocked until QC passes |
| 4 | **Record delivery** | Arrival is not delivery. Handover is delivery |
| 5 | **Raise exception** on another line | Every exception carries an owner, an action and a resolution |

### Three things worth showing that most demos would hide

1. **A no-match.** Set Dietary → *Gluten-Free* and run any morning. The system returns
   *"We couldn't find a Morning Box that safely matches your requirements"* and offers to review your
   preferences. It never relaxes a safety rule to produce a result.
2. **A single preference.** Choose only one Breakfast Preference — there is no *Another Option for You*,
   because only one eligible candidate exists. One strong recommendation beats two forced ones.
3. **An unmatchable Special Breakfast.** Add *Vegan + Tree nut* to a business order; it cannot be
   produced, so it raises a Dietary/Allergy exception in Operations instead of disappearing.

---

## 3. What is in each file

```
mvp/
├── index.html              Page shell, fonts, header, footer
├── css/morningbox.css      The whole design system as tokens (MB-DSN-001)
└── js/
    ├── standards.js        Controlled vocabularies, context priority, cutoff, windows, pricing architecture
    ├── library.js          The Core Component Library: portions, allergen records, swap groups
    ├── recipes.js          The 32 approved Base Recommendations, verbatim from MB-PRO-001 §12
    ├── engine.js           MB-REC-001: safety filter, substitution, matching, tie-break, swap, size, add-ons
    ├── operations.js       Bakeries, proximity-first allocation, orders, cutoff, production lists, exceptions
    ├── art.js              Food illustrations drawn from each component's own record
    ├── ui.js               Brand mark and the icon family
    └── app.js              Router, every screen, and the action handler
```

Every file cites the standard section that governs each decision, at the decision point.

---

## 4. How the data behaves

- The product library and the 32 Base Recommendations are transcribed from **MB-PRO-001**, not invented.
- Bakery offers and capacity are generated deterministically, so the same demo appears on every machine.
- **Prices are indicative.** MB-BOX-001 §8 defers every AED figure to costing approval. The architecture
  — Base Price + Size Adjustment + Add-ons, with swaps inside a group costing nothing — is exact, and the
  interface says so wherever a price appears.

**Reset demo data** in the footer clears everything.

---

## 5. Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| Blank page, CORS error | Opened `index.html` directly | Serve over HTTP (section 1) |
| Blank page, 404 on `js/app.js` | Server started in the wrong folder | `cd` into `mvp/` first |
| Fonts look wrong | Google Fonts blocked or offline | Harmless — system fallbacks are set |
| A button does nothing | Stale cached module | Hard reload: `Cmd/Ctrl + Shift + R` |
| "Continue" stays greyed out | A required answer is missing | Every screen needs its one answer before continuing |
| No recommendation appears | A genuine no-match | That is the engine working. See section 2 |

---

## 6. What this build is, and is not

**It is** the complete customer journey and the complete decision logic: the real MB-REC-001 pipeline,
the real 32 Base Recommendations, real allergen filtering with approved substitution, the real 9:00 PM
cutoff and refund rules, and the real operational state machines.

**It is not** production infrastructure. No database, no authentication, no payment provider, no bakery
portal. Those are Roadmap phases C, D and E. See `../docs/04-build-plan.md` for what each phase needs,
and `../docs/05-gaps-and-decisions.md` for the fourteen places where the standards are silent and a
decision had to be taken.

For a full section-by-section explanation of every screen and module, see
[`../docs/06-mvp-walkthrough.md`](../docs/06-mvp-walkthrough.md).
