# Morning Box MVP — talk track

The same script lives in the speaker notes of `MorningBox_MVP_Client_Presentation.pptx`
(View → Notes Page, or the Notes pane in Presenter View). This file is for rehearsing and printing.

**Runtime: about 5 minutes of talking, with a 5-minute live demo in the middle.**
The demo is the centre of the meeting; the slides frame it and close it.

**Before you start**

- Have the MVP running at `http://localhost:8788` in a second window, **at phone width**
  (`Cmd/Ctrl + Shift + M` → iPhone 14 Pro). Mobile-first is a requirement in MB-DSN-001 §5, and
  demoing it on a phone frame proves you read it.
- Have a second tab on `#/ops` with an order already placed, so the Operations console is not empty.
- Do not make them watch you start a server.

---

## Slide 1 — A better breakfast day, your way

OPENING — about 60 seconds.

"Thank you for the Master Plan and the twelve locked standards. I read all of them, and then I did the thing they were written for: I built it.

What is behind me is running software, not a mock-up. It is served from my laptop and I will drive it live in a moment.

The one-line version, and I would use this one with an investor: Morning Box is not a food-delivery marketplace. It is a personal breakfast assistant. A customer answers three short questions — how they eat, what they enjoy, and anything they must avoid — and Morning Box returns one confident, complete breakfast, produced fresh by an approved DIFC bakery and delivered inside the window they picked.

Three numbers to anchor it. Thirty-two approved base recommendations. Thirty-five approved components, each with an allergen record. Twelve locked standards governing all of it.

And one framing I want to put down early, because it shapes everything you are about to see: the engine is deterministic. Same inputs, same recommendation, every time. That is MB-REC-001 section 1.4, and it is a stronger claim than 'we used AI' — because we can show you exactly why it chose what it chose."

[Move to slide 2.]

---

## Slide 2 — “MVP” means a working product, not a deck

SCOPE — about 75 seconds. This answers the question someone in the room is already thinking.

"Before the demo I want to settle one thing: when the Master Plan says 'MVP', does it mean a presentation, a design, or a product?

It means a product, and that is your document, not my opinion.

Section eight names six things to build — a customer web app, the recommendation engine, admin and operations, a bakery view, delivery coordination and a data layer.

Section eight-point-one lists the required customer screens in order, from Landing through to Feedback. That is a build list.

And section twelve makes 'technical build, core functional QA passed' phase C of the roadmap — with section eighteen turning it into a launch gate. You cannot pass functional QA on a deck.

Your Master Plan also names what comes immediately after it: a screen-by-screen UX and functional specification. I have written that too — it is document three in the pack — and the demo you are about to see is the thing it describes.

On the right: the whole journey, built. Personal and business, plus the operations console that runs the night-before cycle. Ten flows, zero console errors on a full click-through."

[Move to slide 3, then switch to the live app.]

---

## Slide 3 — Safety first, then preference

DEMO — about 2 minutes here, then SWITCH TO THE LIVE APP.

"This is the heart of it, so I want to be precise.

The engine runs four stages: understand, filter, match, recommend. Safety and dietary filtering happen before any preference matching — that ordering is in the standard and it is not negotiable.

Four rules make it defensible in front of a customer, a bakery or a regulator.

One: same inputs, same recommendation. It is deterministic. Ask it the same question twice and you get the same answer, and we can show you the decision trace.

Two: if a component is unsafe for you, the engine looks for an approved substitute inside the Morning Box library — never the bakery's general menu. If there isn't one, the whole breakfast leaves the pool.

Three: picking several preferences widens the pool; it never blends savory and sweet into one strange box.

Four, and this is the one most products get wrong: no eligible match is better than a forced one. If nothing is safe, it says so and offers to review your inputs. It does not quietly relax your allergy to fill the screen.

Let me show you."

[SWITCH TO THE LIVE APP — at phone width. Five minutes:
 1. Create My Morning → Health-Conscious
 2. Savory + Fresh & Wholesome — "multi-select widens the pool"
 3. Peanut allergy — "a hard filter, applied before anything is recommended"
 4. Pick two dates — "exact dates, 9 PM cutoff"
 5. Relaxed Morning
 6. The box appears — tap a compartment, show the allergen record
 7. Point at the substitution notice if one fired
 8. Swap the bread — "only eligible alternatives, price does not move"
 9. Size → Large — "quantity, not composition"
10. Save → day two offers "Same as yesterday" — an independent copy
11. Summary → register → delivery window → pay
12. Orders — "Prepared by the bakery. Free cancellation until 9 PM"
13. Business: 35 people, add Vegan + Tree nut × 3 — it cannot be matched
14. Operations: run the cutoff, show Production vs Packing view, try Ready before QC

Then come back to slide 4.]

---

## Slide 4 — What works, and the one decision I need

CLOSE — about 90 seconds. This is the slide that earns the next meeting.

"So, where are we.

On the left: what works today. All ten flows. The real engine over all thirty-two base recommendations. Allergen filtering with approved substitution. The nine PM cutoff, the refund rules, proof of delivery. Proximity-first bakery allocation with eligibility filtering. And the operations console: production view, packing view, the QC gate and the exception queue.

In the middle: what I would do next, in order. And notice what is first — it is not code.

Because on the right is the thing I most need to tell you.

I ran every dietary requirement against all thirty-two approved base recommendations. No restrictions: thirty-two of thirty-two. Peanut allergy: thirty-two — your library handles that well. Vegetarian: twenty-eight. Dairy allergy: twelve. Vegan: eight.

Gluten-free: zero. Not one. A coeliac customer cannot be served a single approved Morning Box.

And this is not a bug in my engine. MB-BOX-001 section nine names Gluten-Free as a supported requirement and says a bakery must be specifically eligible to handle it. But the Core Item Library contains only wheat breads, and all three approved grains — oats, granola and muesli — carry gluten. There is no gluten-free product of any kind in the approved library. The engine refuses to invent one from outside, exactly as the standard tells it to, so it returns the no-match message.

You only find that by executing the standards, not by reading them.

There are three ways to resolve it. Add a gluten-free bread and grain to the Core Library. Or declare gluten-free out of MVP scope and take it off the profile question. Or keep it, and accept that those customers always get a no-match. Only the first matches what MB-BOX-001 currently promises.

The same shape of question applies, less severely, to vegan at eight and dairy-free at nine — there is no plant yogurt and no vegan pastry in the library.

That is the decision I need. Everything else on this slide I can get on with.

I found fourteen gaps like this in total — all written up with the decision I took and why. Happy to take questions, or go back into the app and break it however you like."

[End. Offer the laptop.]

---

## If you only have 90 seconds

"You gave me a Master Plan and twelve locked standards. I read them and built what they describe — a
working personal breakfast assistant, running today. Three questions, one confident recommendation
drawn from your thirty-two approved base recommendations, with allergies as a hard filter applied
before anything is shown. The customer can swap inside an approved group, pick a size, add a loaf,
and pay once. Behind it, proximity-first bakery allocation, the nine PM cutoff, production and packing
views, a QC gate and an exception queue. And one finding you need: a gluten-free customer cannot be
served a single approved Morning Box today. Let me show you."

## Likely questions, and honest answers

**"Is this the real thing or a prototype?"**
It is the real decision logic on a transcribed product library. The engine, the thirty-two base
recommendations, the allergen filtering, the substitution rule, the cutoff, the refund rules and the
operational state machines are production-correct. What is not production is the infrastructure: no
database, no OTP provider, no payment gateway, no bakery portal. Those are roadmap phases C to E.

**"Where did the food data come from?"**
Transcribed verbatim from MB-PRO-001 — the component library with its portions, the swap groups, and
all thirty-two base recommendations. The one thing I had to author is the allergen records themselves,
because the standards require every product to carry one but do not publish them. Those must be
replaced by each partner bakery's verified records before a single real order.

**"Why is there no price?"**
Because MB-BOX-001 §8 says there isn't one yet: *"Actual AED prices remain TBD pending component
costing, bakery economics, packaging, Morning Box margin and delivery economics."* I built the
architecture — base price, size adjustment, add-ons, and swaps costing nothing — and labelled every
number indicative. Inventing prices would have been the easy thing and the wrong one.

**"Can it not just find something for a gluten-free customer?"**
No, and that is the system working. MB-REC-001 §3 forbids substituting from outside the approved
Morning Box library, and there is no gluten-free product in it. The engine returns your own locked
no-match message rather than improvising. Fixing it is a product decision, not an engineering one.

**"How long to launch?"**
I will not give you a number before the bakery data exists. Standardising partner catalogues into
approved products with verified allergen records is the critical path, and it is a data-quality project
with a human owner, not a sprint. Settle the dietary coverage question, give me one onboarded bakery,
and I will phase the rest properly.

**"Could AI do the recommending instead?"**
Your own standard says no, and it is right. MB-REC-001 §1.4 requires deterministic, rule-based
behaviour and explicitly rejects "unsupported AI claims". For food safety that is the correct call —
you need the same answer every time and you need to explain it. Where AI does belong is upstream:
turning a bakery's messy product list into standardised components with allergen records, which is
exactly the bottleneck on the critical path.