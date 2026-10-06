/* ============================================================
   art.js — Food illustration system
   MB-DSN-001 §7 asks for premium natural-light breakfast photography.
   There is no photography in this build and none is faked: every
   component is DRAWN from its own approved record — product type,
   category and portion. Swapping a component changes the picture
   because the data changed.

   Visual direction (MB-DSN-001 §1): premium, minimal, warm, fresh,
   calm. Never a bright multi-colour marketplace.
   ============================================================ */

import { COMPONENTS, portion } from './library.js';

export const esc = s => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

let uid = 0;

/* ---------- Food palette, derived from the brand warm neutrals ---------- */
const P = {
  yolk: '#F2C14E', white: '#FDF9F0', shell: '#F6EBD7',
  crust: '#C68B3C', crumb: '#F2E3C6',
  crustDark: '#A06A2A', crumbDark: '#DCC49A',
  pastry: '#DCA54A', pastryDeep: '#C08B35', choc: '#5A3A24',
  avocado: '#7FA34E', avoFlesh: '#A8C36E', pit: '#8A6A45',
  tomato: '#C0442F', cucumber: '#9CC46F', greens: '#6E9153', olive: '#6F7F3E',
  dairy: '#FDFBF4', dairyEdge: '#E7DFCB', feta: '#F7F3E7',
  oats: '#E3D3B4', granola: '#C9924A',
  straw: '#B5343F', blue: '#4A5B8C', banana: '#E8C64A', bananaTip: '#8A7A3A',
  honey: '#D99A12', jam: '#A8333C', pb: '#B07638', butter: '#F0D27A',
  beans: '#C4772F', bacon: '#A8503C', sausage: '#B5673A',
  melon: '#E9A06A', kiwi: '#8FA85A',
  line: '#3B2D22', kraft: '#D7BE96', kraftDark: '#B99A6E', tray: '#FBF7EF'
};

/** Wrap a drawing in a sized SVG with a soft contact shadow. */
function scene(inner, { w = 120, h = 100, shadow = [60, 86, 38, 5], label = '' } = {}) {
  const id = 'g' + (++uid);
  const [cx, cy, rx, ry] = shadow;
  return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${esc(label)}">
  <defs><radialGradient id="s${id}"><stop offset="0" stop-color="#3B2D22" stop-opacity=".2"/>
    <stop offset="1" stop-color="#3B2D22" stop-opacity="0"/></radialGradient></defs>
  ${rx ? `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#s${id})"/>` : ''}
  ${inner}</svg>`;
}

/* ============================================================
   Component renderers — viewBox 0 0 120 100
   ============================================================ */
const R = {};

R.scrambledEggs = () => `
  <ellipse cx="60" cy="62" rx="36" ry="22" fill="${P.white}" stroke="${P.shell}"/>
  ${[[44, 54, 11], [62, 50, 13], [78, 58, 10], [52, 68, 10], [70, 68, 11]]
    .map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${P.yolk}" opacity=".92"/>`).join('')}
  <circle cx="58" cy="56" r="7" fill="#F8D578"/>`;

R.omelette = () => `
  <path d="M26 64c0-16 15-26 34-26s34 10 34 26c0 6-15 10-34 10s-34-4-34-10z" fill="${P.yolk}" stroke="${P.crustDark}" stroke-width="1"/>
  <path d="M34 58c8-6 18-8 26-8" stroke="#F8D98A" stroke-width="3" fill="none" stroke-linecap="round"/>`;

R.boiledEggs = () => `
  <ellipse cx="42" cy="60" rx="18" ry="22" fill="${P.white}" stroke="${P.shell}"/>
  <ellipse cx="42" cy="60" rx="9" ry="11" fill="${P.yolk}"/>
  <ellipse cx="78" cy="64" rx="17" ry="20" fill="${P.white}" stroke="${P.shell}"/>
  <ellipse cx="78" cy="64" rx="8" ry="10" fill="${P.yolk}"/>`;

R.beans = () => `
  <path d="M28 58h64v10a14 14 0 0 1-14 14H42a14 14 0 0 1-14-14z" fill="${P.beans}"/>
  <ellipse cx="60" cy="58" rx="32" ry="9" fill="#D4854035"/>
  ${[[46, 60], [60, 57], [74, 61], [53, 68], [68, 69]]
    .map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="6" ry="4" fill="#EAD7B4" stroke="#B9702A" stroke-width=".8"/>`).join('')}`;

const strips = c => `
  ${[0, 1, 2].map(i => `<path d="M24 ${50 + i * 11}q14 -7 28 0t28 0q10 -4 16 -1v8q-8 2-16 1t-28 0q-14 7-28 0z"
     fill="${c}" opacity="${1 - i * 0.12}"/>`).join('')}`;
R.chickenSausage = () => `
  ${[0, 1].map(i => `<rect x="${26 + i * 4}" y="${48 + i * 16}" width="68" height="15" rx="7.5"
     fill="${P.sausage}" stroke="#90512B" stroke-width="1"/>`).join('')}`;
R.beefBacon = () => strips(P.bacon);
R.turkeyBacon = () => strips('#B96A50');

const slice = (crust, crumb, seeds = 0, holes = 0) => `
  <path d="M30 42c0-8 12-14 30-14s30 6 30 14v26a10 10 0 0 1-10 10H40a10 10 0 0 1-10-10z"
        fill="${crust}"/>
  <path d="M36 44c0-6 10-10 24-10s24 4 24 10v22a6 6 0 0 1-6 6H42a6 6 0 0 1-6-6z" fill="${crumb}"/>
  ${Array.from({ length: seeds }, (_, i) =>
    `<ellipse cx="${40 + (i * 13) % 42}" cy="${38 + (i * 7) % 8}" rx="2.4" ry="1.5" fill="#8A6A3A" transform="rotate(${i * 37} ${40 + (i * 13) % 42} ${38 + (i * 7) % 8})"/>`).join('')}
  ${Array.from({ length: holes }, (_, i) =>
    `<circle cx="${44 + (i * 11) % 34}" cy="${50 + (i * 9) % 18}" r="${2 + i % 2}" fill="${crust}" opacity=".3"/>`).join('')}`;

R.whiteSourdough = () => slice('#D9AE6E', '#F6EAD2', 0, 4);
R.wholeWheatSourdough = () => slice('#A8732F', '#DEC396', 0, 3);
R.multigrain = () => slice('#9C6A2C', '#D8BC8E', 6, 2);
R.ciabatta = () => slice('#E0BC84', '#F8EFDC', 0, 6);
R.focaccia = () => `
  <rect x="26" y="44" width="68" height="34" rx="8" fill="#E2B872"/>
  <rect x="30" y="47" width="60" height="28" rx="6" fill="#F0D6A0"/>
  ${[[42, 56], [60, 52], [78, 58], [50, 68], [70, 66]]
    .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="#CFA259"/>`).join('')}
  <ellipse cx="66" cy="60" rx="4" ry="3" fill="${P.olive}"/>`;

R.plainCroissant = () => `
  <path d="M22 70q6-22 26-24 14-2 18 8t14 8q10-2 16 8-10 10-24 8t-20-8q-8-6-18-4T22 70z" fill="${P.pastry}" stroke="${P.pastryDeep}"/>
  <path d="M44 56q6 6 14 8M58 50q4 8 12 10" stroke="${P.pastryDeep}" stroke-width="1.4" fill="none"/>`;
R.cheeseCroissant = () => `
  ${R.plainCroissant()}
  <path d="M50 52q8-4 16 0" stroke="#E8C56A" stroke-width="3" fill="none" stroke-linecap="round"/>`;
R.painAuChocolat = () => `
  <rect x="28" y="48" width="64" height="30" rx="7" fill="${P.pastry}" stroke="${P.pastryDeep}"/>
  <path d="M40 48v30M80 48v30" stroke="${P.pastryDeep}" stroke-width="1.4"/>
  <rect x="44" y="56" width="32" height="6" rx="3" fill="${P.choc}" opacity=".75"/>`;
R.fruitDanish = () => `
  <circle cx="60" cy="62" r="25" fill="${P.pastry}" stroke="${P.pastryDeep}"/>
  <circle cx="60" cy="62" r="14" fill="#F3E0BA"/>
  <circle cx="60" cy="62" r="9" fill="${P.jam}" opacity=".85"/>`;

R.avocado = () => `
  <ellipse cx="46" cy="60" rx="17" ry="23" fill="${P.avocado}"/>
  <ellipse cx="46" cy="60" rx="12" ry="18" fill="${P.avoFlesh}"/>
  <ellipse cx="46" cy="60" rx="6" ry="7" fill="${P.pit}"/>
  <ellipse cx="80" cy="64" rx="15" ry="20" fill="${P.avocado}"/>
  <ellipse cx="80" cy="64" rx="10" ry="15" fill="${P.avoFlesh}"/>`;

R.tomato = () => `
  <circle cx="48" cy="62" r="19" fill="${P.tomato}"/>
  <circle cx="48" cy="62" r="13" fill="#D96A52"/>
  <path d="M48 49v26M35 62h26" stroke="#E9A08C" stroke-width="2"/>
  <circle cx="82" cy="66" r="15" fill="${P.tomato}"/>
  <path d="M78 52q4-5 8-1" stroke="${P.greens}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
R.cucumber = () => `
  ${[[42, 60, 16], [64, 56, 15], [82, 66, 14]].map(([x, y, r]) =>
    `<circle cx="${x}" cy="${y}" r="${r}" fill="${P.cucumber}"/><circle cx="${x}" cy="${y}" r="${r - 4}" fill="#D8E9C0"/>`).join('')}`;
R.mixedGreens = () => `
  ${[[42, 64, -25], [58, 56, 10], [74, 64, 30], [60, 70, -5]].map(([x, y, rot]) =>
    `<ellipse cx="${x}" cy="${y}" rx="17" ry="9" fill="${P.greens}" opacity=".9" transform="rotate(${rot} ${x} ${y})"/>`).join('')}
  <path d="M44 64q14-8 32 0" stroke="#86A96A" stroke-width="2" fill="none"/>`;
R.olives = () => `
  ${[[46, 58], [64, 54], [58, 70], [76, 64]].map(([x, y]) =>
    `<ellipse cx="${x}" cy="${y}" rx="9" ry="11" fill="${P.olive}"/><ellipse cx="${x}" cy="${y}" rx="3" ry="4" fill="#CBB97A"/>`).join('')}`;

R.seasonalFruit = () => `
  <path d="M26 58h68v6a18 18 0 0 1-18 18H44a18 18 0 0 1-18-18z" fill="${P.dairy}" stroke="${P.dairyEdge}"/>
  <path d="M34 54l10-10 10 10zM56 54l10-12 10 12z" fill="${P.melon}"/>
  <circle cx="44" cy="62" r="8" fill="#E9B45E"/><circle cx="62" cy="60" r="9" fill="${P.kiwi}"/>
  <circle cx="78" cy="64" r="7" fill="#D4604F"/><circle cx="54" cy="70" r="6" fill="#8E6FA8"/>`;
R.berries = () => `
  ${[[44, 62, 10, P.straw], [64, 56, 8, P.blue], [78, 66, 9, P.straw], [58, 72, 7, P.blue]]
    .map(([x, y, r, c]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>`).join('')}
  <path d="M44 52q4-6 8-2" stroke="${P.greens}" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
R.banana = () => `
  <path d="M30 46q6 34 40 34 18 0 24-10-10 2-22-2-20-7-26-24z" fill="${P.banana}" stroke="#C9A62F"/>
  <path d="M30 46q2 6 4 9" stroke="${P.bananaTip}" stroke-width="4" stroke-linecap="round"/>`;

const pot = (fill, lid) => `
  <path d="M34 48h52l-5 30a8 8 0 0 1-8 7H47a8 8 0 0 1-8-7z" fill="${P.dairy}" stroke="${P.dairyEdge}"/>
  <ellipse cx="60" cy="48" rx="26" ry="7" fill="${fill}" stroke="${P.dairyEdge}"/>
  ${lid || ''}`;
R.greekYogurt = () => pot('#FFFFFF', `<ellipse cx="60" cy="47" rx="18" ry="4.5" fill="#F4F0E4"/>`);
R.labneh = () => pot('#FBF7EB', `<circle cx="60" cy="47" r="7" fill="#EFE7D2"/>`);
R.feta = () => `
  ${[[46, 60], [64, 54], [60, 72], [78, 64]].map(([x, y]) =>
    `<rect x="${x - 9}" y="${y - 8}" width="18" height="16" rx="2" fill="${P.feta}" stroke="#E3DBC6"/>`).join('')}`;

R.overnightOats = () => `
  <path d="M38 38h44v42a8 8 0 0 1-8 8H46a8 8 0 0 1-8-8z" fill="#FFFFFF" opacity=".5" stroke="#DCD0B8" stroke-width="1.4"/>
  <path d="M40 50h40v30a7 7 0 0 1-7 7H47a7 7 0 0 1-7-7z" fill="${P.oats}"/>
  ${[[48, 58], [60, 54], [72, 59], [54, 68], [68, 70], [60, 78]].map(([x, y]) =>
    `<ellipse cx="${x}" cy="${y}" rx="4.5" ry="3" fill="#D2BD93" transform="rotate(${x * 3} ${x} ${y})"/>`).join('')}
  <ellipse cx="60" cy="50" rx="20" ry="5" fill="#F2E7CF"/>
  <circle cx="52" cy="46" r="4.5" fill="${P.straw}"/><circle cx="66" cy="45" r="4" fill="${P.blue}"/>
  <ellipse cx="60" cy="38" rx="22" ry="6" fill="#FFFFFF" stroke="#DCD0B8" stroke-width="1.4"/>`;
const grain = (c, c2) => `
  <path d="M28 56h64l-7 22a9 9 0 0 1-9 7H44a9 9 0 0 1-9-7z" fill="#FCF8EE" stroke="#DCD0B8" stroke-width="1.4"/>
  <path d="M33 62h54l-5 16a7 7 0 0 1-7 5H45a7 7 0 0 1-7-5z" fill="${c}" opacity=".9"/>
  ${[[44, 66, 6], [58, 63, 7], [72, 67, 6], [50, 76, 6], [66, 77, 7], [59, 71, 5]].map(([x, y, r]) =>
    `<circle cx="${x}" cy="${y}" r="${r}" fill="${c2}" stroke="#9E7436" stroke-width=".7"/>`).join('')}`;
R.granola = () => grain('#B9833F', '#D6A157');
R.muesli = () => grain('#C7A777', '#E0C79A');

const jar = (fill, cap = '#8A6A45') => `
  <rect x="42" y="42" width="36" height="12" rx="3" fill="${cap}"/>
  <path d="M40 54h40v24a9 9 0 0 1-9 9H49a9 9 0 0 1-9-9z" fill="${fill}" stroke="#00000012"/>
  <rect x="46" y="62" width="28" height="12" rx="2" fill="#FFFFFF" opacity=".35"/>`;
R.honey = () => jar(P.honey, '#B98524');
R.jam = () => jar(P.jam);
R.peanutButter = () => jar(P.pb);
R.butter = () => `
  <path d="M34 56h52l-6 24H40z" fill="${P.butter}" stroke="#D9B957"/>
  <path d="M34 56l8-10h52l-8 10z" fill="#F7E3A4"/>
  <path d="M86 56l8-10v24l-8 10z" fill="#E6CA7E"/>`;
R.creamCheese = () => `
  <path d="M34 54h52v22a9 9 0 0 1-9 9H43a9 9 0 0 1-9-9z" fill="#FCF8EE" stroke="#D9CDB4" stroke-width="1.4"/>
  <path d="M34 54l7-11h52l-7 11z" fill="#FFFFFF" stroke="#D9CDB4" stroke-width="1.4"/>
  <path d="M86 54l7-11v22l-7 11z" fill="#F0E7D4" stroke="#D9CDB4" stroke-width="1.4"/>
  <path d="M48 64h24" stroke="#E4D9C2" stroke-width="2.5" stroke-linecap="round"/>`;

/** Drawn image for one approved component. */
export function foodArt(componentId) {
  const k = COMPONENTS[componentId];
  const draw = R[componentId];
  return scene(draw ? draw() : `<circle cx="60" cy="60" r="24" fill="${P.kraft}"/>`,
    { label: k ? k.name : componentId });
}

/* ============================================================
   The Morning Box — the signature visual.
   An open box seen from above, with one compartment per approved
   component, drawn to the configured size. Every compartment is a
   hotspot that resolves back to its component record.
   ============================================================ */
export function boxArt(config, { interactive = true } = {}) {
  const comps = config.components;
  const n = comps.length;
  const cols = n <= 4 ? 2 : 3;
  const rows = Math.ceil(n / cols);
  const W = 420, PAD = 26, GAP = 10;
  const cellW = (W - PAD * 2 - GAP * (cols - 1)) / cols;
  const cellH = Math.min(118, Math.max(84, cellW * 0.82));
  const H = PAD * 2 + rows * cellH + GAP * (rows - 1);
  const size = config.size === 'standard' ? 'regular' : config.size;

  const cells = comps.map((id, i) => {
    const r = Math.floor(i / cols), c = i % cols;
    const x = PAD + c * (cellW + GAP), y = PAD + r * (cellH + GAP);
    const k = COMPONENTS[id];
    return `
    <g class="${interactive ? 'cmp' : ''}" data-cmp="${i}" ${interactive ? 'tabindex="0" role="button"' : ''}
       aria-label="${esc(k.name)}, ${esc(portion(id, size))}">
      <title>${esc(k.name)} · ${esc(portion(id, size))}</title>
      <rect x="${x}" y="${y}" width="${cellW}" height="${cellH}" rx="9"
            fill="#FFFDF8" stroke="#E9D8BD" stroke-width="1.2"/>
      <svg x="${x + 3}" y="${y + 3}" width="${cellW - 6}" height="${cellH - 24}" viewBox="20 32 80 60">
        ${(R[id] || (() => `<circle cx="60" cy="60" r="22" fill="${P.kraft}"/>`))()}
      </svg>
      <text x="${x + cellW / 2}" y="${y + cellH - 7}" text-anchor="middle"
            font-size="9.5" font-family="Inter, system-ui" fill="#6B5B4A">${esc(portion(id, size))}</text>
    </g>`;
  }).join('');

  return `
<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" role="img"
     aria-label="Your Morning Box, ${n} items">
  <defs>
    <linearGradient id="kraft" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#E2CCA4"/><stop offset="1" stop-color="#D0B386"/></linearGradient>
  </defs>
  <rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="16" fill="url(#kraft)"/>
  <rect x="12" y="12" width="${W - 24}" height="${H - 24}" rx="11" fill="${P.tray}" stroke="#E3D2B4"/>
  <path d="M12 ${H - 24}h${W - 24}" stroke="#E9D8BD" stroke-width="1"/>
  ${cells}
</svg>`;
}

/* ---------- Hero illustration for the landing page ---------- */
export function heroArt() {
  const ids = ['plainCroissant', 'greekYogurt', 'berries',
               'wholeWheatSourdough', 'honey', 'banana'];
  /* Box geometry, computed so the compartments always sit inside the tray. */
  const BX = 104, BY = 136, BW = 320, BH = 184;        // outer box
  const TP = 13;                                        // tray inset
  const tx = BX + TP, ty = BY + TP, tw = BW - TP * 2, th = BH - TP * 2;
  const PADC = 11, GAP = 9, COLS = 3, ROWS = 2;
  const cw = (tw - PADC * 2 - GAP * (COLS - 1)) / COLS;
  const ch = (th - PADC * 2 - GAP * (ROWS - 1)) / ROWS;

  const cells = ids.map((id, i) => {
    const r = Math.floor(i / COLS), c = i % COLS;
    const x = tx + PADC + c * (cw + GAP), y = ty + PADC + r * (ch + GAP);
    return `<g>
      <rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${cw.toFixed(1)}" height="${ch.toFixed(1)}"
            rx="9" fill="#FFFDF8" stroke="#EADCC1"/>
      <svg x="${(x + 3).toFixed(1)}" y="${(y + 3).toFixed(1)}" width="${(cw - 6).toFixed(1)}"
           height="${(ch - 6).toFixed(1)}" viewBox="20 32 80 60">${(R[id] || (() => ''))()}</svg>
    </g>`;
  }).join('');

  return `
<svg viewBox="0 0 560 380" role="img" aria-label="An open Morning Box on a sunlit table">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#FFF6E2"/><stop offset="1" stop-color="#FBF7EF"/></linearGradient>
    <radialGradient id="sun" cx=".84" cy=".12" r=".46">
      <stop offset="0" stop-color="#FBE3AE" stop-opacity=".95"/>
      <stop offset="1" stop-color="#FBE3AE" stop-opacity="0"/></radialGradient>
    <linearGradient id="kr2" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#E6D2AC"/><stop offset="1" stop-color="#CBAC7C"/></linearGradient>
  </defs>
  <rect width="560" height="380" fill="url(#sky)"/>
  <rect width="560" height="380" fill="url(#sun)"/>
  <circle cx="474" cy="54" r="26" fill="#F6D98E" opacity=".55"/>
  <rect y="316" width="560" height="64" fill="#F2E8D6"/>
  <path d="M0 316h560" stroke="#E6D8BE" stroke-width="2"/>

  <!-- open lid, hinged behind the box -->
  <path d="M92 104l212-30 176 28-212 28z" fill="#EBDCC2" stroke="#D8C39E"/>
  <text x="298" y="84" text-anchor="middle" font-family="Georgia, serif" font-size="12.5"
        fill="#B98524" letter-spacing="3.4">GOOD FOOD, BRIGHTER DAYS</text>

  <rect x="${BX}" y="${BY}" width="${BW}" height="${BH}" rx="16" fill="url(#kr2)"/>
  <rect x="${tx}" y="${ty}" width="${tw}" height="${th}" rx="11" fill="#FBF7EF"/>
  ${cells}

  <!-- olive sprig in a vase, as in the approved homepage direction -->
  <path d="M482 316q-16-48 4-84" stroke="#7F9472" stroke-width="3" fill="none" stroke-linecap="round"/>
  ${[[478, 276, -40], [486, 254, 35], [476, 234, -30], [492, 228, 40], [482, 208, -25]].map(([x, y, rot]) =>
    `<ellipse cx="${x}" cy="${y}" rx="12" ry="6" fill="#7F9472" transform="rotate(${rot} ${x} ${y})"/>`).join('')}
  <path d="M466 280h32l-5 36h-22z" fill="#EFE6D2" stroke="#E0D3B8"/>
  <ellipse cx="482" cy="280" rx="16" ry="4.5" fill="#F7F1E3" stroke="#E0D3B8"/>
</svg>`;
}
