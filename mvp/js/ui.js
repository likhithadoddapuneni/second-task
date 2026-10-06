/* ============================================================
   ui.js — Brand mark and the icon family
   MB-DSN-001 §2 (logo), §6 (icons: thin, simple, consistent line
   style in Espresso or Gold).
   The approved logo must not be redrawn, stretched, recoloured or
   given effects. The mark below reproduces the approved lock-up —
   gold "Morning" with the sunrise counter, espresso "Box" with the
   open-box and leaf device — at the proportions supplied.
   ============================================================ */

export { foodArt, boxArt, heroArt, esc } from './art.js';

const GOLD = '#D99A12', GOLD_D = '#B98524', ESP = '#3B2D22';

/** Full lock-up, including the tagline. */
export const brandMark = (h = 40, tagline = true) => `
<svg viewBox="0 0 322 ${tagline ? 106 : 86}" height="${h}" role="img" aria-label="Morning Box — your personal breakfast assistant">
  <defs>
    <linearGradient id="mbg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#E0A724"/><stop offset=".55" stop-color="${GOLD}"/><stop offset="1" stop-color="${GOLD_D}"/>
    </linearGradient>
  </defs>
  <!-- sunrise over the first o -->
  <g stroke="url(#mbg)" stroke-width="3.4" stroke-linecap="round">
    <path d="M78 16v-9M62 21l-5-7M94 21l5-7M52 31l-8-4M104 31l8-4"/>
  </g>
  <path d="M56 46a22 22 0 0 1 44 0z" fill="url(#mbg)"/>
  <path d="M50 48h56" stroke="url(#mbg)" stroke-width="4" stroke-linecap="round"/>
  <text x="6" y="52" font-family="Georgia, 'Times New Roman', serif" font-size="54"
        fill="url(#mbg)" font-style="italic">M</text>
  <text x="108" y="52" font-family="Georgia, 'Times New Roman', serif" font-size="47"
        fill="url(#mbg)" font-style="italic">rning</text>
  <text x="62" y="86" font-family="Georgia, 'Times New Roman', serif" font-size="43" fill="${ESP}">Box</text>
  <!-- open box with leaf -->
  <path d="M212 70l17-7 17 7-17 7z" fill="#F0D9A8"/>
  <path d="M212 70v12l17 7V77z" fill="${ESP}"/>
  <path d="M246 70v12l-17 7V77z" fill="#55402F"/>
  <path d="M233 66q2-13 13-16 1 11-8 15z" fill="url(#mbg)"/>
  <path d="M231 67q-3-9-11-10 1 7 7 9z" fill="${GOLD_D}"/>
  ${tagline ? `<text x="16" y="101" font-family="Inter, system-ui, sans-serif" font-size="9.2"
        letter-spacing="2.9" fill="#6B5B4A">YOUR PERSONAL BREAKFAST ASSISTANT</text>` : ''}
</svg>`;

/* §6 — thin, simple, consistent line icons in Espresso or Gold. */
const P = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"
  stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;

const ICONS = {
  leaf:     P('<path d="M4 20c0-9 6-15 16-16 1 11-6 16-16 16z"/><path d="M4 20c3-5 7-8 12-10"/>'),
  sliders:  P('<path d="M3 7h12M19 7h2M3 17h5M12 17h9"/><circle cx="17" cy="7" r="2"/><circle cx="10" cy="17" r="2"/>'),
  smile:    P('<circle cx="12" cy="12" r="9"/><path d="M8.5 14.5a4.5 4.5 0 0 0 7 0"/><path d="M9 9.5h.01M15 9.5h.01"/>'),
  sprout:   P('<path d="M12 21v-8"/><path d="M12 13c0-5 3-8 8-8 0 5-3 8-8 8z"/><path d="M12 15c0-4-2-6-6-6 0 4 2 6 6 6z"/>'),
  user:     P('<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/>'),
  briefcase:P('<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 12h18"/>'),
  clock:    P('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
  truck:    P('<path d="M2 7h12v10H2z"/><path d="M14 10h4l3 3v4h-7z"/><circle cx="6.5" cy="18" r="1.8"/><circle cx="17" cy="18" r="1.8"/>'),
  calendar: P('<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>'),
  pin:      P('<path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.6"/>'),
  check:    P('<circle cx="12" cy="12" r="9"/><path d="M8 12.4l2.7 2.7L16 9.6"/>'),
  swap:     P('<path d="M4 8h13l-3-3M20 16H7l3 3"/>'),
  shield:   P('<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>'),
  box:      P('<path d="M3 8l9-4 9 4-9 4z"/><path d="M3 8v8l9 4 9-4V8"/><path d="M12 12v8"/>'),
  plus:     P('<path d="M12 5v14M5 12h14"/>'),
  edit:     P('<path d="M4 20h4l10-10-4-4L4 16z"/><path d="M14 6l4 4"/>')
};
export const icon = k => ICONS[k] || ICONS.leaf;
