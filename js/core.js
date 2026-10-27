/* Tiny Tailors — drawing helpers, palettes and fabric patterns.
   Everything is drawn as SVG strings so every outfit fits every critter. */
window.TT = window.TT || {};
(function (TT) {
  const OL = '#5b3f58';          // soft plum outline used on everything
  const INK = '#3a2640';         // eyes / darkest details
  TT.OL = OL; TT.INK = INK;

  /* ---------- colour maths ---------- */
  function hex2rgb(h) {
    h = h.replace('#', '');
    if (h.length === 3) h = h.split('').map(c => c + c).join('');
    return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16));
  }
  function rgb2hex(r) {
    return '#' + r.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
  }
  function mix(a, b, t) {
    const A = hex2rgb(a), B = hex2rgb(b);
    return rgb2hex(A.map((v, i) => v + (B[i] - v) * t));
  }
  const shade = (c, t) => mix(c, '#3a2440', t);
  const tint = (c, t) => mix(c, '#ffffff', t);
  TT.mix = mix; TT.shade = shade; TT.tint = tint;

  /* colour pack handed to every item's draw function */
  TT.pack = function (base, fill) {
    return {
      base, fill: fill || base,
      dark: shade(base, 0.22), darker: shade(base, 0.45),
      light: tint(base, 0.45), lighter: tint(base, 0.72)
    };
  };

  /* ---------- SVG primitives ---------- */
  const st = (sw) => sw ? ` stroke="${OL}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round"` : '';
  TT.P = (d, fill, sw = 4, x = '') => `<path d="${d}" fill="${fill}"${st(sw)} ${x}/>`;
  TT.C = (cx, cy, r, fill, sw = 4, x = '') => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"${st(sw)} ${x}/>`;
  TT.E = (cx, cy, rx, ry, fill, sw = 4, x = '') => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}"${st(sw)} ${x}/>`;
  TT.R = (x, y, w, h, rx, fill, sw = 4, ex = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}"${st(sw)} ${ex}/>`;
  /* a plain stroked line / curve with no fill */
  TT.S = (d, color = OL, w = 4, x = '') => `<path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" ${x}/>`;
  /* an outlined "tube": thick coloured stroke with a plum outline (arms, legs, tails, sleeves) */
  TT.TUBE = (d, w, fill, x = '') =>
    `<path d="${d}" fill="none" stroke="${OL}" stroke-width="${w + 8}" stroke-linecap="round" stroke-linejoin="round" ${x}/>` +
    `<path d="${d}" fill="none" stroke="${fill}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" ${x}/>`;
  TT.G = (inner, x = '') => `<g ${x}>${inner}</g>`;
  /* draw a left-side shape and its mirror on the right (canvas is 400 wide) */
  TT.SYM = (left) => left + `<g transform="matrix(-1 0 0 1 400 0)">${left}</g>`;
  TT.rot = (a, cx, cy) => `transform="rotate(${a} ${cx} ${cy})"`;

  TT.star = function (cx, cy, r, fill, sw = 3, inner = 0.48, pts = 5, x = '') {
    cx = +cx; cy = +cy; r = +r;
    let d = '';
    for (let i = 0; i < pts * 2; i++) {
      const rr = i % 2 ? r * inner : r;
      const a = -Math.PI / 2 + i * Math.PI / pts;
      d += (i ? 'L' : 'M') + (cx + rr * Math.cos(a)).toFixed(1) + ',' + (cy + rr * Math.sin(a)).toFixed(1);
    }
    return TT.P(d + 'Z', fill, sw, x);
  };
  TT.heart = function (cx, cy, s, fill, sw = 3, x = '') {
    cx = +cx; cy = +cy; s = +s;
    const d = `M${cx},${cy + s * 0.9} C${cx - s * 1.4},${cy + s * 0.1} ${cx - s * 0.9},${cy - s * 0.9} ${cx},${cy - s * 0.3} C${cx + s * 0.9},${cy - s * 0.9} ${cx + s * 1.4},${cy + s * 0.1} ${cx},${cy + s * 0.9}Z`;
    return TT.P(d, fill, sw, x);
  };
  TT.flower = function (cx, cy, r, petal, center = '#ffd966', sw = 2.5) {
    cx = +cx; cy = +cy; r = +r;
    let s = '';
    for (let i = 0; i < 5; i++) {
      const a = -Math.PI / 2 + i * 2 * Math.PI / 5;
      s += TT.C((cx + r * 0.62 * Math.cos(a)).toFixed(1), (cy + r * 0.62 * Math.sin(a)).toFixed(1), (r * 0.5).toFixed(1), petal, sw);
    }
    return s + TT.C(cx, cy, (r * 0.36).toFixed(1), center, sw);
  };
  /* small seeded random so scenes/effects look the same every render */
  TT.rng = function (seed) {
    let s = seed >>> 0 || 1;
    return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  };

  /* ---------- palettes ---------- */
  TT.COLORS = [
    { id: 'bubblegum', name: 'Bubblegum', hex: '#ff9ec0' },
    { id: 'strawberry', name: 'Strawberry', hex: '#ff6f86' },
    { id: 'peach', name: 'Peach', hex: '#ffb38a' },
    { id: 'butter', name: 'Butter', hex: '#ffe17a' },
    { id: 'mint', name: 'Mint', hex: '#9ee6c0' },
    { id: 'matcha', name: 'Matcha', hex: '#b8d98a' },
    { id: 'teal', name: 'Lagoon', hex: '#6fd3cf' },
    { id: 'sky', name: 'Sky', hex: '#9cd3ff' },
    { id: 'denim', name: 'Denim', hex: '#7c9fe0' },
    { id: 'periwinkle', name: 'Periwinkle', hex: '#aab0ff' },
    { id: 'lavender', name: 'Lavender', hex: '#cfa8ff' },
    { id: 'grape', name: 'Grape', hex: '#9b7fd6' },
    { id: 'cream', name: 'Cream', hex: '#fff3dc' },
    { id: 'cocoa', name: 'Cocoa', hex: '#b88a6e' },
    { id: 'cloud', name: 'Cloud', hex: '#ffffff' },
    { id: 'night', name: 'Midnight', hex: '#5f5a7a' }
  ];
  TT.FUR = [
    { id: 'natural', name: 'Natural', hex: null },
    { id: 'snow', name: 'Snow', hex: '#fffaf5' },
    { id: 'honey', name: 'Honey', hex: '#ffd08a' },
    { id: 'caramel', name: 'Caramel', hex: '#d9a074' },
    { id: 'choco', name: 'Choco', hex: '#9c6f58' },
    { id: 'smoke', name: 'Smoke', hex: '#b9b3c4' },
    { id: 'ink', name: 'Inky', hex: '#6d6585' },
    { id: 'ginger', name: 'Ginger', hex: '#ffa064' },
    { id: 'rose', name: 'Rose', hex: '#ffbfd0' },
    { id: 'lilac', name: 'Lilac', hex: '#d8c2ff' },
    { id: 'seafoam', name: 'Seafoam', hex: '#b5ecd8' },
    { id: 'babyblue', name: 'Baby blue', hex: '#bfe0ff' },
    { id: 'lemon', name: 'Lemon', hex: '#fff09a' }
  ];

  /* ---------- fabric patterns ---------- */
  TT.PATTERNS = [
    { id: 'solid', name: 'Plain' },
    { id: 'stripes', name: 'Stripes' },
    { id: 'dots', name: 'Polka dots' },
    { id: 'hearts', name: 'Hearts' },
    { id: 'stars', name: 'Stars' },
    { id: 'gingham', name: 'Gingham' },
    { id: 'flowers', name: 'Flowers' },
    { id: 'zigzag', name: 'Zigzag' },
    { id: 'plaid', name: 'Plaid' },
    { id: 'rainbow', name: 'Rainbow' },
    { id: 'spots', name: 'Cow spots' },
    { id: 'checker', name: 'Checkers' }
  ];
  TT.patternDef = function (id, kind, base) {
    if (!kind || kind === 'solid') return '';
    const l = tint(base, 0.62), d = shade(base, 0.18), W = '#ffffff';
    const pale = (base.toLowerCase() === '#ffffff' || base.toLowerCase() === '#fff3dc');
    const acc = pale ? '#ffb3cc' : l;
    let s = 22, body = '';
    switch (kind) {
      case 'stripes': s = 18; body = `<rect width="18" height="18" fill="${base}"/><rect y="0" width="18" height="7" fill="${acc}"/>`; break;
      case 'dots': s = 20; body = `<rect width="20" height="20" fill="${base}"/><circle cx="5" cy="5" r="3.4" fill="${pale ? acc : W}"/><circle cx="15" cy="15" r="3.4" fill="${pale ? acc : W}"/>`; break;
      case 'hearts': s = 24; body = `<rect width="24" height="24" fill="${base}"/>` + TT.heart(6, 6, 4.4, pale ? '#ff8fb1' : l, 0) + TT.heart(18, 18, 4.4, pale ? '#ff8fb1' : l, 0); break;
      case 'stars': s = 26; body = `<rect width="26" height="26" fill="${base}"/>` + TT.star(7, 7, 5, pale ? '#ffcf4a' : W, 0) + TT.star(20, 19, 5, '#ffe58a', 0); break;
      case 'gingham': s = 16; body = `<rect width="16" height="16" fill="${pale ? '#ffffff' : W}"/><rect width="8" height="16" fill="${pale ? '#ffc4d6' : base}" opacity=".55"/><rect width="16" height="8" fill="${pale ? '#ffc4d6' : base}" opacity=".55"/>`; break;
      case 'flowers': s = 28; body = `<rect width="28" height="28" fill="${base}"/>` + TT.flower(8, 8, 6, pale ? '#ffc0d4' : W, '#ffd34d', 0) + TT.flower(22, 21, 5, l === W ? '#ffc0d4' : l, '#ffd34d', 0); break;
      case 'zigzag': s = 16; body = `<rect width="16" height="12" fill="${base}"/><path d="M0,8 L4,3 L8,8 L12,3 L16,8" fill="none" stroke="${acc}" stroke-width="2.6"/>`; return `<pattern id="${id}" width="16" height="12" patternUnits="userSpaceOnUse">${body}</pattern>`;
      case 'plaid': s = 24; body = `<rect width="24" height="24" fill="${base}"/><rect x="0" y="8" width="24" height="7" fill="${d}" opacity=".45"/><rect x="8" y="0" width="7" height="24" fill="${d}" opacity=".45"/><rect x="0" y="20" width="24" height="2" fill="${W}" opacity=".7"/><rect x="20" y="0" width="2" height="24" fill="${W}" opacity=".7"/>`; break;
      case 'rainbow': s = 36; body = ['#ff9eb0', '#ffc38a', '#ffe98a', '#a8e8b8', '#9cd3ff', '#c8a8ff'].map((c, i) => `<rect y="${i * 6}" width="36" height="6" fill="${c}"/>`).join(''); break;
      case 'spots': s = 40; body = `<rect width="40" height="40" fill="${pale ? '#ffffff' : W}"/><path d="M6,4 q10,-4 12,6 q2,9 -9,8 q-8,-1 -6,-8z M26,22 q9,-3 11,5 q1,8 -8,8 q-9,0 -7,-7z M30,2 q5,0 5,4 q-1,4 -5,3z" fill="${pale ? '#6d6585' : base}"/>`; break;
      case 'checker': s = 20; body = `<rect width="20" height="20" fill="${base}"/><rect width="10" height="10" fill="${pale ? '#ffd0df' : W}" opacity=".8"/><rect x="10" y="10" width="10" height="10" fill="${pale ? '#ffd0df' : W}" opacity=".8"/>`; break;
      default: return '';
    }
    return `<pattern id="${id}" width="${s}" height="${s}" patternUnits="userSpaceOnUse">${body}</pattern>`;
  };
})(window.TT);
