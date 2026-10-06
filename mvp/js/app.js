/* ============================================================
   app.js — Morning Box MVP
   The customer screens required by MB-FLW-001 §8.1:
     Landing → Personal / Business entry → Base Morning Profile →
     Day selection → Daily Context → Recommendation → Breakfast
     detail / customization → Add-ons → Day saved / Next Day →
     Checkout → Confirmation → Order management → Feedback
   plus the operational surfaces of MB-OPS-001.

   Experience principle (MB-FLW-001): Simple questions. Clear
   choices. Fast decisions.
   ============================================================ */

import {
  EATING_STYLES, PREFERENCES, DIETARY, ALLERGENS, CONTEXTS, SIZES,
  DELIVERY_WINDOWS, FEEDBACK, CUSTOMER_STATUS, EXCEPTION_KINDS,
  fmtAED, fmtDate, fmtDateLong, isoDate, orderableDates, cutoffFor,
  isBeforeCutoff, CUTOFF_HOUR, PRICES_ARE_INDICATIVE
} from './standards.js';
import { COMPONENTS, portion, resolveBuild } from './library.js';
import { describe } from './recipes.js';
import {
  recommend, configure, swapOptions, applySwap, canSwap, hasSizeSelector,
  setSize, addonGroups, priceBox, addonPrice, traceRecord,
  businessModels, morningBoxMix, resolveSpecial, priceBusinessDay
} from './engine.js';
import * as OPS from './operations.js';
import { brandMark, icon, foodArt, boxArt, heroArt, esc } from './ui.js';

/* ---------------- State ---------------- */
const S = {
  profile: { eatingStyle: null, preferences: [], dietary: [], allergies: [] },
  dates: [],                    // iso strings, ascending
  days: {},                     // iso -> { date, context, config, saved }
  customer: null,
  delivery: { sameForAll: true, zone: 'difc-gate', address: '', window: 'w2', perDay: {} },
  orders: [],
  business: null,
  opsDate: null,
  opsBakery: 'BK-001'
};
const app = () => document.getElementById('app');

/* ---------------- Router ---------------- */
const routes = {};
const route = (p, fn) => (routes[p] = fn);
function go(h) { if (location.hash === h) render(); else location.hash = h; }
function render() {
  const [path, ...rest] = (location.hash || '#/').slice(1).split('/').filter(Boolean);
  const view = routes[path || 'home'] || routes.home;
  app().innerHTML = view(rest);
  window.scrollTo(0, 0);
  document.querySelectorAll('.nav a').forEach(a =>
    a.classList.toggle('on', a.getAttribute('href') === '#/' + (path || '')));
}
window.addEventListener('hashchange', render);

/* ---------------- Helpers ---------------- */
const pill = (t, k = '') => `<span class="pill ${k}">${esc(t)}</span>`;
const money = (n, cls = '') => `<span class="price ${cls}"><span class="cur">AED</span>${fmtAED(n)}</span>`;
const std = c => `<span class="std">${esc(c)}</span>`;

/* §6 Progress: quiet and elegant, no gamification. */
function progress(step, total, label) {
  return `<div class="progress">
    ${Array.from({ length: total }, (_, i) =>
      `<span class="seg ${i < step - 1 ? 'done' : i === step - 1 ? 'on' : ''}"></span>`).join('')}
    <span class="lab">${step} of ${total}</span>
  </div>${label ? `<div class="micro" style="margin-bottom:var(--s2)">${esc(label)}</div>` : ''}`;
}

const dayOf = iso => S.days[iso] || (S.days[iso] = { date: iso, context: null, config: null, saved: false });
const savedDays = () => S.dates.map(d => S.days[d]).filter(d => d && d.saved && d.config);
const nextUnsaved = () => S.dates.find(d => !S.days[d]?.saved);
const planTotal = () => savedDays().reduce((t, d) => t + priceBox(d.config).total, 0);

const indicative = `<p class="meta" style="margin-top:var(--s2)">Prices are indicative for this build.
  MB-BOX-001 §8 defers the final AED figures to component costing, bakery economics and margin approval —
  the price <em>architecture</em> below is exact.</p>`;

/* ============================================================
   Landing — MB-FLW-001 §1
   Two clear entry paths. No bakery browsing, no menu overload.
   ============================================================ */
route('home', () => `
<section class="hero wrap">
  <div class="split">
    <div>
      <div class="micro">Good mornings, made for you.</div>
      <h1 class="display d1" style="margin:var(--s2) 0 var(--s3)">A better breakfast day,<br>
        <span class="gold-line">your way.</span></h1>
      <p class="lead" style="max-width:34ch">Personalised breakfast boxes, prepared fresh each morning by
        DIFC's best bakeries and delivered in the window you choose.</p>
      <div class="stack" style="margin-top:var(--s4)">
        <a class="btn btn-primary btn-block" href="#/profile/1">
          <span class="ic">${icon('user')}</span> Create My Morning</a>
        <a class="btn btn-secondary btn-block" href="#/business">
          <span class="ic">${icon('briefcase')}</span> Morning Box for Business</a>
      </div>
      <p class="meta" style="margin-top:var(--s3)">Order by 9:00 PM for next-day breakfast. No subscription.</p>
    </div>
    <div class="heroart" style="margin-top:var(--s5)">${heroArt()}</div>
  </div>
</section>

<section class="section wrap">
  <div class="grid g4">
    ${[['leaf', 'Curated from trusted bakeries'], ['sliders', 'Personalised to your taste'],
       ['smile', 'Freshly prepared and delivered'], ['sprout', 'A healthier, happier you']]
      .map(([ic, t]) => `<div class="feature"><span class="ic">${icon(ic)}</span><div class="t">${t}</div></div>`).join('')}
  </div>
</section>

<section class="wrap">
  <div class="zoneband">
    <div class="split">
      <div>
        <div class="micro">Now in</div>
        <h2 class="display d2" style="margin:var(--s1) 0">DIFC</h2>
        <p class="meta" style="margin:0">More areas coming soon.</p>
      </div>
      <div class="row" style="gap:var(--s4);margin-top:var(--s4)">
        ${OPS.ZONES.filter((z, i) => [0, 3, 4].includes(i)).map(z => `
          <div class="center">
            <div class="zonedot ${z.live ? 'live' : ''}">${icon('pin')}</div>
            <div class="meta" style="margin-top:7px;${z.live ? 'color:var(--gold-deep);font-weight:600' : ''}">
              ${z.id === 'difc-gate' ? 'DIFC' : esc(z.label)}</div>
          </div>`).join('')}
      </div>
    </div>
  </div>
</section>

<section class="section wrap">
  <h2 class="display d2">Breakfast, reimagined</h2>
  <p class="lead" style="max-width:52ch">Morning Box is not a food marketplace. It is a personal breakfast
  assistant: three short questions, one recommendation you can trust, and a box that arrives when you asked for it.</p>
  <div class="grid g3" style="margin-top:var(--s4)">
    ${[['Tell us how you eat', 'Eating style, what you enjoy, and anything you must avoid. Three questions, kept short and editable.'],
       ['Pick your mornings', 'Plan tomorrow, a few days, or the whole week. Each morning stays independent.'],
       ['We recommend. You adjust.', 'One confident recommendation, with controlled swaps, size and a couple of extras.']]
      .map(([t, d], i) => `<div class="card pad">
        <div class="display d3" style="color:var(--gold-deep)">0${i + 1}</div>
        <h3 style="margin:var(--s2) 0 var(--s1);font-size:17px">${t}</h3>
        <p class="meta" style="margin:0">${d}</p></div>`).join('')}
  </div>
</section>`);

/* ============================================================
   WF: Base Morning Profile — MB-PER-001 §1
   Three questions. Short, simple, editable. Registration must not
   interrupt these steps (MB-FLW-001 §2).
   ============================================================ */
route('profile', rest => {
  const step = Number(rest[0] || 1);
  const P = S.profile;

  if (step === 1) return shell(1, 'Your morning profile', `
    <h2 class="q">How do you usually like to eat?</h2>
    <p class="lead">This shapes what we recommend. It is a preference, not a medical classification.</p>
    <div class="stack" style="margin-top:var(--s4)">
      ${EATING_STYLES.map(s => `
        <button class="choice" data-set="eatingStyle" data-val="${s.id}" aria-pressed="${P.eatingStyle === s.id}">
          <span class="t">${s.label}</span><span class="d">${s.blurb}</span></button>`).join('')}
    </div>`,
    P.eatingStyle ? '#/profile/2' : null, 'Continue');

  if (step === 2) return shell(2, 'Your morning profile', `
    <h2 class="q">What kind of breakfast do you usually enjoy?</h2>
    <p class="lead">Choose as many as you like. More choices widen what we can offer you — they are never
    combined into one box.</p>
    <div class="stack" style="margin-top:var(--s4)">
      ${PREFERENCES.map(p => `
        <button class="choice" data-toggle="preferences" data-val="${p.id}" aria-pressed="${P.preferences.includes(p.id)}">
          <span class="t">${p.label}</span><span class="d">${p.blurb}</span></button>`).join('')}
    </div>`,
    P.preferences.length ? '#/profile/3' : null, 'Continue');

  return shell(3, 'Your morning profile', `
    <h2 class="q">Any dietary requirements or allergies?</h2>
    <p class="lead">Safety always comes before preference. Anything you tell us here is a hard rule —
    we will never recommend around it.</p>

    <div class="card pad" style="margin-top:var(--s4)">
      <div class="micro">Dietary requirements</div>
      <div class="stack" style="margin-top:var(--s2)">
        ${DIETARY.map(d => `
          <button class="choice compact" data-toggle="dietary" data-val="${d.id}" aria-pressed="${P.dietary.includes(d.id)}">
            <span class="t">${d.label}</span>${d.special ? `<span class="d">Needs a bakery approved for this handling standard.</span>` : ''}
          </button>`).join('')}
      </div>
    </div>

    <div class="card pad" style="margin-top:var(--s3)">
      <div class="micro">Allergies</div>
      <p class="meta" style="margin:var(--s2) 0">An allergen you select here will never appear in a
        recommendation, a swap or an extra.</p>
      <div class="row tight">
        ${ALLERGENS.map(a => `
          <button class="choice chip" data-toggle="allergies" data-val="${a.id}" aria-pressed="${P.allergies.includes(a.id)}">
            <span class="t">${a.label}</span></button>`).join('')}
      </div>
    </div>
    <p class="meta" style="margin-top:var(--s3)">No requirements? Just continue. ${std('MB-PER-001 §1 · MB-BOX-001 §9')}</p>`,
    '#/dates', 'Continue');
});

/** The guided journey shell: one question, one primary action. */
function shell(step, label, body, nextHash, cta) {
  return `<section class="section app">
    ${progress(step, 5, label)}
    ${body}
    <div class="actionbar">
      <button class="btn btn-primary btn-block" ${nextHash ? `data-go="${nextHash}"` : 'disabled'}>${cta}</button>
      ${step > 1 ? `<button class="btn btn-text btn-block" data-back>Back</button>` : ''}
    </div>
  </section>`;
}

/* ============================================================
   Choose dates — MB-FLW-001 §3
   "Every selectable morning must display the day and exact date
    clearly. The interface should not rely on weekday names alone."
   ============================================================ */
route('dates', () => {
  const opts = orderableDates();
  const now = new Date();
  return `<section class="section app">
    ${progress(4, 5, 'Choose your mornings')}
    <h2 class="q">Which mornings shall we plan?</h2>
    <p class="lead">Pick one day, a few, or the whole week. Each morning is planned separately and stays
    independently editable.</p>

    <div class="note plain" style="margin:var(--s4) 0">
      <strong>Order by 9:00 PM</strong> the evening before. It is ${now.getHours().toString().padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} now,
      so the earliest morning we can prepare is <strong>${fmtDateLong(opts[0])}</strong>.
    </div>

    <div class="dates">
      ${opts.map(d => {
        const iso = isoDate(d);
        return `<button class="choice datetile" data-toggle="dates" data-val="${iso}" aria-pressed="${S.dates.includes(iso)}">
          <span class="dow">${d.toLocaleDateString('en-GB', { weekday: 'short' })}</span>
          <span class="dnum">${d.getDate()}</span>
          <span class="mon">${d.toLocaleDateString('en-GB', { month: 'short' })}</span>
        </button>`;
      }).join('')}
    </div>
    ${S.dates.length ? `<p class="meta" style="margin-top:var(--s3)">${S.dates.length} morning${S.dates.length > 1 ? 's' : ''} selected.</p>` : ''}

    <div class="actionbar">
      <button class="btn btn-primary btn-block" ${S.dates.length ? `data-act="start-days"` : 'disabled'}>
        Build ${S.dates.length > 1 ? 'my first morning' : 'my morning'}</button>
      <button class="btn btn-text btn-block" data-back>Back</button>
    </div>
  </section>`;
});

/* ============================================================
   Daily Context — MB-FLW-001 §4
   "The active day and date must be bold and unmistakable at the top."
   ============================================================ */
route('morning', rest => {
  const iso = rest[0];
  if (!iso || !S.dates.includes(iso)) return redirect('#/dates');
  const d = dayOf(iso);
  const n = S.dates.indexOf(iso) + 1;

  /* MB-FLW-001 §5 / MB-PER-001 §3.1 — for the next selected date the user
     chooses Same as Previous Day or Choose a Different Morning. A copied day
     becomes independent and stays editable without changing the original. */
  const prevIso = S.dates.slice(0, S.dates.indexOf(iso)).reverse().find(x => S.days[x]?.saved);
  const prev = prevIso ? S.days[prevIso] : null;

  return `<section class="section app">
    ${progress(5, 5, `Morning ${n} of ${S.dates.length}`)}
    <div class="micro">Planning</div>
    <h2 class="display d2" style="margin:var(--s1) 0 var(--s4)">${fmtDateLong(new Date(iso + 'T00:00:00'))}</h2>

    ${prev ? `
      <div class="card pad" style="margin-bottom:var(--s4)">
        <div class="micro">Quickest</div>
        <div class="row nowrap" style="gap:var(--s3);margin-top:var(--s2)">
          <div class="thumb">${foodArt(prev.config.components[0])}</div>
          <div class="info">
            <div class="nm">Same as ${esc(fmtDate(new Date(prevIso + 'T00:00:00')))}</div>
            <div class="meta">${esc(prev.config.label)}</div>
          </div>
        </div>
        <button class="btn btn-primary btn-block" style="margin-top:var(--s3)"
          data-act="copy-day" data-from="${prevIso}" data-iso="${iso}">Use the same morning</button>
        <p class="meta" style="margin:var(--s2) 0 0">It becomes its own morning — editing this day never
          changes ${esc(fmtDate(new Date(prevIso + 'T00:00:00')))}.</p>
      </div>
      <h3 class="q">Or choose a different morning</h3>` : `<h3 class="q">What kind of morning is this?</h3>`}
    <p class="lead">Different days can have different answers. This does not change your profile.</p>
    <div class="stack" style="margin-top:var(--s4)">
      ${CONTEXTS.map(c => `
        <button class="choice" data-act="set-context" data-iso="${iso}" data-val="${c.id}" aria-pressed="${d.context === c.id}">
          <span class="t">${c.label}</span><span class="d">${c.blurb}</span></button>`).join('')}
    </div>
    <div class="actionbar">
      <button class="btn btn-text btn-block" data-back>Back</button>
    </div>
  </section>`;
});

/* ============================================================
   Recommendation and customization — MB-FLW-001 §5, MB-REC-001 §8–12
   Recommend first. Customize second.
   ============================================================ */
route('box', rest => {
  const iso = rest[0];
  const d = S.days[iso];
  if (!d || !d.context) return redirect('#/dates');

  if (!d.config) {
    const res = recommend(S.profile, d.context);
    d.result = res;
    /* §13 No-match — the system does not relax the user's own inputs. */
    if (!res.primary) return noMatch(iso, res);
    d.config = configure(res.primary, S.profile);
    d.altConfig = res.alternative ? configure(res.alternative, S.profile) : null;
  }

  const cfg = d.config;
  const p = priceBox(cfg);
  const size = cfg.size === 'standard' ? 'regular' : cfg.size;
  const groups = addonGroups(S.profile);
  const ctxLabel = CONTEXTS.find(c => c.id === d.context).label;

  return `<section class="section app wide">
    <div class="row between" style="margin-bottom:var(--s3)">
      <div>
        <div class="micro">${esc(fmtDateLong(new Date(iso + 'T00:00:00')))} · ${esc(ctxLabel)}</div>
        <h2 class="display d2" style="margin:var(--s1) 0 0">Your Morning Box</h2>
      </div>
      <button class="btn btn-ghost btn-sm" data-go="#/morning/${iso}">Change</button>
    </div>

    <div class="split">
      <div>
        <div class="boxviz">${boxArt(cfg)}</div>
        <p class="meta" style="margin-top:10px">${esc(cfg.label)}${cfg.recipe.format ? ' · ' + esc(cfg.recipe.format) : ''}</p>

        ${cfg.substitutions.length ? `<div class="note" style="margin-top:var(--s3)">
          <strong>Adjusted for your requirements.</strong>
          ${cfg.substitutions.map(s => `We replaced ${esc(COMPONENTS[s.from].name)} with ${esc(COMPONENTS[s.to].name)}.`).join(' ')}
          <br><small>Approved substitutions only, always from the Morning Box library ${std('MB-REC-001 §3')}</small></div>` : ''}
        ${cfg.components.some(id => COMPONENTS[id].variant && resolveBuild(id, S.profile)?.variant)
          ? `<div class="note" style="margin-top:var(--s3)">Your oats are prepared with a
             <strong>plant milk base</strong> — an approved variant of the same component.</div>` : ''}

        <div class="card pad" style="margin-top:var(--s3)">
          <h3 style="font-size:16px">What's inside</h3>
          ${cfg.components.map((id, i) => {
            const k = COMPONENTS[id];
            const swappable = canSwap(id) && swapOptions(cfg, i).length > 0;
            return `<div class="item">
              <div class="thumb">${foodArt(id)}</div>
              <div class="info">
                <div class="nm">${esc(k.name)}</div>
                <div class="meta">${esc(portion(id, size))}${k.note ? ' · ' + esc(k.note.split('.')[0]) : ''}</div>
              </div>
              ${swappable
                ? `<button class="btn btn-ghost btn-sm" data-act="swap" data-iso="${iso}" data-idx="${i}">
                     <span class="ic">${icon('swap')}</span>Swap</button>`
                : `<span class="meta" style="font-size:12px">No swap</span>`}
            </div>`;
          }).join('')}
        </div>
      </div>

      <div class="sticky-col">
        <div class="card pad">
          <div class="row between" style="align-items:center">
            <div><div class="micro">Your price</div>${money(p.total, 'lg')}</div>
          </div>

          ${hasSizeSelector(cfg.recipe) ? `
            <div class="field" style="margin-top:var(--s4)">
              <span class="lbl">Size <span class="meta" style="font-weight:400">— changes quantity, not what's inside</span></span>
              <div class="row tight">
                ${SIZES.map(s => `<button class="choice chip" data-act="size" data-iso="${iso}" data-val="${s.id}"
                  aria-pressed="${cfg.size === s.id}"><span class="t">${s.label}</span></button>`).join('')}
              </div>
            </div>`
            : `<p class="meta" style="margin-top:var(--s4)">This breakfast comes in one standard size — Light,
               Regular and Large would make no meaningful difference ${std('MB-PRO-001 §13.1')}.</p>`}

          ${groups.length ? `
            <div class="field" style="margin-top:var(--s3)">
              <span class="lbl">Add something extra <span class="meta" style="font-weight:400">— optional</span></span>
              ${groups.map(g => `<button class="btn btn-secondary btn-block btn-sm" style="margin-bottom:8px"
                data-act="addon" data-iso="${iso}" data-group="${g.id}">
                <span class="ic">${icon('plus')}</span>${g.label}</button>`).join('')}
            </div>` : ''}

          ${cfg.addons.length ? `<div style="margin-top:var(--s2)">
            ${cfg.addons.map((a, i) => `<div class="summary-row">
              <span>${esc(COMPONENTS[a.item].name)}${a.unit ? ` · ${a.unit === 'half' ? 'Half loaf' : 'Whole loaf'}` : ''} × ${a.qty}</span>
              <span class="row tight" style="gap:10px">AED ${fmtAED(addonPrice(a))}
                <button class="btn-text" style="padding:0;min-height:0" data-act="rm-addon" data-iso="${iso}" data-i="${i}">Remove</button></span>
            </div>`).join('')}</div>` : ''}

          <div style="margin-top:var(--s4)">
            <div class="summary-row"><span>Breakfast (${esc(cfg.size === 'standard' ? 'Standard' : SIZES.find(s => s.id === cfg.size).label)})</span><span>AED ${fmtAED(p.base + p.sizeAdj)}</span></div>
            ${p.addons ? `<div class="summary-row"><span>Extras</span><span>AED ${fmtAED(p.addons)}</span></div>` : ''}
            <div class="summary-row total"><span>This morning</span><span>AED ${fmtAED(p.total)}</span></div>
          </div>
          ${indicative}
        </div>

        ${d.altConfig ? `
          <div class="card pad" style="margin-top:var(--s3)">
            <div class="micro">Another option for you</div>
            <div class="row nowrap" style="gap:var(--s3);margin-top:var(--s2)">
              <div class="thumb" style="width:64px;flex:0 0 64px;height:64px">${foodArt(d.altConfig.components[0])}</div>
              <div class="info">
                <div class="nm" style="font-size:14.5px">${esc(d.altConfig.label)}</div>
                <div class="meta">AED ${fmtAED(priceBox(d.altConfig).total)}</div>
              </div>
            </div>
            <button class="btn btn-secondary btn-block btn-sm" style="margin-top:var(--s3)"
              data-act="use-alt" data-iso="${iso}">Use this instead</button>
          </div>` : `
          <p class="meta" style="margin-top:var(--s3)">Only one breakfast matches your choices for this
            morning, so there is no second option to show. One strong recommendation is better than two
            forced ones ${std('MB-REC-001 §13')}.</p>`}
      </div>
    </div>

    <div class="actionbar">
      <button class="btn btn-primary btn-block" data-act="save-day" data-iso="${iso}">
        ${S.dates.indexOf(iso) < S.dates.length - 1 ? 'Save and plan the next morning' : 'Save this morning'}</button>
    </div>
  </section>`;
});

/** §13.1 The user-facing no-match message, verbatim from the standard. */
function noMatch(iso, res) {
  return `<section class="section app">
    <div class="micro">${esc(fmtDateLong(new Date(iso + 'T00:00:00')))}</div>
    <h2 class="display d2" style="margin:var(--s1) 0 var(--s3)">No safe match this morning</h2>
    <div class="note err">We couldn't find a Morning Box that safely matches your requirements.</div>
    <p class="meta" style="margin-top:var(--s3)">
      ${res.rejected.length} approved breakfast${res.rejected.length === 1 ? '' : 'es'} were considered and set aside
      because no approved substitution could make them safe for you. Morning Box never weakens a safety or
      dietary rule to produce a result ${std('MB-REC-001 §13')}.</p>
    <div class="actionbar">
      <button class="btn btn-primary btn-block" data-go="#/profile/3">Review my preferences</button>
      <button class="btn btn-text btn-block" data-go="#/morning/${iso}">Try a different kind of morning</button>
    </div>
  </section>`;
}

/* ============================================================
   Weekly summary — MB-FLW-001 §6
   The total number of mornings and total value are visible BEFORE
   registration. The plan must never be rebuilt after registering.
   ============================================================ */
route('plan', () => {
  const days = savedDays();
  if (!days.length) return redirect('#/dates');
  return `<section class="section app">
    <div class="micro">Your plan</div>
    <h2 class="display d2" style="margin:var(--s1) 0 var(--s3)">${days.length} morning${days.length > 1 ? 's' : ''}, ready</h2>
    <p class="lead">Check everything over. You can edit any morning before you pay — and afterwards, until
    9:00 PM the evening before.</p>

    <div class="stack" style="margin-top:var(--s4)">
      ${days.map(d => {
        const p = priceBox(d.config);
        return `<div class="card">
          <div class="row between" style="align-items:flex-start">
            <div style="flex:1;min-width:0">
              <div class="micro">${esc(fmtDate(new Date(d.date + 'T00:00:00')))} · ${esc(CONTEXTS.find(c => c.id === d.context).label)}</div>
              <div class="nm" style="margin-top:4px">${esc(d.config.label)}</div>
              <div class="meta">${esc(d.config.size === 'standard' ? 'Standard size' : SIZES.find(s => s.id === d.config.size).label)}${d.config.addons.length ? ` · ${d.config.addons.length} extra${d.config.addons.length > 1 ? 's' : ''}` : ''}</div>
            </div>
            <div style="text-align:right">
              <div class="price sm">AED ${fmtAED(p.total)}</div>
              <button class="btn-text" style="padding:4px 0;min-height:0" data-go="#/box/${d.date}">Edit</button>
            </div>
          </div>
        </div>`;
      }).join('')}
    </div>

    <div class="card sand pad" style="margin-top:var(--s4)">
      <div class="summary-row"><span>${days.length} breakfast${days.length > 1 ? 's' : ''}</span><span>AED ${fmtAED(planTotal())}</span></div>
      <div class="summary-row"><span>Delivery</span><span>Included</span></div>
      <div class="summary-row total"><span>Total</span><span>AED ${fmtAED(planTotal())}</span></div>
    </div>
    ${indicative}

    <div class="actionbar">
      <button class="btn btn-primary btn-block" data-go="${S.customer ? '#/delivery' : '#/account'}">Continue</button>
      <button class="btn btn-text btn-block" data-go="#/dates">Add another morning</button>
    </div>
  </section>`;
});

/* ============================================================
   Account — MB-FLW-001 §7
   Mobile number + OTP + first name. Email is not mandatory.
   "Never ask the user to rebuild their mornings after registration."
   ============================================================ */
route('account', () => `
<section class="section app">
  <div class="micro">Almost there</div>
  <h2 class="display d2" style="margin:var(--s1) 0 var(--s3)">Create your account</h2>
  <p class="lead">Your ${savedDays().length} planned morning${savedDays().length > 1 ? 's are' : ' is'} saved and will
  stay exactly as you built ${savedDays().length > 1 ? 'them' : 'it'}.</p>
  <div class="card pad" style="margin-top:var(--s4)">
    <label class="field"><span>First name</span><input type="text" id="acc-name" placeholder="Your first name"></label>
    <label class="field"><span>Mobile number</span><input type="tel" id="acc-mobile" placeholder="+971 50 000 0000"></label>
    <label class="field" style="margin-bottom:0"><span>One-time code</span>
      <input type="text" id="acc-otp" placeholder="Any 4 digits for this demo" inputmode="numeric"></label>
  </div>
  <p class="meta" style="margin-top:var(--s3)">Email is optional and only collected at checkout for your
  order confirmation ${std('MB-FLW-001 §7')}.</p>
  <div class="actionbar">
    <button class="btn btn-primary btn-block" data-act="register">Verify and continue</button>
  </div>
</section>`);

/* ============================================================
   Delivery — MB-FLW-001 §8, MB-DLV-001 §1,3
   A window, not an exact time. Set delivery once; change it only
   when a morning needs something different.
   ============================================================ */
route('delivery', () => {
  const days = savedDays();
  return `<section class="section app">
    <div class="micro">Delivery</div>
    <h2 class="display d2" style="margin:var(--s1) 0 var(--s3)">Where and when</h2>

    <div class="card pad">
      <div class="field"><span class="lbl">Area</span>
        <div class="stack">
          ${OPS.ZONES.filter(z => z.live).map(z => `
            <button class="choice compact" data-act="zone" data-val="${z.id}" aria-pressed="${S.delivery.zone === z.id}">
              <span class="t">${esc(z.label)}</span></button>`).join('')}
        </div>
        <p class="meta" style="margin-top:var(--s2)">Morning Box launches in DIFC. Downtown and Meydan One follow
        once the DIFC operating model is stable.</p>
      </div>
      <label class="field"><span>Building, floor and unit</span>
        <input type="text" id="dl-addr" value="${esc(S.delivery.address)}" placeholder="e.g. Gate Village 4, Level 3, Unit 302"></label>
      <div class="field" style="margin-bottom:0"><span class="lbl">Delivery window</span>
        <div class="row tight">
          ${DELIVERY_WINDOWS.map(w => `
            <button class="choice chip" data-act="window" data-val="${w.id}" aria-pressed="${S.delivery.window === w.id}">
              <span class="t">${w.label}</span></button>`).join('')}
        </div>
        <p class="meta" style="margin-top:var(--s2)">We commit to the window, not to an exact minute —
        that is what lets us keep your breakfast fresh and the route sensible.</p>
      </div>
    </div>

    ${days.length > 1 ? `<p class="meta" style="margin-top:var(--s3)">These details apply to all
      ${days.length} mornings. Each morning can be changed later from your orders.</p>` : ''}

    <div class="actionbar">
      <button class="btn btn-primary btn-block" data-act="save-delivery">Continue to review</button>
    </div>
  </section>`;
});

/* ============================================================
   Review and payment — MB-FLW-001 §9
   ============================================================ */
route('review', () => {
  const days = savedDays();
  if (!days.length) return redirect('#/dates');
  const zone = OPS.ZONES.find(z => z.id === S.delivery.zone);
  const win = DELIVERY_WINDOWS.find(w => w.id === S.delivery.window);
  return `<section class="section app">
    <div class="micro">Review</div>
    <h2 class="display d2" style="margin:var(--s1) 0 var(--s3)">One last look</h2>

    <div class="stack">
      ${days.map(d => {
        const p = priceBox(d.config);
        return `<div class="card">
          <div class="row between">
            <div style="flex:1;min-width:0">
              <strong>${esc(fmtDateLong(new Date(d.date + 'T00:00:00')))}</strong>
              <div class="meta" style="margin-top:3px">${esc(d.config.label)}</div>
              <div class="meta">${esc(win.label)} · ${esc(zone.label)}</div>
            </div>
            <div style="text-align:right"><div class="price sm">AED ${fmtAED(p.total)}</div>
              <button class="btn-text" style="padding:4px 0;min-height:0" data-go="#/box/${d.date}">Edit</button></div>
          </div>
        </div>`;
      }).join('')}
    </div>

    <div class="card sand pad" style="margin-top:var(--s4)">
      <div class="summary-row"><span>Breakfasts and extras</span><span>AED ${fmtAED(planTotal())}</span></div>
      <div class="summary-row"><span>Delivery</span><span>Included</span></div>
      <div class="summary-row total"><span>Total</span><span>AED ${fmtAED(planTotal())}</span></div>
    </div>

    <label class="field" style="margin-top:var(--s3)"><span>Email for your confirmation <span class="meta" style="font-weight:400">— optional</span></span>
      <input type="email" id="rv-email" placeholder="you@company.com"></label>

    <div class="note plain">You can change or cancel any morning free of charge until <strong>9:00 PM</strong>
      the evening before it is due.</div>

    <div class="actionbar">
      <button class="btn btn-primary btn-block" data-act="pay">Pay AED ${fmtAED(planTotal())}</button>
    </div>
  </section>`;
});

/* ============================================================
   Orders — MB-FLW-001 §10, MB-DLV-001 §5,11, MB-REC-001 §14
   ============================================================ */
route('orders', () => {
  if (!S.orders.length) return `<section class="section app">
    <h2 class="display d2">No orders yet</h2>
    <p class="lead">Plan a morning and it will appear here, with live status and a simple way to change or
    cancel it before the cutoff.</p>
    <a class="btn btn-primary btn-block" style="margin-top:var(--s4)" href="#/profile/1">Create my morning</a>
  </section>`;

  return `<section class="section app wide">
    <div class="micro">Your orders</div>
    <h2 class="display d2" style="margin:var(--s1) 0 var(--s4)">Breakfast, arranged</h2>
    ${S.orders.map(o => `
      <div class="card pad" style="margin-bottom:var(--s3)">
        <div class="row between" style="align-items:center">
          <div><strong>${esc(o.id)}</strong>
            <div class="meta">${o.kind === 'business' ? 'Business Breakfast' : 'Personal'} · placed ${new Date(o.placedAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</div></div>
          <div class="price sm">AED ${fmtAED(o.totals.total)}</div>
        </div>
        ${o.days.map(day => orderDay(o, day)).join('')}
      </div>`).join('')}
  </section>`;
});

function orderDay(order, day) {
  const idx = CUSTOMER_STATUS.indexOf(day.customerStatus);
  const terminal = ['Cancelled', 'Refunded'].includes(day.customerStatus);
  const bakery = day.allocation ? OPS.bakeryById[day.allocation.bakeryId] : null;
  return `<div class="card sand" style="margin-top:var(--s3)">
    <div class="row between" style="align-items:flex-start">
      <div style="flex:1;min-width:0">
        <strong>${esc(fmtDateLong(new Date(day.date + 'T00:00:00')))}</strong>
        <div class="meta">${esc(day.summary)}</div>
        <div class="meta">${esc(DELIVERY_WINDOWS.find(w => w.id === day.delivery.window).label)}
          · ${esc(OPS.ZONES.find(z => z.id === day.delivery.zone).label)}</div>
      </div>
      ${pill(day.customerStatus, terminal ? 'err' : day.customerStatus === 'Delivered' ? 'ok' : 'soft')}
    </div>

    ${!terminal ? `<div class="row tight" style="margin-top:var(--s3)">
      ${CUSTOMER_STATUS.map((s, i) => `<span class="pill ${i <= idx ? 'ok' : ''}" style="font-size:10.5px">${s}</span>`).join('')}
    </div>` : ''}

    ${bakery ? `<p class="meta" style="margin-top:var(--s2)">Prepared by <strong>${esc(bakery.name)}</strong></p>` : ''}
    ${day.pod ? `<p class="meta">Delivered to ${esc(day.pod.point)} — ${esc(day.pod.time)}</p>` : ''}
    ${day.refunded ? `<div class="note err" style="margin-top:var(--s2)">${esc(day.refundReason)}</div>` : ''}

    <div class="row tight" style="margin-top:var(--s3)">
      ${OPS.canEditDay(day) ? `<button class="btn btn-ghost btn-sm" data-act="cancel-day" data-order="${order.id}" data-line="${day.lineId}">Cancel this morning</button>
        <span class="meta">Free until ${cutoffFor(day.date).toLocaleString('en-GB', { weekday: 'short', hour: '2-digit', minute: '2-digit' })}</span>`
      : !terminal ? `<span class="meta">The 9:00 PM cutoff has passed — this morning is in production.</span>` : ''}
    </div>

    ${day.customerStatus === 'Delivered' && !day.feedback ? `
      <div class="row tight" style="margin-top:var(--s3)">
        ${FEEDBACK.map(f => `<button class="btn btn-secondary btn-sm" data-act="feedback" data-order="${order.id}" data-line="${day.lineId}" data-val="${f}">${f}</button>`).join('')}
      </div>` : ''}
    ${day.feedback ? `<p class="meta" style="margin-top:var(--s2)">You said: <strong>${esc(day.feedback)}</strong>.
      Thank you — we record it as a learning signal, and it never changes a safety rule ${std('MB-REC-001 §14')}.</p>` : ''}
  </div>`;
}

const redirect = h => { setTimeout(() => go(h), 0); return '<section class="section app"><p class="meta">One moment…</p></section>'; };


/* ============================================================
   PART B — Business Breakfast
   MB-B2B-001: Number of People → Breakfast Selection → Day →
   Delivery → Confirm. No Swap, no extras, no component-level
   customization. "Don't ask a question unless the answer changes
   the experience."
   ============================================================ */

function newBusiness() {
  return {
    step: 1, people: 20, hasSpecial: null, specials: [],
    mode: null, lines: [], dates: [], context: 'regular',
    company: '', contact: '', mobile: '', email: '',
    building: '', zone: 'difc-gate', window: 'w2', notes: ''
  };
}
const B = () => (S.business ||= newBusiness());

route('business', rest => {
  const b = B();
  const step = Number(rest[0] || b.step || 1);
  b.step = step;
  const generals = () => b.people - b.specials.reduce((t, s) => t + s.qty, 0);

  /* --- 1 · headcount is the first business input (§1) --- */
  if (step === 1) return bshell(1, `
    <h2 class="q">How many people?</h2>
    <p class="lead">Every Morning Box is an individual box, not a shared platter. Team, meeting or company —
    we do not need to know which.</p>
    <div class="card pad" style="margin-top:var(--s4)">
      <label class="field" style="margin-bottom:0"><span>Number of people</span>
        <input type="number" min="2" max="500" id="b-people" value="${b.people}"></label>
    </div>
    <div class="row tight" style="margin-top:var(--s3)">
      ${[10, 20, 35, 60].map(n => `<button class="choice chip" data-act="b-people" data-val="${n}"
        aria-pressed="${b.people === n}"><span class="t">${n}</span></button>`).join('')}
    </div>`, '#/business/2', 'Continue');

  /* --- 2 · one simple dietary question, then Special Breakfast groups (§3) --- */
  if (step === 2) return bshell(2, `
    <h2 class="q">Does anyone have dietary requirements or allergies?</h2>
    <p class="lead">Please check with your group before ordering. We will protect those boxes separately from
    the general order.</p>
    <div class="row tight" style="margin-top:var(--s4)">
      <button class="choice chip" data-act="b-special" data-val="no" aria-pressed="${b.hasSpecial === false}"><span class="t">No</span></button>
      <button class="choice chip" data-act="b-special" data-val="yes" aria-pressed="${b.hasSpecial === true}"><span class="t">Yes</span></button>
    </div>

    ${b.hasSpecial ? `
      <div class="card pad" style="margin-top:var(--s4)">
        <div class="micro">Special breakfasts</div>
        ${b.specials.map((sp, i) => `
          <div class="item">
            <div class="info">
              <div class="nm">${esc([...sp.dietary.map(d => DIETARY.find(x => x.id === d).label),
                                     ...sp.allergies.map(a => ALLERGENS.find(x => x.id === a).label)].join(' + ') || 'Special')}</div>
              <div class="meta">${sp.resolved ? esc(describe({ ...sp.resolved.recipe, components: sp.resolved.components })) : 'No safe match — see below'}</div>
            </div>
            <span class="pill">× ${sp.qty}</span>
            <button class="btn-text" style="padding:0;min-height:0" data-act="b-rm-special" data-i="${i}">Remove</button>
          </div>
          ${!sp.resolved ? `<div class="note err">No approved Morning Box safely matches this combination.
            Our team will contact you before the order is confirmed.</div>` : ''}`).join('')}
        <button class="btn btn-secondary btn-block btn-sm" style="margin-top:var(--s3)" data-act="b-add-special">
          <span class="ic">${icon('plus')}</span>Add a special breakfast</button>
      </div>
      <div class="note plain" style="margin-top:var(--s3)">
        <strong>${b.people} people</strong> · ${b.specials.reduce((t, s) => t + s.qty, 0)} special ·
        ${generals()} general</div>` : ''}`,
    b.hasSpecial === null ? null : '#/business/3', 'Continue');

  /* --- 3 · Morning Box Mix or Choose Your Boxes (§2) --- */
  if (step === 3) {
    const g = generals();
    return bshell(3, `
      <h2 class="q">How shall we fill the general boxes?</h2>
      <p class="lead">${g} general breakfast${g === 1 ? '' : 's'} to arrange. Business orders use Breakfast Model,
      Size and Quantity only — no component swaps, to keep group ordering fast and reliable.</p>
      <div class="stack" style="margin-top:var(--s4)">
        <button class="choice" data-act="b-mode" data-val="mix" aria-pressed="${b.mode === 'mix'}">
          <span class="t">Morning Box Mix</span>
          <span class="d">We spread the order evenly across our standard models. Fastest, and a good variety.</span></button>
        <button class="choice" data-act="b-mode" data-val="choose" aria-pressed="${b.mode === 'choose'}">
          <span class="t">Choose Your Boxes</span>
          <span class="d">Pick the models and quantities yourself.</span></button>
      </div>

      ${b.mode ? `<div class="card pad" style="margin-top:var(--s4)">
        <div class="micro">Breakfast model × size × quantity</div>
        ${b.lines.map((l, i) => `
          <div class="item">
            <div class="thumb">${foodArt(l.model.recipe.components[0])}</div>
            <div class="info">
              <div class="nm" style="font-size:14px">${esc(l.model.label)}</div>
              <div class="row tight" style="margin-top:6px">
                ${SIZES.map(sz => `<button class="choice chip" style="min-height:34px;padding:6px 12px"
                  data-act="b-size" data-i="${i}" data-val="${sz.id}" aria-pressed="${l.size === sz.id}">
                  <span class="t" style="font-size:12.5px">${sz.label}</span></button>`).join('')}
              </div>
            </div>
            <div style="text-align:right">
              <div class="row tight" style="flex-wrap:nowrap">
                <button class="btn btn-ghost btn-sm" data-act="b-qty" data-i="${i}" data-d="-1">−</button>
                <strong class="num" style="min-width:26px;text-align:center">${l.qty}</strong>
                <button class="btn btn-ghost btn-sm" data-act="b-qty" data-i="${i}" data-d="1">+</button>
              </div>
            </div>
          </div>`).join('')}
        ${b.mode === 'choose' ? `<button class="btn btn-secondary btn-block btn-sm" style="margin-top:var(--s3)"
          data-act="b-add-model"><span class="ic">${icon('plus')}</span>Add a breakfast model</button>` : ''}
        ${allocWarning(b)}
      </div>` : ''}`,
      b.mode && b.lines.length ? '#/business/4' : null, 'Continue');
  }

  /* --- 4 · days (§6) --- */
  if (step === 4) {
    const opts = orderableDates(new Date(), 10);
    return bshell(4, `
      <h2 class="q">Which mornings?</h2>
      <p class="lead">Each day is operationally independent and can be edited or cancelled on its own cutoff.
      Multi-day is not a subscription.</p>
      <div class="dates" style="margin-top:var(--s4)">
        ${opts.map(d => {
          const iso = isoDate(d);
          return `<button class="choice datetile" data-act="b-date" data-val="${iso}" aria-pressed="${b.dates.includes(iso)}">
            <span class="dow">${d.toLocaleDateString('en-GB', { weekday: 'short' })}</span>
            <span class="dnum">${d.getDate()}</span>
            <span class="mon">${d.toLocaleDateString('en-GB', { month: 'short' })}</span></button>`;
        }).join('')}
      </div>
      ${b.dates.length > 1 ? `<div class="note plain" style="margin-top:var(--s3)">The same order will be
        prepared on each of the ${b.dates.length} selected mornings. Volume discount is calculated per day,
        not across days ${std('MB-B2B-001 §7')}.</div>` : ''}`,
      b.dates.length ? '#/business/5' : null, 'Continue');
  }

  /* --- 5 · delivery and company details (§6, §16) --- */
  if (step === 5) return bshell(5, `
    <h2 class="q">Delivery and company</h2>
    <div class="card pad" style="margin-top:var(--s4)">
      <label class="field"><span>Company name</span><input type="text" id="b-company" value="${esc(b.company)}" placeholder="Company"></label>
      <div class="field"><span class="lbl">Area</span>
        <div class="stack">${OPS.ZONES.filter(z => z.live).map(z => `
          <button class="choice compact" data-act="b-zone" data-val="${z.id}" aria-pressed="${b.zone === z.id}">
            <span class="t">${esc(z.label)}</span></button>`).join('')}</div></div>
      <label class="field"><span>Building, floor and unit</span><input type="text" id="b-building" value="${esc(b.building)}" placeholder="Tower, floor, office"></label>
      <label class="field"><span>Contact person on the day</span><input type="text" id="b-contact" value="${esc(b.contact)}" placeholder="Name"></label>
      <label class="field"><span>Mobile number</span><input type="tel" id="b-mobile" value="${esc(b.mobile)}" placeholder="+971 50 000 0000"></label>
      <label class="field"><span>Business email <span class="meta" style="font-weight:400">— for your invoice</span></span>
        <input type="email" id="b-email" value="${esc(b.email)}" placeholder="name@company.com"></label>
      <div class="field" style="margin-bottom:0"><span class="lbl">Delivery window</span>
        <div class="row tight">${DELIVERY_WINDOWS.map(w => `
          <button class="choice chip" data-act="b-window" data-val="${w.id}" aria-pressed="${b.window === w.id}">
            <span class="t">${w.label}</span></button>`).join('')}</div></div>
    </div>
    <p class="meta" style="margin-top:var(--s3)">The contact person may be different from you. Trade licence
    and TRN are not required to order ${std('MB-B2B-001 §16')}.</p>`,
    '#/business/6', 'Review order');

  /* --- 6 · review, discount and payment (§7, §8) --- */
  const prices = priceBusinessDay(b.lines, b.specials);
  const perDay = prices.total;
  const grand = perDay * Math.max(1, b.dates.length);
  const zone = OPS.ZONES.find(z => z.id === b.zone);
  return bshell(6, `
    <h2 class="q">Review your Business Breakfast</h2>
    <div class="card pad" style="margin-top:var(--s4)">
      <div class="row between"><strong>${b.people} people</strong>
        <span class="meta">${prices.boxes} boxes allocated</span></div>
      ${prices.boxes !== b.people ? `<div class="note err" style="margin-top:var(--s2)">
        Total boxes must equal the headcount. You have ${prices.boxes} of ${b.people}
        — ${prices.boxes < b.people ? `${b.people - prices.boxes} unallocated` : `${prices.boxes - b.people} excess`}
        ${std('MB-B2B-001 §10')}</div>` : ''}
      <table class="data" style="margin-top:var(--s3)">
        <tbody>
          ${b.lines.map(l => `<tr><td>${esc(l.model.label)}<br><span class="meta">${SIZES.find(s => s.id === l.size).label}</span></td>
            <td class="num">× ${l.qty}</td>
            <td class="num">AED ${fmtAED((l.model.base + { light: -7, regular: 0, large: 11 }[l.size]) * l.qty)}</td></tr>`).join('')}
          ${b.specials.map(sp => `<tr><td>Special — ${esc([...sp.dietary.map(d => DIETARY.find(x => x.id === d).label), ...sp.allergies.map(a => ALLERGENS.find(x => x.id === a).label)].join(' + '))}
            <br><span class="meta">${sp.resolved ? esc(describe({ ...sp.resolved.recipe, components: sp.resolved.components })) : 'Needs manual confirmation'}</span></td>
            <td class="num">× ${sp.qty}</td><td class="num">—</td></tr>`).join('')}
        </tbody>
      </table>
    </div>

    <div class="card sand pad" style="margin-top:var(--s3)">
      <div class="summary-row"><span>Breakfast total, per morning</span><span>AED ${fmtAED(prices.gross)}</span></div>
      ${prices.discountPct ? `<div class="summary-row"><span>Volume discount (${(prices.discountPct * 100).toFixed(0)}% on ${prices.boxes} boxes)</span>
        <span>− AED ${fmtAED(prices.discount)}</span></div>` : ''}
      <div class="summary-row"><span>Mornings</span><span>× ${b.dates.length || 1}</span></div>
      <div class="summary-row total"><span>Total</span><span>AED ${fmtAED(grand)}</span></div>
    </div>
    <p class="meta" style="margin-top:var(--s2)">Prepaid. A tax invoice is issued to ${esc(b.email || 'your business email')} after payment.
    Discount tiers are indicative — MB-B2B-001 §7 defers the real thresholds to costing approval.</p>
    <div class="note plain" style="margin-top:var(--s3)">${esc(zone.label)} ·
      ${esc(DELIVERY_WINDOWS.find(w => w.id === b.window).label)} ·
      ${b.dates.map(d => fmtDate(new Date(d + 'T00:00:00'))).join(', ')}</div>`,
    null, '', `<button class="btn btn-primary btn-block" data-act="b-pay"
      ${prices.boxes === b.people && b.dates.length ? '' : 'disabled'}>Pay AED ${fmtAED(grand)}</button>`);
});

function allocWarning(b) {
  const total = b.lines.reduce((t, l) => t + l.qty, 0) + b.specials.reduce((t, s) => t + s.qty, 0);
  if (total === b.people) return `<p class="meta" style="margin-top:var(--s3)">
    ${total} boxes for ${b.people} people ${pill('Balanced', 'ok')}</p>`;
  return `<div class="note err" style="margin-top:var(--s3)">${total} boxes allocated for ${b.people} people.
    Total boxes must equal the headcount before you can continue.</div>`;
}

function bshell(step, body, nextHash, cta, customCta) {
  return `<section class="section app">
    ${progress(step, 6, 'Business Breakfast')}
    ${body}
    <div class="actionbar">
      ${customCta || `<button class="btn btn-primary btn-block" ${nextHash ? `data-go="${nextHash}"` : 'disabled'}>${cta}</button>`}
      ${step > 1 ? `<button class="btn btn-text btn-block" data-go="#/business/${step - 1}">Back</button>` : ''}
    </div>
  </section>`;
}

/* ============================================================
   PART C — Operations console (MB-OPS-001)
   Not a customer screen. Plan the night before; execute by
   exception in the morning.
   ============================================================ */
route('ops', () => {
  const dates = [...new Set(S.orders.flatMap(o => o.days.map(d => d.date)))].sort();
  if (!dates.length) return `<section class="section wrap">
    <div class="micro">Operations</div><h2 class="display d2">Nothing in the pipeline</h2>
    <p class="lead">Place an order first — the operations console works on live orders.</p>
    <a class="btn btn-primary" href="#/profile/1">Create a morning</a></section>`;

  const date = S.opsDate && dates.includes(S.opsDate) ? S.opsDate : (S.opsDate = dates[0]);
  const plan = OPS.productionPlan(S.orders, date, S.opsBakery);
  const rec = OPS.reconcile(S.orders, date);
  const allDays = S.orders.flatMap(o => o.days.filter(d => d.date === date).map(d => ({ o, d })));
  const openEx = allDays.flatMap(({ o, d }) => d.exceptions.filter(e => e.state === 'Open').map(e => ({ o, d, e })));

  return `<section class="section wrap">
    <div class="row between" style="margin-bottom:var(--s4)">
      <div><div class="micro">Operations console</div>
        <h2 class="display d2" style="margin:var(--s1) 0 0">${esc(fmtDateLong(new Date(date + 'T00:00:00')))}</h2></div>
      <div class="row tight">
        ${dates.map(d => `<button class="choice chip" data-act="ops-date" data-val="${d}" aria-pressed="${d === date}">
          <span class="t">${esc(fmtDate(new Date(d + 'T00:00:00')))}</span></button>`).join('')}
      </div>
    </div>

    <div class="grid g4" style="margin-bottom:var(--s4)">
      ${[['Boxes in production', plan.totalBoxes], ['Earliest ready-by', plan.earliestReadyBy || '—'],
         ['Open exceptions', openEx.length], ['Auto-reconciled', rec.delivered]].map(([l, v]) =>
        `<div class="card center"><div class="display d3">${v}</div><div class="meta">${l}</div></div>`).join('')}
    </div>

    <div class="card pad" style="margin-bottom:var(--s3)">
      <div class="row between" style="align-items:center">
        <div><strong>Night-before cycle</strong>
          <div class="meta">Finalize orders → validate capacity → final allocation → production lists → bakery confirmation</div></div>
        <button class="btn btn-secondary btn-sm" data-act="ops-cutoff" data-date="${date}">Run the 9:00 PM cutoff</button>
      </div>
    </div>

    <div class="row tight" style="margin-bottom:var(--s3)">
      ${OPS.BAKERIES.map(b => `<button class="choice chip" data-act="ops-bakery" data-val="${b.id}" aria-pressed="${b.id === S.opsBakery}">
        <span class="t">${esc(b.name)}</span></button>`).join('')}
    </div>

    <div class="split">
      <div class="card pad">
        <div class="micro">Production view — aggregate for the kitchen</div>
        ${plan.production.length ? `<table class="data" style="margin-top:var(--s2)">
          <thead><tr><th>Component</th><th>Size</th><th class="num">Qty</th><th>Packing</th></tr></thead>
          <tbody>${plan.production.map(p => `<tr>
            <td>${esc(p.component.name)}<br><span class="meta">${esc(p.component.category)}</span></td>
            <td>${esc(p.size)}</td><td class="num">${p.qty}</td>
            <td class="meta">${esc(p.packing || '—')}</td></tr>`).join('')}</tbody></table>`
          : `<p class="meta">Nothing assigned to this bakery for this morning.</p>`}
      </div>

      <div class="card pad">
        <div class="micro">Packing view — one row per box</div>
        ${plan.packing.map(b => `
          <div class="item">
            <div class="info">
              <div class="nm" style="font-size:14px">${esc(b.boxId)}${b.special ? ' ' : ''}${b.special ? pill('SPECIAL', 'err') : ''}</div>
              <div class="meta">${b.components.map(c => esc(c.name)).join(' · ')}</div>
              ${b.allergies.length ? `<div style="margin-top:5px">${b.allergies.map(a => pill('No ' + ALLERGENS.find(x => x.id === a).label, 'err')).join(' ')}</div>` : ''}
              ${b.format ? `<div class="meta">${esc(b.format)}</div>` : ''}
            </div>
            <div style="text-align:right"><span class="pill">${esc(b.size)}</span>
              <div class="meta" style="margin-top:4px">Ready ${esc(b.readyBy)}</div></div>
          </div>`).join('') || '<p class="meta">No boxes.</p>'}
      </div>
    </div>

    <div class="card pad" style="margin-top:var(--s3)">
      <div class="micro">Order progress — on track, attention required, late</div>
      <table class="data" style="margin-top:var(--s2)">
        <thead><tr><th>Order</th><th>Bakery</th><th>Production</th><th>Delivery</th><th>Customer sees</th><th></th></tr></thead>
        <tbody>${allDays.map(({ o, d }) => `
          <tr>
            <td>${esc(d.lineId)}<br><span class="meta">${esc(OPS.ZONES.find(z => z.id === d.delivery.zone).label)}</span></td>
            <td>${d.allocation ? esc(OPS.bakeryById[d.allocation.bakeryId].name) : '—'}</td>
            <td>${pill(d.bakeryStatus, d.bakeryStatus === 'Handed Over' ? 'ok' : '')}
              ${d.qcPassed ? pill('QC', 'ok') : ''}</td>
            <td>${d.deliveryStatus ? pill(d.deliveryStatus, d.deliveryStatus === 'Delivered' ? 'ok' : '') : '—'}</td>
            <td>${pill(d.customerStatus, ['Cancelled', 'Refunded'].includes(d.customerStatus) ? 'err' : '')}</td>
            <td class="num">${opsActions(o, d)}</td>
          </tr>`).join('')}</tbody>
      </table>
    </div>

    ${openEx.length ? `<div class="card pad" style="margin-top:var(--s3);border-color:var(--err-bd)">
      <div class="micro" style="color:var(--err)">Exception queue — every exception needs an owner, an action and a resolution</div>
      ${openEx.map(({ o, d, e }) => `<div class="item">
        <div class="info"><div class="nm" style="font-size:14px">${esc(e.kind)} ${e.safety ? pill('SAFETY', 'err') : ''}</div>
          <div class="meta">${esc(d.lineId)} · owner ${esc(e.owner)}</div></div>
        <button class="btn btn-secondary btn-sm" data-act="ops-resolve" data-line="${esc(d.lineId)}" data-ex="${esc(e.id)}">Resolve</button>
      </div>`).join('')}</div>` : ''}

    <div class="card pad" style="margin-top:var(--s3)">
      <div class="micro">Daily reconciliation</div>
      <div class="grid g4" style="margin-top:var(--s2)">
        ${[['Delivered and matched', rec.delivered], ['Refunded', rec.refunded],
           ['Exceptions raised', rec.exceptions], ['Revenue, AED', fmtAED(rec.revenue)]].map(([l, v]) =>
          `<div><div class="display d3">${v}</div><div class="meta">${l}</div></div>`).join('')}
      </div>
      <p class="meta" style="margin-top:var(--s3)">Failed, late, refunded and partner-caused exception orders
      stay identifiable rather than disappearing into successful-order totals ${std('MB-OPS-001 §9')}.</p>
    </div>
  </section>`;
});

function opsActions(o, d) {
  if (['Cancelled', 'Refunded'].includes(d.customerStatus)) return '';
  const btn = (act, label, extra = '') =>
    `<button class="btn btn-ghost btn-sm" data-act="${act}" data-line="${esc(d.lineId)}" ${extra}>${label}</button>`;
  const next = OPS.BAKERY_STATES[OPS.BAKERY_STATES.indexOf(d.bakeryStatus) + 1];
  let out = '';
  if (d.bakeryStatus === 'In Preparation' && !d.qcPassed) out += btn('ops-qc', 'Pass QC');
  if (next && !(next === 'Ready' && !d.qcPassed)) out += btn('ops-bakery-next', next, `data-to="${next}"`);
  if (d.deliveryStatus && d.deliveryStatus !== 'Delivered') {
    const dn = OPS.DELIVERY_STATES[OPS.DELIVERY_STATES.indexOf(d.deliveryStatus) + 1];
    if (dn === 'Delivered') out += btn('ops-deliver', 'Record delivery');
    else if (dn) out += btn('ops-delivery-next', dn, `data-to="${dn}"`);
  }
  if (!d.exceptions.some(e => e.state === 'Open')) out += btn('ops-exception', 'Raise exception');
  return out;
}

/* ============================================================
   Modals
   ============================================================ */
function openModal(html) {
  const el = document.createElement('div');
  el.className = 'overlay';
  el.innerHTML = `<div class="modal"><div class="grab"></div>${html}</div>`;
  el.addEventListener('click', e => { if (e.target === el) el.remove(); });
  document.body.appendChild(el);
}
const closeModal = () => document.querySelectorAll('.overlay').forEach(e => e.remove());
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

/** §9 Swap — eligible alternatives only, re-filtered before display. */
function swapModal(iso, idx) {
  const cfg = S.days[iso].config;
  const cur = cfg.components[idx];
  const opts = swapOptions(cfg, idx);
  const size = cfg.size === 'standard' ? 'regular' : cfg.size;
  openModal(`
    <div class="micro">Swap</div>
    <h3 class="q" style="font-size:22px">${esc(COMPONENTS[cur].name)}</h3>
    <p class="meta">Same role in your breakfast, re-checked against your allergies, dietary requirements and
    eating style. A swap inside the same group never changes the price ${std('MB-REC-001 §9')}.</p>
    <div class="stack" style="margin-top:var(--s3)">
      ${opts.map(id => `<button class="choice" data-act="do-swap" data-iso="${iso}" data-idx="${idx}" data-val="${id}">
        <span class="row nowrap" style="gap:var(--s3)">
          <span class="thumb">${foodArt(id)}</span>
          <span style="flex:1"><span class="t">${esc(COMPONENTS[id].name)}</span>
            <span class="d">${esc(portion(id, size))}${COMPONENTS[id].note ? ' · ' + esc(COMPONENTS[id].note.split('.')[0]) : ''}</span></span>
        </span></button>`).join('')}
    </div>
    <button class="btn btn-ghost btn-block" style="margin-top:var(--s3)" data-act="close-modal">Keep what I have</button>`);
}

/** §12 Add-ons — approved bread and pastry only, after safety filtering. */
function addonModal(iso, groupId) {
  const g = addonGroups(S.profile).find(x => x.id === groupId);
  openModal(`
    <div class="micro">Add something extra</div>
    <h3 class="q" style="font-size:22px">${esc(g.label)}</h3>
    <p class="meta">Fresh from the same bakery, packed separately from your breakfast.</p>
    <div class="stack" style="margin-top:var(--s3)">
      ${g.items.map(id => g.units
        ? g.units.map(u => `<button class="choice compact" data-act="do-addon" data-iso="${iso}" data-group="${g.id}" data-item="${id}" data-unit="${u}">
            <span class="row nowrap" style="gap:var(--s3)"><span class="thumb">${foodArt(id)}</span>
            <span style="flex:1"><span class="t">${esc(COMPONENTS[id].name)}</span>
              <span class="d">${u === 'half' ? 'Half loaf' : 'Whole loaf'} · AED ${fmtAED(u === 'half' ? 12 : 20)}</span></span></span>
          </button>`).join('')
        : `<button class="choice compact" data-act="do-addon" data-iso="${iso}" data-group="${g.id}" data-item="${id}">
            <span class="row nowrap" style="gap:var(--s3)"><span class="thumb">${foodArt(id)}</span>
            <span style="flex:1"><span class="t">${esc(COMPONENTS[id].name)}</span>
              <span class="d">${esc(COMPONENTS[id].note || '')} · AED ${fmtAED(addonPrice({ group: 'pastry', item: id, qty: 1 }))}</span></span></span>
          </button>`).join('')}
    </div>
    <button class="btn btn-ghost btn-block" style="margin-top:var(--s3)" data-act="close-modal">Done</button>`);
}

function specialModal() {
  openModal(`
    <div class="micro">Special breakfast</div>
    <h3 class="q" style="font-size:22px">Who needs something different?</h3>
    <p class="meta">Combine the requirement with a quantity — for example Vegan + Nut Allergy × 2.</p>
    <div class="card sand pad" style="margin-top:var(--s3)">
      <div class="micro">Dietary</div>
      <div class="row tight" style="margin-top:var(--s2)">
        ${DIETARY.map(d => `<button class="choice chip" data-sp="dietary" data-val="${d.id}" aria-pressed="false"><span class="t">${d.label}</span></button>`).join('')}
      </div>
      <div class="micro" style="margin-top:var(--s3)">Allergies</div>
      <div class="row tight" style="margin-top:var(--s2)">
        ${ALLERGENS.map(a => `<button class="choice chip" data-sp="allergies" data-val="${a.id}" aria-pressed="false"><span class="t">${a.label}</span></button>`).join('')}
      </div>
      <label class="field" style="margin:var(--s3) 0 0"><span>How many people</span>
        <input type="number" id="sp-qty" min="1" value="1"></label>
    </div>
    <button class="btn btn-primary btn-block" style="margin-top:var(--s3)" data-act="save-special">Add this group</button>
    <button class="btn btn-text btn-block" data-act="close-modal">Cancel</button>`);
}

function modelModal() {
  const models = businessModels(B().context);
  openModal(`
    <div class="micro">Add a model</div>
    <h3 class="q" style="font-size:22px">Choose a breakfast model</h3>
    <div class="stack" style="margin-top:var(--s3)">
      ${models.map((m, i) => `<button class="choice compact" data-act="do-add-model" data-i="${i}">
        <span class="row nowrap" style="gap:var(--s3)"><span class="thumb">${foodArt(m.recipe.components[0])}</span>
        <span style="flex:1"><span class="t">${esc(m.label)}</span>
          <span class="d">${esc(PREFERENCES.find(p => p.id === m.preference).label)} ·
            ${m.eatingStyle === 'health' ? 'Health-Conscious' : 'Flexible'} · AED ${fmtAED(m.base)}</span></span></span>
      </button>`).join('')}
    </div>
    <button class="btn btn-ghost btn-block" style="margin-top:var(--s3)" data-act="close-modal">Cancel</button>`);
  window.__models = models;
}

/* ============================================================
   Actions
   ============================================================ */
document.addEventListener('click', e => {
  const t = e.target.closest('[data-act],[data-set],[data-toggle],[data-go],[data-back],[data-sp]');
  if (!t) return;

  if (t.dataset.go !== undefined) { go(t.dataset.go); return; }
  if (t.dataset.back !== undefined) { history.back(); return; }

  if (t.dataset.set) { S.profile[t.dataset.set] = t.dataset.val; render(); return; }

  if (t.dataset.toggle) {
    const k = t.dataset.toggle, v = t.dataset.val;
    const arr = k === 'dates' ? S.dates : S.profile[k];
    const i = arr.indexOf(v);
    if (i >= 0) arr.splice(i, 1); else arr.push(v);
    if (k === 'dates') S.dates.sort();
    /* Changing the profile invalidates every built morning — the engine must
       re-run rather than keep a box that may no longer be eligible. */
    if (k !== 'dates') for (const iso of Object.keys(S.days)) { S.days[iso].config = null; S.days[iso].saved = false; }
    render(); return;
  }

  if (t.dataset.sp) {
    t.setAttribute('aria-pressed', t.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
    return;
  }

  const a = t.dataset.act;
  const iso = t.dataset.iso;
  const b = S.business;

  switch (a) {
    /* ---- personal journey ---- */
    case 'start-days': go('#/morning/' + S.dates[0]); break;
    case 'set-context': { dayOf(iso).context = t.dataset.val; dayOf(iso).config = null; go('#/box/' + iso); break; }
    case 'copy-day': {
      const from = S.days[t.dataset.from];
      const to = dayOf(iso);
      to.context = from.context;
      /* An independent copy: later edits to this day must not touch the original. */
      to.config = { ...from.config, components: from.config.components.slice(),
                    substitutions: from.config.substitutions.slice(),
                    userSwaps: from.config.userSwaps.slice(),
                    addons: from.config.addons.map(a => ({ ...a })) };
      to.altConfig = from.altConfig
        ? { ...from.altConfig, components: from.altConfig.components.slice(),
            substitutions: from.altConfig.substitutions.slice(),
            userSwaps: [], addons: [] }
        : null;
      to.saved = false;
      go('#/box/' + iso); break;
    }
    case 'swap': swapModal(iso, Number(t.dataset.idx)); break;
    case 'do-swap': {
      const res = applySwap(S.days[iso].config, Number(t.dataset.idx), t.dataset.val);
      if (!res.ok) { alert(res.reason); break; }
      S.days[iso].config.label = describe({ ...S.days[iso].config.recipe, components: S.days[iso].config.components });
      closeModal(); render(); break;
    }
    case 'size': setSize(S.days[iso].config, t.dataset.val); render(); break;
    case 'addon': addonModal(iso, t.dataset.group); break;
    case 'do-addon': {
      const cfg = S.days[iso].config;
      const item = t.dataset.item, unit = t.dataset.unit || null, group = t.dataset.group;
      const found = cfg.addons.find(x => x.item === item && x.unit === unit);
      if (found) found.qty++; else cfg.addons.push({ group, item, unit, qty: 1 });
      closeModal(); render(); break;
    }
    case 'rm-addon': S.days[iso].config.addons.splice(Number(t.dataset.i), 1); render(); break;
    case 'use-alt': {
      const d = S.days[iso];
      [d.config, d.altConfig] = [d.altConfig, d.config];
      render(); break;
    }
    case 'save-day': {
      S.days[iso].saved = true;
      const next = nextUnsaved();
      go(next ? '#/morning/' + next : '#/plan');
      break;
    }
    case 'register': {
      const name = document.getElementById('acc-name').value.trim();
      const mobile = document.getElementById('acc-mobile').value.trim();
      if (!name || !mobile) { alert('Please enter your first name and mobile number.'); break; }
      S.customer = { firstName: name, mobile, id: 'CUS-' + Math.random().toString(36).slice(2, 7).toUpperCase() };
      go('#/delivery'); break;
    }
    case 'zone': S.delivery.zone = t.dataset.val; render(); break;
    case 'window': S.delivery.window = t.dataset.val; render(); break;
    case 'save-delivery': {
      const el = document.getElementById('dl-addr');
      S.delivery.address = el ? el.value.trim() : '';
      go('#/review'); break;
    }
    case 'pay': placePersonalOrder(); break;

    /* ---- orders ---- */
    case 'cancel-day': {
      const day = findDay(t.dataset.order, t.dataset.line);
      const res = OPS.cancelDay(day);
      if (!res.ok) alert(res.reason);
      render(); break;
    }
    case 'feedback': {
      const day = findDay(t.dataset.order, t.dataset.line);
      day.feedback = t.dataset.val;
      render(); break;
    }

    /* ---- business ---- */
    case 'b-people': { b.people = Number(t.dataset.val); rebalanceMix(); render(); break; }
    case 'b-special': {
      b.hasSpecial = t.dataset.val === 'yes';
      if (!b.hasSpecial) b.specials = [];
      rebalanceMix(); render(); break;
    }
    case 'b-add-special': specialModal(); break;
    case 'save-special': {
      const dietary = [...document.querySelectorAll('[data-sp="dietary"][aria-pressed="true"]')].map(x => x.dataset.val);
      const allergies = [...document.querySelectorAll('[data-sp="allergies"][aria-pressed="true"]')].map(x => x.dataset.val);
      const qty = Math.max(1, Number(document.getElementById('sp-qty').value) || 1);
      if (!dietary.length && !allergies.length) { alert('Choose at least one requirement.'); break; }
      b.specials.push(resolveSpecial({ dietary, allergies, qty }, b.context));
      rebalanceMix(); closeModal(); render(); break;
    }
    case 'b-rm-special': b.specials.splice(Number(t.dataset.i), 1); rebalanceMix(); render(); break;
    case 'b-mode': {
      b.mode = t.dataset.val;
      const general = b.people - b.specials.reduce((s, x) => s + x.qty, 0);
      b.lines = b.mode === 'mix' ? morningBoxMix(general, b.context) : [];
      render(); break;
    }
    case 'b-add-model': modelModal(); break;
    case 'do-add-model': {
      b.lines.push({ model: window.__models[Number(t.dataset.i)], size: 'regular', qty: 1 });
      closeModal(); render(); break;
    }
    case 'b-size': b.lines[Number(t.dataset.i)].size = t.dataset.val; render(); break;
    case 'b-qty': {
      const l = b.lines[Number(t.dataset.i)];
      l.qty = Math.max(0, l.qty + Number(t.dataset.d));
      if (!l.qty) b.lines.splice(Number(t.dataset.i), 1);
      render(); break;
    }
    case 'b-date': {
      const i = b.dates.indexOf(t.dataset.val);
      if (i >= 0) b.dates.splice(i, 1); else b.dates.push(t.dataset.val);
      b.dates.sort(); render(); break;
    }
    case 'b-zone': b.zone = t.dataset.val; render(); break;
    case 'b-window': b.window = t.dataset.val; render(); break;
    case 'b-pay': placeBusinessOrder(); break;

    /* ---- operations ---- */
    case 'ops-date': S.opsDate = t.dataset.val; render(); break;
    case 'ops-bakery': S.opsBakery = t.dataset.val; render(); break;
    case 'ops-cutoff': {
      const n = OPS.runCutoff(S.orders, t.dataset.date).length;
      alert(`Cutoff complete. ${n} order line${n === 1 ? '' : 's'} finalized, capacity confirmed and production lists generated.`);
      render(); break;
    }
    case 'ops-qc': { OPS.passQC(findLineAnywhere(t.dataset.line)); render(); break; }
    case 'ops-bakery-next': {
      const r = OPS.advanceBakery(findLineAnywhere(t.dataset.line), t.dataset.to);
      if (!r.ok) alert(r.reason); render(); break;
    }
    case 'ops-delivery-next': {
      const r = OPS.advanceDelivery(findLineAnywhere(t.dataset.line), t.dataset.to);
      if (!r.ok) alert(r.reason); render(); break;
    }
    case 'ops-deliver': {
      const day = findLineAnywhere(t.dataset.line);
      openModal(`<div class="micro">Proof of delivery</div>
        <h3 class="q" style="font-size:22px">Who received it?</h3>
        <p class="meta">Arrival is not delivery. Handover is delivery ${std('MB-DLV-001 §10')}.</p>
        <div class="stack" style="margin-top:var(--s3)">
          ${[['Customer', 'Handed to the customer'], ['Reception', 'Reception or concierge'], ['Authorised person', 'Another designated receiver']]
            .map(([r, d]) => `<button class="choice compact" data-act="do-pod" data-line="${esc(day.lineId)}" data-r="${r}">
              <span class="t">${r}</span><span class="d">${d}</span></button>`).join('')}
        </div>`);
      break;
    }
    case 'do-pod': {
      const day = findLineAnywhere(t.dataset.line);
      OPS.recordDelivery(day, { recipientType: t.dataset.r, point: t.dataset.r === 'Reception' ? 'Reception' : 'Door' });
      closeModal(); render(); break;
    }
    case 'ops-exception': {
      const day = findLineAnywhere(t.dataset.line);
      openModal(`<div class="micro">Raise an exception</div>
        <h3 class="q" style="font-size:22px">What went wrong?</h3>
        <p class="meta">Every exception gets an owner, an action and a resolution ${std('MB-OPS-001 §8')}.</p>
        <div class="stack" style="margin-top:var(--s3)">
          ${EXCEPTION_KINDS.map(k => `<button class="choice compact" data-act="do-exception" data-line="${esc(day.lineId)}" data-kind="${esc(k)}">
            <span class="t">${esc(k)}</span></button>`).join('')}
        </div>`);
      break;
    }
    case 'do-exception': {
      const day = findLineAnywhere(t.dataset.line);
      OPS.raiseException(day, { kind: t.dataset.kind, owner: 'Morning Box Operations', note: '' });
      closeModal(); render(); break;
    }
    case 'ops-resolve': {
      const day = findLineAnywhere(t.dataset.line);
      const ex = day.exceptions.find(x => x.id === t.dataset.ex);
      openModal(`<div class="micro">Resolve</div>
        <h3 class="q" style="font-size:22px">${esc(ex.kind)}</h3>
        <div class="stack" style="margin-top:var(--s3)">
          ${['Resolved — production continues', 'Reallocated to next eligible bakery', 'Refunded — could not fulfil']
            .map(o => `<button class="choice compact" data-act="do-resolve" data-line="${esc(day.lineId)}" data-ex="${esc(ex.id)}" data-out="${esc(o)}">
              <span class="t">${esc(o)}</span></button>`).join('')}
        </div>`);
      break;
    }
    case 'do-resolve': {
      const day = findLineAnywhere(t.dataset.line);
      const ex = day.exceptions.find(x => x.id === t.dataset.ex);
      OPS.resolveException(day, ex, { action: 'Operations handled', outcome: t.dataset.out });
      closeModal(); render(); break;
    }

    case 'close-modal': closeModal(); break;
    case 'reset': location.hash = '#/'; location.reload(); break;
  }
});

/* Tapping a compartment in the box opens that component. */
document.addEventListener('click', e => {
  const g = e.target.closest('.cmp');
  if (!g) return;
  const iso = (location.hash.split('/')[2]) || '';
  const d = S.days[iso];
  if (!d || !d.config) return;
  const idx = Number(g.dataset.cmp);
  const id = d.config.components[idx];
  const size = d.config.size === 'standard' ? 'regular' : d.config.size;
  const k = COMPONENTS[id];
  const build = resolveBuild(id, S.profile);
  openModal(`
    <div class="boxviz" style="padding:0;border:none;background:transparent;max-width:160px;margin:0 auto">
      <div class="thumb" style="width:140px;height:140px;margin:0 auto">${foodArt(id)}</div></div>
    <h3 class="q" style="font-size:22px;margin-top:var(--s3)">${esc(k.name)}</h3>
    <p class="meta">${esc(k.note || '')}</p>
    <table class="data" style="margin-top:var(--s3)">
      <tr><td>Your portion</td><td class="num">${esc(portion(id, size))}</td></tr>
      <tr><td>Category</td><td class="num">${esc(k.category)}</td></tr>
      <tr><td>Allergens</td><td class="num">${(build?.allergens || k.allergens).length
        ? (build?.allergens || k.allergens).map(x => esc(ALLERGENS.find(y => y.id === x).label)).join(', ') : 'None declared'}</td></tr>
      ${build?.variant ? `<tr><td>Prepared as</td><td class="num">${esc(build.variant.label)}</td></tr>` : ''}
    </table>
    <p class="meta" style="margin-top:var(--s3)">Every approved product carries a verified ingredient and
    allergen record. Nothing enters a recommendation, swap or extra without one ${std('MB-PRO-001 §15.1')}.</p>
    ${canSwap(id) && swapOptions(d.config, idx).length
      ? `<button class="btn btn-secondary btn-block" style="margin-top:var(--s3)" data-act="swap" data-iso="${iso}" data-idx="${idx}">Swap this</button>` : ''}
    <button class="btn btn-ghost btn-block" style="margin-top:var(--s2)" data-act="close-modal">Close</button>`);
});

/* ---------------- Order placement ---------------- */
function placePersonalOrder() {
  const days = savedDays();
  const emailEl = document.getElementById('rv-email');
  const order = OPS.createOrder({
    kind: 'personal',
    customer: { ...S.customer, email: emailEl ? emailEl.value.trim() : '' },
    delivery: { ...S.delivery },
    totals: { total: planTotal() },
    days: days.map(d => {
      const p = priceBox(d.config);
      return {
        date: d.date, context: d.context, value: p.total,
        summary: d.config.label,
        boxes: [{
          recipe: d.config.recipe, components: d.config.components, size: d.config.size,
          addons: d.config.addons, profile: S.profile, qty: 1
        }],
        trace: traceRecord(d.config, d.context),
        delivery: { ...S.delivery }
      };
    })
  });

  /* Provisional capacity is reserved when the customer confirms and pays;
     the allocation is finalized at cutoff (MB-OPS-001 §2). */
  for (const day of order.days) {
    const res = OPS.allocate({
      zone: day.delivery.zone, date: day.date, window: day.delivery.window,
      dietary: S.profile.dietary, allergies: S.profile.allergies, qty: 1
    });
    if (res.ok) {
      day.allocation = { bakeryId: res.bakery.id, km: res.km, provisional: true };
      OPS.reserveCapacity(res.bakery.id, day.date, day.delivery.window, 1);
    } else {
      day.exceptions.push({ id: 'EX-AUTO', kind: 'Capacity Issue', owner: 'Morning Box Operations',
        state: 'Open', raisedAt: Date.now(), safety: false });
    }
  }
  S.orders.push(order);
  S.opsDate = order.days[0].date;
  S.days = {}; S.dates = [];
  go('#/orders');
}

function placeBusinessOrder() {
  const b = S.business;
  const prices = priceBusinessDay(b.lines, b.specials);
  const perDay = prices.total;
  const order = OPS.createOrder({
    kind: 'business',
    customer: { firstName: b.contact || 'Business', mobile: b.mobile, company: b.company, email: b.email },
    delivery: { zone: b.zone, window: b.window, address: b.building },
    totals: { total: perDay * b.dates.length },
    days: b.dates.map(date => ({
      date, context: b.context, value: perDay,
      summary: `${b.people} boxes · ${b.lines.length} model${b.lines.length === 1 ? '' : 's'}${b.specials.length ? ` · ${b.specials.length} special` : ''}`,
      boxes: [
        ...b.lines.map(l => ({ recipe: l.model.recipe, components: l.model.recipe.components, size: l.size,
          addons: [], profile: { dietary: [], allergies: [] }, qty: l.qty })),
        ...b.specials.filter(s => s.resolved).map(s => ({ recipe: s.resolved.recipe, components: s.resolved.components,
          size: 'regular', addons: [], profile: s.profile, qty: s.qty, special: true }))
      ],
      delivery: { zone: b.zone, window: b.window, address: b.building }
    }))
  });

  /* A Special Breakfast with no safe match cannot be produced. It must never
     disappear quietly from the production plan — MB-OPS-001 §8 requires an
     owner, an action and a resolution for every exception. */
  const unmatched = b.specials.filter(s => !s.resolved);

  /* Single Bakery First, expanding only when capacity requires it. */
  for (const day of order.days) {
    if (unmatched.length) {
      const n = unmatched.reduce((t, s) => t + s.qty, 0);
      OPS.raiseException(day, {
        kind: 'Dietary/Allergy Issue',
        owner: 'Morning Box Operations',
        note: `${n} special breakfast${n === 1 ? '' : 'es'} have no approved safe match: ` +
              unmatched.map(s => [...s.dietary, ...s.allergies].join(' + ')).join('; ')
      });
    }
    const res = OPS.allocateBusiness({ zone: b.zone, date: day.date, window: b.window, qty: b.people, dietary: [], allergies: [] });
    if (res.ok) {
      day.allocation = { bakeryId: res.split[0].bakery.id, split: res.split, provisional: true };
      for (const s of res.split) OPS.reserveCapacity(s.bakery.id, day.date, b.window, s.qty);
    } else {
      day.exceptions.push({ id: 'EX-AUTO', kind: 'Capacity Issue', owner: 'Morning Box Operations',
        state: 'Open', raisedAt: Date.now(), safety: false });
    }
  }
  S.orders.push(order);
  S.opsDate = order.days[0].date;
  S.business = null;
  go('#/orders');
}

/* ---------------- Business mix rebalancing ---------------- */
function rebalanceMix() {
  const b = S.business;
  if (!b || b.mode !== 'mix') return;
  const general = b.people - b.specials.reduce((t, s) => t + s.qty, 0);
  b.lines = general > 0 ? morningBoxMix(general, b.context) : [];
}

/* ---------------- Lookups ---------------- */
const findDay = (orderId, lineId) =>
  S.orders.find(o => o.id === orderId)?.days.find(d => d.lineId === lineId);
const findLineAnywhere = lineId => {
  for (const o of S.orders) { const d = o.days.find(x => x.lineId === lineId); if (d) return d; }
  return null;
};

/* Keep typed numbers in sync without re-rendering under the cursor. */
document.addEventListener('input', e => {
  const id = e.target.id;
  if (id === 'b-people') { S.business.people = Math.max(1, Number(e.target.value) || 1); rebalanceMix(); }
  if (!S.business) return;
  const map = { 'b-company': 'company', 'b-building': 'building', 'b-contact': 'contact', 'b-mobile': 'mobile', 'b-email': 'email' };
  if (map[id]) S.business[map[id]] = e.target.value;
});

/* ---------------- Boot ---------------- */
document.getElementById('brand-mark').innerHTML = brandMark(40, false);
document.getElementById('brand-full').innerHTML = brandMark(72, true);
render();
