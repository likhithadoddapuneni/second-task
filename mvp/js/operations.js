/* ============================================================
   operations.js — Partners, allocation, orders, fulfilment
   Implements:
     MB-BKY-001  Partner Bakery Standard
     MB-DLV-001  Delivery & Fulfilment (cutoff, windows, POD, refunds)
     MB-OPS-001  Operations (allocation, production lists, exceptions,
                 reconciliation)
     MB-B2B-001  Business allocation (Single Bakery First)

   Operating principle: automate the normal, surface the exception.
   ============================================================ */

import { CUSTOMER_STATUS, BAKERY_STATES, DELIVERY_STATES, DELIVERY_WINDOWS,
         isBeforeCutoff, cutoffFor, isoDate } from './standards.js';
import { COMPONENTS, packingNote } from './library.js';

/* ---------- Delivery zones (MVP launch geography: DIFC first) ---------- */
export const ZONES = [
  { id: 'difc-gate',   label: 'DIFC — Gate District',       live: true },
  { id: 'difc-index',  label: 'DIFC — Index / Central Park', live: true },
  { id: 'difc-ritz',   label: 'DIFC — Ritz / Burj Daman',    live: true },
  { id: 'downtown',    label: 'Downtown Dubai',              live: false },
  { id: 'meydan',      label: 'Meydan One',                  live: false }
];

/* ---------- Partner bakeries (MB-BKY-001) ----------
   Every partner must bake its own bread in-house. A bakery is eligible for
   an order only when it can produce the required product, meet the relevant
   dietary/allergy handling requirements, support the window and capacity,
   and comply with Morning Box product standards (MB-BOX-001 §10). */
export const BAKERIES = [
  { id: 'BK-001', name: 'Gate Avenue Bakehouse', area: 'DIFC — Gate Avenue',
    inHouseBread: true, glutenFreeHandling: false, nutFreeLine: true,
    distance: { 'difc-gate': 0.3, 'difc-index': 0.9, 'difc-ritz': 1.1, downtown: 3.2, meydan: 7.4 },
    capacity: { w1: 45, w2: 55, w3: 40 }, status: 'Active' },
  { id: 'BK-002', name: 'Index Tower Patisserie', area: 'DIFC — Index Tower',
    inHouseBread: true, glutenFreeHandling: false, nutFreeLine: false,
    distance: { 'difc-gate': 0.8, 'difc-index': 0.2, 'difc-ritz': 0.7, downtown: 3.6, meydan: 7.9 },
    capacity: { w1: 30, w2: 40, w3: 30 }, status: 'Active' },
  { id: 'BK-003', name: 'Emirates Daily Bread', area: 'DIFC — Burj Daman',
    inHouseBread: true, glutenFreeHandling: true, nutFreeLine: true,
    distance: { 'difc-gate': 1.0, 'difc-index': 0.8, 'difc-ritz': 0.3, downtown: 2.8, meydan: 6.9 },
    capacity: { w1: 35, w2: 45, w3: 35 }, status: 'Active' },
  { id: 'BK-004', name: 'Boulevard Bakery', area: 'Downtown Dubai',
    inHouseBread: true, glutenFreeHandling: false, nutFreeLine: true,
    distance: { 'difc-gate': 3.1, 'difc-index': 3.5, 'difc-ritz': 2.7, downtown: 0.4, meydan: 5.2 },
    capacity: { w1: 25, w2: 35, w3: 25 }, status: 'Active' }
];
export const bakeryById = Object.fromEntries(BAKERIES.map(b => [b.id, b]));

/* Live capacity consumed, keyed `${bakeryId}|${date}|${window}` */
const used = new Map();
const key = (b, d, w) => `${b}|${d}|${w}`;
export const capacityLeft = (b, d, w) =>
  bakeryById[b].capacity[w] - (used.get(key(b, d, w)) || 0);
export const reserveCapacity = (b, d, w, n = 1) =>
  used.set(key(b, d, w), (used.get(key(b, d, w)) || 0) + n);
export const releaseCapacity = (b, d, w, n = 1) =>
  used.set(key(b, d, w), Math.max(0, (used.get(key(b, d, w)) || 0) - n));
export const resetCapacity = () => used.clear();

/**
 * MB-OPS-001 §2 / MB-DLV-001 §7 — bakery eligibility is filtered through
 * Product Capability → Dietary/Allergy Capability → Capacity → Delivery
 * Window, and only then does the locked proximity-first rule apply.
 */
export function eligibleBakeries({ zone, date, window: win, dietary = [], allergies = [], qty = 1 }) {
  return BAKERIES
    .map(b => {
      const reasons = [];
      if (b.status !== 'Active') reasons.push('Partner not active');
      if (!b.inHouseBread) reasons.push('No in-house bread production');
      /* "Merely offering a product with a relevant label is not sufficient."
         A sensitive requirement needs a specifically eligible handling
         standard (MB-BOX-001 §9). */
      if (dietary.includes('glutenFree') && !b.glutenFreeHandling)
        reasons.push('Not approved for gluten-free handling');
      if ((allergies.includes('peanut') || allergies.includes('treenut')) && !b.nutFreeLine)
        reasons.push('No approved nut-free preparation line');
      const left = capacityLeft(b.id, date, win);
      if (left < qty) reasons.push(`Capacity exhausted for this window (${left} left)`);
      return { bakery: b, eligible: reasons.length === 0, reasons, km: b.distance[zone] ?? 99, capacityLeft: left };
    })
    .sort((a, b) => a.km - b.km);                    /* proximity first */
}

/** The locked MVP allocation rule: nearest eligible partner bakery. */
export function allocate(req) {
  const ranked = eligibleBakeries(req);
  const chosen = ranked.find(r => r.eligible);
  return chosen
    ? { ok: true, bakery: chosen.bakery, km: chosen.km, considered: ranked }
    : { ok: false, reason: 'No eligible partner bakery for this window.', considered: ranked };
}

/**
 * MB-B2B-001 §9 — Single Bakery First, expanding to the next nearest
 * eligible partner only when capacity requires it. Any split stays a
 * backend operation: the customer keeps one order and one payment.
 */
export function allocateBusiness(req) {
  const ranked = eligibleBakeries({ ...req, qty: 1 }).filter(r =>
    r.eligible || r.reasons.every(x => x.startsWith('Capacity')));
  let remaining = req.qty, split = [];
  for (const r of ranked) {
    if (remaining <= 0) break;
    const blocking = r.reasons.filter(x => !x.startsWith('Capacity'));
    if (blocking.length) continue;
    const take = Math.min(remaining, r.capacityLeft);
    if (take > 0) { split.push({ bakery: r.bakery, qty: take, km: r.km }); remaining -= take; }
  }
  return remaining > 0
    ? { ok: false, reason: `Capacity short by ${remaining} boxes for this window.`, split, considered: ranked }
    : { ok: true, split, singleBakery: split.length === 1, considered: ranked };
}

/* ============================================================
   Orders
   ============================================================ */
let seq = { order: 0, exception: 0 };
const pad = (p, n) => `${p}-${String(n).padStart(5, '0')}`;

/**
 * One order can cover several mornings. Each morning is an independent day
 * record: its own context, box, delivery and cutoff (MB-PER-001 §3).
 */
export function createOrder({ kind, customer, days, delivery, totals }) {
  const id = pad(kind === 'business' ? 'MBB' : 'MB', ++seq.order);
  return {
    id, kind, customer, placedAt: Date.now(), totals,
    days: days.map((d, i) => ({
      ...d,
      lineId: `${id}-D${i + 1}`,
      delivery: d.delivery || delivery,
      customerStatus: 'Order Confirmed',
      bakeryStatus: 'Assigned',
      deliveryStatus: null,
      pod: null,
      exceptions: [],
      feedback: null,
      refunded: false
    }))
  };
}

/* ---------- Customer-visible actions, bounded by the 9:00 PM cutoff ---------- */
export function canEditDay(day, now = new Date()) {
  return !day.refunded && day.customerStatus === 'Order Confirmed' && isBeforeCutoff(day.date, now);
}

/** MB-DLV-001 §11 — cancellation before cutoff receives a full refund for
 *  that breakfast. Cancelling one date does not cancel the others. */
export function cancelDay(day, now = new Date()) {
  if (!canEditDay(day, now))
    return { ok: false, reason: `The 9:00 PM cutoff for ${day.date} has passed, so this morning is already in production.` };
  day.customerStatus = 'Cancelled';
  day.refunded = true;
  day.refundReason = 'Customer cancellation before cutoff — full refund';
  if (day.allocation) releaseCapacity(day.allocation.bakeryId, day.date, day.delivery.window);
  return { ok: true };
}

/* ---------- MB-OPS-001 §1–2 — the nightly cycle ---------- */

/** At 9:00 PM, provisional allocation becomes final allocation. */
export function runCutoff(orders, date) {
  const affected = [];
  for (const o of orders) for (const d of o.days) {
    if (d.date !== date || d.customerStatus !== 'Order Confirmed') continue;
    d.finalAllocation = true;
    d.customerStatus = 'Being Prepared';
    d.bakeryStatus = 'Assigned';
    affected.push({ order: o, day: d });
  }
  return affected;
}

/**
 * MB-OPS-001 §3 — two operational views from one dataset.
 * The Production View aggregates what the kitchen must make. The Packing
 * View says exactly what belongs in each box. Allergy and Special Breakfast
 * requirements must be identifiable in both.
 */
export function productionPlan(orders, date, bakeryId) {
  const lines = [];
  for (const o of orders) for (const d of o.days) {
    if (d.date !== date || d.customerStatus === 'Cancelled') continue;
    if (d.allocation?.bakeryId !== bakeryId) continue;
    lines.push({ order: o, day: d });
  }

  /* Production view — aggregate by component and portion. */
  const agg = new Map();
  for (const { day } of lines) {
    for (const box of day.boxes) {
      for (let i = 0; i < box.components.length; i++) {
        const id = box.components[i];
        const size = box.size === 'standard' ? 'regular' : box.size;
        const k = `${id}|${size}`;
        const cur = agg.get(k) || { component: COMPONENTS[id], size, qty: 0, packing: packingNote(id) };
        cur.qty += box.qty || 1;
        agg.set(k, cur);
      }
    }
  }

  /* Packing view — one row per box, with every flag the kitchen needs. */
  const packing = lines.flatMap(({ order, day }) =>
    day.boxes.map((box, i) => ({
      boxId: `${day.lineId}-B${i + 1}`,
      orderId: order.id,
      special: !!box.special,
      allergies: box.profile?.allergies || [],
      dietary: box.profile?.dietary || [],
      size: box.size,
      qty: box.qty || 1,
      components: box.components.map(id => ({ id, name: COMPONENTS[id].name })),
      addons: box.addons || [],
      format: box.recipe?.format || null,
      readyBy: readyByFor(day.delivery.window)
    })));

  return {
    date, bakery: bakeryById[bakeryId],
    totalBoxes: packing.reduce((t, p) => t + p.qty, 0),
    earliestReadyBy: packing.length ? packing.map(p => p.readyBy).sort()[0] : null,
    production: [...agg.values()].sort((a, b) => a.component.category.localeCompare(b.component.category)),
    packing
  };
}

/** MB-DLV-001 §4 — a Ready By time derived from the delivery window. */
export function readyByFor(windowId) {
  return { w1: '06:45', w2: '07:45', w3: '08:45' }[windowId] || '07:00';
}

/* ---------- MB-OPS-001 §5 — bakery production states ---------- */
export function advanceBakery(day, to) {
  const from = BAKERY_STATES.indexOf(day.bakeryStatus);
  const target = BAKERY_STATES.indexOf(to);
  if (target !== from + 1) return { ok: false, reason: `Invalid transition ${day.bakeryStatus} → ${to}` };
  if (day.exceptions.some(e => e.state === 'Open'))
    return { ok: false, reason: 'An open exception must be resolved before this order can progress.' };
  /* §5 — an order is marked Ready only when it is prepared, quality checked,
     packed and labelled for courier handover. */
  if (to === 'Ready' && !day.qcPassed)
    return { ok: false, reason: 'Final product QC must be completed before Ready.' };
  day.bakeryStatus = to;
  if (to === 'Handed Over') { day.deliveryStatus = 'Picked Up'; day.customerStatus = 'Being Prepared'; }
  return { ok: true };
}

export function passQC(day) { day.qcPassed = true; return { ok: true }; }

/* ---------- MB-OPS-001 §6–7, MB-DLV-001 §10 — delivery and POD ---------- */
export function advanceDelivery(day, to) {
  const from = DELIVERY_STATES.indexOf(day.deliveryStatus);
  const target = DELIVERY_STATES.indexOf(to);
  if (target !== from + 1) return { ok: false, reason: `Invalid transition ${day.deliveryStatus} → ${to}` };
  day.deliveryStatus = to;
  if (to === 'Out for Delivery') day.customerStatus = 'Out for Delivery';
  return { ok: true };
}

/** "Arrival is not delivery. Handover is delivery." */
export function recordDelivery(day, { recipientType, point }) {
  if (day.deliveryStatus !== 'Out for Delivery')
    return { ok: false, reason: 'The order is not out for delivery yet.' };
  const at = new Date();
  day.deliveryStatus = 'Delivered';
  day.customerStatus = 'Delivered';
  day.pod = {
    time: at.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    point, recipientType
  };
  return { ok: true };
}

/* ---------- MB-OPS-001 §8 — exception management ----------
   Every exception must have an Owner, an Action and a Resolution.
   Reporting a problem without operational ownership is insufficient. */
export function raiseException(day, { kind, owner, note }) {
  const e = {
    id: pad('EX', ++seq.exception), kind, owner, note,
    state: 'Open', raisedAt: Date.now(),
    safety: /allergy|dietary/i.test(kind)
  };
  day.exceptions.push(e);
  return e;
}

export function resolveException(day, e, { action, outcome }) {
  e.state = 'Resolved';
  e.action = action;
  e.outcome = outcome;
  /* MB-DLV-001 §11 — if Morning Box cannot fulfil a paid breakfast, the
     affected breakfast receives a full refund. */
  if (outcome === 'Refunded — could not fulfil') {
    day.refunded = true;
    day.customerStatus = 'Refunded';
    day.refundReason = 'Morning Box could not fulfil this breakfast — full refund';
  }
  if (outcome === 'Reallocated to next eligible bakery' && day.reallocateTo) {
    day.allocation = day.reallocateTo;
    day.bakeryStatus = 'Assigned';
  }
  return e;
}

/* ---------- MB-OPS-001 §9 — daily reconciliation ---------- */
export function reconcile(orders, date) {
  const rows = [];
  for (const o of orders) for (const d of o.days) {
    if (d.date !== date) continue;
    const delivered = d.deliveryStatus === 'Delivered' && !!d.pod;
    const matched = delivered && d.bakeryStatus === 'Handed Over';
    rows.push({
      orderId: o.id, lineId: d.lineId,
      bakery: d.allocation ? bakeryById[d.allocation.bakeryId].name : '—',
      customerStatus: d.customerStatus,
      state: d.refunded ? 'Refunded' : matched ? 'Auto-reconciled' : delivered ? 'Review' : 'In progress',
      exceptions: d.exceptions.length,
      value: d.value || 0
    });
  }
  return {
    rows,
    delivered: rows.filter(r => r.state === 'Auto-reconciled').length,
    refunded: rows.filter(r => r.state === 'Refunded').length,
    exceptions: rows.reduce((t, r) => t + r.exceptions, 0),
    revenue: rows.filter(r => r.state !== 'Refunded').reduce((t, r) => t + r.value, 0)
  };
}

export { CUSTOMER_STATUS, BAKERY_STATES, DELIVERY_STATES, DELIVERY_WINDOWS };
